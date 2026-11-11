import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, Check, Plus, Trash2, Building2, MapPin, 
  Sparkles, Layers, DollarSign, CalendarDays, Camera, ArrowRight
} from './Icons';

export default function ProjectFormWizard({
  projectToEdit = null,
  onClose,
  onSaveSuccess
}) {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: projectToEdit?.title || '',
    projectType: projectToEdit?.projectType || 'bina_site', // 'bina_site' | 'arsa_parsel' | 'villa' | 'sanayi'
    developerCompany: projectToEdit?.developerCompany || '',
    status: projectToEdit?.status || 'insaat_devam', // 'proje_asamasinda' | 'insaat_devam' | 'teslime_hazir' | 'tamamlandi'
    startPrice: projectToEdit?.startPrice || '',
    currency: projectToEdit?.currency || 'TRY',
    deliveryDate: projectToEdit?.deliveryDate || '',
    
    // Konum & Tapu
    city: projectToEdit?.city || 'Sivas',
    district: projectToEdit?.district || 'Merkez',
    neighborhood: projectToEdit?.neighborhood || '',
    address: projectToEdit?.address || '',
    ada: projectToEdit?.ada || '',
    parsel: projectToEdit?.parsel || '',

    // Görseller & Medya
    coverImage: projectToEdit?.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80',
    photos: projectToEdit?.photos || [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80'
    ],
    videoUrl: projectToEdit?.videoUrl || '',

    // Açıklama & Donatılar
    description: projectToEdit?.description || '',
    features: projectToEdit?.features || ['Kapalı Otopark', 'Yerden Isıtma', 'Güvenlik & Kamera'],
    paymentPlans: projectToEdit?.paymentPlans || '%40 Peşinat, Kalanı 18 Ay Şirket İçi Taksit İmkanı',

    // Envanter / Bağımsız Bölümler (Daireler / Parseller)
    units: projectToEdit?.units || []
  });

  // Hızlı Toplu Üretici State
  const [generatorSettings, setGeneratorSettings] = useState({
    // Arsa için
    parcelCount: 16,
    parcelSize: 500,
    parcelPrice: 650000,
    parcelType: 'Standart Parsel',

    // Bina için
    blockName: 'A Blok',
    floorCount: 5,
    unitsPerFloor: 2,
    apartmentType: '3+1',
    apartmentM2: 155,
    apartmentPrice: 4500000
  });

  // Feature Options
  const availableFeatures = [
    'Kapalı Otopark', 'Açık Otopark', 'Yüzme Havuzu', 'Fitness & Sauna',
    'Çocuk Oyun Parkı', 'Yerden Isıtma', 'Çift Asansör', 'Jeneratör',
    '7/24 Güvenlik & Kamera', 'Elektrik Hattı Hazır', 'Artezyen / Su Hattı',
    'Tel Çit & Giriş Kapısı', 'Akıllı Ev Sistemi', 'E-Devlet Onaylı Tapu'
  ];

  const handleToggleFeature = (feat) => {
    if (formData.features.includes(feat)) {
      setFormData({ ...formData, features: formData.features.filter(f => f !== feat) });
    } else {
      setFormData({ ...formData, features: [...formData.features, feat] });
    }
  };

  // Toplu Parsel Üret (Arsa / Hobi Bahçesi)
  const handleBulkGenerateParcels = () => {
    const count = Number(generatorSettings.parcelCount) || 10;
    const size = Number(generatorSettings.parcelSize) || 500;
    const price = Number(generatorSettings.parcelPrice) || 600000;
    const type = generatorSettings.parcelType || 'Standart Parsel';

    const newParcels = [];
    for (let i = 1; i <= count; i++) {
      newParcels.push({
        id: `P-${Date.now()}-${i}`,
        block: '',
        doorNo: `Parsel ${i}`,
        type: i === 1 || i === count ? 'Köşe Parsel' : type,
        grossM2: size,
        netM2: size,
        facade: i % 2 === 0 ? 'Güney' : 'Doğu',
        price: i === 1 || i === count ? Math.round(price * 1.15) : price,
        status: 'satilik'
      });
    }

    setFormData({
      ...formData,
      units: [...formData.units, ...newParcels]
    });
  };

  // Toplu Daire Üret (Bina / Site)
  const handleBulkGenerateApartments = () => {
    const block = generatorSettings.blockName.trim() || 'A Blok';
    const floors = Number(generatorSettings.floorCount) || 4;
    const perFloor = Number(generatorSettings.unitsPerFloor) || 2;
    const m2 = Number(generatorSettings.apartmentM2) || 150;
    const basePrice = Number(generatorSettings.apartmentPrice) || 4000000;
    const type = generatorSettings.apartmentType || '3+1';

    const newUnits = [];
    let unitNo = 1;

    for (let f = 0; f < floors; f++) {
      const floorLabel = f === 0 ? 'Zemin Kat' : `${f}. Kat`;
      for (let u = 0; u < perFloor; u++) {
        // Kat yükseldikçe şerefiye fiyat farkı
        const price = basePrice + (f * 150000);
        newUnits.push({
          id: `U-${Date.now()}-${unitNo}`,
          block,
          doorNo: `Daire ${unitNo}`,
          floor: floorLabel,
          type,
          grossM2: m2,
          netM2: Math.round(m2 * 0.85),
          facade: u % 2 === 0 ? 'Güney-Doğu' : 'Güney-Batı',
          price,
          status: 'satilik'
        });
        unitNo++;
      }
    }

    setFormData({
      ...formData,
      units: [...formData.units, ...newUnits]
    });
  };

  // Manuel Tekil Birim Ekle
  const handleAddSingleUnit = () => {
    const isArsa = formData.projectType === 'arsa_parsel';
    const nextNum = formData.units.length + 1;
    const newUnit = {
      id: `U-${Date.now()}`,
      block: isArsa ? '' : 'A Blok',
      doorNo: isArsa ? `Parsel ${nextNum}` : `Daire ${nextNum}`,
      floor: isArsa ? 'Parsel' : '1. Kat',
      type: isArsa ? 'Standart Parsel' : '3+1',
      grossM2: isArsa ? 500 : 150,
      netM2: isArsa ? 500 : 130,
      facade: 'Güney',
      price: Number(formData.startPrice) || 1000000,
      status: 'satilik'
    };

    setFormData({
      ...formData,
      units: [...formData.units, newUnit]
    });
  };

  // Birim Sil
  const handleRemoveUnit = (index) => {
    const copy = [...formData.units];
    copy.splice(index, 1);
    setFormData({ ...formData, units: copy });
  };

  // Birim Değerini Güncelle
  const handleUnitChange = (index, field, value) => {
    const copy = [...formData.units];
    copy[index] = { ...copy[index], [field]: value };
    setFormData({ ...formData, units: copy });
  };

  // Formu Gönder & Kaydet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Lütfen proje başlığını giriniz.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        startPrice: Number(formData.startPrice) || 0,
        agentId: currentUser?.id || 'USR-ADMIN-A',
        agentName: currentUser?.name || 'Yönetici Admin'
      };

      let result;
      if (projectToEdit?.id) {
        result = await api.updateProject(projectToEdit.id, payload);
      } else {
        result = await api.createProject(payload);
      }

      if (onSaveSuccess) onSaveSuccess(result);
    } catch (err) {
      console.error('Proje kaydedilemedi:', err);
      alert('Proje kaydedilirken bir hata oluştu: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-4xl max-h-[94vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-200">
        
        {/* Wizard Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
              {projectToEdit ? 'PROJE DÜZENLE' : 'YENİ PROJE & ŞANTİYE BAŞLAT'}
            </span>
            <h3 className="text-base sm:text-lg font-black leading-tight">
              {formData.title || 'Yeni Proje Tanımlama'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
          {[
            { step: 1, label: '1. Proje Kimliği & Türü' },
            { step: 2, label: '2. Konum & Donatılar' },
            { step: 3, label: `3. Envanter (${formData.units.length} Ünite)` }
          ].map(item => (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              className={`py-3 px-2 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                currentStep === item.step
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : currentStep > item.step
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-400'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Wizard Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
          
          {/* ========================================================================= */}
          {/* AŞAMA 1: PROJE KİMLİĞİ & TÜRÜ */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  PROJE BAŞLIĞI *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Paşabahçe Eko-Bağ Parselleri / Vadi Konakları"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              {/* Proje Türü Seçimi (4 Kart) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  PROJE TÜRÜNÜ SEÇİNİZ
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'bina_site', icon: '🏢', title: 'Bina & Konut Sitesi', desc: 'Bloklu yapılar, katlar, 2+1, 3+1 daireler' },
                    { id: 'arsa_parsel', icon: '🌾', title: 'Arsa / Parselasyon', desc: 'Bölünmüş hobi bahçeleri, parsel arazileri' },
                    { id: 'villa', icon: '🏡', title: 'Villa Sitesi', desc: 'Müstakil bahçeli villa ve köy projeleri' },
                    { id: 'sanayi', icon: '🏭', title: 'Sanayi / İş Merkezi', desc: 'Dükkan, atölye ve imalathane kooperatifleri' }
                  ].map(card => (
                    <div
                      key={card.id}
                      onClick={() => setFormData({ ...formData, projectType: card.id })}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                        formData.projectType === card.id
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{card.icon}</div>
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm">{card.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    MÜTEAHHİT / YAPIMCI FİRMA
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Ceylan İnşaat A.Ş."
                    value={formData.developerCompany}
                    onChange={(e) => setFormData({ ...formData, developerCompany: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    İNŞAAT AŞAMASI
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="proje_asamasinda">📐 Lansman / Proje Aşamasında</option>
                    <option value="insaat_devam">🏗️ İnşaat Devam Ediyor</option>
                    <option value="teslime_hazir">🔑 Teslime Hazır / İskanlı</option>
                    <option value="tamamlandi">✨ Tamamlandı / Oturum Başladı</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    BAŞLANGIÇ FİYATI (TL)
                  </label>
                  <input
                    type="number"
                    placeholder="Örn: 3500000"
                    value={formData.startPrice}
                    onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    TESLİM TARİHİ
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Aralık 2026 / Hemen Teslim"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* AŞAMA 2: KONUM, RESMİ BİLGİLER & DONATILAR */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İL</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Sivas">Sivas</option>
                    <option value="Ankara">Ankara</option>
                    <option value="İstanbul">İstanbul</option>
                    <option value="Kayseri">Kayseri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İLÇE</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Merkez"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MAHALLE / MEVKİİ</label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Kızılırmak / Paşabahçe"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ADA NO</label>
                  <input
                    type="text"
                    placeholder="Örn: 1420"
                    value={formData.ada}
                    onChange={(e) => setFormData({ ...formData, ada: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PARSEL NO</label>
                  <input
                    type="text"
                    placeholder="Örn: 12"
                    value={formData.parsel}
                    onChange={(e) => setFormData({ ...formData, parsel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">AÇIK ADRES</label>
                <input
                  type="text"
                  placeholder="Cadde, sokak ve çevre bilgisi..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                />
              </div>

              {/* Kapak Görseli URL & Video */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">KAPAK FOTOĞRAFI (URL)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TANITIM VİDEOSU / SHORTS (URL)</label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Sosyal Donatılar Seçici */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">SOSYAL DONATILAR & ÖZELLİKLER</label>
                <div className="flex flex-wrap gap-2">
                  {availableFeatures.map(feat => {
                    const isSelected = formData.features.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => handleToggleFeature(feat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{feat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ÖDEME & TAKSİT KOŞULLARI</label>
                <input
                  type="text"
                  placeholder="Örn: %40 Peşin 18 Ay Sıfır Faiz Taksit / Araç Takası"
                  value={formData.paymentPlans}
                  onChange={(e) => setFormData({ ...formData, paymentPlans: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PROJE AÇIKLAMASI</label>
                <textarea
                  rows={3}
                  placeholder="Projenin öne çıkan yönleri, lokasyon avantajları, şantiye takvimi..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* AŞAMA 3: ENVANTER & DAİRE / PARSEL OLUŞTURUCU */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              
              {/* Sihirli Toplu Üretim Kutusu */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                        {formData.projectType === 'arsa_parsel'
                          ? 'Toplu Parsel Oluşturucu (Tek Tıkla)'
                          : 'Toplu Blok & Kat Daire Oluşturucu'}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Onlarca daireyi veya arsayı tek tek girmek yerine otomatik sırayla oluşturun.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arsa / Parselasyon İçin Toplu Araç */}
                {formData.projectType === 'arsa_parsel' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Parsel Sayısı</label>
                      <input
                        type="number"
                        value={generatorSettings.parcelCount}
                        onChange={(e) => setGeneratorSettings({ ...generatorSettings, parcelCount: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Parsel Alanı (m²)</label>
                      <input
                        type="number"
                        value={generatorSettings.parcelSize}
                        onChange={(e) => setGeneratorSettings({ ...generatorSettings, parcelSize: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Birim Fiyat (TL)</label>
                      <input
                        type="number"
                        value={generatorSettings.parcelPrice}
                        onChange={(e) => setGeneratorSettings({ ...generatorSettings, parcelPrice: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleBulkGenerateParcels}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md transition active:scale-95"
                      >
                        ⚡ Parselleri Oluştur
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Bina / Site İçin Toplu Araç */
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Blok Adı</label>
                      <input
                        type="text"
                        placeholder="A Blok"
                        value={generatorSettings.blockName}
                        onChange={(e) => setGeneratorSettings({ ...generatorSettings, blockName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Kat Sayısı</label>
                      <input
                        type="number"
                        value={generatorSettings.floorCount}
                        onChange={(e) => setGeneratorSettings({ ...generatorSettings, floorCount: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Katta Daire</label>
                      <input
                        type="number"
                        value={generatorSettings.unitsPerFloor}
                        onChange={(e) => setGeneratorSettings({ ...generatorSettings, unitsPerFloor: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Daire Tipi</label>
                      <input
                        type="text"
                        placeholder="3+1"
                        value={generatorSettings.apartmentType}
                        onChange={(e) => setGeneratorSettings({ ...generatorSettings, apartmentType: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div className="flex items-end col-span-2 sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleBulkGenerateApartments}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md transition active:scale-95"
                      >
                        ⚡ Daireleri Oluştur
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Ünite Listesi Başlığı & Manuel Ekle Butonu */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Tanımlı Bağımsız Bölümler ({formData.units.length} Adet)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Aşağıdaki tablodan her birimin fiyatını, m² bilgisini veya satış durumunu düzenleyebilirsiniz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSingleUnit}
                  className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tekil Ekle</span>
                </button>
              </div>

              {/* Ünite Tablosu / Listesi */}
              {formData.units.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <p className="text-xs font-bold mb-2">Henüz hiçbir daire veya parsel eklenmedi.</p>
                  <p className="text-[11px]">Yukarıdaki '⚡ Toplu Oluşturucu' veya 'Tekil Ekle' butonlarını kullanabilirsiniz.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {formData.units.map((unit, idx) => (
                    <div
                      key={unit.id || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs"
                    >
                      {/* Kapı / Parsel No */}
                      <div className="w-28 shrink-0">
                        <label className="text-[10px] text-slate-400 font-bold block">No / Parsel</label>
                        <input
                          type="text"
                          value={unit.doorNo}
                          onChange={(e) => handleUnitChange(idx, 'doorNo', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>

                      {/* Blok */}
                      {formData.projectType !== 'arsa_parsel' && (
                        <div className="w-20 shrink-0">
                          <label className="text-[10px] text-slate-400 font-bold block">Blok</label>
                          <input
                            type="text"
                            value={unit.block || ''}
                            onChange={(e) => handleUnitChange(idx, 'block', e.target.value)}
                            placeholder="A Blok"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                          />
                        </div>
                      )}

                      {/* Tip */}
                      <div className="w-24 shrink-0">
                        <label className="text-[10px] text-slate-400 font-bold block">Tip</label>
                        <input
                          type="text"
                          value={unit.type || ''}
                          onChange={(e) => handleUnitChange(idx, 'type', e.target.value)}
                          placeholder="3+1"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>

                      {/* m² */}
                      <div className="w-20 shrink-0">
                        <label className="text-[10px] text-slate-400 font-bold block">m²</label>
                        <input
                          type="number"
                          value={unit.grossM2}
                          onChange={(e) => handleUnitChange(idx, 'grossM2', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>

                      {/* Fiyat */}
                      <div className="w-28 shrink-0">
                        <label className="text-[10px] text-slate-400 font-bold block">Fiyat (TL)</label>
                        <input
                          type="number"
                          value={unit.price}
                          onChange={(e) => handleUnitChange(idx, 'price', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>

                      {/* Durum */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-[10px] text-slate-400 font-bold block">Durum</label>
                        <select
                          value={unit.status}
                          onChange={(e) => handleUnitChange(idx, 'status', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-xs"
                        >
                          <option value="satilik">🟢 Satışta</option>
                          <option value="kapora">🟡 Kapora</option>
                          <option value="satildi">🔴 Satıldı</option>
                        </select>
                      </div>

                      {/* Sil */}
                      <button
                        type="button"
                        onClick={() => handleRemoveUnit(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                        title="Bu Birimi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                ← Geri
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <span>İleri</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center gap-2"
                >
                  {isSaving ? (
                    <span>Kaydediliyor...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Projeyi Kaydet & Yayınla</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
