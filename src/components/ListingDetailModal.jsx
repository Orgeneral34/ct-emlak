import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  formatCurrency, formatDate, getCategoryBadge, getStatusBadge, 
  createWhatsAppLink, getSahibindenSearchUrl, getTkgmUrl, getKeosImarUrl 
} from '../utils/formatters';
import { parseVideoUrl } from '../utils/videoHelper';
import { 
  X, MapPin, Bed, Maximize2, Building, Shield, Phone, 
  MessageSquare, Share2, Edit3, Trash2, CheckCircle2, 
  Lock, Eye, AlertCircle, Sparkles, Navigation, ExternalLink
} from './Icons';

export default function ListingDetailModal({ 
  listing, 
  onClose, 
  onEdit, 
  onDelete, 
  onOpenMap,
  onOpenSmartMatch
}) {
  const { currentUser, isBroker } = useAuth();
  const [currentListing, setCurrentListing] = useState(listing);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [mediaTab, setMediaTab] = useState('photos'); // 'photos' | 'video'
  const [toastMsg, setToastMsg] = useState('');
  const [isEditingParselId, setIsEditingParselId] = useState(false);
  const [inputParselId, setInputParselId] = useState('');
  const [isSavingParselId, setIsSavingParselId] = useState(false);

  React.useEffect(() => {
    setCurrentListing(listing);
  }, [listing]);

  if (!listing || !currentListing) return null;

  const parsedVideo = parseVideoUrl(listing?.videoUrl);

  const isOwnerAgent = listing.agentId === currentUser?.id;
  const canViewOwnerConfidential = isBroker || isOwnerAgent;
  const canModify = isBroker || isOwnerAgent;

  const catBadge = getCategoryBadge(listing.category);
  const statBadge = getStatusBadge(listing.status);

  // WhatsApp share message for customers
  const shareListingToClient = () => {
    let text = `🏡 *${listing.title}*\n\n` +
      `📍 *Konum:* ${listing.district}, ${listing.neighborhood} / ${listing.city}\n` +
      `💰 *Fiyat:* ${formatCurrency(listing.price, listing.currency)}\n` +
      `📐 *Özellikler:* ${listing.roomCount} | ${listing.grossM2} m² | ${listing.floor}\n` +
      `🏢 *Bina Yaşı:* ${listing.buildingAge === 0 ? 'Sıfır Yapı' : `${listing.buildingAge} Yıl`}\n` +
      `🔥 *Isıtma:* ${listing.heating}\n\n`;

    if (listing.videoUrl) {
      text += `🎬 *Video / Reels Turu:* ${listing.videoUrl}\n\n`;
    }

    text += `ℹ️ *Açıklama:* ${listing.description}\n\n` +
      `Altın Emlak Sivas Portföy Detayı`;

    if (navigator.share) {
      navigator.share({ title: listing.title, text }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleOpenTkgm = () => {
    const url = getTkgmUrl(currentListing);
    if (currentListing.ada && currentListing.parsel && navigator.clipboard) {
      navigator.clipboard.writeText(`${currentListing.ada}/${currentListing.parsel}`).catch(() => {});
      setToastMsg(`🗺️ Ada: ${currentListing.ada} / Parsel: ${currentListing.parsel} kopyalandı! TKGM parseli açılıyor...`);
    } else {
      setToastMsg(`🗺️ TKGM Parsel Sorgu açılıyor...`);
    }
    setTimeout(() => setToastMsg(''), 4000);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEImar = () => {
    const url = getKeosImarUrl(currentListing);
    const hasDirectReport = !!(currentListing.parselId || currentListing.keosUrl);

    if (hasDirectReport) {
      setToastMsg(`🏛️ Sivas KEOS İmar Durumu Belgesi (Parsel ID: ${currentListing.parselId}) açılıyor...`);
    } else {
      const copyQuery = currentListing.ada && currentListing.parsel 
        ? `${currentListing.ada}/${currentListing.parsel}` 
        : `${currentListing.neighborhood || ''} ${currentListing.address || ''}`.trim();
      if (copyQuery && navigator.clipboard) {
        navigator.clipboard.writeText(currentListing.ada && currentListing.parsel ? `${currentListing.ada}/${currentListing.parsel}` : copyQuery).catch(() => {});
      }
      setToastMsg(`🏛️ Sivas KEOS İmar açılıyor! ${currentListing.ada && currentListing.parsel ? `Ada: ${currentListing.ada} / Parsel: ${currentListing.parsel} kopyalandı.` : ''}`);
    }
    setTimeout(() => setToastMsg(''), 4500);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveParselId = async () => {
    if (!inputParselId.trim()) return;
    setIsSavingParselId(true);
    try {
      let cleanPid = inputParselId.trim();
      const match = cleanPid.match(/parselid=(\d+)/i);
      if (match) {
        cleanPid = match[1];
      } else {
        cleanPid = cleanPid.replace(/\D/g, '');
      }

      if (!cleanPid) {
        setToastMsg('⚠️ Lütfen geçerli bir Parsel ID girin.');
        setIsSavingParselId(false);
        return;
      }

      const res = await fetch(`/api/listings/${currentListing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parselId: cleanPid })
      });
      if (res.ok) {
        setCurrentListing(prev => ({ ...prev, parselId: cleanPid }));
        setIsEditingParselId(false);
        setInputParselId('');
        setToastMsg(`✅ Sivas KEOS Parsel ID (${cleanPid}) başarıyla kaydedildi!`);
        setTimeout(() => setToastMsg(''), 4000);
      } else {
        setToastMsg('❌ Parsel ID kaydedilemedi.');
      }
    } catch (err) {
      setToastMsg('❌ Hata: ' + err.message);
    } finally {
      setIsSavingParselId(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800">
        
        {/* Sticky Header with Close button & Media switcher */}
        <div className="relative bg-slate-900 text-white flex-shrink-0">
          
          {/* Media Switcher Tab (if video is available) */}
          {parsedVideo && (
            <div className="flex items-center justify-between px-3 pt-2 pb-1.5 bg-slate-950 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMediaTab('photos')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    mediaTab === 'photos'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📷 Fotoğraflar ({listing.photos?.length || 1})
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('video')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-lg transition flex items-center gap-1.5 ${
                    mediaTab === 'video'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-red-400 hover:text-red-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span>🎬 Video / Reels Turu</span>
                </button>
              </div>

              <a
                href={parsedVideo.watchUrl || listing.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                title={`${parsedVideo.platformName} üzerinde aç`}
              >
                <span>{parsedVideo.platformName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Media Display: Photos vs Video */}
          {mediaTab === 'video' && parsedVideo ? (
            <div className="relative aspect-[16/10] sm:max-h-72 w-full bg-black flex items-center justify-center overflow-hidden">
              {parsedVideo.type === 'youtube' && (
                <iframe
                  src={parsedVideo.embedUrl}
                  title={listing.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {parsedVideo.type === 'instagram' && (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg mb-2">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-extrabold text-sm">Instagram Reels Video Turu</h4>
                  <p className="text-xs text-slate-400 mt-1">Bu portföy için yayınlanmış Reels videosunu doğrudan izleyin.</p>
                  <a
                    href={parsedVideo.watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                  >
                    <span>Reels Videosunu Aç</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
              {parsedVideo.type === 'direct' && (
                <video src={parsedVideo.videoUrl} controls className="w-full h-full object-contain" />
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition shadow-lg z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              {/* Main Photo Gallery */}
              <div className="relative aspect-[16/10] bg-slate-950 sm:max-h-72 w-full">
                <img
                  src={listing.photos?.[activePhotoIdx] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 pointer-events-none" />

                {/* Badges on top */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                    listing.type === 'satilik' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {listing.type === 'satilik' ? 'SATILIK' : 'KİRALIK'}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border bg-white/95 ${catBadge.bg}`}>
                    {catBadge.text}
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Bottom info on photo */}
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300">FİYAT</span>
                    <p className="text-2xl font-black text-amber-400 drop-shadow-md">
                      {formatCurrency(listing.price, listing.currency)}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-md ${statBadge.bg}`}>
                    {statBadge.text}
                  </span>
                </div>
              </div>

              {/* Multiple Photo Thumbnails if available */}
              {listing.photos?.length > 1 && (
                <div className="flex gap-2 p-2 bg-slate-950 overflow-x-auto no-scrollbar">
                  {listing.photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                        activePhotoIdx === idx ? 'border-amber-400 scale-105' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Title & Location */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-800">{listing.district}, {listing.neighborhood}</span>
              <span>•</span>
              <span>{listing.city}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">#{listing.id}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {listing.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{listing.address}</p>
          </div>

          {/* Quick Action Pills: Harita + Akıllı Müşteri Eşleştirme + Paylaş */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenMap(listing);
              }}
              className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-2xl border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Haritada Aç</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenSmartMatch(listing);
              }}
              className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Alıcı Eşleştir</span>
            </button>

            <button
              onClick={shareListingToClient}
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Paylaş</span>
            </button>
          </div>

          {/* Sahibinden.com Bölge Emsal İlanları Butonu */}
          <button
            type="button"
            onClick={() => {
              const url = getSahibindenSearchUrl(listing);
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl border border-amber-500/40 text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
            title="Sahibinden.com üzerinde bu bölgedeki emsal ilanları yeni sekmede aç"
          >
            <span className="w-2 h-2 rounded-full bg-slate-950 shrink-0" />
            <span className="truncate">Sahibinden'de {listing.neighborhood || listing.district} Emsal İlanlarını Gör</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-900 shrink-0" />
          </button>

          {/* RESMİ KADASTRO (TKGM) & BELEDİYE E-İMAR KISAYOLLARI */}
          <div className="bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-800 shadow-sm text-white space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block">Resmi Kadastro & İmar Sorgulama</span>
                  <span className="text-[10px] text-slate-400">
                    {currentListing.neighborhood ? `${currentListing.neighborhood}, ` : ''}{currentListing.district || 'Merkez'} / {currentListing.city || 'Sivas'}
                  </span>
                </div>
              </div>
              {currentListing.ada && currentListing.parsel ? (
                <span className="text-[11px] font-mono font-black px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
                  Ada: {currentListing.ada} / Parsel: {currentListing.parsel}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 italic">Ada/Parsel girilmemiş</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {/* TKGM Parsel Sorgu */}
              <button
                type="button"
                onClick={handleOpenTkgm}
                className="py-2 px-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm border border-red-400/30"
                title="TKGM Parsel Sorgu'da resmi parsel sınırlarını ve harita poligonunu aç"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                <span className="truncate">TKGM Parsel Sorgu</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </button>

              {/* Sivas Belediyesi E-İmar */}
              <button
                type="button"
                onClick={handleOpenEImar}
                className={`py-2 px-2.5 ${currentListing.parselId ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400/40' : 'bg-blue-600 hover:bg-blue-500 border-blue-400/30'} text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm border`}
                title={currentListing.parselId ? `Sivas KEOS Doğrudan İmar Durumu Raporunu Aç (Parsel ID: ${currentListing.parselId})` : "Sivas Belediyesi KEOS İmar Durumu portalında sorgula"}
              >
                <span className={`w-2 h-2 rounded-full ${currentListing.parselId ? 'bg-emerald-300' : 'bg-cyan-300'} shrink-0`} />
                <span className="truncate">
                  {currentListing.parselId ? `Sivas E-İmar (${currentListing.parselId})` : 'Sivas E-İmar Durumu'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </button>
            </div>

            {/* KEOS Parsel ID Yönetimi / Hızlı Kayıt */}
            <div className="pt-2 border-t border-slate-800 text-[11px]">
              {currentListing.parselId ? (
                <div className="flex items-center justify-between bg-slate-950/60 rounded-xl px-2.5 py-1.5 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>E-İmar Belge ID: <strong className="font-mono text-white text-xs">{currentListing.parselId}</strong></span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">(Doğrudan rapora bağlı)</span>
                  </div>
                  {canModify && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputParselId(currentListing.parselId);
                        setIsEditingParselId(true);
                      }}
                      className="text-slate-400 hover:text-amber-300 text-[10px] underline ml-2 shrink-0"
                    >
                      Değiştir
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    💡 KEOS'ta açtıktan sonra üstteki <strong className="text-slate-300">parselid</strong> numarasını kaydedebilirsiniz.
                  </span>
                  {canModify && !isEditingParselId && (
                    <button
                      type="button"
                      onClick={() => setIsEditingParselId(true)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[10px] border border-amber-400/30 shrink-0 ml-2"
                    >
                      + Parsel ID Tanımla
                    </button>
                  )}
                </div>
              )}

              {isEditingParselId && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-amber-500/40 mt-2">
                  <input
                    type="text"
                    placeholder="Örn: 5252 veya https://keos.sivas.bel.tr/imardurumu/imar.aspx?parselid=5252"
                    value={inputParselId}
                    onChange={(e) => setInputParselId(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveParselId}
                    disabled={isSavingParselId}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition active:scale-95 shrink-0"
                  >
                    {isSavingParselId ? '...' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingParselId(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-white shrink-0"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>

            {toastMsg && (
              <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold px-3 py-1.5 rounded-xl text-center animate-fade-in flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{toastMsg}</span>
              </div>
            )}
          </div>

          {/* Detailed Property Features Table */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Mülk Teknik Özellikleri
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {listing.ada && (
                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Ada No</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">{listing.ada}</span>
                </div>
              )}
              {listing.parsel && (
                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Parsel No</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">{listing.parsel}</span>
                </div>
              )}
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Oda Sayısı</span>
                <span className="font-bold text-slate-800 text-sm">{listing.roomCount}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Metrekare (Brüt/Net)</span>
                <span className="font-bold text-slate-800 text-sm">{listing.grossM2} m² / {listing.netM2} m²</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Bulunduğu Kat</span>
                <span className="font-bold text-slate-800 text-sm">{listing.floor}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Bina Yaşı</span>
                <span className="font-bold text-slate-800 text-sm">{listing.buildingAge === 0 ? 'Sıfır Yapı' : `${listing.buildingAge} Yıl`}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Isıtma Tipi</span>
                <span className="font-bold text-slate-800 text-sm">{listing.heating}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Aidat Tutarı</span>
                <span className="font-bold text-slate-800 text-sm">{listing.dues ? `${listing.dues} ₺` : 'Belirtilmedi'}</span>
              </div>
            </div>

            {/* Checkmark badges */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
              {listing.hasBalcony && (
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Balkon
                </span>
              )}
              {listing.hasElevator && (
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Asansör
                </span>
              )}
              {listing.hasParking && (
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Otopark
                </span>
              )}
              {listing.inSite && (
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Site İçi Güvenlik
                </span>
              )}
              {listing.isFurnished && (
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Eşyalı
                </span>
              )}
              {listing.deedStatus && (
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> {listing.deedStatus}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Açıklama
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {listing.description}
            </p>
          </div>

          {/* GİZLİ MÜLK SAHİBİ ALANI (Sadece Portföyü Giren Danışman & Brokerlar Görebilir) */}
          <div className="rounded-2xl border overflow-hidden">
            <div className={`p-3 flex items-center justify-between ${
              canViewOwnerConfidential ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
            }`}>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
                {canViewOwnerConfidential ? <Eye className="w-4 h-4 text-slate-950" /> : <Lock className="w-4 h-4 text-slate-500" />}
                Mülk Sahibi Gizli Bilgileri (Ofis İçi Güvenlik)
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/10 font-bold">
                {canViewOwnerConfidential ? 'Yetkili Erişim' : 'Korumalı'}
              </span>
            </div>

            {canViewOwnerConfidential ? (
              <div className="p-4 bg-amber-50/50 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mülk Sahibi:</span>
                  <span className="font-bold text-slate-900">{listing.ownerName || 'Belirtilmedi'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Telefon:</span>
                  <a href={`tel:${listing.ownerPhone}`} className="font-bold text-blue-600 underline">
                    {listing.ownerPhone || 'Belirtilmedi'}
                  </a>
                </div>
                {listing.ownerNotes && (
                  <div className="pt-2 border-t border-amber-200">
                    <span className="text-slate-500 block mb-1">Danışman Özel Notları & Pazarlık Sınırı:</span>
                    <p className="bg-white p-2.5 rounded-xl border border-amber-200 text-slate-800 italic">
                      "{listing.ownerNotes}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 text-xs text-slate-500 flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                <p>
                  Mülk sahibinin iletişim bilgileri ve pazarlık payı yalnızca <b>portföy sahibi danışman ({listing.agentName})</b> ve <b>Brokerlar</b> tarafından görüntülenebilir. Müşteriniz varsa yetkili danışmanla iletişime geçiniz.
                </p>
              </div>
            )}
          </div>

          {/* Portföy Yetkili Danışmanı Kartı */}
          <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-amber-300 flex items-center justify-center font-bold text-lg border-2 border-amber-400">
                {listing.agentName ? listing.agentName.charAt(0) : 'D'}
              </div>
              <div>
                <p className="text-xs text-blue-300">Yetkili Saha Danışmanı</p>
                <p className="font-bold text-sm text-white">{listing.agentName}</p>
                <p className="text-[11px] text-slate-400">{listing.agentPhone || '0533 000 00 00'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${listing.agentPhone}`}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow transition active:scale-95"
                title="Danışmanı Ara"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={createWhatsAppLink(listing.agentPhone, `Merhaba ${listing.agentName}, #${listing.id} kodlu ${listing.title} portföyün için bir alıcı müşterim var, görüşebilir miyiz?`)}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow transition active:scale-95"
                title="WhatsApp Mesaj Gönder"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions (Edit & Delete for Owner or Broker) */}
        {canModify && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
            <button
              onClick={() => onDelete(listing.id)}
              className="py-2 px-3 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>İlanı Sil</span>
            </button>
            <button
              onClick={() => onEdit(listing)}
              className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>İlanı Düzenle</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
