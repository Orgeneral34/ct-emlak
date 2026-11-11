import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  formatCurrency, formatCompactCurrency, formatDate, 
  PIPELINE_STAGES, getStageInfo, getUrgencyBadge, createWhatsAppLink 
} from '../utils/formatters';
import { 
  Users, UserPlus, Search, Filter, Phone, MessageSquare, 
  Sparkles, Calendar, Plus, ChevronRight, CheckCircle2, 
  Clock, ArrowRight, UserCheck, Tag, Flame, Home, 
  FileCheck, ShieldAlert, AlertTriangle, Edit3, Trash2, 
  Building2, Check, Send
} from './Icons';
import TenantFormModal from './TenantFormModal';

export default function CrmView({ 
  crmLeads, 
  loading, 
  onSelectCustomer, 
  onOpenNewLead,
  onOpenSmartMatchForCustomer,
  onUpdateLeadStage 
}) {
  const { currentUser, isBroker } = useAuth();

  // Top Section Switcher: 'pipeline' (Satış Hunisi) or 'tenants' (Halihazırdaki Kiracılar)
  const [activeSection, setActiveSection] = useState('pipeline');

  // Leads state
  const [viewMode, setViewMode] = useState('kanban'); // kanban or list
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [onlyMyLeads, setOnlyMyLeads] = useState(false);

  // Tenants state
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantStatusFilter, setTenantStatusFilter] = useState('all');
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState(null);

  // Load tenants when activeSection changes or component mounts
  useEffect(() => {
    loadTenantsList();
  }, []);

  const loadTenantsList = async () => {
    setLoadingTenants(true);
    try {
      const data = await api.getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Kiracılar yüklenirken hata:', err);
    } finally {
      setLoadingTenants(false);
    }
  };

  // Delete Tenant
  const handleDeleteTenant = async (id, name) => {
    if (window.confirm(`"${name}" adlı kiracının sözleşme kaydını silmek istediğinize emin misiniz?`)) {
      try {
        await api.deleteTenant(id);
        loadTenantsList();
      } catch (err) {
        alert(err.message || 'Kiracı silinemedi.');
      }
    }
  };

  // WhatsApp Reminder message generator
  const getWhatsAppReminderUrl = (tenant) => {
    const cleanPhone = tenant.tenantPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('90') ? cleanPhone : (cleanPhone.startsWith('0') ? '9' + cleanPhone : '90' + cleanPhone);
    const msg = `Sayın ${tenant.tenantName}, Altın Emlak Sivas olarak ${tenant.propertyTitle || 'kiralamış olduğunuz taşınmaza'} ait bu ayki kira ödemenizin (Her ayın ${tenant.paymentDay}. günü) yaklaştığını hatırlatır, bereketli günler dileriz.`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  // Filter leads
  const filteredLeads = crmLeads.filter(lead => {
    if (onlyMyLeads && lead.agentId !== currentUser?.id) return false;
    if (stageFilter !== 'all' && lead.stage !== stageFilter) return false;
    if (urgencyFilter !== 'all' && lead.urgency !== urgencyFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchPhone = lead.phone.includes(q);
      const matchDistrict = lead.desiredDistricts?.some(d => d.toLowerCase().includes(q));
      if (!matchName && !matchPhone && !matchDistrict) return false;
    }
    return true;
  });

  // Filter tenants
  const filteredTenants = tenants.filter(t => {
    if (tenantStatusFilter !== 'all' && t.status !== tenantStatusFilter) return false;
    if (tenantSearch) {
      const q = tenantSearch.toLowerCase();
      const mName = t.tenantName?.toLowerCase().includes(q);
      const mPhone = t.tenantPhone?.includes(q);
      const mProp = t.propertyTitle?.toLowerCase().includes(q);
      const mOwner = t.ownerName?.toLowerCase().includes(q);
      const mDist = t.district?.toLowerCase().includes(q);
      if (!mName && !mPhone && !mProp && !mOwner && !mDist) return false;
    }
    return true;
  });

  // Tenant KPI metrics
  const totalActiveTenants = tenants.filter(t => t.status === 'aktif').length;
  const totalMonthlyRentalVolume = tenants
    .filter(t => t.status === 'aktif' || t.status === 'yenileme_zamani')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const missingEvictionCount = tenants.filter(t => !t.hasEvictionCommitment && t.status !== 'tahliye_edildi').length;
  const renewalDueCount = tenants.filter(t => t.status === 'yenileme_zamani').length;

  return (
    <div className="pb-24 pt-3 max-w-7xl mx-auto px-3 sm:px-4 space-y-4">
      
      {/* Top Main Module Selector (Satış Hunisi vs Halihazırdaki Kiracılar) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveSection('pipeline')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition ${
              activeSection === 'pipeline'
                ? 'bg-slate-900 text-white shadow-card'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Satış Hunisi & Talepler</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              {crmLeads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('tenants')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition ${
              activeSection === 'tenants'
                ? 'bg-emerald-600 text-white shadow-card'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-300" />
            <span>Halihazırdaki Kiracılar & Kira Takibi</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
              {tenants.length}
            </span>
            {missingEvictionCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" title="Eksik taahhütnameler var!" />
            )}
          </button>
        </div>

        {activeSection === 'tenants' ? (
          <button
            onClick={() => {
              setTenantToEdit(null);
              setShowTenantModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Kiracı & Sözleşme Ekle</span>
            <span className="sm:hidden">Kiracı Ekle</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl hidden sm:flex items-center text-xs font-bold">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Huni (Kanban)
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Liste
              </button>
            </div>
            <button
              onClick={onOpenNewLead}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Müşteri Ekle</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: HALİHAZIRDAKİ KİRACILAR & KİRA SÖZLEŞME TAKİBİ */}
      {/* ======================================================== */}
      {activeSection === 'tenants' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Tenant KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Aktif Kiracılar</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalActiveTenants}</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Sözleşmeli Kiracı</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Aylık Toplam Kira Hacmi</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 truncate">{formatCurrency(totalMonthlyRentalVolume)}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Yönetilen Kira Portföyü</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-black text-rose-600 uppercase tracking-wider">Tahliye Taahhütnamesi Yok</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{missingEvictionCount}</p>
              <p className="text-[10px] text-rose-700 font-semibold mt-0.5">Riskli / Eksik Evrak</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-wider">Yenileme Zamanı Geldi</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{renewalDueCount}</p>
              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Kira Artış Görüşmesi</p>
            </div>
          </div>

          {/* Tenants Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Kiracı adı, telefon, mülk veya ev sahibi ara..."
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: `Tümü (${tenants.length})` },
                { id: 'aktif', label: 'Aktif' },
                { id: 'yenileme_zamani', label: 'Yenileme Zamanı' },
                { id: 'gecikmede', label: 'Gecikmede' },
                { id: 'tahliye_edildi', label: 'Ayrıldı' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTenantStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl border transition shrink-0 ${
                    tenantStatusFilter === tab.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tenants Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTenants.map((tenant) => {
              const isDue = tenant.status === 'yenileme_zamani';
              const isLate = tenant.status === 'gecikmede';
              const isHasEviction = tenant.hasEvictionCommitment;

              return (
                <div
                  key={tenant.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:shadow-card transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Tenant Name and Status Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 line-clamp-1">
                          {tenant.tenantName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono">{tenant.tenantPhone}</span>
                          {tenant.tenantTc && (
                            <span className="text-[10px] text-slate-400">TC: {tenant.tenantTc}</span>
                          )}
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isDue ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        isLate ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        tenant.status === 'aktif' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}>
                        {isDue ? 'Yenileme Vakti' : isLate ? 'Gecikmede' : tenant.status === 'aktif' ? 'Aktif' : 'Ayrıldı'}
                      </span>
                    </div>

                    {/* Property & Address */}
                    <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 my-2 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-700 font-extrabold line-clamp-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{tenant.propertyTitle}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 pl-5">
                        {tenant.propertyAddress || `${tenant.district}, ${tenant.neighborhood}`}
                      </p>
                      {tenant.ownerName && (
                        <p className="text-[10px] text-slate-400 pl-5 font-semibold">
                          Mülk Sahibi: {tenant.ownerName} ({tenant.ownerPhone})
                        </p>
                      )}
                    </div>

                    {/* Financial Terms */}
                    <div className="grid grid-cols-2 gap-2 my-2 py-2 border-y border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Aylık Kira Bedeli</span>
                        <span className="text-base font-black text-amber-600">
                          {formatCurrency(tenant.rentAmount, tenant.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Ödeme Günü</span>
                        <span className="text-xs font-black text-slate-800">
                          Her ayın {tenant.paymentDay}. günü
                        </span>
                      </div>
                    </div>

                    {/* Tahliye Taahhütnamesi Status Badge */}
                    <div className="my-2">
                      {isHasEviction ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Tahliye Taahhütnamesi Alındı</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Tahliye Taahhütnamesi Eksik!</span>
                        </div>
                      )}
                    </div>

                    {/* Dates & Agent */}
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                      <span>Dönem: {tenant.startDate} / {tenant.endDate}</span>
                      <span>Danışman: {tenant.agentName || 'Altın Emlak'}</span>
                    </div>

                    {tenant.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">
                        "{tenant.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    {/* WhatsApp Kira Hatırlat */}
                    <a
                      href={getWhatsAppReminderUrl(tenant)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition"
                      title="WhatsApp ile Kira Hatırlat"
                    >
                      <Send className="w-3 h-3" />
                      <span>Kira Hatırlat</span>
                    </a>

                    {/* Call Phone */}
                    <a
                      href={`tel:${tenant.tenantPhone}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition"
                      title="Telefonla Ara"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setTenantToEdit(tenant);
                        setShowTenantModal(true);
                      }}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 transition"
                      title="Sözleşmeyi Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteTenant(tenant.id, tenant.tenantName)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                      title="Kaydı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTenants.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
              <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">Kiracı Kaydı Bulunamadı</p>
              <p className="text-xs text-slate-400 mt-1">Arama kriterlerinizi değiştirebilir veya yeni kiracı ekleyebilirsiniz.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: SATIŞ HUNİSİ & MÜŞTERİ TALEPLERİ (PIPELINE) */}
      {/* ======================================================== */}
      {activeSection === 'pipeline' && (() => {
        const now = new Date();
        const getDaysSince = (dateStr) => {
          if (!dateStr) return 999;
          const diff = now.getTime() - new Date(dateStr).getTime();
          return Math.floor(diff / (1000 * 60 * 60 * 24));
        };

        const activeContactLeads = crmLeads.filter(l => getDaysSince(l.updatedAt || l.createdAt) <= 30);
        const warmingLeads = crmLeads.filter(l => {
          const days = getDaysSince(l.updatedAt || l.createdAt);
          return days > 30 && days <= 60;
        });
        const riskLeads = crmLeads.filter(l => getDaysSince(l.updatedAt || l.createdAt) > 60);

        return (
          <div className="space-y-4 animate-fade-in">
            
            {/* 3 Status Cards (Aktif İletişim, Isınma Bekleyen, Riskli/Unutulan) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                onClick={() => setStageFilter(stageFilter === 'active_30' ? 'all' : 'active_30')}
                className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-emerald-400 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-700 tracking-wider uppercase">AKTİF İLETİŞİM (SON 30 GÜN)</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{activeContactLeads.length} <span className="text-xs font-bold text-slate-500">Kişi</span></p>
                </div>
              </div>

              <div 
                onClick={() => setStageFilter(stageFilter === 'warming_60' ? 'all' : 'warming_60')}
                className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-amber-400 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-700 tracking-wider uppercase">ISINMA BEKLEYEN (30-60 GÜN)</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{warmingLeads.length} <span className="text-xs font-bold text-slate-500">Kişi</span></p>
                </div>
              </div>

              <div 
                onClick={() => setStageFilter(stageFilter === 'risk_60' ? 'all' : 'risk_60')}
                className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-rose-400 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-105 transition">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-rose-700 tracking-wider uppercase">RİSKLİ / UNUTULAN (60+ GÜN)</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{riskLeads.length} <span className="text-xs font-bold text-slate-500">Kişi</span></p>
                </div>
              </div>
            </div>

            {/* Folder / Category Tags Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {['Tümü', 'Sıcak Alıcılar', 'Yatırımcılar', 'Arsa / Kat Karşılığı', 'Acil Kiralık'].map((fld, idx) => (
                <button
                  key={idx}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 border transition ${
                    idx === 0
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {fld}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const name = prompt('Yeni Klasör Adı:');
                  if (name) alert(`"${name}" klasörü oluşturuldu.`);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 bg-white"
              >
                + Yeni Klasör
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="İsim, Telefon, E-Posta veya aranan ilçe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <select
                value={onlyMyLeads ? 'my' : 'all'}
                onChange={(e) => setOnlyMyLeads(e.target.value === 'my')}
                className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200 font-bold text-xs text-slate-700"
              >
                <option value="all">Ekip: Tüm Ofis Müşterileri</option>
                <option value="my">Ekip: Sadece Benim Müşterilerim</option>
              </select>

              <button
                onClick={() => setUrgencyFilter(urgencyFilter === 'sicak' ? 'all' : 'sicak')}
                className={`py-2.5 px-3.5 rounded-2xl font-bold border flex items-center gap-1.5 transition ${
                  urgencyFilter === 'sicak' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-white text-rose-700 border-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Sıcak Alıcılar</span>
              </button>

              <button
                onClick={onOpenNewLead}
                className="py-2.5 px-4 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Yeni Müşteri</span>
              </button>
            </div>

          {/* VIEW MODE 1: KANBAN PIPELINE */}
          {viewMode === 'kanban' && (
            <div className="flex gap-3 overflow-x-auto pb-6 pt-1 items-start no-scrollbar min-h-[600px]">
              {PIPELINE_STAGES.map((stage) => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage.key);

                return (
                  <div
                    key={stage.key}
                    className="w-72 sm:w-80 shrink-0 bg-slate-100/80 rounded-3xl p-3 border border-slate-200 flex flex-col max-h-[75vh]"
                  >
                    {/* Column Header */}
                    <div className="flex justify-between items-center mb-2 px-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                        <span className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">
                          {stage.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-black bg-white px-2 py-0.5 rounded-full text-slate-600 border border-slate-200 shadow-sm">
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Lead Cards Scrollable */}
                    <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                      {stageLeads.length === 0 ? (
                        <div className="p-4 text-center text-[11px] text-slate-400 font-semibold bg-white/50 rounded-2xl border border-dashed border-slate-200">
                          Bu aşamada talep yok
                        </div>
                      ) : (
                        stageLeads.map((lead) => {
                          const urgency = getUrgencyBadge(lead.urgency);

                          return (
                            <div
                              key={lead.id}
                              onClick={() => onSelectCustomer(lead)}
                              className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-card border border-slate-200/80 hover:border-indigo-300 transition cursor-pointer group"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgency.color}`}>
                                  {urgency.label}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {formatDate(lead.createdAt)}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-600 transition">
                                {lead.name}
                              </h4>

                              <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                                <p className="font-semibold text-slate-700">
                                  💰 {formatCompactCurrency(lead.budgetMin)} - {formatCompactCurrency(lead.budgetMax)}
                                </p>
                                <p className="truncate">
                                  📍 {lead.desiredCity} / {lead.desiredDistricts?.join(', ')}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  🏠 {lead.desiredRoomCounts?.join(', ')} • {lead.type === 'alici' ? 'Alıcı' : 'Kiracı'}
                                </p>
                              </div>

                              {/* Card Actions */}
                              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenSmartMatchForCustomer(lead);
                                  }}
                                  className="text-amber-600 hover:text-amber-800 font-extrabold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shadow-sm"
                                  title="Eşleşen Portföyleri Gör"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>Eşleştir</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Move to next stage
                                    const nextMap = {
                                      'yeni_talep': 'yer_gosterme',
                                      'yer_gosterme': 'pazarlik',
                                      'pazarlik': 'sozlesme',
                                      'sozlesme': 'kapandi_kazanildi'
                                    };
                                    if (nextMap[lead.stage]) {
                                      onUpdateLeadStage(lead.id, nextMap[lead.stage]);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-0.5"
                                  title="Bir Sonraki Aşamaya İlerlet"
                                >
                                  <span>İlerlet</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: CUSTOMER LIST */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-900">
                  Kayıtlı Müşteri ve Talepler ({filteredLeads.length})
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const stage = getStageInfo(lead.stage);
                  const urgency = getUrgencyBadge(lead.urgency);

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onSelectCustomer(lead)}
                      className="p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.lightColor}`}>
                            {stage.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgency.color}`}>
                            {urgency.label}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900">{lead.name}</h4>
                        <p className="text-xs text-slate-500">
                          {lead.phone} • {lead.desiredCity} / {lead.desiredDistricts?.join(', ')} • {lead.desiredRoomCounts?.join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSmartMatchForCustomer(lead);
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Eşleşen Portföyler</span>
                        </button>

                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-slate-100 rounded-xl text-slate-700 hover:bg-blue-100"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
      })()}

      {/* Tenant Add / Edit Modal */}
      {showTenantModal && (
        <TenantFormModal
          tenantToEdit={tenantToEdit}
          onClose={() => {
            setShowTenantModal(false);
            setTenantToEdit(null);
          }}
          onSaveSuccess={() => {
            setShowTenantModal(false);
            setTenantToEdit(null);
            loadTenantsList();
          }}
        />
      )}

    </div>
  );
}
