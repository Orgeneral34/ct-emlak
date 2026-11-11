import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, MapPin, Camera, Upload, Check, Navigation, 
  Building, DollarSign, FileText, UserCheck, AlertCircle,
  Compass, Search, Layers, ExternalLink, ChevronLeft, ChevronRight,
  ShieldCheck, Lock, Eye, Video, Sparkles, FolderPlus, UserPlus
} from 'lucide-react';
import { compressToWebP } from '../utils/imageCompressor';
import { parseVideoUrl } from '../utils/videoHelper';

// Sivas Koordinatları
const SIVAS_COORDS = {
  'merkez': { lat: 39.7477, lng: 37.0179, zoom: 14 },
  'şarkışla': { lat: 39.3510, lng: 36.4110, zoom: 14 },
  'suşehri': { lat: 40.1650, lng: 38.0890, zoom: 14 },
  'zara': { lat: 39.8970, lng: 37.7580, zoom: 14 },
  'gemerek': { lat: 39.1860, lng: 36.0710, zoom: 14 },
  'kangal': { lat: 39.2340, lng: 37.2140, zoom: 14 },
  'divriği': { lat: 39.3730, lng: 38.1150, zoom: 14 },
  'yıldızeli': { lat: 39.8650, lng: 36.6530, zoom: 14 },
  'gürün': { lat: 38.7230, lng: 37.2710, zoom: 14 },
  'hafik': { lat: 39.8580, lng: 37.3850, zoom: 14 },
  'istasyon': { lat: 39.7460, lng: 37.0125, zoom: 16 },
  'kümbet': { lat: 39.7540, lng: 37.0210, zoom: 16 },
  'mevlana': { lat: 39.7520, lng: 37.0340, zoom: 16 },
  'gültepe': { lat: 39.7360, lng: 37.0080, zoom: 16 },
  'kılavuz': { lat: 39.7610, lng: 37.0420, zoom: 16 },
  'alibaba': { lat: 39.7420, lng: 37.0310, zoom: 16 },
  'paşabey': { lat: 39.7485, lng: 37.0165, zoom: 16 },
  'yenişehir': { lat: 39.7280, lng: 37.0250, zoom: 16 },
  'meydan': { lat: 39.7480, lng: 37.0160, zoom: 16 }
};

