# AWS Bedrock API with CDK Typescript

## Prerequisites 
1. Have Node v18+ installed
2. Have Typescript 3.8+ installed
3. Have an AWS Account already set up
4. Have the AWS CLI v2 installed
https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
5. Have aws-cdk installed
https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install
6. Bootstrap your CDK environment for your AWS Account
https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_bootstrap

## Architecture Overview
![Architecture_Photo](photos/CDK_Bedrock.png)


# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
