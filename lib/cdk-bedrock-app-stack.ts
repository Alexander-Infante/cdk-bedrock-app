import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Construct } from "constructs";

interface CdkBedrockAppStackProps extends cdk.StackProps {
  stageName: string;
}

export class CdkBedrockAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkBedrockAppStackProps) {
    super(scope, id, props);

    /**
     * API Gateway acts as the interface to interact with your compute runtime. This
     * is the entry point for your application. 
     * 
     * https://aws.amazon.com/api-gateway/features/
     */
    const api = new apigateway.RestApi(this, `BedrockAPI-${props.stageName}`, {
      restApiName: `Bedrock API ${props.stageName}`,
      description: `API Gateway for Bedrock queries - ${props.stageName}`,
    });

    /**
     * AWS Lambda is a compute for your application. In the code: *path part, you
     * can see how to navigate to the actual code that is executed by the Lambda
     * function here. This specific setup is for Node.js Lambdas.
     * 
     * NOTE: handler: "index.handler" means the actual code is written in a
     * file called "index" (index.ts in our case) and the function name
     * is called "handler", these can be changed easily. You can have 
     * "pug.beagle" if you wanted to, but index.handler is convention.
     */
    const queryBedrockLambda = new lambda.Function(
      this,
      `QueryBedrockLambdaFunction-${props!.stageName}`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset(
          path.resolve(__dirname, "./lambdas/queryBedrock")
        ),
        environment: {
          STAGE_NAME: props!.stageName,
        },
      }
    );

    /**
     * We need to grant this specific permission set for the Lambda function to invoke
     * AWS Bedrock. Here we leave this very permissive to make it easy to change the FM
     * more easily, but it should be restricted down.
     */
    queryBedrockLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel", "bedrock:ListFoundationModels"],
        resources: ["*"], // You might want to restrict this to specific model ARNs
      })
    );

    /**
     * POST /v1/analysis
     * This creates the actual path within API Gateway and attaches the Lambda function
     * that we created above.
     */
    const bedrockResource = api.root.addResource("v1").addResource("analysis");
    bedrockResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(queryBedrockLambda)
    );

    new cdk.CfnOutput(this, `APIGatewayURL-${props.stageName}`, {
      value: api.url,
      description: `API Gateway URL for ${props.stageName}`,
    });
  }
}
