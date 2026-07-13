import 'server-only';

import type { UserRole } from '@/lib/auth';
import { resolveApiUrl } from '@/services/runtime';

export class AuthenticationError extends Error {
  constructor(public readonly status?: number) {
    super('Authentication failed');
    this.name = 'AuthenticationError';
  }
}

export type AuthenticatedUser = {
  role: UserRole;
  name: string;
  accessToken?: string;
};

type LoginResponse = {
  data: {
    role: string;
    name: string;
    accessToken?: string;
  };
};

export const authenticate = async (email: string, password: string): Promise<AuthenticatedUser> => {
  let response: Response;

  try {
    response = await fetch(resolveApiUrl('/api/v1/auth/login'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch {
    throw new AuthenticationError();
  }

  if (!response.ok) throw new AuthenticationError(response.status);

  const result = await response.json() as LoginResponse;
  const role = result.data.role.toLowerCase();

  if ((role !== 'buyer' && role !== 'seller') || !result.data.name.trim()) {
    throw new AuthenticationError();
  }

  return {
    role,
    name: result.data.name,
    accessToken: result.data.accessToken,
  };
};
