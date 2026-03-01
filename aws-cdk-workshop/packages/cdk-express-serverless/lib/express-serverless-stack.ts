import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface ExpressServerlessStackProps extends cdk.StackProps {
  stage: string;
}

export class ExpressServerlessStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly usersTable: dynamodb.Table;
  public readonly uploadsBucket: s3.Bucket;
  public readonly expressLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: ExpressServerlessStackProps) {
    super(scope, id, props);

    const { stage } = props;

    // ============================================
    // SECTION 6: DynamoDB Table
    // ============================================
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: `express-users-${stage}`,
      partitionKey: { 
        name: 'user_id', 
        type: dynamodb.AttributeType.STRING 
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // GSI for email lookup
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: { 
        name: 'email', 
        type: dynamodb.AttributeType.STRING 
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ============================================
    // SECTION 8: S3 Bucket for uploads
    // ============================================
    this.uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
      bucketName: `express-uploads-${stage}-${this.account}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // ============================================
    // SECTION 4 & 5: Express Lambda with Serverless Express
    // ============================================
    this.expressLambda = new NodejsFunction(this, 'ExpressLambda', {
      functionName: `express-api-${stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '..', 'src', 'lambda.ts'),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        STAGE: stage,
        USERS_TABLE: this.usersTable.tableName,
        UPLOADS_BUCKET: this.uploadsBucket.bucketName,
        NODE_ENV: stage === 'prod' ? 'production' : 'development',
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        externalModules: [],
      },
    });

    // Grant Lambda access to DynamoDB and S3
    this.usersTable.grantReadWriteData(this.expressLambda);
    this.uploadsBucket.grantReadWrite(this.expressLambda);

    // ============================================
    // SECTION 4: API Gateway REST API
    // ============================================
    this.api = new apigateway.RestApi(this, 'ExpressApi', {
      restApiName: `express-api-${stage}`,
      description: `Express Serverless API - ${stage}`,
      deployOptions: {
        stageName: stage,
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Lambda Integration with proxy
    const lambdaIntegration = new apigateway.LambdaIntegration(this.expressLambda, {
      proxy: true,
    });

    // Proxy all requests to Express Lambda
    this.api.root.addProxy({
      defaultIntegration: lambdaIntegration,
      anyMethod: true,
    });

    // Also handle root path
    this.api.root.addMethod('ANY', lambdaIntegration);

    // ============================================
    // Outputs
    // ============================================
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url,
      description: 'API Gateway endpoint URL',
      exportName: `${stage}-express-api-url`,
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: this.usersTable.tableName,
      description: 'DynamoDB Users Table Name',
      exportName: `${stage}-users-table-name`,
    });

    new cdk.CfnOutput(this, 'UploadsBucketName', {
      value: this.uploadsBucket.bucketName,
      description: 'S3 Uploads Bucket Name',
      exportName: `${stage}-uploads-bucket-name`,
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: this.expressLambda.functionArn,
      description: 'Express Lambda Function ARN',
      exportName: `${stage}-express-lambda-arn`,
    });
  }
}
