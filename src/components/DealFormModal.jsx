import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { X, Trophy, DollarSign, Building, Check, Sparkles } from './Icons';

export default function DealFormModal({ listings, onClose, onDealSuccess }) {
  const { currentUser, users, isBroker } = useAuth();

  const [selectedListingId, setSelectedListingId] = useState('');
  const [dealTitle, setDealTitle] = useState('');
  const [dealType, setDealType] = useState('satilik');
  const [dealPrice, setDealPrice] = useState('');
  const [commissionRate, setCommissionRate] = useState('4'); // 4% default for sales
  const [commissionAmount, setCommissionAmount] = useState('');
  const [agentSharePercent, setAgentSharePercent] = useState('50'); // 50% agent split
  const [agentId, setAgentId] = useState(currentUser?.id || '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // If a listing is selected from the dropdown, autofill details
  const handleListingChange = (id) => {
    setSelectedListingId(id);
    const listing = listings.find(l => l.id === id);
    if (listing) {
      setDealTitle(listing.title);
      setDealType(listing.type);
      setDealPrice(listing.price);
      setAgentId(listing.agentId || currentUser?.id);

      // default commission calculation
      const comm = listing.type === 'kiralik' ? listing.price : Math.round(listing.price * 0.04);
      setCommissionAmount(comm);
    }
  };

  const handlePriceChange = (price) => {
    setDealPrice(price);
    if (price) {
      const num = Number(price);
      const rate = Number(commissionRate) / 100;
      setCommissionAmount(dealType === 'kiralik' ? num : Math.round(num * rate));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dealTitle || !dealPrice || !commissionAmount) {
      alert('Lütfen işlem başlığı, satış bedeli ve komisyon tutarını doldurunuz.');
      return;
    }

    setSaving(true);
    try {
      const selectedAgent = users.find(u => u.id === agentId) || currentUser;
      const comm = Number(commissionAmount);
      const agentShare = Math.round(comm * (Number(agentSharePercent) / 100));
      const brokerShare = comm - agentShare;

      await api.createDeal({
        listingId: selectedListingId || null,
        listingTitle: dealTitle,
        dealType,
        dealPrice: Number(dealPrice),
        commissionAmount: comm,
        agentShare,
        brokerShare,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        notes,
        closingDate: new Date().toISOString()
      });

      // CELEBRATION CONFETTI!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      onDealSuccess();
    } catch (err) {
      console.error('İşlem kaydetme hatası:', err);
      alert('İşlem kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-slate-950" />
              Satış / Kiralama Kapat (Ciro Girişi)
            </h3>
            <p className="text-xs text-amber-950 font-medium">
              Tebrikler! Kapanan işlemi ofis cirosuna ve danışman hedefine işleyin.
            </p>
          </div>
          <button onClick={onClose} className="text-amber-950 hover:bg-black/10 p-1.5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* Portföy Seçimi (Opsiyonel / Hazır İlan) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ofis Portföyünden Seç (Opsiyonel)
            </label>
            <select
              value={selectedListingId}
              onChange={(e) => handleListingChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="">-- Serbest İşlem / Portföy Seçimi Yap --</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>
                  #{l.id} - {l.title} ({formatCurrency(l.price)})
                </option>
              ))}
            </select>
          </div>

          {/* İşlem Başlığı */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">İşlem / Mülk Başlığı *</label>
            <input
              type="text"
              required
              placeholder="Örn: Caddebostan 3+1 Daire Satışı"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          {/* İşlem Türü & Kapatan Danışman */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">İşlem Türü</label>
              <select
                value={dealType}
                onChange={(e) => {
                  setDealType(e.target.value);
                  if (dealPrice) handlePriceChange(dealPrice);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="satilik">Satış</option>
                <option value="kiralik">Kiralama</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kapatan Danışman</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role === 'broker' ? 'Broker' : 'Danışman'})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Satış Tutarı (TL) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Satış / Kira Bedeli (TL) *</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                required
                placeholder="Örn: 18500000"
                value={dealPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Komisyon Tutarı & Paylaşım Oranı */}
          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 space-y-3">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Komisyon & Hizmet Bedeli Dağılımı
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-emerald-900 font-semibold mb-1">Alınan Toplam Komisyon (TL) *</label>
                <input
                  type="number"
                  required
                  placeholder="Örn: 740000"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs font-black text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-[11px] text-emerald-900 font-semibold mb-1">Danışman Payı (%)</label>
                <select
                  value={agentSharePercent}
                  onChange={(e) => setAgentSharePercent(e.target.value)}
                  className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                >
                  <option value="40">%40 Danışman / %60 Ofis</option>
                  <option value="50">%50 Danışman / %50 Ofis</option>
                  <option value="60">%60 Danışman / %40 Ofis</option>
                  <option value="70">%70 Danışman / %30 Ofis</option>
                  <option value="100">%100 Danışman</option>
                </select>
              </div>
            </div>

            {commissionAmount && (
              <div className="pt-2 border-t border-emerald-200/80 flex justify-between text-xs font-bold">
                <span className="text-emerald-800">
                  Danışman Primi: {formatCurrency(Math.round(Number(commissionAmount) * (Number(agentSharePercent) / 100)))}
                </span>
                <span className="text-emerald-900">
                  Ofis Payı: {formatCurrency(Number(commissionAmount) - Math.round(Number(commissionAmount) * (Number(agentSharePercent) / 100)))}
                </span>
              </div>
            )}
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kapanış Notları & Müşteri Görüşü</label>
            <textarea
              rows={2}
              placeholder="Örn: Tapu devri sorunsuz yapıldı, alıcı çok memnun..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : 'Satışı Kapat & Kutla 🎉'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
