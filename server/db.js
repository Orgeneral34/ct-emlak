import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateMatch, findListingMatchesForDemand, findDemandMatchesForListing } from './matcher.js';
import { emailService } from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate all 14 official personnel (2 Brokers + 12 Field Agents) + 1 hidden Super Admin (Halil)
function generateInitialUsers() {
  return [
    {
      id: "USR-01",
      name: "Ahmet Mithat Soyipek",
      username: "ahmet.soyipek",
      aliases: ["ahmet", "ahmet.soyipek", "ahmetmithat", "ahmetmithatsoyipek"],
      password: "altin58",
      role: "broker",
      title: "Broker / Yönetici Ortak",
      email: "ahmet.soyipek@altinemlaksivas.com",
      phone: "0532 581 00 01",
      avatar: "",
      slug: "ahmetsoyipek",
      specialties: ["Sivas Genel Portföy", "Lüks Konut", "Ticari Gayrimenkul", "Yatırım Danışmanlığı"],
      bio: "Ahmet Mithat Soyipek, Altın Emlak Sivas Temsilciliği Broker / Yönetici Ortak olarak kurumsal gayrimenkul çözümleri sunmaktadır.",
      activeListingsCount: 8,
      monthlyTarget: 2500000,
      createdAt: "2026-01-01T08:00:00.000Z"
    },
    {
      id: "USR-02",
      name: "Semih Gülek",
      username: "semih.gulek",
      aliases: ["semih", "semih.gulek", "semihgulek"],
      password: "zirve58",
      role: "broker",
      title: "Broker / Yönetici Ortak",
      email: "semih.gulek@altinemlaksivas.com",
      phone: "0532 581 00 02",
      avatar: "",
      slug: "semihgulek",
      specialties: ["Arsa & Tarla", "Kat Karşılığı Projeler", "Sanayi & Ticari", "Yatırım Değerleme"],
      bio: "Semih Gülek, Altın Emlak Sivas Temsilciliği Broker / Yönetici Ortak olarak arsa, proje geliştirme ve ticari gayrimenkul yatırımlarında uzmandır.",
      activeListingsCount: 6,
      monthlyTarget: 2500000,
      createdAt: "2026-01-01T08:00:00.000Z"
    },
    {
      id: "USR-03",
      name: "Sinan Sarıtaş",
      username: "sinan.saritas",
      aliases: ["sinan", "sinan.saritas", "sinansaritas"],
      password: "merkez58",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "sinan.saritas@altinemlaksivas.com",
      phone: "0532 581 00 03",
      avatar: "",
      slug: "sinansaritas",
      specialties: ["İstasyon Caddesi & Çarşı", "Konut & Rezidans", "Kiralık Daire"],
      bio: "Sinan Sarıtaş, Altın Emlak Sivas bünyesinde konut ve kiralık portföy uzmanı olarak hizmet vermektedir.",
      activeListingsCount: 7,
      monthlyTarget: 450000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-04",
      name: "Melisa Güler",
      username: "melisa.guler",
      aliases: ["melisa", "melisa.guler", "melisaguler"],
      password: "guler2026",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "melisa.guler@altinemlaksivas.com",
      phone: "0532 581 00 04",
      avatar: "",
      slug: "melisaguler",
      specialties: ["Gültepe & Okullar Bölgesi", "Sıfır Konut Projeleri", "Aile Konutları"],
      bio: "Melisa Güler, Altın Emlak Sivas bünyesinde sıfır konut ve aile yaşam alanları konusunda danışmanlık vermektedir.",
      activeListingsCount: 5,
      monthlyTarget: 450000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-05",
      name: "Ayda Nur Demir",
      username: "aydanur.demir",
      aliases: ["ayda", "aydanur", "aydanur.demir", "aydanurdemir"],
      password: "demir58",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "aydanur.demir@altinemlaksivas.com",
      phone: "0532 581 00 05",
      avatar: "",
      slug: "aydanurdemir",
      specialties: ["Kümbet & Mevlana", "Konut Satış & Değerleme", "Yatırımlık Daire"],
      bio: "Ayda Nur Demir, Altın Emlak Sivas bölgesinde gayrimenkul satış ve portföy danışmanlığı yürütmektedir.",
      activeListingsCount: 4,
      monthlyTarget: 400000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-06",
      name: "Levent Arslan",
      username: "levent.arslan",
      aliases: ["levent", "levent.arslan", "leventarslan"],
      password: "arslan346",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "levent.arslan@altinemlaksivas.com",
      phone: "0532 581 00 06",
      avatar: "",
      slug: "leventarslan",
      specialties: ["Ticari Dükkan & Mağaza", "Ofis & Büro", "Devren Kiralık"],
      bio: "Levent Arslan, ticari gayrimenkul ve dükkan yatırımlarında kurumsal çözümler üretmektedir.",
      activeListingsCount: 4,
      monthlyTarget: 450000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-07",
      name: "Rıfat Koç",
      username: "rifat.koc",
      aliases: ["rifat", "rifat.koc", "rifatkoc"],
      password: "koc58",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "rifat.koc@altinemlaksivas.com",
      phone: "0532 581 00 07",
      avatar: "",
      slug: "rifatkoc",
      specialties: ["Kılavuz & Eğri Köprü", "Yeni İmar Alanları", "Site İçi Daireler"],
      bio: "Rıfat Koç, yeni imar bölgeleri ve site içi modern konut projelerinde uzman danışmandır.",
      activeListingsCount: 3,
      monthlyTarget: 400000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-08",
      name: "Ensar Alada",
      username: "ensar.alada",
      aliases: ["ensar", "ensar.alada", "ensaralada"],
      password: "aksu58",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "ensar.alada@altinemlaksivas.com",
      phone: "0532 581 00 08",
      avatar: "",
      slug: "ensaralada",
      specialties: ["Arsa & Parsel", "Bağ & Bahçe", "Yatırımlık Tarla"],
      bio: "Ensar Alada, Sivas merkez ve çevre ilçelerde arazi, arsa ve parsel geliştirme danışmanıdır.",
      activeListingsCount: 3,
      monthlyTarget: 400000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-09",
      name: "Berat Yanık",
      username: "berat.yanik",
      aliases: ["berat", "berat.yanik", "beratyanik"],
      password: "yanik346",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "berat.yanik@altinemlaksivas.com",
      phone: "0532 581 00 09",
      avatar: "",
      slug: "beratyanik",
      specialties: ["Şehir Merkezi & İstasyon", "2+1 & 3+1 Daireler", "Kredi Uygun Konut"],
      bio: "Berat Yanık, konut alım satım ve banka kredi süreçlerinde müşterilerine rehberlik etmektedir.",
      activeListingsCount: 3,
      monthlyTarget: 400000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-10",
      name: "Onur Çiçek",
      username: "onur.cicek",
      aliases: ["onur", "onur.cicek", "onurcicek"],
      password: "cicek58",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "onur.cicek@altinemlaksivas.com",
      phone: "0532 581 00 10",
      avatar: "",
      slug: "onurcicek",
      specialties: ["Fatih & Alibaba", "Konut Değerleme", "Ekspertiz & Hızlı Satış"],
      bio: "Onur Çiçek, portföy pazarlama ve hızlı satış stratejilerinde uzman saha danışmanıdır.",
      activeListingsCount: 3,
      monthlyTarget: 400000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-11",
      name: "Selçuk Yıldız",
      username: "selcuk.yildiz",
      aliases: ["selcuk", "selcuk.yildiz", "selcukyildiz"],
      password: "yildiz346",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "selcuk.yildiz@altinemlaksivas.com",
      phone: "0532 581 00 11",
      avatar: "",
      slug: "selcukyildiz",
      specialties: ["Organize Sanayi & Kılavuz", "Depo & Atölye", "Sanayi Parselleri"],
      bio: "Selçuk Yıldız, sanayi bölgeleri, fabrika ve lojistik depo alanlarında yatırım danışmanıdır.",
      activeListingsCount: 3,
      monthlyTarget: 450000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-12",
      name: "Buğra Can Görler",
      username: "bugra.gorler",
      aliases: ["bugra", "bugracan", "bugra.gorler", "bugracangorler"],
      password: "gorler58",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "bugra.gorler@altinemlaksivas.com",
      phone: "0532 581 00 12",
      avatar: "",
      slug: "bugragorler",
      specialties: ["Üniversite & Kardeşler", "Yatırımlık 1+1 Daireler", "Öğrenci & Memur Kiralama"],
      bio: "Buğra Can Görler, üniversite ve Kardeşler bölgesinde yüksek kira getirili portföylerde uzmandır.",
      activeListingsCount: 3,
      monthlyTarget: 400000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-13",
      name: "Buse Özer",
      username: "buse.ozer",
      aliases: ["buse", "buse.ozer", "buseozer"],
      password: "ozer346",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "buse.ozer@altinemlaksivas.com",
      phone: "0532 581 00 13",
      avatar: "",
      slug: "buseozer",
      specialties: ["Yenişehir & Tuzlugöl", "Lüks Daireler", "Müşteri İlişkileri"],
      bio: "Buse Özer, müşteri memnuniyeti odaklı konut danışmanlığı ve portföy yönetimi sunmaktadır.",
      activeListingsCount: 3,
      monthlyTarget: 400000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-14",
      name: "Yasemin Özek",
      username: "yasemin.ozek",
      aliases: ["yasemin", "yasemin.ozek", "yaseminozek"],
      password: "ozek58",
      role: "agent",
      title: "Gayrimenkul Danışmanı",
      email: "yasemin.ozek@altinemlaksivas.com",
      phone: "0532 581 00 14",
      avatar: "",
      slug: "yaseminozek",
      specialties: ["Mehmet Akif Ersoy & Diriliş", "Konut & Yaşam Alanları", "Kiralık Portföy"],
      bio: "Yasemin Özek, kiralık ve satılık konut arayışlarında profesyonel eşleştirme hizmeti sağlamaktadır.",
      activeListingsCount: 3,
      monthlyTarget: 400000,
      createdAt: "2026-01-15T09:00:00.000Z"
    },
    {
      id: "USR-HALIL",
      name: "Halil Ceylan",
      username: "halil",
      aliases: ["halil", "halilceylan"],
      password: "Halil123",
      role: "broker",
      hidden: true,
      title: "Sistem Yöneticisi & Altyapı Danışmanı",
      email: "halil@ceylantek.com",
      phone: "0532 500 58 58",
      avatar: "",
      slug: "halilceylan",
      specialties: ["Sistem Mimarisi", "Altyapı Yönetimi"],
      bio: "Sistem Yöneticisi & Altyapı Danışmanı",
      activeListingsCount: 0,
      monthlyTarget: 0,
      createdAt: "2026-01-01T08:00:00.000Z"
    }
  ];
}

