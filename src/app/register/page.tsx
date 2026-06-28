'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}

const memberBenefits = [
  'Track all your orders in real-time',
  'Faster checkout with saved addresses',
  'Exclusive deals & member-only offers',
  'Complete order history access',
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { register } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      router.push(redirectTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'ACCOUNT_CREATED_LOGIN_FAILED') {
        // Account was created but auto-login failed — send to login with a success hint
        router.push(`/login?registered=1${redirectTo !== '/dashboard' ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`);
        return;
      }
      setError(message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full py-3 border-2 rounded-xl text-sm focus:outline-none focus:border-[#E11D74] focus:ring-2 focus:ring-[#E11D74]/10 focus:bg-white transition-all placeholder:text-gray-400';

  const inputStyle = { borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#FFF6EF', color: '#2A0A22' }}>
      <div className="max-w-md w-full space-y-5">

        {/* Brand */}
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)', boxShadow: '0 8px 24px rgba(225,29,116,0.25)' }}
          >
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-1" style={{ color: '#2A0A22' }}>Create Account</h1>
          <p className="text-sm" style={{ color: '#2A0A22', opacity: 0.6 }}>
            Join <span className="font-semibold" style={{ color: '#E11D74', opacity: 1 }}>The Curio Shelf</span> for exclusive benefits
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border shadow-sm p-7" style={{ borderColor: '#FFE9DD' }}>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#2A0A22' }}>
                Username <span style={{ color: '#E11D74' }}>*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#2A0A22', opacity: 0.35 }} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 pr-4`}
                  style={inputStyle}
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#2A0A22' }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`${inputClass} px-4`}
                  style={inputStyle}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#2A0A22' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`${inputClass} px-4`}
                  style={inputStyle}
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#2A0A22' }}>
                Email <span style={{ color: '#E11D74' }}>*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#2A0A22', opacity: 0.35 }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 pr-4`}
                  style={inputStyle}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#2A0A22' }}>
                Password <span style={{ color: '#E11D74' }}>*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#2A0A22', opacity: 0.35 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 pr-12`}
                  style={inputStyle}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#2A0A22', opacity: 0.35 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#2A0A22' }}>
                Confirm Password <span style={{ color: '#E11D74' }}>*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#2A0A22', opacity: 0.35 }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 pr-12`}
                  style={inputStyle}
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#2A0A22', opacity: 0.35 }}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password match indicator */}
              {formData.confirmPassword && (
                <p className={`text-xs mt-1.5 font-medium ${
                  formData.password === formData.confirmPassword
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}>
                  {formData.password === formData.confirmPassword
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-1"
              style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create My Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#FFE9DD' }} />
            <span className="text-xs font-medium" style={{ color: '#2A0A22', opacity: 0.4 }}>Already have an account?</span>
            <div className="flex-1 h-px" style={{ background: '#FFE9DD' }} />
          </div>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all hover:bg-[#FFE9DD]"
            style={{ borderColor: 'rgba(42,10,34,0.2)', color: '#2A0A22' }}
          >
            Login Instead
          </Link>
        </div>

        {/* Member Benefits Card */}
        <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#FFE9DD' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#2A0A22', opacity: 0.5 }}>
            Member Benefits
          </h3>
          <ul className="space-y-2.5">
            {memberBenefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: '#2A0A22', opacity: 0.75 }}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#E11D74', opacity: 1 }} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Trust note */}
        <p className="text-center text-xs pb-2" style={{ color: '#2A0A22', opacity: 0.5 }}>
          By registering, you agree to our{' '}
          <Link href="/terms-and-conditions" className="hover:underline" style={{ color: '#E11D74', opacity: 1 }}>
            Terms & Conditions
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="hover:underline" style={{ color: '#E11D74', opacity: 1 }}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}
