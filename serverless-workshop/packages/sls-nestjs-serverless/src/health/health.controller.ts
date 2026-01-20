import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check(): { status: string; timestamp: string; environment: string } {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    };
  }
}
