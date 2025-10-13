import { UserRole } from '@/modules/auth/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        name: string;
        role: UserRole;
        tenantId?: string | null;
        permissions: string[];
      };
    }
  }
}

export {};
