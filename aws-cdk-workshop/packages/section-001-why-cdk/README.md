# SECTION 001 – Why AWS CDK? (For Developers)

Understanding why CDK exists and how it transforms your code into AWS infrastructure.

---

## Why Do We Need Infrastructure as Code?

### The Problem: Manual Infrastructure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MANUAL INFRASTRUCTURE PROBLEMS                    │
│                                                                      │
│  ❌ Click-ops in AWS Console                                        │
│     └── "I clicked something, now it's broken"                      │
│                                                                      │
│  ❌ No version control                                              │
│     └── "Who changed the security group?"                           │
│                                                                      │
│  ❌ Environment drift                                               │
│     └── "Why does prod look different from staging?"                │
│                                                                      │
│  ❌ Documentation mismatch                                          │
│     └── "The wiki says one thing, AWS shows another"                │
│                                                                      │
│  ❌ No reproducibility                                              │
│     └── "Can you create the same setup in another region?"          │
│                                                                      │
│  ❌ Fear of changes                                                 │
│     └── "Don't touch it, it works!"                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### The Solution: Infrastructure as Code (IaC)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE AS CODE BENEFITS                   │
│                                                                      │
│  ✅ Version controlled                                              │
│     └── Git history shows who changed what and when                 │
│                                                                      │
│  ✅ Code review for infra                                           │
│     └── PR reviews catch misconfigurations before deploy            │
│                                                                      │
│  ✅ Reproducible environments                                       │
│     └── Same code = Same infrastructure everywhere                  │
│                                                                      │
│  ✅ Self-documenting                                                │
│     └── Code IS the documentation                                   │
│                                                                      │
│  ✅ Testable                                                        │
│     └── Unit tests for your infrastructure                          │
│                                                                      │
│  ✅ Rollback capability                                             │
│     └── git revert && cdk deploy                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Why CDK Over Other IaC Tools?

### Developer Experience Comparison

| Aspect | CloudFormation | Terraform | AWS CDK |
|--------|----------------|-----------|---------|
| **Language** | YAML/JSON | HCL | TypeScript, Python, Java, Go |
| **IDE Support** | Basic | Good | **Excellent** (IntelliSense, autocomplete) |
| **Loops & Conditions** | Limited | Yes | **Native** (real programming) |
| **Abstraction Level** | Low | Medium | **High** (L2/L3 constructs) |
| **Testing** | Difficult | Terratest | **Jest, unit tests** |
| **Reusability** | Nested stacks | Modules | **OOP, npm packages** |
| **Learning Curve** | New syntax | New syntax | **Familiar for devs** |
| **State Management** | AWS managed | Self-managed | **AWS managed** |
| **Multi-cloud** | AWS only | Yes | AWS (Terraform CDK for others) |

### The Developer Perspective

```typescript
// CloudFormation (YAML) - 50+ lines for a Lambda
Resources:
  MyFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: my-function
      Runtime: nodejs18.x
      Handler: index.handler
      Code:
        S3Bucket: my-bucket
        S3Key: code.zip
      Role: !GetAtt LambdaRole.Arn
  LambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        # ... 30 more lines

// AWS CDK (TypeScript) - 5 lines for the same Lambda
const fn = new NodejsFunction(this, 'MyFunction', {
  entry: 'src/handler.ts',
  runtime: Runtime.NODEJS_18_X,
});
// IAM role is auto-created with correct permissions!
```

---

## Why Developers Should Learn CDK

### 1. Use Your Existing Skills

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SKILLS YOU ALREADY HAVE                           │
│                                                                      │
│  TypeScript/JavaScript Developer?                                   │
│  ├── ✅ Classes and inheritance                                     │
│  ├── ✅ Interfaces and types                                        │
│  ├── ✅ Loops and conditionals                                      │
│  ├── ✅ npm packages                                                │
│  ├── ✅ Unit testing with Jest                                      │
│  └── ✅ IDE autocomplete and IntelliSense                          │
│                                                                      │
│  All these skills transfer directly to CDK!                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Full-Stack Ownership

```
Before CDK:
┌──────────────────┐    ┌──────────────────┐
│    Developer     │    │   DevOps/Infra   │
│                  │    │                  │
│  • Write code    │───▶│  • Setup AWS     │
│  • API logic     │    │  • Configure VPC │
│  • Business      │    │  • IAM policies  │
│    rules         │    │  • Deploy        │
└──────────────────┘    └──────────────────┘
      "It works           "Works on my
       on my laptop"       CloudFormation"

With CDK:
┌─────────────────────────────────────────┐
│           Full-Stack Developer          │
│                                         │
│  • Write application code               │
│  • Define infrastructure (CDK)          │
│  • Deploy with single command           │
│  • Own the entire feature               │
└─────────────────────────────────────────┘
```

