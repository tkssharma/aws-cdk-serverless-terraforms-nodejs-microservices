# SECTION 9 – Advanced CDK Patterns & Security

---

## Lecture 17: IAM Best Practices in CDK

### Least Privilege Principle

```typescript
// ❌ BAD - Too permissive
lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['dynamodb:*'],
    resources: ['*'],
  }),
);

// ✅ GOOD - Specific permissions
table.grantReadWriteData(lambda);

// ✅ GOOD - Custom fine-grained
lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
    resources: [table.tableArn],
  }),
);
```

### Managed vs Inline Policies

```typescript
// Managed Policy (reusable)
const policy = new iam.ManagedPolicy(this, 'ApiPolicy', {
  managedPolicyName: `api-policy-${stage}`,
  statements: [
    new iam.PolicyStatement({
      actions: ['logs:*'],
      resources: ['*'],
    }),
  ],
});

// Attach to role
lambda.role?.addManagedPolicy(policy);

// Inline Policy (embedded in role)
lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['s3:GetObject'],
    resources: [bucket.arnForObjects('*')],
  }),
);
```

### Debugging Permission Issues

```bash
# Check CloudWatch Logs for AccessDenied errors

# Common issues:
# 1. Missing resource ARN
# 2. Wrong action name
# 3. Condition mismatch
# 4. Trust policy missing
```

---

## Lecture 18: CDK Reusable Constructs

### Custom Construct Pattern

```typescript
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export interface ApiLambdaProps {
  stage: string;
  functionName: string;
  entry: string;
  environment?: Record<string, string>;
}

export class ApiLambdaConstruct extends Construct {
  public readonly lambda: lambda.Function;
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiLambdaProps) {
    super(scope, id);

    // Create Lambda
    this.lambda = new NodejsFunction(this, 'Function', {
      functionName: `${props.functionName}-${props.stage}`,
      entry: props.entry,
      environment: props.environment,
    });

    // Create API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `${props.functionName}-api-${props.stage}`,
    });

    // Connect them
    this.api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(this.lambda),
    });
  }
}
```

### Using the Construct

```typescript
const usersApi = new ApiLambdaConstruct(this, 'UsersApi', {
  stage: 'dev',
  functionName: 'users',
  entry: './src/users/lambda.ts',
  environment: {
    TABLE_NAME: usersTable.tableName,
  },
});

// Grant permissions
usersTable.grantReadWriteData(usersApi.lambda);
```

---

## 9.3 Shared Infrastructure Modules

### Project Structure

```
packages/
├── constructs/              # Shared constructs
│   ├── api-lambda/
│   ├── dynamodb-table/
│   └── s3-bucket/
├── stacks/                  # Stack definitions
│   ├── api-stack.ts
│   └── database-stack.ts
└── services/                # Business logic
    ├── users/
    └── orders/
```

### Cross-Stack References

```typescript
// Database Stack (exports)
export class DatabaseStack extends cdk.Stack {
  public readonly usersTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.usersTable = new dynamodb.Table(this, 'Users', {
      // ...
    });
  }
}

// API Stack (imports)
interface ApiStackProps extends cdk.StackProps {
  usersTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, 'Handler', {
      environment: {
        TABLE_NAME: props.usersTable.tableName,
      },
    });

    props.usersTable.grantReadWriteData(lambda);
  }
}

// App.ts (wire them together)
const dbStack = new DatabaseStack(app, 'Database');
const apiStack = new ApiStack(app, 'Api', {
  usersTable: dbStack.usersTable,
});
```

---

## 9.4 CDK Aspects

### Tagging All Resources

```typescript
import { Aspects, Tag } from 'aws-cdk-lib';

// Apply tags to all resources in stack
Aspects.of(stack).add(new Tag('Environment', stage));
Aspects.of(stack).add(new Tag('Project', 'my-app'));
Aspects.of(stack).add(new Tag('ManagedBy', 'CDK'));
```

### Custom Aspect for Compliance

```typescript
import { IAspect, Annotations } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';

class BucketEncryptionChecker implements IAspect {
  visit(node: IConstruct) {
    if (node instanceof s3.CfnBucket) {
      if (!node.bucketEncryption) {
        Annotations.of(node).addError('Bucket must have encryption enabled');
      }
    }
  }
}

Aspects.of(stack).add(new BucketEncryptionChecker());
```

---

## 9.5 Testing CDK

### Snapshot Testing

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MyStack } from '../lib/my-stack';

test('Snapshot test', () => {
  const app = new cdk.App();
  const stack = new MyStack(app, 'TestStack', { stage: 'test' });
  const template = Template.fromStack(stack);

  expect(template.toJSON()).toMatchSnapshot();
});
```

### Fine-Grained Assertions

```typescript
test('DynamoDB table created with correct properties', () => {
  const app = new cdk.App();
  const stack = new MyStack(app, 'TestStack', { stage: 'test' });
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::DynamoDB::Table', {
    TableName: 'users-test',
    BillingMode: 'PAY_PER_REQUEST',
  });
});

test('Lambda has correct environment variables', () => {
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        STAGE: 'test',
      },
    },
  });
});
```

---

## Hands-On Lab 9.1

Build a reusable API + Lambda + DynamoDB construct.

See `demo/` folder for complete example.
