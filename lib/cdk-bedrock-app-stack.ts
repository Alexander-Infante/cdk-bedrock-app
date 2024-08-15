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

    const api = new apigateway.RestApi(this, `BedrockAPI-${props.stageName}`, {
      restApiName: `Bedrock API ${props.stageName}`,
      description: `API Gateway for Bedrock queries - ${props.stageName}`,
    });

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

    queryBedrockLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel", "bedrock:ListFoundationModels"],
        resources: ["*"], // You might want to restrict this to specific model ARNs
      })
    );

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
