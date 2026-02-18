export const COOKIE_NAME = 'app_session_id';
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
    id: number;
    openId: string;
    appId: string;
    name: string;
    role: string;
    email?: string; // Added for easier access
}
