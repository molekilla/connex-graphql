import { connexSchema } from './connex';
import { filter, contractFilter } from './filter';
import { account, accountCode } from './account';
const { gql } = require('apollo-server');
const GraphQLJSON = require('graphql-type-json');

// The GraphQL schema
const typeDefs = gql(connexSchema);


module.exports = (connex) => {
    // A map of functions which return data for the schema.
    const resolvers = {
        JSON: GraphQLJSON,
        Query: {
            connexVersion: () => connex.version,
            genesis: () => connex.thor.genesis,
            status: () => connex.thor.status,
            account: account(connex),
            filter: filter(connex),
            contractFilter: contractFilter(connex),
        },
        Account: {
            code: accountCode(connex),
        }
    };

    return {
        typeDefs,
        resolvers,
    }
}