// Generate realistic portfolio listings located in SİVAS (İstasyon Caddesi, Kümbet, Mevlana, Gültepe, Kılavuz, Alibaba, vb.)
function generateInitialListings(users) {
  return [
    {
      id: 'PRT-1001',
      title: 'İstasyon Caddesi Üzeri Sıfır Lüks 3+1 Daire (Meydana Yürüme)',
      type: 'satilik',
      category: 'konut',
      subCategory: 'daire',
      price: 5450000,
      currency: 'TRY',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'İstasyon Caddesi',
      address: 'İstasyon Cad. Atatürk Kongre Müzesi Karşısı No: 48',
      lat: 39.7460,
      lng: 37.0125,
      roomCount: '3+1',
      grossM2: 165,
      netM2: 145,
      buildingAge: 0,
      floor: '4. Kat (6 Katlı)',
      heating: 'Bireysel Doğalgaz Kombi',
      hasBalcony: true,
      hasElevator: true,
      hasParking: true,
      isFurnished: false,
      inSite: true,
      deedStatus: 'Kat Mülkiyetli',
      dues: 650,
      description: 'Sivas İstasyon Caddesi kalbinde, kapalı otoparklı, çift asansörlü prestijli sıfır projede, ebeveyn banyolu, giyinme odalı ve çift balkonlu lüks daire.',
      photos: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'aktif',
      agentId: 'USR-03',
      agentName: 'Can Demir',
      agentPhone: '0533 000 00 03',
      ownerName: 'Kemal Çetin',
      ownerPhone: '0532 999 12 34',
      ownerNotes: '5.200.000 TL altına inmek istemiyor. Pazarlık payı çok sınırlı.',
      createdAt: '2026-09-25T10:00:00.000Z',
      updatedAt: '2026-09-25T10:00:00.000Z',
      ada: '1120',
      parsel: '15',
      parselId: '5252',
      tkgmUrl: 'https://parselsorgu.tkgm.gov.tr/'
    },
    {
      id: 'PRT-1002',
      title: 'Mevlana Mahallesi Ethembey Parkı Yanı Satılık 4+1 Dubleks',
      type: 'satilik',
      category: 'konut',
      subCategory: 'daire',
      price: 6850000,
      currency: 'TRY',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Mevlana',
      address: 'Mevlana Cad. Park Önü Sitesi B Blok',
      lat: 39.7520,
      lng: 37.0340,
      roomCount: '4+1',
      grossM2: 230,
      netM2: 195,
      buildingAge: 2,
      floor: 'Çatı Dubleksi',
      heating: 'Yerden Isıtma (Bireysel)',
      hasBalcony: true,
      hasElevator: true,
      hasParking: true,
      isFurnished: false,
      inSite: true,
      deedStatus: 'Kat Mülkiyetli',
      dues: 700,
      description: 'Sivas manzaralı geniş teraslı, kış bahçeli, ebeveyn süitli, şık tasarımlı satılık dubleks.',
      photos: [
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'aktif',
      agentId: 'USR-04',
      agentName: 'Elif Şahin',
      agentPhone: '0533 000 00 04',
      ownerName: 'Nazife Hanım',
      ownerPhone: '0533 888 77 66',
      ownerNotes: 'Tapu hazır, krediye uygun.',
      createdAt: '2026-09-26T14:30:00.000Z',
      updatedAt: '2026-09-26T14:30:00.000Z'
    },
    {
      id: 'PRT-1003',
      title: 'Kümbet Giriş Kat Kurumsal Kiracılı 180 m² Köşe Dükkan',
      type: 'satilik',
      category: 'ticari',
      subCategory: 'dükkan',
      price: 8900000,
      currency: 'TRY',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Kümbet',
      address: 'Muhsin Yazıcıoğlu Bulvarı Girişi',
      lat: 39.7540,
      lng: 37.0210,
      roomCount: 'Dükkan',
      grossM2: 180,
      netM2: 165,
      buildingAge: 4,
      floor: 'Giriş Zemin Kat',
      heating: 'Klima + Kombi',
      hasBalcony: false,
      hasElevator: false,
      hasParking: true,
      isFurnished: false,
      inSite: false,
      deedStatus: 'Kat Mülkiyetli Ticari',
      dues: 300,
      description: 'Ana caddeye 18 metre cepheli, hazır kurumsal market kiracılı, aylık 45.000 TL kira getirili yüksek amortismanlı yatırım.',
      photos: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'aktif',
      agentId: 'USR-05',
      agentName: 'Burak Yıldız',
      agentPhone: '0533 000 00 05',
      ownerName: 'Vahap Bey',
      ownerPhone: '0535 444 33 22',
      ownerNotes: 'Kiracı sözleşmesi 5 yıllık, TÜFE artışlı.',
      createdAt: '2026-09-27T11:00:00.000Z',
      updatedAt: '2026-09-27T11:00:00.000Z'
    },
    {
      id: 'PRT-1004',
      title: 'Gültepe Okullar Bölgesi Kiralık Sıfır 2+1 Lüks Daire',
      type: 'kiralik',
      category: 'konut',
      subCategory: 'daire',
      price: 18500,
      currency: 'TRY',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Gültepe',
      address: 'Okullar Caddesi No: 22',
      lat: 39.7360,
      lng: 37.0080,
      roomCount: '2+1',
      grossM2: 110,
      netM2: 95,
      buildingAge: 0,
      floor: '3. Kat',
      heating: 'Bireysel Kombi',
      hasBalcony: true,
      hasElevator: true,
      hasParking: true,
      isFurnished: false,
      inSite: true,
      deedStatus: 'Kat Mülkiyetli',
      dues: 450,
      description: 'Adliye ve yeni stadyum yakını, ferah, çocuk oyun parklı site içerisinde aileye uygun kiralık daire.',
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'aktif',
      agentId: 'USR-06',
      agentName: 'Zeynep Çelik',
      agentPhone: '0533 000 00 06',
      ownerName: 'Hakan Çetin',
      ownerPhone: '0532 777 55 44',
      ownerNotes: 'Memur veya kurumsal çalışan tercih ediliyor.',
      createdAt: '2026-09-28T16:00:00.000Z',
      updatedAt: '2026-09-28T16:00:00.000Z'
    },
    {
      id: 'PRT-1005',
      title: 'Kılavuz Organize Sanayi Yolu Üzeri 4.200 m² Sanayi İmarlı Arsa',
      type: 'satilik',
      category: 'arsa',
      subCategory: 'arsa',
      price: 14500000,
      currency: 'TRY',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Kılavuz',
      address: 'Organize Sanayi Bağlantı Bulvarı Ada: 312 Parsel: 6',
      lat: 39.7610,
      lng: 37.0420,
      roomCount: 'Arsa',
      grossM2: 4200,
      netM2: 4200,
      buildingAge: 0,
      floor: '-',
      heating: 'Yok',
      hasBalcony: false,
      hasElevator: false,
      hasParking: true,
      isFurnished: false,
      inSite: false,
      deedStatus: 'Müstakil Parsel',
      dues: 0,
      description: 'Fabrika, depo veya antrepo yapımına uygun, tır yanaşma rampası yapılabilir, elektrik, su ve doğalgaz hattı hazır sanayi arsası.',
      photos: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'aktif',
      agentId: 'USR-01',
      agentName: 'Ahmet Yılmaz',
      agentPhone: '0532 111 00 01',
      ownerName: 'Ali Rıza Sivaslı',
      ownerPhone: '0533 111 22 33',
      ownerNotes: 'Kısmi daire takasına açık.',
      createdAt: '2026-09-22T09:00:00.000Z',
      updatedAt: '2026-09-22T09:00:00.000Z'
    },
    {
      id: 'PRT-1006',
      title: 'Paşabey Meydan Çarşı İçi Kiralık Prestijli Büro / Ofis',
      type: 'kiralik',
      category: 'ticari',
      subCategory: 'ofis',
      price: 26000,
      currency: 'TRY',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Paşabey',
      address: 'Bankalar Caddesi İş Merkezi Kat: 3',
      lat: 39.7485,
      lng: 37.0165,
      roomCount: '3+1',
      grossM2: 135,
      netM2: 120,
      buildingAge: 12,
      floor: '3. Kat',
      heating: 'Merkezi Sistem Doğalgaz',
      hasBalcony: true,
      hasElevator: true,
      hasParking: false,
      isFurnished: false,
      inSite: false,
      deedStatus: 'Kat Mülkiyetli',
      dues: 900,
      description: 'Avukatlık bürosu, mali müşavirlik veya sigorta acentesi için ideal merkezi konumda ofis.',
      photos: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'aktif',
      agentId: 'USR-07',
      agentName: 'Murat Öztürk',
      agentPhone: '0533 000 00 07',
      ownerName: 'Cevdet Usta',
      ownerPhone: '0536 222 33 44',
      ownerNotes: 'Yıllık peşin ödemede indirim yapılır.',
      createdAt: '2026-09-29T12:00:00.000Z',
      updatedAt: '2026-09-29T12:00:00.000Z'
    },
    {
      id: 'PRT-1007',
      title: 'Yenişehir Üniversite Yanı Eşyalı 1+1 Yatırımlık Daire',
      type: 'satilik',
      category: 'konut',
      subCategory: 'daire',
      price: 2450000,
      currency: 'TRY',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Yenişehir',
      address: 'Cumhuriyet Üniversitesi Yolu Kampüs Sitesi',
      lat: 39.7280,
      lng: 37.0250,
      roomCount: '1+1',
      grossM2: 60,
      netM2: 52,
      buildingAge: 3,
      floor: '2. Kat',
      heating: 'Bireysel Kombi',
      hasBalcony: true,
      hasElevator: true,
      hasParking: true,
      isFurnished: true,
      inSite: true,
      deedStatus: 'Kat Mülkiyetli',
      dues: 350,
      description: 'Hazır 14.000 TL kiracılı, ful sıfır eşyalı, üniversiteye ve şehir hastanesine tek vesait yatırımlık daire.',
      photos: [
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'aktif',
      agentId: 'USR-08',
      agentName: 'Gizem Aksoy',
      agentPhone: '0533 000 00 08',
      ownerName: 'Banu Yıldız',
      ownerPhone: '0533 666 99 22',
      ownerNotes: 'Nakit alıcı aranıyor.',
      createdAt: '2026-09-30T15:20:00.000Z',
      updatedAt: '2026-09-30T15:20:00.000Z'
    },
    {
      id: 'PRT-1008',
      title: 'Alibaba Mahallesi Müstakil Bahçeli 2 Katlı Sıfır Villa',
      type: 'satilik',
      category: 'konut',
      subCategory: 'villa',
      price: 7800000,
      currency: 'TRY',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Alibaba',
      address: 'Bağlar Mevkii 14. Sokak No: 6',
      lat: 39.7420,
      lng: 37.0310,
      roomCount: '5+1',
      grossM2: 320,
      netM2: 270,
      buildingAge: 1,
      floor: '2 Katlı Müstakil',
      heating: 'Doğalgaz Kombi + Şömine',
      hasBalcony: true,
      hasElevator: false,
      hasParking: true,
      isFurnished: false,
      inSite: false,
      deedStatus: 'Müstakil Tapu',
      dues: 0,
      description: '500 m² arsa içerisinde müstakil bahçeli, barbekü alanlı, otoparklı lüks müstakil yaşam.',
      photos: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'aktif',
      agentId: 'USR-03',
      agentName: 'Can Demir',
      agentPhone: '0533 000 00 03',
      ownerName: 'Perihan Teyze',
      ownerPhone: '0533 444 88 99',
      ownerNotes: 'Acele satılık.',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z'
    }
  ];
}

// Generate sample deals (completed sales & rentals in Sivas)
function generateInitialDeals() {
  return [
    {
      id: 'DL-2001',
      listingId: 'PRT-1001',
      listingTitle: 'İstasyon Caddesi 3+1 Daire Satışı',
      dealType: 'satilik',
      dealPrice: 5350000,
      commissionAmount: 214000, // 4% total commission
      agentShare: 107000, // 50%
      brokerShare: 107000, // 50%
      agentId: 'USR-03', // Can Demir
      agentName: 'Can Demir',
      closingDate: '2026-10-02T15:00:00.000Z',
      notes: 'Sivas Tapu Müdürlüğü devri tamamlandı.'
    },
    {
      id: 'DL-2002',
      listingId: 'PRT-1002',
      listingTitle: 'Mevlana 4+1 Dubleks Satışı',
      dealType: 'satilik',
      dealPrice: 6700000,
      commissionAmount: 268000,
      agentShare: 134000,
      brokerShare: 134000,
      agentId: 'USR-04', // Elif Şahin
      agentName: 'Elif Şahin',
      closingDate: '2026-10-03T11:30:00.000Z',
      notes: 'Kredi onaylandı, tapu devri yapıldı.'
    },
    {
      id: 'DL-2003',
      listingId: 'PRT-1004',
      listingTitle: 'Gültepe 2+1 Daire Kiralama',
      dealType: 'kiralik',
      dealPrice: 18500,
      commissionAmount: 18500,
      agentShare: 9250,
      brokerShare: 9250,
      agentId: 'USR-06', // Zeynep Çelik
      agentName: 'Zeynep Çelik',
      closingDate: '2026-10-01T16:00:00.000Z',
      notes: 'Öğretmen aileye kiralandı.'
    }
  ];
}

// Generate weekly/monthly targets set by Altın Emlak Sivas Brokers
function generateInitialTargets() {
  return [
    {
      id: 'TGT-1',
      period: 'weekly',
      periodKey: '2026-W40',
      agentId: 'USR-03',
      agentName: 'Can Demir',
      targetRevenue: 150000,
      targetDeals: 2,
      targetListings: 3,
      note: 'İstasyon Caddesi portföy hızlandırma'
    },
    {
      id: 'TGT-2',
      period: 'weekly',
      periodKey: '2026-W40',
      agentId: 'USR-04',
      agentName: 'Elif Şahin',
      targetRevenue: 120000,
      targetDeals: 1,
      targetListings: 2,
      note: 'Mevlana bölgesi'
    },
    {
      id: 'TGT-3',
      period: 'monthly',
      periodKey: '2026-10',
      agentId: 'USR-03',
      agentName: 'Can Demir',
      targetRevenue: 600000,
      targetDeals: 4,
      targetListings: 6,
      note: 'Aylık ciro hedefi'
    }
  ];
}

// Generate rich CRM Leads looking for properties in SİVAS
function generateInitialCrmLeads() {
  return [
    {
      id: 'CRM-3001',
      name: 'Dr. Kerem Aksoy (Numune Hastanesi)',
      phone: '0533 456 78 90',
      email: 'kerem.aksoy@saglik.gov.tr',
      type: 'alici',
      urgency: 'sicak',
      budgetMin: 4500000,
      budgetMax: 6000000,
      desiredCity: 'Sivas',
      desiredDistricts: ['Merkez', 'İstasyon', 'Gültepe'],
      desiredCategories: ['konut'],
      desiredRoomCounts: ['3+1', '4+1'],
      stage: 'yer_gosterme',
      agentId: 'USR-03',
      agentName: 'Can Demir',
      notes: 'İstasyon Caddesi veya Numune Hastanesi civarında 3+1 arıyor. Nakit alıcı, krediye ihtiyacı yok.',
      createdAt: '2026-10-01T09:30:00.000Z',
      updatedAt: '2026-10-03T11:00:00.000Z'
    },
    {
      id: 'CRM-3002',
      name: 'Sinem Vural (Mimar)',
      phone: '0532 987 65 43',
      email: 'sinem.vural@tasarim.com',
      type: 'alici',
      urgency: 'sicak',
      budgetMin: 6000000,
      budgetMax: 8000000,
      desiredCity: 'Sivas',
      desiredDistricts: ['Merkez', 'Mevlana', 'Alibaba'],
      desiredCategories: ['konut'],
      desiredRoomCounts: ['4+1', 'Villa'],
      stage: 'teklif_pazarlik',
      agentId: 'USR-04',
      agentName: 'Elif Şahin',
      notes: 'Mevlana dubleksini gezdi, 6.5M teklif hazırlıyor.',
      createdAt: '2026-09-28T14:00:00.000Z',
      updatedAt: '2026-10-04T08:10:00.000Z'
    },
    {
      id: 'CRM-3003',
      name: 'Volkan Şimşek (Akademisyen)',
      phone: '0535 321 00 11',
      email: 'volkan@cumhuriyet.edu.tr',
      type: 'kiraci',
      urgency: 'ilik',
      budgetMin: 15000,
      budgetMax: 22000,
      desiredCity: 'Sivas',
      desiredDistricts: ['Merkez', 'Gültepe', 'Yenişehir'],
      desiredCategories: ['konut'],
      desiredRoomCounts: ['2+1', '3+1'],
      stage: 'iletisim_kuruldu',
      agentId: 'USR-06',
      agentName: 'Zeynep Çelik',
      notes: 'Üniversiteye yakın veya Gültepe tarafında site içi arıyor.',
      createdAt: '2026-10-02T13:45:00.000Z',
      updatedAt: '2026-10-02T13:45:00.000Z'
    },
    {
      id: 'CRM-3004',
      name: 'Av. Mehmet Aydın',
      phone: '0532 234 56 78',
      email: 'mehmet@aydin-hukuk.av.tr',
      type: 'kiraci',
      urgency: 'sicak',
      budgetMin: 20000,
      budgetMax: 30000,
      desiredCity: 'Sivas',
      desiredDistricts: ['Merkez', 'Paşabey', 'İstasyon'],
      desiredCategories: ['ticari'],
      desiredRoomCounts: ['3+1', 'Ofis'],
      stage: 'kapora',
      agentId: 'USR-05',
      agentName: 'Burak Yıldız',
      notes: 'Paşabey ofis için kapora alındı.',
      createdAt: '2026-09-27T10:15:00.000Z',
      updatedAt: '2026-10-03T16:20:00.000Z'
    },
    {
      id: 'CRM-3005',
      name: 'Serhat Çetinkaya (Yatırımcı)',
      phone: '0530 876 54 32',
      email: 'serhat@cetinkaya.com.tr',
      type: 'yatirimci',
      urgency: 'ilik',
      budgetMin: 8000000,
      budgetMax: 16000000,
      desiredCity: 'Sivas',
      desiredDistricts: ['Merkez', 'Kılavuz', 'Organize Sanayi'],
      desiredCategories: ['arsa'],
      desiredRoomCounts: ['Arsa'],
      stage: 'yeni_talep',
      agentId: 'USR-07',
      agentName: 'Murat Öztürk',
      notes: 'Kılavuz OSB yolu üzerinde sanayi/depo arazisi arıyor.',
      createdAt: '2026-10-03T18:00:00.000Z',
      updatedAt: '2026-10-03T18:00:00.000Z'
    }
  ];
}

// Generate initial customer activities
function generateInitialActivities() {
  return [
    {
      id: 'ACT-4001',
      customerId: 'CRM-3001',
      customerName: 'Dr. Kerem Aksoy',
      listingId: 'PRT-1001',
      listingTitle: 'İstasyon Caddesi 3+1 Daire',
      type: 'yer_gosterme',
      date: '2026-10-02T14:30:00.000Z',
      agentId: 'USR-03',
      agentName: 'Can Demir',
      content: 'Mülk gezdirildi. Eşiyle birlikte baktılar, mutfağı ve İstasyon Caddesi cephesini çok beğendiler.',
      reminderDate: '2026-10-05T10:00:00.000Z',
      isCompleted: true
    },
    {
      id: 'ACT-4002',
      customerId: 'CRM-3002',
      customerName: 'Sinem Vural',
      listingId: 'PRT-1002',
      listingTitle: 'Mevlana 4+1 Dubleks',
      type: 'teklif',
      date: '2026-10-03T15:00:00.000Z',
      agentId: 'USR-04',
      agentName: 'Elif Şahin',
      content: '6.500.000 TL yazılı teklif iletildi.',
      reminderDate: '2026-10-04T12:00:00.000Z',
      isCompleted: false
    }
  ];
}

// Generate realistic active tenants & rental contracts in Sivas (İstasyon, Mevlana, Gültepe, Kılavuz, Çarşı)
function generateInitialTenants() {
  return [
    {
      id: 'TNT-1001',
      tenantName: 'Mehmet Ali Karagöz',
      tenantPhone: '0542 345 67 89',
      tenantTc: '28471938214',
      propertyId: 'PRT-1002',
      propertyTitle: 'Mevlana Mahallesi 4+1 Lüks Dubleks Daire',
      propertyAddress: 'Mevlana Mah. Rahmi Günay Cad. No: 12 Kat: 4',
      district: 'Merkez',
      neighborhood: 'Mevlana',
      ownerName: 'Haluk Bilgili',
      ownerPhone: '0533 888 77 66',
      rentAmount: 18500,
      depositAmount: 37000,
      currency: 'TRY',
      startDate: '2025-11-01',
      endDate: '2026-11-01',
      paymentDay: 5,
      hasEvictionCommitment: true,
      evictionDate: '2026-11-01',
      increaseRate: 65,
      status: 'aktif',
      agentId: 'USR-04',
      agentName: 'Elif Şahin',
      notes: 'Kirasını düzenli ödüyor, banka havalesi ile gönderiyor. Tahliye taahhütnamesi noter onaylı alındı.',
      createdAt: '2025-11-01T10:00:00.000Z'
    },
    {
      id: 'TNT-1002',
      tenantName: 'Dr. Serkan Tunç',
      tenantPhone: '0505 612 44 33',
      tenantTc: '39281746520',
      propertyId: 'PRT-1004',
      propertyTitle: 'Cumhuriyet Üniversitesi Kampüs Yanı Eşyalı 1+1 Stüdyo',
      propertyAddress: 'Yenişehir Mah. Kardeşler Cad. No: 28 D: 5',
      district: 'Merkez',
      neighborhood: 'Yenişehir',
      ownerName: 'Kemal Akın',
      ownerPhone: '0532 999 11 22',
      rentAmount: 12000,
      depositAmount: 12000,
      currency: 'TRY',
      startDate: '2026-02-15',
      endDate: '2027-02-15',
      paymentDay: 15,
      hasEvictionCommitment: true,
      evictionDate: '2027-02-15',
      increaseRate: 60,
      status: 'aktif',
      agentId: 'USR-03',
      agentName: 'Can Demir',
      notes: 'Cumhuriyet Tıp Fakültesinde asistan hekim, eşyalar eksiksiz teslim tutanağı ile teslim edildi.',
      createdAt: '2026-02-15T11:00:00.000Z'
    },
    {
      id: 'TNT-1003',
      tenantName: 'Gökhan Çetinkaya (Lezzet Sofrası)',
      tenantPhone: '0530 456 12 34',
      tenantTc: '19827364512',
      propertyId: 'PRT-1005',
      propertyTitle: 'Sivas Çarşı / Atatürk Caddesi Çift Cepheli Kiralık Dükkan',
      propertyAddress: 'Atatürk Cad. Bankalar Sırası No: 16',
      district: 'Merkez',
      neighborhood: 'Çarşı',
      ownerName: 'Süreyya Özkan',
      ownerPhone: '0535 777 44 11',
      rentAmount: 32000,
      depositAmount: 64000,
      currency: 'TRY',
      startDate: '2025-10-10',
      endDate: '2026-10-10',
      paymentDay: 1,
      hasEvictionCommitment: true,
      evictionDate: '2026-10-10',
      increaseRate: 65,
      status: 'yenileme_zamani',
      agentId: 'USR-01',
      agentName: 'Ahmet Yılmaz',
      notes: 'Sözleşme süresi bu ay bitiyor, yeni kira artışı ve 1 yıllık sözleşme yenileme görüşmesi yapılacak.',
      createdAt: '2025-10-10T09:00:00.000Z'
    },
    {
      id: 'TNT-1004',
      tenantName: 'Hüseyin Erdem',
      tenantPhone: '0544 789 01 23',
      tenantTc: '48392019482',
      propertyId: 'PRT-1006',
      propertyTitle: 'Kılavuz Mahallesi Site İçi 3+1 Daire',
      propertyAddress: 'Kılavuz Mah. Şehitler Cad. Huzur Konutları B Blok D: 7',
      district: 'Merkez',
      neighborhood: 'Kılavuz',
      ownerName: 'Cemalettin Yurt',
      ownerPhone: '0533 444 33 22',
      rentAmount: 14500,
      depositAmount: 14500,
      currency: 'TRY',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      paymentDay: 1,
      hasEvictionCommitment: false,
      evictionDate: '',
      increaseRate: 60,
      status: 'gecikmede',
      agentId: 'USR-05',
      agentName: 'Burak Yıldız',
      notes: 'Tahliye taahhütnamesi henüz imzalatılamadı! Bu ay ödeme gecikti, arandı ve hatırlatıldı.',
      createdAt: '2026-01-01T14:00:00.000Z'
    },
    {
      id: 'TNT-1005',
      tenantName: 'Av. Fatma Güler',
      tenantPhone: '0507 987 65 43',
      tenantTc: '59281740391',
      propertyId: 'PRT-1007',
      propertyTitle: 'İstasyon Caddesi Ofis & Büro Katı 2+1',
      propertyAddress: 'İstasyon Cad. Valilik Yakını İş Hanı Kat: 2',
      district: 'Merkez',
      neighborhood: 'İstasyon Caddesi',
      ownerName: 'Ahmet Yılmaz',
      ownerPhone: '0532 111 00 01',
      rentAmount: 22000,
      depositAmount: 44000,
      currency: 'TRY',
      startDate: '2026-04-01',
      endDate: '2027-04-01',
      paymentDay: 10,
      hasEvictionCommitment: true,
      evictionDate: '2027-04-01',
      increaseRate: 65,
      status: 'aktif',
      agentId: 'USR-02',
      agentName: 'Selin Kaya',
      notes: 'Hukuk bürosu olarak kullanılıyor, kira her ayın 10 unda aksatılmadan ödeniyor.',
      createdAt: '2026-04-01T10:00:00.000Z'
    }
  ];
}

// Generate realistic client/buyer demands in SİVAS (Talepler)
function generateInitialDemands() {
  return [
    {
      id: 'TLP-1001',
      title: 'Kılavuz Mahallesi 3+1 Satılık Daire Arayışı',
      clientName: 'Mehmet Fatih Kaya (Mühendis)',
      clientPhone: '0532 555 12 34',
      clientEmail: 'fatih.kaya@gmail.com',
      type: 'satilik',
      category: 'konut',
      city: 'Sivas',
      district: 'Merkez',
      neighborhoods: ['Kılavuz', 'Gültepe'],
      roomCounts: ['3+1'],
      minPrice: 3000000,
      maxPrice: 5000000,
      minM2: 120,
      maxM2: 160,
      urgency: 'sicak',
      notes: 'Kılavuz Mahallesi veya Gültepe civarında, tercihen ara kat, krediye uygun 3+1 daire arıyor. Peşinatı hazır.',
      status: 'aktif',
      agentId: 'USR-03',
      agentName: 'Can Demir',
      agentPhone: '0533 111 22 33',
      createdAt: '2026-10-04T10:00:00.000Z',
      updatedAt: '2026-10-04T10:00:00.000Z'
    },
    {
      id: 'TLP-1002',
      title: 'İstasyon Caddesi & Meydan Civarı Sıfır Lüks Daire',
      clientName: 'Dr. Kerem Aksoy (Numune Hastanesi)',
      clientPhone: '0533 456 78 90',
      clientEmail: 'kerem.aksoy@saglik.gov.tr',
      type: 'satilik',
      category: 'konut',
      city: 'Sivas',
      district: 'Merkez',
      neighborhoods: ['İstasyon', 'İstasyon Caddesi', 'Meydan', 'Pulur'],
      roomCounts: ['3+1', '4+1'],
      minPrice: 4500000,
      maxPrice: 6500000,
      minM2: 140,
      maxM2: 200,
      urgency: 'sicak',
      notes: 'İstasyon Caddesi üzerinde veya Kent Meydanı çevresinde sıfır veya lüks yapılı daire arıyor. Nakit alıcı.',
      status: 'aktif',
      agentId: 'USR-04',
      agentName: 'Elif Şahin',
      agentPhone: '0533 222 33 44',
      createdAt: '2026-10-03T14:30:00.000Z',
      updatedAt: '2026-10-03T14:30:00.000Z'
    },
    {
      id: 'TLP-1003',
      title: 'Gültepe veya Yenişehir Kiralık Daire',
      clientName: 'Merve Yılmaz (Öğretmen)',
      clientPhone: '0535 222 33 44',
      clientEmail: 'merve.yilmaz@meb.gov.tr',
      type: 'kiralik',
      category: 'konut',
      city: 'Sivas',
      district: 'Merkez',
      neighborhoods: ['Gültepe', 'Yenişehir'],
      roomCounts: ['2+1', '3+1'],
      minPrice: 15000,
      maxPrice: 22000,
      minM2: 90,
      maxM2: 130,
      urgency: 'sicak',
      notes: 'Okullara ve ulaşım güzergahına yakın, kombili temiz kiralık ev arıyor.',
      status: 'aktif',
      agentId: 'USR-06',
      agentName: 'Zeynep Çelik',
      agentPhone: '0535 333 44 55',
      createdAt: '2026-10-02T11:20:00.000Z',
      updatedAt: '2026-10-02T11:20:00.000Z'
    },
    {
      id: 'TLP-1004',
      title: 'Mevlana & Alibaba Satılık Dubleks / Villa',
      clientName: 'Sinem Vural (Mimar)',
      clientPhone: '0532 987 65 43',
      clientEmail: 'sinem.vural@tasarim.com',
      type: 'satilik',
      category: 'konut',
      city: 'Sivas',
      district: 'Merkez',
      neighborhoods: ['Mevlana', 'Alibaba'],
      roomCounts: ['4+1', '5+1', 'Villa'],
      minPrice: 6000000,
      maxPrice: 8500000,
      minM2: 180,
      maxM2: 300,
      urgency: 'ilik',
      notes: 'Müstakil bahçeli villa veya geniş 4+1 dubleks. Geniş teras şart.',
      status: 'aktif',
      agentId: 'USR-01',
      agentName: 'Ahmet Yılmaz',
      agentPhone: '0532 111 00 01',
      createdAt: '2026-09-30T16:00:00.000Z',
      updatedAt: '2026-09-30T16:00:00.000Z'
    },
    {
      id: 'TLP-1005',
      title: 'Kümbet Giriş Kat Kurumsal veya Ticari Dükkan',
      clientName: 'Hakan Yıldız (Yatırımcı)',
      clientPhone: '0530 111 22 33',
      clientEmail: 'hakan@yildizholding.com',
      type: 'satilik',
      category: 'ticari',
      city: 'Sivas',
      district: 'Merkez',
      neighborhoods: ['Kümbet', 'Meydan', 'Paşabey'],
      roomCounts: ['Dükkan'],
      minPrice: 6000000,
      maxPrice: 10000000,
      minM2: 150,
      maxM2: 350,
      urgency: 'yatirim',
      notes: 'Yüksek kira getirisi olan cadde üzeri köşe dükkan arıyor.',
      status: 'aktif',
      agentId: 'USR-05',
      agentName: 'Burak Demir',
      agentPhone: '0530 555 66 77',
      createdAt: '2026-10-01T09:15:00.000Z',
      updatedAt: '2026-10-01T09:15:00.000Z'
    },
    {
      id: 'TLP-1006',
      title: 'Kılavuz Organize Sanayi Civarı Sanayi İmarlı Arsa',
      clientName: 'Öztürk Makina Ltd. Şti.',
      clientPhone: '0532 444 88 99',
      clientEmail: 'info@ozturkmakina.com',
      type: 'satilik',
      category: 'arsa',
      city: 'Sivas',
      district: 'Merkez',
      neighborhoods: ['Kılavuz', 'Organize Sanayi'],
      roomCounts: ['Arsa'],
      minPrice: 10000000,
      maxPrice: 18000000,
      minM2: 3000,
      maxM2: 6000,
      urgency: 'sicak',
      notes: 'Fabrika ve depo yapımına uygun en az 3.000 m² sanayi arsası.',
      status: 'aktif',
      agentId: 'USR-02',
      agentName: 'Selin Kaya',
      agentPhone: '0532 111 00 02',
      createdAt: '2026-10-01T15:00:00.000Z',
      updatedAt: '2026-10-01T15:00:00.000Z'
    }
  ];
}

// Generate realistic in-app notifications
function generateInitialNotifications() {
  return [
    {
      id: 'NOTIF-101',
      type: 'match_alert',
      title: 'Yeni İlan & Talep Eşleşmesi!',
      message: '"İstasyon Caddesi Üzeri Sıfır Lüks 3+1 Daire" ilanı, Dr. Kerem Aksoy\'un 3+1 İstasyon talebiyle %100 eşleşti!',
      listingId: 'PRT-1001',
      listingTitle: 'İstasyon Caddesi Üzeri Sıfır Lüks 3+1 Daire (Meydana Yürüme)',
      demandId: 'TLP-1002',
      demandTitle: 'İstasyon Caddesi & Meydan Civarı Sıfır Lüks Daire',
      clientName: 'Dr. Kerem Aksoy (Numune Hastanesi)',
      clientPhone: '0533 456 78 90',
      score: 100,
      quality: 'mukemmel',
      reasons: ['Birebir aranan mahallede (İstasyon Caddesi)', 'Fiyat tam aranan bütçe aralığında', 'Oda sayısı tercihi uygun (3+1)'],
      agentId: 'USR-04',
      agentName: 'Elif Şahin',
      listingAgentName: 'Ahmet Yılmaz',
      createdAt: '2026-10-05T09:30:00.000Z',
      isRead: false
    },
    {
      id: 'NOTIF-102',
      type: 'match_alert',
      title: 'Kılavuz Mahallesi Talep Eşleşmesi!',
      message: 'Kılavuz Mahallesi 4.200 m² Sanayi İmarlı Arsa ilanı ile Öztürk Makina Ltd. Şti. talebi %100 eşleşti!',
      listingId: 'PRT-1005',
      listingTitle: 'Kılavuz Organize Sanayi Yolu Üzeri 4.200 m² Sanayi İmarlı Arsa',
      demandId: 'TLP-1006',
      demandTitle: 'Kılavuz Organize Sanayi Civarı Sanayi İmarlı Arsa',
      clientName: 'Öztürk Makina Ltd. Şti.',
      clientPhone: '0532 444 88 99',
      score: 100,
      quality: 'mukemmel',
      reasons: ['Birebir aranan mahallede (Kılavuz)', 'Fiyat tam aranan bütçe aralığında', 'Arsa imar kategorisi uyumlu'],
      agentId: 'USR-02',
      agentName: 'Selin Kaya',
      listingAgentName: 'Murat Öztürk',
      createdAt: '2026-10-05T10:15:00.000Z',
      isRead: false
    }
  ];
}

// Generate Realistic Real Estate Projects (Bina/Site, Arsa Parselasyon, Villa Sitesi)
function generateInitialProjects(users = []) {
  const adminUser = (users && users.find(u => u.role === 'broker')) || (users && users[0]) || {
    id: 'USR-ADMIN-A',
    name: 'Yönetici Admin',
    phone: '0532 500 00 00'
  };

  return [
    {
      id: 'PRJ-101',
      title: 'Kızılırmak Vadi Konakları',
      projectType: 'bina_site', // 'bina_site' | 'arsa_parsel' | 'villa' | 'sanayi'
      developerCompany: 'Ceylan Mimarlık & İnşaat A.Ş.',
      status: 'insaat_devam', // 'proje_asamasinda' | 'insaat_devam' | 'teslime_hazir' | 'tamamlandi'
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Kızılırmak Mah.',
      address: 'Kızılırmak Sahil Kordon Boyu No: 14',
      ada: '1420',
      parsel: '4',
      parselId: '5252',
      deliveryDate: 'Aralık 2026',
      startPrice: 3850000,
      currency: 'TRY',
      coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80'
      ],
      videoUrl: 'https://www.youtube.com/shorts/3i7z1pQhZkU',
      catalogPdf: '',
      description: 'Sivas Kızılırmak sahil bandında 2 blok, kapalı yüzme havuzu, fitness, kapalı otopark, yerden ısıtma ve 7/24 özel güvenlikli modern yaşam projesi. Farklı kat ve cephelerde 2+1 ve 3+1 daire seçenekleri.',
      features: ['Kapalı Otopark', 'Yüzme Havuzu', 'Fitness & Sauna', 'Çocuk Oyun Parkı', 'Yerden Isıtma', 'Çift Asansör', 'Jeneratör', 'Güvenlik & Kamera'],
      paymentPlans: '%40 Peşinat, Kalanı 18 Ay Sıfır Faiz Şirket İçi Taksit veya 1.20 Faizli Konut Kredisi',
      agentId: adminUser.id,
      agentName: adminUser.name,
      agentPhone: adminUser.phone,
      createdAt: '2026-10-01T09:00:00.000Z',
      updatedAt: '2026-10-19T10:00:00.000Z',
      units: [
        { id: 'U-101', block: 'A Blok', doorNo: 'Daire 1', floor: 'Zemin Kat', type: '2+1', grossM2: 115, netM2: 98, facade: 'Güney-Doğu', price: 3850000, status: 'satilik' },
        { id: 'U-102', block: 'A Blok', doorNo: 'Daire 2', floor: 'Zemin Kat', type: '3+1', grossM2: 155, netM2: 135, facade: 'Güney-Batı', price: 4450000, status: 'satilik' },
        { id: 'U-103', block: 'A Blok', doorNo: 'Daire 3', floor: '1. Kat', type: '2+1', grossM2: 120, netM2: 102, facade: 'Doğu', price: 4100000, status: 'kapora' },
        { id: 'U-104', block: 'A Blok', doorNo: 'Daire 4', floor: '1. Kat', type: '3+1', grossM2: 160, netM2: 140, facade: 'Güney', price: 4750000, status: 'satildi' },
        { id: 'U-105', block: 'A Blok', doorNo: 'Daire 5', floor: '2. Kat', type: '3+1', grossM2: 165, netM2: 145, facade: 'Güney-Doğu', price: 4950000, status: 'satilik' },
        { id: 'U-106', block: 'A Blok', doorNo: 'Daire 6', floor: '2. Kat', type: '3+1', grossM2: 165, netM2: 145, facade: 'Güney-Batı', price: 4950000, status: 'satildi' },
        { id: 'U-107', block: 'B Blok', doorNo: 'Daire 1', floor: 'Zemin Kat', type: '2+1', grossM2: 115, netM2: 98, facade: 'Doğu', price: 3900000, status: 'satilik' },
        { id: 'U-108', block: 'B Blok', doorNo: 'Daire 2', floor: '1. Kat', type: '3+1', grossM2: 155, netM2: 135, facade: 'Güney', price: 4600000, status: 'satilik' },
        { id: 'U-109', block: 'B Blok', doorNo: 'Daire 3', floor: '2. Kat', type: '3+1', grossM2: 160, netM2: 140, facade: 'Güney-Batı', price: 4850000, status: 'kapora' },
        { id: 'U-110', block: 'B Blok', doorNo: 'Daire 4', floor: '3. Kat', type: '4+1 Dubleks', grossM2: 220, netM2: 190, facade: 'Güney-Doğu-Batı', price: 6850000, status: 'satilik' }
      ]
    },
    {
      id: 'PRJ-102',
      title: 'Paşabahçe Eko-Bağ & Hobi Bahçesi Parselleri',
      projectType: 'arsa_parsel',
      developerCompany: 'Sivas Özgür Arazi Geliştirme',
      status: 'teslime_hazir',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Paşabahçe',
      address: 'Paşabahçe Mesire Yolu Üzeri 3. Km',
      ada: '2104',
      parsel: '12',
      deliveryDate: 'Hemen Teslim',
      startPrice: 650000,
      currency: 'TRY',
      coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1524813686514-a57563d77d66?w=1000&auto=format&fit=crop&q=80'
      ],
      videoUrl: '',
      catalogPdf: '',
      description: 'Şehir merkezine 8 dakika mesafede, her biri 500 m² bağımsız tel örgülü, elektrik ve kaynak suyu başına çekilmiş, 7 metre genişliğinde stabilize yolu açılmış hazır hobi bahçesi projesi.',
      features: ['Elektrik Hattı Çekili', 'Artezyen ve Şebeke Suyu', 'Etrafı Panel Çit Çevrili', 'Geniş Araç Yolu', 'Giriş Nizamiyesi', 'Sürgülü Demir Bahçe Kapısı'],
      paymentPlans: '%50 Peşinat, Kalanı 12 Ay Vade Farksız Senet veya Araç Takası İmkanı',
      agentId: adminUser.id,
      agentName: adminUser.name,
      agentPhone: adminUser.phone,
      createdAt: '2026-10-05T11:00:00.000Z',
      updatedAt: '2026-10-19T10:00:00.000Z',
      units: [
        { id: 'P-01', block: '', doorNo: 'Parsel 1', type: 'Köşe Parsel', grossM2: 600, netM2: 600, facade: 'Kuzey - Doğu', price: 790000, status: 'satildi' },
        { id: 'P-02', block: '', doorNo: 'Parsel 2', type: 'Standart Parsel', grossM2: 500, netM2: 500, facade: 'Doğu', price: 650000, status: 'satilik' },
        { id: 'P-03', block: '', doorNo: 'Parsel 3', type: 'Standart Parsel', grossM2: 500, netM2: 500, facade: 'Doğu', price: 650000, status: 'kapora' },
        { id: 'P-04', block: '', doorNo: 'Parsel 4', type: 'Standart Parsel', grossM2: 500, netM2: 500, facade: 'Doğu', price: 650000, status: 'satilik' },
        { id: 'P-05', block: '', doorNo: 'Parsel 5', type: 'Standart Parsel', grossM2: 500, netM2: 500, facade: 'Doğu', price: 650000, status: 'satildi' },
        { id: 'P-06', block: '', doorNo: 'Parsel 6', type: 'Köşe Parsel', grossM2: 550, netM2: 550, facade: 'Güney - Doğu', price: 740000, status: 'satilik' },
        { id: 'P-07', block: '', doorNo: 'Parsel 7', type: 'Standart Parsel', grossM2: 500, netM2: 500, facade: 'Batı', price: 650000, status: 'satilik' },
        { id: 'P-08', block: '', doorNo: 'Parsel 8', type: 'Standart Parsel', grossM2: 500, netM2: 500, facade: 'Batı', price: 650000, status: 'kapora' },
        { id: 'P-09', block: '', doorNo: 'Parsel 9', type: 'Standart Parsel', grossM2: 500, netM2: 500, facade: 'Batı', price: 650000, status: 'satilik' },
        { id: 'P-10', block: '', doorNo: 'Parsel 10', type: 'Köşe Parsel', grossM2: 580, netM2: 580, facade: 'Güney - Batı', price: 760000, status: 'satilik' }
      ]
    },
    {
      id: 'PRJ-103',
      title: 'Kardeşler Seyrantepe Doğa Villaları',
      projectType: 'villa',
      developerCompany: 'Kardeşler Yapı Grubu',
      status: 'insaat_devam',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: 'Kardeşler',
      address: 'Seyrantepe Mevkii Villa Bölgesi',
      ada: '3045',
      parsel: '8',
      deliveryDate: 'Ekim 2026',
      startPrice: 8900000,
      currency: 'TRY',
      coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80'
      ],
      videoUrl: '',
      catalogPdf: '',
      description: 'Sivas şehir manzarasına hakim, her biri 650 m² müstakil arsa payına ve özel yüzme havuzuna sahip 12 adet ultra lüks akıllı müstakil villa projesi.',
      features: ['Özel Yüzme Havuzu', 'Müstakil Bahçe (650 m²)', 'Akıllı Ev Otomasyonu', 'Kapalı Garaj (2 Araç)', 'Yerden Isıtma & Şömine', 'Giyinme Odası & Hamam'],
      paymentPlans: '%35 Peşinat, Kalanı İnşaat İlerlemesine Göre 4 Eşit Taksit',
      agentId: adminUser.id,
      agentName: adminUser.name,
      agentPhone: adminUser.phone,
      createdAt: '2026-10-08T14:00:00.000Z',
      updatedAt: '2026-10-19T10:00:00.000Z',
      units: [
        { id: 'V-01', block: '', doorNo: 'Villa 1', type: '5+2 Tripleks', grossM2: 380, netM2: 320, facade: 'Şehir & Doğa', price: 9800000, status: 'satildi' },
        { id: 'V-02', block: '', doorNo: 'Villa 2', type: '4+1 Dubleks', grossM2: 310, netM2: 260, facade: 'Şehir Manzaralı', price: 8900000, status: 'satilik' },
        { id: 'V-03', block: '', doorNo: 'Villa 3', type: '4+1 Dubleks', grossM2: 310, netM2: 260, facade: 'Şehir Manzaralı', price: 8900000, status: 'kapora' },
        { id: 'V-04', block: '', doorNo: 'Villa 4', type: '5+2 Tripleks', grossM2: 380, netM2: 320, facade: 'Tam Şehir & Vadi', price: 10200000, status: 'satilik' }
      ]
    }
  ];
}

