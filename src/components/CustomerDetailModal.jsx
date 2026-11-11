import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  formatCurrency, formatCompactCurrency, formatDate, 
  PIPELINE_STAGES, getStageInfo, getUrgencyBadge, createWhatsAppLink 
} from '../utils/formatters';
import { 
  X, Phone, MessageSquare, Sparkles, Plus, Calendar, 
  CheckCircle2, Clock, Trash2, Edit3, User, MapPin, 
  DollarSign, FileText, ChevronRight
} from './Icons';

export default function CustomerDetailModal({ 
  customer, 
  onClose, 
  onOpenSmartMatch, 
  onCustomerUpdated, 
  onDeleteCustomer 
}) {
  const { currentUser, isBroker } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loadingActs, setLoadingActs] = useState(true);
  const [showAddAct, setShowAddAct] = useState(false);

  // New activity form state
  const [actType, setActType] = useState('yer_gosterme');
  const [actContent, setActContent] = useState('');
  const [actListingTitle, setActListingTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [savingAct, setSavingAct] = useState(false);

  useEffect(() => {
    if (customer?.id) {
      loadActivities();
    }
  }, [customer?.id]);

  const loadActivities = async () => {
    try {
      const data = await api.getActivities(customer.id);
      setActivities(data);
    } catch (err) {
      console.error('Aktiviteler yüklenirken hata:', err);
    } finally {
      setLoadingActs(false);
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      await api.updateCrmLead(customer.id, { stage: newStage });
      onCustomerUpdated({ ...customer, stage: newStage });
    } catch (err) {
      console.error('Aşama güncelleme hatası:', err);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!actContent) return;

    setSavingAct(true);
    try {
      const newAct = await api.createActivity({
        customerId: customer.id,
        customerName: customer.name,
        listingTitle: actListingTitle || 'Genel Görüşme',
        type: actType,
        agentId: currentUser?.id,
        agentName: currentUser?.name,
        content: actContent,
        reminderDate: reminderDate || null,
        isCompleted: true
      });

      setActivities(prev => [newAct, ...prev]);
      setActContent('');
      setActListingTitle('');
      setReminderDate('');
      setShowAddAct(false);
    } catch (err) {
      console.error('Aktivite kaydetme hatası:', err);
    } finally {
      setSavingAct(false);
    }
  };

  if (!customer) return null;

  const currentStage = getStageInfo(customer.stage);
  const urgency = getUrgencyBadge(customer.urgency);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">{customer.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgency.color}`}>
                  {urgency.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {customer.phone} • Danışman: {customer.agentName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* Direct Communication Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${customer.phone}`}
              className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-2xl border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Telefonla Ara</span>
            </a>

            <a
              href={createWhatsAppLink(customer.phone, `Merhaba ${customer.name}, gayrimenkul talebiniz ile ilgili yazıyorum.`)}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onOpenSmartMatch(customer);
              }}
              className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Portföy Eşleştir</span>
            </button>
          </div>

          {/* Satış Hunisi Aşaması Seçici */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Mevcut Satış Hunisi Aşaması:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full border text-[11px] ${currentStage.lightColor}`}>
                {currentStage.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
              {PIPELINE_STAGES.map(s => (
                <button
                  key={s.key}
                  onClick={() => handleStageChange(s.key)}
                  className={`p-2 rounded-xl text-[11px] font-bold border transition text-left ${
                    customer.stage === s.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aranan Kriterler ve Bütçe */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-700 block">Aranan Gayrimenkul Kriterleri:</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Bütçe Aralığı</span>
                <span className="font-bold text-indigo-700 text-sm">
                  {formatCurrency(customer.budgetMin)} - {formatCurrency(customer.budgetMax)}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">İstenen Bölgeler</span>
                <span className="font-bold text-slate-800">
                  {customer.desiredDistricts?.join(', ') || 'Fark etmez'}
                </span>
              </div>
            </div>
            {customer.notes && (
              <div className="bg-white p-3 rounded-xl border border-slate-100 italic text-slate-700">
                "{customer.notes}"
              </div>
            )}
          </div>

          {/* Yer Gösterme Formları & Aktivite Geçmişi */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Yer Gösterme & Aktivite Kayıtları
              </h4>

              <button
                onClick={() => setShowAddAct(!showAddAct)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddAct ? 'Kapat' : 'Yeni Sunum / Not Ekle'}</span>
              </button>
            </div>

            {/* Yeni Sunum / Not Formu */}
            {showAddAct && (
              <form onSubmit={handleAddActivity} className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-900 mb-0.5">Aktivite Türü</label>
                    <select
                      value={actType}
                      onChange={(e) => setActType(e.target.value)}
                      className="w-full p-2 bg-white rounded-xl border border-indigo-200 font-semibold"
                    >
                      <option value="yer_gosterme">Yer Gösterme (Sunum)</option>
                      <option value="telefon_gorusmesi">Telefon Görüşmesi</option>
                      <option value="teklif">Fiyat Teklifi / Pazarlık</option>
                      <option value="kapora">Kapora Alındı</option>
                      <option value="not">Özel Not</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-900 mb-0.5">Gösterilen Mülk / Konu</label>
                    <input
                      type="text"
                      placeholder="Örn: Caddebostan 3+1 Daire"
                      value={actListingTitle}
                      onChange={(e) => setActListingTitle(e.target.value)}
                      className="w-full p-2 bg-white rounded-xl border border-indigo-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 mb-0.5">Görüşme & Sunum Notları *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Mülkü gezdi, beğendi, salonu büyük buldu ancak fiyat 15M olursa teklif verecek..."
                    value={actContent}
                    onChange={(e) => setActContent(e.target.value)}
                    className="w-full p-2 bg-white rounded-xl border border-indigo-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={savingAct}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow"
                  >
                    {savingAct ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            )}

            {/* Geçmiş Aktivite Listesi */}
            <div className="space-y-2">
              {loadingActs ? (
                <p className="text-center text-slate-400 py-4 text-xs">Aktiviteler yükleniyor...</p>
              ) : activities.length === 0 ? (
                <p className="text-center text-slate-400 py-4 text-xs italic">
                  Henüz kaydedilmiş bir yer gösterme veya görüşme formu yok.
                </p>
              ) : (
                activities.map(act => (
                  <div key={act.id} className="p-3 bg-white border border-slate-200 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="font-bold text-indigo-700">
                        {act.type === 'yer_gosterme' ? '🏡 Yer Gösterme Formu' : act.type === 'teklif' ? '📝 Teklif Alındı' : '📞 Görüşme'}
                      </span>
                      <span className="text-[10px]">{formatDate(act.date, true)}</span>
                    </div>
                    {act.listingTitle && (
                      <p className="font-semibold text-slate-800 text-[11px]">
                        Konu / Portföy: {act.listingTitle}
                      </p>
                    )}
                    <p className="text-slate-600 italic">
                      "{act.content}"
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      Kaydeden Danışman: {act.agentName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Delete */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <button
            onClick={() => onDeleteCustomer(customer.id)}
            className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Müşteriyi Sil</span>
          </button>
          <span className="text-slate-400">Kayıt: #{customer.id}</span>
        </div>
      </div>
    </div>
  );
}
