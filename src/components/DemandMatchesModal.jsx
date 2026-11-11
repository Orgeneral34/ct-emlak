import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency, formatCompactCurrency, createWhatsAppLink } from '../utils/formatters';
import { 
  X, Sparkles, Building, Phone, MessageSquare, 
  CheckCircle2, ArrowRight, ExternalLink, Flame, MapPin
} from './Icons';

export default function DemandMatchesModal({ demand, onClose, onOpenListing }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demand?.id) {
      loadMatches();
    }
  }, [demand]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res = await api.getDemandMatches(demand.id);
      setMatches(res.matches || []);
    } catch (err) {
      console.error('Talep eşleşmeleri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!demand) return null;

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800 border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Talep Eşleşme Analizi
              </span>
              <h3 className="font-black text-base sm:text-lg text-white">
                {demand.clientName} için Uygun Portföyler
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demand Criteria Summary Card */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 text-xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-black text-slate-900 text-sm">
              {demand.title}
            </span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
              demand.type === 'satilik' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {demand.type === 'satilik' ? 'Satılık Arayışı' : 'Kiralık Arayışı'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 font-semibold">
            <span>📍 Bölgeler: <strong>{demand.neighborhoods?.join(', ') || 'Belirtilmedi'}</strong></span>
            <span>🏠 Oda: <strong>{demand.roomCounts?.join(', ') || 'Fark etmez'}</strong></span>
            <span>💰 Bütçe: <strong className="text-emerald-700">{formatCurrency(demand.minPrice)} - {formatCurrency(demand.maxPrice)}</strong></span>
          </div>
        </div>

        {/* Matches Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold">Veritabanındaki portföyler taranıyor...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Building className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-black text-sm text-slate-700">Şu An Eşleşen Portföy Bulunamadı</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Sistemimiz 7/24 hafızadadır. Saha elemanlarından biri bu kritere uyan bir ilan girdiğinde hemen otomatik bildirim alacaksınız.
              </p>
            </div>
          ) : (
            matches.map(({ listing, score, quality, reasons }) => (
              <div 
                key={listing.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 p-3.5 shadow-xs transition space-y-2.5"
              >
                <div className="flex gap-3">
                  <img
                    src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        score >= 85 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : score >= 70 
                          ? 'bg-amber-100 text-amber-900' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        %{score} UYUM
                      </span>

                      <span className="text-xs font-extrabold text-slate-400">
                        {listing.id}
                      </span>
                    </div>

                    <h4 className="font-black text-sm text-slate-900 truncate">
                      {listing.title}
                    </h4>

                    <p className="text-xs text-slate-600 mt-0.5">
                      📍 {listing.district} / {listing.neighborhood} • {listing.roomCount} • {listing.grossM2} m²
                    </p>

                    <p className="text-xs font-black text-emerald-700 mt-1">
                      {formatCurrency(listing.price)}
                    </p>
                  </div>
                </div>

                {/* Eşleşme Nedenleri */}
                <div className="bg-slate-50 p-2 rounded-xl text-[11px] space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {reasons.map((r, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-500 font-medium">
                    Portföy Danışmanı: <strong>{listing.agentName}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={createWhatsAppLink(demand.clientPhone, `Merhaba Sayın ${demand.clientName}, aradığınız kriterlere tam uyan harika bir portföyümüz bulunmaktadır:\n\n*${listing.title}*\n📍 Bölge: ${listing.neighborhood}\n🏠 Oda: ${listing.roomCount}\n💰 Fiyat: ${formatCurrency(listing.price)}\n\nDetayları konuşmak için ne zaman müsaitsiniz?`)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp'tan Müşteriye Sun</span>
                    </a>

                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenListing) onOpenListing(listing);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition"
                    >
                      <span>İlanı İncele</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
