import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Lock, User, Eye, EyeOff, LogIn, 
  Sparkles, CheckCircle2, ShieldAlert, ShieldCheck 
} from './Icons';
import LegalModals from './LegalModals';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Legal Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState('kvkk');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!username.trim()) {
      setError('Lütfen kullanıcı adınızı girin.');
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
    } catch (err) {
      setError(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200/20 overflow-hidden text-slate-900 animate-slide-up z-10">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 sm:p-8 text-center text-white relative border-b border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-lg mb-4 ring-4 ring-amber-500/20">
            <Building2 className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>

          <div className="flex items-center justify-center text-2xl sm:text-3xl font-black tracking-tight leading-none">
            <span className="text-amber-400">CT</span>
            <span className="text-white ml-1">Emlak</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest ml-2">
              PRO
            </span>
          </div>

          <p className="text-xs font-bold text-slate-400 mt-2">
            Kurumsal Emlak Ofisi, Portföy & Saha CRM Portalı
          </p>

          <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center justify-center gap-1">
            <span>Multi-Office Emlak Yönetim Altyapısı by</span>
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kullanıcı Adı veya E-Posta
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Örn: ahmet veya semih"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
                title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Giriş Yap</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
            <a
              href="/privacy"
              className="hover:text-blue-600 transition underline underline-offset-2 font-semibold"
            >
              Gizlilik Politikası
            </a>
            <span>•</span>
            <a
              href="/support"
              className="hover:text-blue-600 transition underline underline-offset-2 font-semibold"
            >
              Destek Merkezi
            </a>
            <span>•</span>
            <a
              href="/delete-account"
              className="hover:text-rose-600 transition underline underline-offset-2 font-semibold"
            >
              Hesap Silme
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setActiveLegalTab('sozlesme'); setLegalModalOpen(true); }}
              className="hover:text-blue-600 transition underline underline-offset-2"
            >
              Kullanıcı Sözleşmesi
            </button>
          </div>

          <div className="text-[10px] text-slate-400">
            CT Emlak Kurumsal CRM • <strong className="text-slate-600">TTBS & MYK Seviye 5 Uyumlu Altyapı</strong>
          </div>
        </div>
      </div>

      {/* Legal Modals Component */}
      <LegalModals
        isOpen={legalModalOpen}
        initialTab={activeLegalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
}
