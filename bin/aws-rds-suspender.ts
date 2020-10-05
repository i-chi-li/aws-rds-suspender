#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsRdsSuspenderStack } from '../lib/aws-rds-suspender-stack';

const app = new cdk.App();
new AwsRdsSuspenderStack(app, 'AwsRdsSuspenderStack');
