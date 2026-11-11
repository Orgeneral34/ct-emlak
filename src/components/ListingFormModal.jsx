import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, MapPin, Camera, Upload, Check, Navigation, 
  Building, DollarSign, FileText, UserCheck, AlertCircle,
  Compass, Search, Layers, ExternalLink
} from './Icons';
import { compressToWebP } from '../utils/imageCompressor';
import { parseVideoUrl } from '../utils/videoHelper';

// Sivas Bölge ve Mahalle Koordinat Veritabanı (Hızlı Eşleşme İçin)
const SIVAS_COORDS = {
  // İlçeler
  'merkez': { lat: 39.7477, lng: 37.0179, zoom: 14 },
  'şarkışla': { lat: 39.3510, lng: 36.4110, zoom: 14 },
  'suşehri': { lat: 40.1650, lng: 38.0890, zoom: 14 },
  'zara': { lat: 39.8970, lng: 37.7580, zoom: 14 },
  'gemerek': { lat: 39.1860, lng: 36.0710, zoom: 14 },
  'kangal': { lat: 39.2340, lng: 37.2140, zoom: 14 },
  'divriği': { lat: 39.3730, lng: 38.1150, zoom: 14 },
  'yıldızeli': { lat: 39.8650, lng: 36.6530, zoom: 14 },
  'gürün': { lat: 38.7230, lng: 37.2710, zoom: 14 },
  'koyulhisar': { lat: 40.2970, lng: 37.8340, zoom: 14 },
  'hafik': { lat: 39.8580, lng: 37.3850, zoom: 14 },
  'ulaş': { lat: 39.5440, lng: 37.0420, zoom: 14 },
  // Sivas Merkez Mahalleleri & Caddeleri
  'istasyon': { lat: 39.7460, lng: 37.0125, zoom: 16 },
  'istasyon caddesi': { lat: 39.7460, lng: 37.0125, zoom: 16 },
  'kümbet': { lat: 39.7540, lng: 37.0210, zoom: 16 },
  'mevlana': { lat: 39.7520, lng: 37.0340, zoom: 16 },
  'gültepe': { lat: 39.7360, lng: 37.0080, zoom: 16 },
  'kılavuz': { lat: 39.7610, lng: 37.0420, zoom: 16 },
  'alibaba': { lat: 39.7420, lng: 37.0310, zoom: 16 },
  'paşabey': { lat: 39.7485, lng: 37.0165, zoom: 16 },
  'yenişehir': { lat: 39.7280, lng: 37.0250, zoom: 16 },
  'meydan': { lat: 39.7480, lng: 37.0160, zoom: 16 },
  'çarşı': { lat: 39.7480, lng: 37.0160, zoom: 16 },
  'fatih': { lat: 39.7410, lng: 37.0050, zoom: 16 },
  'pulur': { lat: 39.7430, lng: 37.0170, zoom: 16 },
  'diriliş': { lat: 39.7620, lng: 37.0250, zoom: 16 },
  'mehmetpaşa': { lat: 39.7490, lng: 37.0220, zoom: 16 },
  'altuntabak': { lat: 39.7380, lng: 37.0200, zoom: 16 },
  'tuzlugöl': { lat: 39.7550, lng: 37.0080, zoom: 16 },
  'karşıyaka': { lat: 39.7300, lng: 37.0050, zoom: 16 },
  'şeyhşamil': { lat: 39.7680, lng: 37.0350, zoom: 16 },
  'kaleardı': { lat: 39.7510, lng: 37.0190, zoom: 16 },
  'organize sanayi': { lat: 39.7750, lng: 37.0600, zoom: 15 },
  'üniversite': { lat: 39.7050, lng: 37.0320, zoom: 15 },
  'cumhuriyet üniversitesi': { lat: 39.7050, lng: 37.0320, zoom: 15 },
};

