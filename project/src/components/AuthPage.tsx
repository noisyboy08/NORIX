import { useEffect, useState } from 'react';
import { ArrowLeft, Code2 } from 'lucide-react';
import { isSupabaseAuthConfigured, supabase } from '../utils/supabaseAuth';

export default function AuthPage({
  onLogin,
  onBack,
}: {
  onLogin: () => void;
  onBack: () => void;
}) {
  const [isLogin, setIsLogin] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!supabase) return;

    const syncFromSession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          params.delete('code');
          params.delete('state');
          const next = new URL(window.location.href);
          next.search = params.toString() ? `?${params.toString()}` : '';
          window.history.replaceState({}, '', next.toString());
        }
        const { data } = await supabase.auth.getSession();
        if (mounted && data.session) onLogin();
      } catch (e) {
        if (mounted) {
          const msg = e instanceof Error ? e.message : 'OAuth callback failed.';
          setError(msg);
        }
      }
    };

    syncFromSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) onLogin();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [onLogin]);

  async function handleEmailAuth() {
    setError(null);
    setInfo(null);
    if (!supabase) {
      setError('Supabase auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (!isLogin && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) throw signInErr;
        onLogin();
      } else {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/?view=auth`,
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              full_name: `${firstName} ${lastName}`.trim(),
            },
          },
        });
        if (signUpErr) throw signUpErr;
        setInfo('Account created. If email verification is enabled, check your inbox to continue.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setError(null);
    setInfo(null);
    if (!supabase) {
      setError('Supabase auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.');
      return;
    }
    setOauthLoading(provider);
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/?view=auth`,
        },
      });
      if (oauthErr) throw oauthErr;
    } catch (e) {
      const msg = e instanceof Error ? e.message : `Failed to start ${provider} OAuth.`;
      setError(msg);
      setOauthLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-5xl h-[80vh] min-h-[600px] flex rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Left Side: Branding & Info (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-1/2 relative bg-[#0d2a1d] overflow-hidden flex-col justify-between p-12">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none" />
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="z-10">
            <h1 className="text-4xl lg:text-5xl font-semibold mb-6 tracking-tight leading-tight">
              Get Started <br />with Us
            </h1>
            <p className="text-emerald-50/70 max-w-xs text-sm leading-relaxed">
              Complete these easy steps to register your account and secure your enterprise.
            </p>
          </div>

          <div className="flex gap-4 z-10">
            {[
              { num: 1, text: 'Sign up your account', active: true },
              { num: 2, text: 'Set up your workspace', active: false },
              { num: 3, text: 'Set up your profile', active: false }
            ].map(step => (
              <div 
                key={step.num}
                className={`flex-1 rounded-2xl p-4 transition-colors ${
                  step.active 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/50 backdrop-blur-sm shadow-inner overflow-hidden'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-3 ${step.active ? 'bg-black text-white' : 'bg-white/20 text-white/80'}`}>
                  {step.num}
                </div>
                <div className={`text-xs font-semibold ${step.active ? '' : 'max-w-[70px]'}`}>{step.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-8 sm:p-12 relative">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="w-full max-w-sm">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Sign Up Account'}</h2>
              <p className="text-xs text-gray-500">
                {isLogin ? 'Enter your details to access your dashboard.' : 'Enter your personal data to create your account.'}
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={oauthLoading !== null || loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-50 transition-colors text-xs font-semibold"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                {oauthLoading === 'google' ? 'Redirecting...' : 'Google'}
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('github')}
                disabled={oauthLoading !== null || loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-50 transition-colors text-xs font-semibold"
              >
                <Code2 className="w-4 h-4" />
                {oauthLoading === 'github' ? 'Redirecting...' : 'GitHub'}
              </button>
            </div>

            <div className="relative flex items-center py-4 mb-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-gray-600 text-xs text-center uppercase tracking-widest font-semibold">Or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] text-gray-400 mb-1.5 ml-1">First Name</label>
                    <input
                      type="text"
                      placeholder="eg. John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#111111] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] border border-transparent focus:border-white/20 transition-colors rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-gray-600"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-gray-400 mb-1.5 ml-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="eg. Francisco"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#111111] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] border border-transparent focus:border-white/20 transition-colors rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-gray-600"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 ml-1">Email</label>
                <input
                  type="email"
                  placeholder="eg. johnfrans@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full bg-[#111111] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] border border-transparent focus:border-white/20 transition-colors rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full bg-[#111111] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] border border-transparent focus:border-white/20 transition-colors rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-gray-600"
                />
                {!isLogin && <p className="text-[10px] text-gray-600 mt-2 ml-1">Must be at least 8 characters.</p>}
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}
              {info && <p className="text-xs text-emerald-400">{info}</p>}
              {!isSupabaseAuthConfigured && (
                <p className="text-[11px] text-amber-400">
                  Supabase auth is not configured in `.env`. Email and OAuth buttons need valid keys/providers.
                </p>
              )}

              <div className="pt-2">
                <button 
                  onClick={handleEmailAuth}
                  disabled={loading || oauthLoading !== null}
                  className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? 'Please wait...' : isLogin ? 'Log in' : 'Sign Up'}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-white font-semibold hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
