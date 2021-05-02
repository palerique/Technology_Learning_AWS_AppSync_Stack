import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as dax from "@aws-cdk/aws-dax";
import * as iam from "@aws-cdk/aws-iam";
import * as ec2 from "@aws-cdk/aws-ec2";
import { TechnologyLearningAwsAppSyncStack } from "./technology_learning-aws_app_sync_stack-stack";

export function prepareDax(
  stack: TechnologyLearningAwsAppSyncStack,
  commentsTable: dynamodb.Table,
  subnetGroup: dax.CfnSubnetGroup,
  securityGroup: ec2.SecurityGroup,
  daxRole: iam.Role
) {
  const daxCluster = new dax.CfnCluster(stack, 'dax-cluster', {
    clusterName: 'table-dax-cluster',
    iamRoleArn: daxRole.roleArn,
    nodeType: 'dax.t2.small',
    replicationFactor: 1,
    subnetGroupName: subnetGroup.ref,
    securityGroupIds: [securityGroup.securityGroupId]
  });
  daxCluster.addDependsOn(subnetGroup);

  return daxCluster;
}
