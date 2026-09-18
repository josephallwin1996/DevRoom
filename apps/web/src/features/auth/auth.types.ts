import type { User } from '@devroom/shared';

export interface AuthResponse {
  accessToken: string;
  user: User;
}