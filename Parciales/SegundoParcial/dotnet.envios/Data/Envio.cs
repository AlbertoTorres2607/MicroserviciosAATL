public class Envio {
  public int Id { get; set; }
  public int UsuarioId { get; set; }
  public string VehiculoId { get; set; } = "";
  public string Origen { get; set; } = "";
  public string Destino { get; set; } = "";
  public DateTime FechaEnvio { get; set; }
  public string Estado { get; set; } = "pendiente"; // pendiente, en tránsito, entregado
}
