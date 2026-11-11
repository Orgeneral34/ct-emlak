import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Building2, MapPin, Trophy, Users, 
  Home, ShieldCheck, Key, Smartphone, CheckCircle2, 
  ArrowRight, Sparkles, Send, FileText, ChevronDown, 
  ChevronUp, HelpCircle, ExternalLink, Compass, Flame,
  Maximize2, X, Eye
} from './Icons';

const GALLERY_IMAGES = [
  {
    id: 'cekmece',
    title: 'Sahada Hızlı İşlem Çekmecesi',
    subtitle: 'Mobil alt bardan tek dokunuşla açılan pratik işlem menüsü',
    src: '/guide/hizli-islem-cekmece.jpg',
    tag: 'Mobil PWA',
    tagColor: 'bg-purple-600 text-white'
  },
  {
    id: 'portfoy',
    title: 'Portföy İlanı & Sivas Detayı',
    subtitle: 'İstasyon Caddesi üzeri lüks satılık daire ve tek tıkla alıcı bulma',
    src: '/guide/portfoy-listesi.jpg',
    tag: 'Portföy',
    tagColor: 'bg-blue-600 text-white'
  },
  {
    id: 'harita',
    title: 'İlan Ekleme & İnteraktif Sivas Haritası',
    subtitle: 'Mahalle bazlı adresleme ve haritaya dokunarak pin bırakma',
    src: '/guide/portfoy-ekle-harita.jpg',
    tag: 'Harita',
    tagColor: 'bg-emerald-600 text-white'
  },
  {
    id: 'performans',
    title: 'Ofis Cirosu & Şampiyonlar Kürsüsü',
    subtitle: 'Haftalık 500.500 ₺ ciro, Elif Şahin & Can Demir başarı sıralaması',
    src: '/guide/performans-ciro.jpg',
    tag: 'Performans',
    tagColor: 'bg-amber-500 text-slate-950 font-black'
  },
  {
    id: 'kiraci',
    title: 'Halihazırdaki Kiracılar & Kira Takibi',
    subtitle: '84.500 ₺ aylık kira hacmi, ödeme günleri ve tahliye taahhütnamesi',
    src: '/guide/crm-kiraci-takip.jpg',
    tag: 'Kiracı CRM',
    tagColor: 'bg-teal-600 text-white'
  }
];

