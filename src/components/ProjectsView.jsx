import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, MapPin, Search, Filter, Plus, 
  Sparkles, Share2, Layers, CheckCircle2, 
  CalendarDays, Trash2, Edit3, Eye, ArrowRight
} from './Icons';
import { 
  formatCurrency, 
  getProjectTypeBadge, 
  getProjectStatusBadge 
} from '../utils/formatters';

export default function ProjectsView({
  projects = [],
  loading = false,
  onSelectProject,
  onOpenNewProject,
  onEditProject,
  onDeleteProject,
  onRefresh
}) {
  const { isBroker, currentUser } = useAuth();
  const [activeTypeTab, setActiveTypeTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter projects
  const filteredProjects = projects.filter(project => {
    if (activeTypeTab !== 'all' && project.projectType !== activeTypeTab) return false;
    if (statusFilter !== 'all' && project.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = project.title?.toLowerCase().includes(q);
      const matchCompany = project.developerCompany?.toLowerCase().includes(q);
      const matchDist = project.district?.toLowerCase().includes(q);
      const matchNeigh = project.neighborhood?.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchDist && !matchNeigh) return false;
    }
    return true;
  });

  // Calculate Overall Inventory Metrics
  const totalProjects = projects.length;
  let totalUnits = 0;
  let availableUnits = 0;
  let reservedUnits = 0;
  let soldUnits = 0;

  projects.forEach(p => {
    const units = p.units || [];
    totalUnits += units.length;
    units.forEach(u => {
      if (u.status === 'satilik') availableUnits++;
      else if (u.status === 'kapora') reservedUnits++;
      else if (u.status === 'satildi') soldUnits++;
    });
  });

  const handleShareProject = (e, project) => {
    e.stopPropagation();
    const units = project.units || [];
    const available = units.filter(u => u.status === 'satilik').length;
    const text = `🏗️ *${project.title}*\n\n` +
      `🏢 *Yapımcı Firma:* ${project.developerCompany || 'Ceylan İnşaat'}\n` +
      `📍 *Konum:* ${project.neighborhood ? project.neighborhood + ', ' : ''}${project.district} / ${project.city}\n` +
      `💰 *Başlangıç Fiyatı:* ${formatCurrency(project.startPrice, project.currency)}\n` +
      `📅 *Teslim Tarihi:* ${project.deliveryDate || 'Hemen Teslim'}\n` +
      `📦 *Müsaitlik:* Toplam ${units.length} üniteden ${available} adedi satışta.\n\n` +
      `👉 Detaylı bilgi ve randevu için iletişime geçebilirsiniz.`;

    if (navigator.share) {
      navigator.share({ title: project.title, text }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="pb-28 pt-4 max-w-7xl mx-auto px-3 sm:px-6 space-y-5">
      
      {/* Üst Başlık & Yeni Proje Ekle Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 p-5 sm:p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[11px] border border-amber-500/30">
              Şantiye & Çoklu Envanter Modülü
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-300 text-xs font-medium">Toplu Konut & Parselasyon</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>🏗️ Projeler & Şantiyeler</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Bina, site, parselasyonlu hobi arazileri ve villa projelerinizi alt birimleriyle (daire, parsel) birlikte yönetin.
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black px-5 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg border border-amber-300/40 transition shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Yeni Proje Başlat</span>
        </button>
      </div>

      {/* Proje Envanteri Genel İstatistik Çipleri */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm shrink-0 border border-blue-100">
            🏢
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOPLAM PROJE</p>
            <p className="text-lg font-black text-slate-900">{totalProjects}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-100">
            🟢
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SATIŞTA (MÜSAİT)</p>
            <p className="text-lg font-black text-emerald-600">{availableUnits} <span className="text-xs text-slate-400 font-bold">/ {totalUnits} ünite</span></p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm shrink-0 border border-amber-100">
            🟡
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">KAPORA / OPSİYON</p>
            <p className="text-lg font-black text-amber-600">{reservedUnits} <span className="text-xs text-slate-400 font-bold">ünite</span></p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-sm shrink-0 border border-rose-100">
            🔴
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SATILAN ÜNİTELER</p>
            <p className="text-lg font-black text-rose-600">{soldUnits} <span className="text-xs text-slate-400 font-bold">ünite</span></p>
          </div>
        </div>
      </div>

      {/* Arama & Tip Filtreleri */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Proje adı, yapımcı firma, ilçe veya mahalle ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white rounded-2xl border border-slate-200/90 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center transition"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 shadow-sm focus:outline-none"
          >
            <option value="all">Tüm Aşamalar</option>
            <option value="proje_asamasinda">Lansman / Proje</option>
            <option value="insaat_devam">İnşaat Devam Ediyor</option>
            <option value="teslime_hazir">Teslime Hazır</option>
            <option value="tamamlandi">Tamamlandı</option>
          </select>
        </div>

        {/* Tip Sekmeleri */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          {[
            { id: 'all', label: `Tüm Projeler (${projects.length})` },
            { id: 'bina_site', label: '🏢 Bina & Konut Sitesi' },
            { id: 'arsa_parsel', label: '🌾 Arsa & Hobi Parselleri' },
            { id: 'villa', label: '🏡 Villa Siteleri' },
            { id: 'sanayi', label: '🏭 Sanayi & Ticari' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeTab(tab.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 shadow-sm ${
                activeTypeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projeler Grid Listesi */}
      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Projeler yükleniyor...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-card">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100 text-2xl">
            🏗️
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg mb-1">Aramanıza Uygun Proje Bulunamadı</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            Seçtiğiniz filtrelerde henüz kayıtlı bir inşaat ya da arsa projesi bulunmuyor. Yeni bir proje başlatabilirsiniz.
          </p>
          <button
            onClick={onOpenNewProject}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow"
          >
            + İlk Projeyi Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const typeBadge = getProjectTypeBadge(project.projectType);
            const statusBadge = getProjectStatusBadge(project.status);
            const units = project.units || [];
            const total = units.length;
            const satilikCount = units.filter(u => u.status === 'satilik').length;
            const kaporaCount = units.filter(u => u.status === 'kapora').length;
            const satildiCount = units.filter(u => u.status === 'satildi').length;
            const soldPercent = total > 0 ? Math.round((satildiCount / total) * 100) : 0;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col group relative"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={project.coverImage || (project.photos && project.photos[0]) || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 items-center">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${typeBadge.bg}`}>
                      {typeBadge.label}
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Bottom Price Overlay */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-300 block drop-shadow">BAŞLANGIÇ FİYATI</span>
                      <span className="text-xl sm:text-2xl font-black text-white drop-shadow-md tracking-tight">
                        {formatCurrency(project.startPrice, project.currency)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleShareProject(e, project)}
                      className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg active:scale-90 transition shrink-0"
                      title="Projeyi WhatsApp'tan Paylaş"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div>
                    {/* Location & Firm */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <div className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{project.neighborhood ? `${project.neighborhood}, ` : ''}{project.district}</span>
                      </div>
                      {project.deliveryDate && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <CalendarDays className="w-3 h-3 text-slate-400" />
                          <span>{project.deliveryDate}</span>
                        </div>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h4>

                    {project.developerCompany && (
                      <p className="text-xs font-bold text-slate-600 mt-0.5 line-clamp-1">
                        🏢 {project.developerCompany}
                      </p>
                    )}
                  </div>

                  {/* Units Inventory Matrix Summary */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>Envanter Durumu</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {total} Bağımsız Bölüm
                      </span>
                    </div>

                    {/* Progress multi-color bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                      {satilikCount > 0 && (
                        <div 
                          style={{ width: `${(satilikCount / total) * 100}%` }} 
                          className="bg-emerald-500 h-full" 
                          title={`${satilikCount} Satışta`} 
                        />
                      )}
                      {kaporaCount > 0 && (
                        <div 
                          style={{ width: `${(kaporaCount / total) * 100}%` }} 
                          className="bg-amber-400 h-full" 
                          title={`${kaporaCount} Kapora`} 
                        />
                      )}
                      {satildiCount > 0 && (
                        <div 
                          style={{ width: `${(satildiCount / total) * 100}%` }} 
                          className="bg-rose-500 h-full" 
                          title={`${satildiCount} Satıldı`} 
                        />
                      )}
                    </div>

                    {/* Status Pill Counts */}
                    <div className="flex items-center justify-between text-[11px] font-extrabold pt-0.5">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>{satilikCount} Satışta</span>
                      </span>
                      <span className="text-amber-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        <span>{kaporaCount} Kapora</span>
                      </span>
                      <span className="text-rose-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                        <span>{satildiCount} Satıldı</span>
                      </span>
                    </div>
                  </div>

                  {/* Features preview */}
                  {project.features && project.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {project.features.slice(0, 3).map((feat, idx) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">
                          ✓ {feat}
                        </span>
                      ))}
                      {project.features.length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400 self-center">
                          +{project.features.length - 3} daha
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project);
                      }}
                      className="font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Vaziyet & Daire Planı</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {onEditProject && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditProject(project);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Projeyi Düzenle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {isBroker && onDeleteProject && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${project.title}" projesini ve tüm envanterini silmek istediğinize emin misiniz?`)) {
                              onDeleteProject(project.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Projeyi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
