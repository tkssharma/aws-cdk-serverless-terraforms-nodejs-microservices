# Serverless REST API with TypeScript

A modern Serverless Framework REST API built with TypeScript, ESBuild, and Middy middleware.

## Features

- **TypeScript** - Full type safety
- **ESBuild** - Fast bundling with serverless-esbuild
- **Middy** - Middleware for AWS Lambda
- **Serverless Offline** - Local development support

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
| GET    | /health     | Health check      |
| GET    | /users      | Get all users     |
| GET    | /users/{id} | Get user by ID    |
| POST   | /users      | Create a new user |
| PUT    | /users/{id} | Update a user     |
| DELETE | /users/{id} | Delete a user     |

## Project Structure

```
├── src/
│   └── handlers/
│       ├── health.ts    # Health check handler
│       └── users.ts     # User CRUD handlers
├── serverless.yml       # Serverless configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```
