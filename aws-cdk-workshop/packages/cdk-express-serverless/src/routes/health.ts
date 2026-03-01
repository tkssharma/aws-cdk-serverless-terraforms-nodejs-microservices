import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.STAGE || 'local',
    region: process.env.AWS_REGION || 'local'
  });
});

router.get('/ready', (req: Request, res: Response) => {
  res.json({
    ready: true,
    services: {
      dynamodb: 'connected',
      s3: 'connected'
    }
  });
});

export { router as healthRouter };
