import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { CdkBedrockAppStack } from "../lib/cdk-bedrock-app-stack";

describe("CdkBedrockAppStack", () => {
  const app = new cdk.App();
  const stack = new CdkBedrockAppStack(app, "MyTestStack", {
    stageName: "test",
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  const template = Template.fromStack(stack);

  test("API Gateway is created", () => {
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: "Bedrock API test",
      Description: "API Gateway for Bedrock queries - test",
    });
  });

  test("Lambda function is created", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs20.x",
      Handler: "index.handler",
      Timeout: 30,
    });
  });

  test("Lambda function has correct IAM policy", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: [
          {
            Action: ["bedrock:InvokeModel", "bedrock:ListFoundationModels"],
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    });
  });

  test("API Gateway has correct resource and method", () => {
    template.hasResourceProperties("AWS::ApiGateway::Resource", {
      PathPart: "analysis",
    });

    template.hasResourceProperties("AWS::ApiGateway::Method", {
      HttpMethod: "POST",
    });
  });
});
