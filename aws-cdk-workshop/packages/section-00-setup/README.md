# SECTION 0 – AWS CDK Setup Guide

Complete setup guide to get your development environment ready for AWS CDK.

---

## Prerequisites Checklist

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REQUIRED TOOLS                                    │
│                                                                      │
│  ✅ Node.js v18+ (LTS)                                              │
│  ✅ npm v9+ or yarn                                                 │
│  ✅ AWS CLI v2                                                      │
│  ✅ AWS CDK CLI v2                                                  │
│  ✅ AWS Account with IAM credentials                                │
│  ✅ Code Editor (VS Code recommended)                               │
│                                                                      │
│  OPTIONAL:                                                          │
│  ○ Docker (for containerized lambdas)                               │
│  ○ NestJS CLI (for NestJS projects)                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Install Node.js

### macOS (using Homebrew)

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js LTS
brew install node@18

# Or use nvm (recommended for multiple versions)
brew install nvm
nvm install 18
nvm use 18
```

### Windows

```powershell
# Download installer from https://nodejs.org
# Or use Chocolatey
choco install nodejs-lts

# Or use nvm-windows
# https://github.com/coreybutler/nvm-windows
```

### Linux (Ubuntu/Debian)

```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### Verify Installation

```bash
node --version   # Should output v18.x.x or higher
npm --version    # Should output v9.x.x or higher
```

---

## Step 2: Install AWS CLI v2

### macOS

```bash
# Using Homebrew
brew install awscli

# Or using pkg installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
rm AWSCLIV2.pkg
```

### Windows

```powershell
# Download and run installer from:
# https://awscli.amazonaws.com/AWSCLIV2.msi

# Or using Chocolatey
choco install awscli
```

### Linux

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip
```

### Verify Installation

```bash
aws --version
# aws-cli/2.x.x Python/3.x.x ...
```

---

## Step 3: Configure AWS Credentials

### Create IAM User

1. Go to **AWS Console** → **IAM** → **Users**
2. Click **Add users**
3. Enter username: `cdk-developer`
4. Select **Access key - Programmatic access**
5. Attach policy: `AdministratorAccess` (for learning) or custom policy
6. Download credentials (CSV)

### Configure AWS CLI

```bash
aws configure

# Enter your credentials:
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

### Verify Configuration

```bash
# Check identity
aws sts get-caller-identity

# Expected output:
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/cdk-developer"
}

# Quick test - list S3 buckets
aws s3 ls
```

### Using Multiple Profiles

```bash
# Configure named profile
aws configure --profile dev
aws configure --profile prod

# Use specific profile
export AWS_PROFILE=dev

# Or specify per command
aws s3 ls --profile dev
```

---

## Step 4: Install AWS CDK CLI

```bash
# Install CDK globally
npm install -g aws-cdk

# Verify installation
cdk --version
# 2.x.x (build xxxxxxx)

# Update CDK (when needed)
npm update -g aws-cdk
```

### CDK Commands Reference

```bash
cdk init        # Initialize new CDK project
cdk synth       # Synthesize CloudFormation template
cdk diff        # Compare with deployed stack
cdk deploy      # Deploy stack to AWS
cdk destroy     # Remove stack from AWS
cdk bootstrap   # Bootstrap CDK toolkit
cdk ls          # List all stacks in app
cdk doctor      # Check for potential problems
```

---

## Step 5: Bootstrap CDK

CDK Bootstrap creates required resources in your AWS account:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CDK BOOTSTRAP RESOURCES                          │
│                                                                      │
│  📦 S3 Bucket                                                       │
│     └── Stores Lambda code & CloudFormation templates               │
│                                                                      │
│  🐳 ECR Repository                                                  │
│     └── Stores Docker images (for containerized lambdas)           │
│                                                                      │
│  🔐 IAM Roles                                                       │
│     ├── CloudFormationExecutionRole                                 │
│     ├── DeploymentActionRole                                        │
│     ├── FilePublishingRole                                          │
│     └── ImagePublishingRole                                         │
│                                                                      │
│  📋 SSM Parameters                                                  │
│     └── Bootstrap version info                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Run Bootstrap

```bash
# Get your account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1

# Bootstrap CDK
cdk bootstrap aws://$ACCOUNT_ID/$REGION

# With named profile
cdk bootstrap aws://$ACCOUNT_ID/$REGION --profile dev

# Bootstrap multiple regions
cdk bootstrap aws://$ACCOUNT_ID/us-east-1 aws://$ACCOUNT_ID/eu-west-1
```

