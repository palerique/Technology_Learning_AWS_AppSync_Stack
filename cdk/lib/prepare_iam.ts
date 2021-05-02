import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { TechnologyLearningAwsAppSyncStack } from "./technology_learning-aws_app_sync_stack-stack";

export function prepareAppSyncIam(stack: TechnologyLearningAwsAppSyncStack) {
  const guestbookRole = new Role(stack, 'GuestbookCommentRole', {
    assumedBy: new ServicePrincipal('appsync.amazonaws.com')
  });

  guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
  guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSXrayFullAccess'));
  guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchFullAccess'));

  return guestbookRole;
}

export function prepareDaxIam(stack: TechnologyLearningAwsAppSyncStack) {
  const daxRole = new Role(stack, 'GuestbookDaxRole', {
    assumedBy: new ServicePrincipal('dax.amazonaws.com')
  });

  daxRole.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ['*'],
      actions: [
        'dax:*',
        'dynamodb:*'
      ]
    })
  );

  // daxRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('DAXAccess'));
  daxRole.addManagedPolicy(ManagedPolicy.fromManagedPolicyArn(
    stack,
    "dax-policy-by-arn",
    "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"));

  return daxRole;
}
