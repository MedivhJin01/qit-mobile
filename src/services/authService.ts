import { BASE_URL } from '../constants/api';
import { User } from '../types/user';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  verified: boolean;
  message?: string;
}

export function buildUserFromToken(token: string, email: string): User {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    id: Number(payload.sub),
    username: '',
    email,
    authProvider: 'EMAIL',
    createdAt: '',
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authProvider: 'EMAIL', email, password }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Login failed');
    throw new Error(msg);
  }
  return res.json();
}

export async function register(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Registration failed');
    throw new Error(msg);
  }
  return res.text();
}

export async function verifyOtp(registrationToken: string, otp: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/users/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationToken, otp }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Verification failed');
    throw new Error(msg);
  }
  return res.json();
}

export async function resendOtp(registrationToken: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/resent-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationToken),
  });
  if (!res.ok) throw new Error('Failed to resend OTP');
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  });
  if (!res.ok) throw new Error('Failed to send reset email');
}
