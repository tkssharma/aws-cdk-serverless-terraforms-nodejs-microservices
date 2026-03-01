# SECTION 1 – Course Introduction & Setup

---

## Lecture 1: Course Overview & What We'll Build

### What is AWS CDK and Why It Beats CloudFormation & Terraform (for Devs)

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

#### Why CDK Beats CloudFormation & Terraform

| Feature        | CloudFormation | Terraform    | AWS CDK                      |
| -------------- | -------------- | ------------ | ---------------------------- |
| Language       | YAML/JSON      | HCL          | TypeScript, Python, Java     |
| IDE Support    | Limited        | Good         | **Excellent** (IntelliSense) |
| Abstraction    | Low-level      | Medium       | **High-level constructs**    |
| Testing        | Difficult      | Terratest    | **Native Jest/unit tests**   |
| Reusability    | Nested stacks  | Modules      | **OOP patterns, npm**        |
| Learning Curve | Steep          | Medium       | **Familiar for devs**        |
| Refactoring    | Hard           | Medium       | **Easy**                     |
| State Mgmt     | AWS Managed    | Self-managed | **AWS Managed**              |

**For developers:** CDK lets you use real programming languages with loops, conditionals, classes, and inheritance - no more copy-pasting YAML!

---

### What is Serverless Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVERLESS MICROSERVICES                          │
│                                                                      │
│                         ┌─────────────────┐                         │
│                         │   API Gateway   │                         │
│                         └────────┬────────┘                         │
│                                  │                                   │
│          ┌───────────────────────┼───────────────────────┐          │
│          │                       │                       │          │
│          ▼                       ▼                       ▼          │
│    ┌──────────┐           ┌──────────┐           ┌──────────┐      │
│    │  Lambda  │           │  Lambda  │           │  Lambda  │      │
│    │  Users   │           │  Orders  │           │ Products │      │
│    └────┬─────┘           └────┬─────┘           └────┬─────┘      │
│         │                      │                      │             │
│         ▼                      ▼                      ▼             │
│    ┌──────────┐           ┌──────────┐           ┌──────────┐      │
│    │ DynamoDB │           │ DynamoDB │           │    S3    │      │
│    └──────────┘           └──────────┘           └──────────┘      │
│                                                                      │
│    ┌──────────┐           ┌──────────┐           ┌──────────┐      │
│    │ Cognito  │           │   SQS    │           │   SNS    │      │
│    │  (Auth)  │           │ (Queue)  │           │ (Events) │      │
│    └──────────┘           └──────────┘           └──────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Characteristics:**

- **No servers to manage** - Focus on code, not infrastructure
- **Auto-scaling** - Scales to zero and to millions
- **Pay per use** - Only pay for actual execution time
- **High availability** - Built-in fault tolerance
- **Independent deployment** - Each service deploys separately

---

### Final System Overview (Diagram Walkthrough)

```
                         ┌─────────────────┐
                         │   CloudFront    │
                         │     (CDN)       │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │   API Gateway   │◄──────┐
                         │   (REST API)    │       │
                         └────────┬────────┘       │
                                  │                │
              ┌───────────────────┼────────────────┼──────┐
              │                   │                │      │
       ┌──────▼──────┐    ┌───────▼──────┐  ┌─────▼────┐ │
       │   Lambda    │    │    Lambda    │  │ Cognito  │ │
       │   (Users)   │    │   (Orders)   │  │Authorizer│ │
       │  Express TS │    │  Express TS  │  └──────────┘ │
       └──────┬──────┘    └───────┬──────┘               │
              │                   │                       │
       ┌──────▼──────┐    ┌───────▼──────┐               │
       │  DynamoDB   │    │  DynamoDB    │               │
       │   Users     │    │   Orders     │               │
       └─────────────┘    └──────────────┘               │
              │                                          │
       ┌──────▼──────┐    ┌──────────────┐              │
       │     S3      │    │   Cognito    │──────────────┘
       │  (Uploads)  │    │  User Pool   │
       └─────────────┘    └──────────────┘
```

---

### What You'll Deploy by the End

