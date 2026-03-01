# SECTION 3 – Serverless Microservice Architecture Design

---

## Lecture 5: Designing Serverless Microservices on AWS

### Monolith vs Microservices vs Serverless

```
┌────────────────────────────────────────────────────────────────────────┐
│                            MONOLITH                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Users │ Orders │ Products │ Payments │ Notifications          │   │
│  │                       Single Codebase                           │   │
│  │                       Single Deployment                         │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                              Single DB                                  │
│                                                                         │
│  ✅ Simple to develop initially                                        │
│  ❌ Hard to scale individual components                                │
│  ❌ Single point of failure                                            │
│  ❌ Technology lock-in                                                 │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                          MICROSERVICES                                  │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────────────┐  │
│  │  Users  │ │ Orders  │ │ Products │ │Payments │ │ Notifications  │  │
│  │ Service │ │ Service │ │  Service │ │ Service │ │    Service     │  │
│  └────┬────┘ └────┬────┘ └────┬─────┘ └────┬────┘ └───────┬────────┘  │
│       │           │           │            │              │            │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌───────┴───────┐   │
│  │   DB    │ │   DB    │ │   DB    │ │   DB    │ │      DB       │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────────────┘   │
│                                                                         │
│  ✅ Independent scaling                                                │
│  ✅ Technology flexibility                                             │
│  ❌ Operational complexity (servers to manage)                         │
│  ❌ Network latency between services                                   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                           SERVERLESS                                    │
│                      ┌─────────────────┐                               │
│                      │   API Gateway   │                               │
│                      └────────┬────────┘                               │
│           ┌──────────────────┼──────────────────┐                     │
│           ▼                  ▼                  ▼                     │
│      ┌─────────┐       ┌─────────┐       ┌─────────┐                 │
│      │ Lambda  │       │ Lambda  │       │ Lambda  │                 │
│      │ (Users) │       │(Orders) │       │(Products)│                 │
│      └────┬────┘       └────┬────┘       └────┬────┘                 │
│           ▼                  ▼                  ▼                     │
│      ┌─────────┐       ┌─────────┐       ┌─────────┐                 │
│      │DynamoDB │       │DynamoDB │       │   S3    │                 │
│      └─────────┘       └─────────┘       └─────────┘                 │
│                                                                         │
│  ✅ No servers to manage                                               │
│  ✅ Auto-scaling (including to zero)                                   │
│  ✅ Pay only for what you use                                          │
│  ✅ High availability built-in                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

### API-Driven Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    API-DRIVEN ARCHITECTURE                           │
│                                                                      │
│   Client (Web/Mobile)                                               │
│          │                                                          │
│          ▼                                                          │
│   ┌─────────────┐                                                   │
│   │   Cognito   │  ◄─── Authentication (JWT tokens)                │
│   └──────┬──────┘                                                   │
│          │                                                          │
│          ▼                                                          │
│   ┌─────────────┐     ┌─────────────┐                              │
│   │ API Gateway │────▶│   Lambda    │                              │
│   │   (REST)    │     │  (Express)  │                              │
│   └─────────────┘     └──────┬──────┘                              │
│                              │                                       │
│          ┌───────────────────┼───────────────────┐                  │
│          ▼                   ▼                   ▼                  │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐         │
│   │  DynamoDB   │     │     S3      │     │   Secrets   │         │
│   │   (Data)    │     │  (Files)    │     │   Manager   │         │
│   └─────────────┘     └─────────────┘     └─────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Event-Driven Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                   EVENT-DRIVEN PATTERNS                              │
│                                                                      │
│  PATTERN 1: Queue-Based (Decoupling)                                │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐      │
│  │ Lambda  │────▶│   SQS   │────▶│ Lambda  │────▶│   DB    │      │
│  │(Producer)│    │ (Queue) │     │(Consumer)│     │         │      │
│  └─────────┘     └─────────┘     └─────────┘     └─────────┘      │
│                                                                      │
│  PATTERN 2: Pub/Sub (Fan-out)                                       │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐                       │
│  │ Lambda  │────▶│   SNS   │────▶│ Lambda  │  (Email service)      │
│  │(Publish)│     │ (Topic) │────▶│ Lambda  │  (Push notification)  │
│  └─────────┘     └─────────┘────▶│ Lambda  │  (Analytics)          │
│                                   └─────────┘                       │
│                                                                      │
│  PATTERN 3: Event Bus (Complex routing)                             │
│  ┌─────────┐     ┌─────────────┐     ┌─────────┐                   │
│  │DynamoDB │────▶│ EventBridge │────▶│ Lambda  │                   │
│  │ Stream  │     │   (Rules)   │     │(Handler)│                   │
│  └─────────┘     └─────────────┘     └─────────┘                   │
│                                                                      │
│  PATTERN 4: Workflow Orchestration                                  │
│  ┌─────────┐     ┌───────────────┐     ┌─────────┐                 │
│  │ Trigger │────▶│Step Functions │────▶│ Lambda  │                 │
│  │         │     │  (Workflow)   │────▶│ Lambda  │                 │
│  └─────────┘     └───────────────┘────▶│ Lambda  │                 │
│                                         └─────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Cost & Scalability Considerations

| Service         | Pricing Model                            | Free Tier         |
| --------------- | ---------------------------------------- | ----------------- |
| **Lambda**      | $0.20/1M requests + $0.0000166667/GB-sec | 1M requests/month |
| **API Gateway** | $3.50/1M requests (REST)                 | 1M requests/month |
| **DynamoDB**    | $1.25/1M writes, $0.25/1M reads          | 25GB storage      |
| **S3**          | $0.023/GB storage + requests             | 5GB storage       |
| **Cognito**     | Free up to 50K MAU                       | 50K MAU           |

**Scaling Characteristics:**

- **Lambda**: 1000+ concurrent executions (can be increased)
- **API Gateway**: 10,000 requests/second (soft limit)
- **DynamoDB**: Unlimited with on-demand mode
- **S3**: Virtually unlimited

---

### Hands-On: Draw Full Architecture

```
Use draw.io or Lucidchart to create:

