import { Role } from "@aws-cdk/aws-iam";
import { AuthorizationType, CfnApiKey, FieldLogLevel, GraphqlApi, Schema } from "@aws-cdk/aws-appsync";
import { TechnologyLearningAwsAppSyncStack } from "./technology_learning-aws_app_sync_stack-stack";
import cdk = require('@aws-cdk/core');

export function prepareAppSync(stack: TechnologyLearningAwsAppSyncStack, guestbookRole: Role) {
  //AppSync API
  const commentsGraphQLApi = new GraphqlApi(stack, 'GuestbookCommentApi', {
    name: 'guestbook-comment-api',
    schema: Schema.fromAsset('graphql/schema.graphql'),
    authorizationConfig: {
      defaultAuthorization: {
        authorizationType: AuthorizationType.API_KEY,
        apiKeyConfig: {
          expires: cdk.Expiration.after(cdk.Duration.days(365))
        }
      },
    },
    logConfig: {
      fieldLogLevel: FieldLogLevel.ALL,
      excludeVerboseContent: false,
      role: guestbookRole
    },
    xrayEnabled: true
  });

  new CfnApiKey(stack, 'GuestbookCommentApiKey', {
    apiId: commentsGraphQLApi.apiId
  });
  return commentsGraphQLApi;
}
