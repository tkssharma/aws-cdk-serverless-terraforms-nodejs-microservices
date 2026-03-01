# SECTION 6 – DynamoDB with CDK (Real Data Modeling)

---

## Lecture 11: DynamoDB Fundamentals for Developers

### When to Use DynamoDB

| Use DynamoDB When           | Avoid DynamoDB When      |
| --------------------------- | ------------------------ |
| High scale needed           | Complex joins required   |
| Predictable access patterns | Ad-hoc queries needed    |
| Key-value or document data  | Strong ACID transactions |
| Single-digit ms latency     | Relational data model    |
| Serverless architecture     | Unknown access patterns  |

### Key Concepts

```
┌─────────────────────────────────────────────────────────────┐
│                      DynamoDB Table                          │
│                                                              │
│  ┌──────────────┬──────────────┬────────────────────────┐  │
│  │ Partition Key│   Sort Key   │       Attributes       │  │
│  │    (PK)      │    (SK)      │                        │  │
│  ├──────────────┼──────────────┼────────────────────────┤  │
│  │   USER#123   │  PROFILE     │  { name, email, ... }  │  │
│  │   USER#123   │  ORDER#001   │  { total, items, ... } │  │
│  │   USER#123   │  ORDER#002   │  { total, items, ... } │  │
│  │   USER#456   │  PROFILE     │  { name, email, ... }  │  │
│  └──────────────┴──────────────┴────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

PK = How data is distributed (partitioned)
SK = How data is sorted within a partition
```

### Access Patterns

```
Query by PK:           Get all items for USER#123
Query by PK + SK:      Get ORDER#001 for USER#123
Query by PK + SK prefix: Get all ORDERs for USER#123
Scan:                  Get ALL items (expensive, avoid!)
```

---

## Lecture 12: DynamoDB with CDK + Express

### Create Table

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

const usersTable = new dynamodb.Table(this, 'UsersTable', {
  tableName: `users-${stage}`,
  partitionKey: {
    name: 'user_id',
    type: dynamodb.AttributeType.STRING,
  },
  sortKey: {
    name: 'sk',
    type: dynamodb.AttributeType.STRING,
  },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  pointInTimeRecovery: true,
  stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
});
```

### Global Secondary Index (GSI)

```typescript
usersTable.addGlobalSecondaryIndex({
  indexName: 'email-index',
  partitionKey: {
    name: 'email',
    type: dynamodb.AttributeType.STRING,
  },
  projectionType: dynamodb.ProjectionType.ALL,
});
```

### Grant Permissions

```typescript
// Grant Lambda read/write access
usersTable.grantReadWriteData(lambda);

// Pass table name to Lambda
environment: {
  USERS_TABLE: usersTable.tableName,
}
```

---

## 6.3 DynamoDB Operations in Node.js

### Setup Client

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.USERS_TABLE;
```

### CRUD Operations

```typescript
// CREATE
await docClient.send(
  new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      user_id: 'USER#123',
      sk: 'PROFILE',
      name: 'John Doe',
      email: 'john@example.com',
      created_at: Date.now(),
    },
  }),
);

// READ (single item)
const result = await docClient.send(
  new GetCommand({
    TableName: TABLE_NAME,
    Key: { user_id: 'USER#123', sk: 'PROFILE' },
  }),
);

// QUERY (multiple items)
const orders = await docClient.send(
  new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'user_id = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': 'USER#123',
      ':sk': 'ORDER#',
    },
  }),
);

// UPDATE
await docClient.send(
  new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { user_id: 'USER#123', sk: 'PROFILE' },
    UpdateExpression: 'SET #name = :name',
    ExpressionAttributeNames: { '#name': 'name' },
    ExpressionAttributeValues: { ':name': 'Jane Doe' },
  }),
);

// DELETE
await docClient.send(
  new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { user_id: 'USER#123', sk: 'PROFILE' },
  }),
);
```

---

## 6.4 Single-Table Design

```
┌────────────────────────────────────────────────────────────────┐
│  PK           │  SK              │  Data                       │
├────────────────────────────────────────────────────────────────┤
│  USER#123     │  PROFILE         │  {name, email, avatar}      │
│  USER#123     │  ORDER#2024-001  │  {total, status, items}     │
│  USER#123     │  ORDER#2024-002  │  {total, status, items}     │
│  ORDER#2024-001│ META            │  {user_id, created_at}      │
│  PRODUCT#ABC  │  INFO            │  {name, price, stock}       │
└────────────────────────────────────────────────────────────────┘

Access Patterns:
- Get user profile: PK=USER#123, SK=PROFILE
- Get user's orders: PK=USER#123, SK begins_with ORDER#
- Get order details: PK=ORDER#2024-001
```

---

## Hands-On Lab 6.1

See `demo/` folder for DynamoDB CRUD example.
