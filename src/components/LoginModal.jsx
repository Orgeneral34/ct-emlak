import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Lock, User, Eye, EyeOff, LogIn, 
  Sparkles, CheckCircle2, ShieldAlert, X, ShieldCheck 
} from './Icons';

export default function LoginModal({ isOpen, onClose }) {
  const { login, currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!username.trim()) {
      setError('Lütfen kullanıcı adınızı veya e-postanızı girin.');
      return;
    }
    if (!password) {
      setError('Lütfen şifrenizi girin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username.trim(), password);
      onClose();
    } catch (err) {
      setError(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-slide-up flex flex-col">
        
        {/* Header with Altın Emlak Sivas Branding */}
        <div className="bg-dark-950 p-6 text-white text-center relative border-b border-slate-800">
          {currentUser && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-sm mb-3">
            <Building2 className="w-7 h-7 text-dark-950 stroke-[2.5]" />
          </div>

          <div className="flex items-center justify-center text-2xl font-black tracking-tight leading-none">
            <span className="text-red-500">Altın</span>
            <span className="text-white">Emlak</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest ml-1.5">
              SİVAS
            </span>
          </div>

          <p className="text-xs font-bold text-slate-400 mt-1.5">
            Saha Danışmanı & Broker Giriş Portalı
          </p>

          <div className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center justify-center gap-1">
            <span>by</span>
            <a
              href="https://ceylantek.com"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 font-bold hover:underline"
            >
              ceylantek.com
            </a>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-2xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kullanıcı Adı veya E-Posta
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Örn: ahmet veya semih"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sisteme Giriş Yap</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
