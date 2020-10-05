#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {AwsRdsSuspenderStack} from '../lib/aws-rds-suspender-stack';

// アプリケーション
const app = new cdk.App();

// RDS 自動停止スタックを生成する
new AwsRdsSuspenderStack(app, 'AwsRdsSuspenderStack');
