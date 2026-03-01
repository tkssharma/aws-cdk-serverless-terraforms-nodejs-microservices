#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ExpressServerlessStack } from '../lib/express-serverless-stack';

const app = new cdk.App();

// Get stage from context or default to 'dev'
const stage = app.node.tryGetContext('stage') || 'dev';

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Main Express Serverless Stack
new ExpressServerlessStack(app, `ExpressServerless-${stage}`, {
  stage,
  env,
  description: `Express TypeScript Serverless API Stack - ${stage}`,
  tags: {
    Project: 'cdk-express-serverless',
    Environment: stage,
    ManagedBy: 'AWS-CDK',
  },
});

app.synth();
