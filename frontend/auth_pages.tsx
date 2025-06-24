import React, { useState } from 'react';
import { TrendingUp, Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { StockPulseAPI } from './src/services/api';

// Initialize API instance
const api = new StockPulseAPI();

// Google Icon Component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Social Login Button Component
const SocialLoginButton = ({ provider, icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-md"
  >
    {icon}
    <span>Continue with {provider}</span>
  </button>
);

// Input Field Component
const InputField = ({ icon: Icon, type, placeholder, value, onChange, showPasswordToggle = false, onTogglePassword = () => {}, showPassword = false }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type={showPasswordToggle && showPassword ? 'text' : type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
    />
    {showPasswordToggle && (
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
        )}
      </button>
    )}
  </div>
);

// Login Page Component
const LoginPage = ({ onSwitchToSignup, onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = () => {
    onLogin(formData);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Implement Google OAuth logic here
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">StockPulse</h1>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-gray-400">Sign in to your account to continue</p>
      </div>

      <div className="space-y-6">
        <SocialLoginButton
          provider="Google"
          icon={<GoogleIcon />}
          onClick={handleGoogleLogin}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-gray-400">Or continue with email</span>
          </div>
        </div>

        <div className="space-y-4">
          <InputField
            icon={Mail}
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <InputField
            icon={Lock}
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            showPasswordToggle={true}
            onTogglePassword={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-400">Remember me</span>
            </label>
            <button type="button" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              Forgot password?
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>Sign in</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <button
            onClick={onSwitchToSignup}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

// Sign Up Page Component
const SignupPage = ({ onSwitchToLogin, onSignup }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }
    onSignup(formData);
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
    // Implement Google OAuth logic here
  };

  const handleSignup = async (formData) => {
    console.log('Signup attempt:', formData);
    try {
      const { token } = await api.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('stockpulse_token', token);
      window.location.reload(); // Reload to update authentication state
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">StockPulse</h1>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
        <p className="text-gray-400">Start your journey with StockPulse today</p>
      </div>

      <div className="space-y-6">
        <SocialLoginButton
          provider="Google"
          icon={<GoogleIcon />}
          onClick={handleGoogleSignup}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-gray-400">Or create account with email</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              icon={User}
              type="text"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            />
            <InputField
              icon={User}
              type="text"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            />
          </div>

          <InputField
            icon={Mail}
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <InputField
            icon={Lock}
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            showPasswordToggle={true}
            onTogglePassword={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />

          <InputField
            icon={Lock}
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            showPasswordToggle={true}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            showPassword={showConfirmPassword}
          />

          <div className="flex items-start">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2 mt-1"
            />
            <div className="ml-3 text-sm">
              <span className="text-gray-400">
                I agree to the{' '}
                <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Privacy Policy
                </button>
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>Create account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center">
          <span className="text-gray-400">Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Auth Component
export default function AuthPages() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'signup'

  const handleLogin = (formData) => {
    console.log('Login attempt:', formData);
    // Implement login logic here
    alert('Login functionality would be implemented here');
  };

  const handleSignup = async (formData) => {
    console.log('Signup attempt:', formData);
    try {
      const { token } = await api.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('stockpulse_token', token);
      window.location.reload(); // Reload to update authentication state
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {currentPage === 'login' ? (
          <LoginPage
            onSwitchToSignup={() => setCurrentPage('signup')}
            onLogin={handleLogin}
          />
        ) : (
          <SignupPage
            onSwitchToLogin={() => setCurrentPage('login')}
            onSignup={handleSignup}
          />
        )}
      </div>
    </div>
  );
}