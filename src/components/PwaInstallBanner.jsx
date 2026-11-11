import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone } from './Icons';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA or in native APK)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isNativeApp = !!window.Capacitor || window.location.protocol === 'capacitor:' || (/Android/i.test(window.navigator.userAgent) && /wv/i.test(window.navigator.userAgent));
    if (isStandalone || isNativeApp) {
      return;
    }

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if dismissed before
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (!isDismissed) {
      if (isIosDevice) {
        setShowBanner(true);
      }
    }

    // Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleCloseGuide = () => {
    setShowIosGuide(false);
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="w-full bg-slate-950 text-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-md border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Sol: İkon & Bilgilendirme */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-400/30">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 truncate">
                {isIOS ? 'iPhone & iPad Safari' : 'Mobil Uygulama'}
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                {isIOS ? 'Ana Ekrana Ekleyip Kullanın' : "Altın Emlak Sivas'ı Telefonunuza Yükleyin"}
              </p>
            </div>
          </div>

          {/* Sağ: Aksiyon Butonları */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isIOS ? (
              <button
                onClick={() => setShowIosGuide(true)}
                className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all shrink-0"
              >
                <PlusSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
                <span>Nasıl Eklenir?</span>
              </button>
            ) : (
              <>
                <a
                  href="/altinemlak.apk"
                  download="altinemlak.apk"
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all shrink-0"
                  title="Doğrudan Android APK Dosyasını İndir"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>APK İndir</span>
                </a>

                {deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Hızlı Kur</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors shrink-0"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Kurulum Rehberi Modalı */}
      {showIosGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-fade-in text-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                iPhone / iPad'e Yükleme
              </h3>
              <button onClick={() => setShowIosGuide(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Altın Emlak uygulamasını App Store gerekmeden 3 kolay adımda ana ekranınıza ekleyip tam ekran uygulama olarak kullanabilirsiniz:
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <div>
                  Safari ekranının altındaki <span className="font-semibold text-blue-600">Paylaş</span> (<Share2 className="w-4 h-4 inline text-blue-600 mx-0.5" />) simgesine dokunun.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <div>
                  Açılan menüde aşağı kaydırıp <span className="font-semibold text-slate-900">"Ana Ekrana Ekle"</span> (<PlusSquare className="w-4 h-4 inline text-slate-800 mx-0.5" />) seçeneğine basın.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <div>
                  Sağ üstteki <span className="font-semibold text-emerald-600">"Ekle"</span> butonuna dokunun. İkonunuz anında ana ekrana eklenir!
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseGuide}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
