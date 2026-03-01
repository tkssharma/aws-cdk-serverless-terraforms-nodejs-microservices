import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    'cognito:username': string;
    'custom:tenant_id'?: string;
    'custom:role'?: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // In Lambda with API Gateway Cognito Authorizer, 
  // user claims are passed in the request context
  const claims = (req as any).requestContext?.authorizer?.claims;
  
  if (!claims) {
    // For local development or if no authorizer is configured
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header' 
      });
    }
    
    // In production, this would be verified by API Gateway Cognito Authorizer
    // For local dev, you can decode the JWT here (not recommended for production)
    console.warn('Auth header present but no claims from authorizer - running locally?');
    next();
    return;
  }
  
  req.user = {
    sub: claims.sub,
    email: claims.email,
    'cognito:username': claims['cognito:username'],
    'custom:tenant_id': claims['custom:tenant_id'],
    'custom:role': claims['custom:role'],
  };
  
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.['custom:role'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};
