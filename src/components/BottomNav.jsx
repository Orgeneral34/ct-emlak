import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, MapPin, Trophy, Users, Plus, 
  Briefcase, UserPlus, DollarSign, X, Sparkles, Navigation,
  BookOpen, ShieldCheck, Layers, FileText
} from './Icons';

export default function BottomNav({ 
  activeTab, 
  setActiveTab, 
  onOpenNewListing, 
  onOpenNewProject,
  onOpenNewDemand,
  onOpenNewDeal, 
  onOpenNewLead 
}) {
  const { isBroker } = useAuth();
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const tabs = [
    { id: 'listings', label: 'Portföy', icon: Building2 },
    { id: 'projects', label: 'Projeler', icon: Layers },
    { id: 'add', label: 'İşlem', isAction: true },
    { id: 'demands', label: 'Talepler', icon: Sparkles },
    { id: 'crm', label: 'CRM', icon: Users },
  ];

  return (
    <>
      {/* Quick Action Floating Drawer Modal */}
      {showQuickMenu && (
        <div 
          className="lg:hidden fixed inset-0 bg-dark-950/75 backdrop-blur-md z-50 flex items-end justify-center pb-24 p-4"
          onClick={() => setShowQuickMenu(false)}
        >
          <div 
            className="bg-white rounded-4xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-slide-up space-y-2.5 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-1 mb-2">
              <div>
                <span className="font-black text-base text-slate-900 block">Sahada Hızlı İşlem</span>
                <span className="text-xs text-slate-400">Yeni bir kayıt veya rehber açın</span>
              </div>
              <button 
                onClick={() => setShowQuickMenu(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action 1: Portföy Ekle */}
            <button
              onClick={() => {
                setShowQuickMenu(false);
                onOpenNewListing();
              }}
              className="w-full flex items-center gap-3.5 p-3 bg-slate-50 hover:bg-slate-100 text-blue-900 rounded-2.5xl border border-blue-200/80 font-bold text-xs sm:text-sm transition text-left group shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-sm transition shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 leading-tight">Yeni Portföy / İlan Ekle</p>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">Konut, ticari ve arsa portföyü kaydet</p>
              </div>
            </button>

            {/* Action 1.5: Proje Ekle */}
            <button
              onClick={() => {
                setShowQuickMenu(false);
                if (onOpenNewProject) onOpenNewProject();
              }}
              className="w-full flex items-center gap-3.5 p-3 bg-slate-50 hover:bg-slate-100 text-amber-950 rounded-2.5xl border border-amber-300 font-bold text-xs sm:text-sm transition text-left group shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm transition shrink-0">
                <span className="text-lg">🏗️</span>
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 leading-tight">Yeni Proje & Şantiye Başlat</p>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">Bina, site veya parselasyon projesi oluştur</p>
              </div>
            </button>

            {/* Action 2: Talep Ekle */}
            <button
              onClick={() => {
                setShowQuickMenu(false);
                if (onOpenNewDemand) onOpenNewDemand();
              }}
              className="w-full flex items-center gap-3.5 p-3 bg-slate-50 hover:bg-slate-100 text-purple-900 rounded-2.5xl border border-purple-200/80 font-bold text-xs sm:text-sm transition text-left group shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md transition shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 leading-tight">Yeni Talep Ekle (Alıcı / Kiracı)</p>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">Kriterleri gir, portföy eşleşmelerini anında yakala</p>
              </div>
            </button>

            {/* Action 3: Müşteri Ekle */}
            <button
              onClick={() => {
                setShowQuickMenu(false);
                onOpenNewLead();
              }}
              className="w-full flex items-center gap-3.5 p-3 bg-slate-50 hover:bg-slate-100 text-indigo-900 rounded-2.5xl border border-indigo-200/80 font-bold text-xs sm:text-sm transition text-left group shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-md transition shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 leading-tight">Yeni Müşteri Talebi (CRM)</p>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">Alıcı & kiracı talebini anında kaydet</p>
              </div>
            </button>

            {/* Action 3: Satış Kapat */}
            <button
              onClick={() => {
                setShowQuickMenu(false);
                onOpenNewDeal();
              }}
              className="w-full flex items-center gap-3.5 p-3 bg-slate-50 hover:bg-slate-100 text-amber-950 rounded-2.5xl border border-amber-300 font-bold text-xs sm:text-sm transition text-left group shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm transition shrink-0">
                <DollarSign className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 leading-tight">Satış / Kiralama Kapat (Ciro)</p>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">Kapanan satışı ve primi kaydet</p>
              </div>
            </button>

            {/* Action 3.5: E-Sözleşme Hazırla */}
            <button
              onClick={() => {
                setShowQuickMenu(false);
                setActiveTab('contracts');
              }}
              className="w-full flex items-center gap-3.5 p-3 bg-slate-50 hover:bg-slate-100 text-teal-950 rounded-2.5xl border border-teal-300 font-bold text-xs sm:text-sm transition text-left group shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md transition shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 leading-tight">📄 E-Sözleşme Hazırla</p>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">9 resmi şablon, Word ve A4 yazdırma</p>
              </div>
            </button>

            {/* Action 4: Kullanım Kılavuzu & Sistem Rehberi */}
            <button
              onClick={() => {
                setShowQuickMenu(false);
                setActiveTab('guide');
              }}
              className="w-full flex items-center gap-3.5 p-3 bg-slate-50 hover:bg-slate-100 text-emerald-950 rounded-2.5xl border border-emerald-300 font-bold text-xs sm:text-sm transition text-left group shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md transition shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 leading-tight">📖 Kullanım Kılavuzu & Rehber</p>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">Sistemin tüm işlevlerini ve kullanımını gör</p>
              </div>
            </button>

            {/* Action 5 (Broker Admin): Broker Yönetim Paneli */}
            {isBroker && (
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setActiveTab('broker_admin');
                }}
                className="w-full flex items-center gap-3.5 p-3 bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 rounded-2.5xl border border-amber-400 font-bold text-xs sm:text-sm transition text-left group shadow-sm active:scale-95"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm transition shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-amber-950 leading-tight">👑 Ekip Yönetimi & Şifreler</p>
                  <p className="text-[11px] text-amber-800 font-normal mt-0.5">Tüm personel ve şifre tanımlama</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar (Only on Mobile/Tablet screens < lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-2xl border-t border-slate-800/90 text-slate-400 safe-bottom shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            if (tab.isAction) {
              return (
                <div key="action" className="relative flex justify-center -mt-6">
                  <button
                    onClick={() => setShowQuickMenu(true)}
                    className="w-13 h-13 rounded-2.5xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm border-2 border-dark-950 active:scale-90 transition-transform p-3 group"
                    title="Hızlı Ekle"
                  >
                    <Plus className="w-6 h-6 stroke-[3] transition-transform group-hover:rotate-90" />
                  </button>
                </div>
              );
            }

            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 relative ${
                  isActive 
                    ? 'text-amber-400 font-extrabold scale-105' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
                <span className="text-[10px] tracking-tight mt-1 font-semibold">{tab.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 shadow-sm animate-pulse-subtle" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
