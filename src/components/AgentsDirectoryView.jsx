import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { formatCurrency, formatCompactCurrency, createWhatsAppLink } from '../utils/formatters';
import { 
  Users, ShieldCheck, Phone, MessageSquare, Search, 
  Target, Award, Building, UserCheck, ChevronRight 
} from './Icons';

export default function AgentsDirectoryView({ onOpenTargetForAgent, onFilterAgentListings }) {
  const { users, currentUser, switchUser, isBroker } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all, broker, agent

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchTitle = u.title?.toLowerCase().includes(q);
      const matchPhone = u.phone?.includes(q);
      if (!matchName && !matchTitle && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="pb-24 pt-3 max-w-7xl mx-auto px-3 sm:px-4 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Ofis Personel Rehberi ({users.length} Personel)
          </h2>
          <p className="text-xs text-slate-500">
            Tüm ofis içi iletişim rehberi, uzmanlık alanları ve aktif portföy durumları
          </p>
        </div>

        {/* Quick Role Stats */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
            {users.filter(u => u.role === 'broker').length} Broker / Admin
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full border border-blue-300">
            {users.filter(u => u.role === 'agent').length} Saha Danışmanı
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="İsim, telefon veya uzmanlık alanı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 bg-white border border-slate-200 rounded-xl font-semibold"
        >
          <option value="all">Tüm Roller</option>
          <option value="broker">Sadece Brokerlar</option>
          <option value="agent">Saha Danışmanları</option>
        </select>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredUsers.map(user => {
          const isMe = user.id === currentUser?.id;
          const isUserBroker = user.role === 'broker';

          return (
            <div
              key={user.id}
              className={`bg-white rounded-3xl p-4 border transition flex flex-col justify-between space-y-3 ${
                isMe ? 'border-amber-400 shadow-md bg-amber-50/20' : 'border-slate-200/90 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <UserAvatar
                      user={user}
                      className="w-12 h-12 rounded-full"
                      textSize="text-sm"
                    />
                    {isUserBroker && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-black shadow">
                        👑
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900">{user.name}</h4>
                      {isMe && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                          Siz
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{user.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user.phone}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isUserBroker ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {isUserBroker ? 'BROKER' : 'DANIŞMAN'}
                </span>
              </div>

              {/* Stats & Targets */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Aktif Portföy</span>
                  <span className="font-bold text-slate-800">{user.activeListingsCount} İlan</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Aylık Hedef</span>
                  <span className="font-bold text-indigo-700">{formatCompactCurrency(user.monthlyTarget)}</span>
                </div>
              </div>

              {/* Actions: Ara, WhatsApp, Rol Değiştir, Portföylerini Gör */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <button
                  onClick={() => switchUser(user.id)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                  title="Bu kullanıcının gözünden sistemi incele"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kullanıcıya Geç</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={`tel:${user.phone}`}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 flex items-center justify-center transition"
                    title="Danışmanı Ara"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={createWhatsAppLink(user.phone, `Merhaba ${user.name}, Hankan Emlak ofis içi koordinasyon için yazıyorum.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition"
                    title="WhatsApp Mesajı"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
