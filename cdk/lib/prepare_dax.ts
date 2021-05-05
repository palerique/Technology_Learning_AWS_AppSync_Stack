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


  // The parameters for this cluster
  const parameterGroup = new dax.CfnParameterGroup(
    stack,
    'dax-parameters-group',
    {
      parameterNameValues: {
        // Queries are only cached for 1 second, this reduces the load when there are bursts of
        // the same query, like perhaps the #ijustsignedup hashtag feed, but
        // otherwise keeps the data very fresh
        'query-ttl-millis': 5 * 60 * 1000,
        // Regular objects are cached for 30 seconds.
        'record-ttl-millis': 5 * 60 * 1000,
      },
    }
  );

  const daxCluster = new dax.CfnCluster(stack, 'dax-cluster', {
    clusterName: 'table-dax-cluster',
    iamRoleArn: daxRole.roleArn,
    // nodeType: 'dax.t2.small',
    nodeType: 'dax.r4.large',
    replicationFactor: 2,
    subnetGroupName: subnetGroup.ref,
    securityGroupIds: [securityGroup.securityGroupId],
    parameterGroupName: parameterGroup.parameterGroupName
  });
  daxCluster.addDependsOn(subnetGroup);
  daxCluster.addDependsOn(parameterGroup);

  return daxCluster;
}
