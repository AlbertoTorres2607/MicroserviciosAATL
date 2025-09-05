const resolvers = {
  Query: {
    getPadrones: async (_parent, _args, { dataSource }) => {
      return await dataSource.getRepository("Padron").find({
        relations: ["mesa"],
      });
    },

    getMesas: async (_parent, _args, { dataSource }) => {
      return await dataSource.getRepository("Mesa").find({
        relations: ["padrones"],
      });
    },

    getPadronById: async (_parent, { id }, { dataSource }) => {
      return await dataSource.getRepository("Padron").findOne({
        where: { id: Number(id) },   // asegúrate que sea numérico
        relations: ["mesa"],
      });
    },
  },

  Mutation: {
    createMesa: async (_parent, { nro_mesa, nombre_escuela }, { dataSource }) => {
      const repo = dataSource.getRepository("Mesa");
      const mesa = repo.create({ nro_mesa, nombre_escuela });
      return await repo.save(mesa);
    },

    createPadron: async (
      _parent,
      { nombres, apellidos, numero_documento, fotografia, mesaId },
      { dataSource }
    ) => {
      const repoPadron = dataSource.getRepository("Padron");
      const repoMesa = dataSource.getRepository("Mesa");

      const mesa = await repoMesa.findOneBy({ id: Number(mesaId) });
      if (!mesa) throw new Error("Mesa no encontrada");

      const padron = repoPadron.create({
        nombres,
        apellidos,
        numero_documento,
        fotografia,
        mesa,
      });
      return await repoPadron.save(padron);
    },
  },
};

module.exports = resolvers;