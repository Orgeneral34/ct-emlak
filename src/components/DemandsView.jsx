import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatCompactCurrency, createWhatsAppLink, formatDate } from '../utils/formatters';
import { 
  Sparkles, Search, Filter, Plus, Phone, MessageSquare, 
  MapPin, Building, Flame, CheckCircle2, ArrowRight, 
  Edit3, Trash2, Layers, Check, Users, Home, RefreshCw
} from './Icons';
import DemandMatchesModal from './DemandMatchesModal';

export default function DemandsView({ 
  demands = [], 
  loading = false, 
  onOpenNewDemand, 
  onEditDemand, 
  onDeleteDemand, 
  onRefresh,
  onOpenListing 
}) {
  const { currentUser, isBroker } = useAuth();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, satilik, kiralik
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, konut, arsa, ticari, villa
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [onlyMatched, setOnlyMatched] = useState(false);
  const [onlyMyDemands, setOnlyMyDemands] = useState(false);

  // Selected demand to view matches modal
  const [selectedDemandForMatches, setSelectedDemandForMatches] = useState(null);

  // Quick statistics
  const totalCount = demands.length;
  const matchedCount = demands.filter(d => (d.matchCount || 0) > 0).length;
  const satilikCount = demands.filter(d => d.type === 'satilik').length;
  const kiralikCount = demands.filter(d => d.type === 'kiralik').length;

  // Filter logic
  const filteredDemands = demands.filter(d => {
    if (onlyMyDemands && d.agentId !== currentUser?.id) return false;
    if (typeFilter !== 'all' && d.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (urgencyFilter !== 'all' && d.urgency !== urgencyFilter) return false;
    if (onlyMatched && (!d.matchCount || d.matchCount === 0)) return false;

    if (neighborhoodFilter !== 'all') {
      const qN = neighborhoodFilter.toLowerCase();
      const hasN = d.neighborhoods?.some(n => n.toLowerCase().includes(qN));
      if (!hasN) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const mTitle = d.title?.toLowerCase().includes(q);
      const mClient = d.clientName?.toLowerCase().includes(q);
      const mPhone = d.clientPhone?.includes(q);
      const mNotes = d.notes?.toLowerCase().includes(q);
      const mNeigh = d.neighborhoods?.some(n => n.toLowerCase().includes(q));
      if (!mTitle && !mClient && !mPhone && !mNotes && !mNeigh) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-700" />
              Çift Yönlü Eşleştirme Motoru
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Alıcı & Kiracı Talepleri
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Sivas genelindeki müşteri arayışlarını kaydedin, portföyünüzdeki eşleşen ilanları anında tespit edin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs"
            title="Yenile"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenNewDemand}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Talep Oluştur</span>
          </button>
        </div>
      </div>

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Toplam Aktif Talep
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/30 shadow-xs">
          <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider block mb-1">
            🎯 Eşleşen Talepler
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950">{matchedCount}</span>
            <span className="text-xs font-bold text-emerald-700 bg-white/70 px-2 py-0.5 rounded-lg">
              Portföyü Hazır
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Satılık Arayanlar
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-blue-700">{satilikCount}</span>
            <span className="text-xs font-bold text-slate-500">Müşteri</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Kiralık Arayanlar
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-purple-700">{kiralikCount}</span>
            <span className="text-xs font-bold text-slate-500">Kiracı</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Arama Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Müşteri adı, telefon, mahalle veya aranan kriter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* İşlem Türü (Satılık / Kiralık) */}
          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
            >
              <option value="all">Tüm İşlemler</option>
              <option value="satilik">Satılık Arayanlar</option>
              <option value="kiralik">Kiralık Arayanlar</option>
            </select>
          </div>

          {/* Kategori (Konut / Arsa / vb.) */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="konut">Konut / Daire</option>
              <option value="arsa">Arsa / Arazi</option>
              <option value="ticari">Ticari / İşyeri</option>
              <option value="villa">Villa / Müstakil</option>
            </select>
          </div>

          {/* Sivas Mahalle Filtresi */}
          <div className="md:col-span-3">
            <select
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
            >
              <option value="all">Tüm Mahalleler (Sivas)</option>
              <option value="Kılavuz">Kılavuz Mahallesi</option>
              <option value="İstasyon">İstasyon Caddesi / İstasyon</option>
              <option value="Gültepe">Gültepe Mahallesi</option>
              <option value="Mevlana">Mevlana Mahallesi</option>
              <option value="Paşabey">Paşabey Mahallesi</option>
              <option value="Yenişehir">Yenişehir Mahallesi</option>
              <option value="Alibaba">Alibaba Mahallesi</option>
              <option value="Kümbet">Kümbet Mahallesi</option>
              <option value="Meydan">Kent Meydanı</option>
              <option value="Organize">Organize Sanayi</option>
            </select>
          </div>
        </div>

        {/* Hızlı Filtre Butonları */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setOnlyMatched(!onlyMatched)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                onlyMatched
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sadece Eşleşen Talepler ({matchedCount})</span>
            </button>

            <button
              onClick={() => setOnlyMyDemands(!onlyMyDemands)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                onlyMyDemands
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sadece Benim Taleplerim
            </button>

            <button
              onClick={() => setUrgencyFilter(urgencyFilter === 'sicak' ? 'all' : 'sicak')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                urgencyFilter === 'sicak'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Acil / Sıcak Alıcılar</span>
            </button>
          </div>

          <span className="text-xs font-bold text-slate-400">
            {filteredDemands.length} Talep Listeleniyor
          </span>
        </div>
      </div>

      {/* 4. Demands Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold">Talepler ve portföy eşleşmeleri taranıyor...</p>
        </div>
      ) : filteredDemands.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-black text-lg text-slate-800">Aradığınız kriterde talep bulunamadı</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Filtreleri sıfırlayabilir veya sahada görüştüğünüz alıcılar için yeni bir talep kaydı oluşturabilirsiniz.
          </p>
          <button
            onClick={onOpenNewDemand}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl inline-flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Talep Ekle</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDemands.map((demand) => {
            const hasMatches = (demand.matchCount || 0) > 0;
            const topScore = demand.topMatchScore || 0;

            return (
              <div
                key={demand.id}
                className={`bg-white rounded-3xl border-2 transition hover:shadow-md flex flex-col overflow-hidden ${
                  hasMatches 
                    ? 'border-emerald-300 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top Banner */}
                <div className="p-4 pb-3 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                      demand.type === 'satilik' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {demand.type === 'satilik' ? 'Satılık Arayışı' : 'Kiralık Arayışı'}
                    </span>

                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 uppercase">
                      {demand.category}
                    </span>

                    {demand.urgency === 'sicak' && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-red-100 text-red-700 flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> Sıcak
                      </span>
                    )}
                  </div>

                  {/* Danışman Kısayol */}
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">
                    {demand.id}
                  </span>
                </div>

                {/* Card Title & Client */}
                <div className="px-4 pb-2">
                  <h3 className="font-black text-base text-slate-900 leading-snug line-clamp-1">
                    {demand.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-600 mt-1.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      👤 {demand.clientName}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {formatDate(demand.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Criteria Pills */}
                <div className="px-4 py-2.5 bg-slate-50 border-y border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-slate-700 font-semibold truncate">
                      <strong>Mahalle:</strong> {demand.neighborhoods?.join(', ') || 'Sivas Geneli'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-slate-700 font-semibold truncate">
                      <strong>Oda:</strong> {demand.roomCounts?.join(', ') || 'Fark etmez'}
                      {demand.minM2 && ` • ${demand.minM2}-${demand.maxM2} m²`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-slate-500">Bütçe Aralığı:</span>
                    <span className="font-black text-slate-900 text-sm">
                      {formatCurrency(demand.minPrice)} - {formatCurrency(demand.maxPrice)}
                    </span>
                  </div>
                </div>

                {/* Notlar */}
                {demand.notes && (
                  <div className="px-4 py-2 text-xs text-slate-500 italic line-clamp-2">
                    "{demand.notes}"
                  </div>
                )}

                {/* Match Banner & Action */}
                <div className="p-4 pt-3 mt-auto space-y-2.5 border-t border-slate-100 bg-white">
                  {hasMatches ? (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          {demand.matchCount}
                        </span>
                        <div>
                          <p className="text-xs font-black text-emerald-950">
                            Uygun Portföy Bulundu
                          </p>
                          <p className="text-[11px] font-extrabold text-emerald-700">
                            %{topScore} En Yüksek Uyum
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDemandForMatches(demand)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 transition shadow-xs"
                      >
                        <span>İncele</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-center text-xs text-slate-500 font-semibold">
                      ⏳ Beklemede: Şu an tam eşleşen portföy yok
                    </div>
                  )}

                  {/* Alt Danışman & Butonlar */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">
                      Danışman: <strong>{demand.agentName}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${demand.clientPhone}`}
                        className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="Müşteriyi Ara"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={createWhatsAppLink(demand.clientPhone, `Merhaba Sayın ${demand.clientName}, Altın Emlak Sivas olarak aradığınız ${demand.title} ile ilgili görüşmek isterim.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                        title="WhatsApp Mesajı"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>

                      {(isBroker || demand.agentId === currentUser?.id) && (
                        <>
                          <button
                            onClick={() => onEditDemand(demand)}
                            className="p-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteDemand(demand.id)}
                            className="p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Eşleşen Portföyler Modalı */}
      {selectedDemandForMatches && (
        <DemandMatchesModal
          demand={selectedDemandForMatches}
          onClose={() => setSelectedDemandForMatches(null)}
          onOpenListing={(listing) => {
            setSelectedDemandForMatches(null);
            if (onOpenListing) onOpenListing(listing);
          }}
        />
      )}
    </div>
  );
}
