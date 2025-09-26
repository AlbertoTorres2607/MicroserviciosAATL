const { EntitySchema } = require("typeorm");

const Medico = new EntitySchema({
  name: "Medico",
  tableName: "medicos", // nombre de la tabla en la base de datos
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true
    },
    nombre: {
      type: "varchar"
    },
    apellido: {
      type: "varchar"
    },
    cedulaProfesional: {
      type: "varchar"
    },
    especialidad: {
      type: "varchar"
    },
    aniosExperiencia: {
      type: "int"
    },
    correo: {
      type: "varchar"
    }
  }
});

module.exports = Medico;
