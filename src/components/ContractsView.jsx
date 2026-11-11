import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  CONTRACT_TEMPLATES, 
  generateDocBlob, 
  numberToTurkishWords 
} from '../utils/contractTemplates';
import { 
  FileText, Printer, Download, Plus, Search, 
  Check, Trash2, Calendar, User, Building, MapPin, 
  ExternalLink, Sparkles, AlertCircle, RefreshCw, Layers
} from './Icons';

export default function ContractsView() {
  const { currentUser, currentOffice, isBroker } = useAuth();

  // Mode: 'editor' (Sözleşme Düzenle & Önizle) vs 'archive' (Kayıtlı Sözleşmeler Arşivi)
  const [activeMode, setActiveMode] = useState('editor');

  // Selected Template (Default: Konut Kira Sözleşmesi)
  const [selectedTemplateId, setSelectedTemplateId] = useState('konut_kira');
  const currentTemplate = CONTRACT_TEMPLATES.find(t => t.id === selectedTemplateId) || CONTRACT_TEMPLATES[0];

  const getOfficeDefaults = (tmpl) => {
    const base = { ...(tmpl?.defaultValues || {}) };
    if (currentOffice) {
      base.officeName = currentOffice.companyTitle
        ? `${currentOffice.companyTitle} (${currentOffice.name})`
        : currentOffice.name || base.officeName;
      base.officeTtbsNo = currentOffice.ttbsNo || base.officeTtbsNo;
      base.officeAddress = currentOffice.address || base.officeAddress;
      base.officePhone = currentOffice.phone || currentUser?.phone || base.officePhone;
      if (currentOffice.taxOffice || currentOffice.taxNumber) {
        base.officeTaxInfo = `${currentOffice.taxOffice || ''} / VKN: ${currentOffice.taxNumber || ''}${currentOffice.mykBelgeNo ? ` | MYK: ${currentOffice.mykBelgeNo}` : ''}`;
      }
      if (currentOffice.city) {
        base.city = currentOffice.city;
        base.courtCity = currentOffice.city.toUpperCase();
        base.signaturePlace = currentOffice.city.toUpperCase();
      }
    }
    base.officeAgent = currentUser?.name || currentOffice?.ownerName || base.officeAgent;
    base.date = new Date().toISOString().split('T')[0];
    return base;
  };

  // Form State
  const [formData, setFormData] = useState(() => getOfficeDefaults(currentTemplate));

  // Dynamic Word In Words for Promissory Note (Bono/Senet)
  useEffect(() => {
    if (selectedTemplateId === 'bono_senet' && formData.amount) {
      const words = numberToTurkishWords(formData.amount);
      if (words && formData.amountInWords !== words) {
        setFormData(prev => ({ ...prev, amountInWords: words }));
      }
    }
  }, [formData.amount, selectedTemplateId]);

  // CRM & Portfolio Data for Autofill
  const [crmLeads, setCrmLeads] = useState([]);
  const [listings, setListings] = useState([]);
  const [savedContracts, setSavedContracts] = useState([]);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // Modals for Customer & Listing Selectors
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');

  // Printable document container ref
  const printAreaRef = useRef(null);

  // Load CRM, Listings, and Saved Contracts on mount or when office changes
  useEffect(() => {
    loadCRM();
    loadListings();
    loadSavedContracts();
    const tmpl = CONTRACT_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (tmpl) {
      setFormData(prev => ({
        ...prev,
        ...getOfficeDefaults(tmpl)
      }));
    }
  }, [currentOffice?.id]);

  // Update defaults when switching template
  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    const tmpl = CONTRACT_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setFormData(getOfficeDefaults(tmpl));
    }
  };

  const loadCRM = async () => {
    try {
      const data = await api.getCrmLeads();
      setCrmLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('CRM verileri yüklenemedi:', err);
    }
  };

  const loadListings = async () => {
    try {
      const data = await api.getListings();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Portföy verileri yüklenemedi:', err);
    }
  };

  const loadSavedContracts = async () => {
    setLoadingArchive(true);
    try {
      const data = await api.getContracts();
      setSavedContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Sözleşmeler arşivi yüklenemedi:', err);
    } finally {
      setLoadingArchive(false);
    }
  };

  // Field change handler
  const handleFieldChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  // Autofill from CRM Lead
  const handleApplyCustomer = (cust) => {
    setFormData(prev => ({
      ...prev,
      // Generic Client
      clientName: cust.name || '',
      clientPhone: cust.phone || '',
      clientEmail: cust.email || '',
      clientAddress: cust.address || '',
      clientTc: cust.tc || '',
      // Tenant (Kira Sözleşmesi)
      tenantName: cust.name || '',
      tenantPhone: cust.phone || '',
      tenantEmail: cust.email || '',
      tenantAddress: cust.address || '',
      tenantTc: cust.tc || '',
      // Buyer / Seller (Alım Satım Tellaliye)
      buyerName: cust.name || '',
      buyerPhone: cust.phone || '',
      buyerTc: cust.tc || '',
      buyerAddress: cust.address || '',
      // Debtor (Bono / Senet)
      debtorName: cust.name || '',
      debtorPhone: cust.phone || '',
      debtorTc: cust.tc || '',
      debtorAddress: cust.address || ''
    }));
    setShowCustomerModal(false);
  };

  // Autofill from Listing (Portföy)
  const handleApplyListing = (listing) => {
    setFormData(prev => ({
      ...prev,
      city: listing.city || 'Sivas',
      district: listing.district || 'Merkez',
      neighborhood: listing.neighborhood || '',
      propertyAddress: listing.address || `${listing.neighborhood || ''} Mah. Sivas`,
      propertyType: `${listing.roomCount || ''} ${listing.category || 'Konut'}`,
      rentAmount: listing.price ? `${Number(listing.price).toLocaleString('tr-TR')} TL` : '',
      salePrice: listing.price ? `${Number(listing.price).toLocaleString('tr-TR')} TL` : '',
      landlordName: listing.ownerName || prev.landlordName || '',
      landlordPhone: listing.ownerPhone || prev.landlordPhone || '',
      sellerName: listing.ownerName || prev.sellerName || '',
      sellerPhone: listing.ownerPhone || prev.sellerPhone || ''
    }));
    setShowListingModal(false);
  };

  // Print Action (Trigger standard print preview with A4 format)
  const handlePrint = () => {
    window.print();
  };

  // Word (.doc) Download Action
  const handleDownloadWord = () => {
    const renderedHtml = currentTemplate.renderHtml(formData);
    const docBlob = generateDocBlob(currentTemplate.title, renderedHtml);
    const url = URL.createObjectURL(docBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTemplate.title} - ${formData.tenantName || formData.clientName || formData.buyerName || 'Resmi'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save Contract to Database Archive
  const handleSaveContract = async () => {
    const clientName = formData.tenantName || formData.clientName || formData.buyerName || formData.debtorName || formData.agentName || 'İsimsiz Müşteri';
    const clientPhone = formData.tenantPhone || formData.clientPhone || formData.buyerPhone || formData.debtorPhone || '';
    const listingTitle = formData.propertyAddress ? `${formData.district || ''} - ${formData.propertyAddress}` : '';

    const payload = {
      templateId: currentTemplate.id,
      title: `${currentTemplate.title} - ${clientName}`,
      clientName,
      clientPhone,
      clientTc: formData.tenantTc || formData.clientTc || formData.buyerTc || '',
      listingTitle,
      agentId: currentUser?.id,
      agentName: currentUser?.name || 'Danışman',
      formData
    };

    try {
      const created = await api.createContract(payload);
      setSavedContracts(prev => [created, ...prev]);
      setSaveSuccessMsg('Sözleşme başarıyla sisteme kaydedildi ve arşivlendi! ✅');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      alert('Sözleşme kaydedilemedi: ' + err.message);
    }
  };

  // Re-open saved contract from archive
  const handleOpenSavedContract = (contract) => {
    const tmpl = CONTRACT_TEMPLATES.find(t => t.id === contract.templateId);
    if (tmpl) {
      setSelectedTemplateId(tmpl.id);
      setFormData(contract.formData || tmpl.defaultValues);
      setActiveMode('editor');
    }
  };

  // Delete saved contract from archive
  const handleDeleteSavedContract = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bu arşivlenmiş sözleşmeyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteContract(id);
      setSavedContracts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Silinemedi: ' + err.message);
    }
  };

  // Filtered Archive
  const filteredArchive = savedContracts.filter(c => {
    if (!archiveSearch) return true;
    const q = archiveSearch.toLowerCase();
    return (
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.clientName && c.clientName.toLowerCase().includes(q)) ||
      (c.listingTitle && c.listingTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pb-28 pt-4 max-w-[1800px] mx-auto px-3 sm:px-6 space-y-5">
      
      {/* Print Specific CSS Style Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-contract-area, #printable-contract-area * {
            visibility: visible !important;
          }
          #printable-contract-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: #fff !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Banner & Mode Switcher (Editor vs Arşiv) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                E-Sözleşmeler & Hukuki Evrak Motoru
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                9 Resmi Şablon
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              6098 sayılı TBK ve Taşınmaz Ticareti Yönetmeliği ile 100% uyumlu standart matbu evraklar.
            </p>
          </div>
        </div>

        {/* Tab Buttons: Düzenleyici vs Arşiv */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode('editor')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-xs ${
              activeMode === 'editor'
                ? 'bg-slate-950 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
            <span>Sözleşme Düzenle</span>
          </button>

          <button
            onClick={() => setActiveMode('archive')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-xs ${
              activeMode === 'archive'
                ? 'bg-slate-950 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Arşiv & Kayıtlar ({savedContracts.length})</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="no-print p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: SÖZLEŞME DÜZENLE & ÖNİZLE */}
      {/* ======================================================== */}
      {activeMode === 'editor' && (
        <div className="space-y-4">
          
          {/* Template Selection Carousel / Strip */}
          <div className="no-print space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>📑</span>
                <span>Resmi Şablon Seçin:</span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                {CONTRACT_TEMPLATES.length} adet hazır matbu evrak
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2">
              {CONTRACT_TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between gap-1 shadow-2xs group ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm font-black'
                        : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tmpl.category}
                      </span>
                      {isSelected && <span className="text-xs">✓</span>}
                    </div>
                    <span className="text-xs font-extrabold line-clamp-2 leading-tight mt-1">
                      {tmpl.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Split: Left Form (Matching Screenshot) vs Right Live A4 Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ======================================================== */}
            {/* LEFT COLUMN: FORM GİRİŞİ (EKRAN GÖRÜNTÜSÜYLE BİREBİR) */}
            {/* ======================================================== */}
            <div className="no-print lg:col-span-5 space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Bilgileri Girin</span>
                </h2>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Değişiklikler anlık önizlenir
                </span>
              </div>

              {/* CARD 1: DÜZENLEME TARİHİ & OFİS / YETKİLİ MANUEL DÜZELTME (Screenshot Style: Blue Card) */}
              <div className="bg-blue-50/70 rounded-3xl p-4 sm:p-5 border border-blue-200/80 space-y-3.5 shadow-2xs">
                <div>
                  <label className="block text-[11px] font-extrabold text-blue-900 uppercase tracking-wider mb-1.5">
                    DÜZENLEME TARİHİ
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">
                    OFİS / YETKİLİ (MANUEL DÜZELTME)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Altın Emlak Sivas Temsilciliği / Halil Ceylan"
                    value={formData.officeName || ''}
                    onChange={(e) => handleFieldChange('officeName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  />
                  <input
                    type="text"
                    placeholder="Ofis Adresi (Örn: İstasyon Cad. No:48 Merkez / Sivas)"
                    value={formData.officeAddress || ''}
                    onChange={(e) => handleFieldChange('officeAddress', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  />
                  <input
                    type="text"
                    placeholder="Ofis Telefonu (Örn: 0532 500 58 58)"
                    value={formData.officePhone || ''}
                    onChange={(e) => handleFieldChange('officePhone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  />
                </div>
              </div>

              {/* CARD 2: MÜŞTERİ (Screenshot Style: White card with cyan 'MÜŞTERİ SEÇ' button) */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>👥</span>
                    <span>MÜŞTERİ</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomerModal(true)}
                    className="px-3 py-1 rounded-xl bg-cyan-100 hover:bg-cyan-200 text-cyan-900 font-black text-[11px] transition uppercase tracking-wider active:scale-95 shadow-2xs"
                  >
                    MÜŞTERİ SEÇ
                  </button>
                </div>

                {/* Quick Select from CRM Leads Dropdown */}
                <div>
                  <select
                    onChange={(e) => {
                      const selected = crmLeads.find(l => l.id === e.target.value);
                      if (selected) handleApplyCustomer(selected);
                    }}
                    defaultValue=""
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Listeden Seç (CRM Havuzu) --</option>
                    {crmLeads.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.phone || 'Tel Yok'})</option>
                    ))}
                  </select>
                </div>

                {/* Form fields: Ad Soyad, TC, Telefon, Adres, E-Posta */}
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Ad Soyad / Ünvan *"
                    value={formData.tenantName ?? formData.clientName ?? formData.buyerName ?? formData.debtorName ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleFieldChange('tenantName', v);
                      handleFieldChange('clientName', v);
                      handleFieldChange('buyerName', v);
                      handleFieldChange('debtorName', v);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="T.C. / Vergi No"
                      value={formData.tenantTc ?? formData.clientTc ?? formData.buyerTc ?? formData.debtorTc ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleFieldChange('tenantTc', v);
                        handleFieldChange('clientTc', v);
                        handleFieldChange('buyerTc', v);
                        handleFieldChange('debtorTc', v);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Telefon No"
                      value={formData.tenantPhone ?? formData.clientPhone ?? formData.buyerPhone ?? formData.debtorPhone ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleFieldChange('tenantPhone', v);
                        handleFieldChange('clientPhone', v);
                        handleFieldChange('buyerPhone', v);
                        handleFieldChange('debtorPhone', v);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="İkametgah / Tebligat Adresi"
                    value={formData.tenantAddress ?? formData.clientAddress ?? formData.buyerAddress ?? formData.debtorAddress ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleFieldChange('tenantAddress', v);
                      handleFieldChange('clientAddress', v);
                      handleFieldChange('buyerAddress', v);
                      handleFieldChange('debtorAddress', v);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
                  />

                  <input
                    type="email"
                    placeholder="E-Posta Adresi"
                    value={formData.tenantEmail ?? formData.clientEmail ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleFieldChange('tenantEmail', v);
                      handleFieldChange('clientEmail', v);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* CARD 3: MÜLK DETAYLARI (Screenshot Style: White card with 'PORTFÖYDEN DOLDUR' button) */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>MÜLK DETAYLARI</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowListingModal(true)}
                    className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-[11px] transition uppercase tracking-wider active:scale-95 shadow-2xs"
                  >
                    PORTFÖYDEN SEÇ
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="İl"
                    value={formData.city || 'Sivas'}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="İlçe"
                    value={formData.district || 'Merkez'}
                    onChange={(e) => handleFieldChange('district', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Mahalle"
                    value={formData.neighborhood || ''}
                    onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Ada / Parsel No"
                    value={formData.adaParsel || ''}
                    onChange={(e) => handleFieldChange('adaParsel', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Açık Adres (Cadde, Sokak, No, Daire)"
                  value={formData.propertyAddress || ''}
                  onChange={(e) => handleFieldChange('propertyAddress', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                />

                <input
                  type="text"
                  placeholder="Taşınmaz Türü (Örn: 3+1 Daire, Mağaza, Arsa)"
                  value={formData.propertyType || ''}
                  onChange={(e) => handleFieldChange('propertyType', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                />
              </div>

              {/* CARD 4: ŞABLONA ÖZEL EK ALANLAR (Kira Bedeli, Komisyon, Vade, Senet vb.) */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 space-y-3 shadow-2xs">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>SÖZLEŞMEYE ÖZEL ŞARTLAR</span>
                </span>

                {/* Specific to Kira Sözleşmesi */}
                {(selectedTemplateId === 'konut_kira' || selectedTemplateId === 'isyeri_kira') && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Aylık Kira Bedeli</label>
                        <input
                          type="text"
                          placeholder="Örn: 22.500 TL"
                          value={formData.rentAmount || ''}
                          onChange={(e) => handleFieldChange('rentAmount', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Depozito / Güvence</label>
                        <input
                          type="text"
                          placeholder="Örn: 22.500 TL (1 Kira)"
                          value={formData.depositAmount || ''}
                          onChange={(e) => handleFieldChange('depositAmount', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Kira Başlangıç</label>
                        <input
                          type="date"
                          value={formData.startDate || ''}
                          onChange={(e) => handleFieldChange('startDate', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Ödeme Günleri</label>
                        <input
                          type="text"
                          placeholder="Her ayın 1 - 5 arası"
                          value={formData.paymentDay || ''}
                          onChange={(e) => handleFieldChange('paymentDay', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Banka IBAN No</label>
                      <input
                        type="text"
                        placeholder="TR..."
                        value={formData.bankIban || ''}
                        onChange={(e) => handleFieldChange('bankIban', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Demirbaşlar & Eşyalar</label>
                      <textarea
                        rows="2"
                        placeholder="Kombi, ankastre set, anahtar sayısı..."
                        value={formData.fixtures || ''}
                        onChange={(e) => handleFieldChange('fixtures', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Specific to Bono / Senet */}
                {selectedTemplateId === 'bono_senet' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Senet Bedeli (Rakamla TL) *</label>
                        <input
                          type="number"
                          placeholder="Örn: 45000"
                          value={formData.amount || ''}
                          onChange={(e) => handleFieldChange('amount', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Vade (Ödeme) Tarihi</label>
                        <input
                          type="date"
                          value={formData.dueDate || ''}
                          onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Yazıyla Tutar (Otomatik Çevrilir)</label>
                      <input
                        type="text"
                        readOnly
                        value={formData.amountInWords || 'Sayı girildiğinde otomatik yazılır'}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-xs font-black text-amber-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Kefil Adı (Opsiyonel)</label>
                        <input
                          type="text"
                          placeholder="Kefil Adı Soyadı"
                          value={formData.guarantorName || ''}
                          onChange={(e) => handleFieldChange('guarantorName', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Kefil T.C. No</label>
                        <input
                          type="text"
                          placeholder="Kefil T.C."
                          value={formData.guarantorTc || ''}
                          onChange={(e) => handleFieldChange('guarantorTc', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Specific to Alım Satım Tellaliye */}
                {selectedTemplateId === 'alim_satim' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Satış Bedeli</label>
                        <input
                          type="text"
                          placeholder="Örn: 3.500.000 TL"
                          value={formData.salePrice || ''}
                          onChange={(e) => handleFieldChange('salePrice', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Alınan Kaparo</label>
                        <input
                          type="text"
                          placeholder="Örn: 100.000 TL"
                          value={formData.depositAmount || ''}
                          onChange={(e) => handleFieldChange('depositAmount', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Tellaliye Oranı</label>
                        <input
                          type="text"
                          value={formData.commissionRate || '%2 + KDV'}
                          onChange={(e) => handleFieldChange('commissionRate', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Cayma Cezası</label>
                        <input
                          type="text"
                          placeholder="Örn: Kaparo kadar (100.000 TL)"
                          value={formData.penaltyAmount || ''}
                          onChange={(e) => handleFieldChange('penaltyAmount', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Specific to Yetki Belgesi */}
                {selectedTemplateId === 'yetki_belgesi' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Pazarlama Satış Bedeli</label>
                        <input
                          type="text"
                          placeholder="Örn: 2.850.000 TL"
                          value={formData.salePrice || ''}
                          onChange={(e) => handleFieldChange('salePrice', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Yetki Süresi</label>
                        <input
                          type="text"
                          value={formData.duration || '90 (Doksan) Gün'}
                          onChange={(e) => handleFieldChange('duration', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Specific to Tahliye Taahhütnamesi */}
                {selectedTemplateId === 'tahliye_taahhut' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Tahliye Taahhüt Edilen Tarih *</label>
                    <input
                      type="date"
                      value={formData.evictionDate || ''}
                      onChange={(e) => handleFieldChange('evictionDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-400 bg-amber-50 text-xs font-black text-amber-950"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* RIGHT COLUMN: CANLI A4 KAĞIT ÖNİZLEMESİ & AKSİYONLAR */}
            {/* ======================================================== */}
            <div className="lg:col-span-7 space-y-3">
              
              {/* Action Toolbar */}
              <div className="no-print bg-slate-900 p-3.5 rounded-3xl text-white flex flex-wrap items-center justify-between gap-2 shadow-sm border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-extrabold truncate">
                    Canlı Önizleme: {currentTemplate.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Yazdır / PDF */}
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center gap-1.5 transition active:scale-95 border border-slate-700"
                    title="A4 Yazdır veya PDF olarak kaydet"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Yazdır / PDF</span>
                  </button>

                  {/* Word İndir */}
                  <button
                    onClick={handleDownloadWord}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                    title="Microsoft Word (.doc) dosyası olarak bilgisayarına indir"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Word İndir (.doc)</span>
                  </button>

                  {/* Sisteme Kaydet */}
                  <button
                    onClick={handleSaveContract}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                    title="Bu sözleşmeyi sistem veritabanına kaydet ve arşivle"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Arşive Kaydet</span>
                  </button>
                </div>
              </div>

              {/* Printable Live A4 Page Container */}
              <div 
                id="printable-contract-area"
                ref={printAreaRef}
                className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-300 shadow-xl overflow-x-auto text-slate-900 font-serif min-h-[900px]"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Contract Body Rendered with filled data */}
                <div 
                  dangerouslySetInnerHTML={{ __html: currentTemplate.renderHtml(formData) }}
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: ARŞİVLENMİŞ SÖZLEŞMELER LİSTESİ */}
      {/* ======================================================== */}
      {activeMode === 'archive' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Sözleşme başlığı, müşteri adı veya mülk ara..."
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500 bg-white"
              />
            </div>

            <button
              onClick={() => setActiveMode('editor')}
              className="px-4 py-2.5 rounded-2xl bg-slate-950 text-white font-black text-xs flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
              <span>Yeni Sözleşme Hazırla</span>
            </button>
          </div>

          {loadingArchive ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold">Arşivlenmiş sözleşmeler taranıyor...</p>
            </div>
          ) : filteredArchive.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-2xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Arşivde Sözleşme Bulunmuyor</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Yeni bir kira, satış veya yetki sözleşmesi hazırlayıp "Arşive Kaydet" butonuna bastığınızda burada listelenecektir.
              </p>
              <button
                onClick={() => setActiveMode('editor')}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-xs"
              >
                İlk Sözleşmeyi Oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArchive.map((contract) => {
                const tmpl = CONTRACT_TEMPLATES.find(t => t.id === contract.templateId);
                return (
                  <div
                    key={contract.id}
                    onClick={() => handleOpenSavedContract(contract)}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] shrink-0">
                          {tmpl?.category || 'Sözleşme'}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">
                          {contract.title}
                        </h4>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSavedContract(contract.id, e)}
                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-1"
                        title="Arşivden Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{contract.clientName || 'İsimsiz'}</span>
                      </p>
                      {contract.clientPhone && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          📞 {contract.clientPhone}
                        </p>
                      )}
                      {contract.listingTitle && (
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{contract.listingTitle}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Danışman: {contract.agentName}</span>
                      <span>{new Date(contract.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CRM MÜŞTERİ SEÇİCİ */}
      {/* ======================================================== */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-600" />
                <h3 className="font-black text-sm text-slate-900">CRM Havuzundan Müşteri Seç</h3>
              </div>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Müşteri adı veya telefon ara..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[50vh] pr-1">
              {crmLeads
                .filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch))
                .map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleApplyCustomer(c)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{c.phone || 'Tel Belirtilmedi'} • {c.email || 'E-posta Yok'}</p>
                      {c.address && <p className="text-[10px] text-slate-400 truncate max-w-xs">{c.address}</p>}
                    </div>
                    <button className="px-3 py-1 rounded-xl bg-cyan-600 text-white text-[10px] font-black group-hover:scale-105 transition">
                      Seç
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PORTFÖYDEN SEÇİCİ */}
      {/* ======================================================== */}
      {showListingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-slate-900">Aktif Portföyden Gayrimenkul Seç</h3>
              </div>
              <button
                onClick={() => setShowListingModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Başlık, mahalle, ada/parsel ara..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[50vh] pr-1">
              {listings
                .filter(l => !listingSearch || l.title.toLowerCase().includes(listingSearch.toLowerCase()) || l.neighborhood?.toLowerCase().includes(listingSearch.toLowerCase()))
                .map(l => (
                  <div
                    key={l.id}
                    onClick={() => handleApplyListing(l)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {l.photos?.[0] ? (
                        <img src={l.photos[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Building className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{l.title}</p>
                        <p className="text-[11px] text-amber-800 font-black mt-0.5">
                          {Number(l.price).toLocaleString('tr-TR')} TL
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {l.district} / {l.neighborhood} • {l.roomCount} • Danışman: {l.agentName}
                        </p>
                      </div>
                    </div>

                    <button className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-black group-hover:scale-105 transition shrink-0">
                      Aktar
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
