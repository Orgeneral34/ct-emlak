import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import UserAvatar from './UserAvatar';
import { 
  formatCurrency, formatCompactCurrency, formatDate 
} from '../utils/formatters';
import { 
  Trophy, TrendingUp, Target, Award, DollarSign, 
  Calendar, Users, ArrowUpRight, Plus, FileText, 
  CheckCircle2, Sparkles, Filter, ChevronRight
} from './Icons';

export default function PerformanceView({ 
  onOpenNewDeal, 
  onOpenTargetModal, 
  onOpenWeeklyReport 
}) {
  const { currentUser, isBroker } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard'); // leaderboard, deals, myperformance

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    setLoading(false);
    try {
      const data = await api.getPerformanceStats();
      setStats(data);
    } catch (err) {
      console.error('Performans verisi çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Performans ve Ciro verileri hesaplanıyor...</p>
      </div>
    );
  }

  // Find current user's stats
  const myStat = stats.leaderboard.find(l => l.agentId === currentUser?.id) || {
    monthlyCommission: 0,
    weeklyCommission: 0,
    dealCount: 0,
    monthlyTarget: currentUser?.monthlyTarget || 500000
  };

  const myProgress = Math.min(
    Math.round(((myStat.monthlyCommission || 0) / (myStat.monthlyTarget || 500000)) * 100),
    100
  );

  return (
    <div className="pb-24 pt-3 max-w-7xl mx-auto px-3 sm:px-4 space-y-4">
      
      {/* Top Action & Report Banner */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Performans & Ciro Yönetimi
          </h2>
          <p className="text-xs text-slate-500">
            {isBroker ? 'Broker Yönetim Paneli • Danışman Hedef & Ciro Takibi' : 'Kişisel Başarı & Şampiyonlar Sıralaması'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenWeeklyReport}
            className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Haftalık Rapor</span>
          </button>

          {isBroker && (
            <button
              onClick={onOpenTargetModal}
              className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Hedef Ata</span>
            </button>
          )}

          <button
            onClick={onOpenNewDeal}
            className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Satış Kapat</span>
          </button>
        </div>
      </div>

      {/* Office KPI Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-3xl shadow-sm border border-slate-700">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>Bu Haftaki Ofis Cirosu</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-amber-400">
            {formatCurrency(stats.summary.weeklyCommission)}
          </p>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="font-bold text-white">{stats.summary.weeklyDealCount} Adet</span> Kapanan İşlem
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-4 rounded-3xl shadow-sm border border-blue-700/50">
          <div className="flex justify-between items-center text-blue-200 text-xs mb-1">
            <span>Bu Ayki Toplam Ciro</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-white">
            {formatCurrency(stats.summary.monthlyCommission)}
          </p>
          <div className="text-[11px] text-blue-200 mt-1 flex items-center gap-1">
            <span className="font-bold text-amber-300">{stats.summary.monthlyDealCount} İşlem</span> • {formatCompactCurrency(stats.summary.monthlySalesVolume)} Hacim
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1">
            <span>Aktif Portföy Sayısı</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-900">
            {stats.summary.activeListings} / {stats.summary.totalListings}
          </p>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Ofis Portföy Havuzunda
          </div>
        </div>

        {/* Kişisel Hedef Kartı */}
        <div className="bg-amber-50/70 border border-amber-300 p-4 rounded-3xl">
          <div className="flex justify-between items-center text-amber-900 text-xs mb-1 font-bold">
            <span>Aylık Hedefiniz</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-black text-slate-900">
            {formatCurrency(myStat.monthlyCommission)} / {formatCompactCurrency(myStat.monthlyTarget)}
          </p>
          <div className="w-full bg-amber-200 rounded-full h-2 mt-2 overflow-hidden">
            <div 
              className="bg-amber-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${myProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-amber-900 font-bold mt-1 text-right">
            %{myProgress} Başarı Oranı
          </p>
        </div>
      </div>

      {/* Tabs: Şampiyonlar Kürsüsü (Leaderboard) vs Son Kapanan İşlemler */}
      <div className="flex gap-2 border-b border-slate-200 pt-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'leaderboard'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Şampiyonlar Kürsüsü (Danışman Sıralaması)</span>
        </button>

        <button
          onClick={() => setActiveTab('deals')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'deals'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span>Kapanan Satış & Kiralamalar ({stats.monthlyDeals.length})</span>
        </button>
      </div>

      {/* TAB 1: LEADERBOARD & PODIUM */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
            
            {/* 2nd Place */}
            {stats.leaderboard[1] && (
              <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-sm flex flex-col items-center text-center relative mt-4">
                <span className="absolute -top-3 w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center border-2 border-white shadow">
                  2
                </span>
                <UserAvatar
                  avatar={stats.leaderboard[1].agentAvatar}
                  name={stats.leaderboard[1].agentName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-slate-300 mb-2 mt-1"
                />
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate w-full">
                  {stats.leaderboard[1].agentName}
                </h4>
                <p className="text-[10px] text-slate-400">{stats.leaderboard[1].title}</p>
                <div className="mt-2 text-xs sm:text-sm font-extrabold text-blue-600">
                  {formatCompactCurrency(stats.leaderboard[1].monthlyCommission)}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">{stats.leaderboard[1].dealCount} İşlem</span>
              </div>
            )}

            {/* 1st Place - Champion */}
            {stats.leaderboard[0] && (
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-3 sm:p-5 border-2 border-amber-400 shadow-md flex flex-col items-center text-center relative -mt-1">
                <span className="absolute -top-4 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-white shadow-lg">
                  👑
                </span>
                <UserAvatar
                  avatar={stats.leaderboard[0].agentAvatar}
                  name={stats.leaderboard[0].agentName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-amber-400 mb-2 mt-1"
                />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full mb-1">
                  AYIN ŞAMPİYONU
                </span>
                <h4 className="font-extrabold text-xs sm:text-base text-slate-900 truncate w-full">
                  {stats.leaderboard[0].agentName}
                </h4>
                <p className="text-[10px] text-slate-500">{stats.leaderboard[0].title}</p>
                <div className="mt-2 text-sm sm:text-base font-black text-amber-600">
                  {formatCurrency(stats.leaderboard[0].monthlyCommission)}
                </div>
                <span className="text-[10px] text-slate-600 font-bold mt-0.5">{stats.leaderboard[0].dealCount} Satış / Kira</span>
              </div>
            )}

            {/* 3rd Place */}
            {stats.leaderboard[2] && (
              <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-sm flex flex-col items-center text-center relative mt-6">
                <span className="absolute -top-3 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow">
                  3
                </span>
                <UserAvatar
                  avatar={stats.leaderboard[2].agentAvatar}
                  name={stats.leaderboard[2].agentName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-600 mb-2 mt-1"
                />
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate w-full">
                  {stats.leaderboard[2].agentName}
                </h4>
                <p className="text-[10px] text-slate-400">{stats.leaderboard[2].title}</p>
                <div className="mt-2 text-xs sm:text-sm font-extrabold text-amber-800">
                  {formatCompactCurrency(stats.leaderboard[2].monthlyCommission)}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">{stats.leaderboard[2].dealCount} İşlem</span>
              </div>
            )}
          </div>

          {/* Full 50 Danışman Leaderboard Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">
                Tüm Danışman Performans Sıralaması
              </h3>
              <span className="text-xs text-slate-500">50 Personel</span>
            </div>

            <div className="divide-y divide-slate-100">
              {stats.leaderboard.map((agent, index) => {
                const isMe = agent.agentId === currentUser?.id;
                const targetPercent = Math.min(
                  Math.round((agent.monthlyCommission / (agent.monthlyTarget || 500000)) * 100),
                  100
                );

                return (
                  <div
                    key={agent.agentId}
                    className={`p-3.5 flex items-center justify-between gap-3 transition ${
                      isMe ? 'bg-amber-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 text-center font-bold text-xs ${
                        index < 3 ? 'text-amber-500 font-extrabold' : 'text-slate-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <UserAvatar
                        avatar={agent.agentAvatar}
                        name={agent.agentName}
                        className="w-10 h-10 rounded-full border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {agent.agentName}
                          </span>
                          {isMe && (
                            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                              Siz
                            </span>
                          )}
                          {agent.agentRole === 'broker' && (
                            <span className="text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded">
                              Broker
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {agent.dealCount} İşlem • {agent.activeListings} Aktif Portföy
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(agent.monthlyCommission)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Hedef: {formatCompactCurrency(agent.monthlyTarget)} ({targetPercent}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KAPANAN İŞLEMLER (DEALS LIST) */}
      {activeTab === 'deals' && (
        <div className="space-y-3">
          {stats.monthlyDeals.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <p className="text-sm text-slate-500">Bu ay henüz kapanmış bir işlem kaydedilmedi.</p>
            </div>
          ) : (
            stats.monthlyDeals.map(deal => (
              <div
                key={deal.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      deal.dealType === 'satilik' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {deal.dealType === 'satilik' ? 'SATIŞ YAPILDI' : 'KİRALANDI'}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(deal.closingDate, true)}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{deal.listingTitle}</h4>
                  <p className="text-xs text-slate-500">
                    Kapatan Danışman: <span className="font-semibold text-slate-700">{deal.agentName}</span>
                  </p>
                  {deal.notes && (
                    <p className="text-xs text-slate-600 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{deal.notes}"
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                  <div className="text-xs text-slate-400">İşlem Bedeli: {formatCurrency(deal.dealPrice)}</div>
                  <div className="text-base font-black text-emerald-600">
                    +{formatCurrency(deal.commissionAmount)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Danışman Payı: <span className="font-bold text-slate-800">{formatCurrency(deal.agentShare)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
