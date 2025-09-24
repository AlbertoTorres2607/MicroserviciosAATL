import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'node:path';

const PROTO_PATH = path.resolve('proto/universidad.proto');

// Carga del proto
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const universidadProto = grpc.loadPackageDefinition(packageDef).universidad;

// "Base de datos" en memoria
const estudiantes = new Map();            // ci -> Estudiante
const cursos = new Map();                 // codigo -> Curso
const cursosDeEst = new Map();            // ci -> Set(codigo)
const estudiantesDeCurso = new Map();     // codigo -> Set(ci)

function ensureSet(map, key) {
  let set = map.get(key);
  if (!set) { set = new Set(); map.set(key, set); }
  return set;
}

const serviceImpl = {
  AgregarEstudiante(call, callback) {
    const e = call.request;
    if (!e.ci) return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'ci requerido' });
    if (estudiantes.has(e.ci)) {
      return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Estudiante ya existe' });
    }
    estudiantes.set(e.ci, e);
    callback(null, { estudiante: e });
  },

  AgregarCurso(call, callback) {
    const c = call.request;
    if (!c.codigo) return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'codigo requerido' });
    if (cursos.has(c.codigo)) {
      return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Curso ya existe' });
    }
    cursos.set(c.codigo, c);
    callback(null, { curso: c });
  },

  InscribirEstudiante(call, callback) {
    const { ci, codigo } = call.request;
    const est = estudiantes.get(ci);
    const cur = cursos.get(codigo);
    if (!est) return callback({ code: grpc.status.NOT_FOUND, message: 'Estudiante no encontrado' });
    if (!cur) return callback({ code: grpc.status.NOT_FOUND, message: 'Curso no encontrado' });

    const setCursos = ensureSet(cursosDeEst, ci);
    if (setCursos.has(codigo)) {
      return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Ya inscrito en este curso' });
    }
    setCursos.add(codigo);

    const setEsts = ensureSet(estudiantesDeCurso, codigo);
    setEsts.add(ci);

    callback(null, { estudiante: est, curso: cur });
  },

  ListarCursosDeEstudiante(call, callback) {
    const { ci } = call.request;
    if (!estudiantes.has(ci)) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Estudiante no encontrado' });
    }
    const codigos = Array.from(cursosDeEst.get(ci) || []);
    const lista = codigos.map(code => cursos.get(code)).filter(Boolean);
    callback(null, { cursos: lista });
  },

  ListarEstudiantesDeCurso(call, callback) {
    const { codigo } = call.request;
    if (!cursos.has(codigo)) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Curso no encontrado' });
    }
    const cis = Array.from(estudiantesDeCurso.get(codigo) || []);
    const lista = cis.map(ci => estudiantes.get(ci)).filter(Boolean);
    callback(null, { estudiantes: lista });
  },
};

// Crear y levantar servidor
const server = new grpc.Server();
server.addService(universidadProto.UniversidadService.service, serviceImpl);

const PORT = process.env.PORT || 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
  if (err) { console.error('Error al iniciar:', err); return; }
  console.log(`Servidor gRPC escuchando en ${bindPort}`);
  server.start();
});