// Official Corporate & Legal Compliance Settings (FOX EMLAK - Semih Gülek / Altın Emlak Sivas)
const OFFICIAL_SETTINGS = {
  officeName: 'Altın Emlak Sivas',
  legalCompanyName: 'FOX EMLAK - Semih Gülek (Altın Emlak Sivas Temsilciliği)',
  authorizedPerson: 'Semih Gülek',
  tcNo: '52063119434',
  taxOffice: 'Sivas Site Vergi Dairesi Müdürlüğü',
  taxNo: '4160184689',
  ttbsNo: '5800324',
  ttbsIssueDate: '06.10.2026',
  ttbsVerifyCode: 'b51949cb-824d-4c6f-a89b-48d0d5ca9fba',
  ttbsAuthority: 'T.C. Sivas Valiliği Ticaret İl Müdürlüğü',
  level5No: 'YB0322/17UY0333-5/00/594',
  level5IssueDate: '03.07.2025',
  level5ValidUntil: '02.07.2030',
  level5Authority: 'Ufuk Mesleki Yeterlilik Belgelendirme Ltd. Şti. (YB-0322 / TÜRKAK AB-0431-P)',
  naceCode: '683101 - Gayrimenkul Faaliyetleri İçin Aracılık Hizmeti Faaliyetleri',
  officePhone: '0532 681 91 71',
  officeEmail: 'semih.gulek@altinemlaksivas.com',
  officeAddress: 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas',
  brevoApiKey: '',
  brevoSenderEmail: 'semih.gulek@altinemlaksivas.com',
  brevoSenderName: 'Altın Emlak Sivas (FOX Emlak)',
  emailAutomationActive: true,
  notifyLeadToAgent: true,
  notifyWelcomeToCustomer: true,
  notifyAuthorityExpiring: true
};

