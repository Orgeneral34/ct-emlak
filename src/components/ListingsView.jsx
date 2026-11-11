import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  formatCurrency, formatCompactCurrency, getCategoryBadge, 
  getStatusBadge, createWhatsAppLink 
} from '../utils/formatters';
import { 
  Search, Filter, MapPin, Phone, MessageSquare, Plus, 
  Sparkles, Bed, Maximize2, Building, ShieldAlert,
  ArrowUpDown, ExternalLink, Share2, Layers, CheckCircle2,
  Compass, Eye, Briefcase
} from './Icons';

export default function ListingsView({ 
  listings, 
  loading, 
  onSelectListing, 
  onOpenNewListing, 
  onOpenMapForListing,
  onOpenSmartMatchForListing,
  filters,
  setFilters,
  onRefresh,
  isMyListings = false
}) {
  const { currentUser, currentOffice, isBroker } = useAuth();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeQuickTab, setActiveQuickTab] = useState('all');

  const displayedListings = isMyListings
    ? listings.filter(l => l.agentId === currentUser?.id)
    : listings;

  const handleQuickTabChange = (tab) => {
    setActiveQuickTab(tab);
    if (tab === 'all') {
      setFilters(prev => ({ ...prev, type: 'all', category: 'all', agentId: 'all' }));
    } else if (tab === 'satilik' || tab === 'kiralik') {
      setFilters(prev => ({ ...prev, type: tab, category: 'all', agentId: 'all' }));
    } else if (tab === 'proje') {
      setFilters(prev => ({ ...prev, type: 'all', category: 'proje', agentId: 'all' }));
    } else if (tab === 'mine') {
      setFilters(prev => ({ ...prev, type: 'all', category: 'all', agentId: currentUser?.id }));
    }
  };

  const handleShareToClient = (e, listing) => {
    e.stopPropagation();
    const officeName = currentOffice?.name || 'CT Emlak';
    const text = `🏡 *${listing.title}*\n\n` +
      `📍 *Konum:* ${listing.district}, ${listing.neighborhood} / ${listing.city}\n` +
      `💰 *Fiyat:* ${formatCurrency(listing.price, listing.currency)}\n` +
      `📐 *Özellikler:* ${listing.roomCount} | ${listing.grossM2} m² | ${listing.floor}\n\n` +
      `ℹ️ ${listing.description}\n\n` +
      `*Portföy Danışmanı:* ${listing.agentName} - ${officeName}`;
    
    if (navigator.share) {
      navigator.share({ title: listing.title, text }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const isFilterActive = filters.category !== 'all' || filters.roomCount !== 'all' || 
    filters.minPrice || filters.maxPrice || filters.district !== 'all';

  return (
    <div className="pb-28 pt-4 max-w-7xl mx-auto px-3 sm:px-6 space-y-4">
      
      {/* Top Header Banner distinguishing "Portföylerim" vs "Tüm Portföyler" */}
      {isMyListings ? (
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-dark-950 p-4 sm:p-5 rounded-3xl border border-blue-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Portföylerim (Kişisel İlanlarım)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30 font-bold">
                  {displayedListings.length} Aktif İlanınız
                </span>
              </h2>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Sadece şahsınıza ait veya doğrudan yönettiğiniz portföyler listelenmektedir.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenNewListing}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Yeni Portföy Ekle</span>
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-black shrink-0 border border-slate-200">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Tüm Ofis Portföy Havuzu</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  Toplam {displayedListings.length} İlan
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ofisteki tüm danışmanların ve yöneticilerin gayrimenkul ilanları listelenmektedir.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenNewListing}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
            <span>+ Portföy Ekle</span>
          </button>
        </div>
      )}
      
      {/* Search Bar & Action Buttons */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="İlçe, mahalle, başlık veya ilan no..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-11 pr-10 py-3 bg-white rounded-2xl border border-slate-200/90 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-all placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center transition"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterModal(true)}
          className={`px-4 py-3 rounded-2xl border flex items-center gap-2 text-xs sm:text-sm font-bold transition shadow-sm active:scale-95 ${
            isFilterActive
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtrele</span>
          {isFilterActive && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={onOpenNewListing}
          className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black px-4 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm shadow-sm border border-amber-300/40 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">İlan Ekle</span>
        </button>
      </div>

      {/* Quick Filter Chips Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        {[
          { id: 'all', label: `Tüm Portföyler (${listings.length})` },
          { id: 'mine', label: '👤 Benim Portföyüm' },
          { id: 'satilik', label: '🏠 Satılık' },
          { id: 'kiralik', label: '🔑 Kiralık' },
          { id: 'proje', label: '🏗️ Projeler' }
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => handleQuickTabChange(chip.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 shadow-sm ${
              activeQuickTab === chip.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Portföy verileri taranıyor...</p>
        </div>
      ) : displayedListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-card">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg mb-1">Aramanıza Uygun İlan Bulunamadı</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            {isMyListings 
              ? 'Şu an üzerinize kayıtlı aktif bir ilan bulunmuyor. Yeni bir portföy ekleyerek satış sürecini başlatabilirsiniz.'
              : 'Seçtiğiniz filtrelerde henüz bir gayrimenkul kaydedilmemiş. Filtreleri temizleyebilir veya yeni bir portföy ekleyebilirsiniz.'}
          </p>
          <button
            onClick={() => setFilters({ type: 'all', category: 'all', city: 'all', district: 'all', roomCount: 'all', agentId: 'all', search: '', minPrice: '', maxPrice: '' })}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedListings.map((item) => {
            const catBadge = getCategoryBadge(item.category);
            const statBadge = getStatusBadge(item.status);
            const isMyListing = item.agentId === currentUser?.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col group relative"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={item.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Subtle Gradient Scrim on Image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 items-center">
                    <span className={`text-[11px] font-black tracking-wide px-3 py-1 rounded-full shadow-md uppercase ${
                      item.type === 'satilik' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {item.type === 'satilik' ? 'SATILIK' : 'KİRALIK'}
                    </span>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-white/95 backdrop-blur-md shadow-sm ${catBadge.bg}`}>
                      {catBadge.text}
                    </span>

                    {item.videoUrl && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1 animate-pulse" title="Video / Reels Turu Var">
                        <span>🎬 Video</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-md bg-white/95 backdrop-blur-md ${statBadge.bg}`}>
                      {statBadge.text}
                    </span>
                  </div>

                  {/* Bottom Info on Image: Price Tag */}
                  <div className="absolute bottom-3.5 left-3.5">
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-300 block drop-shadow">FİYAT</span>
                    <span className="text-xl sm:text-2xl font-black text-white drop-shadow-md tracking-tight">
                      {formatCurrency(item.price, item.currency)}
                    </span>
                  </div>

                  {/* Action Quick Buttons Overlay */}
                  <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMapForListing(item);
                      }}
                      className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-slate-800 hover:text-blue-600 flex items-center justify-center shadow-lg active:scale-90 transition"
                      title="Haritada Konumu Gör"
                    >
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => handleShareToClient(e, item)}
                      className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg active:scale-90 transition"
                      title="Müşteriye WhatsApp'tan Paylaş"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Location Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-800">{item.district}, {item.neighborhood}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.city}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  {/* Property Specs Pill Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-800">{item.roomCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-slate-700">{item.grossM2} m²</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">{item.floor}</span>
                    </div>
                  </div>

                  {/* Bottom Agent Row & Match Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black text-xs shrink-0 border border-blue-200">
                        {item.agentName ? item.agentName.charAt(0) : 'D'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1">
                          {item.agentName}
                          {isMyListing && <span className="text-[10px] text-blue-600 font-bold">(Siz)</span>}
                        </p>
                        <p className="text-[10px] text-slate-400">Saha Danışmanı</p>
                      </div>
                    </div>

                    {/* Smart Match Pill */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSmartMatchForListing(item);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border border-amber-300 text-amber-950 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-sm shrink-0"
                      title="Bu mülkü arayan potansiyel müşterileri gör"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Alıcı Bul</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-dark-950/75 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-4xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl animate-slide-up text-slate-800 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Gelişmiş Filtreleme
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 pt-3 text-xs sm:text-sm">
              {/* İşlem Türü */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">İşlem Türü</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'satilik', 'kiralik'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilters(prev => ({ ...prev, type }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        filters.type === type
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {type === 'all' ? 'Tümü' : type === 'satilik' ? 'Satılık' : 'Kiralık'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori</label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[
                    { id: 'all', label: 'Tümü' },
                    { id: 'konut', label: 'Konut' },
                    { id: 'ticari', label: 'Ticari' },
                    { id: 'arsa', label: 'Arsa' },
                    { id: 'proje', label: 'Proje' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        filters.category === cat.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Oda Sayısı */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Oda Sayısı</label>
                <select
                  value={filters.roomCount || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, roomCount: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                >
                  <option value="all">Tüm Oda Tipleri</option>
                  <option value="1+1">1+1</option>
                  <option value="2+1">2+1</option>
                  <option value="3+1">3+1</option>
                  <option value="4+1">4+1</option>
                  <option value="4+2">4+2</option>
                  <option value="Villa">Villa / Müstakil</option>
                  <option value="Arsa">Arsa</option>
                </select>
              </div>

              {/* Fiyat Aralığı */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Fiyat Aralığı (TL)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Fiyat (₺)"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Max Fiyat (₺)"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              {/* İlçe */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">İlçe</label>
                <select
                  value={filters.district || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                >
                  <option value="all">Tüm Sivas İlçeleri</option>
                  <option value="Merkez">Sivas Merkez</option>
                  <option value="Şarkışla">Şarkışla</option>
                  <option value="Suşehri">Suşehri</option>
                  <option value="Zara">Zara</option>
                  <option value="Gemerek">Gemerek</option>
                  <option value="Kangal">Kangal</option>
                  <option value="Divriği">Divriği</option>
                  <option value="Yıldızeli">Yıldızeli</option>
                  <option value="Gürün">Gürün</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 pt-5 border-t border-slate-100 mt-5">
              <button
                onClick={() => {
                  setFilters({ type: 'all', category: 'all', city: 'all', district: 'all', roomCount: 'all', agentId: 'all', search: '', minPrice: '', maxPrice: '' });
                  setShowFilterModal(false);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Sıfırla
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Uygula ({listings.length} İlan)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
