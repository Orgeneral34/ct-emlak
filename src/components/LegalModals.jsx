import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Cookie, 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  ExternalLink,
  ChevronRight,
  Server
} from 'lucide-react';

export default function LegalModals({ 
  isOpen, 
  onClose, 
  initialTab = 'kvkk' 
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-scale-up print:max-h-none print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 print:bg-white print:text-black print:border-b-2 print:border-black">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 print:hidden">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white print:text-black">
                  Resmi Mevzuat, KVKK & Hukuk Dokümantasyonu
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest print:border-black print:text-black">
                  TTBS / EİDS / KVKK Uyumlu
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 print:text-slate-600">
                Aydınlatma Metinleri, Kullanıcı Sözleşmeleri ve Sunucu Altyapı Veri İşleyen Sözleşmesi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              title="Yazdır / PDF Olarak Kaydet"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar print:hidden">
          {[
            { id: 'kvkk', label: 'KVKK Aydınlatma Metni', icon: ShieldCheck },
            { id: 'saas_dpa', label: 'Sunucu Altyapı & Veri İşleyen Sözleşmesi', icon: Server },
            { id: 'sozlesme', label: 'Kullanıcı Sözleşmesi', icon: FileText },
            { id: 'cerez', label: 'Çerez & Güvenlik Politikası', icon: Cookie },
            { id: 'gizlilik_taahhut', label: 'Danışman Gizlilik Taahhüdü', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-700 font-normal">
          
          {/* TAB 1: KVKK AYDINLATMA METNİ */}
          {activeTab === 'kvkk' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                  6698 SAYILI KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK)
                </span>
                <h2 className="text-xl font-black text-slate-950">
                  Genel Müşteri & Web Sitesi İletişim Aydınlatma Metni
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Yasal Dayanak: KVKK Md. 10 & Taşınmaz Ticareti Hakkında Yönetmelik
                </p>
              </div>

              {/* 1. Veri Sorumlusu */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">1</span>
                  <span>Veri Sorumlusunun Kimliği</span>
                </h3>
                <p className="text-justify text-xs sm:text-sm">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca; <strong>FOX EMLAK - Semih Gülek (Altın Emlak Sivas Temsilciliği)</strong> (<em>Taşınmaz Ticareti Yetki Belge No: 5800324</em>) olarak, veri sorumlusu sıfatıyla, gayrimenkul aracılık faaliyetlerimiz, dijital web portallarımız ve saha danışmanı iletişim formlarımız aracılığıyla elde ettiğimiz kişisel verilerinizi aşağıda açıklanan kapsamda işlemekteyiz.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-medium">
                  <div><strong>Ticari Ünvan:</strong> FOX EMLAK - Semih Gülek (Altın Emlak Sivas)</div>
                  <div><strong>Yetki Belgesi No (TTBS):</strong> 5800324 (T.C. Sivas Valiliği Ticaret İl Müd.)</div>
                  <div><strong>Vergi Dairesi & VKN:</strong> Sivas Site V.D. / 4160184689</div>
                  <div><strong>Sorumlu Emlak Danışmanı (Seviye 5):</strong> YB0322/17UY0333-5/00/594</div>
                  <div><strong>Tebligat Adresi:</strong> Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas</div>
                  <div><strong>İletişim & E-Posta:</strong> 0532 681 91 71 | semih.gulek@altinemlaksivas.com</div>
                </div>
              </div>

              {/* 2. İşlenen Veriler */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">2</span>
                  <span>İşlenen Kişisel Veri Kategorileri</span>
                </h3>
                <p className="text-justify text-xs sm:text-sm">
                  Gayrimenkul arama, satma, kiralama, ekspertiz veya danışman iletişim formlarımız üzerinden toplanan veriler:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1 text-slate-700">
                  <li><strong>Kimlik Verileri:</strong> Ad, soyadı, T.C. kimlik numarası (resmi sözleşmeler ve tapu işlemleri için).</li>
                  <li><strong>İletişim Verileri:</strong> Telefon numarası, e-posta adresi, tebligat adresi.</li>
                  <li><strong>Müşteri Talep & Tercihleri:</strong> İlgilenilen gayrimenkul tipi, bütçe aralığı, lokasyon tercihleri, mülk detayları ve danışmana iletilen notlar.</li>
                  <li><strong>Taşınmaz Bilgileri:</strong> Tapu bilgileri, ada, parsel, bağımsız bölüm numarası ve mülkiyet durumu (yalnızca satıcı/kiralayan portföy sahipleri için).</li>
                  <li><strong>İşlem Güvenliği Verileri:</strong> IP adresi, form gönderim zaman damgası, oturum ve çerez kayıtları.</li>
                </ul>
              </div>

              {/* 3. İşleme Amaçları ve Hukuki Sebepler */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">3</span>
                  <span>Veri İşleme Amaçları ve Hukuki Sebepleri</span>
                </h3>
                <p className="text-justify text-xs sm:text-sm">
                  Kişisel verileriniz KVKK m. 5/2 uyarınca şu hukuki sebeplere dayalı olarak işlenmektedir:
                </p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60">
                    <strong className="text-blue-900">a) Bir Sözleşmenin Kurulması veya İfası (KVKK m. 5/2-c):</strong>
                    <p className="text-slate-600 mt-0.5">Gayrimenkul alım, satım, kiralama taleplerinizin değerlendirilmesi, yer gösterme formu ve aracılık sözleşmelerinin düzenlenmesi, randevu organizasyonu.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                    <strong className="text-emerald-900">b) Hukuki Yükümlülüğün Yerine Getirilmesi (KVKK m. 5/2-ç):</strong>
                    <p className="text-slate-600 mt-0.5">Ticaret Bakanlığı Taşınmaz Ticareti Hakkında Yönetmelik ve EİDS (Elektronik İlan Doğrulama Sistemi) mevzuatına uyum, MASAK ve vergi mevzuatı gereği faturalandırma ve kayıt saklama yükümlülükleri.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/60">
                    <strong className="text-purple-900">c) Veri Sorumlusunun Meşru Menfaati (KVKK m. 5/2-f):</strong>
                    <p className="text-slate-600 mt-0.5">Hizmet kalitesinin artırılması, müşteri memnuniyeti araştırmaları ve işlem güvenliğinin temini.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                    <strong className="text-amber-900">d) Açık Rıza (KVKK m. 5/1):</strong>
                    <p className="text-slate-600 mt-0.5">Yalnızca onay kutucuğunu açıkça işaretlemeniz halinde; yeni gayrimenkul portföyleri, fiyat düşüşleri ve piyasa analizlerine ilişkin ticari elektronik ileti (SMS/E-posta) gönderimi.</p>
                  </div>
                </div>
              </div>

              {/* 4. Veri Aktarımı */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">4</span>
                  <span>Kişisel Verilerin Aktarıldığı Taraflar</span>
                </h3>
                <p className="text-justify text-xs sm:text-sm">
                  Kişisel verileriniz; yalnızca yasal zorunluluklar ve hizmetin ifası amacıyla sınırlı olarak; <strong>T.C. Ticaret Bakanlığı</strong> (TTBS / EİDS sistemleri), <strong>Tapu ve Kadastro Genel Müdürlüğü (TKGM)</strong>, yetkili belediyeler, anlaşmalı noterler, işletmemiz bünyesindeki yetkili saha danışmanları ve hukuki uyuşmazlıklarda adli mercilere aktarılabilmektedir. Yurt dışına veri aktarımı yapılmamaktadır.
                </p>
              </div>

              {/* 5. Saklama Süresi ve İmha */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">5</span>
                  <span>Saklama Süresi ve Veri İmhası</span>
                </h3>
                <p className="text-justify text-xs sm:text-sm">
                  Taşınmaz Ticareti Hakkında Yönetmelik md. 16 uyarınca; emlak alım satım ve kiralama sözleşmeleri, yer gösterme belgeleri ve yetkilendirmeler <strong>5 (beş) yıl</strong> süreyle saklanmak zorundadır. Yasal saklama süresi sona eren veya işleme amacı ortadan kalkan veriler, Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik hükümlerine uygun olarak silinir veya anonimleştirilir.
                </p>
              </div>

              {/* 6. İlgili Kişi Hakları */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">6</span>
                  <span>İlgili Kişinin Hakları (KVKK Madde 11)</span>
                </h3>
                <p className="text-justify text-xs sm:text-sm">
                  KVKK’nın 11. maddesi kapsamında; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amaca uygun kullanılıp kullanılmadığını öğrenme, eksik/yanlış verilerin düzeltilmesini isteme ve şartları oluştuğunda verilerinizin silinmesini talep etme hakkına sahipsiniz. Başvurularınızı yazılı olarak <strong>Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas</strong> adresine veya <strong>semih.gulek@altinemlaksivas.com</strong> adresine kayıtlı e-posta ile iletebilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SAAS ALTYAPI, SUNUCU BARINDIRMA VE VERİ İŞLEYEN SÖZLEŞMESİ (DPA & İNDEMNİFİCATİON) */}
          {activeTab === 'saas_dpa' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                  HUKUKİ SORUMLULUK & İNDEMNIFICATION SÖZLEŞMESİ
                </span>
                <h2 className="text-xl font-black text-slate-950">
                  Yazılım (SaaS), Sunucu Barındırma ve KVKK Veri İşleyen Sözleşmesi
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Hizmet Sağlayıcı (Veri İşleyen) ile Emlak İşletmesi (Veri Sorumlusu) Arasında Yasal Sorumluluğu Düzenleyen Bağlayıcı Hükümler
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-medium space-y-1">
                <div className="flex items-center gap-2 font-black text-sm text-amber-800">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Yasal Sorumluluk Sınırı: Veri Sorumlusu Emlak İşletmesidir</span>
                </div>
                <p className="leading-relaxed">
                  Sunucu ve yazılım altyapısı Hizmet Sağlayıcı tarafından sağlanmakta olup; 6698 sayılı KVKK ve 5651 sayılı Kanun m. 5 (Yer Sağlayıcı) uyarınca sisteme girilen tüm portföy, ilan, müşteri iletişim verileri, tapu bilgileri ve sözleşme içeriklerinin münhasır yasal sorumlusu <strong>Emlak İşletmesi</strong>'dir.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">1. Tarafların Hukuki Sıfatları (KVKK m. 3)</h4>
                  <p className="text-justify leading-relaxed">
                    <strong>1.1 Hizmet Sağlayıcı:</strong> Sistemin teknik altyapısını, sunucu barındırma (hosting) ve yazılım hizmetini sunmakta olup; 6698 sayılı Kanun m. 3/1-ğ uyarınca <strong>"Veri İşleyen"</strong> ve 5651 sayılı Kanun m. 5 uyarınca <strong>"Yer Sağlayıcı"</strong> sıfatına haizdir.<br />
                    <strong>1.2 Emlak İşletmesi (Müşteri):</strong> Sisteme veri giren, danışmanları yöneten, müşterilerle temas kuran taraf olup; 6698 sayılı Kanun m. 3/1-ı uyarınca <strong>"Münhasır Veri Sorumlusu"</strong> ve <strong>"İçerik Sağlayıcı"</strong> sıfatına haizdir.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">2. Veri İçeriği, Doğruluk ve Aydınlatma Sorumluluğu</h4>
                  <p className="text-justify leading-relaxed">
                    Emlak İşletmesi; platforma kaydedilen tüm gayrimenkul sahiplerinin, alıcı ve kiracıların telefon, kimlik ve tapu verilerini KVKK m. 10 ve m. 5 hükümlerine uygun olarak, gerekli aydınlatmaları yaparak ve gerekiyorsa açık rızalarını alarak sisteme girdiğini beyan, kabul ve taahhüt eder. Hizmet Sağlayıcı'nın sisteme girilen verilerin hukuka uygunluğunu, rıza durumunu veya ilanların doğruluğunu araştırma ve denetleme yükümlülüğü bulunmamaktadır.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">3. EİDS ve Taşınmaz Ticareti Mevzuatı Uyumu</h4>
                  <p className="text-justify leading-relaxed">
                    Yayımlanan ilanların mülk sahibinden alınan e-Devlet EİDS yetkisine veya yazılı yetkilendirme sözleşmesine dayanması, sahte veya yanıltıcı ilan verilmemesi, Ticaret Bakanlığı Taşınmaz Ticareti Hakkında Yönetmelik gereğince münhasıran Emlak İşletmesi'nin sorumluluğundadır.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">4. Tam Rücu, Muafiyet ve Tazminat Şartı (Indemnification)</h4>
                  <p className="text-justify leading-relaxed">
                    Sisteme girilen veriler, yetkisiz ilanlar, telif ihlalleri veya KVKK'ya aykırılık iddiaları nedeniyle Kişisel Verileri Koruma Kurulu (KVKK), Ticaret Bakanlığı, Tüketici Hakem Heyetleri, Vergi Daireleri veya üçüncü şahıslar tarafından Hizmet Sağlayıcı'ya (sunucu sahibine) herhangi bir idari para cezası, adli ceza, tazminat veya dava yöneltilmesi halinde; Emlak İşletmesi doğacak tüm ana para, ceza, yasal faiz, vekalet ücreti ve dava masraflarını ilk yazılı talepte Hizmet Sağlayıcı'ya <strong>nakden ve defaten ödemeyi ve tazmin etmeyi</strong> kabul ve taahhüt eder.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">5. Bilgi Güvenliği ve Erişim Güvenliği</h4>
                  <p className="text-justify leading-relaxed">
                    Hizmet Sağlayıcı, sunucu düzeyinde endüstri standardı güvenlik önlemlerini (SSL şifreleme, firewall, veri izolasyonu) sağlamakla mükelleftir. Ancak Emlak İşletmesi danışmanlarının veya personelinin kullanıcı adı ve şifrelerini üçüncü kişilerle paylaşmasından, yetkisiz erişim vermesinden veya yerel cihaz güvenliğini sağlayamamasından doğan veri ihlallerinden Hizmet Sağlayıcı sorumlu tutulamaz.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KULLANICI SÖZLEŞMESİ & KULLANIM KOŞULLARI */}
          {activeTab === 'sozlesme' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                  KULLANIM KOŞULLARI & HİZMET SÖZLEŞMESİ
                </span>
                <h2 className="text-xl font-black text-slate-950">
                  Web Sitesi, Dijital Kartvizit ve Portföy Kullanım Sözleşmesi
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Taşınmaz Ticareti Hakkında Yönetmelik ve Türk Borçlar Kanunu Uyumlu Standart Şartlar
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">1. Taraflar ve Kapsam</h4>
                  <p className="text-justify">
                    İşbu Kullanıcı Sözleşmesi; yetkili emlak işletmesi tarafından yönetilen web siteleri, dijital saha danışman kartvizitleri ve CRM portallarına erişen tüm ziyaretçiler ve müşteriler (“Kullanıcı”) için geçerlidir. Platforma erişim sağlamakla bu koşulları peşinen kabul etmiş sayılırsınız.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">2. Taşınmaz İlanlarının Doğruluğu ve EİDS Bildirimi</h4>
                  <p className="text-justify">
                    Sistemde yayımlanan tüm gayrimenkul ilanları, mülk sahiplerinden alınan yasal yetki belgeleri veya <strong>Elektronik İlan Doğrulama Sistemi (EİDS)</strong> e-Devlet onayları doğrultusunda sisteme işlenmektedir. Platformda sahte, spekülatif, yanıltıcı veya fiyat manipülasyonu içeren ilan verilmesi kesinlikle yasaktır.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">3. Yasal Komisyon Oranları ve Hizmet Bedeli</h4>
                  <p className="text-justify">
                    Taşınmaz Ticareti Hakkında Yönetmelik md. 20 gereğince; gayrimenkul alım satım işlemlerinde aracılık hizmet bedeli, satış bedeli üzerinden <strong>alıcıdan %2 (+KDV)</strong> ve <strong>satıcıdan %2 (+KDV)</strong> olmak üzere azami yasal oranlar dahilinde uygulanır. Kiralama işlemlerinde ise hizmet bedeli bir aylık kira bedelini (+KDV) geçemez.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">4. Fikri Mülkiyet ve Telif Hakları</h4>
                  <p className="text-justify">
                    Web sitemizde ve danışman sayfalarında yer alan portföy fotoğrafları, 3D sanal turlar, videolar, grafikler ve metinler telif hakları ile korunmaktadır. Önceden yazılı izin alınmaksızın web kazıma (scraping), bot ile veri çekme, kopyalama veya başka platformlarda izinsiz yayımlanması hukuki ve cezai takibata tabidir.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">5. Uyuşmazlıkların Çözümü</h4>
                  <p className="text-justify">
                    İşbu sözleşmenin uygulanmasından doğabilecek her türlü uyuşmazlıkta Türkiye Cumhuriyeti Kanunları uygulanacak olup, ilgili yerel Mahkemeler ve İcra Daireleri münhasıran yetkilidir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ÇEREZ VE VERİ GÜVENLİĞİ POLİTİKASI */}
          {activeTab === 'cerez' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                  ÇEREZ (COOKIE) POLİTİKASI
                </span>
                <h2 className="text-xl font-black text-slate-950">
                  Çerez Kullanımı ve Web Güvenlik Aydınlatması
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  5809 sayılı Elektronik Haberleşme Kanunu ve KVKK Uyumlu Çerez Açıklamaları
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <p className="text-justify">
                  Web uygulamalarında, kullanıcı deneyiminizi geliştirmek, oturum güvenliğini temin etmek ve portföy filtreleme tercihlerinizi hatırlamak amacıyla zorunlu ve işlevsel çerezler (cookies) kullanılmaktadır.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">1. Zorunlu Çerezler</strong>
                    <p className="text-slate-600 text-xs">
                      Danışman ve broker giriş oturumlarının güvenle sürdürülmesi (JWT / Auth Token) ve form güvenliği için zorunludur. Kapatılamaz.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">2. İşlevsel Çerezler</strong>
                    <p className="text-slate-600 text-xs">
                      Son aradığınız mahalle, bütçe aralığı veya harita yakınlaştırma seviyenizi hatırlayarak sonraki ziyaretinizde kolaylık sağlar.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">3. Güvenlik & Loglama</strong>
                    <p className="text-slate-600 text-xs">
                      Brute-force şifre saldırılarını engellemek ve dijital lead formlarının spam botlar tarafından istismarını önlemek için anonim güvenlik kayıtları tutulur.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Çerez Tercihlerinin Yönetimi</h4>
                  <p className="text-justify text-xs sm:text-sm text-slate-600">
                    Tarayıcınızın (Chrome, Safari, Edge, Firefox vb.) ayarlar menüsünden çerezleri dilediğiniz zaman temizleyebilir veya engelleyebilirsiniz. Ancak zorunlu çerezlerin engellenmesi durumunda oturum açma ve talep formu gönderme fonksiyonları çalışmayabilir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DANIŞMAN VERİ GÜVENLİĞİ VE GİZLİLİK TAAHHÜTNAMESİ (INTERNAL CRM NDA) */}
          {activeTab === 'gizlilik_taahhut' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
                  İÇ MEVZUAT & SAHA KADROSU TAAHHÜTNAMESİ
                </span>
                <h2 className="text-xl font-black text-slate-950">
                  Gayrimenkul Danışmanı Sır Saklama, Müşteri Mahremiyeti ve Portföy Güvenliği Taahhüdü
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Yargıtay İçtihatları, 6698 Sayılı KVKK ve TCK m. 136 Kapsamında Bağlayıcı Yasal Bildirim
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium space-y-1">
                <div className="flex items-center gap-2 font-black text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Önemli Hukuki Hatırlatma: Müşteri Verileri Danışmanın Şahsi Mülkiyeti Değildir!</span>
                </div>
                <p className="leading-relaxed">
                  Kişisel Verileri Koruma Kurulu (KVKK) ilke kararları ve Yargıtay Hukuk Genel Kurulu içtihatları gereğince; ofis adına toplanan alıcı, satıcı, mülk sahibi telefon numaraları ve tapu kayıtlarının ana veri sorumlusu <strong>Emlak İşletmesi / Broker</strong>'dır. Danışmanların işten ayrılırken bu verileri şahsi belleğe kopyalaması, WhatsApp gruplarını çekmesi veya başka ofise taşıması <strong>TCK m. 136 uyarınca suç teşkil eder</strong>.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">1. Gizli Bilginin Tanımı ve Sınırları</h4>
                  <p className="text-justify">
                    CRM sistemine kayıtlı müşteri telefonları, tapu senetleri, kimlik fotokopileri, mal sahiplerinin pazarlık payları, geçmiş satış fiyatları, komisyon oranları ve ofis veri tabanındaki tüm kayıtlar ticari sır ve gizli bilgi niteliğindedir.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">2. Danışmanın Yükümlülükleri</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Danışman, edindiği müşteri bilgilerini yalnızca söz konusu gayrimenkulün pazarlanması amacıyla kullanabilir.</li>
                    <li>Müşteri iletişim bilgileri rakip emlak ofisleriyle, yetkisiz üçüncü şahıslarla paylaşılamaz.</li>
                    <li>Sistem şifreleri üçüncü kişilere devredilemez; tek bir hesaptan ortak kullanım yapılamaz.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">3. Ayrılma, Portföy Transfer Yasağı ve Cezai Şart</h4>
                  <p className="text-justify">
                    Danışman ofisteki görevinden ayrılsa dahi sır saklama yükümlülüğü süresiz olarak devam eder. Ayrılış tarihinden itibaren <strong>12 (on iki) ay boyunca</strong> ofis portföyündeki müşterilerle bağımsız veya başka bir emlak işletmesi namına doğrudan işlem yapamaz. Aksi halde, uğranılan müspet/menfi zararların tazminiyle birlikte son yıl elde edilen komisyonun 3 katı cezai şart uygulanır.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">4. Cezai Sorumluluk</h4>
                  <p className="text-justify">
                    Müşteri verilerinin izinsiz olarak harici diske kaydedilmesi veya rakip firmaya sızdırılması durumunda; TCK 136. maddesi (<em>"Verileri hukuka aykırı olarak verme veya ele geçirme"</em> - 2 yıldan 4 yıla kadar hapis cezası) kapsamında derhal Cumhuriyet Savcılığı'na suç duyurusunda bulunulur.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">
              Ticaret Bakanlığı Taşınmaz Ticareti Yetki Belge No: 5800324 (FOX EMLAK / Altın Emlak Sivas)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / İndir</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition"
            >
              Anladım & Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
