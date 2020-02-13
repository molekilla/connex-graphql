"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tools_1 = require("graphql-tools");
const graphql_1 = require("graphql");
class ConnexGraphqlClient {
    constructor(connex) {
        this.connex = connex;
        const { typeDefs, resolvers } = require('./module')(connex);
        this.schema = graphql_tools_1.makeExecutableSchema({ typeDefs, resolvers });
    }
    runQuery(query) {
        return graphql_1.graphql(this.schema, query);
    }
}
exports.ConnexGraphqlClient = ConnexGraphqlClient;
