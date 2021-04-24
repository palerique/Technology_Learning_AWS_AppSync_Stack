import { Table } from "@aws-cdk/aws-dynamodb";
import { CfnCluster, CfnSubnetGroup } from "@aws-cdk/aws-dax";
import { Effect, PolicyStatement, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { TechnologyLearningAwsAppSyncStack } from "./technology_learning-aws_app_sync_stack-stack";

export function prepareDax(stack: TechnologyLearningAwsAppSyncStack, commentsTable: Table, subnetGroup: CfnSubnetGroup) {
    //DAX:
    const daxRole = new Role(stack, 'daxRole', {
        assumedBy: new ServicePrincipal('dax.amazonaws.com'),
    });

    daxRole.addToPolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:*'],
        resources: [commentsTable.tableArn],
    }));

  const daxCluster = new CfnCluster(stack, 'dax', {
    clusterName: 'table-dax-cluster',
    iamRoleArn: daxRole.roleArn,
    nodeType: 'dax.t2.small',
    replicationFactor: 2,
    subnetGroupName: subnetGroup.subnetGroupName,
  });
  daxCluster.addDependsOn(subnetGroup);

  return daxCluster;
}
