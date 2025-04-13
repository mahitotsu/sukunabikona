#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { SukunabikonaAwsStack } from '../lib/sukunabikona-aws-stack';

const app = new App();
const account = process.env.CDK_DEFAULT_ACCOUNT;

new SukunabikonaAwsStack(app, 'SukunabikonaHndStack', {
  env: { account, region: 'ap-northeast-1' },
});