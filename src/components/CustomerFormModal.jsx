import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, UserPlus, Check, DollarSign, MapPin } from './Icons';

export default function CustomerFormModal({ onClose, onLeadCreated }) {
  const { currentUser, isBroker } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'alici', // alici, kiraci, yatirimci
    urgency: 'sicak', // sicak, ilik, soguk
    budgetMin: '4000000',
    budgetMax: '6500000',
    desiredCity: 'Sivas',
    desiredDistricts: 'Merkez, İstasyon',
    desiredRoomCounts: '3+1',
    stage: 'yeni_talep',
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Lütfen müşteri adı ve telefon numarasını giriniz.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        type: formData.type,
        urgency: formData.urgency,
        budgetMin: Number(formData.budgetMin) || 0,
        budgetMax: Number(formData.budgetMax) || 0,
        desiredCity: formData.desiredCity,
        desiredDistricts: formData.desiredDistricts.split(',').map(d => d.trim()).filter(Boolean),
        desiredCategories: ['konut'],
        desiredRoomCounts: formData.desiredRoomCounts.split(',').map(r => r.trim()).filter(Boolean),
        stage: formData.stage,
        agentId: currentUser?.id,
        agentName: currentUser?.name,
        notes: formData.notes
      };

      const newLead = await api.createCrmLead(payload);
      onLeadCreated(newLead);
    } catch (err) {
      console.error('Müşteri kaydetme hatası:', err);
      alert('Müşteri kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800">
        
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-200" />
              Yeni Alıcı / Kiracı Müşteri Talebi Ekle
            </h3>
            <p className="text-xs text-indigo-100">
              Kriterleri girin, sistem ofisteki uygun evleri anında eşleştirsin.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* Müşteri Adı & Telefon */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Müşteri Ad Soyad *</label>
              <input
                type="text"
                required
                placeholder="Örn: Mehmet Öz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Numarası *</label>
              <input
                type="text"
                required
                placeholder="0532 ..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Müşteri Türü & Aciliyet */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Talep Türü</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="alici">Satılık Arayan (Alıcı)</option>
                <option value="kiraci">Kiralık Arayan (Kiracı)</option>
                <option value="yatirimci">Yatırımcı</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Aciliyet Derecesi</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="sicak">🔥 Çok Sıcak (Hemen Alacak)</option>
                <option value="ilik">⏳ Ilık (1-2 Ay İçinde)</option>
                <option value="soguk">❄️ Soğuk (Piyasa Bakıyor)</option>
              </select>
            </div>
          </div>

          {/* Bütçe Min - Max (TL) */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Bütçe Aralığı (TL)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min Bütçe (₺)"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              />
              <input
                type="number"
                placeholder="Max Bütçe (₺)"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Aranan Bölge & Oda Sayısı */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Aranan İlçe(ler)</label>
              <input
                type="text"
                placeholder="Örn: Kadıköy, Beşiktaş"
                value={formData.desiredDistricts}
                onChange={(e) => setFormData({ ...formData, desiredDistricts: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Oda Tercihi</label>
              <input
                type="text"
                placeholder="Örn: 3+1, 4+1"
                value={formData.desiredRoomCounts}
                onChange={(e) => setFormData({ ...formData, desiredRoomCounts: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Müşteri Notları */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Özel İstekler & Arama Notu</label>
            <textarea
              rows={2}
              placeholder="Örn: Kredisi hazır, otopark şart, metroya yakın olsun..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : 'Talebi Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