### 3. Career Advantage

- **DevOps skills** are in high demand
- **Full-stack + infrastructure** = higher value
- **Serverless expertise** is the future
- Companies prefer developers who can deploy their own code

---

## AWS CDK Architecture: How It Works

### The CDK Synthesis Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CDK COMPILATION FLOW                            │
│                                                                      │
│  ┌──────────────────┐                                               │
│  │  Your TypeScript │                                               │
│  │      Code        │                                               │
│  │                  │                                               │
│  │  const bucket =  │                                               │
│  │   new s3.Bucket  │                                               │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ▼  tsc compile                                            │
│  ┌──────────────────┐                                               │
│  │   JavaScript     │                                               │
│  │                  │                                               │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ▼  cdk synth                                              │
│  ┌──────────────────┐                                               │
│  │  CloudFormation  │                                               │
│  │     Template     │   cdk.out/MyStack.template.json               │
│  │     (JSON)       │                                               │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ▼  cdk deploy                                             │
│  ┌──────────────────┐                                               │
│  │      AWS         │                                               │
│  │  CloudFormation  │   Creates/Updates stack                       │
│  │     Service      │                                               │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │  AWS Resources   │   S3 Bucket, Lambda, DynamoDB, etc.          │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CDK ARCHITECTURE                              │
│                                                                      │
│                         ┌─────────────┐                             │
│                         │   CDK App   │                             │
│                         │   (bin/)    │                             │
│                         └──────┬──────┘                             │
│                                │                                     │
│              ┌─────────────────┼─────────────────┐                  │
│              │                 │                 │                  │
│              ▼                 ▼                 ▼                  │
│       ┌──────────┐      ┌──────────┐      ┌──────────┐             │
│       │  Stack   │      │  Stack   │      │  Stack   │             │
│       │  (Dev)   │      │  (Prod)  │      │  (Test)  │             │
│       └────┬─────┘      └────┬─────┘      └────┬─────┘             │
│            │                 │                 │                    │
│            ▼                 ▼                 ▼                    │
│       ┌─────────────────────────────────────────────┐              │
│       │                CONSTRUCTS                    │              │
│       │                                              │              │
│       │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │              │
│       │  │ Lambda  │ │DynamoDB │ │   S3    │       │              │
│       │  │   L2    │ │   L2    │ │   L2    │       │              │
│       │  └────┬────┘ └────┬────┘ └────┬────┘       │              │
│       │       │           │           │             │              │
│       │       ▼           ▼           ▼             │              │
│       │  ┌─────────────────────────────────────┐   │              │
│       │  │           L1 Constructs              │   │              │
│       │  │  (Cfn* - Direct CloudFormation)     │   │              │
│       │  └─────────────────────────────────────┘   │              │
│       └─────────────────────────────────────────────┘              │
│                                │                                    │
│                                ▼                                    │
│       ┌─────────────────────────────────────────────┐              │
│       │         CloudFormation Template             │              │
│       │              (cdk.out/)                     │              │
│       └─────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### What Happens When You Run `cdk deploy`

