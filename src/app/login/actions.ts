'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authenticate, AuthenticationError } from '@/services/authService';

const getSafeNext = (value: FormDataEntryValue | null) => {
  const next = String(value ?? '/');
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
};

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = getSafeNext(formData.get('next'));
  let account: Awaited<ReturnType<typeof authenticate>>;

  try {
    account = await authenticate(email, password);
  } catch (error) {
    const errorType = error instanceof AuthenticationError
      && (error.status === 401 || error.status === 403)
      ? 'credentials'
      : 'server';
    redirect('/login?error=' + errorType + '&next=' + encodeURIComponent(next));
  }

  if (next.startsWith('/seller') && account.role !== 'seller') {
    redirect('/login?reason=seller');
  }

  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  };
  cookieStore.set('dropdeal_role', account.role, options);
  cookieStore.set('dropdeal_name', encodeURIComponent(account.name), options);
  if (account.accessToken) cookieStore.set('dropdeal_access_token', account.accessToken, options);
  redirect(next);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('dropdeal_role');
  cookieStore.delete('dropdeal_name');
  cookieStore.delete('dropdeal_access_token');
  redirect('/');
}
