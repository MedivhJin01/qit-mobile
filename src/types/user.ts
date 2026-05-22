export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  profilePicUrl?: string;
  authProvider: 'EMAIL' | 'GOOGLE';
  createdAt: string;
}
