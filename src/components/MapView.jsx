import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  formatCurrency, 
  getCategoryBadge, 
  getStatusBadge, 
  getSahibindenSearchUrl,
  getTkgmUrl,
  getKeosImarUrl
} from '../utils/formatters';
import { 
  Navigation, Layers, Filter, Compass, Building, 
  Bed, Maximize2, ExternalLink, X, MapPin 
} from './Icons';

export default function MapView({ listings, onSelectListing, initialListing }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);

  const [selectedListing, setSelectedListing] = useState(initialListing || null);
  const [mapFilter, setMapFilter] = useState('all'); // all, satilik, kiralik
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      // Default center: Sivas Meydan / Kongre Binası
      const initialLat = initialListing ? initialListing.lat : 39.7477;
      const initialLng = initialListing ? initialListing.lng : 37.0179;
      const initialZoom = initialListing ? 16 : 13;

      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false // Custom zoom or clean mobile UI
      }).setView([initialLat, initialLng], initialZoom);

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(leafletMap.current);

      // Add Zoom Control to top-right
      L.control.zoom({ position: 'topright' }).addTo(leafletMap.current);
    }

    return () => {
      // cleanup on unmount
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update Markers when listings or filter changes
  useEffect(() => {
    if (!leafletMap.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => leafletMap.current.removeLayer(m));
    markersRef.current = [];

    const filtered = listings.filter(item => {
      if (mapFilter === 'all') return true;
      return item.type === mapFilter;
    });

    const bounds = [];

    filtered.forEach(item => {
      if (!item.lat || !item.lng) return;

      bounds.push([item.lat, item.lng]);

      // Custom HTML Pin icon with stable inner scaling bubble
      const pinColor = item.type === 'satilik' ? '#2563eb' : '#059669';
      const iconHtml = `
        <div class="marker-pin-bubble" style="
          background-color: ${pinColor};
          color: white;
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 11px;
            font-weight: 800;
          ">${item.type === 'satilik' ? 'S' : 'K'}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'leaflet-custom-marker',
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon })
        .addTo(leafletMap.current)
        .bindTooltip(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.3;">
            <div style="font-size: 10px; font-weight: 800; color: ${item.type === 'satilik' ? '#38bdf8' : '#34d399'}; text-transform: uppercase;">
              ${item.type === 'satilik' ? 'SATILIK' : 'KİRALIK'} • ${item.roomCount || ''}
            </div>
            <div style="font-weight: 700; color: #ffffff; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
              ${item.title}
            </div>
            <div style="color: #fbbf24; font-weight: 900; font-size: 13px; margin-top: 2px;">
              ${formatCurrency(item.price, item.currency)}
            </div>
          </div>
        `, {
          direction: 'top',
          offset: [0, -34],
          className: 'custom-map-tooltip',
          opacity: 1
        })
        .on('click', () => {
          setSelectedListing(item);
          leafletMap.current.panTo([item.lat, item.lng], { animate: true });
        });

      markersRef.current.push(marker);
    });

    // Fit bounds if no specific initial listing selected
    if (!initialListing && bounds.length > 0) {
      leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [listings, mapFilter]);

  // If initialListing changes, pan to it
  useEffect(() => {
    if (initialListing && leafletMap.current) {
      setSelectedListing(initialListing);
      leafletMap.current.setView([initialListing.lat, initialListing.lng], 16, { animate: true });
    }
  }, [initialListing]);

  // Sahada Kullanıcının Kendi GPS Konumuna Gitme
  const handleGoToMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Cihazınızda GPS desteği bulunamadı.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setLocating(false);

        if (leafletMap.current) {
          leafletMap.current.setView([latitude, longitude], 15, { animate: true });

          // Add user pin marker
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div style="
                background-color: #f59e0b;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);
                animation: pulse 1.5s infinite;
              "></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(leafletMap.current)
            .bindPopup('<b>Buradasınız (Saha Konumunuz)</b>')
            .openPopup();
        }
      },
      (err) => {
        console.warn('GPS Error:', err);
        alert('Konum alınamadı.');
        setLocating(false);
      }
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] pb-16 overflow-hidden">
      
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Floating Top Filter Bar on Map */}
      <div className="absolute top-3 left-3 right-14 z-10 flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto">
        <button
          onClick={() => setMapFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition backdrop-blur-md ${
            mapFilter === 'all'
              ? 'bg-slate-900 text-white border border-slate-700'
              : 'bg-white/95 text-slate-700 border border-slate-200 hover:bg-white'
          }`}
        >
          Tüm İlanlar ({listings.length})
        </button>
        <button
          onClick={() => setMapFilter('satilik')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition backdrop-blur-md ${
            mapFilter === 'satilik'
              ? 'bg-blue-600 text-white border border-blue-500'
              : 'bg-white/95 text-blue-700 border border-slate-200 hover:bg-white'
          }`}
        >
          Satılık
        </button>
        <button
          onClick={() => setMapFilter('kiralik')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition backdrop-blur-md ${
            mapFilter === 'kiralik'
              ? 'bg-emerald-600 text-white border border-emerald-500'
              : 'bg-white/95 text-emerald-700 border border-slate-200 hover:bg-white'
          }`}
        >
          Kiralık
        </button>

        {/* Resmi Sorgu Portalları Hızlı Kısayolları */}
        <button
          type="button"
          onClick={() => window.open('https://parselsorgu.tkgm.gov.tr/', '_blank', 'noopener,noreferrer')}
          className="px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition backdrop-blur-md bg-white/95 text-red-600 hover:text-red-700 border border-slate-200 hover:bg-white flex items-center gap-1 shrink-0"
          title="TKGM Parsel Sorgulama Portalı"
        >
          <span>🗺️ TKGM Parsel</span>
        </button>

        <button
          type="button"
          onClick={() => window.open('https://keos.sivas.bel.tr/imardurumu/', '_blank', 'noopener,noreferrer')}
          className="px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition backdrop-blur-md bg-white/95 text-blue-600 hover:text-blue-700 border border-slate-200 hover:bg-white flex items-center gap-1 shrink-0"
          title="Sivas Belediyesi KEOS İmar Durumu Portalı"
        >
          <span>🏛️ Sivas E-İmar</span>
        </button>
      </div>

      {/* Floating GPS Location Button (Sahada gezen danışman için) */}
      <button
        onClick={handleGoToMyLocation}
        disabled={locating}
        className="absolute top-16 right-3 z-10 w-11 h-11 rounded-2xl bg-white text-slate-800 shadow-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition"
        title="Sahada Mevcut Konumuma Git"
      >
        <Compass className={`w-5 h-5 text-blue-600 ${locating ? 'animate-spin' : ''}`} />
      </button>

      {/* Bottom Popup Card for Selected Property */}
      {selectedListing && (
        <div className="absolute bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-20 animate-slide-up pointer-events-auto">
          <div
            onClick={() => onSelectListing && onSelectListing(selectedListing)}
            className="bg-white/95 backdrop-blur-md rounded-3xl p-3.5 shadow-2xl border border-slate-200/90 flex flex-col gap-2.5 cursor-pointer hover:border-blue-400 active:scale-[0.99] transition-all group select-none"
            title="İlan detaylarını açmak için dokunun"
          >
            {/* Top Row: Photo + Information */}
            <div className="flex items-center gap-3">
              {/* Image */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={selectedListing.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded shadow ${
                  selectedListing.type === 'satilik' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {selectedListing.type === 'satilik' ? 'Satılık' : 'Kiralık'}
                </span>
                {selectedListing.videoUrl && (
                  <span className="absolute bottom-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded bg-red-600/90 text-white shadow flex items-center gap-0.5">
                    <span>🎬 Video</span>
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 font-bold truncate">
                    {selectedListing.district}, {selectedListing.neighborhood}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedListing(null);
                    }}
                    className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
                    title="Kapat"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1 mt-0.5 group-hover:text-blue-600 transition-colors">
                  {selectedListing.title}
                </h4>

                <p className="text-sm font-black text-amber-600 mt-1">
                  {formatCurrency(selectedListing.price, selectedListing.currency)}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>{selectedListing.roomCount} • {selectedListing.grossM2} m²</span>
                  <span className="font-bold text-blue-600 group-hover:text-blue-800 flex items-center gap-1">
                    <span>Detay</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Sahibinden.com Emsal İlanları Butonu */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const url = getSahibindenSearchUrl(selectedListing);
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="w-full py-2 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition border border-amber-500/40"
              title="Bu bölgedeki sahibinden.com emsal ilanlarını gör"
            >
              <span className="w-2 h-2 rounded-full bg-slate-950 shrink-0" />
              <span className="truncate">
                Sahibinden'de {selectedListing.neighborhood || selectedListing.district} İlanlarını Aç
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-900 shrink-0 ml-0.5" />
            </button>

            {/* TKGM & E-İmar Hızlı Sorgulama Butonları */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedListing.ada && selectedListing.parsel && navigator.clipboard) {
                    navigator.clipboard.writeText(`${selectedListing.ada}/${selectedListing.parsel}`).catch(() => {});
                  }
                  window.open(getTkgmUrl(selectedListing), '_blank', 'noopener,noreferrer');
                }}
                className="py-1.5 px-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 transition active:scale-95 shadow-sm"
                title="TKGM Parsel Sorgu'da aç"
              >
                <span>🗺️ TKGM Parsel</span>
                {selectedListing.ada && selectedListing.parsel && (
                  <span className="text-[10px] opacity-80 font-mono font-bold">({selectedListing.ada}/{selectedListing.parsel})</span>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedListing.ada && selectedListing.parsel && navigator.clipboard) {
                    navigator.clipboard.writeText(`${selectedListing.ada}/${selectedListing.parsel}`).catch(() => {});
                  }
                  window.open(getKeosImarUrl(selectedListing), '_blank', 'noopener,noreferrer');
                }}
                className="py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 transition active:scale-95 shadow-sm"
                title={selectedListing.parselId ? `Sivas KEOS İmar Belgesi (ID: ${selectedListing.parselId})` : "Sivas Belediyesi E-İmar'da aç"}
              >
                <span>🏛️ Sivas E-İmar</span>
                {selectedListing.parselId && (
                  <span className="text-[10px] opacity-80 font-mono font-bold">({selectedListing.parselId})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
