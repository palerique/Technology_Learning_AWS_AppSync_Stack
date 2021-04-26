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
    maxAzs: 2,
    subnetConfiguration: [isolatedSubnetProps, pubSubnetProps],
    natGateways: 0
  });

  // const pubSubnet = new ec2.Subnet(stack, pubSubnetProps.name, {
  //   availabilityZone: vpc.availabilityZones[0],
  //   cidrBlock: pubSubnetProps.cidrBlock,
  //   vpcId: vpc.vpcId
  // });
  //
  // const pvtSubnet = new ec2.Subnet(stack, isolatedSubnetProps.name, {
  //   availabilityZone: vpc.availabilityZones[0],
  //   cidrBlock: isolatedSubnetProps.cidrBlock,
  //   vpcId: vpc.vpcId
  // });

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

  const subnetGroup = new CfnSubnetGroup(stack, 'DaxSubnetGroup', {
    subnetGroupName: "dax-test-subntgroup",
    description: "for dax test",
    subnetIds: [vpc.isolatedSubnets[0].subnetId],
  });

  return { vpc, subnetGroup };
}
