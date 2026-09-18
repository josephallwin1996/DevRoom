import type { Timestamp, UserId } from './ids';
export interface User {
    id: UserId;
    username: string;
    email: string;
    avatarUrl: string | null;
    createdAt: Timestamp;
}
export interface UserSummary {
    id: UserId;
    username: string;
    avatarUrl: string | null;
}
