export interface User {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
  user_id?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}
