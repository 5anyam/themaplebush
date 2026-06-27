'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import { Lock, Phone, ArrowRight, ShoppingBag, AlertCircle, CheckCircle, KeyRound, User } from 'lucide-react';
import Link from 'next/link';

type Tab = 'phone' | 'email';
type PhoneStep = 'enter_phone' | 'enter_otp';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login, loginWithPhone } = useAuth();
  const [tab, setTab] = useState<Tab>('phone');

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter_phone');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Email/password state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Phone OTP: Step 1 ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpToken(data.token);
      setPhoneStep('enter_otp');
      setSuccess(`OTP sent to +91 ${phone}`);
      startResendTimer();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendCountdown(30);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      setOtpToken(data.token);
      setOtp('');
      setSuccess('New OTP sent!');
      startResendTimer();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Phone OTP: Step 2 ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, token: otpToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      loginWithPhone(data.user);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Email/Password login ──
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
    setSuccess('');
    setPhoneStep('enter_phone');
    setOtp('');
    setOtpToken('');
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">

        {/* Brand */}
        <div className="text-center">
          <div className="w-14 h-14 bg-[#ff3131] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-500">
            Login to your <span className="text-[#ff3131] font-semibold">KD Book Bazaar</span> account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
            <button
              onClick={() => switchTab('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'phone'
                  ? 'bg-white text-[#ff3131] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone className="w-4 h-4" />
              Mobile OTP
            </button>
            <button
              onClick={() => switchTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'email'
                  ? 'bg-white text-[#ff3131] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              Email / Password
            </button>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* ── PHONE OTP TAB ── */}
          {tab === 'phone' && (
            <>
              {phoneStep === 'enter_phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-sm font-semibold text-gray-500 select-none">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-14 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 focus:bg-white transition-all placeholder:text-gray-400"
                        placeholder="Enter 10-digit number"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    className="w-full bg-[#ff3131] hover:bg-[#cc0000] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP...</>
                    ) : (
                      <>Send OTP <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {/* Back + phone display */}
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-xs text-gray-500">OTP sent to</p>
                      <p className="text-sm font-bold text-gray-800">+91 {phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPhoneStep('enter_phone'); setError(''); setSuccess(''); }}
                      className="text-xs text-[#ff3131] font-semibold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Enter OTP
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-900 tracking-[0.3em] font-bold focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 focus:bg-white transition-all placeholder:text-gray-400 placeholder:tracking-normal"
                        placeholder="6-digit OTP"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-[#ff3131] hover:bg-[#cc0000] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                    ) : (
                      <>Verify & Login <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  <div className="text-center">
                    <span className="text-xs text-gray-500">Didn&apos;t receive OTP? </span>
                    {resendCountdown > 0 ? (
                      <span className="text-xs text-gray-400">Resend in {resendCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-xs text-[#ff3131] font-semibold hover:underline disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── EMAIL / PASSWORD TAB ── */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 focus:bg-white transition-all placeholder:text-gray-400"
                    placeholder="Enter username or email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[#ff3131] hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 focus:bg-white transition-all placeholder:text-gray-400"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff3131] hover:bg-[#cc0000] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Logging in...</>
                ) : (
                  <>Login <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* Register link */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">New to KD Book Bazaar?</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <Link
            href="/register"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
          >
            Create an Account
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400">
          By logging in, you agree to our{' '}
          <Link href="/terms-and-conditions" className="text-[#ff3131] hover:underline">Terms & Conditions</Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="text-[#ff3131] hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}
