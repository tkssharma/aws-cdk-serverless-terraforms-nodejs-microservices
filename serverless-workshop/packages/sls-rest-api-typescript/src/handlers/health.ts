import type { APIGatewayProxyResult } from "aws-lambda";

export const handler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    }),
  };
};
