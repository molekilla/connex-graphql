"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connex_1 = require("./connex");
const filter_1 = require("./filter");
const account_1 = require("./account");
const { gql } = require('apollo-server');
const GraphQLJSON = require('graphql-type-json');
const typeDefs = gql(connex_1.connexSchema);
module.exports = (connex) => {
    const resolvers = {
        JSON: GraphQLJSON,
        Query: {
            connexVersion: () => connex.version,
            genesis: () => connex.thor.genesis,
            status: () => connex.thor.status,
            account: account_1.account(connex),
            filter: filter_1.filter(connex),
            contractFilter: filter_1.contractFilter(connex),
        },
        Account: {
            code: account_1.accountCode(connex),
        }
    };
    return {
        typeDefs,
        resolvers,
    };
};
