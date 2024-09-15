import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { CdkPipelineStack } from "../lib/cdk-pipeline-stack";

describe("CdkPipelineStack", () => {
  const app = new cdk.App();
  const stack = new CdkPipelineStack(app, "MyTestPipelineStack", {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  const template = Template.fromStack(stack);

  test("CodePipeline is created", () => {
    template.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
  });

  test("Dev and Production stages are added", () => {
    template.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Stages: Match.arrayWith([
        Match.objectLike({ Name: "DevStage" }),
        Match.objectLike({ Name: "ProductionStage" }),
      ]),
    });
  });

  test("Manual approval step is added before Production stage", () => {
    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Stages: Match.arrayWith([
        Match.objectLike({
          Name: "ProductionStage",
          Actions: Match.arrayWith([
            Match.objectLike({
              ActionTypeId: {
                Category: "Approval",
                Owner: "AWS",
                Provider: "Manual",
                Version: "1",
              },
              Name: "PromoteToProd",
            }),
          ]),
        }),
      ]),
    });
  });
});
