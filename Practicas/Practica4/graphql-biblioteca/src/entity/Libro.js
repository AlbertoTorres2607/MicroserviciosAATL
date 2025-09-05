const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Libro",
  tableName: "libro",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true
    },
    titulo: {
      type: String
    },
    autor: {
      type: String
    },
    isbn: {
      type: String
    },
    anio_publicacion: {
      type: Number
    }
  },
  relations: {
    prestamos: {
      type: "one-to-many",
      target: "Prestamo",
      inverseSide: "libro"
    }
  }
});