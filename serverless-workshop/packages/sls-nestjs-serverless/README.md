# NestJS Serverless Application

A NestJS application deployed as a single AWS Lambda function using `@codegenie/serverless-express`.

## Features

- **NestJS** - Progressive Node.js framework
- **Single Lambda** - Entire app runs in one Lambda function
- **serverless-express** - Wraps Express/NestJS for Lambda
- **ESBuild** - Fast bundling with serverless-esbuild
- **Serverless Offline** - Local development support

## Architecture

```
API Gateway → Lambda → NestJS App
                ↓
         serverless-express adapter
```

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
# Using NestJS CLI
pnpm start:dev

# Using Serverless Offline
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

| Method | Endpoint   | Description       |
| ------ | ---------- | ----------------- |
| GET    | /          | Welcome message   |
| GET    | /health    | Health check      |
| GET    | /users     | Get all users     |
| GET    | /users/:id | Get user by ID    |
| POST   | /users     | Create a new user |
| PUT    | /users/:id | Update a user     |
| DELETE | /users/:id | Delete a user     |

## Project Structure

```
├── src/
│   ├── health/
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.dto.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── lambda.ts          # Lambda handler with serverless-express
│   └── main.ts            # Local development entry
├── nest-cli.json
├── serverless.yml
├── tsconfig.json
└── package.json
```

## Cold Start Optimization

- Uses ESBuild for smaller bundle size
- Caches NestJS app instance between invocations
- Excludes unused NestJS modules (microservices, websockets)
