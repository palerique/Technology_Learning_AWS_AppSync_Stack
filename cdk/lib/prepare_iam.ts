import { ManagedPolicy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { TechnologyLearningAwsAppSyncStack } from "./technology_learning-aws_app_sync_stack-stack";

export function prepareIam(p: TechnologyLearningAwsAppSyncStack) {
    //IAM:
    const guestbookRole = new Role(p, 'GuestbookCommentRole', {
        assumedBy: new ServicePrincipal('appsync.amazonaws.com')
    });

    guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
    guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSXrayFullAccess'));
    guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchFullAccess'));

    return guestbookRole;
}
