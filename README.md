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

1. Clone this repository and install dependencies in the root directory:
```
npm install
```

2. Create a Github Access Token
2a. Navigate to Github -> Settings -> Developer Settings -> Personal Access Tokens -> Tokens (classic)
2b. Click `Generate new token (classic)` and select the following settings:
- repo (all)
- admin:repo_hook (all)

2c. Put the token in AWS SecretsManager
- Navigate to the AWS Console and click on SecretsManager, click on `Store a new secret`
- `Other type of secret` -> `Plaintext`
- Delete the JSON object and paste in the Github Access Token from the previous step
- Name the token, you can keep it as `github-token` as shown in the `.env` file below, or whichever name you want
- No rotation or other configurations for now

3. Get AWS Bedrock Access
Naviagte to Bedrock in the AWS Console, and towards the bottom left find `Model access` and get all model access
NOTE: This repo uses Anthropic Claude3 Haiku, so it is important to get that model (unless you want to change it)

4. Create an IAM user for you to grant access to deploy
NOTE: It is better to use AWS SSO to manage your users, but in the interest of time we are making a very simplified user to test locally.

4a. Navigate to the IAM section within the AWS Console and click on `Users`
4b. Click `Create User`, give it a name that you will remember (in my case, it's `alex_cs_cli`), and do NOT click `Provide user access to the AWS Management Console`
4c. For simplicity, just select `Attach Policies Directly` and grant `AdministratorAccess`
4d. Click `Create User`
4e. Navigate to that new user and click `Create access key` and save those keys securely somewhere

5. Configure your AWS profile locally
5a. Run `aws configure --profile <insert name here>` in your terminal
5b. Paste in the AccessKey and SecretAccessKey from the step before
5c. `us-east-1` and `json` respectively, all lowercase

6. Configure your specific values within SecretsManager and your code
6a. Follow the steps above (in 2c) to place in this plaintext value into SecretsManager
Secret name: `cdk-default-account`
Secret plaintext value: <your AWS Account ID, found in the top right corner of the console>
6b. Adjust these lines for your repo
lib/cdk-pipeline-stack.ts
```
const cdkDefaultRegion = "us-east-1";
const githubRepo = "Alexander-Infante/cdk-bedrock-app";
```

7. Deploy the pipeline:
7a. CDK Bootstrap for your AWS Account
```
cdk bootstrap --profile <insert name here>
```
7b. CDK Synth to check everything
```
cdk synth --profile <insert name here>
```
7c. CDK Deploy the stack
```
cdk deploy --profile <insert name here>
```

8. Monitor CloudFormation TODO
9. Monitor CodePipeline TODO
10. Monitor CloudFormation TODO
11. API Gateway
12. Postman TODO 
13. Monitor AWS Lambda and Cloudwatch TODO

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