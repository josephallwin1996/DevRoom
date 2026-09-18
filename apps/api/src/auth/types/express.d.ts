import type { AuthenticatedUser } from '../auth/types/authenticated-request';

declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser;
    }
  }
}

export {};