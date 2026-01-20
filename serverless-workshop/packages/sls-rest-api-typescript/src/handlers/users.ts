import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

const users: Map<string, User> = new Map();

const response = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
  body: JSON.stringify(body),
});

const getUsersHandler = async (
  _event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const allUsers = Array.from(users.values());
  return response(200, { users: allUsers, count: allUsers.length });
};

const getUserByIdHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return response(400, { error: "User ID is required" });
  }

  const user = users.get(id);

  if (!user) {
    return response(404, { error: "User not found" });
  }

  return response(200, { user });
};

const createUserHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const body = event.body as unknown as { name?: string; email?: string };

  if (!body?.name || !body?.email) {
    return response(400, { error: "Name and email are required" });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const user: User = {
    id,
    name: body.name,
    email: body.email,
    createdAt: now,
    updatedAt: now,
  };

  users.set(id, user);

  return response(201, { user, message: "User created successfully" });
};

const updateUserHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return response(400, { error: "User ID is required" });
  }

  const existingUser = users.get(id);

  if (!existingUser) {
    return response(404, { error: "User not found" });
  }

  const body = event.body as unknown as { name?: string; email?: string };

  const updatedUser: User = {
    ...existingUser,
    name: body?.name ?? existingUser.name,
    email: body?.email ?? existingUser.email,
    updatedAt: new Date().toISOString(),
  };

  users.set(id, updatedUser);

  return response(200, { user: updatedUser, message: "User updated successfully" });
};

const deleteUserHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return response(400, { error: "User ID is required" });
  }

  if (!users.has(id)) {
    return response(404, { error: "User not found" });
  }

  users.delete(id);

  return response(200, { message: "User deleted successfully" });
};

export const getUsers = middy(getUsersHandler).use(httpErrorHandler());

export const getUserById = middy(getUserByIdHandler).use(httpErrorHandler());

export const createUser = middy(createUserHandler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler());

export const updateUser = middy(updateUserHandler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler());

export const deleteUser = middy(deleteUserHandler).use(httpErrorHandler());
