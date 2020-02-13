export declare class ConnexGraphqlClient {
    connex: any;
    private schema;
    constructor(connex: any);
    runQuery(query: string): Promise<import("graphql").ExecutionResult<import("graphql/execution/execute").ExecutionResultDataDefault>>;
}
