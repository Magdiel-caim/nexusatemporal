import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error-handler';
import { UserRole } from '@/modules/auth/user.entity';
import { CrmDataSource } from '@/database/data-source';
import { User } from '@/modules/auth/user.entity';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        name?: string;
        role: UserRole;
        tenantId?: string | null;
        permissions?: string[] | null;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // Optionally verify user still exists and is active
    const userRepository = CrmDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload.userId },
      select: ['id', 'email', 'name', 'role', 'status', 'tenantId', 'permissions'],
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('User account is not active', 403);
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.permissions || [],
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError('You do not have permission to access this resource', 403));
    }

    next();
  };
};

export const checkPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Super admin has all permissions
    if (user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (!user.permissions || !user.permissions.includes(permission)) {
      return next(new AppError('You do not have the required permission', 403));
    }

    next();
  };
};
