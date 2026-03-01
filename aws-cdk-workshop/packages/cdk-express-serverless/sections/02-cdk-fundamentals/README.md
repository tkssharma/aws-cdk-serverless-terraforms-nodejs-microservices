# Section 2 – AWS CDK Fundamentals (Core Concepts)

## 2.1 AWS CDK Basics – How CDK Really Works

### CDK vs CloudFormation vs Terraform

```
┌─────────────────────────────────────────────────────────────────────┐
│                         COMPARISON                                   │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│                 │  CloudFormation │    Terraform    │    AWS CDK    │
├─────────────────┼─────────────────┼─────────────────┼───────────────┤
│ Syntax          │ YAML/JSON       │ HCL             │ TypeScript    │
│ Abstraction     │ Low             │ Medium          │ High          │
│ Multi-Cloud     │ No              │ Yes             │ No            │
│ State Mgmt      │ AWS Managed     │ Self-managed    │ AWS Managed   │
│ IDE Support     │ Basic           │ Good            │ Excellent     │
│ Refactoring     │ Hard            │ Medium          │ Easy          │
│ Testing         │ Manual          │ Terratest       │ Jest/Native   │
└─────────────────┴─────────────────┴─────────────────┴───────────────┘
```

### The Three Pillars of CDK

```
┌─────────────────────────────────────────────────────────┐
│                        APP                               │
│  (Entry point - contains one or more stacks)            │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │       STACK 1       │  │       STACK 2       │      │
│  │  (Deployment unit)  │  │  (Deployment unit)  │      │
│  │                     │  │                     │      │
│  │  ┌───────────────┐  │  │  ┌───────────────┐  │      │
│  │  │  CONSTRUCT    │  │  │  │  CONSTRUCT    │  │      │
│  │  │  (Lambda)     │  │  │  │  (DynamoDB)   │  │      │
│  │  └───────────────┘  │  │  └───────────────┘  │      │
│  │  ┌───────────────┐  │  │  ┌───────────────┐  │      │
│  │  │  CONSTRUCT    │  │  │  │  CONSTRUCT    │  │      │
│  │  │  (API GW)     │  │  │  │  (S3)         │  │      │
│  │  └───────────────┘  │  │  └───────────────┘  │      │
│  └─────────────────────┘  └─────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Construct Levels: L1, L2, L3

```typescript
// L1 - CloudFormation Resources (Cfn prefix)
// Direct mapping to CloudFormation, most verbose
const l1Bucket = new s3.CfnBucket(this, 'L1Bucket', {
  bucketName: 'my-l1-bucket',
  versioningConfiguration: {
    status: 'Enabled'
  }
});

// L2 - Curated Constructs (Most commonly used)
// Sensible defaults, type-safe, easier to use
const l2Bucket = new s3.Bucket(this, 'L2Bucket', {
  bucketName: 'my-l2-bucket',
  versioned: true,
  encryption: s3.BucketEncryption.S3_MANAGED
});

// L3 - Patterns (High-level abstractions)
// Combines multiple resources into a single construct
const api = new apigateway.LambdaRestApi(this, 'MyApi', {
  handler: myLambda,  // Creates API Gateway + Lambda integration
});
```

### CDK Project Structure

```
my-cdk-app/
├── bin/
│   └── app.ts              # Entry point - instantiates App and Stacks
├── lib/
│   ├── stacks/             # Stack definitions
│   │   ├── api-stack.ts
│   │   └── database-stack.ts
│   └── constructs/         # Reusable constructs
│       └── api-lambda.ts
├── src/                    # Lambda source code
│   ├── handlers/
│   └── shared/
├── test/                   # CDK tests
│   └── app.test.ts
├── cdk.json               # CDK configuration
├── package.json
└── tsconfig.json
```

---

## 2.2 CDK with TypeScript Best Practices

### Environment-Based Configuration

```typescript
// config/environments.ts
export interface EnvironmentConfig {
  stage: string;
  account: string;
  region: string;
  lambdaMemory: number;
  logRetention: number;
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    stage: 'dev',
    account: '123456789012',
    region: 'us-east-1',
    lambdaMemory: 512,
    logRetention: 7
  },
  prod: {
    stage: 'prod',
    account: '987654321098',
    region: 'us-east-1',
    lambdaMemory: 1024,
    logRetention: 30
  }
};
```

### Using CDK Context

```json
// cdk.json
{
  "app": "npx ts-node --prefer-ts-exts bin/app.ts",
  "context": {
    "stage": "dev",
    "enableLogging": true,
    "domainName": "api.example.com"
  }
}
```

```typescript
// Reading context in code
const stage = this.node.tryGetContext('stage') || 'dev';
const enableLogging = this.node.tryGetContext('enableLogging');

// Override via CLI
// cdk deploy -c stage=prod -c enableLogging=false
```

### Stack Separation Strategy

```typescript
// Separate stacks by domain/lifecycle
class DatabaseStack extends cdk.Stack {
  public readonly usersTable: dynamodb.Table;
  
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      // ... configuration
    });
  }
}

class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    
    // Reference table from another stack
    const lambda = new NodejsFunction(this, 'Handler', {
      environment: {
        TABLE_NAME: props.usersTable.tableName
      }
    });
    
    // Grant permissions
    props.usersTable.grantReadWriteData(lambda);
  }
}
```

---

## Hands-On Lab 2.1: Create Your First CDK App

```bash
# Navigate to the demo folder
cd sections/02-cdk-fundamentals/demo

# Install dependencies
npm install

# Synthesize the stack
cdk synth

# Deploy to AWS
cdk deploy

# View the deployed resources in AWS Console

# Clean up
cdk destroy
```