1. **Express TypeScript API** running on AWS Lambda
2. **API Gateway** with REST endpoints and CORS
3. **DynamoDB** tables for data persistence
4. **S3 Bucket** for file uploads with pre-signed URLs
5. **Cognito User Pool** for authentication
6. **CloudWatch** for logging and monitoring
7. **IAM Roles** with least privilege access

---

### Hands-On: Live Demo of Final Deployed App

```bash
# API Endpoints you'll build:
GET  /health          # Health check
GET  /users           # List users
POST /users           # Create user
GET  /users/:id       # Get user
PUT  /users/:id       # Update user
DELETE /users/:id     # Delete user
POST /uploads/presign # Get upload URL
GET  /uploads         # List uploads
```

---

## Lecture 2: Prerequisites & Local Environment Setup

### AWS Account Setup (IAM Best Practices)

1. **Create AWS Account** at https://aws.amazon.com
2. **Enable MFA** on root account
3. **Create IAM User** with programmatic access

```
┌─────────────────────────────────────────────────────────┐
│                  IAM BEST PRACTICES                      │
│                                                          │
│  ✅ Never use root account for daily work               │
│  ✅ Enable MFA on all accounts                          │
│  ✅ Use IAM users with specific permissions             │
│  ✅ Rotate access keys regularly                        │
│  ✅ Use AdministratorAccess for learning only           │
└─────────────────────────────────────────────────────────┘
```

### Node.js, npm, AWS CLI

```bash
# Install Node.js v18+ (LTS)
# Download from https://nodejs.org or use nvm

# Verify installation
node --version    # Should be v18.x or higher
npm --version     # Should be v9.x or higher

# Install AWS CLI v2
# macOS
brew install awscli

# Verify
aws --version     # Should be aws-cli/2.x.x
```

### CDK CLI Installation

```bash
# Install AWS CDK globally
npm install -g aws-cdk

# Verify installation
cdk --version     # Should be 2.x.x

# Update CDK (when needed)
npm update -g aws-cdk
```

### NestJS CLI Setup (Optional for NestJS users)

```bash
# Install NestJS CLI
npm install -g @nestjs/cli

# Verify
nest --version
```

---

### Hands-On: Verify AWS Credentials

```bash
# Step 1: Configure AWS CLI
aws configure

# Enter your credentials:
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ****
# Default region: us-east-1
# Default output format: json

# Step 2: Verify credentials work
aws sts get-caller-identity

# Expected output:
# {
#   "UserId": "AIDA...",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/your-user"
# }

# Step 3: List S3 buckets (quick test)
aws s3 ls
```

---

### CDK Bootstrap Explained

**What is CDK Bootstrap?**

CDK Bootstrap creates resources in your AWS account that CDK needs to deploy:

- S3 bucket for assets (Lambda code, Docker images)
- ECR repository for Docker images
- IAM roles for deployment

```bash
# Bootstrap CDK (run once per account/region)
cdk bootstrap aws://ACCOUNT-ID/REGION

# Example
cdk bootstrap aws://123456789012/us-east-1

# With profile
cdk bootstrap --profile my-profile
```

```
┌─────────────────────────────────────────────────────────┐
│                CDK BOOTSTRAP CREATES:                    │
│                                                          │
│  📦 S3 Bucket: cdk-hnb659fds-assets-ACCOUNT-REGION      │
│     - Stores Lambda code                                 │
│     - Stores CloudFormation templates                    │
│                                                          │
│  🐳 ECR Repository: cdk-hnb659fds-container-assets      │
│     - Stores Docker images (if using containers)        │
│                                                          │
│  🔐 IAM Roles:                                          │
│     - CloudFormation execution role                      │
│     - Deploy action role                                 │
│     - File publishing role                               │
│     - Image publishing role                              │
└─────────────────────────────────────────────────────────┘
```

---

### Quick Verification Script

```bash
#!/bin/bash
echo "=== Verifying Development Environment ==="

echo "Node.js version:"
node --version

echo "npm version:"
npm --version

echo "AWS CLI version:"
aws --version

echo "CDK version:"
cdk --version

echo "AWS Identity:"
aws sts get-caller-identity

echo "=== All checks passed! ==="
```
