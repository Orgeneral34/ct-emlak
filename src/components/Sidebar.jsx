import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import UserAvatar from './UserAvatar';
import { 
  Building2, Briefcase, Layers, MapPin, 
  CheckCircle2, FileText, Users, Sparkles, 
  Flame, Globe, Trophy, ShieldCheck, UserCheck, 
  BookOpen, Bell, X, LogIn
} from './Icons';

export default function Sidebar({
  activeTab,
  setActiveTab,
  unreadNotificationsCount = 0,
  matchedDemandsCount = 0,
  tasksCount = 0,
  myListingsCount = 0,
  allListingsCount = 0,
  onOpenNotifications,
  onOpenGuide,
  isOpenMobile = false,
  setIsOpenMobile = () => {}
}) {
  const {
    currentUser,
    currentOffice,
    offices,
    isBroker,
    isSuperAdmin,
    switchOffice,
    logout,
    updateCurrentUserProfile
  } = useAuth();
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const officeFullName = currentOffice?.name || 'CT Emlak';
  const officeBadge = (currentOffice?.shortBadge || currentOffice?.city || 'TR').toUpperCase();
  const officeWords = officeFullName.trim().split(/\s+/);
  const primaryWord = officeWords[0] || 'CT';
  const secondaryWords = officeWords.slice(1).join(' ') || 'Emlak';

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Görsel boyutu en fazla 10MB olabilir.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.uploadPhoto(formData);
      if (res && res.url) {
        await api.updateUser(currentUser.id, { avatar: res.url });
        if (updateCurrentUserProfile) {
          updateCurrentUserProfile({ avatar: res.url });
        }
      }
    } catch (err) {
      alert('Fotoğraf yüklenirken hata oluştu: ' + err.message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  const navGroups = [
    ...(isSuperAdmin
      ? [
          {
            title: 'CT EMLAK SÜPER ADMİN (SAAS)',
            items: [
              {
                id: 'super_admin',
                label: 'Ofis & Lisans Kurulumu',
                shortDesc: 'Multi-Office & Tüm Şifreler',
                icon: ShieldCheck,
                isAdmin: true,
                isNew: true
              }
            ]
          }
        ]
      : []),
    {
      title: 'PORTFÖY & PROJELER',
      items: [
        {
          id: 'listings',
          label: 'Tüm Portföyler',
          shortDesc: 'Ofis İlan Havuzu',
          icon: Building2,
          badge: allListingsCount > 0 ? `${allListingsCount}` : null,
          badgeColor: 'bg-slate-800 text-slate-300'
        },
        {
          id: 'my_listings',
          label: 'Portföylerim',
          shortDesc: 'Bana Ait İlanlar',
          icon: Briefcase,
          badge: myListingsCount > 0 ? `${myListingsCount}` : null,
          badgeColor: 'bg-blue-600 text-white'
        },
        {
          id: 'projects',
          label: 'Projeler & Siteler',
          shortDesc: 'Blok & Parsel Yönetimi',
          icon: Layers
        },
        {
          id: 'map',
          label: 'Harita Görünümü',
          shortDesc: `${currentOffice?.city || 'İmar'} & Parsel Haritası`,
          icon: MapPin
        }
      ]
    },
    {
      title: 'OPERASYON & SÖZLEŞMELER',
      items: [
        {
          id: 'tasks',
          label: 'Görev Atama & Takip',
          shortDesc: 'Puanlı İş Emirleri',
          icon: CheckCircle2,
          badge: tasksCount > 0 ? `${tasksCount}` : null,
          badgeColor: 'bg-amber-500 text-slate-950 font-black'
        },
        {
          id: 'contracts',
          label: 'E-Sözleşmeler',
          shortDesc: '9 Resmi Evrak Şablonu',
          icon: FileText,
          isNew: true
        },
        {
          id: 'crm',
          label: 'CRM & Müşteriler',
          shortDesc: 'Alıcı & Satıcı Takibi',
          icon: Users
        },
        {
          id: 'demands',
          label: 'Talepler & Eşleşmeler',
          shortDesc: 'Otopilot Eşleştirme',
          icon: Sparkles,
          badge: matchedDemandsCount > 0 ? `${matchedDemandsCount}` : null,
          badgeColor: 'bg-emerald-500 text-slate-950 font-black animate-pulse'
        }
      ]
    },
    {
      title: 'DİJİTAL SAHA & ANALİZ',
      items: [
        {
          id: 'field',
          label: 'Dijital Saha',
          shortDesc: 'Canlı Akış & Hikayeler',
          icon: Flame
        },
        {
          id: 'website',
          label: 'Web Sitem',
          shortDesc: 'Dijital Kartvizit',
          icon: Globe
        },
        {
          id: 'performance',
          label: 'Performans & Prim',
          shortDesc: 'Satış Hedefleri & Ligi',
          icon: Trophy
        },
        ...(isBroker
          ? [
              {
                id: 'broker_admin',
                label: 'Ekip Yönetimi',
                shortDesc: 'Broker Yönetim Paneli',
                icon: ShieldCheck,
                isAdmin: true
              }
            ]
          : [
              {
                id: 'agents',
                label: 'Ekip Rehberi',
                shortDesc: 'Danışman Kadrosu',
                icon: UserCheck
              }
            ]
        ),
        {
          id: 'legal',
          label: 'Yasal Uyum & KVKK',
          shortDesc: 'TTBS, EİDS & Taahhütler',
          icon: ShieldCheck
        },
        {
          id: 'guide',
          label: 'Kullanım Kılavuzu',
          shortDesc: 'Sistem Rehberi & İpuçları',
          icon: BookOpen
        }
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      {/* Brand Header (Dynamic per Logged-in Office) */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 select-none min-w-0">
            <div className="relative group cursor-pointer shrink-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-amber-500/40 shadow-sm shrink-0"
                style={{ background: currentOffice?.brandColor || '#dc2626' }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>

            <div className="flex flex-col leading-tight min-w-0">
              <div className="flex items-center text-base font-black tracking-tight leading-none flex-wrap gap-1">
                <span className="text-amber-400 truncate">{primaryWord}</span>
                <span className="text-white truncate">{secondaryWords}</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                  {officeBadge}
                </span>
              </div>
              <div className="text-[10px] font-bold tracking-wide mt-1 leading-none flex items-center gap-1">
                <span className="text-slate-400">CT Emlak</span>
                <span className="text-slate-600">•</span>
                <a
                  href="https://ceylantek.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 hover:underline transition-all"
                  title="ceylantek.com web sitesini ziyaret et"
                >
                  ceylantek.com
                </a>
              </div>
            </div>
          </div>

          {/* Close Button on Mobile Drawer */}
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Super Admin Quick Office Switcher */}
        {isSuperAdmin && offices.length > 0 && (
          <div className="bg-slate-900/95 border border-amber-500/30 rounded-xl p-2">
            <div className="text-[9px] font-black uppercase tracking-wider text-amber-400 mb-1 flex items-center justify-between">
              <span>👑 AKTİF OFİS SEÇİMİ</span>
              <span className="text-slate-400">{currentOffice?.id || 'OFC-01'}</span>
            </div>
            <select
              value={currentOffice?.id || 'OFC-01'}
              onChange={(e) => switchOffice(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs font-bold rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:border-amber-400"
            >
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  🏢 {o.name} ({o.city || o.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Nav Items List (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
              {group.title}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 group relative ${
                      isActive
                        ? item.isAdmin
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-blue-600 text-white font-black shadow-md'
                        : item.isAdmin
                          ? 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-xl transition shrink-0 ${
                        isActive
                          ? item.isAdmin ? 'bg-slate-950/20 text-slate-950' : 'bg-white/20 text-white'
                          : item.isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800/80 text-slate-300 group-hover:text-white group-hover:bg-slate-800'
                      }`}>
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs truncate leading-snug flex items-center gap-1.5">
                          <span className="truncate">{item.label}</span>
                          {item.isAdmin && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          )}
                          {item.isNew && !isActive && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black">
                              YENİ
                            </span>
                          )}
                        </div>
                        {item.shortDesc && (
                          <div className={`text-[10px] truncate leading-tight mt-0.5 ${
                            isActive ? (item.isAdmin ? 'text-slate-800' : 'text-blue-100') : 'text-slate-500'
                          }`}>
                            {item.shortDesc}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${item.badgeColor || 'bg-slate-800 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/80">
        <div className="flex items-center justify-between gap-2 bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              className="relative shrink-0 group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Profil fotoğrafınızı yüklemek veya değiştirmek için tıklayın"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                accept="image/*"
                className="hidden"
              />
              <UserAvatar
                user={currentUser}
                className="w-9 h-9 rounded-xl"
                textSize="text-xs"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                isBroker ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />

              {/* Hover Camera Overlay */}
              <div className="absolute inset-0 bg-slate-950/70 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white">
                {uploadingAvatar ? (
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>📷</span>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate flex items-center gap-1">
                <span className="truncate">{currentUser?.name || 'Kullanıcı'}</span>
                {isBroker && <span className="text-[11px]" title="Broker / Yönetici">👑</span>}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 truncate">
                {isBroker ? 'Broker / Yönetici' : 'Saha Danışmanı'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Bildirim Çanı */}
            <button
              onClick={() => {
                onOpenNotifications();
                setIsOpenMobile(false);
              }}
              className="relative p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
              title="Bildirimler"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute 1 top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>

            {/* Çıkış Yap */}
            <button
              onClick={() => logout()}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Güvenli Çıkış"
            >
              <span className="text-xs">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 fixed inset-y-0 left-0 bg-slate-950 border-r border-slate-800/90 z-40">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Responsive Slide-Over Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950 shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
