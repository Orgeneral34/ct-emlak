import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Cookie, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Scale, 
  ExternalLink, 
  Printer, 
  Download,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import LegalModals from './LegalModals';
import { useAuth } from '../context/AuthContext';

export default function LegalComplianceView({ onNavigateContracts }) {
  const { currentUser, currentOffice, logout } = useAuth();
  const [activeModalTab, setActiveModalTab] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteMyAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError('Onay için lütfen şifrenizi girin.');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/auth/delete-account-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.username,
          password: deletePassword,
          reason: 'Uygulama içi hesap silme talebi'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Hesap silinemedi.');
      }
      alert(data.message || 'Hesabınız ve kişisel verileriniz kalıcı olarak silindi.');
      logout();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ticaret Bakanlığı & KVKK Resmi Uyum Merkezi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Yasal Uyum, TTBS & Veri Güvenliği
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Taşınmaz Ticareti Hakkında Yönetmelik, EİDS Elektronik İlan Doğrulama Sistemi ve 6698 sayılı KVKK kapsamındaki tüm kurumsal belge ve taahhütlerimiz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveModalTab('kvkk')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-950/40"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Aydınlatma Metnini Aç</span>
            </button>
            {onNavigateContracts && (
              <button
                onClick={onNavigateContracts}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
              >
                <FileText className="w-4 h-4" />
                <span>E-Sözleşmelere Git</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Three Pillar Statutory Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: TTBS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Resmi Onaylı</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">TİCARET BAKANLIĞI</span>
            <h3 className="text-base font-black text-slate-900 mt-0.5">Taşınmaz Ticareti Yetki Belgesi</h3>
            <p className="text-2xl font-black text-emerald-600 mt-2 tracking-tight font-mono">
              {currentOffice?.ttbsNo || '5800324'}
            </p>
          </div>

          <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
            <div><strong>İşletme:</strong> {currentOffice?.companyTitle || 'FOX EMLAK'} ({currentOffice?.name || 'Altın Emlak Sivas'})</div>
            <div><strong>Yetkili:</strong> {currentOffice?.ownerName || 'Semih Gülek'}</div>
            <div><strong>Yetkili İdare:</strong> T.C. {currentOffice?.city || 'Sivas'} Valiliği Ticaret İl Müd.</div>
          </div>
        </div>

        {/* Card 2: Vergi Levhası & Resmi Sicil */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black border border-blue-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>GİB & EİDS Onaylı</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">GELİR İDARESİ BAŞKANLIĞI & EİDS</span>
            <h3 className="text-base font-black text-slate-900 mt-0.5">Vergi Levhası & Ticari Künye</h3>
            <p className="text-2xl font-black text-blue-600 mt-2 tracking-tight font-mono">
              VKN: {currentOffice?.taxNumber || '4160184689'}
            </p>
          </div>

          <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
            <div><strong>Vergi Dairesi:</strong> {currentOffice?.taxOffice || 'Sivas Site Vergi Dairesi Müd.'}</div>
            <div><strong>NACE Kodu:</strong> 683101 (Gayrimenkul Aracılık)</div>
            <div><strong>Adres:</strong> {currentOffice?.address || 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez/Sivas'}</div>
          </div>
        </div>

        {/* Card 3: Seviye 5 Danışmanlık */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
              <Scale className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-black border border-purple-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>TÜRKAK & MYK</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">MESLEKİ YETERLİLİK KURUMU</span>
            <h3 className="text-base font-black text-slate-900 mt-0.5">Sorumlu Emlak Danışmanı (Seviye 5)</h3>
            <p className="text-base font-black text-purple-600 mt-2 font-mono truncate">
              {currentOffice?.mykBelgeNo || 'YB0322/17UY0333-5/00/594'}
            </p>
          </div>

          <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
            <div><strong>Belge Sahibi:</strong> {currentOffice?.ownerName || 'Semih Gülek'}</div>
            <div><strong>Ofis:</strong> {currentOffice?.name || 'Altın Emlak Sivas'}</div>
            <div><strong>Akreditasyon:</strong> TÜRKAK / MYK Ulusal Yeterlilik</div>
          </div>
        </div>

      </div>

      {/* 3. Statutory Commission Caps Table (Yönetmelik Madde 20) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Yasal Azami Hizmet Bedeli (Komisyon) Oranları
            </h3>
            <p className="text-xs text-slate-500">
              Taşınmaz Ticareti Hakkında Yönetmelik Madde 20 gereği taraflardan talep edilebilecek yasal sınırlar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Alım & Satım İşlemleri</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-black">Azami Sınır</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              %2 Alıcı + %2 Satıcı <span className="text-xs font-semibold text-slate-500">(+KDV)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Alım satım işlemlerinde hizmet bedeli oranı, satış bedelinin KDV hariç tutarı üzerinden alıcı ve satıcıdan ayrı ayrı %2'den fazla olamaz. Sözleşmede taraflardan birinin tüm bedeli üstlenmesi kararlaştırılabilir.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Kiralama İşlemleri</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-black">Azami Sınır</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              En Çok 1 Aylık Kira <span className="text-xs font-semibold text-slate-500">(+KDV)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kiralama işlemlerinde aracılık hizmet bedeli, kira sözleşmesinde belirlenen bir aylık kira bedelinin KDV hariç tutarından fazla olamaz. Aksi sözleşme şartları kanunen geçersizdir.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Core Policies & Documents Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider px-1">
          Resmi Sözleşme, Politika ve Taahhütnameler
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Policy 1: KVKK */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-amber-400 transition shadow-sm group">
            <div className="flex items-start justify-between gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <button
                onClick={() => setActiveModalTab('kvkk')}
                className="text-xs font-bold text-amber-600 group-hover:text-amber-500 flex items-center gap-1 transition"
              >
                <span>İncele & Yazdır</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-3">KVKK Aydınlatma Metni & Açık Rıza</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Web sitemiz ve dijital danışman kartvizitlerimizdeki lead formlarından toplanan kimlik, telefon ve tercih verilerinin 6698 sayılı kanun uyarınca işlenme şartları.
            </p>
          </div>

          {/* Policy 2: Terms of Service */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-blue-400 transition shadow-sm group">
            <div className="flex items-start justify-between gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <button
                onClick={() => setActiveModalTab('sozlesme')}
                className="text-xs font-bold text-blue-600 group-hover:text-blue-500 flex items-center gap-1 transition"
              >
                <span>İncele & Yazdır</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-3">Kullanıcı Sözleşmesi & Kullanım Koşulları</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Portföy içeriklerinin telif hakları, sahte/yanıltıcı ilan yasağı, yetki belgesi zorunluluğu ve site kullanımına ilişkin bağlayıcı hukuki çerçeve.
            </p>
          </div>

          {/* Policy 3: Cookie Policy */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-purple-400 transition shadow-sm group">
            <div className="flex items-start justify-between gap-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <button
                onClick={() => setActiveModalTab('cerez')}
                className="text-xs font-bold text-purple-600 group-hover:text-purple-500 flex items-center gap-1 transition"
              >
                <span>İncele & Yazdır</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-3">Çerez & Bilgi Güvenliği Politikası</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Zorunlu oturum yönetimi, danışman kimlik doğrulama, filtreleme tercihleri ve web güvenliği çerezlerine ilişkin aydınlatma.
            </p>
          </div>

          {/* Policy 4: Consultant NDA */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-rose-400 transition shadow-sm group">
            <div className="flex items-start justify-between gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <button
                onClick={() => setActiveModalTab('gizlilik_taahhut')}
                className="text-xs font-bold text-rose-600 group-hover:text-rose-500 flex items-center gap-1 transition"
              >
                <span>İncele & Yazdır</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-3">Danışman Sır Saklama & Portföy Güvenliği Taahhüdü</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Müşteri telefonlarının ve tapu verilerinin korunması, veri transfer yasağı, TCK m. 136 yaptırımları ve 12 aylık rekabet/cezai şart hükümleri.
            </p>
          </div>

        </div>
      </div>

      {/* 5. App Store & Google Play Mandatory In-App Account Deletion Section */}
      <div className="bg-rose-50/70 rounded-3xl p-5 sm:p-6 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-black text-rose-700 uppercase tracking-wider">
            KVKK Madde 7 & App Store / Google Play Veri Güvenliği
          </div>
          <h4 className="text-base font-extrabold text-slate-900">
            Hesabımı ve Kişisel Verilerimi Kalıcı Olarak Sil
          </h4>
          <p className="text-xs text-slate-600">
            Hesabınızı sildiğinizde kullanıcı profiliniz ve kişisel iletişim verileriniz sistemden kalıcı olarak kaldırılır.
          </p>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition"
        >
          Hesabımı Sil
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">
              Hesabınızı Kalıcı Olarak Silmek İstiyor Musunuz?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>@{currentUser?.username}</strong> hesabınız ve kişisel verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </p>
            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {deleteError}
              </div>
            )}
            <form onSubmit={handleDeleteMyAccount} className="space-y-3">
              <input
                type="password"
                required
                placeholder="Onaylamak için şifrenizi girin"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  {deleting ? 'Siliniyor...' : 'Evet, Hesabımı Kalıcı Sil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal Modals Component */}
      <LegalModals
        isOpen={Boolean(activeModalTab)}
        initialTab={activeModalTab || 'kvkk'}
        onClose={() => setActiveModalTab(null)}
      />

    </div>
  );
}
