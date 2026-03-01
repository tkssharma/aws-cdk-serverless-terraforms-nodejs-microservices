# AWS CDK Workshop - Serverless Microservices with Node.js

Build production-ready serverless microservices on AWS using CDK, Lambda, API Gateway, DynamoDB, Cognito, and S3.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SERVERLESS MICROSERVICES ARCHITECTURE                 │
│                                                                          │
│     Client ──▶ API Gateway ──▶ Lambda (Express) ──▶ DynamoDB           │
│                     │                  │                                 │
│                     │                  └──────────▶ S3                  │
│                     │                                                    │
│                Cognito (Auth)                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Course Structure

| Section | Lectures | Topics                                            |
| ------- | -------- | ------------------------------------------------- |
| **01**  | 1-2      | Course Overview, Prerequisites, Environment Setup |
| **02**  | 3-4      | CDK Basics, L1/L2/L3 Constructs, Best Practices   |
| **03**  | 5-6      | Serverless Architecture Design, Mono-repo Setup   |
| **04**  | 7-8      | API Gateway Deep Dive, Lambda with Node.js        |
| **05**  | 9-10     | Express/NestJS on Lambda, Microservice Structure  |
| **06**  | 11-12    | DynamoDB Fundamentals, CRUD Operations            |
| **07**  | 13-14    | Cognito User Pool, JWT, API Authorizers           |
| **08**  | 15-16    | S3 Fundamentals, Pre-signed URLs                  |
| **09**  | 17-18    | IAM Best Practices, Reusable CDK Constructs       |

> **Course Content:** See `packages/COURSE-README.md` for detailed lecture content.

---

## 🛠️ Prerequisites

### Node.js & npm

```bash
node -v   # v18+ recommended
npm -v    # v9+
```

### AWS CLI v2

```bash
# macOS
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify
aws --version
# aws-cli/2.x.x Python/3.x.x Darwin/...
```

### AWS CDK

```bash
npm install -g aws-cdk
cdk --version
```

---

## ⚙️ AWS Configuration

### Configure Credentials

```bash
aws configure
# AWS Access Key ID: ****************XXXX
# AWS Secret Access Key: ****************XXXX
# Default region name: us-east-1
# Default output format: json
```

### Set Environment Variables

```bash
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=us-east-1
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Bootstrap CDK (First Time Only)

```bash
cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/$CDK_DEFAULT_REGION
```

### 3. Run Demo Project

```bash
cd packages/cdk-express-serverless

# Install dependencies
npm install

# Run locally
npm run local

# Deploy to AWS
cdk deploy
```

---

## 📁 Project Structure

```
aws-cdk-workshop/
├── packages/
│   ├── COURSE-README.md                # Course overview
│   ├── section-01-introduction/        # Lectures 1-2
│   ├── section-02-cdk-fundamentals/    # Lectures 3-4
│   ├── section-03-serverless-architecture/  # Lectures 5-6
│   ├── section-04-api-gateway-lambda/  # Lectures 7-8
│   ├── section-05-express-on-lambda/   # Lectures 9-10
│   ├── section-06-dynamodb/            # Lectures 11-12
│   ├── section-07-cognito-auth/        # Lectures 13-14
│   ├── section-08-s3-uploads/          # Lectures 15-16
│   ├── section-09-advanced-cdk/        # Lectures 17-18
│   │
│   ├── cdk-express-serverless/         # Main demo project
│   ├── lambda-rest-apis/               # Lambda REST API examples
│   └── demo-app/                       # Basic CDK demo
```

---

## 🔧 CDK Commands

| Command         | Description                               |
| --------------- | ----------------------------------------- |
| `cdk synth`     | Synthesize CloudFormation template        |
| `cdk diff`      | Compare deployed stack with current state |
| `cdk deploy`    | Deploy stack to AWS                       |
| `cdk destroy`   | Remove stack from AWS                     |
| `cdk bootstrap` | Bootstrap CDK toolkit stack               |

---

## 🏗️ What You'll Build

- **REST API** with API Gateway + Lambda
- **Express/NestJS** running on Lambda
- **DynamoDB** for user data storage
- **Cognito** for authentication
- **S3** for file uploads with pre-signed URLs
- **Reusable CDK Constructs** for production use

---

## 📖 Further Reading

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [Serverless Express](https://github.com/vendia/serverless-express)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
