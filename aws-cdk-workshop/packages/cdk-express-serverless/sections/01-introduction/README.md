# Section 1 – Course Introduction & Setup

## 1.1 Course Overview & What We'll Build

### What is AWS CDK?

**AWS Cloud Development Kit (CDK)** is an open-source software development framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation.

```
┌─────────────────────────────────────────────────────────┐
│                    Your Code (TypeScript)               │
│                         ↓                               │
│                   AWS CDK Synthesis                     │
│                         ↓                               │
│              CloudFormation Template (JSON)             │
│                         ↓                               │
│                  AWS CloudFormation                     │
│                         ↓                               │
│              AWS Resources (Lambda, DynamoDB, etc.)     │
└─────────────────────────────────────────────────────────┘
```

### Why CDK Beats CloudFormation & Terraform (for Developers)

| Feature | CloudFormation | Terraform | AWS CDK |
|---------|---------------|-----------|---------|
| Language | YAML/JSON | HCL | TypeScript, Python, Java, Go |
| IDE Support | Limited | Good | Excellent (full IntelliSense) |
| Abstraction | Low-level | Medium | High-level constructs |
| Testing | Difficult | Possible | Native Jest/unit tests |
| Reusability | Nested stacks | Modules | OOP patterns, npm packages |
| Learning Curve | Steep | Medium | Familiar for developers |

### What is Serverless Microservices Architecture?

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
   ┌──────────┐       ┌──────────┐       ┌──────────┐
   │  Lambda  │       │  Lambda  │       │  Lambda  │
   │  Users   │       │  Orders  │       │ Products │
   └────┬─────┘       └────┬─────┘       └────┬─────┘
        │                  │                  │
        ▼                  ▼                  ▼
   ┌──────────┐       ┌──────────┐       ┌──────────┐
   │ DynamoDB │       │ DynamoDB │       │ DynamoDB │
   │  Users   │       │  Orders  │       │ Products │
   └──────────┘       └──────────┘       └──────────┘
```

**Key Benefits:**
- **No servers to manage** - Focus on code, not infrastructure
- **Auto-scaling** - Scales to zero and to millions
- **Pay per use** - Only pay for actual execution time
- **High availability** - Built-in fault tolerance

### Final System Overview

By the end of this course, you'll deploy:

1. **Express TypeScript API** running on Lambda
2. **API Gateway** with REST endpoints
3. **DynamoDB** for data persistence
4. **S3** for file uploads
5. **Cognito** for authentication
6. **CloudWatch** for monitoring

---

## 1.2 Prerequisites & Local Environment Setup

### AWS Account Setup

1. Create AWS Account at https://aws.amazon.com
2. Set up IAM user with programmatic access
3. Attach `AdministratorAccess` policy (for learning; use least privilege in production)

### Install Required Tools

```bash
# Node.js (v18 or later)
node --version  # Should be v18.x or higher

# npm
npm --version

# AWS CLI
aws --version

# Install AWS CDK CLI globally
npm install -g aws-cdk

# Verify CDK installation
cdk --version
```

### Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)

# Verify credentials
aws sts get-caller-identity
```

### CDK Bootstrap

CDK Bootstrap provisions resources in your AWS account that CDK needs to deploy:

```bash
# Bootstrap CDK in your account/region
cdk bootstrap aws://ACCOUNT-ID/REGION

# Example
cdk bootstrap aws://123456789012/us-east-1
```

**What bootstrap creates:**
- S3 bucket for assets
- ECR repository for Docker images
- IAM roles for deployment

---

## Hands-On Lab 1.1: Verify Your Setup

```bash
# 1. Verify AWS credentials
aws sts get-caller-identity

# 2. Verify CDK installation
cdk --version

# 3. Create a test CDK project
mkdir cdk-test && cd cdk-test
cdk init app --language typescript

# 4. List stacks
cdk ls

# 5. Synthesize (generate CloudFormation)
cdk synth

# 6. Clean up
cd .. && rm -rf cdk-test
```

**Expected Output:**
- Your AWS account ID and ARN
- CDK version (2.x)
- Generated CloudFormation template
