#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TechnologyLearningAwsAppSyncStack } from '../lib/technology_learning-aws_app_sync_stack-stack';

const app = new cdk.App();
new TechnologyLearningAwsAppSyncStack(app, 'TechnologyLearningAwsAppSyncStack');
