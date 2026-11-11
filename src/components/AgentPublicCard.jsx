import React, { useState, useEffect } from 'react';
import { getInitials } from './UserAvatar';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Share2, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Home, 
  Building2, 
  Video, 
  ShieldCheck, 
  ArrowRight,
  MessageCircle,
  Copy,
  ChevronRight,
  Award,
  FileText
} from 'lucide-react';
import { parseVideoUrl } from '../utils/videoHelper';
import LegalModals from './LegalModals';

export default function AgentPublicCard({ slug, onNavigateHome }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Legal Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState('kvkk');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    requestType: 'satmak_istiyorum',
    notes: '',
    commercialConsent: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected Listing Modal State (Kartvizit içinden ilan detayı açmak için)
  const [previewListing, setPreviewListing] = useState(null);

  useEffect(() => {
    fetchAgentData();
  }, [slug]);

  const fetchAgentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/card/${slug}`);
      if (!res.ok) {
        throw new Error('Danışman kartviziti bulunamadı.');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const officeTitle = data?.office?.name || 'CT Emlak';
    if (navigator.share) {
      navigator.share({
        title: `${data?.agent?.name} — ${officeTitle} Dijital Kartvizit`,
        text: `${data?.agent?.name} ile iletişime geçin ve güncel gayrimenkul portföylerini inceleyin.`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // vCard (.vcf) oluşturup telefona indirme
  const handleDownloadVCard = () => {
    if (!data?.agent) return;
    const { name, phone, email, title } = data.agent;
    const officeTitle = data?.office?.name || 'CT Emlak';
    const vCardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      `N:${name};;;;`,
      `ORG:${officeTitle}`,
      `TITLE:${title || 'Gayrimenkul Uzmanı'}`,
      `TEL;TYPE=CELL,VOICE:${phone}`,
      `EMAIL;TYPE=WORK,INTERNET:${email || ''}`,
      `URL:${window.location.href}`,
      `NOTE:${officeTitle} Gayrimenkul Danışmanı - ${window.location.href}`,
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${slug}-kartvizit.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setFormError('Lütfen isim ve telefon numaranızı giriniz.');
      return;
    }
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch(`/api/public/card/${slug}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Talebiniz iletilemedi.');
      }
      setSubmitted(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Dijital Kartvizit Yükleniyor...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold mb-2">Danışman Sayfası Bulunamadı</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">
          Aradığınız <strong>"{slug}"</strong> adına ait bir danışman kartviziti bulunamadı veya bağlantı güncellendi.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const { agent, office, listings = [] } = data;
  const parsedVideo = agent.videoCvUrl ? parseVideoUrl(agent.videoCvUrl) : null;
  const cleanPhone = (agent.phone || '').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/90${cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(`Merhaba ${agent.name}, ${office?.name || 'dijital'} kartvizitinizi inceledim. Sizinle gayrimenkul konusunda görüşmek istiyorum.`)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 text-slate-100 flex flex-col items-center py-6 px-3 sm:px-6 relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container (Carrd.co style centered card) */}
      <div className="w-full max-w-md sm:max-w-lg relative z-10 space-y-4">
        
        {/* Top Floating Office Badge & Share Pill */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-amber-400 font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{office.name || 'Altın Emlak Sivas'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white transition"
              title="Kartviziti Paylaş"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 1. HERO PROFILE CARD */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl relative overflow-hidden text-center">
          
          {/* Subtle Golden Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* Profile Avatar */}
          <div className="relative inline-block mx-auto mb-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden p-1 bg-gradient-to-br from-amber-400 via-amber-600 to-slate-800 shadow-xl">
              {agent.avatar && agent.avatar.trim() ? (
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-full h-full object-cover rounded-[22px]"
                />
              ) : (
                <div className="w-full h-full bg-slate-950 text-amber-400 font-black text-3xl sm:text-4xl flex items-center justify-center rounded-[22px] select-none">
                  {getInitials(agent.name)}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-xl shadow-lg border-2 border-slate-900" title="Doğrulanmış Lisanslı Danışman">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Agent Name & Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {agent.name}
          </h1>
          <p className="text-amber-400 font-bold text-xs sm:text-sm mt-1 tracking-wide uppercase">
            {agent.title || 'Gayrimenkul & Yatırım Danışmanı'}
          </p>

          {/* Bio */}
          {agent.bio && (
            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed font-normal px-2">
              {agent.bio}
            </p>
          )}

          {/* Specialties Pills */}
          {agent.specialties && agent.specialties.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
              {agent.specialties.map((s, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Statutory TTBS & EİDS Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => { setActiveLegalTab('sozlesme'); setLegalModalOpen(true); }}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500/20 transition"
              title="T.C. Ticaret Bakanlığı Taşınmaz Ticareti Yetki Belgesi"
            >
              <Award className="w-3 h-3" />
              <span>TTBS No: {office?.ttbsNo || '5800324'}</span>
            </button>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1" title={office?.level5No || 'YB0322/17UY0333-5/00/594'}>
              <ShieldCheck className="w-3 h-3" />
              <span>MYK Seviye 5: {office?.level5No || 'YB0322/17UY0333-5/00/594'}</span>
            </span>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>EİDS Doğrulamalı</span>
            </span>
          </div>

          {/* PRIMARY CALL TO ACTION BUTTONS (BIG & TOUCH FRIENDLY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition"
            >
              <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
              <span>WhatsApp'tan Yaz</span>
            </a>

            <a
              href={`tel:${agent.phone}`}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 active:scale-[0.98] transition"
            >
              <Phone className="w-5 h-5" />
              <span>Hemen Ara</span>
            </a>
          </div>

          {/* SECONDARY ACTION BUTTONS (vCard & Mail) */}
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <button
              onClick={handleDownloadVCard}
              className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-[0.98] transition"
              title="Kişiyi doğrudan telefon rehberinize kaydeder"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Rehbere Kaydet</span>
            </button>

            {agent.email && (
              <a
                href={`mailto:${agent.email}`}
                className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-[0.98] transition"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>E-posta Gönder</span>
              </a>
            )}
          </div>
        </div>

        {/* 2. VIDEO SUNUM / REELS TURU (Eğer tanımlıysa) */}
        {parsedVideo && (
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-800/90 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
              <Video className="w-4 h-4 text-red-500" />
              <span>Danışman Video Sunumu</span>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/60 border border-slate-800 aspect-video relative flex items-center justify-center">
              {parsedVideo.embedUrl ? (
                <iframe
                  src={parsedVideo.embedUrl}
                  title="Danışman Tanıtım Videosu"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <a
                  href={parsedVideo.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition"
                >
                  <span>Videoyu İzle</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* 3. DANIŞMANIN VİTRİN İLANLARI */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Öne Çıkan Vitrin Portföyleri ({listings.length})
              </h3>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
              Şu anda vitrinde gösterilen aktif ilan bulunmuyor. Özel portföyler için lütfen iletişime geçiniz.
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPreviewListing(item)}
                  className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/90 flex items-center gap-3.5 cursor-pointer transition active:scale-[0.99] group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                    <img
                      src={item.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className={`absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded ${
                      item.type === 'satilik' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {item.type === 'satilik' ? 'Satılık' : 'Kiralık'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-blue-400 font-bold truncate">
                      {item.district}, {item.neighborhood}
                    </div>
                    <h4 className="text-xs font-extrabold text-white truncate group-hover:text-amber-400 transition-colors mt-0.5">
                      {item.title}
                    </h4>
                    <div className="text-xs font-black text-amber-400 mt-1">
                      {item.price?.toLocaleString('tr-TR')} {item.currency || '₺'}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      {item.roomCount && <span>{item.roomCount}</span>}
                      {item.grossM2 && <span>• {item.grossM2} m²</span>}
                      {item.videoUrl && <span className="text-red-400 font-bold">🎬 Video</span>}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. DOĞRUDAN TALEP / ÜCRETSİZ DEĞERLEME FORMU (BREVO ENTEGRASYONLU) */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/90 shadow-xl space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ücretsiz Danışmanlık & Değerleme</span>
            </div>
            <h3 className="text-base font-black text-white">
              Gayrimenkulünüzü Değerinde Satın / Kiralayın
            </h3>
            <p className="text-slate-400 text-xs">
              Bilgilerinizi bırakın, {agent.name} en kısa sürede size piyasa analiziyle dönüş yapsın.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h4 className="text-sm font-black text-emerald-400">Talebiniz Başarıyla Alındı!</h4>
              <p className="text-xs text-slate-300">
                Danışmanımız <strong>{agent.name}</strong> bilgilerinizi inceleyip en kısa sürede sizinle iletişime geçecektir.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', requestType: 'satmak_istiyorum', notes: '' });
                }}
                className="mt-3 text-xs text-amber-400 underline font-semibold"
              >
                Yeni bir talep bırak
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitLead} className="space-y-3 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1">Adınız Soyadınız *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet Kaya"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Telefon Numaranız *</label>
                <input
                  type="tel"
                  required
                  placeholder="Örn: 0532 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">E-Posta Adresiniz (Opsiyonel)</label>
                <input
                  type="email"
                  placeholder="Örn: mehmet@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">İşlem Türü</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'satmak_istiyorum', label: 'Mülkümü Satmak İstiyorum' },
                    { id: 'kiraya_vermek_istiyorum', label: 'Kiraya Vermek İstiyorum' },
                    { id: 'ev_ariyorum', label: 'Satılık Gayrimenkul Arıyorum' },
                    { id: 'ucretsiz_ekspertiz', label: 'Ücretsiz Değerleme Talebi' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, requestType: item.id })}
                      className={`p-2 rounded-xl text-left font-bold text-[11px] border transition ${
                        formData.requestType === item.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Mesajınız / Gayrimenkul Detayı</label>
                <textarea
                  rows="2"
                  placeholder="Mülkünüzün konumu, özellikleri veya aradığınız kriterler..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              {/* KVKK Bilgilendirme & Açık Rıza Alanı */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  İşbu formda paylaştığınız kişisel verileriniz (ad, telefon, talep), 6698 sayılı KVKK kapsamında talebinizin sonuçlandırılması ve sizinle iletişime geçilmesi amacıyla işlenmektedir.{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveLegalTab('kvkk'); setLegalModalOpen(true); }}
                    className="text-amber-400 hover:text-amber-300 font-bold underline inline-block"
                  >
                    KVKK Aydınlatma Metni'ni İncele
                  </button>
                </p>

                <label className="flex items-start gap-2 cursor-pointer text-slate-300 hover:text-white text-[11px] select-none pt-1 border-t border-slate-800/80">
                  <input
                    type="checkbox"
                    checked={formData.commercialConsent}
                    onChange={(e) => setFormData({ ...formData, commercialConsent: e.target.checked })}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-slate-400">
                    Gayrimenkul portföyleri, fiyat analizleri ve bültenlere ilişkin ticari elektronik ileti almayı kabul ediyorum. (İsteğe bağlı)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 active:scale-[0.98] transition disabled:opacity-50"
              >
                {submitting ? (
                  <span>İletiliyor...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Talebi Danışmana İlet</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* 5. FOOTER */}
        <div className="text-center pt-2 pb-8 space-y-2 text-slate-500 text-[11px]">
          <p className="font-bold text-slate-400">
            {office.legalCompanyName || office.name || 'FOX EMLAK - Altın Emlak Sivas Temsilciliği'}
          </p>
          <p>{office.address || 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas'}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-semibold">
            <span>Taşınmaz Ticareti Yetki Belge No:</span>
            <strong className="text-amber-400">{office.ttbsNo || '5800324'}</strong>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px]">
            <button
              type="button"
              onClick={() => { setActiveLegalTab('kvkk'); setLegalModalOpen(true); }}
              className="hover:text-amber-400 transition underline underline-offset-2"
            >
              KVKK Aydınlatma Metni
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setActiveLegalTab('sozlesme'); setLegalModalOpen(true); }}
              className="hover:text-amber-400 transition underline underline-offset-2"
            >
              Kullanıcı Sözleşmesi
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setActiveLegalTab('cerez'); setLegalModalOpen(true); }}
              className="hover:text-amber-400 transition underline underline-offset-2"
            >
              Çerez Politikası
            </button>
          </div>

          <p>© {new Date().getFullYear()} Altın Emlak • Tüm Hakları Saklıdır</p>
        </div>
      </div>

      {/* 6. Yasal Bilgilendirme ve KVKK Modalı */}
      <LegalModals
        isOpen={legalModalOpen}
        initialTab={activeLegalTab}
        onClose={() => setLegalModalOpen(false)}
      />

      {/* İlan Detay Önizleme Modalı */}
      {previewListing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black">
              <img
                src={previewListing.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'}
                alt=""
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 text-xs font-black px-2.5 py-1 rounded bg-amber-500 text-slate-950 uppercase">
                {previewListing.type === 'satilik' ? 'Satılık' : 'Kiralık'}
              </span>
            </div>

            <div>
              <span className="text-xs text-blue-400 font-bold">{previewListing.district}, {previewListing.neighborhood}</span>
              <h3 className="text-base font-black text-white mt-0.5">{previewListing.title}</h3>
              <p className="text-xl font-black text-amber-400 mt-2">
                {previewListing.price?.toLocaleString('tr-TR')} {previewListing.currency || '₺'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              {previewListing.roomCount && <div>Oda: <strong className="text-white">{previewListing.roomCount}</strong></div>}
              {previewListing.grossM2 && <div>Büyüklük: <strong className="text-white">{previewListing.grossM2} m²</strong></div>}
              {previewListing.floor && <div>Kat: <strong className="text-white">{previewListing.floor}</strong></div>}
              {previewListing.buildingAge !== undefined && <div>Bina Yaşı: <strong className="text-white">{previewListing.buildingAge}</strong></div>}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`https://wa.me/90${cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(`Merhaba ${agent.name}, ${previewListing.title} (${previewListing.price?.toLocaleString('tr-TR')} TL) ilanınız hakkında detaylı bilgi almak istiyorum.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Bu İlan İçin WhatsApp'tan Yaz</span>
              </a>

              <button
                type="button"
                onClick={() => setPreviewListing(null)}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
