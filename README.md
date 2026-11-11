# Hankan Emlak Pro - Portföy, Performans & Akıllı CRM Platformu

50 kullanıcı (2 Broker/Yönetici ve 48 Saha Elemanı) için tasarlanmış, mobil öncelikli **Progressive Web App (PWA)** gayrimenkul yönetim sistemidir.

---

## 🚀 Hızlı Başlatma

1. Ana klasördeki **`EMLAK_PROGRAMI_BASLAT.bat`** veya `emlak` klasöründeki **`BASLAT.bat`** dosyasına çift tıklayın.
2. Program otomatik olarak tarayıcınızda açılır:
   - 💻 **Bilgisayar:** [http://localhost:5000](http://localhost:5000)
   - 📱 **Telefon (Mobil PWA):** Telefonunuz aynı Wi-Fi ağına bağlıyken tarayıcıdan **`http://192.168.1.7:5000`** adresine girin.
   - 📲 **Ana Ekrana Ekle:** Ekrandaki *"Uygulamayı Yükle"* butonuna dokunarak telefonunuza yerel uygulama gibi yükleyebilirsiniz.

---

## 👥 1. Kullanıcı & Yetki Mimarisi (50 Kişilik Ofis)

Sistem 50 gerçekçi danışman ve yönetici profiliyle hazır olarak gelir:
- **2 Broker (Yönetici Admin):**
  - **Ahmet Yılmaz** (Broker / Yönetici Ortak)
  - **Selin Kaya** (Broker / Yönetici Ortak)
  - *Yetkiler:* Tüm portföyleri düzenleme/silme, mülk sahibi gizli telefon ve pazarlık notlarını görme, saha elemanlarına haftalık/aylık hedef atama, ofis ciro analitiği ve haftalık yönetici raporlarını inceleme/yazdırma.
- **48 Saha Danışmanı:**
  - Can Demir, Elif Şahin, Burak Yıldız, Zeynep Çelik, Murat Öztürk ve diğerleri.
  - *Yetkiler:* Kendi portföyünü ekleme/düzenleme, ofisteki tüm portföyleri filtreleyip inceleme ve müşteriye WhatsApp'tan sunma, kendi ciro hedefini takip etme, satış kapatıp prim kaydetme, kendi CRM müşteri havuzunu yönetme.
- **Tek Tıkla Kullanıcı Değiştirme:** Ekranın sağ üstündeki profil çipinden veya *"Kullanıcı Seç & Rol Değiştir"* modalından 50 kişi arasında anında geçiş yaparak sistemi hem Broker hem de farklı danışmanların gözünden test edebilirsiniz.

---

## 🏡 2. Portföy Takibi & Harita Entegrasyonu

- **Zengin İlan Formu:** Satılık, Kiralık, Devren; Konut, Ticari, Arsa kategorileri; Oda sayısı, metrekare, kat, bina yaşı, ısıtma, aidat, tapu durumu.
- **📍 Sahada GPS Konum Alma:** Saha elemanı mülkün önündeyken formdaki *"📍 Sahada GPS Konumumu Al"* butonuna dokunduğunda telefonun koordinatlarını alıp haritaya pin bırakır.
- **📷 Mobil Kamera ile Fotoğraf Çekme:** Cihaz kamerasından doğrudan fotoğraf çekip yükleme veya galeri/URL seçimi.
- **🔒 Mülk Sahibi Gizli Bilgileri:** Mülk sahibinin adı, telefonu ve özel pazarlık notları yalnızca portföyü giren danışman ve Brokerlar tarafından görülebilir. Diğer saha elemanları bu alanı korumalı görür.
- **🗺️ İnteraktif Harita (Leaflet / OpenStreetMap):**
  - Tüm ofis ilanları harita üzerinde renkli pinlerle gösterilir (Mavi = Satılık, Yeşil = Kiralık).
  - *"🎯 Konumuma Git"* butonu ile sahadayken yakındaki ilanları anında listeler.
  - Tıklanan ilanda alttan modern mini kart açılır.
- **💬 WhatsApp Sunum Paylaşımı:** İlan kartındaki WhatsApp ikonuna tıklandığında müşteriye gönderilmek üzere hazırlanmış formatlı mülk tanıtım mesajı açılır.

---

## 🏆 3. Performans, Ciro, Hedefler & Haftalık Raporlar

- **KPI Göstergeleri:** Bu haftalık ciro, bu aylık ciro, kapanan işlem adedi, satış hacmi.
- **Kişisel İlerleme Çubuğu:** Danışmanın bu ayki gerçekleşen cirosu vs. Broker'ın koyduğu aylık hedef (Yüzde ve kalan tutar).
- **🎉 Satış Kapatma (Ciro Girişi) & Kutlama:**
  - Kapanan mülk seçilir, satış bedeli, komisyon tutarı (TL), danışman payı (%) ve ofis payı (%) girilir.
  - Kaydedildiğinde ekranda **konfeti patlaması** ile satış kutlanır ve ofis cirosuna anında yansır!
- **👑 Şampiyonlar Kürsüsü (Leaderboard):**
  - Ayın 1., 2. ve 3. danışmanı madalya ve taç rozetiyle en tepede.
  - 50 kişilik tüm ofis ciro sıralaması.
- **🎯 Broker Hedef Atama Modülü:** Brokerlar danışmanlara haftalık veya aylık ciro hedefi, kapanış adedi ve yeni portföy alma hedefi tanımlayabilir.
- **📑 Haftalık Yönetici Raporu:**
  - Haftanın şampiyonu, ofis genel özeti, danışman performans tablosu.
  - *"Yazdır / PDF"* butonu ile doğrudan resmi rapor çıktısı alınabilir.

---

## 💼 4. Akıllı CRM & Satış Hunisi (Pipeline)

- **Satış Hunisi (Kanban):**
  1. *Yeni Talep*
  2. *İletişim Kuruldu*
  3. *Yer Gösterme (Sunum)*
  4. *Teklif & Pazarlık*
  5. *Kapora Alındı*
  6. *Satış Kapatıldı (Kazanıldı)*
- **🔥 Sıcaklık Seviyeleri:** Sıcak 🔥 (Hemen alacak/nakit hazır), Ilık ⏳, Soğuk ❄️.
- **🎯 Akıllı Eşleştirme Motoru (Smart Match Engine):**
  - **Müşteriye Göre:** Müşterinin bütçesine, aradığı ilçeye ve oda sayısına uyan aktif ofis portföylerini puanlayıp (%100, %90...) listeler. Tek tıkla *"Müşteriye Sun"* butonu ile WhatsApp'tan atılabilir.
  - **Portföye Göre:** Bir portföye bakıldığında *"Bu Evi Bekleyen Alıcılar"* listesini açar.
- **📝 Yer Gösterme Formu:** Müşteriye hangi daire gezdirildi, müşterinin görüşü ve teklif notları kronolojik olarak saklanır.

---

## 📱 5. Mobil & PWA (Progressive Web App) Kurulumu

- **Android / Chrome:** Menüden *"Ana Ekrana Ekle"* veya sitedeki *"Yükle"* butonuna dokunun.
- **iOS / Safari:** Ekranın altındaki *Paylaş* butonuna dokunun -> *"Ana Ekrana Ekle"* deyin.
- Uygulama tam ekran, mobil uygulama hızında ve çevrimdışı önbellekleme desteğiyle çalışır.
