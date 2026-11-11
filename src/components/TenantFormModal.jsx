import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, User, Phone, Home, Calendar, DollarSign, 
  FileCheck, ShieldAlert, Check, Building2, UserCheck
} from './Icons';

export default function TenantFormModal({ tenantToEdit, onClose, onSaveSuccess }) {
  const { users, currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    tenantName: tenantToEdit?.tenantName || '',
    tenantPhone: tenantToEdit?.tenantPhone || '',
    tenantTc: tenantToEdit?.tenantTc || '',
    propertyId: tenantToEdit?.propertyId || '',
    propertyTitle: tenantToEdit?.propertyTitle || '',
    propertyAddress: tenantToEdit?.propertyAddress || '',
    district: tenantToEdit?.district || 'Merkez',
    neighborhood: tenantToEdit?.neighborhood || '',
    ownerName: tenantToEdit?.ownerName || '',
    ownerPhone: tenantToEdit?.ownerPhone || '',
    rentAmount: tenantToEdit?.rentAmount || '',
    depositAmount: tenantToEdit?.depositAmount || '',
    currency: tenantToEdit?.currency || 'TRY',
    startDate: tenantToEdit?.startDate || new Date().toISOString().slice(0, 10),
    endDate: tenantToEdit?.endDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
    paymentDay: tenantToEdit?.paymentDay || 1,
    hasEvictionCommitment: tenantToEdit?.hasEvictionCommitment ?? true,
    evictionDate: tenantToEdit?.evictionDate || '',
    increaseRate: tenantToEdit?.increaseRate || 65,
    status: tenantToEdit?.status || 'aktif',
    agentId: tenantToEdit?.agentId || currentUser?.id || 'USR-01',
    agentName: tenantToEdit?.agentName || currentUser?.name || 'Ahmet Yılmaz',
    notes: tenantToEdit?.notes || ''
  });

  useEffect(() => {
    // Load rental listings for quick dropdown selection
    api.getListings({ type: 'kiralik' })
      .then(res => setListings(res))
      .catch(e => console.error(e));
  }, []);

  const handleSelectListing = (e) => {
    const listId = e.target.value;
    const l = listings.find(item => item.id === listId);
    if (l) {
      setFormData(prev => ({
        ...prev,
        propertyId: l.id,
        propertyTitle: l.title,
        propertyAddress: l.address || `${l.district}, ${l.neighborhood}`,
        district: l.district || 'Merkez',
        neighborhood: l.neighborhood || '',
        rentAmount: l.price || prev.rentAmount,
        ownerName: l.ownerName || prev.ownerName,
        ownerPhone: l.ownerPhone || prev.ownerPhone
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tenantName.trim()) {
      setErrorMsg('Kiracı adı soyadı zorunludur.');
      return;
    }
    if (!formData.rentAmount) {
      setErrorMsg('Aylık kira tutarı zorunludur.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const selectedAgent = users.find(u => u.id === formData.agentId);
      const payload = {
        ...formData,
        agentName: selectedAgent ? selectedAgent.name : formData.agentName
      };

      if (tenantToEdit) {
        await api.updateTenant(tenantToEdit.id, payload);
      } else {
        await api.createTenant(payload);
      }
      onSaveSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Kira kaydı kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-dark-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-slide-up flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">
                {tenantToEdit ? 'Kiracı & Sözleşme Düzenle' : 'Yeni Kiracı & Kira Sözleşmesi Ekle'}
              </h3>
              <p className="text-xs text-slate-400">
                Halihazırda kiralanmış mülk, tahliye taahhütnamesi ve ödeme takibi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Kiracı Bilgileri */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-emerald-700">
              <User className="w-3.5 h-3.5" />
              1. Kiracı Bilgileri
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kiracı Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Dr. Mehmet Kaya"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefon Numarası *</label>
                <input
                  type="text"
                  required
                  placeholder="0542 000 00 00"
                  value={formData.tenantPhone}
                  onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">T.C. Kimlik No</label>
              <input
                type="text"
                placeholder="11 haneli T.C. Kimlik"
                maxLength={11}
                value={formData.tenantTc}
                onChange={(e) => setFormData({ ...formData, tenantTc: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Kiralanan Mülk & Portföy Bilgisi */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-blue-700">
              <Home className="w-3.5 h-3.5" />
              2. Kiralanan Gayrimenkul & Adres
            </h4>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mevcut Portföyden Hızlı Seç (Opsiyonel)</label>
              <select
                onChange={handleSelectListing}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="">-- Kiralık İlanlardan Seçebilirsiniz --</option>
                {listings.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.district}, {l.neighborhood}) - {l.price} TL
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mülk / Daire Başlığı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Mevlana Mah. 3+1 Kombili Lüks Daire"
                value={formData.propertyTitle}
                onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">İlçe</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mahalle</label>
                <input
                  type="text"
                  placeholder="Örn: İstasyon Caddesi veya Kümbet"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tam Adres</label>
              <input
                type="text"
                placeholder="Sokak, bina no, daire no..."
                value={formData.propertyAddress}
                onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mülk Sahibi Adı</label>
                <input
                  type="text"
                  placeholder="Ev sahibi isim..."
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mülk Sahibi Telefonu</label>
                <input
                  type="text"
                  placeholder="0532 ..."
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Kira Bedeli, Sözleşme Tarihleri & Tahliye Taahhütnamesi */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-amber-700">
              <DollarSign className="w-3.5 h-3.5" />
              3. Kira Bedeli & Sözleşme Şartları
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Aylık Kira (TRY) *</label>
                <input
                  type="number"
                  required
                  placeholder="15000"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-black text-amber-700 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Depozito Tutarı (TRY)</label>
                <input
                  type="number"
                  placeholder="30000"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kira Ödeme Günü</label>
                <select
                  value={formData.paymentDay}
                  onChange={(e) => setFormData({ ...formData, paymentDay: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>Her ayın {day}. günü</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sözleşme Başlangıç</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sözleşme Bitiş</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            {/* Tahliye Taahhütnamesi Checkbox */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-slate-900">Tahliye Taahhütnamesi Alındı mı?</p>
                <p className="text-[11px] text-slate-500">Mülk sahibinin hukuki güvencesi için noter veya yazılı taahhütname</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasEvictionCommitment}
                  onChange={(e) => setFormData({ ...formData, hasEvictionCommitment: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Yıllık Kira Artış Oranı (%)</label>
                <input
                  type="number"
                  placeholder="65"
                  value={formData.increaseRate}
                  onChange={(e) => setFormData({ ...formData, increaseRate: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kira & Sözleşme Durumu</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="aktif">Aktif (Düzenli Ödüyor)</option>
                  <option value="yenileme_zamani">Sözleşme Yenileme Zamanı Geldi</option>
                  <option value="gecikmede">Ödeme Gecikmede</option>
                  <option value="tahliye_edildi">Tahliye Edildi / Ayrıldı</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sorumlu Danışman</label>
              <select
                value={formData.agentId}
                onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'broker' ? 'Broker' : 'Danışman'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Özel Notlar (IBAN, ek teminat vb.)</label>
              <textarea
                rows={2}
                placeholder="Kira ödeme şekli, depozito koşulları, tahliye taahhütname tarihi vb..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : 'Kiracı & Sözleşmeyi Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
