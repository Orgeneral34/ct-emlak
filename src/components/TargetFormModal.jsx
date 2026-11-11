import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Target, Check, Calendar, DollarSign } from './Icons';

export default function TargetFormModal({ onClose, onTargetSaved }) {
  const { users } = useAuth();
  const [selectedAgentId, setSelectedAgentId] = useState('USR-03');
  const [period, setPeriod] = useState('weekly'); // weekly or monthly
  const [targetRevenue, setTargetRevenue] = useState('350000');
  const [targetDeals, setTargetDeals] = useState('2');
  const [targetListings, setTargetListings] = useState('3');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const agent = users.find(u => u.id === selectedAgentId);
      const periodKey = period === 'weekly' ? '2026-W40' : '2026-10';

      await api.saveTarget({
        agentId: selectedAgentId,
        agentName: agent ? agent.name : 'Tüm Danışmanlar',
        period,
        periodKey,
        targetRevenue: Number(targetRevenue),
        targetDeals: Number(targetDeals),
        targetListings: Number(targetListings),
        note
      });

      onTargetSaved();
    } catch (err) {
      console.error('Hedef kaydetme hatası:', err);
      alert('Hedef kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl animate-slide-up text-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Saha Danışmanına Hedef Ata
            </h3>
            <p className="text-xs text-slate-400">
              Broker / Yönetici Yetkisiyle Haftalık & Aylık Hedef Tanımlama
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-3 text-xs sm:text-sm">
          
          {/* Danışman Seçimi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hedef Verilecek Danışman</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
            >
              <option value="all">⭐ Tüm 48 Saha Danışmanına Genel Hedef</option>
              {users.filter(u => u.role === 'agent').map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.title})
                </option>
              ))}
            </select>
          </div>

          {/* Dönem: Haftalık vs Aylık */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hedef Dönemi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeriod('weekly')}
                className={`py-2 rounded-xl font-bold border transition ${
                  period === 'weekly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700'
                }`}
              >
                Haftalık Hedef (Bu Hafta)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`py-2 rounded-xl font-bold border transition ${
                  period === 'monthly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700'
                }`}
              >
                Aylık Hedef (Bu Ay)
              </button>
            </div>
          </div>

          {/* Hedef Ciro (TL) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hedef Ciro (TL) *</label>
            <input
              type="number"
              required
              placeholder="Örn: 350000"
              value={targetRevenue}
              onChange={(e) => setTargetRevenue(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900"
            />
          </div>

          {/* Adet Hedefleri: İşlem & Portföy */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hedef Kapanış Adedi</label>
              <input
                type="number"
                value={targetDeals}
                onChange={(e) => setTargetDeals(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Yeni Portföy Hedefi</label>
              <input
                type="number"
                value={targetListings}
                onChange={(e) => setTargetListings(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Motivasyon / Açıklama Notu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Broker Motivasyon Notu</label>
            <input
              type="text"
              placeholder="Örn: Bağdat Caddesi bölgesinde portföy sayımızı artıralım..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : 'Hedefi Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
