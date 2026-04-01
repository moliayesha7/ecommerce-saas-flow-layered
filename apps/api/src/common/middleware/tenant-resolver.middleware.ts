import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Resolve tenantId from header or JWT (JWT parsing done in guard)
    const tenantId = req.headers['x-tenant-id'] as string;
    if (tenantId) {
      req.tenantId = tenantId;
    }
    next();
  }
}
