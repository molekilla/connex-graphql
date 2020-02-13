const connexDriver = require('@vechain/connex.driver-nodejs');
const { Framework } = require('@vechain/connex-framework');
const GQL = require('fastify-gql');
const { makeExecutableSchema } = require('graphql-tools');
require('dotenv').config();
const fastify = require('fastify');
const app = fastify();
const thorUrl = process.env.THOR_URL;
(async () => {
    const driver = await connexDriver.Driver.connect(new connexDriver.SimpleNet(thorUrl));
    const connex = new Framework(driver);
    const { typeDefs, resolvers } = require('./module')(connex);
    app.register(GQL, {
        schema: makeExecutableSchema({ typeDefs, resolvers }),
        graphiql: true,
    });
    await app.listen(3000);
    console.log(`Listening GraphiQL at port 3000`);
})();
