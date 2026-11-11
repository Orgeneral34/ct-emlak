import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { 
  X, Sparkles, Building, User, Phone, Check, 
  MapPin, Flame, DollarSign, Layers, FileText, CheckCircle2,
  AlertCircle, ArrowRight
} from './Icons';

const SIVAS_NEIGHBORHOODS = [
  'Kılavuz', 'İstasyon', 'İstasyon Caddesi', 'Gültepe', 
  'Mevlana', 'Paşabey', 'Yenişehir', 'Alibaba', 
  'Kümbet', 'Pulur', 'Fatih', 'Diriliş', 
  'Mehmetpaşa', 'Altuntabak', 'Tuzlugöl', 'Şeyhşamil', 
  'Kaleardı', 'Meydan', 'Organize Sanayi', 'Üniversite'
];

const ROOM_OPTIONS = ['1+1', '2+1', '3+1', '4+1', '5+1', 'Dubleks', 'Villa', 'Dükkan', 'Arsa'];

export default function DemandFormModal({ demandToEdit, onClose, onSaveSuccess }) {
  const { currentUser, isBroker } = useAuth();

  const [formData, setFormData] = useState({
    title: demandToEdit?.title || '',
    clientName: demandToEdit?.clientName || '',
    clientPhone: demandToEdit?.clientPhone || '',
    clientEmail: demandToEdit?.clientEmail || '',
    type: demandToEdit?.type || 'satilik',
    category: demandToEdit?.category || 'konut',
    city: demandToEdit?.city || 'Sivas',
    district: demandToEdit?.district || 'Merkez',
    neighborhoods: demandToEdit?.neighborhoods || ['Kılavuz'],
    roomCounts: demandToEdit?.roomCounts || ['3+1'],
    minPrice: demandToEdit?.minPrice ?? 3000000,
    maxPrice: demandToEdit?.maxPrice ?? 5000000,
    minM2: demandToEdit?.minM2 || '',
    maxM2: demandToEdit?.maxM2 || '',
    urgency: demandToEdit?.urgency || 'sicak',
    notes: demandToEdit?.notes || '',
    status: demandToEdit?.status || 'aktif',
    agentId: demandToEdit?.agentId || currentUser?.id || 'USR-01',
    agentName: demandToEdit?.agentName || currentUser?.name || 'Ahmet Yılmaz',
    agentPhone: demandToEdit?.agentPhone || currentUser?.phone || '0532 111 00 01'
  });

  const [saving, setSaving] = useState(false);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showLiveMatchesPreview, setShowLiveMatchesPreview] = useState(false);

  // Real-time live match preview as user tweaks form
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveMatchPreview();
    }, 350);
    return () => clearTimeout(timer);
  }, [formData.type, formData.category, formData.neighborhoods, formData.roomCounts, formData.minPrice, formData.maxPrice]);

  const fetchLiveMatchPreview = async () => {
    try {
      setLoadingPreview(true);
      const res = await api.previewMatch({
        demand: {
          type: formData.type,
          category: formData.category,
          neighborhoods: formData.neighborhoods,
          roomCounts: formData.roomCounts,
          minPrice: Number(formData.minPrice) || 0,
          maxPrice: Number(formData.maxPrice) || Infinity,
          status: 'aktif'
        }
      });
      setLiveMatches(res.matches || []);
    } catch (err) {
      console.error('Eşleşme önizleme hatası:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const toggleNeighborhood = (neigh) => {
    setFormData(prev => {
      const exists = prev.neighborhoods.includes(neigh);
      const updated = exists 
        ? prev.neighborhoods.filter(n => n !== neigh)
        : [...prev.neighborhoods, neigh];
      return { ...prev, neighborhoods: updated };
    });
  };

  const toggleRoom = (room) => {
    setFormData(prev => {
      const exists = prev.roomCounts.includes(room);
      const updated = exists 
        ? prev.roomCounts.filter(r => r !== room)
        : [...prev.roomCounts, room];
      return { ...prev, roomCounts: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientPhone) {
      alert('Lütfen müşteri adı ve telefonunu giriniz.');
      return;
    }
    if (Number(formData.minPrice) > Number(formData.maxPrice) && Number(formData.maxPrice) > 0) {
      alert('Asgari bütçe, azami bütçeden büyük olamaz.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        minPrice: Number(formData.minPrice) || 0,
        maxPrice: Number(formData.maxPrice) || 0,
        minM2: formData.minM2 ? Number(formData.minM2) : null,
        maxM2: formData.maxM2 ? Number(formData.maxM2) : null,
        title: formData.title || `${formData.neighborhoods.slice(0, 2).join('/')} ${formData.roomCounts.join('/')} ${formData.type === 'satilik' ? 'Satılık' : 'Kiralık'} Arayışı`
      };

      let result;
      if (demandToEdit?.id) {
        result = await api.updateDemand(demandToEdit.id, payload);
      } else {
        result = await api.createDemand(payload);
      }

      onSaveSuccess(result);
    } catch (err) {
      console.error('Talep kaydetme hatası:', err);
      alert(err.message || 'Talep kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-4xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800 border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2 text-white">
                {demandToEdit ? 'Talebi Güncelle' : 'Yeni Alıcı / Kiracı Talebi Oluştur'}
              </h3>
              <p className="text-xs text-slate-400">
                Kriterleri girin; sistem portföydeki uygun ilanlarla otomatik eşleştirecektir.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Match Notification Ribbon */}
        <div className={`px-4 py-2.5 transition-colors border-b ${
          liveMatches.length > 0 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-950'
        } flex items-center justify-between`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className={`w-2.5 h-2.5 rounded-full animate-ping ${liveMatches.length > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>
              {loadingPreview ? (
                'Portföy taranıyor...'
              ) : liveMatches.length > 0 ? (
                `🎯 Harika! Şu an portföyde bu kritere uyan ${liveMatches.length} adet ilan bulundu (%${liveMatches[0].score} Uyum)`
              ) : (
                'Şu an bu kritere tam uyan portföy yok. İlan girildiğinde bildirim alacaksınız.'
              )}
            </span>
          </div>

          {liveMatches.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLiveMatchesPreview(!showLiveMatchesPreview)}
              className="text-xs font-extrabold text-emerald-700 underline hover:text-emerald-900"
            >
              {showLiveMatchesPreview ? 'Gizle' : 'Önizle'}
            </button>
          )}
        </div>

        {/* Live Matches Preview Drawer */}
        {showLiveMatchesPreview && liveMatches.length > 0 && (
          <div className="bg-emerald-50/70 border-b border-emerald-200 p-3 max-h-48 overflow-y-auto space-y-2">
            <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider block">
              Eşleşen Portföyler:
            </span>
            {liveMatches.slice(0, 3).map(({ listing, score, reasons }) => (
              <div key={listing.id} className="bg-white p-2.5 rounded-xl border border-emerald-300 shadow-xs flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900 truncate max-w-xs">{listing.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {listing.district} / {listing.neighborhood} • {listing.roomCount} • <strong className="text-emerald-700">{formatCurrency(listing.price)}</strong>
                  </p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs shrink-0">
                  %{score} Uyum
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* Müşteri Bilgileri */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <User className="w-4 h-4 text-blue-600" />
              Müşteri & İletişim Bilgileri
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Müşteri Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet Fatih Kaya"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  placeholder="Örn: 0532 555 12 34"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Aciliyet & Sıcaklık Durumu</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sicak">🔥 Çok Sıcak (Peşinatı Hazır / Hemen Alıcı)</option>
                  <option value="ilik">☀️ Ilık (Piyasayı Araştırıyor / 1-2 Ay)</option>
                  <option value="yatirim">💎 Yatırımcı / Fırsat Bekliyor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Talep Başlığı (İsteğe Bağlı)</label>
                <input
                  type="text"
                  placeholder="Örn: Kılavuz Mahallesi 3+1 Daire Arayışı"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* İşlem Türü & Kategori */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">İşlem Türü</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'satilik' })}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition border ${
                    formData.type === 'satilik'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Satın Almak İstiyor
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'kiralik' })}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition border ${
                    formData.type === 'kiralik'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Kiralamak İstiyor
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ana Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="konut">Konut / Daire</option>
                <option value="arsa">Arsa / Arazi</option>
                <option value="ticari">Ticari / İşyeri</option>
                <option value="villa">Villa / Müstakil</option>
              </select>
            </div>
          </div>

          {/* Bütçe Aralığı (Min - Max TL) */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Bütçe Aralığı (TL) *
              </label>
              <span className="text-xs font-black text-blue-700">
                {formatCompactCurrency(formData.minPrice)} - {formatCompactCurrency(formData.maxPrice)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Minimum Bütçe</span>
                <input
                  type="number"
                  step="50000"
                  required
                  placeholder="Örn: 3000000"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Maksimum Bütçe</span>
                <input
                  type="number"
                  step="50000"
                  required
                  placeholder="Örn: 5000000"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Hızlı Bütçe Butonları */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Hızlı Seçim:</span>
              {[
                { label: '2M - 3.5M ₺', min: 2000000, max: 3500000 },
                { label: '3M - 5M ₺', min: 3000000, max: 5000000 },
                { label: '5M - 7.5M ₺', min: 5000000, max: 7500000 },
                { label: '7.5M - 12M ₺', min: 7500000, max: 12000000 },
                { label: '15.000 - 25.000 ₺ (Kira)', min: 15000, max: 25000 }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, minPrice: p.min, maxPrice: p.max })}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-[11px] font-bold text-slate-700 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sivas Mahalleleri (Çoklu Seçim) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Aranan Mahalleler (Sivas)
              </label>
              <span className="text-[11px] text-slate-500">
                {formData.neighborhoods.length} Mahalle Seçildi
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
              {SIVAS_NEIGHBORHOODS.map(neigh => {
                const isSelected = formData.neighborhoods.includes(neigh);
                return (
                  <button
                    key={neigh}
                    type="button"
                    onClick={() => toggleNeighborhood(neigh)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    <span>{neigh}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Oda Sayısı (Çoklu Seçim) */}
          {formData.category === 'konut' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Oda Sayısı Tercihleri
                </label>
                <span className="text-[11px] text-slate-500">
                  {formData.roomCounts.join(', ') || 'Seçilmedi'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ROOM_OPTIONS.map(room => {
                  const isSelected = formData.roomCounts.includes(room);
                  return (
                    <button
                      key={room}
                      type="button"
                      onClick={() => toggleRoom(room)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-slate-950" />}
                      <span>{room}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metrekare Aralığı */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min m²</label>
              <input
                type="number"
                placeholder="Örn: 120"
                value={formData.minM2}
                onChange={(e) => setFormData({ ...formData, minM2: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max m²</label>
              <input
                type="number"
                placeholder="Örn: 160"
                value={formData.maxM2}
                onChange={(e) => setFormData({ ...formData, maxM2: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Özel Notlar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Müşteri Notu & Özel İstekler</label>
            <textarea
              rows={2}
              placeholder="Örn: Kılavuz Mahallesinde, güney cephe, okul ve parka yakın, ara kat, krediye uygun 3+1 daire arıyor."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : demandToEdit ? 'Talebi Güncelle' : 'Talebi Oluştur & Eşleştir'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
