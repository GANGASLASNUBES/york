import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { AuthForm } from '../../components/civic/AuthForm';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'login'
              ? 'Sign in to save pins, build maps, and receive alerts'
              : 'Join the BIPS Montreal civic community'}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <AuthForm
            mode={mode}
            onSuccess={() => navigate('/')}
            onToggleMode={() => setMode(mode === 'login' ? 'register' : 'login')}
          />
        </div>

        <p className="text-center text-[9px] text-gray-600 mt-6">
          By signing up you agree to BIPS Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