export default function ListingFormWizard({ 
  listingToEdit, 
  initialCategory = null, 
  onClose, 
  onSaveSuccess 
}) {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // 1 to 5

  // Form State
  const [formData, setFormData] = useState({
    // Aşama 1: Temel Bilgiler
    title: listingToEdit?.title || '',
    price: listingToEdit?.price || '',
    currency: listingToEdit?.currency || 'TRY',
    category: listingToEdit?.category || initialCategory || 'konut',
    subCategory: listingToEdit?.subCategory || (initialCategory === 'proje' ? 'proje' : 'daire'),
    developerCompany: listingToEdit?.developerCompany || '',
    deliveryDate: listingToEdit?.deliveryDate || '',
    totalUnits: listingToEdit?.totalUnits || '',
    projectStatus: listingToEdit?.projectStatus || 'Temelden / Proje Aşamasında',
    type: listingToEdit?.type || 'satilik', // satilik, kiralik, devren

    // Aşama 2: Konum & Resmi Tapu
    city: listingToEdit?.city || 'Sivas',
    district: listingToEdit?.district || 'Merkez',
    neighborhood: listingToEdit?.neighborhood || '',
    address: listingToEdit?.address || '',
    lat: listingToEdit?.lat || 39.7477,
    lng: listingToEdit?.lng || 37.0179,
    ada: listingToEdit?.ada || '',
    parsel: listingToEdit?.parsel || '',
    grossM2: listingToEdit?.grossM2 || '',
    netM2: listingToEdit?.netM2 || '',
    imarStatus: listingToEdit?.imarStatus || 'Konut İmarlı',
    katSayisiOrani: listingToEdit?.katSayisiOrani || '',
    tapuStatus: listingToEdit?.tapuStatus || 'Kat Mülkiyetli',
    tasinmazNo: listingToEdit?.tasinmazNo || '',
    tkgmUrl: listingToEdit?.tkgmUrl || '',
    parselId: listingToEdit?.parselId || '',
    keosUrl: listingToEdit?.keosUrl || '',
    yetkiBelgesi: listingToEdit?.yetkiBelgesi ?? true,
    yetkiBitisTarihi: listingToEdit?.yetkiBitisTarihi || '',

    // Aşama 3: Mülk Nitelikleri & Zengin Metin
    roomCount: listingToEdit?.roomCount || '3+1',
    heating: listingToEdit?.heating || 'Bireysel Doğalgaz Kombi',
    buildingAge: listingToEdit?.buildingAge ?? 3,
    kullanimDurumu: listingToEdit?.kullanimDurumu || 'Boş',
    floor: listingToEdit?.floor || '4. Kat',
    toplamKat: listingToEdit?.toplamKat || '6 Katlı',
    mutfakTipi: listingToEdit?.mutfakTipi || 'Kapalı / Ayrı Mutfak',
    banyoSayisi: listingToEdit?.banyoSayisi || 1,
    otopark: listingToEdit?.otopark || 'Kapalı Otopark',
    asansor: listingToEdit?.asansor || 'Var',
    esyali: listingToEdit?.esyali || 'Hayır',
    dues: listingToEdit?.dues || '',
    krediyeUygunluk: listingToEdit?.krediyeUygunluk || 'Evet',
    takas: listingToEdit?.takas || '',
    description: listingToEdit?.description || '',

    // Aşama 4: Medya & 3D Sanal Tur
    photos: listingToEdit?.photos || [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
    ],
    videoUrl: listingToEdit?.videoUrl || '',
    sanalTurUrl: listingToEdit?.sanalTurUrl || '',

    // Aşama 5: Gizli Veriler & Onay Ayarları
    tapuMulkiyetTipi: listingToEdit?.tapuMulkiyetTipi || 'mustakil', // mustakil, hisseli
    ownerCustomerId: listingToEdit?.ownerCustomerId || '',
    ownerName: listingToEdit?.ownerName || '',
    ownerPhone: listingToEdit?.ownerPhone || '',
    privateNotes: listingToEdit?.privateNotes || listingToEdit?.ownerNotes || '',
    visibility: {
      officeShared: listingToEdit?.visibility?.officeShared ?? true,
      globalPool: listingToEdit?.visibility?.globalPool ?? false,
      digitalCard: listingToEdit?.visibility?.digitalCard ?? true,
      autoNotify: listingToEdit?.visibility?.autoNotify ?? true
    },
    status: listingToEdit?.status || 'aktif'
  });

  // CRM Müşterileri (Mülk Sahibi Eşleştirme İçin)
  const [crmCustomers, setCrmCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Map Refs
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  // Load CRM Customers for owner matching
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const fetchFn = api.getCrmLeads || api.getCustomers;
        if (typeof fetchFn === 'function') {
          const res = await fetchFn();
          setCrmCustomers(Array.isArray(res) ? res : []);
        }
      } catch (err) {
        console.warn('Müşteri listesi yüklenemedi:', err);
      }
    };
    fetchCustomers();
  }, []);

  // Leaflet Map Initialization for Step 2
  useEffect(() => {
    if (currentStep !== 2) return;
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [formData.lat || 39.7477, formData.lng || 37.0179],
          zoom: 15,
          zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        const customPin = L.divIcon({
          className: 'custom-pin',
          html: `<div style="background-color:#2563eb; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:3px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); font-weight:bold; font-size:16px;">📍</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34]
        });

        const marker = L.marker([formData.lat || 39.7477, formData.lng || 37.0179], {
          icon: customPin,
          draggable: true
        }).addTo(map);

        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          setFormData(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }));
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
        });

        leafletMapRef.current = map;
        markerRef.current = marker;
      } else {
        leafletMapRef.current.invalidateSize();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // Handle Photo Upload with client-side WebP compression
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(`0 / ${files.length} fotoğraf WebP formatına sıkıştırılıyor...`);

    const uploadedUrls = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`${i + 1} / ${files.length}: "${file.name}" WebP'ye dönüştürülüyor...`);
        const webpBlob = await compressToWebP(file, 1920, 0.82);

        const uploadData = new FormData();
        const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
        uploadData.append('photo', webpBlob, cleanName);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        const json = await res.json();
        if (json.url) {
          uploadedUrls.push(json.url);
        }
      }

      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos.filter(p => !p.includes('unsplash')), ...uploadedUrls]
      }));
    } catch (err) {
      console.error('Yükleme hatası:', err);
      alert('Fotoğraf yüklenirken bir hata oluştu: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const removePhoto = (idx) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    }));
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setErrorMsg('Lütfen ilan başlığını giriniz.');
        return;
      }
      if (!formData.price || Number(formData.price) <= 0) {
        setErrorMsg('Lütfen geçerli bir fiyat giriniz.');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.district || !formData.neighborhood) {
        setErrorMsg('Lütfen ilçe ve mahalle seçiniz.');
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinalSave();
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onClose();
    }
  };

  const handleFinalSave = async () => {
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        grossM2: Number(formData.grossM2) || 0,
        netM2: Number(formData.netM2) || 0,
        dues: Number(formData.dues) || 0,
        buildingAge: Number(formData.buildingAge) || 0,
        banyoSayisi: Number(formData.banyoSayisi) || 1,
        agentId: currentUser?.id || 'USR-00',
        agentName: currentUser?.name || 'Halil Ceylan',
        agentPhone: currentUser?.phone || '0532 500 58 58'
      };

      let result;
      if (listingToEdit?.id) {
        result = await api.updateListing(listingToEdit.id, payload);
      } else {
        result = await api.createListing(payload);
      }

      onSaveSuccess(result);
    } catch (err) {
      setErrorMsg(err.message || 'Portföy kaydedilirken bir hata oluştu.');
      setSaving(false);
    }
  };

  const parsedVideo = formData.videoUrl ? parseVideoUrl(formData.videoUrl) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-scale-up">
        
        {/* TOP HEADER & STEPPER (Matching screenshots: YENİ PORTFÖY SİHİRBAZI - AŞAMA X/5) */}
        <div className="p-5 pb-3 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                YENİ PORTFÖY SİHİRBAZI
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Gelişmiş kurumsal ilan altyapısı.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                AŞAMA <strong className="text-amber-500 text-lg">{currentStep}</strong>/5
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Yellow Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          {/* Step Sub-Titles */}
          <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-slate-800">
            {currentStep === 1 && <span>1. Temel Bilgiler</span>}
            {currentStep === 2 && <span>2. Konum & Resmi Tapu</span>}
            {currentStep === 3 && <span>3. Mülk Nitelikleri & Detaylı Özellikler</span>}
            {currentStep === 4 && <span>4. Medya & Resmi Evraklar</span>}
            {currentStep === 5 && <span>5. Gizli Veriler & Onay Ayarları</span>}
          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-700">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* AŞAMA 1: TEMEL BİLGİLER */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  İLAN BAŞLIĞI *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: İstasyon Caddesi Üzeri Sıfır Lüks 3+1 Daire"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-amber-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    FİYAT *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      placeholder="Örn: 4500000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-3.5 pr-14 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none transition"
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="absolute right-2 px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800"
                    >
                      <option value="TRY">₺</option>
                      <option value="USD">$</option>
                      <option value="EUR">€</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    KATEGORİ
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  >
                    <option value="konut">Konut</option>
                    <option value="ticari">Ticari</option>
                    <option value="arsa">Arsa / Tarla</option>
                    <option value="proje">Proje / İnşaat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  İŞLEM TİPİ
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'satilik', label: 'Satılık' },
                    { id: 'kiralik', label: 'Kiralık' },
                    { id: 'devren', label: 'Devren' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: item.id })}
                      className={`py-3 rounded-2xl font-black text-xs transition border ${
                        formData.type === item.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* AŞAMA 2: KONUM & RESMİ TAPU */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">İL</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="Sivas">Sivas</option>
                    <option value="Ankara">Ankara</option>
                    <option value="İstanbul">İstanbul</option>
                    <option value="Kayseri">Kayseri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">İLÇE</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Merkez"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">MAHALLE</label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="İstasyon / Mevlana"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Tapu Kadastro Parametreleri */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ADA</label>
                    <input
                      type="text"
                      placeholder="1042"
                      value={formData.ada}
                      onChange={(e) => setFormData({ ...formData, ada: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">PARSEL</label>
                    <input
                      type="text"
                      placeholder="18"
                      value={formData.parsel}
                      onChange={(e) => setFormData({ ...formData, parsel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">BRÜT / NET BÜYÜKLÜK</label>
                    <input
                      type="text"
                      placeholder="165 m²"
                      value={formData.grossM2}
                      onChange={(e) => setFormData({ ...formData, grossM2: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">İMAR DURUMU</label>
                    <select
                      value={formData.imarStatus}
                      onChange={(e) => setFormData({ ...formData, imarStatus: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    >
                      <option value="Konut İmarlı">Konut İmarlı</option>
                      <option value="Ticari İmarlı">Ticari İmarlı</option>
                      <option value="Sanayi İmarlı">Sanayi İmarlı</option>
                      <option value="Tarla / Bağ">Tarla / Bağ</option>
                      <option value="İmarsız">İmarsız</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">KAT SAYISI / İMAR ORANI</label>
                    <input
                      type="text"
                      placeholder="Örn: B3, 0.50"
                      value={formData.katSayisiOrani}
                      onChange={(e) => setFormData({ ...formData, katSayisiOrani: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">TAPU DURUMU</label>
                    <select
                      value={formData.tapuStatus}
                      onChange={(e) => setFormData({ ...formData, tapuStatus: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    >
                      <option value="Kat Mülkiyetli">Kat Mülkiyetli</option>
                      <option value="Kat İrtifaklı">Kat İrtifaklı</option>
                      <option value="Müstakil Parsel">Müstakil Parsel</option>
                      <option value="Hisseli Tapu">Hisseli Tapu</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">TAŞINMAZ NUMARASI</label>
                    <input
                      type="text"
                      placeholder="TKGM Taşınmaz No"
                      value={formData.tasinmazNo}
                      onChange={(e) => setFormData({ ...formData, tasinmazNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      SİVAS KEOS PARSEL ID (E-İMAR)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 5252 veya link"
                      value={formData.parselId}
                      onChange={(e) => {
                        let val = e.target.value;
                        const match = val.match(/parselid=(\d+)/i);
                        if (match) val = match[1];
                        setFormData({ ...formData, parselId: val });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">TKGM PARSEL LİNK</label>
                    <input
                      type="text"
                      placeholder="Boşsa koordinattan açar"
                      value={formData.tkgmUrl}
                      onChange={(e) => setFormData({ ...formData, tkgmUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Otopilot Yetki Belgesi Kutusu (Sarı Vurgulu Kutu) */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="yetkiBelgesi"
                  checked={formData.yetkiBelgesi}
                  onChange={(e) => setFormData({ ...formData, yetkiBelgesi: e.target.checked })}
                  className="w-5 h-5 mt-0.5 rounded text-amber-600 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="yetkiBelgesi" className="text-xs cursor-pointer">
                  <span className="font-black text-amber-950 block">Bu Mülk İçin Yetki Belgem Var</span>
                  <span className="text-amber-800 text-[11px]">
                    Yetki süresi bitimine 3 gün kala otopilot otomatik iş emri atar ve danışmana e-posta uyarısı gönderir.
                  </span>
                </label>
              </div>

              {/* Harita ve Sınır Çizim Araçları */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>Sınırlar & Harita Konumu</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => alert('KML/KMZ dosyanızı seçerek arsa poligonunu doğrudan haritaya işleyebilirsiniz.')}
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <span>☁️ KML Yükle</span>
                  </button>
                </div>

                <div 
                  ref={mapContainerRef} 
                  className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0" 
                />
                <p className="text-[11px] text-slate-400">
                  Haritaya tıklayarak veya pini sürükleyerek mülkün tam konumunu belirleyebilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* AŞAMA 3: MÜLK NİTELİKLERİ & ZENGİN METİN */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Proje / İnşaat Özel Parametreleri */}
              {formData.category === 'proje' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                    <span className="text-base">🏗️</span>
                    <span>Proje & İnşaat Detayları</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Müteahhit / Yapımcı Firma</label>
                      <input
                        type="text"
                        value={formData.developerCompany || ''}
                        onChange={(e) => setFormData({ ...formData, developerCompany: e.target.value })}
                        placeholder="Örn: Ceylan İnşaat A.Ş."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Teslim Tarihi</label>
                      <input
                        type="text"
                        value={formData.deliveryDate || ''}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        placeholder="Örn: Haziran 2026 / Hazır"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Toplam Blok / Ünite</label>
                      <input
                        type="text"
                        value={formData.totalUnits || ''}
                        onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                        placeholder="Örn: 4 Blok / 120 Daire"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">İnşaat Aşaması</label>
                      <select
                        value={formData.projectStatus || 'Temelden / Proje Aşamasında'}
                        onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                      >
                        <option value="Temelden / Proje Aşamasında">Temelden / Proje Aşamasında</option>
                        <option value="Kaba İnşaat Devam Ediyor">Kaba İnşaat Devam Ediyor</option>
                        <option value="İnce İşçilik Aşaması">İnce İşçilik Aşaması</option>
                        <option value="Oturuma Hazır / İskanlı">Oturuma Hazır / İskanlı</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Oda Sayısı</label>
                  <input
                    type="text"
                    value={formData.roomCount}
                    onChange={(e) => setFormData({ ...formData, roomCount: e.target.value })}
                    placeholder="3+1, 4+2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Isıtma</label>
                  <select
                    value={formData.heating}
                    onChange={(e) => setFormData({ ...formData, heating: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Bireysel Doğalgaz Kombi">Bireysel Kombi</option>
                    <option value="Merkezi Sistem">Merkezi Sistem</option>
                    <option value="Yerden Isıtma">Yerden Isıtma</option>
                    <option value="Klima">Klima</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Bina Yaşı</label>
                  <input
                    type="number"
                    value={formData.buildingAge}
                    onChange={(e) => setFormData({ ...formData, buildingAge: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kullanım Durumu</label>
                  <select
                    value={formData.kullanimDurumu}
                    onChange={(e) => setFormData({ ...formData, kullanimDurumu: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Boş">Boş</option>
                    <option value="Kiracılı">Kiracılı</option>
                    <option value="Mülk Sahibi">Mülk Sahibi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Bulunduğu Kat</label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="4. Kat"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Toplam Kat</label>
                  <input
                    type="text"
                    value={formData.toplamKat}
                    onChange={(e) => setFormData({ ...formData, toplamKat: e.target.value })}
                    placeholder="6 Katlı"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mutfak Tipi</label>
                  <select
                    value={formData.mutfakTipi}
                    onChange={(e) => setFormData({ ...formData, mutfakTipi: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Kapalı / Ayrı Mutfak">Kapalı / Ayrı</option>
                    <option value="Açık / Amerikan Mutfak">Açık / Amerikan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Banyo Sayısı</label>
                  <input
                    type="number"
                    value={formData.banyoSayisi}
                    onChange={(e) => setFormData({ ...formData, banyoSayisi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Otopark</label>
                  <select
                    value={formData.otopark}
                    onChange={(e) => setFormData({ ...formData, otopark: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Kapalı Otopark">Kapalı Otopark</option>
                    <option value="Açık Otopark">Açık Otopark</option>
                    <option value="Yok">Yok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Asansör</label>
                  <select
                    value={formData.asansor}
                    onChange={(e) => setFormData({ ...formData, asansor: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Var">Var</option>
                    <option value="Yok">Yok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Eşyalı Mı?</label>
                  <select
                    value={formData.esyali}
                    onChange={(e) => setFormData({ ...formData, esyali: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Hayır">Hayır</option>
                    <option value="Evet">Evet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Aidat Bedeli (₺)</label>
                  <input
                    type="number"
                    value={formData.dues}
                    onChange={(e) => setFormData({ ...formData, dues: e.target.value })}
                    placeholder="450"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Krediye Uygunluk</label>
                  <select
                    value={formData.krediyeUygunluk}
                    onChange={(e) => setFormData({ ...formData, krediyeUygunluk: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Evet">Evet (Krediye Uygun)</option>
                    <option value="Hayır">Hayır</option>
                    <option value="Bilinmiyor">Bilinmiyor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Takas Durumu / Şartları</label>
                  <input
                    type="text"
                    value={formData.takas}
                    onChange={(e) => setFormData({ ...formData, takas: e.target.value })}
                    placeholder="Örn: %25 araç veya arsa takaslı"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Zengin Metin Editörü */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase">
                  VİTRİN & İLAN METNİ DETAYLARI (FONT, RENK VE STİL DESTEKLİ)
                </label>
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                    <span className="font-bold px-2 py-0.5 bg-white border border-slate-200 rounded">Normal</span>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded font-black w-6 h-6">B</button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded italic w-6 h-6">I</button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded underline w-6 h-6">U</button>
                    <span className="text-slate-300">|</span>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded text-blue-600 font-bold">A</button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded text-amber-600 font-bold">🎨</button>
                    <span className="text-slate-300">|</span>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded">1. List</button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded">• Bullet</button>
                  </div>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Portföyün tüm avantajlarını, lokasyon bilgilerini ve öne çıkan detaylarını buraya yazınız..."
                    className="w-full p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* AŞAMA 4: MEDYA & RESMİ EVRAKLAR */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">Medya & Resmi Evraklar</span>
                <button
                  type="button"
                  onClick={() => alert('Canva hesabınızla entegre olarak afiş ve sosyal medya tasarımlarınızı çekebilirsiniz.')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <span>☁️ Canva'dan Tasarım Çek</span>
                </button>
              </div>

              {/* Upload Dropzones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/20 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-amber-600 group-hover:scale-110 transition mb-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-800">Fotoğrafları Seç & Ekle</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Otomatik WebP sıkıştırmalı (%95 yer tasarrufu)</span>
                </label>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-center space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Video className="w-4 h-4 text-red-600" />
                    <span>YouTube Shorts / Instagram Reels</span>
                  </div>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/shorts/... veya instagram.com/reel/..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Dikey Reels veya Shorts video turlarını vitrine iliştirir.
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <span>{uploadProgress || 'Fotoğraflar yükleniyor...'}</span>
                </div>
              )}

              {/* Photo Thumbnails */}
              {formData.photos.length > 0 && (
                <div>
                  <span className="block text-[11px] font-bold text-slate-600 mb-2">
                    Yüklenen Fotoğraflar ({formData.photos.length})
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {formData.photos.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3D Sanal Tur Bağlantısı */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">3D Sanal Tur Bağlantısı</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.sanalTurUrl}
                    onChange={(e) => setFormData({ ...formData, sanalTurUrl: e.target.value })}
                    placeholder="https://my.matterport.com/show/?m=... veya 360 pano linki"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => alert('3D stüdyo modülü açılıyor...')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <span>🪄 3D Stüdyoyu Aç</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* AŞAMA 5: GİZLİ VERİLER & ONAY AYARLARI */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-4">
              {/* Tapu Mülkiyet Tipi */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                  TAPU MÜLKİYET TİPİ
                </label>
                <div className="flex items-center gap-6 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="tapuMulkiyetTipi"
                      checked={formData.tapuMulkiyetTipi === 'mustakil'}
                      onChange={() => setFormData({ ...formData, tapuMulkiyetTipi: 'mustakil' })}
                      className="w-4 h-4 text-blue-600 accent-blue-600"
                    />
                    <span>Müstakil / Tek Sahipli Tapu</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="tapuMulkiyetTipi"
                      checked={formData.tapuMulkiyetTipi === 'hisseli'}
                      onChange={() => setFormData({ ...formData, tapuMulkiyetTipi: 'hisseli' })}
                      className="w-4 h-4 text-blue-600 accent-blue-600"
                    />
                    <span>Hisseli Tapu (Çoklu Paydaş)</span>
                  </label>
                </div>
              </div>

              {/* CRM Sistemiyle Mülk Sahibini Eşleştir */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>CRM Sistemiyle Mülk Sahibini Eşleştir</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt('Yeni mülk sahibi adı:');
                      const phone = prompt('Mülk sahibi telefonu:');
                      if (name && phone) {
                        setFormData(prev => ({
                          ...prev,
                          ownerName: name,
                          ownerPhone: phone
                        }));
                      }
                    }}
                    className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Yeni Müşteri</span>
                  </button>
                </div>

                <select
                  value={formData.ownerCustomerId}
                  onChange={(e) => {
                    const cust = crmCustomers.find(c => c.id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      ownerCustomerId: e.target.value,
                      ownerName: cust ? cust.name : prev.ownerName,
                      ownerPhone: cust ? cust.phone : prev.ownerPhone
                    }));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-blue-200 text-xs font-bold text-slate-800"
                >
                  <option value="">-- Listeden Müşteri Seçiniz (Akıllı Arama) --</option>
                  {crmCustomers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.type === 'satici' ? 'Mülk Sahibi' : 'Müşteri'}
                    </option>
                  ))}
                </select>

                {formData.ownerName && (
                  <div className="text-xs text-blue-900 bg-white p-2.5 rounded-xl border border-blue-200 flex items-center justify-between">
                    <span>Eşleşen Mülk Sahibi: <strong>{formData.ownerName}</strong> ({formData.ownerPhone})</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, ownerCustomerId: '', ownerName: '', ownerPhone: '' }))}
                      className="text-red-500 hover:underline text-[11px] font-bold"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
              </div>

              {/* Benim Özel Notum (Gizli) - Kırmızı/Pembe Kutu */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-rose-900">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>Benim Özel Notum (Gizli)</span>
                </div>
                <textarea
                  rows="3"
                  value={formData.privateNotes}
                  onChange={(e) => setFormData({ ...formData, privateNotes: e.target.value })}
                  placeholder="Anahtar nerede, kapı şifresi nedir, mülk sahibinin özel pazarlık payı vb..."
                  className="w-full p-3 rounded-xl bg-white border border-rose-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
                />
                <p className="text-[10px] text-rose-600/80">
                  ⚠️ Bu not sadece ofis içi yetkili danışmanlara görünür, dışarıdaki müşterilere veya sitede asla gösterilmez.
                </p>
              </div>

              {/* Yayın & Görünürlük Onayları */}
              <div className="space-y-2.5 pt-1">
                <label className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.visibility.officeShared}
                    onChange={(e) => setFormData({
                      ...formData,
                      visibility: { ...formData.visibility, officeShared: e.target.checked }
                    })}
                    className="w-5 h-5 rounded text-blue-600 accent-blue-600 mt-0.5"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">Ofis İçi Paylaş</span>
                    <span className="text-[11px] text-slate-500">Bu ilanı ofisinizdeki diğer danışmanlar görebilir ve müşterilerine sunabilir.</span>
                  </div>
                </label>

                <label className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.visibility.globalPool}
                    onChange={(e) => setFormData({
                      ...formData,
                      visibility: { ...formData.visibility, globalPool: e.target.checked }
                    })}
                    className="w-5 h-5 rounded text-purple-600 accent-purple-600 mt-0.5"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">Ortak Havuza Gönder (Global) 🚀</span>
                    <span className="text-[11px] text-slate-500">Emlak Asistan Network ağındaki tüm emlakçılara ve iş ortaklarına açık ilan.</span>
                  </div>
                </label>

                <label className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.visibility.digitalCard}
                    onChange={(e) => setFormData({
                      ...formData,
                      visibility: { ...formData.visibility, digitalCard: e.target.checked }
                    })}
                    className="w-5 h-5 rounded text-amber-600 accent-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">Dijital Kartvizitimde Göster 🌟</span>
                    <span className="text-[11px] text-slate-500">Kişisel dijital kartvizit vitrininizde (altinemlak.../{currentUser?.slug || 'halilceylan'}) görünür.</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION FOOTER */}
        <div className="p-4 px-6 border-t border-slate-100 bg-white flex items-center justify-between sticky bottom-0 z-20">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
          >
            {currentStep === 1 ? 'İptal' : 'Geri'}
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={saving}
            className="px-7 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95 transition disabled:opacity-50"
          >
            {saving ? (
              <span>Kaydediliyor...</span>
            ) : currentStep < 5 ? (
              <>
                <span>Sonraki Aşama</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Portföyü Yayınla</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
