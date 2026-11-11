// Currency formatter: 18500000 -> "18.500.000 ₺"
export function formatCurrency(amount, currency = 'TRY') {
  if (amount === null || amount === undefined) return '0 ₺';
  const symbol = currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : '€';
  return new Intl.NumberFormat('tr-TR').format(amount) + ' ' + symbol;
}

// Compact currency formatter: 18500000 -> "18.5 M ₺"
export function formatCompactCurrency(amount) {
  if (!amount) return '0 ₺';
  if (amount >= 1000000) {
    const val = (amount / 1000000).toFixed(1).replace('.0', '');
    return `${val}M ₺`;
  }
  if (amount >= 1000) {
    const val = (amount / 1000).toFixed(0);
    return `${val} Bin ₺`;
  }
  return `${amount} ₺`;
}

// Date formatter: "2026-10-04T08:00:00.000Z" -> "4 Ekim 2026, 11:00"
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };
  return new Intl.DateTimeFormat('tr-TR', options).format(date);
}

// Relative time formatter: "3 gün önce", "Bugün"
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return `${Math.floor(diffDays / 30)} ay önce`;
}

// WhatsApp link generator with prefilled message
export function createWhatsAppLink(phone, message = '') {
  if (!phone) return '#';
  // Clean phone number: 0532 111 22 33 -> 905321112233
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '9' + cleanPhone;
  } else if (!cleanPhone.startsWith('90')) {
    cleanPhone = '90' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Category Badge Color
export function getCategoryBadge(category) {
  switch (category) {
    case 'konut':
      return { text: 'Konut', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'ticari':
      return { text: 'Ticari', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
    case 'arsa':
      return { text: 'Arsa', bg: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'proje':
      return { text: 'Proje', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    default:
      return { text: category, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

// Status Badge
export function getStatusBadge(status) {
  switch (status) {
    case 'aktif':
      return { text: 'Aktif İlan', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    case 'opsiyonlu':
      return { text: 'Kapora Alındı', bg: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'satildi':
      return { text: 'Satıldı', bg: 'bg-rose-100 text-rose-700 border-rose-200' };
    case 'kiralandi':
      return { text: 'Kiralandı', bg: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    case 'pasif':
      return { text: 'Pasif', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    default:
      return { text: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

// Pipeline Stage Labels & Colors
export const PIPELINE_STAGES = [
  { key: 'yeni_talep', label: 'Yeni Talep', color: 'bg-sky-500', lightColor: 'bg-sky-50 text-sky-700 border-sky-200' },
  { key: 'iletisim_kuruldu', label: 'İletişim Kuruldu', color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'yer_gosterme', label: 'Yer Gösterme', color: 'bg-indigo-500', lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'teklif_pazarlik', label: 'Teklif & Pazarlık', color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'kapora', label: 'Kapora Alındı', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'kapandi_kazanildi', label: 'Satış Kapatıldı', color: 'bg-green-600', lightColor: 'bg-green-50 text-green-700 border-green-200' },
  { key: 'kaybedildi', label: 'İptal / Kayıp', color: 'bg-rose-500', lightColor: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export function getStageInfo(stageKey) {
  return PIPELINE_STAGES.find(s => s.key === stageKey) || {
    key: stageKey,
    label: stageKey,
    color: 'bg-slate-500',
    lightColor: 'bg-slate-100 text-slate-700 border-slate-200'
  };
}

// Urgency badge (Sıcak, Ilık, Soğuk)
export function getUrgencyBadge(urgency) {
  switch (urgency) {
    case 'sicak':
      return { label: '🔥 Çok Sıcak', color: 'bg-rose-100 text-rose-700 border-rose-200' };
    case 'ilik':
      return { label: '⏳ Ilık / Orta', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'soguk':
      return { label: '❄️ Soğuk / Uzun Vade', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    default:
      return { label: urgency, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

// Sahibinden.com Search URL Generator for Nearby Competitor / Market Analysis
export function getSahibindenSearchUrl(listing) {
  if (!listing) return 'https://www.sahibinden.com';

  const city = listing.city || 'Sivas';
  const district = (listing.district || '').trim();
  const neighborhood = (listing.neighborhood || '').trim();
  const type = listing.type === 'kiralik' ? 'Kiralık' : 'Satılık';

  let categoryTerm = '';
  if (listing.category === 'konut') {
    categoryTerm = listing.roomCount ? `${listing.roomCount} Daire` : 'Daire';
  } else if (listing.category === 'ticari') {
    categoryTerm = 'Dükkan';
  } else if (listing.category === 'arsa') {
    categoryTerm = 'Arsa';
  }

  const parts = [city];
  if (district && district.toLowerCase() !== 'merkez') {
    parts.push(district);
  }
  if (neighborhood) {
    parts.push(neighborhood);
  }
  parts.push(type);
  if (categoryTerm) {
    parts.push(categoryTerm);
  }

  const query = parts.filter(Boolean).join(' ');
  return `https://www.sahibinden.com/kelime-ile-arama?query_text=${encodeURIComponent(query)}`;
}

// Project Type Badge
export function getProjectTypeBadge(type) {
  switch (type) {
    case 'bina_site':
      return { label: '🏢 Bina / Site', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'arsa_parsel':
      return { label: '🌾 Arsa / Hobi Parselleri', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'villa':
      return { label: '🏡 Villa Sitesi', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'sanayi':
      return { label: '🏭 Sanayi / İş Merkezi', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
    default:
      return { label: '🏗️ Proje', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
}

// Project Construction Status Badge
export function getProjectStatusBadge(status) {
  switch (status) {
    case 'proje_asamasinda':
      return { label: '📐 Lansman / Proje Aşaması', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    case 'insaat_devam':
      return { label: '🏗️ İnşaat Devam Ediyor', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'teslime_hazir':
      return { label: '🔑 Teslime Hazır / İskanlı', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'tamamlandi':
      return { label: '✨ Tamamlandı', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    default:
      return { label: status || 'Aktif', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
}

// Unit / Parcel Inventory Status Badge
export function getUnitStatusBadge(status) {
  switch (status) {
    case 'satilik':
      return { label: 'Satışta', bg: 'bg-emerald-600 text-white', lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    case 'kapora':
      return { label: 'Kapora Alındı', bg: 'bg-amber-500 text-slate-950 font-black', lightBg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    case 'satildi':
      return { label: 'Satıldı', bg: 'bg-rose-500 text-white', lightBg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
    default:
      return { label: status, bg: 'bg-slate-500 text-white', lightBg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
  }
}

// TKGM Parsel Sorgu URL Generator
// Direct geographic coordinates hash if available (#ara/cografi/lat/lng)
export function getTkgmUrl(item) {
  if (!item) return 'https://parselsorgu.tkgm.gov.tr/';
  if (item.tkgmUrl && item.tkgmUrl.trim()) {
    return item.tkgmUrl.trim();
  }
  if (item.lat && item.lng) {
    return `https://parselsorgu.tkgm.gov.tr/#ara/cografi/${item.lat}/${item.lng}`;
  }
  return 'https://parselsorgu.tkgm.gov.tr/';
}

// Sivas Belediyesi KEOS E-İmar URL Generator
// Direct parselid report link (https://keos.sivas.bel.tr/imardurumu/imar.aspx?parselid=5252)
// or general KEOS portal
export function getKeosImarUrl(item) {
  if (!item) return 'https://keos.sivas.bel.tr/imardurumu/';
  if (item.keosUrl && item.keosUrl.trim()) {
    return item.keosUrl.trim();
  }
  if (item.parselId && String(item.parselId).trim()) {
    const raw = String(item.parselId).trim();
    if (raw.startsWith('http')) {
      return raw;
    }
    const pid = raw.replace(/\D/g, '');
    if (pid) {
      return `https://keos.sivas.bel.tr/imardurumu/imar.aspx?parselid=${pid}`;
    }
  }
  return 'https://keos.sivas.bel.tr/imardurumu/';
}

