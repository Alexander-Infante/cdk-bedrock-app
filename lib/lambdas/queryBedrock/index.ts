import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

export const handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("request:", JSON.stringify(event, undefined, 4));

  try {
    // Parse the request body
    const body = JSON.parse(event.body || "{}");
    const data = body.data;

    if (!data || typeof data !== "string") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid input. 'data' property must be a string.",
        }),
      };
    }

    // Prepare the prompt for Bedrock
    const prompt = `Summarize the following data:\n\n${data}`;

    // Invoke Bedrock model
    const params = {
      modelId: "anthropic.claude-v2", // You can change this to your preferred model
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: prompt,
        max_tokens_to_sample: 300,
        temperature: 0.5,
        top_p: 1,
      }),
    };

    const command = new InvokeModelCommand(params);
    const response = await bedrockClient.send(command);

    // Parse the Bedrock response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const summary = responseBody.completion;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: summary }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
    };
  }
};
