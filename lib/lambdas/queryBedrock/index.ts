import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" }); // Replace with your desired region

export const handler = async (event: any): Promise<any> => {
  try {
    const requestBody = JSON.parse(event.body);

    const prompt = `Summarize the following data: ${requestBody}`;

    const input = {
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: prompt,
        max_tokens_to_sample: 300,
        temperature: 0.7,
        top_p: 1,
      }),
    };

    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "An error occurred while processing the request",
      }),
    };
  }
};
