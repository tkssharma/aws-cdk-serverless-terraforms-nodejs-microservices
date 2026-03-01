# SECTION 2 – AWS CDK Fundamentals (Core Concepts)

---

## Lecture 3: AWS CDK Basics – How CDK Really Works

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
│ Learning Curve  │ Steep (YAML)    │ Medium (HCL)    │ Easy (TS)     │
└─────────────────┴─────────────────┴─────────────────┴───────────────┘
```

**When to use each:**

- **CloudFormation**: Native AWS, no external tools needed
- **Terraform**: Multi-cloud, existing HCL expertise
- **AWS CDK**: Developer teams, complex logic, testing required

---

### Constructs, Stacks, Apps

```
┌─────────────────────────────────────────────────────────────────────┐
│                              APP                                     │
│  (Entry point - bin/app.ts)                                         │
│                                                                      │
│  ┌─────────────────────────┐    ┌─────────────────────────┐        │
│  │        STACK 1          │    │        STACK 2          │        │
│  │   (Deployment Unit)     │    │   (Deployment Unit)     │        │
│  │                         │    │                         │        │
│  │  ┌─────────────────┐   │    │  ┌─────────────────┐   │        │
│  │  │   CONSTRUCT     │   │    │  │   CONSTRUCT     │   │        │
│  │  │   (Lambda)      │   │    │  │   (DynamoDB)    │   │        │
│  │  └─────────────────┘   │    │  └─────────────────┘   │        │
│  │                         │    │                         │        │
│  │  ┌─────────────────┐   │    │  ┌─────────────────┐   │        │
│  │  │   CONSTRUCT     │   │    │  │   CONSTRUCT     │   │        │
│  │  │   (API Gateway) │   │    │  │   (S3 Bucket)   │   │        │
│  │  └─────────────────┘   │    │  └─────────────────┘   │        │
│  │                         │    │                         │        │
│  └─────────────────────────┘    └─────────────────────────┘        │
│                                                                      │
│  Each Stack = 1 CloudFormation Stack                                │
│  Each Construct = 1 or more AWS Resources                           │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Concepts:**

- **App**: Root of your CDK application
- **Stack**: Unit of deployment (maps to CloudFormation stack)
- **Construct**: Cloud component (can be single resource or pattern)

---

### L1, L2, L3 Constructs

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// ═══════════════════════════════════════════════════════════════════
// L1 - CloudFormation Resources (Cfn prefix)
// Direct 1:1 mapping to CloudFormation, most verbose
// ═══════════════════════════════════════════════════════════════════
const l1Bucket = new s3.CfnBucket(this, 'L1Bucket', {
  bucketName: 'my-l1-bucket',
  versioningConfiguration: {
    status: 'Enabled',
  },
  bucketEncryption: {
    serverSideEncryptionConfiguration: [
      {
        serverSideEncryptionByDefault: {
          sseAlgorithm: 'AES256',
        },
      },
    ],
  },
});

