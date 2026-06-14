import { useState } from 'react';
import { Radio, Shield, Sparkles, Wrench } from 'lucide-react';

type Profile = 'lexi' | 'kee';

export function LeachLoginPage() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!selectedProfile || !passphrase.trim()) {
      setError('Select a profile and enter your passphrase.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    window.location.hash = selectedProfile === 'kee' ? '/leach/admin' : '/leach/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl mb-4">
            <Radio className="text-emerald-400" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">lEACH</h1>
          <p className="text-sm text-gray-500 mt-1">Secure Communication Platform</p>
        </div>

        {/* Profile selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Profile</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setSelectedProfile('lexi'); setError(''); }}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                selectedProfile === 'lexi'
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                selectedProfile === 'lexi' ? 'bg-amber-500/20' : 'bg-gray-800'
              }`}>
                <Sparkles size={18} className={selectedProfile === 'lexi' ? 'text-amber-400' : 'text-gray-500'} />
              </div>
              <div className="text-sm font-semibold text-white">Lexi</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Spark Vector</div>
            </button>

            <button
              onClick={() => { setSelectedProfile('kee'); setError(''); }}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                selectedProfile === 'kee'
                  ? 'border-orange-500 bg-orange-500/5'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                selectedProfile === 'kee' ? 'bg-orange-500/20' : 'bg-gray-800'
              }`}>
                <Wrench size={18} className={selectedProfile === 'kee' ? 'text-orange-400' : 'text-gray-500'} />
              </div>
              <div className="text-sm font-semibold text-white">Kee</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Architect Vector</div>
            </button>
          </div>
        </div>

        {/* Passphrase */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Passphrase</label>
          <input
            type="password"
            placeholder="Enter your passphrase..."
            value={passphrase}
            onChange={(e) => { setPassphrase(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-600 transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading || !selectedProfile || !passphrase.trim()}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Authenticating...</span>
          ) : (
            <>
              <Shield size={16} />
              Enter lEACH
            </>
          )}
        </button>

        {/* Security note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-[10px] text-gray-600">
            <Shield size={10} />
            <span>E2EE via BIPS PKI | No third-party analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
