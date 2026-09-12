'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Could not send the reset link.');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#FFF6EF', color: '#2A0A22' }}>
      <div className="max-w-md w-full">

        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#FF8A3D,#E11D74)' }}>
            <Mail className="w-6 h-6 text-white" strokeWidth={1.9} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1.5">Reset your password</h1>
          <p className="text-sm" style={{ color: 'rgba(42,10,34,.55)' }}>
            We&apos;ll email you a link to set a new one.
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#FFE9DD' }}>
          {sent ? (
            <div className="text-center py-3">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-500" strokeWidth={1.6} />
              <h2 className="font-serif text-lg font-bold mb-1.5">Check your inbox</h2>
              <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: 'rgba(42,10,34,.6)' }}>
                If <span className="font-semibold" style={{ color: '#2A0A22' }}>{email}</span> has an account,
                a reset link is on its way. It can take a minute — do check spam.
              </p>
              <Link href="/login" className="mag-btn text-[14px] px-7 py-3.5">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(42,10,34,.55)' }}>
                  Email address
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none focus:border-[#E11D74] focus:ring-2 focus:ring-[#E11D74]/10 transition-all"
                  style={{ borderColor: '#FFE9DD', background: '#FFF6EF' }}
                />
              </label>

              {error && (
                <p className="text-[13px] flex items-start gap-1.5 text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />{error}
                </p>
              )}

              <button type="submit" disabled={loading} className="mag-btn w-full text-[14px] py-3.5 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending…' : 'Send reset link'}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-[13px] font-semibold pt-1"
                style={{ color: '#E11D74' }}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
