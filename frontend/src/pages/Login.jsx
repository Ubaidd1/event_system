import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-amber-500/20 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gold-gradient rounded-2xl shadow-lg shadow-amber-500/20 text-charcoal-900 mb-2">
            <Sparkles className="w-7 h-7 fill-current" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gold-gradient">ShaadiSphere</h2>
          <p className="text-xs uppercase tracking-widest text-amber-200/60 font-medium">
            Luxury Wedding Management Platform
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shaadisphere.com"
                className="w-full pl-10 pr-4 py-2.5 bg-charcoal-800/80 border border-amber-500/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-charcoal-800/80 border border-amber-500/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Login Shortcuts */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-center text-gray-400 font-semibold flex items-center justify-center space-x-1">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Quick Demo Accounts</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoFill('admin@shaadisphere.com', 'password123')}
              className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 font-medium transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => handleDemoFill('manager@shaadisphere.com', 'password123')}
              className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 font-medium transition-colors"
            >
              Manager
            </button>
            <button
              onClick={() => handleDemoFill('staff@shaadisphere.com', 'password123')}
              className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 font-medium transition-colors"
            >
              Staff
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-300 hover:underline font-semibold">
            Register Admin Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
