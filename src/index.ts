import { makeExecutableSchema } from 'graphql-tools';
import { graphql, GraphQLSchema } from 'graphql';

export class ConnexGraphqlClient {
    private schema: GraphQLSchema;
    constructor(public connex: any) {
        const { typeDefs, resolvers } = require('./module')(connex);
        this.schema = makeExecutableSchema({ typeDefs, resolvers });
    }

    runQuery(query: string) {
        return graphql(this.schema, query);
    }

}