const DEFAULT_FIRST_OFFICE = {
  id: 'OFC-01',
  name: 'Altın Emlak Sivas',
  shortBadge: 'SİVAS',
  brandColor: 'red',
  city: 'Sivas',
  district: 'Merkez',
  ...OFFICIAL_SETTINGS,
  planName: 'Kurumsal Pro',
  monthlyFee: 5000,
  status: 'aktif', // 'aktif' | 'askida' | 'demo'
  subscriptionEnd: '2027-11-08',
  createdAt: '2026-01-01T08:00:00.000Z'
};

// Database helper class with atomic read/write
class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  sanitizeUser(u) {
    if (!u) return null;
    const { password, ...safeUser } = u;
    const office = this.getOfficeById(u.officeId || 'OFC-01');
    return {
      ...safeUser,
      officeId: u.officeId || 'OFC-01',
      officeName: office?.name || office?.officeName || 'Altın Emlak Sivas'
    };
  }

  getNextId(items, prefix, startNum = 1001, pad = 0) {
    if (!Array.isArray(items) || items.length === 0) {
      const numStr = pad > 0 ? String(startNum).padStart(pad, '0') : String(startNum);
      return `${prefix}-${numStr}`;
    }
    let maxNum = startNum - 1;
    items.forEach(item => {
      if (item && typeof item.id === 'string' && item.id.startsWith(`${prefix}-`)) {
        const numPart = parseInt(item.id.slice(prefix.length + 1), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });
    const nextNum = maxNum + 1;
    const numStr = pad > 0 ? String(nextNum).padStart(pad, '0') : String(nextNum);
    return `${prefix}-${numStr}`;
  }

  recalculateActiveListingsCounts() {
    if (!this.data?.users || !Array.isArray(this.data.users)) return;
    const listings = this.data.listings || [];
    this.data.users.forEach(u => {
      u.activeListingsCount = listings.filter(l => l.agentId === u.id && l.status === 'aktif').length;
    });
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        let changed = false;

        // Ensure multi-office array exists with OFC-01 (Altın Emlak Sivas)
        if (!this.data.offices || !Array.isArray(this.data.offices) || this.data.offices.length === 0) {
          this.data.offices = [{ ...DEFAULT_FIRST_OFFICE, ...(this.data.settings || {}) }];
          changed = true;
        } else {
          const ofc01Idx = this.data.offices.findIndex(o => o.id === 'OFC-01');
          if (ofc01Idx === -1) {
            this.data.offices.unshift({ ...DEFAULT_FIRST_OFFICE, ...(this.data.settings || {}) });
            changed = true;
          } else {
            this.data.offices[ofc01Idx] = {
              ...DEFAULT_FIRST_OFFICE,
              ...this.data.offices[ofc01Idx],
              id: 'OFC-01',
              name: this.data.offices[ofc01Idx].name || this.data.offices[ofc01Idx].officeName || 'Altın Emlak Sivas',
              officeName: this.data.offices[ofc01Idx].officeName || this.data.offices[ofc01Idx].name || 'Altın Emlak Sivas'
            };
          }
        }

        // Remove 'a' user permanently if present
        if (this.data.users) {
          const beforeLen = this.data.users.length;
          this.data.users = this.data.users.filter(u => u.username !== 'a' && u.id !== 'USR-ADMIN-A');
          if (this.data.users.length !== beforeLen) changed = true;
        }

        // Ensure Halil Ceylan exists as hidden Super Admin (CT Emlak SaaS Kurucusu)
        if (this.data.users) {
          const halilIdx = this.data.users.findIndex(u => u.username === 'halil' || u.id === 'USR-HALIL' || u.slug === 'halilceylan' || u.id === 'USR-00');
          const halilData = {
            id: 'USR-HALIL',
            name: 'Halil Ceylan',
            username: 'halil',
            aliases: ['halil', 'halilceylan'],
            slug: 'halilceylan',
            password: 'Halil123',
            role: 'broker',
            isSuperAdmin: true,
            hidden: true,
            officeId: 'OFC-01',
            title: 'CT Emlak Kurucusu & Süper Admin',
            email: 'halil@ceylantek.com',
            phone: '0532 500 58 58',
            avatar: "",
            bio: 'CT Emlak SaaS Platform Kurucusu & Altyapı Yöneticisi',
            videoCvUrl: "",
            specialties: ['SaaS Sistem Mimarisi', 'Çoklu Ofis Yönetimi'],
            socialLinks: {
              whatsapp: '905325005858',
              instagram: 'https://instagram.com',
              linkedin: 'https://linkedin.com'
            },
            websiteStats: { views: 420, leadsCount: 18 },
            activeListingsCount: 0,
            monthlyTarget: 0,
            createdAt: '2026-01-01T08:00:00.000Z'
          };
          if (halilIdx >= 0) {
            this.data.users[halilIdx] = { ...this.data.users[halilIdx], ...halilData };
          } else {
            this.data.users.push(halilData);
          }
          changed = true;
        }

        // Ensure users have officeId, username, password, slug, specialties & bio
        if (this.data.users && Array.isArray(this.data.users)) {
          this.data.users.forEach((u, idx) => {
            if (!u.officeId) {
              u.officeId = 'OFC-01';
              changed = true;
            }
            if (!u.username) {
              const baseName = u.name.toLowerCase()
                .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                .replace(/\s+/g, '.');
              u.username = u.role === 'broker' ? (idx === 0 ? 'halilceylan' : idx === 1 ? 'ahmet' : 'selin') : baseName;
              changed = true;
            }
            if (!u.slug) {
              u.slug = (u.username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              changed = true;
            }
            if (!u.specialties) {
              u.specialties = ['Konut & Yatırım', 'Gayrimenkul Danışmanlığı'];
              changed = true;
            }
            if (!u.bio) {
              const ofc = this.getOfficeById(u.officeId);
              u.bio = `${u.name}, ${ofc?.name || 'Altın Emlak Sivas'} bünyesinde ${u.title || 'Saha Uzmanı'} olarak profesyonel gayrimenkul danışmanlığı hizmeti vermektedir.`;
              changed = true;
            }
            if (!u.password) {
              u.password = '123';
              changed = true;
            }
          });
        }

        // Ensure settings with official documents & Brevo defaults (non-destructively)
        if (!this.data.settings) {
          this.data.settings = { ...OFFICIAL_SETTINGS };
          changed = true;
        }

        // Ensure all collections exist and migrate legacy records to officeId: 'OFC-01'
        const collections = [
          'tasks', 'stories', 'tenants', 'demands', 'notifications',
          'listings', 'projects', 'deals', 'targets', 'crmLeads', 'activities', 'contracts'
        ];
        collections.forEach(col => {
          if (!this.data[col] || !Array.isArray(this.data[col])) {
            this.data[col] = [];
            changed = true;
          } else {
            this.data[col].forEach(item => {
              if (item && !item.officeId) {
                // Infer from agentId if possible, else OFC-01
                const agent = item.agentId ? this.data.users.find(u => u.id === item.agentId) : null;
                item.officeId = agent?.officeId || 'OFC-01';
                changed = true;
              }
            });
          }
        });

        // Ensure customerFolders exists for CRM
        if (!this.data.customerFolders || !Array.isArray(this.data.customerFolders)) {
          this.data.customerFolders = [
            { id: 'fld-1', name: 'Sıcak Alıcılar', officeId: 'OFC-01' },
            { id: 'fld-2', name: 'Yatırımcılar', officeId: 'OFC-01' },
            { id: 'fld-3', name: 'Arsa / Kat Karşılığı', officeId: 'OFC-01' },
            { id: 'fld-4', name: 'Acil Kiralık', officeId: 'OFC-01' }
          ];
          changed = true;
        } else {
          this.data.customerFolders.forEach(f => {
            if (!f.officeId) {
              f.officeId = 'OFC-01';
              changed = true;
            }
          });
        }

        // Sync activeListingsCount with actual active listings
        this.recalculateActiveListingsCounts();
        changed = true;

        if (changed) {
          this.save();
        }
        return;
      } catch (err) {
        console.error('Error reading database file, rebuilding...', err);
      }
    }

    // Default Fresh Setup
    const users = generateInitialUsers().map(u => ({
      ...u,
      officeId: 'OFC-01',
      isSuperAdmin: u.username === 'halil'
    }));
    this.data = {
      offices: [{ ...DEFAULT_FIRST_OFFICE }],
      users,
      projects: [],
      listings: [],
      deals: [],
      targets: [],
      crmLeads: [],
      activities: [],
      tenants: [],
      demands: [],
      notifications: [],
      tasks: [],
      contracts: [],
      stories: [],
      customerFolders: [
        { id: 'fld-1', name: 'Sıcak Alıcılar', officeId: 'OFC-01' },
        { id: 'fld-2', name: 'Yatırımcılar', officeId: 'OFC-01' },
        { id: 'fld-3', name: 'Arsa / Kat Karşılığı', officeId: 'OFC-01' },
        { id: 'fld-4', name: 'Acil Kiralık', officeId: 'OFC-01' }
      ],
      settings: { ...OFFICIAL_SETTINGS }
    };
    this.recalculateActiveListingsCounts();
    this.save();
  }

  save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Database write error:', err);
    }
  }

  // ==========================================
  // MULTI-OFFICE (ÇOKLU OFİS & SAAS LİSANS) YÖNETİMİ
  // ==========================================
  getOffices() {
    if (!this.data.offices) this.data.offices = [{ ...DEFAULT_FIRST_OFFICE }];
    return this.data.offices.map(o => {
      const officeUsers = (this.data.users || []).filter(u => !u.hidden && (u.officeId || 'OFC-01') === o.id);
      const officeListings = (this.data.listings || []).filter(l => (l.officeId || 'OFC-01') === o.id);
      const officeLeads = (this.data.crmLeads || []).filter(c => (c.officeId || 'OFC-01') === o.id);
      const officeDemands = (this.data.demands || []).filter(d => (d.officeId || 'OFC-01') === o.id);
      const officeDeals = (this.data.deals || []).filter(d => (d.officeId || 'OFC-01') === o.id);
      const officeContracts = (this.data.contracts || []).filter(c => (c.officeId || 'OFC-01') === o.id);
      return {
        ...o,
        name: o.name || o.officeName || 'Emlak Ofisi',
        officeName: o.officeName || o.name || 'Emlak Ofisi',
        companyTitle: o.companyTitle || o.legalCompanyName || 'FOX EMLAK - SEMİH GÜLEK',
        legalCompanyName: o.legalCompanyName || o.companyTitle || 'FOX EMLAK - SEMİH GÜLEK',
        ownerName: o.ownerName || o.authorizedPerson || 'Semih Gülek',
        authorizedPerson: o.authorizedPerson || o.ownerName || 'Semih Gülek',
        taxNumber: o.taxNumber || o.taxNo || '4160184689',
        taxNo: o.taxNo || o.taxNumber || '4160184689',
        mykBelgeNo: o.mykBelgeNo || o.level5No || 'YB0322/17UY0333-5/00/594',
        level5No: o.level5No || o.mykBelgeNo || 'YB0322/17UY0333-5/00/594',
        phone: o.phone || o.officePhone || '',
        officePhone: o.officePhone || o.phone || '',
        address: o.address || o.officeAddress || '',
        officeAddress: o.officeAddress || o.address || '',
        stats: {
          userCount: officeUsers.length,
          usersCount: officeUsers.length,
          brokersCount: officeUsers.filter(u => u.role === 'broker').length,
          agentsCount: officeUsers.filter(u => u.role === 'agent').length,
          listingCount: officeListings.length,
          totalListingsCount: officeListings.length,
          activeListingsCount: officeListings.filter(l => l.status === 'aktif').length,
          leadCount: officeLeads.length,
          crmLeadsCount: officeLeads.length,
          demandsCount: officeDemands.length,
          dealsCount: officeDeals.length,
          contractCount: officeContracts.length,
          contractsCount: officeContracts.length
        }
      };
    });
  }

  getOfficeById(officeId) {
    const all = this.getOffices();
    return all.find(o => o.id === officeId) || all[0] || DEFAULT_FIRST_OFFICE;
  }

  addOffice(officeData) {
    if (!this.data.offices) this.data.offices = [{ ...DEFAULT_FIRST_OFFICE }];
    const id = this.getNextId(this.data.offices, 'OFC', 2, 2);
    const officeName = (officeData.name || officeData.officeName || 'Yeni Emlak Ofisi').trim();
    const city = (officeData.city || 'Sivas').trim();
    const companyTitle = officeData.companyTitle || officeData.legalCompanyName || officeName;
    const ownerName = officeData.ownerName || officeData.authorizedPerson || officeData.brokerName || '';
    const taxNumber = officeData.taxNumber || officeData.taxNo || '';
    const mykBelgeNo = officeData.mykBelgeNo || officeData.level5No || '';
    const phone = officeData.phone || officeData.officePhone || officeData.brokerPhone || '';
    const address = officeData.address || officeData.officeAddress || `${city} Merkez`;

    const newOffice = {
      id,
      name: officeName,
      officeName,
      shortBadge: (officeData.shortBadge || city).toUpperCase(),
      brandColor: officeData.brandColor || '#f59e0b',
      city,
      district: officeData.district || 'Merkez',
      companyTitle,
      legalCompanyName: companyTitle,
      ownerName,
      authorizedPerson: ownerName,
      tcNo: officeData.tcNo || officeData.tcKimlikNo || '',
      taxOffice: officeData.taxOffice || '',
      taxNumber,
      taxNo: taxNumber,
      ttbsNo: officeData.ttbsNo || '',
      ttbsIssueDate: officeData.ttbsIssueDate || new Date().toLocaleDateString('tr-TR'),
      ttbsVerifyCode: officeData.ttbsVerifyCode || '',
      ttbsAuthority: officeData.ttbsAuthority || `T.C. ${city} Valiliği Ticaret İl Müdürlüğü`,
      mykBelgeNo,
      level5No: mykBelgeNo,
      level5IssueDate: officeData.level5IssueDate || '',
      level5ValidUntil: officeData.level5ValidUntil || '',
      level5Authority: officeData.level5Authority || 'MYK Yetkilendirilmiş Belgelendirme Kuruluşu',
      naceCode: officeData.naceCode || '683101 - Gayrimenkul Faaliyetleri İçin Aracılık Hizmeti Faaliyetleri',
      phone,
      officePhone: phone,
      email: officeData.email || officeData.officeEmail || officeData.brokerEmail || '',
      officeEmail: officeData.officeEmail || officeData.email || officeData.brokerEmail || '',
      address,
      officeAddress: address,
      brevoApiKey: officeData.brevoApiKey || '',
      brevoSenderEmail: officeData.officeEmail || '',
      brevoSenderName: officeName,
      emailAutomationActive: true,
      notifyLeadToAgent: true,
      notifyWelcomeToCustomer: true,
      notifyAuthorityExpiring: true,
      planName: officeData.planName || 'Kurumsal Pro',
      monthlyFee: Number(officeData.monthlyFee) || 5000,
      status: officeData.status || 'aktif',
      subscriptionEnd: officeData.subscriptionEnd || '2027-12-31',
      createdAt: new Date().toISOString()
    };

    this.data.offices.push(newOffice);

    // Create default CRM folders for the new office
    if (!this.data.customerFolders) this.data.customerFolders = [];
    [
      'Sıcak Alıcılar',
      'Yatırımcılar',
      'Arsa / Kat Karşılığı',
      'Acil Kiralık'
    ].forEach((fname, i) => {
      this.data.customerFolders.push({
        id: `fld-${id}-${i + 1}`,
        name: fname,
        officeId: id
      });
    });

    // Automatically create the initial Broker user for this office if brokerName is provided
    let createdBroker = null;
    if (officeData.brokerName && officeData.brokerName.trim()) {
      createdBroker = this.addUser({
        name: officeData.brokerName.trim(),
        username: officeData.brokerUsername || '',
        password: officeData.brokerPassword || '123456',
        role: 'broker',
        title: 'Broker / Ofis Yöneticisi',
        phone: officeData.brokerPhone || officeData.officePhone || '0532 000 00 00',
        email: officeData.brokerEmail || officeData.officeEmail || '',
        monthlyTarget: 2000000,
        officeId: id
      });
    }

    this.save();
    return {
      office: this.getOffices().find(o => o.id === id),
      broker: createdBroker
    };
  }

  updateOffice(officeId, updates) {
    if (!this.data.offices) return null;
    const idx = this.data.offices.findIndex(o => o.id === officeId);
    if (idx === -1) return null;

    const updatedName = updates.name || updates.officeName || this.data.offices[idx].name;
    const merged = {
      ...this.data.offices[idx],
      ...updates,
      id: officeId,
      name: updatedName,
      officeName: updatedName,
      updatedAt: new Date().toISOString()
    };
    if (updates.companyTitle !== undefined || updates.legalCompanyName !== undefined) {
      merged.companyTitle = updates.companyTitle ?? updates.legalCompanyName;
      merged.legalCompanyName = merged.companyTitle;
    }
    if (updates.ownerName !== undefined || updates.authorizedPerson !== undefined) {
      merged.ownerName = updates.ownerName ?? updates.authorizedPerson;
      merged.authorizedPerson = merged.ownerName;
    }
    if (updates.taxNumber !== undefined || updates.taxNo !== undefined) {
      merged.taxNumber = updates.taxNumber ?? updates.taxNo;
      merged.taxNo = merged.taxNumber;
    }
    if (updates.mykBelgeNo !== undefined || updates.level5No !== undefined) {
      merged.mykBelgeNo = updates.mykBelgeNo ?? updates.level5No;
      merged.level5No = merged.mykBelgeNo;
    }
    if (updates.phone !== undefined || updates.officePhone !== undefined) {
      merged.phone = updates.phone ?? updates.officePhone;
      merged.officePhone = merged.phone;
    }
    if (updates.address !== undefined || updates.officeAddress !== undefined) {
      merged.address = updates.address ?? updates.officeAddress;
      merged.officeAddress = merged.address;
    }
    this.data.offices[idx] = merged;

    if (officeId === 'OFC-01') {
      this.data.settings = {
        ...this.data.settings,
        ...this.data.offices[idx]
      };
    }

    this.save();
    return this.getOffices().find(o => o.id === officeId);
  }

  deleteOffice(officeId) {
    if (officeId === 'OFC-01') {
      throw new Error('Ana kurucu ofis (OFC-01) silinemez; dilerseniz durumunu "Askıda" yapabilirsiniz.');
    }
    const idx = (this.data.offices || []).findIndex(o => o.id === officeId);
    if (idx === -1) return false;

    this.data.offices.splice(idx, 1);
    // Remove users and data belonging to this deleted office
    this.data.users = (this.data.users || []).filter(u => u.isSuperAdmin || u.officeId !== officeId);
    const collections = [
      'tasks', 'stories', 'tenants', 'demands', 'notifications',
      'listings', 'projects', 'deals', 'targets', 'crmLeads', 'activities', 'contracts', 'customerFolders'
    ];
    collections.forEach(col => {
      if (Array.isArray(this.data[col])) {
        this.data[col] = this.data[col].filter(item => item.officeId !== officeId);
      }
    });

    this.save();
    return true;
  }

  // Users
  getUsers(officeId = null, includeHidden = false) {
    if (!this.data.users) return [];
    let list = includeHidden ? this.data.users : this.data.users.filter(u => !u.hidden);
    if (officeId && officeId !== 'ALL') {
      list = list.filter(u => (u.officeId || 'OFC-01') === officeId);
    }
    return list.map(u => this.sanitizeUser(u));
  }

  getUsersForSuperAdmin(officeId = null) {
    if (!this.data.users) return [];
    let list = this.data.users.filter(u => !u.isSuperAdmin && u.id !== 'USR-HALIL');
    if (officeId && officeId !== 'ALL') {
      list = list.filter(u => (u.officeId || 'OFC-01') === officeId);
    }
    return list.map(u => {
      const ofc = this.getOfficeById(u.officeId || 'OFC-01');
      return {
        ...u,
        officeId: u.officeId || 'OFC-01',
        officeName: ofc?.name || 'Altın Emlak Sivas'
      };
    });
  }

  getUserById(id, includePassword = false) {
    if (!this.data.users) return null;
    const u = this.data.users.find(u => u.id === id);
    if (!u) return null;
    if (includePassword) {
      const ofc = this.getOfficeById(u.officeId || 'OFC-01');
      return { ...u, officeId: u.officeId || 'OFC-01', officeName: ofc?.name || 'Altın Emlak Sivas' };
    }
    return this.sanitizeUser(u);
  }

  getUserByUsernameOrEmail(identifier) {
    if (!identifier || !this.data.users) return null;
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(u => 
      (u.username && u.username.toLowerCase() === clean) ||
      (u.email && u.email.toLowerCase() === clean) ||
      (Array.isArray(u.aliases) && u.aliases.some(a => a.toLowerCase() === clean))
    );
  }

  addUser(userData) {
    const id = this.getNextId(this.data.users, 'USR', 15, 2);
    const officeId = userData.officeId || 'OFC-01';
    const office = this.getOfficeById(officeId);
    const officeName = office?.name || 'Altın Emlak Sivas';

    const cleanUsername = userData.username 
      ? userData.username.trim().toLowerCase() 
      : (userData.name.toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
          .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/\s+/g, '.'));

    const slug = (cleanUsername || '').replace(/[^a-z0-9]/g, '');

    const newUser = {
      id,
      officeId,
      name: userData.name,
      username: cleanUsername,
      slug,
      password: userData.password || '123',
      role: userData.role || 'agent',
      title: userData.title || (userData.role === 'broker' ? 'Broker / Yönetici' : 'Gayrimenkul Danışmanı'),
      email: userData.email || `${cleanUsername}@ctemlak.com`,
      phone: userData.phone || '0532 000 00 00',
      avatar: userData.avatar || "",
      specialties: userData.specialties || [`${office?.city || 'Sivas'} Konut`, 'Gayrimenkul Danışmanlığı'],
      bio: userData.bio || `${userData.name}, ${officeName} bünyesinde kurumsal gayrimenkul danışmanlığı sunmaktadır.`,
      activeListingsCount: 0,
      monthlyTarget: Number(userData.monthlyTarget) || 300000,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();
    return this.sanitizeUser(newUser);
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.recalculateActiveListingsCounts();
    this.save();
    return this.sanitizeUser(this.data.users[idx]);
  }

  deleteUser(id) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    
    const userToDelete = this.data.users[idx];
    if (userToDelete.isSuperAdmin || userToDelete.id === 'USR-HALIL') {
      throw new Error('Süper Admin hesabı silinemez.');
    }
    if (userToDelete.role === 'broker') {
      const targetOfficeId = userToDelete.officeId || 'OFC-01';
      const brokerCount = this.data.users.filter(u => u.role === 'broker' && !u.hidden && (u.officeId || 'OFC-01') === targetOfficeId).length;
      if (brokerCount <= 1) {
        throw new Error('Bu ofiste en az bir Broker yönetici bulunmalıdır.');
      }
    }

    this.data.users.splice(idx, 1);
    this.save();
    return true;
  }

  // Listings
  getListings(officeId = null) {
    if (!this.data.listings) return [];
    if (officeId && officeId !== 'ALL') {
      return this.data.listings.filter(l => (l.officeId || 'OFC-01') === officeId);
    }
    return this.data.listings;
  }

  getListingById(id) {
    return this.data.listings.find(l => l.id === id);
  }

  addListing(listing) {
    const id = this.getNextId(this.data.listings, 'PRT', 1001);
    const agent = this.getUserById(listing.agentId);
    const officeId = listing.officeId || agent?.officeId || 'OFC-01';
    const office = this.getOfficeById(officeId);

    const newListing = {
      id,
      ...listing,
      officeId,
      city: listing.city || office?.city || 'Sivas',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.listings.unshift(newListing);
    this.recalculateActiveListingsCounts();

    // Evaluate matching demands within the SAME office!
    const activeDemands = this.getDemands ? this.getDemands({ officeId }).filter(d => d.status === 'aktif') : [];
    const matchedDemands = findDemandMatchesForListing(newListing, activeDemands);
    const settings = this.getSettings(officeId);

    // If matches exist with score >= 70, create automatic notification & optional email
    matchedDemands.filter(m => m.score >= 70).slice(0, 3).forEach(m => {
      this.addNotification({
        officeId,
        type: 'listing_matched_demand',
        title: '🔥 Yeni Portföy & Talep Eşleşmesi!',
        message: `"${newListing.title}" portföyünüz, ${m.demand.clientName} müşterisinin "${m.demand.title}" talebiyle %${m.score} uyumla eşleşti!`,
        listingId: newListing.id,
        listingTitle: newListing.title,
        demandId: m.demand.id,
        demandTitle: m.demand.title,
        clientName: m.demand.clientName,
        clientPhone: m.demand.clientPhone,
        score: m.score,
        quality: m.quality,
        reasons: m.reasons,
        agentId: m.demand.agentId,
        agentName: m.demand.agentName,
        listingAgentName: newListing.agentName
      });

      if (listing.autoNotify !== false && settings.emailAutomationActive && settings.brevoApiKey && m.demand.clientEmail) {
        emailService.sendMatchingListingToCustomer({
          apiKey: settings.brevoApiKey,
          listing: newListing,
          customerEmail: m.demand.clientEmail,
          customerName: m.demand.clientName,
          matchScore: m.score,
          agent: agent || { name: newListing.agentName, phone: newListing.agentPhone },
          settings
        }).catch(console.error);
      }
    });

    this.save();
    return { ...newListing, matchedDemands };
  }

  updateListing(id, updates) {
    const idx = this.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.listings[idx] = {
      ...this.data.listings[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.recalculateActiveListingsCounts();
    this.save();
    return this.data.listings[idx];
  }

  deleteListing(id) {
    const idx = this.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return false;
    this.data.listings.splice(idx, 1);
    this.recalculateActiveListingsCounts();
    this.save();
    return true;
  }

  // Projects (Site, Bloklu Konut, Arsa Parselasyon, Hobi Bahçesi, Villa)
  getProjects(filters = {}) {
    let list = this.data.projects || [];
    if (filters.officeId && filters.officeId !== 'ALL') {
      list = list.filter(p => (p.officeId || 'OFC-01') === filters.officeId);
    }
    if (filters.projectType && filters.projectType !== 'all') {
      list = list.filter(p => p.projectType === filters.projectType);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.developerCompany && p.developerCompany.toLowerCase().includes(q)) ||
        (p.district && p.district.toLowerCase().includes(q)) ||
        (p.neighborhood && p.neighborhood.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getProjectById(id) {
    return (this.data.projects || []).find(p => p.id === id);
  }

  addProject(project) {
    if (!this.data.projects) this.data.projects = [];
    const id = this.getNextId(this.data.projects, 'PRJ', 101);
    const agent = project.agentId ? this.getUserById(project.agentId) : null;
    const officeId = project.officeId || agent?.officeId || 'OFC-01';
    const office = this.getOfficeById(officeId);

    const newProject = {
      id,
      ...project,
      officeId,
      city: project.city || office?.city || 'Sivas',
      currency: project.currency || 'TRY',
      units: Array.isArray(project.units) ? project.units : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.projects.unshift(newProject);
    this.save();
    return newProject;
  }

  updateProject(id, updates) {
    if (!this.data.projects) this.data.projects = [];
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.projects[idx];
  }

  deleteProject(id) {
    if (!this.data.projects) return false;
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.projects.splice(idx, 1);
    this.save();
    return true;
  }

  updateProjectUnit(projectId, unitId, unitUpdates) {
    const project = this.getProjectById(projectId);
    if (!project || !project.units) return null;
    const unitIdx = project.units.findIndex(u => u.id === unitId);
    if (unitIdx === -1) return null;
    project.units[unitIdx] = {
      ...project.units[unitIdx],
      ...unitUpdates
    };
    project.updatedAt = new Date().toISOString();
    this.save();
    return project.units[unitIdx];
  }

  // Targets
  getTargets(filter = {}) {
    return (this.data.targets || []).filter(t => {
      if (filter.officeId && filter.officeId !== 'ALL' && (t.officeId || 'OFC-01') !== filter.officeId) return false;
      if (filter.agentId && t.agentId !== filter.agentId && t.agentId !== 'all') return false;
      if (filter.period && t.period !== filter.period) return false;
      if (filter.periodKey && t.periodKey !== filter.periodKey) return false;
      return true;
    });
  }

  saveTarget(target) {
    const agent = target.agentId ? this.getUserById(target.agentId) : null;
    const officeId = target.officeId || agent?.officeId || 'OFC-01';
    const idx = this.data.targets.findIndex(t => 
      t.agentId === target.agentId && 
      t.period === target.period && 
      t.periodKey === target.periodKey
    );
    if (idx !== -1) {
      this.data.targets[idx] = { ...this.data.targets[idx], ...target, officeId };
      this.save();
      return this.data.targets[idx];
    } else {
      const id = `TGT-${Date.now()}`;
      const newTarget = { id, ...target, officeId };
      this.data.targets.push(newTarget);
      this.save();
      return newTarget;
    }
  }

  // Deals / Performance
  getDeals(officeId = null) {
    if (!this.data.deals) return [];
    if (officeId && officeId !== 'ALL') {
      return this.data.deals.filter(d => (d.officeId || 'OFC-01') === officeId);
    }
    return this.data.deals;
  }

  addDeal(deal) {
    const id = `DL-${Date.now().toString().slice(-4)}`;
    const agent = deal.agentId ? this.getUserById(deal.agentId) : null;
    const officeId = deal.officeId || agent?.officeId || 'OFC-01';
    const newDeal = {
      id,
      ...deal,
      officeId,
      closingDate: deal.closingDate || new Date().toISOString()
    };
    this.data.deals.unshift(newDeal);

    if (deal.listingId) {
      const listing = this.getListingById(deal.listingId);
      if (listing) {
        listing.status = deal.dealType === 'kiralik' ? 'kiralandi' : 'satildi';
      }
    }

    this.recalculateActiveListingsCounts();
    this.save();
    return newDeal;
  }

  // CRM Leads
  getCrmLeads(officeId = null) {
    if (!this.data.crmLeads) return [];
    if (officeId && officeId !== 'ALL') {
      return this.data.crmLeads.filter(c => (c.officeId || 'OFC-01') === officeId);
    }
    return this.data.crmLeads;
  }

  getCrmLeadById(id) {
    return this.data.crmLeads.find(c => c.id === id);
  }

  addCrmLead(lead) {
    const id = `CRM-${Date.now().toString().slice(-4)}`;
    const agent = lead.agentId ? this.getUserById(lead.agentId) : null;
    const officeId = lead.officeId || agent?.officeId || 'OFC-01';
    const office = this.getOfficeById(officeId);
    const newLead = {
      id,
      ...lead,
      officeId,
      desiredCity: lead.desiredCity || office?.city || 'Sivas',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.crmLeads.unshift(newLead);
    this.save();
    return newLead;
  }

  updateCrmLead(id, updates) {
    const idx = this.data.crmLeads.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.crmLeads[idx] = {
      ...this.data.crmLeads[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.crmLeads[idx];
  }

  deleteCrmLead(id) {
    const idx = this.data.crmLeads.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.crmLeads.splice(idx, 1);
    this.save();
    return true;
  }

  // Activities
  getActivities(customerId = null, officeId = null) {
    if (!this.data.activities) this.data.activities = [];
    let list = this.data.activities;
    if (officeId && officeId !== 'ALL') {
      list = list.filter(a => (a.officeId || 'OFC-01') === officeId);
    }
    if (customerId) {
      return list.filter(a => a.customerId === customerId);
    }
    return list;
  }

  addActivity(activityData) {
    if (!this.data.activities) this.data.activities = [];
    const id = this.getNextId(this.data.activities, 'ACT', 4001);
    const agent = activityData.agentId ? this.getUserById(activityData.agentId) : null;
    const officeId = activityData.officeId || agent?.officeId || 'OFC-01';
    const newAct = {
      id,
      ...activityData,
      officeId,
      date: activityData.date || new Date().toISOString(),
      isCompleted: Boolean(activityData.isCompleted),
      createdAt: new Date().toISOString()
    };
    this.data.activities.unshift(newAct);
    this.save();
    return newAct;
  }

  // Active Tenants & Rental Contracts (Halihazırdaki Kiracılar & Kira Sözleşme Takibi)
  getTenants(filter = {}) {
    if (!this.data.tenants) this.data.tenants = [];
    return this.data.tenants.filter(t => {
      if (filter.officeId && filter.officeId !== 'ALL' && (t.officeId || 'OFC-01') !== filter.officeId) return false;
      if (filter.status && filter.status !== 'all' && t.status !== filter.status) return false;
      if (filter.agentId && filter.agentId !== 'all' && t.agentId !== filter.agentId) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const mName = t.tenantName?.toLowerCase().includes(q);
        const mPhone = t.tenantPhone?.includes(q);
        const mProp = t.propertyTitle?.toLowerCase().includes(q);
        const mOwner = t.ownerName?.toLowerCase().includes(q);
        const mDist = t.district?.toLowerCase().includes(q);
        if (!mName && !mPhone && !mProp && !mOwner && !mDist) return false;
      }
      return true;
    });
  }

  getTenantById(id) {
    if (!this.data.tenants) return null;
    return this.data.tenants.find(t => t.id === id);
  }

  addTenant(tenantData) {
    if (!this.data.tenants) this.data.tenants = [];
    const id = this.getNextId(this.data.tenants, 'TNT', 1001);
    const agent = tenantData.agentId ? this.getUserById(tenantData.agentId) : null;
    const officeId = tenantData.officeId || agent?.officeId || 'OFC-01';

    const newTenant = {
      id,
      ...tenantData,
      officeId,
      currency: tenantData.currency || 'TRY',
      rentAmount: Number(tenantData.rentAmount) || 0,
      depositAmount: Number(tenantData.depositAmount) || 0,
      paymentDay: Number(tenantData.paymentDay) || 1,
      hasEvictionCommitment: Boolean(tenantData.hasEvictionCommitment),
      increaseRate: Number(tenantData.increaseRate) || 60,
      status: tenantData.status || 'aktif',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.tenants.unshift(newTenant);
    this.save();
    return newTenant;
  }

  updateTenant(id, updates) {
    if (!this.data.tenants) return null;
    const idx = this.data.tenants.findIndex(t => t.id === id);
    if (idx === -1) return null;

    this.data.tenants[idx] = {
      ...this.data.tenants[idx],
      ...updates,
      rentAmount: updates.rentAmount !== undefined ? Number(updates.rentAmount) : this.data.tenants[idx].rentAmount,
      depositAmount: updates.depositAmount !== undefined ? Number(updates.depositAmount) : this.data.tenants[idx].depositAmount,
      paymentDay: updates.paymentDay !== undefined ? Number(updates.paymentDay) : this.data.tenants[idx].paymentDay,
      hasEvictionCommitment: updates.hasEvictionCommitment !== undefined ? Boolean(updates.hasEvictionCommitment) : this.data.tenants[idx].hasEvictionCommitment,
      increaseRate: updates.increaseRate !== undefined ? Number(updates.increaseRate) : this.data.tenants[idx].increaseRate,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.data.tenants[idx];
  }

  deleteTenant(id) {
    if (!this.data.tenants) return false;
    const idx = this.data.tenants.findIndex(t => t.id === id);
    if (idx === -1) return false;

    this.data.tenants.splice(idx, 1);
    this.save();
    return true;
  }

  // ==========================================
  // DEMANDS / TALEPLER & ÇİFT YÖNLÜ EŞLEŞTİRME
  // ==========================================
  getDemands(filter = {}) {
    if (!this.data.demands) this.data.demands = [];
    return this.data.demands.filter(d => {
      if (filter.officeId && filter.officeId !== 'ALL' && (d.officeId || 'OFC-01') !== filter.officeId) return false;
      if (filter.status && filter.status !== 'all' && d.status !== filter.status) return false;
      if (filter.type && filter.type !== 'all' && d.type !== filter.type) return false;
      if (filter.category && filter.category !== 'all' && d.category !== filter.category) return false;
      if (filter.agentId && filter.agentId !== 'all' && d.agentId !== filter.agentId) return false;
      if (filter.urgency && filter.urgency !== 'all' && d.urgency !== filter.urgency) return false;
      if (filter.minPrice && Number(filter.minPrice) > (d.maxPrice || Infinity)) return false;
      if (filter.maxPrice && Number(filter.maxPrice) < (d.minPrice || 0)) return false;
      if (filter.neighborhood && filter.neighborhood !== 'all') {
        const qN = filter.neighborhood.toLowerCase();
        const hasN = d.neighborhoods?.some(n => n.toLowerCase().includes(qN));
        if (!hasN) return false;
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const mTitle = d.title?.toLowerCase().includes(q);
        const mClient = d.clientName?.toLowerCase().includes(q);
        const mPhone = d.clientPhone?.includes(q);
        const mNotes = d.notes?.toLowerCase().includes(q);
        const mNeigh = d.neighborhoods?.some(n => n.toLowerCase().includes(q));
        if (!mTitle && !mClient && !mPhone && !mNotes && !mNeigh) return false;
      }
      return true;
    });
  }

  getDemandById(id) {
    if (!this.data.demands) return null;
    return this.data.demands.find(d => d.id === id);
  }

  addDemand(demandData) {
    if (!this.data.demands) this.data.demands = [];
    const id = this.getNextId(this.data.demands, 'TLP', 1001);
    const agent = demandData.agentId ? this.getUserById(demandData.agentId) : null;
    const officeId = demandData.officeId || agent?.officeId || 'OFC-01';
    const office = this.getOfficeById(officeId);

    const newDemand = {
      id,
      ...demandData,
      officeId,
      city: demandData.city || office?.city || 'Sivas',
      district: demandData.district || office?.district || 'Merkez',
      minPrice: Number(demandData.minPrice) || 0,
      maxPrice: Number(demandData.maxPrice) || 0,
      minM2: demandData.minM2 ? Number(demandData.minM2) : null,
      maxM2: demandData.maxM2 ? Number(demandData.maxM2) : null,
      neighborhoods: Array.isArray(demandData.neighborhoods) ? demandData.neighborhoods : (demandData.neighborhood ? [demandData.neighborhood] : []),
      roomCounts: Array.isArray(demandData.roomCounts) ? demandData.roomCounts : (demandData.roomCount ? [demandData.roomCount] : []),
      status: demandData.status || 'aktif',
      urgency: demandData.urgency || 'sicak',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.demands.unshift(newDemand);

    // Calculate matches with active listings IN THE SAME OFFICE
    const activeListings = this.getListings(officeId).filter(l => l.status === 'aktif');
    const matches = findListingMatchesForDemand(newDemand, activeListings);

    // If matches exist with score >= 70, create automatic notification
    matches.filter(m => m.score >= 70).slice(0, 3).forEach(m => {
      this.addNotification({
        officeId,
        type: 'demand_matched_listing',
        title: '🎯 Yeni Talep & İlan Eşleşmesi!',
        message: `"${newDemand.title}" talebi için "${m.listing.title}" portföyü %${m.score} uyumla eşleşti!`,
        listingId: m.listing.id,
        listingTitle: m.listing.title,
        demandId: newDemand.id,
        demandTitle: newDemand.title,
        clientName: newDemand.clientName,
        clientPhone: newDemand.clientPhone,
        score: m.score,
        quality: m.quality,
        reasons: m.reasons,
        agentId: newDemand.agentId,
        agentName: newDemand.agentName,
        listingAgentName: m.listing.agentName
      });
    });

    this.save();
    return { demand: newDemand, matches };
  }

  updateDemand(id, updates) {
    if (!this.data.demands) return null;
    const idx = this.data.demands.findIndex(d => d.id === id);
    if (idx === -1) return null;

    this.data.demands[idx] = {
      ...this.data.demands[idx],
      ...updates,
      minPrice: updates.minPrice !== undefined ? Number(updates.minPrice) : this.data.demands[idx].minPrice,
      maxPrice: updates.maxPrice !== undefined ? Number(updates.maxPrice) : this.data.demands[idx].maxPrice,
      neighborhoods: updates.neighborhoods ? (Array.isArray(updates.neighborhoods) ? updates.neighborhoods : [updates.neighborhoods]) : this.data.demands[idx].neighborhoods,
      roomCounts: updates.roomCounts ? (Array.isArray(updates.roomCounts) ? updates.roomCounts : [updates.roomCounts]) : this.data.demands[idx].roomCounts,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.data.demands[idx];
  }

  deleteDemand(id) {
    if (!this.data.demands) return false;
    const idx = this.data.demands.findIndex(d => d.id === id);
    if (idx === -1) return false;

    this.data.demands.splice(idx, 1);
    this.save();
    return true;
  }

  // Get matched listings for a specific demand
  getDemandMatches(demandId) {
    const demand = this.getDemandById(demandId);
    if (!demand) return [];
    const activeListings = this.getListings(demand.officeId || 'OFC-01').filter(l => l.status === 'aktif');
    return findListingMatchesForDemand(demand, activeListings);
  }

  // Get matched demands for a specific listing
  getListingDemandMatches(listingId) {
    const listing = this.getListingById(listingId);
    if (!listing) return [];
    const activeDemands = this.getDemands({ officeId: listing.officeId || 'OFC-01' }).filter(d => d.status === 'aktif');
    return findDemandMatchesForListing(listing, activeDemands);
  }

  // ==========================================
  // NOTIFICATIONS / BİLDİRİMLER MERKEZİ
  // ==========================================
  getNotifications(filter = {}) {
    if (!this.data.notifications) this.data.notifications = [];
    return this.data.notifications.filter(n => {
      if (filter.officeId && filter.officeId !== 'ALL' && (n.officeId || 'OFC-01') !== filter.officeId) return false;
      if (filter.agentId && filter.agentId !== 'all' && n.agentId !== filter.agentId) return false;
      if (filter.unreadOnly && n.isRead) return false;
      return true;
    });
  }

  addNotification(notifData) {
    if (!this.data.notifications) this.data.notifications = [];
    const agent = notifData.agentId ? this.getUserById(notifData.agentId) : null;
    const officeId = notifData.officeId || agent?.officeId || 'OFC-01';
    const notif = {
      id: `NOTIF-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      ...notifData,
      officeId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 100) {
      this.data.notifications = this.data.notifications.slice(0, 100);
    }
    this.save();
    return notif;
  }

  markNotificationAsRead(id) {
    if (!this.data.notifications) return false;
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(officeId = null) {
    if (!this.data.notifications) return;
    this.data.notifications.forEach(n => {
      if (!officeId || officeId === 'ALL' || (n.officeId || 'OFC-01') === officeId) {
        n.isRead = true;
      }
    });
    this.save();
  }

  deleteNotification(id) {
    if (!this.data.notifications) return false;
    const idx = this.data.notifications.findIndex(n => n.id === id);
    if (idx === -1) return false;
    this.data.notifications.splice(idx, 1);
    this.save();
    return true;
  }

  // ==========================================
  // DANIŞMAN DİJİTAL KARTVİZİT (CARRD.CO / PUBLIC)
  // ==========================================
  getUserBySlug(slug) {
    if (!this.data.users || !slug) return null;
    const clean = slug.toLowerCase().trim().replace(/^\//, '');
    return this.data.users.find(u => 
      (u.slug && u.slug.toLowerCase() === clean) ||
      (u.username && u.username.toLowerCase() === clean) ||
      (Array.isArray(u.aliases) && u.aliases.map(a => a.toLowerCase()).includes(clean))
    ) || null;
  }

  getPublicAgentData(slug) {
    const user = this.getUserBySlug(slug);
    if (!user) return null;
    const officeId = user.officeId || 'OFC-01';

    // Danışmanın vitrin portföyleri (yalnızca kendi ofisi ve kendi portföyleri)
    const agentListings = this.getListings(officeId)
      .filter(l => l.status === 'aktif' && (l.agentId === user.id || l.visibility?.digitalCard))
      .map(l => ({
        id: l.id,
        title: l.title,
        type: l.type,
        category: l.category,
        price: l.price,
        currency: l.currency || 'TRY',
        city: l.city,
        district: l.district,
        neighborhood: l.neighborhood,
        roomCount: l.roomCount,
        grossM2: l.grossM2,
        photos: l.photos,
        videoUrl: l.videoUrl,
        sanalTurUrl: l.sanalTurUrl,
        buildingAge: l.buildingAge,
        floor: l.floor
      }));

    // Kartvizit ziyaret sayısını artır
    if (!user.websiteStats) user.websiteStats = { views: 0, leadsCount: 0 };
    user.websiteStats.views = (user.websiteStats.views || 0) + 1;
    this.save();

    const s = this.getSettings(officeId);

    return {
      agent: {
        id: user.id,
        name: user.name,
        slug: user.slug || user.username,
        title: user.title,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        videoCvUrl: user.videoCvUrl,
        specialties: user.specialties || ['Konut', 'Ticari'],
        socialLinks: user.socialLinks || {},
        stats: user.websiteStats
      },
      office: {
        id: officeId,
        name: s.officeName || s.name || 'Altın Emlak Sivas',
        legalCompanyName: s.legalCompanyName || s.officeName || 'FOX EMLAK - Semih Gülek',
        address: s.officeAddress || 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas',
        phone: s.officePhone || '0532 681 91 71',
        ttbsNo: s.ttbsNo || '5800324',
        ttbsVerifyCode: s.ttbsVerifyCode || 'b51949cb-824d-4c6f-a89b-48d0d5ca9fba',
        level5No: s.level5No || 'YB0322/17UY0333-5/00/594',
        taxOffice: s.taxOffice || 'Sivas Site Vergi Dairesi Müdürlüğü',
        taxNo: s.taxNo || '4160184689',
        eidsStatus: 'EİDS Doğrulamalı'
      },
      listings: agentListings
    };
  }

  async createPublicLead(slug, leadData) {
    const agent = this.getUserBySlug(slug);
    if (!agent) throw new Error('Danışman bulunamadı.');
    const officeId = agent.officeId || 'OFC-01';

    const name = leadData.name || leadData.fullName;
    const phone = leadData.phone || leadData.telephone;

    if (!name || !phone) {
      throw new Error('İsim ve telefon zorunludur.');
    }

    const hasCommercialConsent = Boolean(leadData.commercialConsent);

    // CRM'e potansiyel müşteri olarak ekle
    const newLead = {
      id: `CRM-${Date.now()}`,
      officeId,
      name: name.trim(),
      phone: phone.trim(),
      email: leadData.email ? leadData.email.trim() : '',
      type: leadData.requestType?.includes('sat') ? 'satici' : 'alici',
      urgency: 'sicak',
      stage: 'yeni_talep',
      agentId: agent.id,
      agentName: agent.name,
      notes: `🌐 Dijital Kartvizit Formu (${leadData.requestType || 'Genel'}). Not: ${leadData.notes || leadData.message || 'Yok'}${hasCommercialConsent ? ' [KVKK: Ticari Elektronik İleti Onayı Verildi]' : ''}`,
      source: 'dijital_kartvizit',
      kvkkConsent: true,
      commercialConsent: hasCommercialConsent,
      consentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.data.crmLeads) this.data.crmLeads = [];
    this.data.crmLeads.unshift(newLead);

    // Danışmanın web istatistiklerini güncelle
    if (!agent.websiteStats) agent.websiteStats = { views: 0, leadsCount: 0 };
    agent.websiteStats.leadsCount = (agent.websiteStats.leadsCount || 0) + 1;

    // Dahili Bildirim Oluştur
    this.addNotification({
      officeId,
      type: 'web_lead',
      title: '🎉 Yeni Web Müşteri Talebi!',
      message: `${name} dijital kartvizitinizden form bıraktı. Tel: ${phone}`,
      agentId: agent.id,
      agentName: agent.name
    });

    this.save();

    // Brevo E-posta Otomasyonunu Tetikle
    const settings = this.getSettings(officeId);
    if (settings.emailAutomationActive && settings.brevoApiKey) {
      try {
        // Danışmana mail at
        if (settings.notifyLeadToAgent) {
          emailService.notifyAgentNewLead({
            apiKey: settings.brevoApiKey,
            agent,
            leadData: { ...leadData, name, phone },
            settings
          }).catch(console.error);
        }

        // Müşteriye teşekkür maili at (eğer e-posta girilmişse)
        if (settings.notifyWelcomeToCustomer && leadData.email) {
          emailService.sendCustomerWelcome({
            apiKey: settings.brevoApiKey,
            agent,
            customerEmail: leadData.email,
            customerName: name,
            settings
          }).catch(console.error);
        }
      } catch (err) {
        console.error('Brevo otomasyon hatası:', err.message);
      }
    }

    return { success: true, lead: newLead };
  }

  // ==========================================
  // OPERASYON MERKEZİ & GÖREVLER (KANBAN)
  // ==========================================
  getTasks(filter = {}) {
    if (!this.data.tasks) this.data.tasks = [];
    return this.data.tasks.filter(t => {
      if (filter.officeId && filter.officeId !== 'ALL' && (t.officeId || 'OFC-01') !== filter.officeId) return false;
      if (filter.assignedTo && filter.assignedTo !== 'all' && t.assignedTo !== filter.assignedTo) return false;
      if (filter.status && filter.status !== 'all' && t.status !== filter.status) return false;
      return true;
    });
  }

  addTask(taskData) {
    if (!this.data.tasks) this.data.tasks = [];
    const isBrokerAssigned = Boolean(taskData.isBrokerAssigned);
    const points = isBrokerAssigned ? (Number(taskData.points) || 50) : 0;
    const agent = taskData.assignedTo ? this.getUserById(taskData.assignedTo) : null;
    const officeId = taskData.officeId || agent?.officeId || 'OFC-01';

    const newTask = {
      id: `TSK-${Date.now()}`,
      officeId,
      title: taskData.title,
      description: taskData.description || '',
      assignedTo: taskData.assignedTo || 'USR-00',
      assignedToName: taskData.assignedToName || 'Atanmamış',
      assignedBy: taskData.assignedBy || '',
      assignedByName: taskData.assignedByName || '',
      isBrokerAssigned,
      points,
      priority: taskData.priority || 'orta', // yuksek, orta, dusuk
      status: taskData.status || 'todo', // todo, in_progress, done
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      category: taskData.category || 'genel',
      createdAt: new Date().toISOString()
    };
    this.data.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  updateTask(id, updates) {
    if (!this.data.tasks) return null;
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;

    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.tasks[idx];
  }

  deleteTask(id) {
    if (!this.data.tasks) return false;
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.tasks.splice(idx, 1);
    this.save();
    return true;
  }

  // ==========================================
  // E-SÖZLEŞMELER (OFFICIAL CONTRACTS ENGINE)
  // ==========================================
  getContracts(filter = {}) {
    if (!this.data.contracts) this.data.contracts = [];
    return this.data.contracts.filter(c => {
      if (filter.officeId && filter.officeId !== 'ALL' && (c.officeId || 'OFC-01') !== filter.officeId) return false;
      if (filter.agentId && filter.agentId !== 'all' && c.agentId !== filter.agentId) return false;
      if (filter.templateId && filter.templateId !== 'all' && c.templateId !== filter.templateId) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const match = (c.title && c.title.toLowerCase().includes(q)) ||
                      (c.clientName && c.clientName.toLowerCase().includes(q)) ||
                      (c.listingTitle && c.listingTitle.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }

  getContractById(id) {
    if (!this.data.contracts) return null;
    return this.data.contracts.find(c => c.id === id);
  }

  addContract(contractData) {
    if (!this.data.contracts) this.data.contracts = [];
    const agent = contractData.agentId ? this.getUserById(contractData.agentId) : null;
    const officeId = contractData.officeId || agent?.officeId || 'OFC-01';
    const newContract = {
      id: `SOZ-${Date.now()}`,
      officeId,
      templateId: contractData.templateId || 'konut_kira',
      title: contractData.title || 'Resmi Sözleşme',
      clientName: contractData.clientName || '',
      clientPhone: contractData.clientPhone || '',
      clientTc: contractData.clientTc || '',
      listingTitle: contractData.listingTitle || '',
      agentId: contractData.agentId || '',
      agentName: contractData.agentName || '',
      formData: contractData.formData || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.contracts.unshift(newContract);
    this.save();
    return newContract;
  }

  updateContract(id, updates) {
    if (!this.data.contracts) return null;
    const idx = this.data.contracts.findIndex(c => c.id === id);
    if (idx === -1) return null;

    this.data.contracts[idx] = {
      ...this.data.contracts[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.contracts[idx];
  }

  deleteContract(id) {
    if (!this.data.contracts) return false;
    const idx = this.data.contracts.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.contracts.splice(idx, 1);
    this.save();
    return true;
  }

  // ==========================================
  // DİJİTAL SAHA (STORIES / HİKAYELER)
  // ==========================================
  getStories(officeId = null) {
    if (!this.data.stories) this.data.stories = [];
    if (officeId && officeId !== 'ALL') {
      return this.data.stories.filter(s => (s.officeId || 'OFC-01') === officeId);
    }
    return this.data.stories;
  }

  addStory(storyData) {
    if (!this.data.stories) this.data.stories = [];
    const agent = storyData.agentId ? this.getUserById(storyData.agentId) : null;
    const officeId = storyData.officeId || agent?.officeId || 'OFC-01';
    const newStory = {
      id: `STR-${Date.now()}`,
      officeId,
      agentId: storyData.agentId || 'USR-00',
      agentName: storyData.agentName || 'Danışman',
      agentAvatar: storyData.agentAvatar || '',
      title: storyData.title || 'Saha Paylaşımı',
      content: storyData.content || '',
      mediaUrl: storyData.mediaUrl || '',
      type: 'story',
      likesCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.stories.unshift(newStory);
    this.save();
    return newStory;
  }

  deleteStory(id) {
    if (!this.data.stories) return false;
    const idx = this.data.stories.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.stories.splice(idx, 1);
    this.save();
    return true;
  }

  // ==========================================
  // CRM KLASÖRLERİ
  // ==========================================
  getCustomerFolders(officeId = 'OFC-01') {
    if (!this.data.customerFolders) {
      this.data.customerFolders = [
        { id: 'fld-1', name: 'Sıcak Alıcılar', officeId: 'OFC-01' },
        { id: 'fld-2', name: 'Yatırımcılar', officeId: 'OFC-01' },
        { id: 'fld-3', name: 'Arsa / Kat Karşılığı', officeId: 'OFC-01' },
        { id: 'fld-4', name: 'Acil Kiralık', officeId: 'OFC-01' }
      ];
      this.save();
    }
    if (!officeId || officeId === 'ALL') return this.data.customerFolders;
    const list = this.data.customerFolders.filter(f => (f.officeId || 'OFC-01') === officeId);
    if (list.length === 0) {
      return [
        { id: 'fld-1', name: 'Sıcak Alıcılar', officeId },
        { id: 'fld-2', name: 'Yatırımcılar', officeId },
        { id: 'fld-3', name: 'Arsa / Kat Karşılığı', officeId },
        { id: 'fld-4', name: 'Acil Kiralık', officeId }
      ];
    }
    return list;
  }

  addCustomerFolder(name, officeId = 'OFC-01') {
    if (!this.data.customerFolders) this.data.customerFolders = [];
    const newFolder = {
      id: `fld-${Date.now()}`,
      name: name.trim(),
      officeId: officeId || 'OFC-01'
    };
    this.data.customerFolders.push(newFolder);
    this.save();
    return newFolder;
  }

  // ==========================================
  // SİSTEM AYARLARI & BREVO E-POSTA (OFİS BAZLI)
  // ==========================================
  getSettings(officeId = 'OFC-01') {
    const office = this.getOfficeById(officeId || 'OFC-01');
    if (office) {
      return {
        ...OFFICIAL_SETTINGS,
        ...(this.data.settings || {}),
        ...office,
        officeName: office.name || office.officeName || 'Altın Emlak Sivas'
      };
    }
    if (!this.data.settings) {
      this.data.settings = { ...OFFICIAL_SETTINGS };
      this.save();
    }
    return this.data.settings;
  }

  updateSettings(updates, officeId = 'OFC-01') {
    const targetOfficeId = updates.officeId || officeId || 'OFC-01';
    this.updateOffice(targetOfficeId, updates);
    return this.getSettings(targetOfficeId);
  }
}

export const db = new Database();
