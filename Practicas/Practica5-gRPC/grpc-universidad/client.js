import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'node:path';

const PROTO_PATH = path.resolve('proto/universidad.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDef).universidad;

const client = new proto.UniversidadService('localhost:50051', grpc.credentials.createInsecure());

// Helpers promisificados
const agregarEstudiante = (e) => new Promise((ok, bad) =>
  client.AgregarEstudiante(e, (err, res) => err ? bad(err) : ok(res.estudiante)));

const agregarCurso = (c) => new Promise((ok, bad) =>
  client.AgregarCurso(c, (err, res) => err ? bad(err) : ok(res.curso)));

const inscribir = (ci, codigo) => new Promise((ok, bad) =>
  client.InscribirEstudiante({ ci, codigo }, (err, res) => err ? bad(err) : ok(res)));

const listarCursosDe = (ci) => new Promise((ok, bad) =>
  client.ListarCursosDeEstudiante({ ci }, (err, res) => err ? bad(err) : ok(res.cursos)));

const listarEstudiantesDe = (codigo) => new Promise((ok, bad) =>
  client.ListarEstudiantesDeCurso({ codigo }, (err, res) => err ? bad(err) : ok(res.estudiantes)));

(async () => {
  try {
    console.log('== 1) Registrar estudiante ==');
    const est = await agregarEstudiante({ ci: '12345', nombres: 'Carlos', apellidos: 'Montellano', carrera: 'Sistemas' });
    console.log(est);

    console.log('== 2) Registrar dos cursos ==');
    const c1 = await agregarCurso({ codigo: 'SIS101', nombre: 'Algoritmos', docente: 'Ing. Pérez' });
    const c2 = await agregarCurso({ codigo: 'SIS202', nombre: 'Bases de Datos', docente: 'MSc. Rojas' });
    console.log(c1, c2);

    console.log('== 3) Inscribir al estudiante en ambos cursos ==');
    await inscribir('12345', 'SIS101');
    await inscribir('12345', 'SIS202');

    console.log('== 4) Consultar cursos del estudiante ==');
    console.log(await listarCursosDe('12345'));

    console.log('== 5) Consultar estudiantes de un curso ==');
    console.log(await listarEstudiantesDe('SIS101'));

    console.log('✅ Demo terminada.');
  } catch (e) {
    console.error('❌ Error:', e);
  }
})();
