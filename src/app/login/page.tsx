'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import { Lock, User, ArrowRight, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const justRegistered = searchParams.get('registered') === '1';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#FFF6EF', color: '#2A0A22' }}>
      <div className="max-w-md w-full space-y-6">

        {/* Brand */}
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)', boxShadow: '0 8px 24px rgba(225,29,116,0.25)' }}
          >
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-1" style={{ color: '#2A0A22' }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: '#2A0A22', opacity: 0.6 }}>
            Login to your <span className="font-semibold" style={{ color: '#E11D74' }}>The Curio Shelf</span> account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border shadow-sm p-7" style={{ borderColor: '#FFE9DD' }}>

          {justRegistered && !error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Account created successfully! Please login with your credentials.</p>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#2A0A22' }}>
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#2A0A22', opacity: 0.35 }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-[#E11D74] focus:ring-2 focus:ring-[#E11D74]/10 focus:bg-white transition-all placeholder:text-gray-400"
                  style={{ borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' }}
                  placeholder="Enter username or email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wide" style={{ color: '#2A0A22' }}>
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: '#E11D74' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#2A0A22', opacity: 0.35 }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-[#E11D74] focus:ring-2 focus:ring-[#E11D74]/10 focus:bg-white transition-all placeholder:text-gray-400"
                  style={{ borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' }}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Logging in...</>
              ) : (
                <>Login to The Curio Shelf <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#FFE9DD' }} />
            <span className="text-xs font-medium" style={{ color: '#2A0A22', opacity: 0.4 }}>New to The Curio Shelf?</span>
            <div className="flex-1 h-px" style={{ background: '#FFE9DD' }} />
          </div>

          <Link
            href={`/register${redirectTo !== '/dashboard' ? `?redirect=${redirectTo}` : ''}`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all hover:bg-[#FFE9DD]"
            style={{ borderColor: 'rgba(42,10,34,0.2)', color: '#2A0A22' }}
          >
            Create an Account
          </Link>
        </div>

        <p className="text-center text-xs" style={{ color: '#2A0A22', opacity: 0.5 }}>
          By logging in, you agree to our{' '}
          <Link href="/terms-and-conditions" className="hover:underline" style={{ color: '#E11D74', opacity: 1 }}>Terms & Conditions</Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="hover:underline" style={{ color: '#E11D74', opacity: 1 }}>Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}
