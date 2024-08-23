import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

/**
 * NOTE that the function name is "hanlder", which is referenced in the
 * cdk-bedrock-app-stack.ts file.
 * There are many Lambda function triggers:
 * https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html#listing-of-services-and-links-to-more-information
 *
 * In this case, we use an APIGatewayProxyEvent since this Lambda function is attached to
 * AWS API Gateway.
 */
export const handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
  };

  console.log("request:", JSON.stringify(event, undefined, 4));

  try {
    if (!event.body) {
      throw new Error("Missing request body");
    }

    const requestBody = JSON.parse(event.body);
    const data = requestBody.data;

    if (typeof data !== "string") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid input. 'data' must be a string.",
        }),
      };
    }
    // Prepare the prompt for Bedrock
    const prompt = `Summarize the following data:\n\n${data}`;

    /**
     * Reference Amazon Bedrock documentation to balance performance, price, and specific
     * strengths of each Foundation Model for your use case.
     *
     * https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
     * https://aws.amazon.com/bedrock/?refid=36201f68-a9b0-45cc-849b-8ab260660e1c
     */

    // Invoke Bedrock model
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.5,
        top_p: 1,
        top_k: 250,
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const responseText = responseBody.content[0].text;

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ responseText: responseText }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        error: "An error occurred while processing your request.",
        message: error,
      }),
    };
  }
};
