# AWS Bedrock API with CDK TypeScript

This project demonstrates how to build and deploy an API that leverages AWS Bedrock using the AWS CDK (Cloud Development Kit) with TypeScript.

## Prerequisites 
1. Node.js v18+ installed
2. TypeScript 3.8+ installed
3. An AWS Account
4. AWS CLI v2 installed
   - [Installation guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
5. AWS CDK installed
   - [Installation guide](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)
6. CDK environment bootstrapped for your AWS Account
   - [Bootstrapping guide](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_bootstrap)

## Getting Started

1. Clone this repository
2. Install dependencies in the root directory:
```
npm install
```

3. Create an IAM user for you to grant access to deploy
NOTE: It is better to use AWS SSO to manage your users, but in the interest of time we are making a very simplified user to test locally.

3a. Navigate to the IAM section within the AWS Console and click on `Users`
3b. Click `Create User`, give it a name that you will remember (in my case, it's `alex_cs_cli`), and do NOT click `Provide user access to the AWS Management Console`
3c. For simplicity, just select `Attach Policies Directly` and grant `AdministratorAccess`
3d. Click `Create User`
3e. Navigate to that new user and click `Create access key` and save those keys securely somewhere

4. Configure your AWS profile locally
4a. Run `aws configure --profile <insert name here>` in your terminal
4b. Paste in the AccessKey and SecretAccessKey from the step before
4c. `us-east-1` and `json` respectively, all lowercase

5. Create a `.env` file in the root directory with your AWS account details:
```
CDK_DEFAULT_ACCOUNT=0123456
CDK_DEFAULT_REGION=us-east-1
GITHUB_TOKEN=github-token
GITHUB_REPO=Alexander-Infante/cdk-bedrock-app
```

6. Deploy the pipeline:
6a. CDK Bootstrap for your AWS Account
```
cdk bootstrap --profile <insert name here>
```
6b. CDK Deploy the stack
```
cdk deploy CdkPipelineStack --profile <insert name here>
```

7. Monitor CloudFormation TODO
8. Monitor CodePipeline TODO
9. Look at AWS API Gateway
10. 

## Architecture Overview
![Architecture_Photo](photos/CDK_Bedrock.png)

## What is AWS CDK?

The AWS CDK (Cloud Development Kit) is an open-source software development framework to define cloud infrastructure in code and provision it through AWS CloudFormation. It allows you to use familiar programming languages to model your applications.

Key benefits:
- Use programming languages you're familiar with (TypeScript, JavaScript, Python, etc.)
- Leverage object-oriented techniques to create reusable infrastructure components
- Use high-level constructs that preconfigure cloud resources with proven defaults

## What is AWS Bedrock?

AWS Bedrock is a fully managed service that provides easy access to high-performing foundation models (FMs) from leading AI companies. It allows you to:

- Build generative AI applications without having to manage the underlying infrastructure
- Choose from a variety of models for tasks like text generation, summarization, and more
- Customize models to your specific use case

## Project Structure

```
.
├── bin/
│   └── cdk-bedrock-pipeline.ts    # CDK app entry point
├── lib/
│   ├── cdk-pipeline-stack.ts      # Defines the CI/CD pipeline
│   ├── cdk-bedrock-app-stack.ts   # Defines the main application stack
│   └── lambdas/
│       └── queryBedrock/
│           └── index.ts           # Lambda function to query Bedrock
├── test/
│   └── cdk-bedrock-pipeline.test.ts
├── .env                           # Environment variables (git-ignored)
├── cdk.json
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. The `CdkPipelineStack` sets up a CI/CD pipeline using AWS CodePipeline.
2. The pipeline automatically deploys the `CdkBedrockAppStack` to dev and prod environments.
3. The `CdkBedrockAppStack` creates:
   - An API Gateway
   - A Lambda function (`queryBedrockLambda`)
   - Necessary IAM permissions for the Lambda to access Bedrock
4. When the API receives a POST request at `/v1/analysis`, it triggers the Lambda.
5. The Lambda function sends the request data to Bedrock for analysis.
6. Bedrock processes the data and returns a summary.
7. The Lambda function returns this summary as the API response.

## Useful Commands

* `npm run build`   Compile TypeScript to JS
* `npm run watch`   Watch for changes and compile
* `npm run test`    Perform the jest unit tests
* `npx cdk deploy`  Deploy this stack to your default AWS account/region
* `npx cdk diff`    Compare deployed stack with current state
* `npx cdk synth`   Emits the synthesized CloudFormation template

## Further Learning

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Troubleshooting

If you encounter issues:
1. Ensure your AWS credentials are correctly set up
2. Check that you've enabled AWS Bedrock in your account
3. Verify that your .env file contains the correct account and region information

For more help, consult the AWS CDK and Bedrock documentation or reach out to AWS support.