1. API Gateway receiving client requests
2. Cognito User Pool for authentication
3. Lambda functions for each service
4. DynamoDB tables for data
5. S3 bucket for file uploads
6. CloudWatch for logging
```

---

## Lecture 6: Project Setup – Microservices Structure

### Mono-repo vs Multi-repo

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MONO-REPO                                     │
│                                                                      │
│  my-project/                                                        │
│  ├── packages/                                                      │
│  │   ├── cdk-infra/           # CDK infrastructure                 │
│  │   ├── user-service/        # User microservice                  │
│  │   ├── order-service/       # Order microservice                 │
│  │   └── shared/              # Shared libraries                   │
│  ├── package.json             # Root package.json (workspaces)     │
│  └── turbo.json               # Build orchestration                │
│                                                                      │
│  ✅ Atomic changes across services                                  │
│  ✅ Shared code easily                                              │
│  ✅ Single CI/CD pipeline                                           │
│  ❌ Can become large                                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       MULTI-REPO                                     │
│                                                                      │
│  github.com/org/user-service/                                       │
│  github.com/org/order-service/                                      │
│  github.com/org/cdk-infra/                                          │
│  github.com/org/shared-lib/                                         │
│                                                                      │
│  ✅ Clear ownership                                                 │
│  ✅ Independent deployments                                         │
│  ❌ Dependency management harder                                    │
│  ❌ Cross-repo changes complex                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Recommendation:** Start with mono-repo, split later if needed.

---

### CDK Infra Folder Structure

```
packages/
├── cdk-infra/
│   ├── bin/
│   │   └── app.ts                 # Entry point
│   │
│   ├── lib/
│   │   ├── stacks/
│   │   │   ├── api-stack.ts       # API Gateway + Lambda
│   │   │   ├── database-stack.ts  # DynamoDB tables
│   │   │   ├── auth-stack.ts      # Cognito
│   │   │   └── storage-stack.ts   # S3 buckets
│   │   │
│   │   ├── constructs/
│   │   │   ├── express-lambda.ts  # Reusable Lambda construct
│   │   │   └── secure-bucket.ts   # S3 with defaults
│   │   │
│   │   └── config/
│   │       └── environments.ts    # Environment configs
│   │
│   ├── test/
│   ├── cdk.json
│   └── package.json
```

---

### Express/NestJS Services Folder

```
packages/
├── user-service/
│   ├── src/
│   │   ├── app.ts                 # Express app
│   │   ├── lambda.ts              # Lambda handler
│   │   ├── local.ts               # Local dev server
│   │   │
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   └── users.ts
│   │   │
│   │   ├── services/
│   │   │   └── user.service.ts
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   │
│   │   └── types/
│   │       └── user.ts
│   │
│   ├── package.json
│   └── tsconfig.json
```

---

### Shared Libraries

```
packages/
├── shared/
│   ├── src/
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   └── order.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── validation.ts
│   │   │
│   │   └── index.ts               # Exports all
│   │
│   └── package.json
```

```typescript
// Usage in service
import { User, Logger } from '@myproject/shared';
```

---

### Hands-On: Setup Mono-repo with CDK + Services

```bash
# Step 1: Create project
mkdir serverless-microservices
cd serverless-microservices
npm init -y

# Step 2: Setup npm workspaces
# Edit package.json:
{
  "name": "serverless-microservices",
  "workspaces": [
    "packages/*"
  ]
}

# Step 3: Create packages directory
mkdir -p packages/cdk-infra
mkdir -p packages/user-service
mkdir -p packages/shared

# Step 4: Initialize CDK
cd packages/cdk-infra
cdk init app --language typescript

# Step 5: Install dependencies from root
cd ../..
npm install

# Step 6: Run CDK from root
npm run --workspace=cdk-infra cdk synth
```
