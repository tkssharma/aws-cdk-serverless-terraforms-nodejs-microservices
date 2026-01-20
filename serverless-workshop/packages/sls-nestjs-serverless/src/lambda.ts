import serverlessExpress from "@codegenie/serverless-express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { Context, Handler } from "aws-lambda";
import express from "express";
import { AppModule } from "./app.module";

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp)
    );

    nestApp.enableCors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      credentials: true,
    });

    await nestApp.init();

    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer;
}

export const handler: Handler = async (event: unknown, context: Context) => {
  const server = await bootstrap();
  return server(event, context, () => { });
};
