#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as dotenv from 'dotenv';
import { CdkPipelineStack } from "../lib/cdk-pipeline-stack";

dotenv.config();

/**
 * This is what is deployed when you run `cdk deploy` locally, and will be seen in Cloudformation
 */

const app = new cdk.App();
// PUG TODO- fix name
new CdkPipelineStack(app, "CdkBedrockAppStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: "CdkPipelineStack",
  description: "AWS CodePipeline for CDK Bedrock Stack",
});