export default function ListingFormModal({ listingToEdit, onClose, onSaveSuccess }) {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: listingToEdit?.title || '',
    type: listingToEdit?.type || 'satilik',
    category: listingToEdit?.category || 'konut',
    subCategory: listingToEdit?.subCategory || 'daire',
    price: listingToEdit?.price || '',
    currency: listingToEdit?.currency || 'TRY',
    city: listingToEdit?.city || 'Sivas',
    district: listingToEdit?.district || 'Merkez',
    neighborhood: listingToEdit?.neighborhood || '',
    address: listingToEdit?.address || '',
    lat: listingToEdit?.lat || 39.7477,
    lng: listingToEdit?.lng || 37.0179,
    roomCount: listingToEdit?.roomCount || '3+1',
    grossM2: listingToEdit?.grossM2 || '',
    netM2: listingToEdit?.netM2 || '',
    buildingAge: listingToEdit?.buildingAge ?? 3,
    floor: listingToEdit?.floor || '4. Kat',
    heating: listingToEdit?.heating || 'Bireysel Kombi',
    hasBalcony: listingToEdit?.hasBalcony ?? true,
    hasElevator: listingToEdit?.hasElevator ?? true,
    hasParking: listingToEdit?.hasParking ?? true,
    isFurnished: listingToEdit?.isFurnished ?? false,
    inSite: listingToEdit?.inSite ?? true,
    deedStatus: listingToEdit?.deedStatus || 'Kat Mülkiyetli',
    dues: listingToEdit?.dues || '',
    description: listingToEdit?.description || '',
    status: listingToEdit?.status || 'aktif',
    photos: listingToEdit?.photos || [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
    ],
    videoUrl: listingToEdit?.videoUrl || '',
    // Mülk Sahibi
    ownerName: listingToEdit?.ownerName || '',
    ownerPhone: listingToEdit?.ownerPhone || '',
    ownerNotes: listingToEdit?.ownerNotes || ''
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [geocodingStatus, setGeocodingStatus] = useState(''); // Status message
  const [matchedDemandsPreview, setMatchedDemandsPreview] = useState([]);
  const [showDemandsPreviewDrawer, setShowDemandsPreviewDrawer] = useState(false);

  const parsedVideo = parseVideoUrl(formData.videoUrl);

  // Live Demands preview matching
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.price && Number(formData.price) > 0) {
        try {
          const res = await api.previewMatch({
            listing: {
              type: formData.type,
              category: formData.category,
              neighborhood: formData.neighborhood,
              roomCount: formData.roomCount,
              price: Number(formData.price) || 0,
              district: formData.district,
              status: 'aktif'
            }
          });
          setMatchedDemandsPreview(res.matches || []);
        } catch (err) {
          console.error('Portföy eşleşme önizleme hatası:', err);
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.type, formData.category, formData.neighborhood, formData.roomCount, formData.price]);

  // Harita Seçici Referansları
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const geocodeTimeoutRef = useRef(null);

  // İnteraktif Harita Seçiciyi Başlat
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const initLat = formData.lat || 39.7477;
      const initLng = formData.lng || 37.0179;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([initLat, initLng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Özel pin ikonu
      const customPinIcon = L.divIcon({
        className: 'leaflet-picker-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%);
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      // Draggable marker
      const marker = L.marker([initLat, initLng], { 
        draggable: true, 
        icon: customPinIcon 
      }).addTo(map);

      // Marker sürüklendiğinde koordinatları güncelle
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        updateCoordinates(lat, lng, 'Haritada elle taşındı');
      });

      // Haritada herhangi bir yere tıklandığında pini oraya taşı
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateCoordinates(lat, lng, 'Haritada tıklandı');
      });

      leafletMapRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Koordinatları ve Formu Güncelleyen Yardımcı
  const updateCoordinates = (lat, lng, reason = '') => {
    const roundedLat = Number(Number(lat).toFixed(6));
    const roundedLng = Number(Number(lng).toFixed(6));
    setFormData(prev => ({
      ...prev,
      lat: roundedLat,
      lng: roundedLng
    }));

    if (markerRef.current) {
      markerRef.current.setLatLng([roundedLat, roundedLng]);
    }
    if (reason) {
      setGeocodingStatus(`📍 ${reason}: ${roundedLat}, ${roundedLng}`);
      setTimeout(() => setGeocodingStatus(''), 4000);
    }
  };

  // Haritayı verilen koordinata yumuşakça odakla
  const panMapTo = (lat, lng, zoom = 16) => {
    updateCoordinates(lat, lng);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lng], zoom, { animate: true });
    }
  };

  // ADRES GİRİLDİKÇE HARİTAYI OTOMATİK GÜNCELLE (AUTO-GEOCODING)
  const handleAddressInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Geocoding query oluştur: "Merkez Gültepe Okullar Caddesi Sivas"
    const newDistrict = field === 'district' ? value : formData.district;
    const newNeighborhood = field === 'neighborhood' ? value : formData.neighborhood;
    const newAddress = field === 'address' ? value : formData.address;

    // 1. Önce Hızlı Yerel Sözlük Araması (Anında Tepki)
    const neighborhoodKey = (newNeighborhood || '').toLowerCase().trim();
    const districtKey = (newDistrict || '').toLowerCase().trim();
    const addressKey = (newAddress || '').toLowerCase().trim();

    let matchedLoc = null;

    // Mahalle adı eşleşiyor mu?
    if (neighborhoodKey && SIVAS_COORDS[neighborhoodKey]) {
      matchedLoc = SIVAS_COORDS[neighborhoodKey];
      panMapTo(matchedLoc.lat, matchedLoc.lng, matchedLoc.zoom || 16);
      setGeocodingStatus(`📍 Mahalle eşleşti: ${newNeighborhood}`);
      return;
    }

    // Açık adres içinde bilinen cadde geçiyor mu? (Örn: "İstasyon Caddesi", "Mevlana", "Kümbet")
    for (const [key, coords] of Object.entries(SIVAS_COORDS)) {
      if (addressKey.includes(key)) {
        panMapTo(coords.lat, coords.lng, coords.zoom || 16);
        setGeocodingStatus(`📍 Cadde/Bölge eşleşti: ${key.toUpperCase()}`);
        return;
      }
    }

    // İlçe eşleşiyor mu?
    if (districtKey && SIVAS_COORDS[districtKey]) {
      matchedLoc = SIVAS_COORDS[districtKey];
      panMapTo(matchedLoc.lat, matchedLoc.lng, matchedLoc.zoom || 14);
      setGeocodingStatus(`📍 İlçe eşleşti: ${newDistrict}`);
    }

    // 2. Canlı OpenStreetMap Nominatim Geocoding (Debounced 600ms)
    clearTimeout(geocodeTimeoutRef.current);
    if (newNeighborhood.length > 2 || newAddress.length > 3) {
      setGeocodingStatus('🔍 Haritada aranıyor...');
      geocodeTimeoutRef.current = setTimeout(async () => {
        try {
          const query = `${newAddress} ${newNeighborhood} ${newDistrict} Sivas Turkey`;
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
          const results = await res.json();
          if (results && results.length > 0) {
            const lat = parseFloat(results[0].lat);
            const lon = parseFloat(results[0].lon);
            panMapTo(lat, lon, 16);
            setGeocodingStatus(`✓ Adres bulundu: ${results[0].display_name.split(',')[0]}`);
            setTimeout(() => setGeocodingStatus(''), 4000);
          }
        } catch (err) {
          // fallback gracefully
        }
      }, 600);
    }
  };

  // Sahada tek dokunuşla GPS konumu alma
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('Cihazınızda GPS / Konum servisi desteklenmiyor.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        panMapTo(latitude, longitude, 17);
        setGeocodingStatus('📍 GPS Konumunuz alındı!');
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS Error:', err);
        alert('Konum alınamadı. Lütfen tarayıcı konum iznini kontrol edin.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Otomatik WebP Dönüştürme & Çoklu Fotoğraf Yükleme
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(`0 / ${files.length} WebP hazırlanıyor...`);

    const newPhotoUrls = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`${i + 1}/${files.length} WebP optimize ediliyor...`);
        const webpFile = await compressToWebP(files[i]);
        
        const data = new FormData();
        data.append('photo', webpFile);
        try {
          const res = await api.uploadPhoto(data);
          if (res?.url) {
            newPhotoUrls.push(res.url);
          }
        } catch (uploadErr) {
          console.warn('Sunucuya yükleme başarısız, base64 fallback yapılıyor:', uploadErr);
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(webpFile);
          });
          if (base64) newPhotoUrls.push(base64);
        }
      }

      if (newPhotoUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          photos: [...newPhotoUrls, ...prev.photos]
        }));
      }
    } catch (err) {
      console.error('Fotoğraf işleme hatası:', err);
    } finally {
      setUploading(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim()) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, photoUrlInput.trim()]
      }));
      setPhotoUrlInput('');
    }
  };

  const handleRemovePhoto = (idx) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.district) {
      alert('Lütfen başlık, fiyat ve ilçe alanlarını doldurunuz.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        grossM2: Number(formData.grossM2) || 0,
        netM2: Number(formData.netM2) || 0,
        buildingAge: Number(formData.buildingAge) || 0,
        dues: Number(formData.dues) || 0,
        agentId: listingToEdit?.agentId || currentUser?.id,
        agentName: listingToEdit?.agentName || currentUser?.name,
        agentPhone: listingToEdit?.agentPhone || currentUser?.phone
      };

      let result;
      if (listingToEdit?.id) {
        result = await api.updateListing(listingToEdit.id, payload);
      } else {
        result = await api.createListing(payload);
      }
      onSaveSuccess(result);
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      alert('Portföy kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-4xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-800 border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-dark-950 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-black text-base flex items-center gap-2 text-white">
              <Building className="w-5 h-5 text-amber-400" />
              {listingToEdit ? 'Portföyü Güncelle' : 'Altın Emlak Portföy Ekle'}
            </h3>
            <p className="text-xs text-slate-400">
              Sivas ofis veritabanına yeni mülk kaydı oluşturun.
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Demands Alert Ribbon */}
        {matchedDemandsPreview.length > 0 && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>
                🎯 Harika! Sistemde bu portföy kriterini bekleyen {matchedDemandsPreview.length} adet Alıcı Talebi var (%{matchedDemandsPreview[0].score} Uyum)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowDemandsPreviewDrawer(!showDemandsPreviewDrawer)}
              className="text-[11px] font-black text-emerald-800 underline shrink-0 hover:text-emerald-950"
            >
              {showDemandsPreviewDrawer ? 'Gizle' : 'Talepleri Gör'}
            </button>
          </div>
        )}

        {/* Live Demands Preview Drawer */}
        {showDemandsPreviewDrawer && matchedDemandsPreview.length > 0 && (
          <div className="bg-emerald-50/70 border-b border-emerald-200 p-3 max-h-44 overflow-y-auto space-y-2">
            {matchedDemandsPreview.slice(0, 3).map(({ demand, score, reasons }) => (
              <div key={demand.id} className="bg-white p-2.5 rounded-xl border border-emerald-300 shadow-xs flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{demand.clientName} ({demand.title})</p>
                  <p className="text-[11px] text-slate-500">
                    Bütçe: {formatCurrency(demand.minPrice)} - {formatCurrency(demand.maxPrice)} • {demand.roomCounts?.join('/')}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs shrink-0">
                  %{score} Uyum
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* İlan Tipi & Kategori */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">İşlem Türü</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="satilik">Satılık</option>
                <option value="kiralik">Kiralık</option>
                <option value="devren">Devren Satılık</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ana Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="konut">Konut</option>
                <option value="ticari">Ticari / İşyeri</option>
                <option value="arsa">Arsa / Arazi</option>
              </select>
            </div>
          </div>

          {/* Başlık */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">İlan Başlığı *</label>
            <input
              type="text"
              required
              placeholder="Örn: İstasyon Caddesi Üzeri Sıfır Lüks 3+1 Daire"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fiyat & Para Birimi */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Fiyat *</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  required
                  placeholder="Örn: 5450000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Birim</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LOKASYON & İNTERAKTİF HARİTADAN SEÇİM ALANI (OTOMATİK ADRES EŞLEŞTİRMELİ) */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-b from-blue-50/70 to-slate-50 p-4 rounded-3xl border border-blue-200/80 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Haritadan Konum Seçimi & Adres
                </span>
                <p className="text-[11px] text-slate-500">
                  Adresi girdikçe harita otomatik odaklanır; veya haritaya dokunarak pini tam kapıya ayarlayabilirsiniz.
                </p>
              </div>

              {/* GPS BUTONU */}
              <button
                type="button"
                onClick={handleGetGpsLocation}
                disabled={gpsLoading}
                className="self-start sm:self-auto text-[11px] font-bold bg-dark-900 hover:bg-dark-800 text-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>{gpsLoading ? 'Alınıyor...' : '📍 GPS Konumumu Al'}</span>
              </button>
            </div>

            {/* Adres Giriş Alanları */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">İl</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleAddressInputChange('city', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">İlçe *</label>
                <select
                  value={formData.district}
                  onChange={(e) => handleAddressInputChange('district', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="Merkez">Sivas Merkez</option>
                  <option value="Şarkışla">Şarkışla</option>
                  <option value="Suşehri">Suşehri</option>
                  <option value="Zara">Zara</option>
                  <option value="Gemerek">Gemerek</option>
                  <option value="Kangal">Kangal</option>
                  <option value="Divriği">Divriği</option>
                  <option value="Yıldızeli">Yıldızeli</option>
                  <option value="Gürün">Gürün</option>
                  <option value="Hafik">Hafik</option>
                  <option value="Ulaş">Ulaş</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Mahalle *</label>
                <input
                  type="text"
                  placeholder="Örn: İstasyon, Mevlana, Kümbet..."
                  value={formData.neighborhood}
                  onChange={(e) => handleAddressInputChange('neighborhood', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Açık Adres (Cadde / Sokak / Bina No)
              </label>
              <input
                type="text"
                placeholder="Örn: İstasyon Cad. No: 48 Daire: 12"
                value={formData.address}
                onChange={(e) => handleAddressInputChange('address', e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Durum Bildirimi */}
            {geocodingStatus && (
              <div className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg animate-fade-in flex items-center gap-1.5">
                <span>{geocodingStatus}</span>
              </div>
            )}

            {/* İNTERAKTİF HARİTA SEÇİCİ CONTAINER */}
            <div className="relative">
              <div 
                ref={mapContainerRef} 
                className="w-full h-56 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner z-0"
              />
              
              {/* Harita üzeri kılavuz rozeti */}
              <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-md border border-slate-200 text-[10px] font-bold text-slate-800 flex items-center gap-1 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Haritaya dokunun veya pini sürükleyin</span>
              </div>

              {/* Canlı Koordinat Rozeti */}
              <div className="absolute bottom-2 right-2 z-10 bg-dark-950/90 text-amber-300 px-2.5 py-1 rounded-xl shadow-md text-[10px] font-mono font-bold pointer-events-none">
                Lat: {formData.lat} • Lng: {formData.lng}
              </div>
            </div>
          </div>

          {/* Özellikler: Oda, m2, Kat, Yaş */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Oda Sayısı</label>
              <select
                value={formData.roomCount}
                onChange={(e) => setFormData({ ...formData, roomCount: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="1+0">1+0 (Stüdyo)</option>
                <option value="1+1">1+1</option>
                <option value="2+1">2+1</option>
                <option value="3+1">3+1</option>
                <option value="4+1">4+1</option>
                <option value="4+2">4+2</option>
                <option value="5+1">5+1</option>
                <option value="Villa">Villa / Müstakil</option>
                <option value="Ofis">Ofis</option>
                <option value="Dükkan">Dükkan</option>
                <option value="Arsa">Arsa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brüt m²</label>
              <input
                type="number"
                placeholder="165"
                value={formData.grossM2}
                onChange={(e) => setFormData({ ...formData, grossM2: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Net m²</label>
              <input
                type="number"
                placeholder="145"
                value={formData.netM2}
                onChange={(e) => setFormData({ ...formData, netM2: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bina Yaşı</label>
              <input
                type="number"
                placeholder="3"
                value={formData.buildingAge}
                onChange={(e) => setFormData({ ...formData, buildingAge: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Bulunduğu Kat & Isıtma */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bulunduğu Kat</label>
              <input
                type="text"
                placeholder="Örn: 4. Kat"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Isıtma</label>
              <input
                type="text"
                placeholder="Örn: Doğalgaz Kombi"
                value={formData.heating}
                onChange={(e) => setFormData({ ...formData, heating: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Donanım Özellikleri (Balkon, Asansör, Otopark...) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { id: 'hasBalcony', label: 'Balkon Var' },
              { id: 'hasElevator', label: 'Asansör Var' },
              { id: 'hasParking', label: 'Otopark Var' },
              { id: 'inSite', label: 'Site İçi' },
              { id: 'isFurnished', label: 'Eşyalı' }
            ].map(item => (
              <label key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData[item.id]}
                  onChange={(e) => setFormData({ ...formData, [item.id]: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>

          {/* Fotoğraflar & Otomatik WebP Sıkıştırma */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 block">
                Fotoğraflar (Otomatik WebP Sıkıştırma)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ✨ %95 Yer Tasarrufu
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* 1. Kameradan Çek */}
              <label className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition active:scale-95">
                <Camera className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="truncate">{uploading ? (uploadProgress || 'İşleniyor...') : 'Kamera Çek'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={uploading}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* 2. Galeriden Çoklu Seç */}
              <label className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition active:scale-95">
                <Upload className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{uploading ? (uploadProgress || 'Optimize Ediliyor...') : 'Galeriden Çoklu Seç'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Fotoğraf URL ekleme seçeneği */}
            <div className="flex gap-2 pt-0.5">
              <input
                type="text"
                placeholder="veya Fotoğraf Web URL'si yapıştırın..."
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddPhotoUrl}
                className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Ekle
              </button>
            </div>

            {/* Photo Preview Strip */}
            {formData.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pt-1 no-scrollbar">
                {formData.photos.map((p, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0 group">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* YouTube Shorts & Instagram Reels Video Turu */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>🎬 Video Turu / Reels / Shorts (İsteğe Bağlı)</span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                YouTube & Instagram
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Örn: https://youtube.com/shorts/... veya https://instagram.com/reel/..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 pr-9"
              />
              {formData.videoUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, videoUrl: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
                  title="Temizle"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Video Canlı Önizleme */}
            {parsedVideo && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold flex items-center gap-1.5 text-slate-900">
                    {parsedVideo.type === 'youtube' && <span className="text-red-600 font-black">🔴 YouTube</span>}
                    {parsedVideo.type === 'instagram' && <span className="text-purple-600 font-black">🟣 Instagram Reels</span>}
                    <span>{parsedVideo.platformName} Algılandı</span>
                  </span>
                  <a
                    href={parsedVideo.watchUrl || formData.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                  >
                    <span>Bağlantıyı Aç</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {parsedVideo.type === 'youtube' && (
                  <div className="aspect-[9/16] max-h-72 mx-auto rounded-xl overflow-hidden bg-black shadow-md border border-slate-200">
                    <iframe
                      src={parsedVideo.embedUrl}
                      title="YouTube Shorts Önizleme"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {parsedVideo.type === 'instagram' && (
                  <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-between text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shrink-0">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-xs">Instagram Reels Bağlantısı Hazır</p>
                        <p className="text-[10px] text-slate-300">İlan detayında doğrudan görüntülenecek.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MÜLK SAHİBİ GİZLİ BİLGİLERİ */}
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 space-y-2">
            <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
              🔒 Mülk Sahibi Gizli Bilgileri (Yalnızca Siz ve Broker Görür)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-amber-900 font-medium mb-1">Mülk Sahibi Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Kemal Bey"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-amber-900 font-medium mb-1">Telefon Numarası</label>
                <input
                  type="text"
                  placeholder="0532 ..."
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-amber-900 font-medium mb-1">Özel Pazarlık & Gösterim Notları</label>
              <textarea
                rows={2}
                placeholder="Örn: 5.2M altına inmez, randevusuz gidilmesin..."
                value={formData.ownerNotes}
                onChange={(e) => setFormData({ ...formData, ownerNotes: e.target.value })}
                className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detaylı İlan Açıklaması</label>
            <textarea
              rows={3}
              placeholder="Mülkün öne çıkan artı özellikleri, çevresi, ulaşımı..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Durum */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">İlan Durumu</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              <option value="aktif">Aktif Yayında</option>
              <option value="opsiyonlu">Opsiyonlu / Kapora Alındı</option>
              <option value="satildi">Satıldı</option>
              <option value="kiralandi">Kiralandı</option>
              <option value="pasif">Pasife Al</option>
            </select>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 flex gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>{saving ? 'Kaydediliyor...' : listingToEdit ? 'Güncellemeleri Kaydet' : 'Portföyü Yayınla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
