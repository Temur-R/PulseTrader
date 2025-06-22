import React, { useState, ChangeEvent } from 'react';
import { TrendingUp, Eye, EyeOff, Mail, Lock, User, ArrowRight, LucideIcon } from 'lucide-react';
import { StockPulseAPI } from '../services/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Initialize API instance
const api = new StockPulseAPI();

// Types
interface SocialLoginButtonProps {
  provider: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface InputFieldProps {
  icon: LucideIcon;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
}

interface AuthPagesProps {
  onAuthSuccess?: () => void;
}

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
const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ provider, icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-md"
  >
    {icon}
    <span>Continue with {provider}</span>
  </button>
);

// Input Field Component
const InputField: React.FC<InputFieldProps> = ({ icon: Icon, type, placeholder, value, onChange, showPasswordToggle = false, onTogglePassword = () => {}, showPassword = false }) => (
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

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || ''; // Add your Google Client ID to your .env file as REACT_APP_GOOGLE_CLIENT_ID

const AuthPages: React.FC<AuthPagesProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [api] = useState(() => new StockPulseAPI());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await api.login(email, password);
      } else {
        response = await api.register({
          firstName,
          lastName,
          email,
          password
        });
      }

      if (response.token) {
        localStorage.setItem('stockpulse_token', response.token);
        api.setToken(response.token);
        onAuthSuccess?.();
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await api.loginWithGoogle(credentialResponse.credential);
      
      if (response.token) {
        localStorage.setItem('stockpulse_token', response.token);
        api.setToken(response.token);
        onAuthSuccess?.();
      } else {
        setError('Google authentication failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during Google authentication');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-slate-800/50 p-8 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="sr-only">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-cyan-500/20 bg-slate-900/50 placeholder-gray-500 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="sr-only">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-cyan-500/20 bg-slate-900/50 placeholder-gray-500 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-cyan-500/20 bg-slate-900/50 placeholder-gray-500 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-cyan-500/20 bg-slate-900/50 placeholder-gray-500 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-sm text-gray-400 hover:text-white">
                  {showPassword ? 'Hide' : 'Show'}
                </span>
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105"
              >
                {isLogin ? 'Sign in' : 'Sign up'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-500/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/50 text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google authentication failed')}
                  useOneTap
                  type="standard"
                  theme="filled_black"
                  size="large"
                  width="100%"
                  text={isLogin ? "signin_with" : "signup_with"}
                  shape="rectangular"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default AuthPages; 