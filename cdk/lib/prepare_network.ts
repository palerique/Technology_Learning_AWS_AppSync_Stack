import * as ec2 from "@aws-cdk/aws-ec2";
import { TechnologyLearningAwsAppSyncStack } from "./technology_learning-aws_app_sync_stack-stack";
import { CfnSubnetGroup } from "@aws-cdk/aws-dax";
import cdk = require('@aws-cdk/core');

export function prepareNetwork(stack: TechnologyLearningAwsAppSyncStack) {
  //VPC
  const isolatedSubnetProps = {
    cidrMask: 24,
    cidrBlock: "10.0.1.0/" + 24,
    name: "guestbook-pvt-subnet",
    subnetType: ec2.SubnetType.ISOLATED,
  };

  const pubSubnetProps = {
    cidrMask: 24,
    cidrBlock: "10.0.0.0/" + 24,
    name: "guestbook-pub-subnet",
    subnetType: ec2.SubnetType.PUBLIC,
  };

  const vpc = new ec2.Vpc(stack, 'guestbook-vpc', {
    cidr: "10.0.0.0/" + 16,
    maxAzs: 1,
    subnetConfiguration: [isolatedSubnetProps, pubSubnetProps],
    natGateways: 0
  });

  // create cfn output vpc id
  new cdk.CfnOutput(stack, 'VpcIdOutput', {
    description: 'CDK Vpc Id',
    value: `https://console.aws.amazon.com/vpc/home?region=${vpc.stack.region}#vpcs:search=${vpc.vpcId}`,
    exportName: 'VpcIdOutput'
  });

  // create cfn output isolated subnets
  vpc.isolatedSubnets.forEach((subnet, index) =>
    new cdk.CfnOutput(stack, `PrivateSubnet${++index}Output`, {
      description: `CDK Isolated Subnet${index} Id`,
      value: `https://console.aws.amazon.com/vpc/home?region=${vpc.stack.region}#subnets:filter=${subnet.subnetId}`
    })
  );

  // create cfn output public subnets
  vpc.publicSubnets.forEach((subnet, index) =>
    new cdk.CfnOutput(stack, `PublicSubnet${++index}Output`, {
      description: `CDK Public Subnet${index} Id`,
      value: `https://console.aws.amazon.com/vpc/home?region=${vpc.stack.region}#subnets:filter=${subnet.subnetId}`
    })
  );

  let subnetIds = vpc.isolatedSubnets.concat(vpc.publicSubnets).map(subnet => subnet.subnetId);
  console.log(subnetIds);
  new cdk.CfnOutput(stack, `All Subnets ids Output`, {
    description: `All Subnets ids`,
    value: `${subnetIds}`
  })

  const subnetGroup = new CfnSubnetGroup(stack, 'DaxSubnetGroup', {
    subnetGroupName: "dax-test-subntgroup",
    description: "for dax test",
    subnetIds,
  });

  return { vpc, subnetGroup };
}
