import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

export function roleMiddleware(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('未认证');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`需要以下角色之一: ${roles.join(', ')}`);
    }
    next();
  };
}
