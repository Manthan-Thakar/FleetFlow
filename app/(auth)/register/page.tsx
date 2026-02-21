'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Lock,
  User,
  Building2,
  MapPin,
  Phone,
  Globe,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AuthService, SignUpData, CompanyData } from '@/lib/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  // Step 1: User credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Company details
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [taxId, setTaxId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Check if user needs to complete profile (step 2)
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === '2') {
      setStep(2);
      // In a real app, you'd get the userId from auth state or context
      // For now, we'll handle it in the login flow
    }
  }, [searchParams]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const signUpData: SignUpData = {
        email,
        password,
        displayName,
      };

      const { userId: newUserId } = await AuthService.signUp(signUpData);
      setUserId(newUserId);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const companyData: CompanyData = {
        name: companyName,
        email: companyEmail,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        country,
        website,
        industry,
        taxId,
        registrationNumber,
      };

      await AuthService.completeProfile(userId, companyData);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/logo.png"
                alt="FleetFlow Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-2xl font-bold text-black dark:text-white">FleetFlow</span>
            </Link>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {step > 1 ? <CheckCircle size={16} /> : '1'}
                </div>
                <span className="ml-2 text-sm font-medium text-black dark:text-white">Account</span>
              </div>
              <div className="w-16 h-0.5 bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-black dark:text-white">Company</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              {step === 1 ? 'Create your account' : 'Set up your company'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {step === 1
                ? 'Start managing your fleet in minutes'
                : 'Tell us about your company to get started'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Step 1: User Credentials */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Company Details */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Acme Logistics"
                  />
                </div>
              </div>

              {/* Company Email */}
              <div>
                <label htmlFor="companyEmail" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Company Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="company@example.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="123 Main St"
                  />
                </div>
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-black dark:text-white mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-black dark:text-white mb-2">
                    State *
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="NY"
                  />
                </div>
              </div>

              {/* Zip Code and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-black dark:text-white mb-2">
                    Zip Code *
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-black dark:text-white mb-2">
                    Country *
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="USA"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Website (Optional)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Industry (Optional)
                </label>
                <input
                  id="industry"
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder="Logistics & Transportation"
                />
              </div>

              {/* Tax ID */}
              <div>
                <label htmlFor="taxId" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Tax ID (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="taxId"
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="12-3456789"
                  />
                </div>
              </div>

              {/* Registration Number */}
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Registration Number (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    id="registrationNumber"
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="REG-123456"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Completing setup...</span>
                  </>
                ) : (
                  <span>Complete Setup</span>
                )}
              </button>
            </form>
          )}

          {/* Sign In Link (only show on step 1) */}
          {step === 1 && (
            <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-black dark:text-white hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-zinc-100 dark:bg-zinc-900 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="mb-8">
            <div className="w-24 h-24 bg-black dark:bg-white rounded-full mx-auto mb-6 flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="FleetFlow"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-black dark:text-white mb-4 text-center">
            {step === 1 ? 'Join FleetFlow today' : 'Almost there!'}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg text-center mb-8">
            {step === 1
              ? 'Create your account to start managing your fleet with powerful tools and real-time insights.'
              : 'Complete your company profile to unlock all features and start managing your fleet.'}
          </p>
          
          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="text-black dark:text-white flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-black dark:text-white">Real-time tracking</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Monitor all vehicles in real-time</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="text-black dark:text-white flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-black dark:text-white">Route optimization</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">AI-powered route planning</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="text-black dark:text-white flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-black dark:text-white">Comprehensive analytics</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Track performance and costs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
