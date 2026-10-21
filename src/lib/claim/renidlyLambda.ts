import "server-only";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

export type RenidlyLambdaResult = {
  statusCode: number;
  body: Record<string, unknown> | null;
};

function lambdaClient() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  return new LambdaClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });
}

export async function invokeRenidlyLambda(payload: Record<string, unknown>): Promise<RenidlyLambdaResult> {
  const functionName = process.env.AWS_LAMBDA_RENIDLY_FUNCTION;
  if (!functionName) throw new Error("AWS_LAMBDA_RENIDLY_FUNCTION is not configured");

  const response = await lambdaClient().send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify(payload)),
    }),
  );

  if (response.FunctionError) {
    throw new Error(response.FunctionError);
  }

  const decoded = response.Payload ? Buffer.from(response.Payload).toString("utf-8") : "{}";
  const parsed = JSON.parse(decoded) as { statusCode?: number; body?: unknown };
  let body = parsed.body ?? null;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body) as Record<string, unknown>;
    } catch {
      body = { error: body };
    }
  }
  return {
    statusCode: Number(parsed.statusCode) || response.StatusCode || 500,
    body: body && typeof body === "object" ? (body as Record<string, unknown>) : null,
  };
}
