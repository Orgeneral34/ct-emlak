import React, { useState } from 'react';
import {
  ShieldCheck, Lock, HelpCircle, Trash2, CheckCircle2, Mail, Phone,
  MapPin, ArrowLeft, Building2, AlertTriangle, FileText, Globe
} from 'lucide-react';

export default function StorePublicPages({ pageType = 'privacy', onBackToApp }) {
  const [activeTab, setActiveTab] = useState(pageType); // 'privacy' | 'support' | 'delete-account'
  const [supportForm, setSupportForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [supportSent, setSupportSent] = useState(false);

  const [deleteForm, setDeleteForm] = useState({ username: '', password: '', reason: '' });
  const [deleteResult, setDeleteResult] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const switchPage = (tab) => {
    setActiveTab(tab);
    window.history.pushState({}, '', `/${tab}`);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSupportSent(true);
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    if (!deleteForm.username.trim() || !deleteForm.password.trim()) {
      setDeleteError('Lütfen silinecek hesabın kullanıcı adını ve şifresini girin.');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/auth/delete-account-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteForm)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Hesap silme işlemi tamamlanamadı.');
      }
      setDeleteResult(data.message || 'Hesabınız ve ilişkili kişisel verileriniz kalıcı olarak silindi.');
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-lg leading-none">
                <span className="text-amber-400">CT</span> <span className="text-white">Emlak</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Kurumsal Gayrimenkul Portföy & CRM Platformu • ceylantek.com
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => switchPage('privacy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'privacy' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Gizlilik Politikası
            </button>
            <button
              onClick={() => switchPage('support')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'support' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Destek Merkezi
            </button>
            <button
              onClick={() => switchPage('delete-account')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'delete-account' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Hesap Silme
            </button>
            <button
              onClick={onBackToApp}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Portal Girişi
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'privacy' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  CT Emlak – Gizlilik Politikası ve KVKK Aydınlatma Metni
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Son Güncelleme: 11 Kasım 2026 • Apple App Store & Google Play Store Veri Güvenliği Beyanı
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                <strong>CT Emlak</strong> ("Uygulama"), <strong>Ceylantek Yazılım ve Teknoloji Çözümleri (ceylantek.com)</strong> tarafından geliştirilen çoklu ofis (Multi-Office SaaS) tabanlı kurumsal gayrimenkul portföy, müşteri ilişkileri (CRM), görev takibi ve dijital sözleşme yönetim platformudur.
              </p>

              <h3 className="text-base font-bold text-amber-400 pt-2">1. Toplanan Veriler ve Kullanım Amaçları</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Hesap ve Profil Bilgileri:</strong> Emlak ofisi yetkilileri (Broker) ve gayrimenkul danışmanlarının ad-soyad, kurumsal telefon, e-posta, MYK ve TTBS yetki belgesi numaraları; kullanıcı doğrulaması, ofis içi yetkilendirme ve dijital kartvizit oluşturma amacıyla işlenir.
                </li>
                <li>
                  <strong>Kamera ve Fotoğraf Galerisi İzni:</strong> Yalnızca kullanıcının kendi isteğiyle gayrimenkul portföy fotoğrafları veya profil fotoğrafı yüklemesi sırasında kullanılır. Arka planda izinsiz erişim yapılmaz.
                </li>
                <li>
                  <strong>Konum Bilgisi:</strong> Portföy ilanlarının harita üzerinde (Ada/Parsel ve Mahalle bazında) işaretlenmesi amacıyla kullanılır.
                </li>
                <li>
                  <strong>CRM ve Müşteri Kayıtları:</strong> Her emlak ofisinin kendi müşterilerine ait iletişim ve talep verileri yalnızca ilgili ofisin izole veritabanı alanında saklanır; diğer ofislerle veya üçüncü taraf reklam ağlarıyla kesinlikle paylaşılmaz.
                </li>
              </ul>

              <h3 className="text-base font-bold text-amber-400 pt-2">2. Veri Güvenliği ve Üçüncü Taraflarla Paylaşım</h3>
              <p>
                CT Emlak, kullanıcı verilerini hiçbir koşulda üçüncü taraf veri simsarlarına satmaz ve reklam takibi (Tracking) amacıyla kullanmaz. Veriler SSL/TLS şifreli bağlantılar üzerinden iletilir ve ofis bazlı yetkilendirme (Multi-Tenant Isolation) ile korunur.
              </p>

              <h3 className="text-base font-bold text-amber-400 pt-2">3. Hesap ve Veri Silme Hakkı (Account Deletion)</h3>
              <p>
                Kullanıcılarımız diledikleri zaman uygulama içerisindeki <strong>Yasal Uyum & Hesap Ayarları</strong> menüsünden veya doğrudan{' '}
                <button onClick={() => switchPage('delete-account')} className="text-amber-400 underline font-bold">
                  Hesap Silme Sayfası (/delete-account)
                </button>{' '}
                üzerinden hesaplarını ve ilişkili kişisel verilerini kalıcı olarak silebilirler.
              </p>

              <h3 className="text-base font-bold text-amber-400 pt-2">4. İletişim</h3>
              <p>
                Gizlilik politikamız ve KVKK kapsamındaki tüm sorularınız için <strong>iletisim@ceylantek.com</strong> adresinden veya{' '}
                <button onClick={() => switchPage('support')} className="text-amber-400 underline font-bold">
                  Destek Merkezimizden (/support)
                </button>{' '}
                bize ulaşabilirsiniz.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <HelpCircle className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  CT Emlak – Müşteri Destek & Yardım Merkezi
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  7/24 Teknik Destek, Yeni Emlak Ofisi Lisans Başvurusu ve Kullanıcı Yardımı
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <Phone className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-xs text-slate-400">Kurumsal Destek Hattı</div>
                <div className="text-sm font-bold text-white mt-0.5">+90 (532) 580 58 58</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <Mail className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-xs text-slate-400">E-Posta Desteği</div>
                <div className="text-sm font-bold text-white mt-0.5">destek@ceylantek.com</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <Globe className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-xs text-slate-400">Geliştirici & Altyapı</div>
                <div className="text-sm font-bold text-white mt-0.5">https://ceylantek.com</div>
              </div>
            </div>

            {supportSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Destek Talebiniz Alındı</h3>
                <p className="text-xs text-slate-300">
                  CT Emlak teknik ekibimiz en geç 24 saat içerisinde sizinle iletişime geçecektir.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-white">Bize Yazın / Destek veya Yeni Ofis Kurulum Talebi Gönderin</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız / Ofis Adı"
                    value={supportForm.name}
                    onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="E-Posta Adresiniz"
                    value={supportForm.email}
                    onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder="Telefon Numaranız"
                    value={supportForm.phone}
                    onChange={(e) => setSupportForm({ ...supportForm, phone: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Destek talebinizi veya yeni emlak ofisi abonelik isteğinizi buraya yazabilirsiniz..."
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition"
                >
                  Destek Talebini Gönder
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'delete-account' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Trash2 className="w-8 h-8 text-rose-500 shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Hesap ve Kişisel Veri Silme Merkezi (Account Deletion)
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Apple App Store & Google Play Store Kullanıcı Veri Silme Politikası Uyum Sayfası
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              CT Emlak üzerindeki kullanıcı hesabınızı ve hesabınıza bağlı kişisel profil verilerinizi kalıcı olarak silmek için aşağıdaki formu doldurabilir veya uygulama içerisinden <strong>Yasal Uyum & KVKK → Hesabımı Sil</strong> butonunu kullanabilirsiniz.
            </p>

            {deleteResult ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">İşlem Tamamlandı</h3>
                <p className="text-xs text-slate-300">{deleteResult}</p>
              </div>
            ) : (
              <form onSubmit={handleDeleteAccountSubmit} className="space-y-4 max-w-md">
                {deleteError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold p-3 rounded-xl">
                    {deleteError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Kullanıcı Adınız</label>
                  <input
                    type="text"
                    required
                    value={deleteForm.username}
                    onChange={(e) => setDeleteForm({ ...deleteForm, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    placeholder="Örn: kullanici.adi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Mevcut Şifreniz</label>
                  <input
                    type="password"
                    required
                    value={deleteForm.password}
                    onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    placeholder="••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Silme Nedeni (İsteğe Bağlı)</label>
                  <input
                    type="text"
                    value={deleteForm.reason}
                    onChange={(e) => setDeleteForm({ ...deleteForm, reason: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    placeholder="Örn: Artık kullanmıyorum"
                  />
                </div>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition"
                >
                  {deleting ? 'Siliniyor...' : 'Hesabımı ve Verilerimi Kalıcı Olarak Sil'}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
