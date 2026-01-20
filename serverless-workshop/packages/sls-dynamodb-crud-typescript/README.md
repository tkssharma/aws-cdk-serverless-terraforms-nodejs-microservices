# Serverless DynamoDB CRUD with TypeScript

A Serverless Framework CRUD API with DynamoDB, TypeScript, and AWS SDK v3.

## Features

- **TypeScript** - Full type safety
- **AWS SDK v3** - Modern modular AWS SDK
- **DynamoDB** - NoSQL database with on-demand capacity
- **ESBuild** - Fast bundling
- **Middy** - Middleware for AWS Lambda

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- AWS CLI configured

## Installation

```bash
pnpm install
```

## Development

Start local development server:

```bash
pnpm offline
```

## Deployment

Deploy to AWS:

```bash
# Deploy to dev
pnpm deploy:dev

# Deploy to production
pnpm deploy:prod
```

## API Endpoints

| Method | Endpoint    | Description       |
| ------ | ----------- | ----------------- |
| GET    | /todos      | List all todos    |
| GET    | /todos/{id} | Get a todo by ID  |
| POST   | /todos      | Create a new todo |
| PUT    | /todos/{id} | Update a todo     |
| DELETE | /todos/{id} | Delete a todo     |

## Project Structure

```
├── src/
│   ├── handlers/
│   │   └── todos.ts     # Todo CRUD handlers
│   └── lib/
│       └── dynamodb.ts  # DynamoDB client
├── serverless.yml       # Serverless configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## Resources Created

- DynamoDB Table with on-demand billing
- Lambda functions for CRUD operations
- API Gateway REST API
