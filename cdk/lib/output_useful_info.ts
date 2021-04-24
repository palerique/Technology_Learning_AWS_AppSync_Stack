import { GraphqlApi } from "@aws-cdk/aws-appsync";
import cdk = require('@aws-cdk/core');

export function outputUsefulInfo(param: any, api: GraphqlApi) {
  // Prints out the AppSync GraphQL endpoint to the terminal
  new cdk.CfnOutput(param, "GraphQLAPIURL", {
    value: api.graphqlUrl
  });

  // Prints out the AppSync GraphQL API key to the terminal
  new cdk.CfnOutput(param, "GraphQLAPIKey", {
    value: api.apiKey || ''
  });

  // Prints out the stack region to the terminal
  new cdk.CfnOutput(param, "Stack Region", {
    value: param.region
  });
}
