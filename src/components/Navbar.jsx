import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { 
  Building2, Briefcase, ShieldCheck, UserCheck, 
  Sparkles, Trophy, Bell, CheckCircle2, Users, 
  Flame, BookOpen, MapPin, Globe, Layers, 
  FileText, Menu, Plus
} from './Icons';

export default function Navbar({ 
  activeTab,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenGuide,
  onToggleMobileMenu,
  onOpenNewListing
}) {
  const { currentUser, currentOffice, isBroker, isSuperAdmin, logout } = useAuth();
  const officeFullName = currentOffice?.name || 'CT Emlak';
  const officeBadge = (currentOffice?.shortBadge || currentOffice?.city || 'TR').toUpperCase();
  const officeWords = officeFullName.trim().split(/\s+/);
  const primaryWord = officeWords[0] || 'CT';
  const secondaryWords = officeWords.slice(1).join(' ') || 'Emlak';

  // Tab Title & Meta
  const tabTitles = {
    super_admin: { title: 'CT Emlak Süper Admin (Multi-Office)', desc: 'Yeni ofis kurulumu, lisans ve merkezi şifre yönetimi', icon: ShieldCheck },
    listings: { title: 'Tüm Portföyler', desc: `${officeFullName} genel ilan havuzu`, icon: Building2 },
    my_listings: { title: 'Portföylerim', desc: 'Bana ait aktif portföyler', icon: Briefcase },
    projects: { title: 'Projeler & Siteler', desc: 'Toplu konut, site ve arsa parselleri', icon: Layers },
    map: { title: 'Harita Görünümü', desc: `${currentOffice?.city || 'İnteraktif'} imar ve ada-parsel`, icon: MapPin },
    tasks: { title: 'Görev Atama & Operasyon', desc: 'Puanlı iş emirleri ve takip', icon: CheckCircle2 },
    contracts: { title: 'E-Sözleşmeler (9 Resmi Şablon)', desc: 'Matbu evraklar, yazdırma ve Word indirme', icon: FileText },
    crm: { title: 'CRM & Müşteriler', desc: 'Müşteri havuzu ve portföy eşleştirme', icon: Users },
    demands: { title: 'Talepler & Eşleşmeler', desc: 'Müşteri talepleri ve otopilot eşleşmeler', icon: Sparkles },
    field: { title: 'Dijital Saha', desc: 'Canlı sahadan hikayeler ve paylaşımlar', icon: Flame },
    website: { title: 'Web Sitem', desc: 'Kişisel dijital kartvizit ve vitrin', icon: Globe },
    performance: { title: 'Performans & Hedefler', desc: 'Aylık ciro ve prim hedefleri', icon: Trophy },
    broker_admin: { title: 'Broker Yönetim Paneli', desc: `${officeFullName} kadrosu, yetkiler ve hedefler`, icon: ShieldCheck },
    agents: { title: 'Danışman Kadrosu', desc: `${officeFullName} danışman rehberi`, icon: UserCheck },
    legal: { title: 'Yasal Uyum & KVKK', desc: 'TTBS Yetki Belgesi, EİDS & Taahhütnameler', icon: ShieldCheck },
    guide: { title: 'Kullanım Kılavuzu', desc: 'Sistem rehberi, ipuçları ve yardım', icon: BookOpen }
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.listings;
  const ActiveIcon = currentTabInfo.icon;

  return (
    <header className="bg-dark-950/95 backdrop-blur-xl border-b border-slate-800/80 text-white sticky top-0 z-30 shadow-md safe-top">
      <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Hamburger & Active Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger button for mobile/tablet */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition active:scale-95 shrink-0"
            title="Menüyü Aç"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>

          {/* Mobile Brand (only when small screen) */}
          <div className="flex lg:hidden items-center gap-2 select-none shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-amber-500/40 shadow-sm shrink-0"
              style={{ background: currentOffice?.brandColor || '#dc2626' }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center text-sm font-black tracking-tight leading-none gap-1">
                <span className="text-amber-400">{primaryWord}</span>
                <span className="text-white">{secondaryWords}</span>
              </div>
              <span className="text-[9px] font-bold text-amber-400 leading-none mt-0.5">{officeBadge}</span>
            </div>
          </div>

          {/* Desktop Active Page Breadcrumb Title */}
          <div className="hidden lg:flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 shrink-0 shadow-xs">
              <ActiveIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm xl:text-base font-extrabold text-white truncate leading-none">
                {currentTabInfo.title}
              </h1>
              <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5 leading-none">
                {currentTabInfo.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Area */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Quick "İlan Ekle" button */}
          <button
            onClick={onOpenNewListing}
            className="px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition shrink-0"
            title="Yeni Portföy / İlan Ekle"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">İlan Ekle</span>
          </button>

          {/* Bildirim Çanı */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition active:scale-95 shadow-sm shrink-0"
            title="Eşleşme & Sistem Bildirimleri"
          >
            <Bell className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-dark-950 animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Kılavuz Butonu */}
          <button
            onClick={onOpenGuide}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition active:scale-95 shadow-sm shrink-0"
            title="Kullanım Kılavuzu & Sistem Rehberi"
          >
            <BookOpen className="w-4 h-4 text-amber-400 stroke-[2.5]" />
          </button>

          {/* Aktif Kullanıcı Rozeti */}
          <div
            className="flex items-center gap-2 bg-dark-900/90 border border-slate-700/80 rounded-2xl p-1 sm:px-2.5 sm:py-1.5 shrink-0 select-none"
            title={`Giriş Yapılan Kullanıcı: ${currentUser?.name || ''}`}
          >
            <div className="relative shrink-0">
              <UserAvatar
                user={currentUser}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl"
                textSize="text-[10px]"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 border-dark-950 ${
                isBroker ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
            </div>

            <div className="hidden sm:block text-left min-w-0 max-w-[120px] md:max-w-[150px]">
              <p className="text-xs font-extrabold text-white truncate flex items-center gap-1">
                <span className="truncate">{currentUser?.name || 'Kullanıcı'}</span>
                {isBroker && (
                  <span className="shrink-0 text-[10px]" title="Broker / Yönetici">👑</span>
                )}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 truncate">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isBroker ? 'bg-amber-400' : 'bg-blue-400'}`} />
                <span className="truncate">{isBroker ? 'Broker / Admin' : 'Saha Danışmanı'}</span>
              </p>
            </div>
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={() => logout()}
            className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition active:scale-95 shadow-sm shrink-0"
            title="Güvenli Çıkış Yap"
          >
            <span className="text-sm leading-none">🚪</span>
          </button>
        </div>
      </div>
    </header>
  );
}