// ═══════════════════════════════════════════════════════════════════
// L2 - Curated Constructs (Most commonly used)
// Sensible defaults, type-safe, easier to use
// ═══════════════════════════════════════════════════════════════════
const l2Bucket = new s3.Bucket(this, 'L2Bucket', {
  bucketName: 'my-l2-bucket',
  versioned: true, // Much simpler!
  encryption: s3.BucketEncryption.S3_MANAGED,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

// ═══════════════════════════════════════════════════════════════════
// L3 - Patterns (High-level abstractions)
// Combines multiple resources into a single construct
// ═══════════════════════════════════════════════════════════════════
const api = new apigateway.LambdaRestApi(this, 'MyApi', {
  handler: myLambda, // Creates API Gateway + Lambda integration + permissions!
});
```

**Comparison:**

| Level | Prefix    | Abstraction | Use When          |
| ----- | --------- | ----------- | ----------------- |
| L1    | `Cfn*`    | None        | Need full control |
| L2    | No prefix | Medium      | Most common use   |
| L3    | Patterns  | High        | Quick setup       |

---

### CDK Project Structure (Deep Dive)

```
my-cdk-app/
├── bin/
│   └── app.ts                 # 🚀 Entry point - creates App and Stacks
│
├── lib/
│   ├── stacks/                # 📦 Stack definitions
│   │   ├── api-stack.ts       #    API Gateway + Lambda
│   │   ├── database-stack.ts  #    DynamoDB tables
│   │   └── storage-stack.ts   #    S3 buckets
│   │
│   └── constructs/            # 🧱 Reusable constructs
│       ├── api-lambda.ts      #    Custom API + Lambda pattern
│       └── secure-bucket.ts   #    S3 with security defaults
│
├── src/                       # 💻 Application code (Lambda handlers)
│   ├── handlers/
│   │   ├── users.ts
│   │   └── orders.ts
│   └── shared/
│       └── utils.ts
│
├── test/                      # 🧪 Tests
│   └── stacks.test.ts
│
├── cdk.json                   # ⚙️ CDK configuration
├── package.json               # 📋 Dependencies
└── tsconfig.json              # 🔧 TypeScript config
```

---

### Hands-On: Create First CDK App

```bash
# Step 1: Create new directory
mkdir my-first-cdk-app
cd my-first-cdk-app

# Step 2: Initialize CDK project
cdk init app --language typescript

# Step 3: Explore the generated files
ls -la

# Step 4: Open in VS Code
code .

# Step 5: List stacks
cdk ls

# Step 6: Synthesize (generate CloudFormation)
cdk synth

# Step 7: Deploy
cdk deploy

# Step 8: Check AWS Console for resources

# Step 9: Destroy when done
cdk destroy
```

---

## Lecture 4: CDK with TypeScript Best Practices

### Folder Structure for Real Projects

```
enterprise-cdk-project/
├── bin/
│   └── app.ts
│
├── lib/
│   ├── stacks/
│   │   ├── api-stack.ts
│   │   ├── database-stack.ts
│   │   └── auth-stack.ts
│   │
│   ├── constructs/
│   │   ├── express-lambda.ts
│   │   └── secure-api.ts
│   │
│   └── config/
│       ├── environments.ts    # Environment configs
│       └── constants.ts       # Shared constants
│
├── src/                       # Lambda code
│   ├── handlers/
│   ├── services/
│   └── shared/
│
├── test/
│   ├── unit/
│   └── integration/
│
└── scripts/
    └── deploy.sh
```

---

### Environment-Based Config (dev / prod)

```typescript
// lib/config/environments.ts
export interface EnvironmentConfig {
  stage: string;
  account: string;
  region: string;
  lambdaMemory: number;
  logRetentionDays: number;
  domainName?: string;
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    stage: 'dev',
    account: '123456789012',
    region: 'us-east-1',
    lambdaMemory: 512,
    logRetentionDays: 7,
  },
  staging: {
    stage: 'staging',
    account: '123456789012',
    region: 'us-east-1',
    lambdaMemory: 1024,
    logRetentionDays: 14,
  },
  prod: {
    stage: 'prod',
    account: '987654321098', // Different account!
    region: 'us-east-1',
    lambdaMemory: 2048,
    logRetentionDays: 90,
    domainName: 'api.example.com',
  },
};
```

```typescript
// bin/app.ts
import { environments } from '../lib/config/environments';

const stage = app.node.tryGetContext('stage') || 'dev';
const config = environments[stage];

new ApiStack(app, `ApiStack-${stage}`, {
  env: { account: config.account, region: config.region },
  config,
});
```

---

### CDK Context & Environment Variables

```json
// cdk.json
{
  "app": "npx ts-node --prefer-ts-exts bin/app.ts",
  "context": {
    "stage": "dev",
    "enableLogging": true,
    "maxConcurrency": 100
  }
}
```

```typescript
// Reading context in code
const stage = this.node.tryGetContext('stage');
const enableLogging = this.node.tryGetContext('enableLogging');

// Override via CLI
// cdk deploy -c stage=prod -c enableLogging=false
```

**Environment Variables vs Context:**

| Aspect       | Context         | Env Vars |
| ------------ | --------------- | -------- |
| Set via      | cdk.json or CLI | Shell    |
| Available at | Synth time      | Runtime  |
| Use for      | Config values   | Secrets  |

---

### Stack Separation Strategy

```typescript
// ═══════════════════════════════════════════════════════════════════
// Strategy 1: Separate by Domain
// ═══════════════════════════════════════════════════════════════════
class DatabaseStack extends cdk.Stack {
  public readonly usersTable: dynamodb.Table;
  public readonly ordersTable: dynamodb.Table;
}

class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    // Uses tables from DatabaseStack
  }
}

class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
}

// ═══════════════════════════════════════════════════════════════════
// Strategy 2: Separate by Lifecycle
// ═══════════════════════════════════════════════════════════════════
class InfraStack extends cdk.Stack {
  // Rarely changes: VPC, RDS, etc.
}

class AppStack extends cdk.Stack {
  // Frequently changes: Lambda, API Gateway
}

// ═══════════════════════════════════════════════════════════════════
// Wiring Stacks Together (bin/app.ts)
// ═══════════════════════════════════════════════════════════════════
const dbStack = new DatabaseStack(app, 'Database');
const authStack = new AuthStack(app, 'Auth');
const apiStack = new ApiStack(app, 'Api', {
  usersTable: dbStack.usersTable,
  userPool: authStack.userPool,
});

// Explicit dependency
apiStack.addDependency(dbStack);
```

---

### Hands-On: Multi-Environment CDK Setup

```bash
# Deploy to dev
cdk deploy -c stage=dev

# Deploy to staging
cdk deploy -c stage=staging

# Deploy to prod (different account)
cdk deploy -c stage=prod --profile prod-account

# List all stacks
cdk ls -c stage=dev
cdk ls -c stage=prod
```

```typescript
// Example output:
// ApiStack-dev
// DatabaseStack-dev
// AuthStack-dev
```
