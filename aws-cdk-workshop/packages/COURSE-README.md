# 🎓 AWS CDK Serverless Course - Complete Guide

## Course Overview

Build, Deploy & Scale Production-Ready Express TypeScript Microservices on AWS using CDK.

---

## 📁 Course Structure

```
packages/
├── section-01-introduction/       # Course Introduction & Setup
├── section-02-cdk-fundamentals/   # AWS CDK Core Concepts
├── section-03-serverless-architecture/  # Serverless Design
├── section-04-api-gateway-lambda/ # API Gateway + Lambda
├── section-05-express-on-lambda/  # Express TypeScript on Lambda
├── section-06-dynamodb/           # DynamoDB with CDK
├── section-07-cognito-auth/       # Cognito Authentication
├── section-08-s3-uploads/         # S3 File Uploads
├── section-09-advanced-cdk/       # Advanced CDK Patterns
│
└── cdk-express-serverless/        # 🚀 MAIN DEMO PROJECT
    ├── bin/                       # CDK app entry point
    ├── lib/                       # CDK stacks & constructs
    └── src/                       # Express TypeScript app
```

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
node --version    # v18+
aws --version     # AWS CLI v2
cdk --version     # AWS CDK v2

# Configure AWS
aws configure
```

### 2. Run the Demo Project

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

## 📚 Course Lectures Overview

| Section | Lecture | Topic                                     |
| ------- | ------- | ----------------------------------------- |
| **01**  | 1       | Course Overview & What We'll Build        |
| **01**  | 2       | Prerequisites & Local Environment Setup   |
| **02**  | 3       | AWS CDK Basics – How CDK Really Works     |
| **02**  | 4       | CDK with TypeScript Best Practices        |
| **03**  | 5       | Designing Serverless Microservices on AWS |
| **03**  | 6       | Project Setup – Microservices Structure   |
| **04**  | 7       | API Gateway Deep Dive (CDK)               |
| **04**  | 8       | AWS Lambda with Node.js & CDK             |
| **05**  | 9       | Running Express/NestJS on AWS Lambda      |
| **05**  | 10      | Express/NestJS Microservice Structure     |
| **06**  | 11      | DynamoDB Fundamentals for Developers      |
| **06**  | 12      | DynamoDB with CDK + Express               |
| **07**  | 13      | Cognito User Pool Deep Dive               |
| **07**  | 14      | Cognito with API Gateway & Lambda         |
| **08**  | 15      | S3 Fundamentals for Serverless Apps       |
| **08**  | 16      | S3 + Lambda + API Gateway                 |
| **09**  | 17      | IAM Best Practices in CDK                 |
| **09**  | 18      | CDK Reusable Constructs                   |

---

## 🏗️ Architecture

```
                    ┌─────────────────┐
                    │   CloudFront    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │    (REST)       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Lambda      │
                    │ (Express + TS)  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌─────▼─────┐      ┌─────▼─────┐
    │DynamoDB │        │    S3     │      │  Cognito  │
    │ (Data)  │        │ (Uploads) │      │  (Auth)   │
    └─────────┘        └───────────┘      └───────────┘
```

---

## 🛠️ Tech Stack

| Category     | Technology              |
| ------------ | ----------------------- |
| **IaC**      | AWS CDK v2 (TypeScript) |
| **Runtime**  | Node.js 20, Express     |
| **Database** | DynamoDB                |
| **Storage**  | S3                      |
| **Auth**     | Cognito                 |
| **API**      | API Gateway REST        |
| **Compute**  | Lambda                  |

---

## 📖 How to Use This Course

1. **Theory First**: Read each section's README.md
2. **Hands-On**: Follow along with the demos
3. **Practice**: Modify and extend the examples
4. **Deploy**: Deploy to your own AWS account

---

## 🎯 Learning Outcomes

By the end of this course, you will be able to:

- ✅ Build serverless APIs with Express + Lambda
- ✅ Deploy infrastructure using AWS CDK
- ✅ Implement DynamoDB for NoSQL data storage
- ✅ Handle file uploads with S3 pre-signed URLs
- ✅ Secure APIs with Cognito authentication
- ✅ Create reusable CDK constructs
- ✅ Test CDK applications

---

## 📝 Commands Cheat Sheet

```bash
# CDK Commands
cdk init app --language typescript  # Create new project
cdk bootstrap                        # Bootstrap account
cdk synth                            # Generate CloudFormation
cdk diff                             # Preview changes
cdk deploy                           # Deploy stack
cdk destroy                          # Remove stack

# Development
npm run local                        # Run Express locally
npm run build                        # Compile TypeScript
npm run test                         # Run tests
```

---

**Author:** TK Sharma  
**Course Version:** 1.0
