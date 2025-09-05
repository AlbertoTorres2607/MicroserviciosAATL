const { gql } = require("apollo-server-express");
const typeDefs = gql`
  type Mesa {
    id: ID!
    nro_mesa: String!
    nombre_escuela: String!
    padrones: [Padron!]
  }
  type Padron {
    id: ID!
    nombres: String!
    apellidos: String!
    numero_documento: String!
    fotografia: String!
    mesa: Mesa!
  }
  type Query {
    getPadrones: [Padron!]
    getMesas: [Mesa!]
    getPadronById(id: ID!): Padron
  }
  type Mutation {
    createMesa(nro_mesa: String!, nombre_escuela: String!): Mesa
    createPadron(
      nombres: String!
      apellidos: String!
      numero_documento: String!
      fotografia: String!
      mesaId: ID!
    ): Padron
  }
`;
module.exports = typeDefs;
