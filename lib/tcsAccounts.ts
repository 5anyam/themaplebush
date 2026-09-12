// lib/tcsAccounts.ts
//
// Server-only helper for talking to the "Customer Accounts" WordPress plugin.
//
// The session token lives in an httpOnly cookie, so page scripts can never read
// it and it cannot be forged the way the old plain `user` cookie could. Every
// call that needs identity goes through here, from a route handler.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const WP_BASE = (process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://cms.thecurioshelf.com').replace(/\/$/, '');
const API = `${WP_BASE}/wp-json/tcsauth/v1`;

export const SESSION_COOKIE = 'tcs_session';

export interface AccountUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  billing: Record<string, string>;
}

export interface OrderLineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  slug: string;
  image: string;
}

export interface TimelineEvent {
  key: string;
  label: string;
  description: string;
  date: string;
}

export interface AccountOrder {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  subtotal: string;
  shipping_total: string;
  discount_total: string;
  payment_method: string;
  payment_method_title: string;
  date_created: string;
  date_modified: string;
  item_count: number;
  can_cancel: boolean;
  line_items: OrderLineItem[];
  billing?: Record<string, string>;
  shipping?: Record<string, string>;
  timeline?: TimelineEvent[];
}

export class AccountsError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Read the WordPress error shape, falling back to something presentable. */
async function parseError(res: Response, fallback: string): Promise<AccountsError> {
  let message = fallback;
  try {
    const body = await res.json();
    if (typeof body?.message === 'string' && body.message) message = body.message;
  } catch {
    /* non-JSON error body */
  }
  return new AccountsError(message, res.status);
}

/** Call the plugin. Pass a token for endpoints that need identity. */
async function call<T>(
  path: string,
  { method = 'GET', body, token }: { method?: string; body?: unknown; token?: string } = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    // Some hosts strip Authorization; the plugin accepts this fallback too.
    headers['X-TCS-Token'] = token;
  }

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new AccountsError('Could not reach the store right now. Please try again.', 503);
  }

  if (res.status === 404) {
    // The plugin route is missing entirely — worth saying plainly rather than
    // surfacing a generic "not found" to a shopper.
    const text = await res.clone().text();
    if (text.includes('rest_no_route')) {
      throw new AccountsError(
        'Accounts are not set up on the store yet. Please install the Customer Accounts plugin.',
        503
      );
    }
  }

  if (!res.ok) throw await parseError(res, 'Something went wrong. Please try again.');

  return (await res.json()) as T;
}

/* ── Endpoint wrappers ─────────────────────────────────────────────────── */

export const accounts = {
  register: (data: {
    email: string; password: string;
    first_name?: string; last_name?: string; phone?: string; username?: string;
  }) => call<{ token: string; expires: number; user: AccountUser; linked_orders: number }>('/register', { method: 'POST', body: data }),

  login: (username: string, password: string) =>
    call<{ token: string; expires: number; user: AccountUser }>('/login', { method: 'POST', body: { username, password } }),

  me: (token: string) => call<{ user: AccountUser }>('/me', { token }),

  updateMe: (token: string, data: Record<string, string>) =>
    call<{ user: AccountUser }>('/me', { method: 'POST', body: data, token }),

  orders: (token: string, page = 1, perPage = 20) =>
    call<{ orders: AccountOrder[]; total: number; pages: number; page: number }>(
      `/orders?page=${page}&per_page=${perPage}`, { token }
    ),

  order: (token: string, id: number) => call<{ order: AccountOrder }>(`/orders/${id}`, { token }),

  cancelOrder: (token: string, id: number, reason: string) =>
    call<{ order: AccountOrder }>(`/orders/${id}/cancel`, { method: 'POST', body: { reason }, token }),

  linkOrders: (token: string) => call<{ linked: number }>('/link-orders', { method: 'POST', token }),

  forgotPassword: (email: string) =>
    call<{ sent: boolean; message: string }>('/forgot-password', { method: 'POST', body: { email } }),
};

/* ── Session cookie ────────────────────────────────────────────────────── */

/** The current session token, or null when signed out. */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Attach the session cookie to a response.
 *
 * httpOnly so scripts (and any XSS) cannot read it, sameSite lax so it still
 * rides along on normal navigations back from Razorpay.
 */
export function setSessionCookie(res: NextResponse, token: string, expires: number) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expires * 1000),
  });
  return res;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}

/** Turn a thrown error into the JSON shape the client expects. */
export function errorResponse(err: unknown) {
  const status = err instanceof AccountsError ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  return NextResponse.json({ success: false, message }, { status });
}
