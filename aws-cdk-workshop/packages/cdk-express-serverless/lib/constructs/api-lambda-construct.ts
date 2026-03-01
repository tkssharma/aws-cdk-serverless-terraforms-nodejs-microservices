import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface ApiLambdaConstructProps {
  stage: string;
  functionName: string;
  entry: string;
  handler?: string;
  memorySize?: number;
  timeout?: cdk.Duration;
  environment?: { [key: string]: string };
  apiName?: string;
  description?: string;
}

export class ApiLambdaConstruct extends Construct {
  public readonly lambda: NodejsFunction;
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiLambdaConstructProps) {
    super(scope, id);

    const {
      stage,
      functionName,
      entry,
      handler = 'handler',
      memorySize = 1024,
      timeout = cdk.Duration.seconds(30),
      environment = {},
      apiName,
      description,
    } = props;

    // Lambda Function
    this.lambda = new NodejsFunction(this, 'Function', {
      functionName: `${functionName}-${stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler,
      entry,
      memorySize,
      timeout,
      environment: {
        STAGE: stage,
        NODE_ENV: stage === 'prod' ? 'production' : 'development',
        ...environment,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      bundling: {
        minify: stage === 'prod',
        sourceMap: true,
        target: 'node20',
      },
    });

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: apiName || `${functionName}-api-${stage}`,
      description: description || `API for ${functionName}`,
      deployOptions: {
        stageName: stage,
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Lambda Integration
    const integration = new apigateway.LambdaIntegration(this.lambda, {
      proxy: true,
    });

    // Proxy all requests
    this.api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });

    this.api.root.addMethod('ANY', integration);
  }
}