```bash
# Step-by-step breakdown

$ cdk deploy

# Step 1: Synthesis
# CDK executes your TypeScript code and generates CloudFormation

┌────────────────────────────────────────────────────────────────┐
│  1. SYNTHESIS (cdk synth)                                       │
│                                                                 │
│  • TypeScript compiled to JavaScript                           │
│  • CDK constructs instantiated                                 │
│  • Construct tree built                                        │
│  • CloudFormation template generated                           │
│  • Output: cdk.out/MyStack.template.json                       │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  2. ASSET PUBLISHING                                           │
│                                                                 │
│  • Lambda code zipped and uploaded to S3                       │
│  • Docker images pushed to ECR (if used)                       │
│  • Assets stored in CDK bootstrap bucket                       │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  3. DEPLOYMENT                                                 │
│                                                                 │
│  • CloudFormation receives template                            │
│  • CF calculates changeset (diff)                              │
│  • CF creates/updates/deletes resources                        │
│  • Progress streamed to terminal                               │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  4. OUTPUTS                                                    │
│                                                                 │
│  • Stack outputs displayed                                     │
│  • API URLs, bucket names, etc.                                │
│  • Resources now live in AWS                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Construct Levels Explained

### L1, L2, and L3 Constructs

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CONSTRUCT LEVELS                                │
│                                                                      │
│  L3 (Patterns) ─────────────────────────────────────────────────   │
│  │  High-level patterns combining multiple resources                │
│  │  Example: LambdaRestApi (API Gateway + Lambda + CORS)           │
│  │                                                                   │
│  │  const api = new LambdaRestApi(this, 'Api', {                   │
│  │    handler: myFunction,  // That's it!                          │
│  │  });                                                             │
│  │                                                                   │
│  ▼                                                                   │
│  L2 (Curated) ──────────────────────────────────────────────────   │
│  │  AWS-recommended defaults, sensible security                     │
│  │  Example: s3.Bucket, lambda.Function                            │
│  │                                                                   │
│  │  const bucket = new s3.Bucket(this, 'Bucket', {                 │
│  │    encryption: BucketEncryption.S3_MANAGED,  // Defaults!       │
│  │  });                                                             │
│  │                                                                   │
│  ▼                                                                   │
│  L1 (CloudFormation) ───────────────────────────────────────────   │
│     Direct 1:1 mapping to CloudFormation resources                  │
│     Prefix: Cfn* (CfnBucket, CfnFunction)                          │
│                                                                      │
│     const bucket = new s3.CfnBucket(this, 'Bucket', {              │
│       bucketName: 'my-bucket',                                      │
│       // Must specify everything manually                          │
│     });                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Real-World Example

```typescript
// L1: Low-level, verbose, error-prone (100+ lines)
new CfnFunction(this, 'Function', {
  functionName: 'my-func',
  runtime: 'nodejs18.x',
  handler: 'index.handler',
  code: { s3Bucket: bucket, s3Key: 'code.zip' },
  role: role.roleArn,
  // + 20 more properties
});

// L2: Sensible defaults, auto IAM, bundling (5 lines)
const fn = new NodejsFunction(this, 'Function', {
  entry: 'src/handler.ts',
});

// L3: Complete API with Lambda backend (3 lines)
new LambdaRestApi(this, 'Api', {
  handler: fn,
});
// Creates: API Gateway, Lambda integration, CORS, IAM!
```

---

## CDK vs Writing CloudFormation Directly

### Lines of Code Comparison

| Resource | CloudFormation (YAML) | CDK (TypeScript) |
|----------|----------------------|------------------|
| Lambda + IAM Role | ~80 lines | ~5 lines |
| API Gateway + Lambda | ~200 lines | ~10 lines |
| DynamoDB + GSI | ~60 lines | ~15 lines |
| S3 + CloudFront | ~150 lines | ~20 lines |
| **Full serverless API** | **~500 lines** | **~50 lines** |

### Safety Features

```typescript
// CDK catches errors at compile time!

// ❌ This won't compile - wrong type
bucket.grantRead(123);  // Error: Argument must be IGrantable

// ❌ This won't compile - property doesn't exist
new lambda.Function(this, 'Fn', {
  runtim: 'nodejs18.x',  // Typo caught by TypeScript
});

// ✅ IDE autocomplete shows valid options
new lambda.Function(this, 'Fn', {
  runtime: lambda.Runtime.NODEJS_18_X,  // Type-safe!
});
```

---

## Summary: Why Learn CDK?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOP REASONS TO LEARN CDK                          │
│                                                                      │
│  1. Use TypeScript/Python you already know                          │
│  2. 10x less code than CloudFormation                               │
│  3. IDE support with autocomplete and type checking                 │
│  4. Built-in best practices and security defaults                   │
│  5. Reusable constructs via npm packages                           │
│  6. Unit test your infrastructure                                   │
│  7. Single codebase for app + infra                                │
│  8. Deploy with one command: cdk deploy                            │
│  9. Career advantage: Full-stack + DevOps                          │
│  10. AWS-native with managed state                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start After This Section

```bash
# You'll be able to do this:

# 1. Write infrastructure as TypeScript
const api = new LambdaRestApi(this, 'Api', {
  handler: new NodejsFunction(this, 'Handler', {
    entry: 'src/api.ts',
  }),
});

# 2. Deploy with one command
cdk deploy

# 3. See your API live
# Outputs:
# ApiEndpoint = https://xxx.execute-api.us-east-1.amazonaws.com/prod/
```

**Next:** Section 01 - Course Introduction & Detailed Setup
