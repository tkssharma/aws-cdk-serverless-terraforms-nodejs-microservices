# SECTION 4 – API Gateway + Lambda with CDK

---

## Lecture 7: API Gateway Deep Dive (CDK)

### REST API vs HTTP API

| Feature                  | REST API                         | HTTP API              |
| ------------------------ | -------------------------------- | --------------------- |
| **Cost**                 | $3.50/million                    | $1.00/million         |
| **Latency**              | Higher                           | Lower (~60% faster)   |
| **Features**             | Full (caching, WAF, usage plans) | Basic                 |
| **Auth**                 | IAM, Lambda, Cognito             | JWT, IAM              |
| **WebSocket**            | No                               | Yes                   |
| **Request validation**   | Yes                              | No                    |
| **Private integrations** | Yes                              | Yes                   |
| **Use Case**             | Complex APIs                     | Simple/cost-sensitive |

### API Gateway Architecture

```
                    ┌──────────────────────────────────────┐
                    │           API Gateway                 │
                    │                                       │
Client ────────────▶│  ┌─────────┐    ┌─────────────────┐ │
                    │  │ Stage   │───▶│ Resource/Method │ │
                    │  │ (dev)   │    │   /users GET    │ │
                    │  └─────────┘    └────────┬────────┘ │
                    │                          │          │
                    │                          ▼          │
                    │               ┌─────────────────┐   │
                    │               │   Integration   │   │
                    │               │    (Lambda)     │   │
                    │               └─────────────────┘   │
                    └──────────────────────────────────────┘
```

---

## 4.2 Creating API Gateway with CDK

### REST API Example

```typescript
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// Create REST API
const api = new apigateway.RestApi(this, 'UsersApi', {
  restApiName: 'Users Service',
  description: 'API for user management',
  deployOptions: {
    stageName: 'dev',
    throttlingBurstLimit: 100,
    throttlingRateLimit: 50,
  },
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});

// Add resources and methods
const users = api.root.addResource('users');
users.addMethod('GET', new apigateway.LambdaIntegration(getUsersLambda));
users.addMethod('POST', new apigateway.LambdaIntegration(createUserLambda));

const user = users.addResource('{id}');
user.addMethod('GET', new apigateway.LambdaIntegration(getUserLambda));
user.addMethod('PUT', new apigateway.LambdaIntegration(updateUserLambda));
user.addMethod('DELETE', new apigateway.LambdaIntegration(deleteUserLambda));
```

### HTTP API Example

```typescript
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
  apiName: 'users-http-api',
  corsPreflight: {
    allowOrigins: ['*'],
    allowMethods: [apigwv2.CorsHttpMethod.ANY],
  },
});

httpApi.addRoutes({
  path: '/users',
  methods: [apigwv2.HttpMethod.GET],
  integration: new integrations.HttpLambdaIntegration('GetUsers', lambda),
});
```

---

## 4.3 CORS Configuration

```typescript
// Full CORS setup
defaultCorsPreflightOptions: {
  allowOrigins: ['https://example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Amz-Date',
    'X-Api-Key',
  ],
  allowCredentials: true,
  maxAge: cdk.Duration.days(1),
}
```

---

## Lecture 8: AWS Lambda with Node.js & CDK

### Lambda Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LAMBDA EXECUTION MODEL                        │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │     INIT     │───▶│    INVOKE    │───▶│   SHUTDOWN   │          │
│  │  (Cold Start)│    │    (Warm)    │    │              │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   │                                        │
│         ▼                   ▼                                        │
│  • Download code     • Execute handler                              │
│  • Init runtime      • Process event                                │
│  • Run global code   • Return response                              │
│  • 100ms - 10s       • Billed duration                              │
│                                                                      │
│  COLD START: First request or after idle (~15 min)                  │
│  WARM START: Subsequent requests reuse container                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Memory, Timeout, Cold Starts

| Setting               | Min    | Max       | Recommendation         |
| --------------------- | ------ | --------- | ---------------------- |
| **Memory**            | 128 MB | 10,240 MB | 1024 MB (good balance) |
| **Timeout**           | 1 sec  | 900 sec   | 30 sec for APIs        |
| **Ephemeral Storage** | 512 MB | 10,240 MB | Default usually fine   |

**Cold Start Factors:**

- **Memory**: More memory = more CPU = faster init
- **Package size**: Smaller = faster download
- **VPC**: Adds ~1-2 seconds (use VPC endpoints)
- **Runtime**: Node.js is faster than Java/C#

---

### Bundling & Tree-Shaking

```typescript
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

const lambda = new NodejsFunction(this, 'ApiHandler', {
  functionName: `api-handler-${stage}`,
  runtime: lambda.Runtime.NODEJS_20_X,
  entry: path.join(__dirname, '../src/lambda.ts'),
  handler: 'handler',
  memorySize: 1024,
  timeout: cdk.Duration.seconds(30),

  // Bundling with esbuild
  bundling: {
    minify: true, // Reduce bundle size
    sourceMap: true, // Enable for debugging
    target: 'node20', // Target Node.js version

    // Tree-shaking: only include used code
    externalModules: [
      '@aws-sdk/*', // Use Lambda runtime SDK
    ],

    // Define environment at build time
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  },
});
```

---

### Environment Variables

```typescript
// In CDK Stack
const lambda = new NodejsFunction(this, 'Handler', {
  environment: {
    // Stage/config
    STAGE: stage,
    NODE_ENV: stage === 'prod' ? 'production' : 'development',

    // Resource references
    TABLE_NAME: usersTable.tableName,
    BUCKET_NAME: uploadsBucket.bucketName,

    // Feature flags
    ENABLE_LOGGING: 'true',
    LOG_LEVEL: 'info',
  },
});

// In Lambda code
const tableName = process.env.TABLE_NAME;
const stage = process.env.STAGE;
```

**Security Note:** Never put secrets in environment variables. Use AWS Secrets Manager or Parameter Store.

---

### Hands-On: Create Lambda using CDK

```typescript
// lib/stacks/api-stack.ts
import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Create Lambda
    const apiLambda = new NodejsFunction(this, 'ApiLambda', {
      functionName: 'express-api-dev',
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../src/lambda.ts'),
      handler: 'handler',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'Express API',
    });

    // Add /health endpoint
    const health = api.root.addResource('health');
    health.addMethod('GET', new apigateway.LambdaIntegration(apiLambda));

    // Output
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
}
```

### Hands-On: Deploy Simple Lambda Endpoint

```bash
# Deploy
cdk deploy

# Test the endpoint
curl https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/health

# View logs
aws logs tail /aws/lambda/express-api-dev --follow

# Destroy
cdk destroy
```
