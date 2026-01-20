# Serverless Workshop

A comprehensive collection of Serverless Framework examples for AWS Lambda, API Gateway, DynamoDB, S3, SNS, and SQS.

This is a **pnpm workspace** containing multiple serverless projects for learning and reference.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- AWS CLI configured with credentials

## Setup

```bash
# Install all dependencies across workspace
pnpm install
```

## Projects

### TypeScript Projects (in `packages/`)

All TypeScript projects use **ESBuild** for fast bundling (no webpack).

| Project                        | Description                                             |
| ------------------------------ | ------------------------------------------------------- |
| `sls-rest-api-typescript`      | REST API with TypeScript, ESBuild, and Middy middleware |
| `sls-dynamodb-crud-typescript` | CRUD API with DynamoDB and AWS SDK v3                   |
| `sls-nestjs-serverless`        | NestJS app as single Lambda with serverless-express     |

### JavaScript Example Projects (in `packages/`)

| Project                               | Description                          |
| ------------------------------------- | ------------------------------------ |
| `aws-node-fetch-file-and-store-in-s3` | Fetch files from URL and store in S3 |
| `aws-node-rest-api-mongodb`           | REST API with MongoDB                |
| `aws-node-rest-api-with-dynamodb`     | REST API with DynamoDB               |
| `blog-serverless-backend-nodejs`      | Express.js serverless backend        |
| `lambda-nodejs`                       | Basic Lambda with Node.js            |
| `serverless-authorizers`              | API Gateway authorizers              |
| `serverless-aws-node-sns`             | SNS message processing               |
| `sls-sqs-triggers`                    | SQS triggered Lambda                 |
| `thumb-generator`                     | S3 thumbnail generator               |

## Workspace Commands

```bash
# Build all projects
pnpm build

# Run tests across all projects
pnpm test

# Clean all node_modules and build artifacts
pnpm clean
```

## Individual Project Commands

```bash
# Navigate to a project
cd packages/sls-rest-api-typescript

# Start local development
pnpm offline

# Deploy to AWS
pnpm deploy:dev
```

## Use Cases

- API for Web Applications
- API for Mobile Applications
- Event-driven architectures
- File processing pipelines
- Message queue processing

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service…
Serverless: Uploading CloudFormation file to S3…
Serverless: Uploading service .zip file to S3…
Serverless: Updating Stack…
Serverless: Checking Stack update progress…
Serverless: Stack update finished…

Service Information
service: serverless-rest-api-with-dynamodb
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  POST - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/dev/todos
  GET - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/dev/todos
  GET - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  PUT - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  DELETE - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
functions:
  serverless-rest-api-with-dynamodb-dev-update: arn:aws:lambda:us-east-1:488110005556:function:serverless-rest-api-with-dynamodb-dev-update
  serverless-rest-api-with-dynamodb-dev-get: arn:aws:lambda:us-east-1:488110005556:function:serverless-rest-api-with-dynamodb-dev-get
  serverless-rest-api-with-dynamodb-dev-list: arn:aws:lambda:us-east-1:488110005556:function:serverless-rest-api-with-dynamodb-dev-list
  serverless-rest-api-with-dynamodb-dev-create: arn:aws:lambda:us-east-1:488110005556:function:serverless-rest-api-with-dynamodb-dev-create
  serverless-rest-api-with-dynamodb-dev-delete: arn:aws:lambda:us-east-1:488110005556:function:serverless-rest-api-with-dynamodb-dev-delete
```

## Usage

You can create, retrieve, update, or delete todos with the following commands:

### Create a Todo

```bash
curl -X POST https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos --data '{ "text": "Learn Serverless" }'
```

Example Result:

```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":false,"updatedAt":1479138570824}%
```

### List all Todos

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos
```

Example output:

```bash
[{"text":"Deploy my first service","id":"ac90feaa11e6-9ede-afdfa051af86","checked":true,"updatedAt":1479139961304},{"text":"Learn Serverless","id":"206793aa11e6-9ede-afdfa051af86","createdAt":1479139943241,"checked":false,"updatedAt":1479139943241}]%
```

### Get one Todo

```bash
# Replace the <id> part with a real id from your todos table
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/<id>
```

Example Result:

```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":false,"updatedAt":1479138570824}%
```

### Update a Todo

```bash
# Replace the <id> part with a real id from your todos table
curl -X PUT https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/<id> --data '{ "text": "Learn Serverless", "checked": true }'
```

Example Result:

```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":true,"updatedAt":1479138570824}%
```

### Delete a Todo

```bash
# Replace the <id> part with a real id from your todos table
curl -X DELETE https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/<id>
```

No output

## Scaling

### AWS Lambda

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).

### DynamoDB

When you create a table, you specify how much provisioned throughput capacity you want to reserve for reads and writes. DynamoDB will reserve the necessary resources to meet your throughput needs while ensuring consistent, low-latency performance. You can change the provisioned throughput and increasing or decreasing capacity as needed.

This is can be done via settings in the `serverless.yml`.

```yaml
ProvisionedThroughput:
  ReadCapacityUnits: 1
  WriteCapacityUnits: 1
```

In case you expect a lot of traffic fluctuation we recommend to checkout this guide on how to auto scale DynamoDB [https://aws.amazon.com/blogs/aws/auto-scale-dynamodb-with-dynamic-dynamodb/](https://aws.amazon.com/blogs/aws/auto-scale-dynamodb-with-dynamic-dynamodb/)

### Serverless Offline

install offline modules

```json
 "dependencies": {
    "uuid": "^2.0.3"
  },
  "devDependencies": {
    "serverless-dynamodb-local": "^0.2.39",
    "serverless-offline": "^6.8.0"
  }
```

### Add Plugin in serverless.yml

```yml
plugins:
  - serverless-dynamodb-local
  - serverless-offline
custom:
  dynamodb:
    stages:
      - ${self:provider.stage}
    start:
      port: 8000
      inMemory: true
      migrate: true # create tables on start
```

### Finally Start application offline

```
➜ serverless offline start
Serverless: To ensure safe major version upgrades ensure "frameworkVersion" setting in service configuration (recommended setup: "frameworkVersion: ^2.28.0")

Serverless: Load command interactiveCli
Serverless: Load command config
Serverless: Load command config:credentials
Serverless: Load command config:tabcompletion
Serverless: Load command config:tabcompletion:install
Serverless: Load command config:tabcompletion:uninstall

h-dynamodb-dev-update/invoke-async/
* POST http://localhost:3002/2014-11-13/functions/serverless-rest-api-with-dynamodb-dev-delete/invoke-async/

   ┌────────────────────────────────────────────────────────────────────────────┐
   │                                                                            │
   │   POST   | http://localhost:3000/dev/todos                                 │
   │   POST   | http://localhost:3000/2015-03-31/functions/create/invocations   │
   │   GET    | http://localhost:3000/dev/todos                                 │
   │   POST   | http://localhost:3000/2015-03-31/functions/list/invocations     │
   │   GET    | http://localhost:3000/dev/todos/{id}                            │
   │   POST   | http://localhost:3000/2015-03-31/functions/get/invocations      │
   │   PUT    | http://localhost:3000/dev/todos/{id}                            │
   │   POST   | http://localhost:3000/2015-03-31/functions/update/invocations   │
   │   DELETE | http://localhost:3000/dev/todos/{id}                            │
   │   POST   | http://localhost:3000/2015-03-31/functions/delete/invocations   │
   │                                                                            │
   └────────────────────────────────────────────────────────────────────────────┘

offline: [HTTP] server ready: http://localhost:3000 🚀
offline:
offline: Enter "rp" to replay the last request
```
