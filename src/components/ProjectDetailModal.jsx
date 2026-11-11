import React, { useState } from 'react';
import { 
  X, MapPin, Building2, CalendarDays, Share2, 
  CheckCircle2, Layers, Phone, MessageSquare, 
  ExternalLink, Edit3, Sparkles, Filter, Search
} from './Icons';
import { 
  formatCurrency, 
  getProjectTypeBadge, 
  getProjectStatusBadge, 
  getUnitStatusBadge,
  getTkgmUrl,
  getKeosImarUrl
} from '../utils/formatters';

export default function ProjectDetailModal({
  project,
  onClose,
  onEdit,
  onUnitUpdated
}) {
  if (!project) return null;

  const [currentProject, setCurrentProject] = useState(project);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'details', 'payment', 'gallery'
  const [unitFilter, setUnitFilter] = useState('all'); // 'all', 'satilik', 'kapora', 'satildi'
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [editingUnit, setEditingUnit] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isUpdatingUnit, setIsUpdatingUnit] = useState(false);
  const [isEditingParselId, setIsEditingParselId] = useState(false);
  const [inputParselId, setInputParselId] = useState('');
  const [isSavingParselId, setIsSavingParselId] = useState(false);

  React.useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const units = project.units || [];
  const typeBadge = getProjectTypeBadge(project.projectType);
  const statusBadge = getProjectStatusBadge(project.status);

  // Unique blocks
  const blocks = Array.from(new Set(units.map(u => u.block).filter(Boolean)));

  // Filtered units
  const filteredUnits = units.filter(u => {
    if (unitFilter !== 'all' && u.status !== unitFilter) return false;
    if (selectedBlock !== 'all' && u.block !== selectedBlock) return false;
    return true;
  });

  // Metrics
  const total = units.length;
  const satilikCount = units.filter(u => u.status === 'satilik').length;
  const kaporaCount = units.filter(u => u.status === 'kapora').length;
  const satildiCount = units.filter(u => u.status === 'satildi').length;

  // Handle Unit Status Change
  const handleUpdateUnitStatus = async (unit, newStatus) => {
    setIsUpdatingUnit(true);
    try {
      if (onUnitUpdated) {
        await onUnitUpdated(project.id, unit.id, { status: newStatus });
      }
      setEditingUnit(null);
    } catch (err) {
      console.error('Birim durumu güncellenemedi:', err);
      alert('Birim durumu güncellenirken bir hata oluştu.');
    } finally {
      setIsUpdatingUnit(false);
    }
  };

  // WhatsApp Share for specific unit
  const handleShareUnit = (unit) => {
    const text = `🏗️ *${project.title}*\n` +
      `📍 *Birim:* ${unit.block ? unit.block + ' ' : ''}${unit.doorNo} (${unit.type || 'Daire/Parsel'})\n` +
      `📐 *Alan:* ${unit.grossM2} m² ${unit.floor ? '| Kat: ' + unit.floor : ''}\n` +
      `💰 *Fiyat:* ${formatCurrency(unit.price, project.currency)}\n` +
      `📌 *Durum:* ${unit.status === 'satilik' ? 'Satışta (Müsait)' : unit.status === 'kapora' ? 'Kapora Alındı' : 'Satıldı'}\n\n` +
      `Detaylı bilgi için: ${project.developerCompany || 'Altın Emlak'}`;

    if (navigator.share) {
      navigator.share({ title: `${project.title} - ${unit.doorNo}`, text }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleOpenTkgm = () => {
    const url = getTkgmUrl(currentProject);
    if (currentProject.ada && currentProject.parsel && navigator.clipboard) {
      navigator.clipboard.writeText(`${currentProject.ada}/${currentProject.parsel}`).catch(() => {});
      setToastMsg(`🗺️ Ada: ${currentProject.ada} / Parsel: ${currentProject.parsel} kopyalandı! TKGM parseli açılıyor...`);
    } else {
      setToastMsg(`🗺️ TKGM Parsel Sorgu açılıyor...`);
    }
    setTimeout(() => setToastMsg(''), 4000);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEImar = () => {
    const url = getKeosImarUrl(currentProject);
    const hasDirectReport = !!(currentProject.parselId || currentProject.keosUrl);

    if (hasDirectReport) {
      setToastMsg(`🏛️ Sivas KEOS İmar Durumu Belgesi (Parsel ID: ${currentProject.parselId}) açılıyor...`);
    } else {
      const copyQuery = currentProject.ada && currentProject.parsel 
        ? `${currentProject.ada}/${currentProject.parsel}` 
        : `${currentProject.neighborhood || ''} ${currentProject.address || ''}`.trim();
      if (copyQuery && navigator.clipboard) {
        navigator.clipboard.writeText(currentProject.ada && currentProject.parsel ? `${currentProject.ada}/${currentProject.parsel}` : copyQuery).catch(() => {});
      }
      setToastMsg(`🏛️ Sivas KEOS İmar açılıyor! ${currentProject.ada && currentProject.parsel ? `Ada: ${currentProject.ada} / Parsel: ${currentProject.parsel} kopyalandı.` : ''}`);
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

      const res = await fetch(`/api/projects/${currentProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parselId: cleanPid })
      });
      if (res.ok) {
        setCurrentProject(prev => ({ ...prev, parselId: cleanPid }));
        setIsEditingParselId(false);
        setInputParselId('');
        setToastMsg(`✅ Sivas KEOS Parsel ID (${cleanPid}) başarıyla kaydedildi!`);
        setTimeout(() => setToastMsg(''), 4000);
        if (onEdit) onEdit(currentProject);
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
    <div 
      className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-4xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover Banner */}
        <div className="relative h-44 sm:h-56 bg-slate-900 shrink-0 overflow-hidden">
          <img 
            src={project.coverImage || (project.photos && project.photos[0]) || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80'} 
            alt={project.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />

          {/* Close & Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition active:scale-95"
                title="Projeyi Düzenle"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badges on Banner */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-md backdrop-blur-md ${typeBadge.bg}`}>
              {typeBadge.label}
            </span>
            <span className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-md backdrop-blur-md ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
          </div>

          {/* Title and Info on Banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-md leading-tight">
              {project.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 mt-1 font-semibold">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{project.neighborhood ? `${project.neighborhood}, ` : ''}{project.district} / {project.city}</span>
              </span>
              {project.developerCompany && (
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-white font-bold">
                  🏢 {project.developerCompany}
                </span>
              )}
              {project.ada && project.parsel && (
                <span className="text-amber-300 font-bold">
                  Ada: {project.ada} / Parsel: {project.parsel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-4 bg-slate-50 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'inventory', label: `📦 Envanter Matrisi (${units.length})`, count: units.length },
            { id: 'details', label: '📋 Proje Özellikleri' },
            { id: 'payment', label: '💳 Ödeme & Taksit' },
            { id: 'gallery', label: `📸 Galeri (${project.photos?.length || 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          
          {/* RESMİ KADASTRO (TKGM) & BELEDİYE E-İMAR KISAYOLLARI */}
          <div className="bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-800 shadow-sm text-white space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block">Resmi Kadastro & İmar Sorgulama</span>
                  <span className="text-[10px] text-slate-400">
                    {currentProject.neighborhood ? `${currentProject.neighborhood}, ` : ''}{currentProject.district || 'Merkez'} / {currentProject.city || 'Sivas'}
                  </span>
                </div>
              </div>
              {currentProject.ada && currentProject.parsel ? (
                <span className="text-[11px] font-mono font-black px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
                  Ada: {currentProject.ada} / Parsel: {currentProject.parsel}
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
                className={`py-2 px-2.5 ${currentProject.parselId ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400/40' : 'bg-blue-600 hover:bg-blue-500 border-blue-400/30'} text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm border`}
                title={currentProject.parselId ? `Sivas KEOS Doğrudan İmar Durumu Raporunu Aç (Parsel ID: ${currentProject.parselId})` : "Sivas Belediyesi KEOS İmar Durumu portalında sorgula"}
              >
                <span className={`w-2 h-2 rounded-full ${currentProject.parselId ? 'bg-emerald-300' : 'bg-cyan-300'} shrink-0`} />
                <span className="truncate">
                  {currentProject.parselId ? `Sivas E-İmar (${currentProject.parselId})` : 'Sivas E-İmar Durumu'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </button>
            </div>

            {/* KEOS Parsel ID Yönetimi / Hızlı Kayıt */}
            <div className="pt-2 border-t border-slate-800 text-[11px]">
              {currentProject.parselId ? (
                <div className="flex items-center justify-between bg-slate-950/60 rounded-xl px-2.5 py-1.5 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>E-İmar Belge ID: <strong className="font-mono text-white text-xs">{currentProject.parselId}</strong></span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">(Doğrudan rapora bağlı)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInputParselId(currentProject.parselId);
                      setIsEditingParselId(true);
                    }}
                    className="text-slate-400 hover:text-amber-300 text-[10px] underline ml-2 shrink-0"
                  >
                    Değiştir
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    💡 KEOS'ta açtıktan sonra üstteki <strong className="text-slate-300">parselid</strong> numarasını kaydedebilirsiniz.
                  </span>
                  {!isEditingParselId && (
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
          
          {/* TAB 1: ENVANTER MATRİSİ */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              
              {/* Envanter Sayacı & Filtreler */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold">
                  {[
                    { id: 'all', label: `Tüm Üniteler (${total})`, dot: 'bg-slate-400' },
                    { id: 'satilik', label: `Satışta (${satilikCount})`, dot: 'bg-emerald-500' },
                    { id: 'kapora', label: `Kapora (${kaporaCount})`, dot: 'bg-amber-400' },
                    { id: 'satildi', label: `Satıldı (${satildiCount})`, dot: 'bg-rose-500' }
                  ].map(chip => (
                    <button
                      key={chip.id}
                      onClick={() => setUnitFilter(chip.id)}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                        unitFilter === chip.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${chip.dot}`} />
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>

                {/* Blok Seçici (Varsa) */}
                {blocks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Blok:</span>
                    <select
                      value={selectedBlock}
                      onChange={(e) => setSelectedBlock(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="all">Tüm Bloklar</option>
                      {blocks.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Bilgilendirici İpucu */}
              <p className="text-[11px] text-slate-500 font-medium">
                💡 Durumunu değiştirmek veya detayını görmek istediğiniz daire/parsel kartına tıklayınız.
              </p>

              {/* Ünite / Parsel Matrisi Grid */}
              {filteredUnits.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-bold">Bu filtreye uygun daire veya parsel bulunamadı.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredUnits.map((unit) => {
                    const uBadge = getUnitStatusBadge(unit.status);
                    const isSelected = editingUnit?.id === unit.id;

                    return (
                      <div
                        key={unit.id}
                        onClick={() => setEditingUnit(unit)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div>
                          {/* Unit Top Header */}
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                {unit.block ? `${unit.block} • ` : ''}{unit.floor || 'Parsel'}
                              </span>
                              <h5 className="font-black text-slate-900 text-sm">
                                {unit.doorNo}
                              </h5>
                            </div>

                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${uBadge.lightBg}`}>
                              {uBadge.label}
                            </span>
                          </div>

                          {/* Unit Specs */}
                          <div className="text-xs text-slate-600 space-y-1 mb-3">
                            <div className="flex items-center justify-between font-semibold">
                              <span>Tip:</span>
                              <span className="text-slate-900">{unit.type || '3+1'}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold">
                              <span>Büyüklük:</span>
                              <span className="text-slate-900">{unit.grossM2} m²</span>
                            </div>
                            {unit.facade && (
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span>Cephe:</span>
                                <span>{unit.facade}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price and Share Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900">
                            {formatCurrency(unit.price, project.currency)}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareUnit(unit);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Bu Daireyi WhatsApp'tan Paylaş"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Seçilen Birimin Hızlı Durum Düzenleme Paneli */}
              {editingUnit && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-blue-950">
                        {editingUnit.block ? editingUnit.block + ' ' : ''}{editingUnit.doorNo} Durumunu Güncelle
                      </span>
                      <p className="text-[11px] text-blue-800">
                        Dairenin/parselin satış aşamasını tek tıkla değiştirebilirsiniz.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingUnit(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 bg-white rounded-full w-6 h-6 flex items-center justify-center border"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={isUpdatingUnit}
                      onClick={() => handleUpdateUnitStatus(editingUnit, 'satilik')}
                      className={`py-2.5 px-3 rounded-xl font-black text-xs transition border flex items-center justify-center gap-1.5 ${
                        editingUnit.status === 'satilik'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <span>🟢 Satışta (Müsait)</span>
                    </button>

                    <button
                      disabled={isUpdatingUnit}
                      onClick={() => handleUpdateUnitStatus(editingUnit, 'kapora')}
                      className={`py-2.5 px-3 rounded-xl font-black text-xs transition border flex items-center justify-center gap-1.5 ${
                        editingUnit.status === 'kapora'
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                          : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <span>🟡 Kapora Alındı</span>
                    </button>

                    <button
                      disabled={isUpdatingUnit}
                      onClick={() => handleUpdateUnitStatus(editingUnit, 'satildi')}
                      className={`py-2.5 px-3 rounded-xl font-black text-xs transition border flex items-center justify-center gap-1.5 ${
                        editingUnit.status === 'satildi'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      <span>🔴 Satıldı</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROJE DETAYLARI & DONATILAR */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-2">Proje Hakkında</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {project.description || 'Bu proje için henüz ayrıntılı açıklama eklenmemiş.'}
                </p>
              </div>

              {/* Sosyal Donatılar */}
              {project.features && project.features.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Sosyal Donatılar & Özellikler</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {project.features.map((feat, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lokasyon ve Resmi Bilgiler */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">RESMİ BİLGİLER & ADRES</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold">İL / İLÇE</span>
                    <span className="font-black text-slate-800">{project.city} / {project.district}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">MAHALLE</span>
                    <span className="font-black text-slate-800">{project.neighborhood || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">ADA / PARSEL</span>
                    <span className="font-black text-slate-800">{project.ada || '-'} / {project.parsel || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">TESLİM TARİHİ</span>
                    <span className="font-black text-slate-800">{project.deliveryDate || 'Hemen Teslim'}</span>
                  </div>
                </div>
                {project.address && (
                  <p className="text-xs text-slate-600 pt-1 font-medium">
                    <span className="font-bold text-slate-700">Açık Adres:</span> {project.address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ÖDEME PLANI & LANSMAN KOŞULLARI */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 space-y-3">
                <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                  <span>💰 Lansman Satış & Ödeme Kolaylıkları</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {project.paymentPlans || 'Lansmana özel peşinatta %10 indirim veya %40 peşin 18 ay şirket içi sıfır faiz taksit imkanı sunulmaktadır.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="font-black text-slate-900 mb-1">🏦 Banka Kredisi Uygunluğu</h5>
                  <p className="text-slate-600">
                    Proje anlaşmalı kamu ve özel bankalardan konut/arsa kredisine uygundur. Ekspertiz garantisi mevcuttur.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="font-black text-slate-900 mb-1">🚗 Takas Seçenekleri</h5>
                  <p className="text-slate-600">
                    Müteahhit firma kural olarak değerinde araç ve kısmi gayrimenkul takas tekliflerini değerlendirmektedir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FOTOĞRAFLAR & GALERİ */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {project.videoUrl && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-red-900 flex items-center gap-2">
                    <span>🎬 Proje Tanıtım Videosu / Sanal Tur</span>
                  </span>
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm"
                  >
                    <span>İzle</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {project.photos && project.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.photos.map((photo, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 group relative">
                      <img
                        src={photo}
                        alt={`${project.title} - Görsel ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-bold">Projeye ait galeri görseli bulunmuyor.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-semibold">
            <span>Sorumlu Danışman: </span>
            <span className="font-bold text-slate-800">{project.agentName || 'Yönetici Admin'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text = `🏗️ ${project.title} projesi hakkında bilgi almak istiyorum.`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp'tan Paylaş</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
