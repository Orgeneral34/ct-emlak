import React from 'react';
import { formatCurrency, formatCompactCurrency, createWhatsAppLink } from '../utils/formatters';
import { 
  X, Sparkles, CheckCircle2, Phone, MessageSquare, 
  ArrowRight, ExternalLink, Flame, Building2, User
} from './Icons';

export default function MatchAlertModal({ 
  type = 'listing_matched_demands', // 'listing_matched_demands' or 'demand_matched_listings'
  sourceItem, 
  matches = [], 
  onClose,
  onOpenListing,
  onOpenDemand
}) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-dark-950/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800 border border-amber-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-amber-500 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-slate-950 animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 bg-white/30 px-2 py-0.5 rounded-full inline-block mb-0.5">
                Akıllı Ofis Eşleşmesi
              </span>
              <h3 className="font-black text-base sm:text-lg text-slate-950">
                {type === 'listing_matched_demands'
                  ? `🎉 Harika Haber! ${matches.length} Talep Eşleşti!`
                  : `🎯 Tebrikler! ${matches.length} Uygun Portföy Bulundu!`}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-slate-950" />
          </button>
        </div>

        {/* Source item info banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-950 flex items-center justify-between">
          <span className="truncate">
            <strong>İşlem Yapılan:</strong> {sourceItem?.title || sourceItem?.clientName}
          </span>
          <span className="font-extrabold shrink-0 bg-amber-200/80 px-2 py-0.5 rounded-lg text-[11px]">
            {matches.length} Eşleşme
          </span>
        </div>

        {/* Matches List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {matches.map((item, idx) => {
            const isDemandMatch = Boolean(item.demand);
            const target = item.demand || item.listing;
            const score = item.score || 0;
            const reasons = item.reasons || [];

            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border-2 border-amber-200 hover:border-amber-400 p-3.5 shadow-sm transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        score >= 85 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : score >= 70 
                          ? 'bg-amber-100 text-amber-900' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        %{score} UYUM
                      </span>
                      {target.urgency === 'sicak' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> Sıcak Alıcı
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-sm text-slate-900 leading-snug">
                      {isDemandMatch ? target.title : target.title}
                    </h4>

                    {isDemandMatch ? (
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        👤 <strong>{target.clientName}</strong> • Bütçe: {formatCurrency(target.minPrice)} - {formatCurrency(target.maxPrice)}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        📍 {target.district} / {target.neighborhood} • {target.roomCount} • <strong className="text-emerald-700">{formatCurrency(target.price)}</strong>
                      </p>
                    )}
                  </div>

                  {/* Danışman Avatar / Rozet */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block font-bold">İlgili Danışman:</span>
                    <span className="text-xs font-black text-slate-800">{target.agentName || 'Altın Emlak'}</span>
                  </div>
                </div>

                {/* Eşleşme Sebepleri */}
                <div className="bg-slate-50 p-2 rounded-xl text-[11px] space-y-1 border border-slate-100">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                    Eşleşen Kriterler:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {reasons.map((r, rIdx) => (
                      <span key={rIdx} className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  {isDemandMatch ? (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${target.clientPhone}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ara ({target.clientPhone})</span>
                      </a>
                      <a
                        href={createWhatsAppLink(target.clientPhone, `Merhaba ${target.clientName}, Altın Emlak Sivas olarak sistemimize aradığınız kriterlere uygun yeni bir portföy ekledik. Detayları paylaşmak isterim.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp'tan Yaz</span>
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenListing) onOpenListing(target);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition"
                    >
                      <span>Portföyü Görüntüle</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span className="text-[11px] text-slate-400 font-semibold">
                    {target.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            💡 Eşleşen kayıtlar ayrıca <strong>Bildirimler Çanında</strong> saklanmaktadır.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition"
          >
            Tamam / Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
