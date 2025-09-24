import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
const PROTO_PATH = "./proto/estudiantes.proto";
// Cargar el proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition).estudiantes;
// Crear cliente
const client = new proto.EstudianteService(
"localhost:50051",
grpc.credentials.createInsecure()
);
// 1. Agregar estudiante
client.AgregarEstudiante(
{ ci: "12345", nombres: "Carlos", apellidos: "Montellano", carrera: "Sistemas" },
(err, response) => {
if (err) return console.error(err);
console.log("Estudiante agregado:", response.estudiante);
// 2. Obtener estudiante por CI
client.ObtenerEstudiante({ ci: "12345" }, (err, response) => {
if (err) return console.error(err);
console.log("Estudiante obtenido:", response.estudiante);
// 3. Listar todos los estudiantes
client.ListarEstudiantes({}, (err, response) => {
if (err) return console.error(err);

console.log("Lista de estudiantes:", response.estudiantes);
});
});
}
);