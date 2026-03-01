# SECTION 5 – Express/NestJS on AWS Lambda

---

## Lecture 9: Running Express/NestJS on AWS Lambda

### The Challenge

Express/NestJS are designed for long-running servers, but Lambda is event-driven with short-lived executions. We use **@vendia/serverless-express** to bridge this gap.

### NestJS + Serverless Challenges

| Challenge                 | Solution                          |
| ------------------------- | --------------------------------- |
| Long-running server model | Use serverless-express adapter    |
| Cold starts with DI       | Lazy load modules                 |
| Large bundle size         | Tree-shaking, exclude dev deps    |
| Connection pooling        | Reuse connections outside handler |
| Logging format            | Use structured JSON logging       |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                               │
│                         │                                    │
│                         ▼                                    │
│              ┌─────────────────────┐                        │
│              │    Lambda Handler   │                        │
│              │         │           │                        │
│              │         ▼           │                        │
│              │  serverless-express │                        │
│              │         │           │                        │
│              │         ▼           │                        │
│              │    Express App      │                        │
│              │    ┌─────────┐      │                        │
│              │    │ Routes  │      │                        │
│              │    └─────────┘      │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5.2 Setting Up Express for Lambda

### Project Structure

```
src/
├── app.ts              # Express application
├── lambda.ts           # Lambda handler entry
├── local.ts            # Local development server
├── routes/
│   ├── health.ts
│   ├── users.ts
│   └── uploads.ts
└── middleware/
    └── auth.ts
```

### Express App (app.ts)

```typescript
import express from 'express';
import { healthRouter } from './routes/health';
import { usersRouter } from './routes/users';

const app = express();

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/users', usersRouter);

export { app };
```

### Lambda Handler (lambda.ts)

```typescript
import serverlessExpress from '@vendia/serverless-express';
import { app } from './app';

export const handler = serverlessExpress({ app });
```

### Local Development (local.ts)

```typescript
import { app } from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

---

## 5.3 Cold Start Optimization

### Strategies

| Strategy                       | Impact | Effort           |
| ------------------------------ | ------ | ---------------- |
| Reduce bundle size             | High   | Medium           |
| Use provisioned concurrency    | High   | Low (costs more) |
| Lazy load modules              | Medium | Medium           |
| Keep functions warm            | Medium | Low              |
| Use Fastify instead of Express | Medium | High             |

### Bundle Size Reduction

```typescript
// In CDK stack
bundling: {
  minify: true,
  sourceMap: false,  // Disable in prod
  target: 'node20',
  externalModules: ['@aws-sdk/*'],  // Use Lambda runtime SDK
}
```

### Provisioned Concurrency

```typescript
const alias = lambda.addAlias('live');

new lambda.ProvisionedConcurrentExecutions(this, 'PC', {
  target: alias,
  minCapacity: 5,
});
```

---

## 5.4 Express vs Fastify

| Aspect         | Express | Fastify     |
| -------------- | ------- | ----------- |
| Performance    | Slower  | 2-3x faster |
| Cold Start     | ~300ms  | ~150ms      |
| Ecosystem      | Huge    | Growing     |
| Learning Curve | Easy    | Medium      |
| Lambda Support | Good    | Excellent   |

---

---

## Lecture 10: Express/NestJS Microservice Structure

### Controller & Service Separation

```typescript
// routes/users.ts (Controller layer)
import { Router } from 'express';
import { UserService } from '../services/user.service';

const router = Router();
const userService = new UserService();

router.get('/', async (req, res) => {
  const users = await userService.findAll();
  res.json(users);
});

router.post('/', async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
});

export { router as usersRouter };
```

```typescript
// services/user.service.ts (Business logic)
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

export class UserService {
  constructor(private docClient: DynamoDBDocumentClient) {}

  async findAll() {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: process.env.USERS_TABLE,
      }),
    );
    return result.Items;
  }

  async create(data: CreateUserDto) {
    const user = { user_id: uuid(), ...data, created_at: Date.now() };
    await this.docClient.send(
      new PutCommand({
        TableName: process.env.USERS_TABLE,
        Item: user,
      }),
    );
    return user;
  }
}
```

---

### DTO Validation

```typescript
// types/user.dto.ts
export interface CreateUserDto {
  email: string;
  name: string;
}

// middleware/validation.ts
export const validateCreateUser = (req, res, next) => {
  const { email, name } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Name too short' });
  }

  next();
};

// Usage in route
router.post('/', validateCreateUser, async (req, res) => {
  // validated data
});
```

---

### Global Pipes & Filters (Error Handling)

```typescript
// middleware/error-handler.ts
export const errorHandler = (err: Error, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.headers['x-amzn-requestid'],
  });
};

// app.ts - Register at the end
app.use(errorHandler);
```

---

### Production Logging

```typescript
// middleware/logger.ts
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: Date.now() - start,
        requestId: req.headers['x-amzn-requestid'],
        userAgent: req.headers['user-agent'],
      }),
    );
  });

  next();
};
```

---

### Hands-On: Create User Microservice API

```bash
# Navigate to demo
cd packages/cdk-express-serverless

# Install dependencies
npm install

# Run locally
npm run local

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/users
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Deploy to AWS
cdk deploy

# Test deployed API
curl https://xxxxx.execute-api.region.amazonaws.com/dev/users
```
