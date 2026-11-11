import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency, formatCompactCurrency, createWhatsAppLink } from '../utils/formatters';
import { 
  X, Sparkles, Building, Users, Phone, MessageSquare, 
  CheckCircle2, ArrowRight, Share2, Flame 
} from './Icons';

export default function SmartMatchModal({ 
  customer, 
  listing, 
  onClose, 
  onSelectListing, 
  onSelectCustomer 
}) {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, [customer, listing]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      if (customer) {
        const res = await api.matchForCustomer(customer.id);
        setMatchData(res);
      } else if (listing) {
        const res = await api.matchForListing(listing.id);
        setMatchData(res);
      }
    } catch (err) {
      console.error('Akıllı eşleştirme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800">
        
        {/* Header */}
        <div className="p-4 bg-amber-500 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-base">Akıllı Portföy - Talep Eşleştirme</h3>
              <p className="text-xs font-semibold text-amber-950">
                {customer ? `${customer.name} için Uyumlu Portföyler` : `#${listing?.id} için Potansiyel Alıcılar`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10">
            <X className="w-5 h-5 text-slate-950" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold">Ofis veritabanı taranıyor ve eşleştiriliyor...</p>
            </div>
          ) : customer ? (
            // A: EŞLEŞEN PORTFÖYLER (CUSTOMER MATCHES)
            <div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-3 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Aranan Kriterler:</span>
                <p className="text-slate-600">
                  {customer.desiredDistricts?.join(', ')} • {customer.desiredRoomCounts?.join(', ')} • {formatCompactCurrency(customer.budgetMin)} - {formatCompactCurrency(customer.budgetMax)} Bütçe
                </p>
              </div>

              {matchData?.matches?.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Şu an bu kriterlere uyan aktif portföy bulunamadı.
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Bulunan Uygun Portföyler ({matchData?.matches?.length})
                  </span>

                  {matchData?.matches?.map(({ listing: l, score, reasons }) => (
                    <div
                      key={l.id}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex gap-2.5">
                          <img
                            src={l.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border"
                          />
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 block">{l.district}, {l.neighborhood}</span>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{l.title}</h4>
                            <p className="text-xs font-black text-amber-600 mt-0.5">{formatCurrency(l.price)}</p>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-300">
                            %{score} Uyum
                          </span>
                        </div>
                      </div>

                      {/* Match reasons */}
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {reasons.map((r, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            ✓ {r}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400">Danışman: {l.agentName}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              onClose();
                              onSelectListing(l);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg"
                          >
                            İlana Git
                          </button>
                          <a
                            href={createWhatsAppLink(customer.phone, `Merhaba ${customer.name}, aradığınız kriterlere uygun yeni bir portföyümüz var:\n\n🏡 *${l.title}*\n📍 ${l.district}, ${l.neighborhood}\n💰 ${formatCurrency(l.price)}\n\nDetayları incelemek ister misiniz?`)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Müşteriye Sun</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // B: EŞLEŞEN POTANSİYEL ALICILAR (LISTING MATCHES)
            <div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-3 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Portföy Özeti:</span>
                <p className="text-slate-600">
                  {listing?.title} • {formatCurrency(listing?.price)} • {listing?.district} • {listing?.roomCount}
                </p>
              </div>

              {matchData?.matchedCustomers?.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Sistemde bu fiyatta ve bölgede arayışta olan aktif müşteri bulunamadı.
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Bu Mülkü Alabilecek Müşteriler ({matchData?.matchedCustomers?.length})
                  </span>

                  {matchData?.matchedCustomers?.map(({ customer: c, score, reasons }) => (
                    <div
                      key={c.id}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{c.name}</h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full">
                              🔥 Sıcak
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Bütçe: {formatCompactCurrency(c.budgetMin)} - {formatCompactCurrency(c.budgetMax)}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-300">
                          %{score} Eşleşme
                        </span>
                      </div>

                      {c.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg">
                          "{c.notes}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400">Danışman: {c.agentName}</span>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${c.phone}`}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-blue-100 rounded-lg"
                            title="Ara"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={createWhatsAppLink(c.phone, `Merhaba ${c.name}, Hankan Emlak'tan aradığınız kriterlere uygun #${listing?.id} kodlu ${listing?.title} portföyümüz için görüşebilir miyiz?`)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