export default function UserGuideView({ onNavigateTab }) {
  const { isBroker, currentUser } = useAuth();
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const sections = [
    {
      id: 'pwa',
      icon: Smartphone,
      color: 'bg-purple-600',
      title: '1. PWA & Cep Telefonuna Uygulama Olarak Yükleme',
      subtitle: 'Sivas genelinde sahada gezen danışmanların telefonuna kurulum',
      image: '/guide/hizli-islem-cekmece.jpg',
      imageCaption: '📱 Canlı Ekran: Mobil Alt Menüden Açılan Sahada Hızlı İşlem Çekmecesi',
      content: (
        <div className="space-y-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Altın Emlak Sivas sistemi modern bir <strong>PWA (Progressive Web App)</strong> olarak kodlanmıştır. 
            Google Play veya Apple App Store onay beklemeden doğrudan telefonun ana ekranına bir mobil uygulama gibi kurulur.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200">
              <span className="font-black text-purple-900 block mb-1.5 flex items-center gap-1.5">
                <span>🤖 Android (Google Chrome):</span>
              </span>
              <ol className="list-decimal list-inside space-y-1 text-xs text-purple-800 font-medium">
                <li>Telefondan <strong>https://altinemlak.ceylantek.com</strong> adresine girin.</li>
                <li>Ekranın altında beliren <strong>"Ana Ekrana Ekle"</strong> butonuna basın.</li>
                <li>Veya sağ üstteki 3 noktadan <strong>"Uygulamayı Yükle"</strong> seçeneğini tıklayın.</li>
              </ol>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200">
              <span className="font-black text-blue-900 block mb-1.5 flex items-center gap-1.5">
                <span>🍎 iPhone (Apple Safari):</span>
              </span>
              <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800 font-medium">
                <li>Safari tarayıcısında <strong>https://altinemlak.ceylantek.com</strong> adresini açın.</li>
                <li>Alttaki <strong>Paylaş (Share / Yukarı ok)</strong> simgesine dokunun.</li>
                <li>Aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> butonuna basın.</li>
              </ol>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-semibold">
            💡 <strong>Saha Avantajı:</strong> Yüklendikten sonra uygulama tam ekran açılır, tarayıcı çubukları gizlenir. Service Worker sayesinde internet zayıf olsa dahi önbellekten anında açılır.
          </div>
        </div>
      )
    },
    {
      id: 'listings',
      icon: Building2,
      color: 'bg-blue-600',
      title: '2. Portföy & İlan Yönetimi',
      subtitle: 'Saha portföy girişi, fotoğraf yükleme ve detaylı filtreler',
      image: '/guide/portfoy-listesi.jpg',
      imageCaption: '🏡 Canlı Ekran: İstasyon Caddesi Üzeri Lüks Daire Portföy Kartı ve Alıcı Bul Butonu',
      content: (
        <div className="space-y-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Saha danışmanları aldıkları her satılık veya kiralık gayrimenkulü sisteme ekleyebilir. 
            Ofisteki 50 danışmanın tamamı bu portföyleri anlık olarak ortak havuzda görür.
          </p>

          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
            <li><strong>Portföy Ekleme:</strong> Üstteki mavi <em>"+ Portföy Ekle"</em> butonuna veya mobil alt bardaki sarı <em>"+"</em> butonuna tıklayın.</li>
            <li><strong>Fotoğraf Yükleme:</strong> Cep telefonu kamerasıyla yerinde çekim yapabilir veya galeriden birden fazla fotoğraf ekleyebilirsiniz.</li>
            <li><strong>Mülk Sahibi Gizliliği:</strong> Mülk sahibi adı ve telefonu sadece ofis içi danışmanların görmesi için güvenli tutulur.</li>
            <li><strong>Gelişmiş Filtreleme:</strong> İlçe, mahalle, satılık/kiralık, oda sayısı (1+1, 2+1, 3+1, 4+1), min/max fiyat ve sorumlu danışman kriterlerine göre saniyeler içinde arama yapabilirsiniz.</li>
            <li><strong>"Alıcı Bul" Butonu:</strong> Kart üzerindeki butona tıklandığında, CRM'deki alıcı talepleriyle otomatik eşleşen müşteriler anında listelenir.</li>
          </ul>

          <button
            onClick={() => onNavigateTab('listings')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs shadow transition"
          >
            <span>Portföy İlanlarına Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    {
      id: 'map',
      icon: MapPin,
      color: 'bg-emerald-600',
      title: '3. Sivas İnteraktif Harita & Konum Seçici',
      subtitle: 'Mahalle bazlı otomatik eşleşme, GPS ile konum bulma ve rota',
      image: '/guide/portfoy-ekle-harita.jpg',
      imageCaption: '🗺️ Canlı Ekran: Sivas Merkez (Gökmedrese, Paşabey) Harita Seçici ve Koordinat Tespiti',
      content: (
        <div className="space-y-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Tüm ilanlar Sivas haritası üzerinde canlı olarak işaretlenir. Satılıklar mavi (S), 
            kiralıklar yeşil (K) pinlerle ayırt edilir.
          </p>

          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
            <li><strong>İlan Girerken Haritadan Seçim:</strong> İlan formunda adres yazdıkça sistem Sivas mahallelerini (İstasyon Caddesi, Kümbet, Mevlana, Gültepe, Kılavuz, Alibaba vb.) otomatik tanır ve haritayı o noktaya odaklar. İsterseniz haritaya doğrudan dokunarak pini tam binanın üzerine bırakabilirsiniz.</li>
            <li><strong>Mevcut GPS Konumuna Git:</strong> Sağ üstteki pusula simgesine 🧭 dokunduğunuzda sahadaki danışmanın anlık bulunduğu GPS konumuna odaklanır.</li>
            <li><strong>Stabil İşaretçi Balonları:</strong> Harita üzerindeki pinlerin üzerine gelindiğinde fırlama yapmaz; fiyat, oda sayısı ve başlık içeren şık bir bilgi balonu açılır. Tıklanarak ilanın tüm detaylarına ulaşılabilir.</li>
          </ul>

          <button
            onClick={() => onNavigateTab('map')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow transition"
          >
            <span>Sivas Haritasını Aç</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    {
      id: 'performance',
      icon: Trophy,
      color: 'bg-amber-600',
      title: '4. Performans, Ciro Takibi & Haftalık Yönetici Raporu',
      subtitle: 'Danışman ciro hedefleri, prim takibi ve resmi PDF raporlama',
      image: '/guide/performans-ciro.jpg',
      imageCaption: '🏆 Canlı Ekran: 500.500 ₺ Haftalık Ciro ve Şampiyonlar Kürsüsü (Elif Şahin, Can Demir)',
      content: (
        <div className="space-y-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Her danışmanın yaptığı satışlar, ofise kazandırdığı ciro ve belirlenen hedefe ulaşma oranları 
            şeffaf olarak takip edilir.
          </p>

          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
            <li><strong>Satış Kapat (Ciro Girişi):</strong> Bir gayrimenkul satıldığında veya kiralandığında sarı <em>"Satış Kapat"</em> butonuyla işlem tutarı ve alınan komisyon kaydedilir. İlanın durumu otomatik olarak "Satıldı" veya "Kiralandı"ya çekilir.</li>
            <li><strong>Şampiyonlar Kürsüsü:</strong> Ayın en çok ciro yapan ilk 3 danışmanı (1. Altın Taçlı, 2. ve 3.) kürsüde öne çıkarılır.</li>
            <li><strong>Hedef Belirleme:</strong> Brokerlar, her danışmana aylık ciro hedefi (örn. 350.000 TL) tanımlayabilir.</li>
            <li><strong>Haftalık Yönetici Raporu:</strong> Performans sekmesindeki <em>"Haftalık Rapor Al"</em> butonuna tıklandığında ofisin o haftaki toplam satış hacmi, komisyon kazancı ve en çok ciro yapan 1. danışmanı gösteren profesyonel bir rapor sayfası açılır. Tek tıkla <strong>Yazdırabilir veya PDF</strong> kaydedebilirsiniz.</li>
          </ul>

          <button
            onClick={() => onNavigateTab('performance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow transition"
          >
            <span>Performans & Ciro Paneline Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    {
      id: 'crm',
      icon: Users,
      color: 'bg-indigo-600',
      title: '5. Müşteri CRM & Akıllı Eşleştirme (Smart Match)',
      subtitle: 'Alıcı ve kiracı talepleri, 5 aşamalı satış hunisi ve otomatik eşleşme',
      content: (
        <div className="space-y-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Ofise gelen veya telefonda ev arayan müşterilerin tüm talepleri CRM'e kaydedilir.
          </p>

          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
            <li><strong>5 Aşamalı Kanban Satış Hunisi:</strong> 
              <span className="font-semibold"> Yeni Talep ➔ Yer Gösterme ➔ Pazarlık ➔ Sözleşme ➔ Kazanıldı</span> adımlarıyla her müşterinin süreci takip edilir. Tek tıkla aşama ilerletilebilir.
            </li>
            <li><strong>Akıllı Portföy-Talep Eşleştirme Motoru:</strong> Bir müşterinin kartındaki <em>"Eşleştir"</em> butonuna bastığınızda, sistem portföydeki yüzlerce evi tarar; bütçe aralığı, oda sayısı ve aradığı mahalleye göre %85, %95 gibi uyum skoruyla müşteriye sunabileceğiniz en uygun evleri listeler.</li>
            <li><strong>Yer Gösterme Belgeleri:</strong> Yapılan yer göstermeler ve randevular tarih bazlı olarak CRM aktivitelerine eklenir.</li>
          </ul>

          <button
            onClick={() => onNavigateTab('crm')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow transition"
          >
            <span>Müşteri CRM Hunisine Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    {
      id: 'tenants',
      icon: Home,
      color: 'bg-teal-600',
      title: '6. Halihazırdaki Kiracılar & Kira Sözleşme Takibi',
      subtitle: 'Kira günleri, tahliye taahhütnamesi denetimi ve WhatsApp hatırlatma',
      image: '/guide/crm-kiraci-takip.jpg',
      imageCaption: '🏠 Canlı Ekran: 84.500 ₺ Aylık Kira Hacmi, Tahliye Taahhüt Alarmı ve Kiracı Kartları',
      content: (
        <div className="space-y-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Kiraya verilmiş olan aktif mülklerin ve kiracıların eksiksiz hukuki ve finansal takibi yapılır.
          </p>

          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
            <li><strong>Kira ve Ödeme Günü Takibi:</strong> Kiracının aylık kira tutarı, depozitosu ve her ayın kaçıncı günü (örn. ayın 5'i) kira ödediği kaydedilir.</li>
            <li><strong>Tahliye Taahhütnamesi Alarmı:</strong> Noter veya yazılı tahliye taahhütnamesi alınmamış kiracılar sistemde kırmızı alarm ile uyarılır. Böylece mülk sahibinin hukuki hakları güvenceye alınır.</li>
            <li><strong>Sözleşme Yenileme Zamanı:</strong> 1 yıllık süresi dolmak üzere olan sözleşmeler sarı renkle öne çıkar ve TÜFE oranına göre yeni kira artış görüşmesi hatırlatılır.</li>
            <li><strong>Tek Tıkla WhatsApp Kira Hatırlatıcı:</strong> Kart üzerindeki <em>"Kira Hatırlat"</em> butonuna basıldığında kiracının telefonuna özel hazır şablonlu WhatsApp mesajı anında açılır.</li>
          </ul>

          <button
            onClick={() => onNavigateTab('crm')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow transition"
          >
            <span>Kiracı Takip Sayfasına Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    {
      id: 'admin',
      icon: ShieldCheck,
      color: 'bg-rose-600',
      title: '7. 👑 Broker Yönetim Paneli (Admin)',
      subtitle: '50 kişilik personel kadrosu, şifre sıfırlama ve hedef yetkileri',
      content: (
        <div className="space-y-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Sadece Broker yetkisindeki yöneticiler (Ahmet Yılmaz & Selin Kaya) için üst menüde açılan altın taçlı yönetim modülüdür.
          </p>

          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
            <li><strong>Yeni Personel Ekleme:</strong> Yeni işe başlayan saha danışmanının adı, kullanıcı adı, başlangıç şifresi, uzmanlık unvanı ve aylık hedefi girilerek sisteme dahil edilir.</li>
            <li><strong>Şifre Sıfırlama:</strong> Şifresini unutan danışmanın şifresi yanındaki düzenleme butonundan 10 saniyede yenilenebilir.</li>
            <li><strong>Personel Silme:</strong> Ayrılan personelin hesabı kapatılabilir. Sistem son kalan yöneticinin yanlışlıkla silinmesini engelleyen kilit korumasına sahiptir.</li>
            <li><strong>Rol Değiştirme:</strong> Bir danışman Broker yapılabilir veya yetkisi düzenlenebilir.</li>
          </ul>

          {isBroker && (
            <button
              onClick={() => onNavigateTab('broker_admin')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow transition"
            >
              <span>Broker Yönetim Panelini Aç</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    },
    {
      id: 'auth',
      icon: Key,
      color: 'bg-slate-800',
      title: '8. Kullanıcı Girişi & Başlangıç Şifreleri',
      subtitle: 'Kullanıcı adı/şifre ile güvenli oturum ve 1 tıkla hızlı test profilleri',
      content: (
        <div className="space-y-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Sistemdeki tüm danışmanların kullanıcı adları ve şifreleri hazırdır:
          </p>

          <div className="p-3.5 bg-slate-100 rounded-2xl space-y-2 text-xs">
            <p><strong>Standart Başlangıç Şifresi:</strong> <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-slate-900 border border-slate-300">123</code></p>
            <p><strong>Broker Girişi:</strong> Kullanıcı adı: <code className="font-bold text-blue-600">ahmet</code> veya <code className="font-bold text-blue-600">selin</code></p>
            <p><strong>Saha Danışmanları:</strong> Kullanıcı adları isim.soyisim formatındadır (örn: <code className="font-bold text-slate-800">can.demir</code>, <code className="font-bold text-slate-800">elif.sahin</code>).</p>
          </div>

          <p className="text-xs text-slate-500">
            Giriş ekranında yer alan <em>"Hızlı Giriş Seçenekleri"</em> çipleriyle tek tıkla şifre yazmadan anında farklı danışman veya broker hesaplarına geçiş yaparak test edebilirsiniz.
          </p>
        </div>
      )
    }
  ];

  const faqs = [
    {
      q: 'Telefonumda internet çekmediğinde veya zayıf olduğunda program açılır mı?',
      a: 'Evet! Program PWA (Progressive Web App) standartlarında geliştirilmiştir ve yerel Service Worker önbelleği kullanır. Telefonunuza yüklediğinizde arayüz ve daha önce görüntülenen veriler internetsiz de saniyeler içinde açılır.'
    },
    {
      q: 'Kiracının tahliye taahhütnamesi uyarısı nasıl yeşile döner?',
      a: 'CRM sekmesinde "Halihazırdaki Kiracılar" bölümüne gidin. İlgili kiracının yanındaki düzenle butonuna basıp "Tahliye Taahhütnamesi Alındı mı?" anahtarını aktif edip kaydettiğinizde uyarı otomatik olarak yeşil onay rozetine dönüşür.'
    },
    {
      q: 'Saha danışmanları Broker Yönetim Paneli butonunu görebilir mi?',
      a: 'Hayır. Broker Paneli yetki kontrolüne bağlıdır. Sisteme Broker (Ahmet Yılmaz veya Selin Kaya) olarak giriş yapılmadığı sürece buton menüde gizlenir ve doğrudan erişim engellenir.'
    },
    {
      q: 'Haftalık raporu yazıcıdan çıkarabilir miyim veya WhatsApp ile gönderebilir miyim?',
      a: 'Evet! Performans sekmesinden "Haftalık Rapor Al" penceresini açıp "Yazdır / PDF Kaydet" butonuna bastığınızda tarayıcınız PDF çıktısı oluşturur. Bu PDF dosyasını WhatsApp veya e-posta ile ortaklara gönderebilirsiniz.'
    },
    {
      q: 'Yeni bir saha danışmanı işe başladığında sisteme nasıl eklenir?',
      a: 'Broker hesabıyla giriş yaptıktan sonra üstteki "👑 Broker Paneli"ne tıklayın. "Yeni Danışman / Broker Ekle" butonuna basarak personelin adı, telefon numarası ve aylık hedefini girmeniz yeterlidir. Danışman hemen listeye dahil olur.'
    }
  ];

  return (
    <div className="pb-28 pt-4 max-w-5xl mx-auto px-3 sm:px-6 space-y-6 animate-fade-in">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-950 via-slate-900 to-dark-900 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-widest shadow">
              ALTIN EMLAK SİVAS
            </span>
            <span className="text-xs text-amber-400 font-bold">
              Kullanım Kılavuzu & Sistem Rehberi
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            Saha Danışmanları & Brokerlar İçin Canlı Kullanım Rehberi
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium leading-relaxed">
            50 kişilik ekibin portföy paylaşımı, Sivas haritası, ciro takibi, müşteri CRM'i, 
            aktif kiracı yönetimi ve broker yetkilerinin nasıl kullanılacağını gerçek telefon ekran görüntüleriyle inceleyin.
          </p>

          <div className="text-[11px] font-semibold text-slate-400 mt-4 flex items-center gap-1.5">
            <span>Yazılım Geliştirici:</span>
            <a
              href="https://ceylantek.com"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 font-bold hover:underline flex items-center gap-0.5"
            >
              <span>ceylantek.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* --- YENİ BÖLÜM: CANLI MOBİL EKRAN GÖRÜNTÜLERİ GALERİSİ --- */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              <span>Canlı Mobil Ekran Görüntüleri (Saha Arayüzü)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Telefonda çalışan gerçek ekran görüntüleri — Büyütmek için görsele tıklayın
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
            5 Görsel
          </span>
        </div>

        {/* Horizontal Scrollable Gallery on Mobile / Grid on Desktop */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-5">
          {GALLERY_IMAGES.map((img) => (
            <div
              key={img.id}
              onClick={() => setLightboxImage(img)}
              className="group cursor-pointer shrink-0 w-44 sm:w-auto bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all"
            >
              {/* Image Container with phone-like ratio */}
              <div className="relative aspect-[9/18] overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-dark-950/20 group-hover:bg-dark-950/0 transition-colors" />
                <span className={`absolute top-2 left-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow ${img.tagColor}`}>
                  {img.tag}
                </span>
                <div className="absolute bottom-2 right-2 w-7 h-7 rounded-xl bg-dark-950/80 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Caption */}
              <div className="p-2.5">
                <h4 className="text-[11px] font-extrabold text-slate-900 line-clamp-1">
                  {img.title}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {img.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Jump Buttons */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Bölüm Başlıkları:
        </h3>
        <div className="flex flex-wrap gap-2">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                const el = document.getElementById(sec.id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setActiveAccordion(sec.id);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <span>{sec.title.split('.')[1] || sec.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Sections Accordion / Cards with Embedded Mobile Screens */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = activeAccordion === section.id || activeAccordion === null;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 scroll-mt-20"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleAccordion(section.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl ${section.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-sm sm:text-base text-slate-900 leading-snug">
                      {section.title}
                    </h2>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Accordion Body with Embedded Phone Screen */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 animate-fade-in space-y-4">
                  
                  {/* Embedded Mobile Screenshot (if available for this section) */}
                  {section.image && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                      <div 
                        onClick={() => setLightboxImage({ src: section.image, title: section.title, subtitle: section.imageCaption })}
                        className="relative w-36 sm:w-40 aspect-[9/18] rounded-xl overflow-hidden shadow-md border-2 border-slate-800 bg-slate-900 cursor-pointer shrink-0 group"
                      >
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-dark-950/20 group-hover:bg-dark-950/0 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-dark-950/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur transition-opacity flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" />
                            <span>Büyüt</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 text-center sm:text-left">
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider mb-1">
                          CANLI SAHA EKRANI
                        </span>
                        <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {section.imageCaption}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Danışmanların cep telefonunda birebir görüntülenen arayüzdür. Detaylı incelemek için görsele dokunup büyütebilirsiniz.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Text Content */}
                  <div>
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900">Sıkça Sorulan Sorular (SSS)</h3>
            <p className="text-xs text-slate-500">Saha kullanımında en çok karşılaşılan durumlar ve yanıtları</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3 space-y-1">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-start gap-2">
                <span className="text-amber-500 font-black">Q:</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 pl-5 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-dark-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-lg">Hemen Kullanmaya Başlayın</h3>
          <p className="text-xs text-blue-100 mt-1">
            Altın Emlak Sivas portföy havuzuna ilan ekleyin veya Sivas haritasını inceleyin.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onNavigateTab('listings')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-black text-xs rounded-xl shadow transition text-center"
          >
            Portföyleri Gör
          </button>
          <button
            onClick={() => onNavigateTab('map')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition text-center"
          >
            Haritayı Aç
          </button>
        </div>
      </div>

      {/* --- LIGHTBOX MODAL FOR SCREENSHOTS --- */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-dark-950/90 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-sm w-full max-h-[92vh] flex flex-col items-center bg-dark-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-dark-950/80 hover:bg-slate-800 text-white flex items-center justify-center z-10 transition shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="text-center w-full px-4 pt-2 pb-3">
              <h3 className="text-sm font-black text-white">{lightboxImage.title}</h3>
              {lightboxImage.subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{lightboxImage.subtitle}</p>
              )}
            </div>

            {/* Image */}
            <div className="relative overflow-hidden rounded-2xl max-h-[75vh] w-auto border border-slate-800">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
