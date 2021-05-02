import * as ec2 from "@aws-cdk/aws-ec2";
import * as dax from "@aws-cdk/aws-dax";
import { TechnologyLearningAwsAppSyncStack } from "./technology_learning-aws_app_sync_stack-stack";
import cdk = require('@aws-cdk/core');

export function prepareNetwork(stack: TechnologyLearningAwsAppSyncStack) {
  //VPC
  const isolatedSubnetProps = {
    name: "guestbook-pvt-subnet",
    cidrBlock: "10.0.0.0/20",
    subnetType: ec2.SubnetType.ISOLATED,
  };

  const vpc = new ec2.Vpc(stack, 'guestbook-vpc', {
    cidr: "10.0.0.0/16",
    subnetConfiguration: [isolatedSubnetProps],
    enableDnsHostnames: true,
    enableDnsSupport: true,
    defaultInstanceTenancy: ec2.DefaultInstanceTenancy.DEFAULT
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

  let subnetIds = vpc.isolatedSubnets.concat(vpc.publicSubnets).map(subnet => subnet.subnetId);
  new cdk.CfnOutput(stack, `All Subnets ids Output`, {
    description: `All Subnets ids`,
    value: `${subnetIds}`
  })

  const subnetGroup = new dax.CfnSubnetGroup(stack, 'DaxSubnetGroup', {
    subnetGroupName: "dax-test-subntgroup",
    description: "for dax test",
    subnetIds,
  });

  const securityGroup: ec2.SecurityGroup = new ec2.SecurityGroup(stack, `dax-security-group`, {
    vpc: vpc,
    description: 'Guestbook DAX security group',
  });

  securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH frm anywhere');
  securityGroup.addIngressRule(ec2.Peer.ipv4('10.200.0.0/24'), ec2.Port.tcp(5439), 'Redshift Ingress1');
  securityGroup.addIngressRule(ec2.Peer.ipv4('10.0.0.0/24'), ec2.Port.tcp(5439), 'Redshift Ingress2');

  new ec2.CfnSecurityGroupIngress(stack, "guestbook.sg-ingress", {
    groupId: securityGroup.securityGroupId,
    ipProtocol: "tcp",
    fromPort: 8111,
    toPort: 8111,
    sourceSecurityGroupId: securityGroup.securityGroupId,
  });

  return {
    vpc,
    subnetGroup,
    subnet: vpc.isolatedSubnets[0],
    securityGroup
  };
}
