import { handler } from "./index";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Mock the AWS SDK
jest.mock("@aws-sdk/client-bedrock-runtime", () => {
  const mBedrockRuntimeClient = {
    send: jest.fn(),
  };
  return {
    BedrockRuntimeClient: jest.fn(() => mBedrockRuntimeClient),
    InvokeModelCommand: jest.fn(),
  };
});

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("queryBedrock Lambda", () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockSend = (BedrockRuntimeClient as jest.Mock).mock.results[0].value
      .send as jest.Mock;
    mockSend.mockClear();
    (InvokeModelCommand as unknown as jest.Mock).mockClear();
  });

  it("should process the request and return a summary", async () => {
    const mockEvent = {
      body: JSON.stringify({
        inputData: {
          clusters: [
            { name: "cluster1", nodes: 3 },
            { name: "cluster2", nodes: 5 },
          ],
        },
      }),
    };

    const mockResponse = {
      body: new TextEncoder().encode(
        JSON.stringify({
          content: [{ text: "This is a summary of the kubernetes clusters." }],
        })
      ),
    };

    mockSend.mockResolvedValueOnce(mockResponse);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toBe(
      "This is a summary of the kubernetes clusters."
    );
    expect(InvokeModelCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        modelId: "anthropic.claude-3-haiku-20240307-v1:0",
        contentType: "application/json",
        accept: "application/json",
      })
    );
  });

  it("should handle errors and return a 500 status code", async () => {
    const mockEvent = {
      body: "invalid JSON",
    };

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: "An error occurred while processing the request",
    });
  });
});
