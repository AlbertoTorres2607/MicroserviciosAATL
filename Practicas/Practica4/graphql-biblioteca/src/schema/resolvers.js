// src/schema/resolvers.js
const Libro = require("../entity/Libro");
const Prestamo = require("../entity/Prestamo");
// NO importamos AppDataSource desde index.js para evitar importación circular

const resolvers = {
  Query: {
    getLibros: async (_, __, { dataSources }) => {
      // Usamos el contexto que pasaremos desde index.js
      const { AppDataSource } = dataSources;
      return await AppDataSource.getRepository("Libro").find({ 
        relations: ["prestamos"] 
      });
    },

    getPrestamos: async (_, __, { dataSources }) => {
      const { AppDataSource } = dataSources;
      return await AppDataSource.getRepository("Prestamo").find({ 
        relations: ["libro"] 
      });
    },

    getPrestamoById: async (_, { id }, { dataSources }) => {
      const { AppDataSource } = dataSources;
      return await AppDataSource.getRepository("Prestamo").findOne({
        where: { id },
        relations: ["libro"]
      });
    },

    getPrestamosByUsuario: async (_, { usuario }, { dataSources }) => {
      const { AppDataSource } = dataSources;
      return await AppDataSource.getRepository("Prestamo").find({
        where: { usuario },
        relations: ["libro"]
      });
    }
  },

  Mutation: {
    createLibro: async (_, { titulo, autor, isbn, anio_publicacion }, { dataSources }) => {
      const { AppDataSource } = dataSources;
      const repo = AppDataSource.getRepository("Libro");
      const libro = repo.create({ titulo, autor, isbn, anio_publicacion });
      return await repo.save(libro);
    },

    createPrestamo: async (_, { usuario, fecha_prestamo, fecha_devolucion, libroId }, { dataSources }) => {
      const { AppDataSource } = dataSources;
      const repoPrestamo = AppDataSource.getRepository("Prestamo");
      const repoLibro = AppDataSource.getRepository("Libro");

      const libro = await repoLibro.findOneBy({ id: libroId });
      if (!libro) throw new Error("Libro no encontrado");

      const prestamo = repoPrestamo.create({
        usuario,
        fecha_prestamo: new Date(fecha_prestamo),
        fecha_devolucion: new Date(fecha_devolucion),
        libro
      });

      return await repoPrestamo.save(prestamo);
    }
  }
};

module.exports = resolvers;