import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
const PROTO_PATH = "./proto/estudiantes.proto";
// Cargar el proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition).estudiantes;
// Base de datos en memoria
const estudiantes = [];
// Implementación de los métodos
const serviceImpl = {
AgregarEstudiante: (call, callback) => {
const nuevo = call.request;
estudiantes.push(nuevo);
callback(null, { estudiante: nuevo });
},
ObtenerEstudiante: (call, callback) => {
const { ci } = call.request;
const est = estudiantes.find(e => e.ci === ci);
if (est) {
callback(null, { estudiante: est });
} else {
callback({
code: grpc.status.NOT_FOUND,
message: "Estudiante no encontrado"
});
}
},
ListarEstudiantes: (call, callback) => {
callback(null, { estudiantes });
}
};
// Crear servidor
const server = new grpc.Server();

server.addService(proto.EstudianteService.service, serviceImpl);
const PORT = "50051";
server.bindAsync(
`0.0.0.0:${PORT}`,
grpc.ServerCredentials.createInsecure(),
(err, bindPort) => {
if (err) {
console.error(err);
return;
}
console.log(`Servidor gRPC escuchando en ${bindPort}`);
server.start();
}
);