const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "Padron",
  tableName: "padron",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    nombres: {
      type: String,
    },
    apellidos: {
      type: String,
    },
    numero_documento: {
      type: String,
    },
    fotografia: {
      type: String,
    },
  },
  relations: {
    mesa: {
      type: "many-to-one",
      target: "Mesa",
      joinColumn: true,
      eager: true,
    },
  },
});
