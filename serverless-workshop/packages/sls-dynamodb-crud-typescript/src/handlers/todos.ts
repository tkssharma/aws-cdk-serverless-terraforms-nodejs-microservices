import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import {
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { randomUUID } from "crypto";
import { dynamoDb, TABLE_NAME } from "../lib/dynamodb";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const response = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
  body: JSON.stringify(body),
});

const listHandler = async (): Promise<APIGatewayProxyResult> => {
  const result = await dynamoDb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  return response(200, {
    todos: result.Items || [],
    count: result.Count || 0,
  });
};

const getHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return response(400, { error: "Todo ID is required" });
  }

  const result = await dynamoDb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );

  if (!result.Item) {
    return response(404, { error: "Todo not found" });
  }

  return response(200, { todo: result.Item });
};

const createHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = event.body as unknown as { title?: string };

  if (!body?.title) {
    return response(400, { error: "Title is required" });
  }

  const now = new Date().toISOString();
  const todo: Todo = {
    id: randomUUID(),
    title: body.title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  await dynamoDb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: todo,
    })
  );

  return response(201, { todo, message: "Todo created successfully" });
};

const updateHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return response(400, { error: "Todo ID is required" });
  }

  const body = event.body as unknown as { title?: string; completed?: boolean };

  const result = await dynamoDb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression:
        "SET #title = :title, #completed = :completed, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#title": "title",
        "#completed": "completed",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":title": body?.title,
        ":completed": body?.completed ?? false,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(id)",
    })
  );

  return response(200, {
    todo: result.Attributes,
    message: "Todo updated successfully",
  });
};

const deleteHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return response(400, { error: "Todo ID is required" });
  }

  await dynamoDb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConditionExpression: "attribute_exists(id)",
    })
  );

  return response(200, { message: "Todo deleted successfully" });
};

export const list = middy(listHandler).use(httpErrorHandler());

export const get = middy(getHandler).use(httpErrorHandler());

export const create = middy(createHandler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler());

export const update = middy(updateHandler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler());

export const remove = middy(deleteHandler).use(httpErrorHandler());
