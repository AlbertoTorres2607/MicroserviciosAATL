using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using Vehiculos.Grpc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(o => {
    o.TokenValidationParameters = new() {
      ValidateIssuer = false, ValidateAudience = false,
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
        System.Text.Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT__Key") ?? "supersecreto"))
    };
  });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<IMongoClient>(sp =>
  new MongoClient(Environment.GetEnvironmentVariable("MONGO__CONN") ?? "mongodb://localhost:27017"));
builder.Services.AddSingleton<IMongoDatabase>(sp => {
  var client = sp.GetRequiredService<IMongoClient>();
  var dbname = Environment.GetEnvironmentVariable("MONGO__DB") ?? "vehiculosdb";
  return client.GetDatabase(dbname);
});
builder.Services.AddSingleton<IMongoCollection<Vehiculo>>(sp => 
  sp.GetRequiredService<IMongoDatabase>().GetCollection<Vehiculo>("vehiculos"));

builder.Services.AddGrpc();
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
  c.SwaggerDoc("v1", new OpenApiInfo { Title = "Vehículos API", Version = "v1" });
  // JWT en Swagger
  c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
    In = ParameterLocation.Header, Name = "Authorization", Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT"
  });
  c.AddSecurityRequirement(new OpenApiSecurityRequirement {
    { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }}, new string[]{} }
  });
});

var app = builder.Build();

// Semilla (opcional)
using (var scope = app.Services.CreateScope())
{
  var col = scope.ServiceProvider.GetRequiredService<IMongoCollection<Vehiculo>>();
  if ((await col.CountDocumentsAsync(_ => true)) == 0)
  {
    await col.InsertManyAsync(new[] {
      new Vehiculo { Placa="ABC-123", Tipo="camion", Capacidad=10000, Estado="disponible" },
      new Vehiculo { Placa="XYZ-777", Tipo="furgon", Capacidad=2000, Estado="mantenimiento" }
    });
  }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGrpcService<VehiculosGrpcService>(); // gRPC server en :50051 (Kestrel asigna HTTP/2)


app.MapGet("/", () => Results.Ok(new { ok = true, service = "vehiculos" }));

app.Run();

public class Vehiculo {
  public string Id { get; set; } = default!;
  public string Placa { get; set; } = default!;
  public string Tipo { get; set; } = default!; // camion, furgon, moto
  public int Capacidad { get; set; }
  public string Estado { get; set; } = "disponible"; // disponible, en ruta, mantenimiento
}

// REST Controller protegido por JWT
[Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
[Microsoft.AspNetCore.Mvc.ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class VehiculosController : Microsoft.AspNetCore.Mvc.ControllerBase
{
  private readonly IMongoCollection<Vehiculo> _col;
  public VehiculosController(IMongoCollection<Vehiculo> col) => _col = col;

  [Microsoft.AspNetCore.Mvc.HttpGet]
  public async Task<IEnumerable<Vehiculo>> Get() => await _col.Find(_ => true).ToListAsync();

  [Microsoft.AspNetCore.Mvc.HttpPost]
  public async Task<Vehiculo> Post(Vehiculo v) { await _col.InsertOneAsync(v); return v; }

  [Microsoft.AspNetCore.Mvc.HttpPut("{id}")]
  public async Task<IResult> Put(string id, Vehiculo upd) {
    var r = await _col.ReplaceOneAsync(x => x.Id == id, upd);
    return r.ModifiedCount == 0 ? Results.NotFound() : Results.Ok(upd);
  }

  [Microsoft.AspNetCore.Mvc.HttpDelete("{id}")]
  public async Task<IResult> Delete(string id) {
    var r = await _col.DeleteOneAsync(x => x.Id == id);
    return r.DeletedCount == 0 ? Results.NotFound() : Results.NoContent();
  }
}

// gRPC Service: verifica disponibilidad
public class VehiculosGrpcService : VehiculosService.VehiculosServiceBase
{
  private readonly IMongoCollection<Vehiculo> _col;
  public VehiculosGrpcService(IMongoCollection<Vehiculo> col) => _col = col;

  public override async Task<VerificarReply> VerificarDisponibilidad(VerificarRequest request, Grpc.Core.ServerCallContext context)
  {
    var v = await _col.Find(x => x.Id == request.VehiculoId).FirstOrDefaultAsync();
    var disp = v != null && v.Estado == "disponible";
    return new VerificarReply { Disponible = disp, Estado = v?.Estado ?? "no-encontrado" };
  }
}
