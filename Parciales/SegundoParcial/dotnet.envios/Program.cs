using Grpc.Net.Client;
using Microsoft.EntityFrameworkCore;
using vehiculos;

var builder = WebApplication.CreateBuilder(args);

// EF Core MySQL
var host = Environment.GetEnvironmentVariable("MYSQL__HOST") ?? "localhost";
var port = Environment.GetEnvironmentVariable("MYSQL__PORT") ?? "3306";
var user = Environment.GetEnvironmentVariable("MYSQL__USER") ?? "root";
var pass = Environment.GetEnvironmentVariable("MYSQL__PASS") ?? "";
var db   = Environment.GetEnvironmentVariable("MYSQL__DB")   ?? "enviosdb";
var conn = $"Server={host};Port={port};User Id={user};Password={pass};Database={db}";
builder.Services.AddDbContext<EnvioDb>(o => o.UseMySql(conn, ServerVersion.AutoDetect(conn)));

// gRPC client hacia Vehículos
var vehGrpc = Environment.GetEnvironmentVariable("VEHICULOS__GRPC") ?? "http://localhost:50051";
builder.Services.AddSingleton(new VehiculosService.VehiculosServiceClient(GrpcChannel.ForAddress(vehGrpc)));

// GraphQL
builder.Services.AddGraphQLServer()
  .AddQueryType<Query>()
  .AddMutationType<Mutation>()
  .AddFiltering()
  .AddSorting();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
  var dbctx = scope.ServiceProvider.GetRequiredService<EnvioDb>();
  dbctx.Database.EnsureCreated();
}

app.MapGet("/", () => Results.Ok(new { ok = true, service = "envios" }));
app.MapGraphQL("/graphql");

app.Run();

public class EnvioDb : DbContext {
  public EnvioDb(DbContextOptions<EnvioDb> o) : base(o) {}
  public DbSet<Envio> Envios => Set<Envio>();
}

public class Query {
  public IQueryable<Envio> GetEnvios([Service] EnvioDb db)
    => db.Envios.AsQueryable();
}

public class Mutation {
  // crea envío verificando disponibilidad por gRPC
  public async Task<Envio> CrearEnvio(
    [Service] EnvioDb db,
    [Service] VehiculosService.VehiculosServiceClient grpc,
    int usuarioId, string vehiculoId, string origen, string destino, DateTime fechaEnvio)
  {
    var check = await grpc.VerificarDisponibilidadAsync(new VerificarRequest { VehiculoId = vehiculoId });
    if (!check.Disponible) throw new Exception($"Vehículo no disponible (estado: {check.Estado})");

    var e = new Envio {
      UsuarioId = usuarioId, VehiculoId = vehiculoId, Origen = origen,
      Destino = destino, FechaEnvio = fechaEnvio, Estado = "pendiente"
    };
    db.Envios.Add(e);
    await db.SaveChangesAsync();
    return e;
  }
}