### Expected Output

```
⏳  Bootstrapping environment aws://123456789012/us-east-1...
✅  Environment aws://123456789012/us-east-1 bootstrapped
```

---

## Step 6: Create Your First CDK Project

### Initialize New Project

```bash
# Create project directory
mkdir my-cdk-app && cd my-cdk-app

# Initialize TypeScript CDK project
cdk init app --language typescript

# Project structure created:
# my-cdk-app/
# ├── bin/
# │   └── my-cdk-app.ts      # App entry point
# ├── lib/
# │   └── my-cdk-app-stack.ts # Stack definition
# ├── test/
# │   └── my-cdk-app.test.ts  # Tests
# ├── cdk.json                 # CDK configuration
# ├── package.json
# └── tsconfig.json
```

### Install Dependencies

```bash
npm install
```

### Deploy Your First Stack

```bash
# Synthesize (generate CloudFormation)
cdk synth

# View changes
cdk diff

# Deploy
cdk deploy

# Clean up
cdk destroy
```

---

## Step 7: VS Code Setup (Recommended)

### Install Extensions

1. **AWS Toolkit** - AWS resource explorer
2. **ESLint** - Code linting
3. **Prettier** - Code formatting
4. **TypeScript Hero** - TypeScript imports

### settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

---

## Step 8: Environment Variables

### Set CDK Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc

# AWS Account & Region
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=us-east-1

# Optional: Default profile
export AWS_PROFILE=dev

# Apply changes
source ~/.bashrc  # or source ~/.zshrc
```

### Using in CDK App

```typescript
// bin/app.ts
const app = new cdk.App();

new MyStack(app, 'MyStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

---

## Verification Script

Save and run this script to verify your setup:

```bash
#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           AWS CDK Development Environment Check              ║"
echo "╚══════════════════════════════════════════════════════════════╝"

echo ""
echo "📦 Node.js:"
node --version || echo "❌ Node.js not installed"

echo ""
echo "📦 npm:"
npm --version || echo "❌ npm not installed"

echo ""
echo "☁️  AWS CLI:"
aws --version || echo "❌ AWS CLI not installed"

echo ""
echo "🔧 AWS CDK:"
cdk --version || echo "❌ CDK not installed"

echo ""
echo "🔐 AWS Identity:"
aws sts get-caller-identity || echo "❌ AWS credentials not configured"

echo ""
echo "══════════════════════════════════════════════════════════════"

# Check versions
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ] 2>/dev/null; then
    echo "✅ Node.js version is 18+"
else
    echo "⚠️  Node.js should be v18+"
fi

CDK_VERSION=$(cdk --version 2>/dev/null | cut -d'.' -f1)
if [ "$CDK_VERSION" -ge 2 ] 2>/dev/null; then
    echo "✅ CDK version is 2.x"
else
    echo "⚠️  CDK should be v2.x"
fi

echo ""
echo "🎉 Setup verification complete!"
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `cdk: command not found` | Run `npm install -g aws-cdk` |
| `Unable to resolve credentials` | Run `aws configure` |
| `Bootstrap required` | Run `cdk bootstrap` |
| `Permission denied` | Check IAM user permissions |
| `Region not set` | Set `CDK_DEFAULT_REGION` env var |

### Reset CDK Bootstrap

```bash
# If bootstrap is corrupted, delete and re-run
aws cloudformation delete-stack --stack-name CDKToolkit
cdk bootstrap
```

### Check CDK Issues

```bash
cdk doctor
```

---

## Next Steps

After completing setup:

1. **Section 01** - Course Introduction & CDK Overview
2. **Section 02** - CDK Fundamentals (Constructs, Stacks, Apps)
3. **Section 03** - Serverless Architecture Design

```bash
# Start with demo project
cd packages/cdk-express-serverless
npm install
npm run local
```

---

## Quick Reference Card

```bash
# Daily Commands
aws configure                    # Setup credentials
cdk bootstrap                    # One-time setup
cdk synth                        # Generate template
cdk diff                         # Preview changes
cdk deploy                       # Deploy to AWS
cdk destroy                      # Remove from AWS

# Environment
export CDK_DEFAULT_ACCOUNT=xxx
export CDK_DEFAULT_REGION=us-east-1
export AWS_PROFILE=dev

# Useful
cdk ls                           # List stacks
cdk doctor                       # Check issues
aws sts get-caller-identity      # Verify credentials
```
