import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as pipelines from "aws-cdk-lib/pipelines";
import { CdkBedrockAppStack } from "./cdk-bedrock-app-stack";

/**
 * This deploys a Cloudformation Stack for configuring AWS CodePipeline.
 * This is a relatively simplistic CI/CD Pipeline just to make it more managable.
 */

export class CdkPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * NOTE: Remember to create the Github Access token manually in your GH Account.
     * Then you also need to add that as plaintext inside of AWS SecretsManager.
     * Make sure to make the strings match.
     */
    const githubAccessToken = cdk.SecretValue.secretsManager(
      process.env.GITHUB_TOKEN! || "github-token"
    );

    /**
     * This CodePipeline does a few steps in the code below
     * 1. It sources the code from Github for you (via a webhook), pointed to that repo and that branch.
     * NOTE: Make sure you update your repo name and point to the correct branch.
     * 2. It runs the `commands` inside the CI/CD Pipeline Shell (similar to your Macbook terminal)
     * 3. Check out the root package.json to see the custom scripts, just to make life easier.
     */

    const pipeline = new pipelines.CodePipeline(this, "CdkCodePipeline", {
      pipelineName: "CdkCodePipeline",
      synth: new pipelines.ShellStep("Synth", {
        input: pipelines.CodePipelineSource.gitHub(
          process.env.GITHUB_REPO!,
          "main",
          {
            authentication: githubAccessToken,
          }
        ),
        commands: ["npm i", "npm run build-all", "npx cdk synth"],
      }),
    });

    /**
     * This step deploys the CdkBedrockAppStack to a "Dev" environment
     * You can see this stack defined in the lib/cdk-bedrock-app-stack.ts file
     * This step AUTOMATICALLY deploys
     */

    const devStage = new cdk.Stage(this, "DevStage");
    const cdkBedrockDev = new CdkBedrockAppStack(devStage, "CDKBedrock-Dev", {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
      stackName: "CDKBedrock-Dev",
      description: "Querying AWS Bedrock Stack - Dev",
      stageName: "dev",
    });

    pipeline.addStage(devStage);

    /**
     * This step deploys the CdkBedrockAppStack to a "Production/ Prod" environment
     * You can see this stack defined in the lib/cdk-bedrock-app-stack.ts file
     * This step needs MANUAL APPROVAL inside of the AWS CodePipeline console to deploy
     */

    const prodStage = new cdk.Stage(this, "ProductionStage");
    const cdkBedrockProd = new CdkBedrockAppStack(
      prodStage,
      "CDKBedrock-Prod",
      {
        env: {
          account: process.env.CDK_DEFAULT_ACCOUNT,
          region: process.env.CDK_DEFAULT_REGION,
        },
        stackName: "CDKBedrock-Prod",
        description: "Querying AWS Bedrock Stack - Prod",
        stageName: "production",
      }
    );

    pipeline.addStage(prodStage, {
      pre: [new pipelines.ManualApprovalStep("PromoteToProd")],
    });
  }
}
