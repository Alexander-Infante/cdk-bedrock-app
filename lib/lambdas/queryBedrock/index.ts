import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" }); // Replace with your desired region

export const handler = async (event: any): Promise<any> => {

  /**
   * We're using a Proxy Lambda integration 
   * https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
   */
  const headers = {
    "Access-Control-Allow-Origin": "*", // Update this to your specific domain in production
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
  };

  try {
    const requestBody = JSON.parse(event.body);

    /**
     * Adjust this prompt as needed to fit your use case
     * This adjusting of the prompt is called "Prompt Engineering"
     * https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
     */
    const prompt = `Summarize the following data of kubernetes clusters: ${JSON.stringify(requestBody.inputData)}`;

    /**
     * NOTE: Different models expect different parameteres for the InvokeModelCommand
     * https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-runtime_example_bedrock-runtime_InvokeModel_AnthropicClaude_section.html
     */
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
        max_tokens: 500, // response tokens (1 token = 4 characters)
        temperature: 0.3, // from 0 (deterministic, focused responses) to 1 (random, creative responses)
        top_p: 0.8, // probability distribution. from 0 (most common tokens) to 1 (least common tokens)
        top_k: 150, // the amount of tokens available for consideration at each step (from 1 to size model's entire vocab but common range is 10 to 200)
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const responseBodyText = responseBody.content[0].text;

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(responseBodyText),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        error: "An error occurred while processing the request",
      }),
    };
  }
};
