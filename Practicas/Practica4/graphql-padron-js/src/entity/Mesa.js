const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "Mesa",
  tableName: "mesa",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    nro_mesa: {
      type: String,
    },
    nombre_escuela: {
      type: String,
    },
  },
  relations: {
    padrones: {
      type: "one-to-many",
      target: "Padron",
      inverseSide: "mesa",
    },
  },
});
