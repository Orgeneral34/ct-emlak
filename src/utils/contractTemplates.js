// E-Sözleşme Şablonları & Yasal Metin Motoru
// C:\Users\halil\Desktop\hankan\emlak\uploads\sozlesme klasöründeki resmi evraklarla 100% uyumlu

// Sayıyı Türkçe yazıya çevirici (Bono ve Senetler için: 45000 -> KırkBeşBin)
export function numberToTurkishWords(num) {
  if (!num || isNaN(num)) return '';
  num = Math.floor(Math.abs(Number(num)));
  if (num === 0) return 'Sıfır';

  const birler = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
  const onlar = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
  const basamaklar = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon'];

  let words = '';
  let step = 0;

  while (num > 0) {
    let part = num % 1000;
    if (part > 0) {
      let partWords = '';
      let yuz = Math.floor(part / 100);
      let on = Math.floor((part % 100) / 10);
      let bir = part % 10;

      if (yuz > 0) {
        partWords += (yuz === 1 ? '' : birler[yuz]) + 'Yüz';
      }
      if (on > 0) {
        partWords += onlar[on];
      }
      if (bir > 0) {
        if (!(step === 1 && part === 1)) {
          partWords += birler[bir];
        }
      }

      words = partWords + basamaklar[step] + words;
    }
    num = Math.floor(num / 1000);
    step++;
  }

  return words;
}

// Word (.doc) Dosyası İndirme Sarıcısı
export function generateDocBlob(title, bodyHtml) {
  const fullHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        @page { size: 210mm 297mm; margin: 20mm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; line-height: 1.4; }
        p { margin-bottom: 8px; text-align: justify; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        td, th { border: 1px solid #000; padding: 6px; vertical-align: top; font-size: 10pt; }
        h1, h2, h3, h4 { font-family: Arial, sans-serif; text-align: center; font-weight: bold; margin-bottom: 12px; }
        .fill-text { font-weight: bold; text-decoration: underline; }
      </style>
    </head>
    <body>
      ${bodyHtml}
    </body>
    </html>
  `;
  return new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
}

// 9 RESMİ SÖZLEŞME ŞABLONU
export const CONTRACT_TEMPLATES = [
  // 1. KONUT KİRA SÖZLEŞMESİ
  {
    id: 'konut_kira',
    title: 'Konut Kira Sözleşmesi',
    category: 'Kira',
    icon: 'Home',
    description: '6098 sayılı TBK uyumlu, mal sahibi ve kiracı haklarını koruyan standart resmi konut kira sözleşmesi.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      officeName: 'Altın Emlak Sivas (FOX Emlak)',
      officeAgent: 'Semih Gülek',
      officePhone: '0532 681 91 71',
      officeAddress: 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas',
      landlordName: '',
      landlordTc: '',
      landlordPhone: '',
      landlordAddress: '',
      tenantName: '',
      tenantTc: '',
      tenantPhone: '',
      tenantEmail: '',
      tenantAddress: '',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: '',
      propertyAddress: '',
      propertyType: 'Daire (3+1)',
      furnishedStatus: 'Eşyasız',
      startDate: new Date().toISOString().split('T')[0],
      duration: '1 (Bir) Yıl',
      rentAmount: '',
      paymentDay: '1 - 5',
      bankIban: '',
      depositAmount: '',
      fixtures: 'Kombi, 3\'lü Ankastre Set, Avizeler, Su Sayacı, Çelik Kapı Anahtarı (3 Adet)'
    },
    renderHtml: (d) => `
      <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.45; font-size:11pt;">
        <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; margin-bottom:12px; font-size:14pt;">KONUT KİRA SÖZLEŞMESİ</h3>
        <p style="text-align:justify;">İşbu Konut Kira Sözleşmesi, aşağıda bilgileri bulunan kiraya veren ile kiracı arasında, 6098 sayılı Türk Borçlar Kanunu hükümlerine uygun olarak, tarafların hak ve yükümlülüklerini karşılıklı ve dengeli şekilde korumak amacıyla düzenlenmiştir.</p>
        
        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:14px; font-size:11pt; font-family:Arial,sans-serif;">1. TARAFLAR</h4>
        <div style="display:flex; justify-content:space-between; gap:20px; margin-bottom:12px;">
          <div style="width:48%;">
            <p><strong>KİRAYA VEREN (MAL SAHİBİ)</strong></p>
            <p><strong>Adı Soyadı :</strong> <span class="fill-text">${d.landlordName || '................'}</span></p>
            <p><strong>T.C. Kimlik No :</strong> <span class="fill-text">${d.landlordTc || '................'}</span></p>
            <p><strong>Telefon :</strong> <span class="fill-text">${d.landlordPhone || '................'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.landlordAddress || '................'}</span></p>
          </div>
          <div style="width:48%;">
            <p><strong>KİRACI</strong></p>
            <p><strong>Adı Soyadı :</strong> <span class="fill-text">${d.tenantName || '................'}</span></p>
            <p><strong>T.C. Kimlik No :</strong> <span class="fill-text">${d.tenantTc || '................'}</span></p>
            <p><strong>Telefon :</strong> <span class="fill-text">${d.tenantPhone || '................'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.tenantAddress || '................'}</span></p>
          </div>
        </div>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:14px; font-size:11pt; font-family:Arial,sans-serif;">2. KİRAYA KONU KONUT BİLGİLERİ</h4>
        <p><strong>İl / İlçe :</strong> <span class="fill-text">${d.city || 'Sivas'} / ${d.district || 'Merkez'}</span> &nbsp;&nbsp;&nbsp;&nbsp; <strong>Mahalle :</strong> <span class="fill-text">${d.neighborhood || '................'}</span></p>
        <p><strong>Açık Adres :</strong> <span class="fill-text">${d.propertyAddress || '................'}</span></p>
        <p><strong>Konut Türü / Eşya Durumu :</strong> <span class="fill-text">${d.propertyType || 'Daire'}</span> | <span class="fill-text">${d.furnishedStatus || 'Eşyasız'}</span></p>
        ${d.fixtures ? `<p><strong>Demirbaşlar :</strong> <span class="fill-text">${d.fixtures}</span></p>` : ''}

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:14px; font-size:11pt; font-family:Arial,sans-serif;">3. KİRA SÜRESİ VE BAŞLANGIÇ</h4>
        <p>Kira süresi <strong><span class="fill-text">${d.startDate || d.date}</span></strong> tarihinde başlayacak olup, <strong>${d.duration || '1 (Bir) yıl'}</strong> sürelidir. Süre bitiminde taraflarca feshedilmediği sürece Türk Borçlar Kanunu hükümleri uyarınca kanunen uzar.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:14px; font-size:11pt; font-family:Arial,sans-serif;">4. KİRA BEDELİ VE ÖDEME ŞEKLİ</h4>
        <p>Aylık net kira bedeli <strong><span class="fill-text">${d.rentAmount ? Number(d.rentAmount).toLocaleString('tr-TR') + ' TL' : '................ TL'}</span></strong>'dir. Kira bedeli her ayın <strong><span class="fill-text">${d.paymentDay || '1 - 5'}</span></strong> günleri arasında ${d.bankIban ? `<strong>IBAN:</strong> ${d.bankIban} nolu` : 'kiraya verenin bildirdiği'} banka hesabına ödenecektir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:14px; font-size:11pt; font-family:Arial,sans-serif;">5. DEPOZİTO (GÜVENCE BEDELİ)</h4>
        <p>Kiracı, işbu sözleşme tanziminde <strong><span class="fill-text">${d.depositAmount ? Number(d.depositAmount).toLocaleString('tr-TR') + ' TL' : '................ TL'}</span></strong> depozito bedelini kiraya verene nakden/havale ile teslim etmiştir. Depozito, konutun hasarsız, borçsuz ve tahliye taahhüdüne uygun teslimi halinde iade edilir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:14px; font-size:11pt; font-family:Arial,sans-serif;">6. GENEL HÜKÜMLER & YÜKÜMLÜLÜKLER</h4>
        <p>6.1 Kiracı, konutu aile konutu ve özenle kullanmakla yükümlüdür. Kiraya verenin yazılı onayı olmadan alt kiraya veremez ve devredemez.</p>
        <p>6.2 Konuta ait bina aidatı, elektrik, su ve doğalgaz abonelik ve kullanım masrafları fiilen kiracıya aittir.</p>
        <p>6.3 Yıllık kira artışı, TBK m. 344 uyarınca bir önceki kira yılının TÜFE 12 aylık ortalamasını geçmeyecek oranda uygulanır.</p>
        <p>6.4 İşbu sözleşmeden doğacak uyuşmazlıklarda taşınmazın bulunduğu yer Mahkemeleri ve İcra Daireleri yetkilidir.</p>

        <p style="margin-top:14px;">İşbu sözleşme <strong><span class="fill-text">${d.date}</span></strong> tarihinde 2 (iki) nüsha olarak tanzim edilerek taraflarca okunup imza altına alınmıştır.</p>

        <div style="display:flex; justify-content:space-between; margin-top:35px; page-break-inside:avoid;">
          <div style="text-align:center; width:45%;">
            <strong>KİRAYA VEREN (MAL SAHİBİ)</strong><br>
            <span>${d.landlordName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
          <div style="text-align:center; width:45%;">
            <strong>KİRACI</strong><br>
            <span>${d.tenantName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
        </div>
      </div>
    `
  },

  // 2. TAHLİYE TAAHHÜTNAMESİ
  {
    id: 'tahliye_taahhutnamesi',
    title: 'Tahliye Taahhütnamesi',
    category: 'Kira',
    icon: 'FileText',
    description: 'Kiracının kiraladığı taşınmazı belirlenen tarihte şartsız tahliye edeceğine dair resmi taahhütname.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      evictionDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      landlordName: '',
      landlordTc: '',
      landlordAddress: '',
      tenantName: '',
      tenantTc: '',
      tenantPhone: '',
      tenantAddress: '',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: '',
      propertyAddress: ''
    },
    renderHtml: (d) => `
      <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.5; font-size:11pt;">
        <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; margin-bottom:14px; font-size:14pt;">TAHLİYE TAAHHÜTNAMESİ</h3>
        <p style="text-align:justify;">Ben aşağıda bilgileri yer alan kiracı; kiralamış olduğum ve açık adresi belirtilen taşınmazı, işbu tahliye taahhütnamesinde belirlenen tarihte herhangi bir ihtara, ihbara, hakem veya mahkeme kararına gerek kalmaksızın, kayıtsız ve şartsız olarak boş, temiz ve kullanılabilir durumda mal sahibine teslim edeceğimi kabul, beyan ve taahhüt ederim.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:16px; font-size:11pt; font-family:Arial,sans-serif;">1. KİRAYA VEREN (MAL SAHİBİ) BİLGİLERİ</h4>
        <p><strong>Adı Soyadı :</strong> <span class="fill-text">${d.landlordName || '................'}</span></p>
        <p><strong>T.C. Kimlik No :</strong> <span class="fill-text">${d.landlordTc || '................'}</span></p>
        <p><strong>Adresi :</strong> <span class="fill-text">${d.landlordAddress || '................'}</span></p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:16px; font-size:11pt; font-family:Arial,sans-serif;">2. KİRACI (TAAHHÜT EDEN) BİLGİLERİ</h4>
        <p><strong>Adı Soyadı :</strong> <span class="fill-text">${d.tenantName || '................'}</span></p>
        <p><strong>T.C. Kimlik No :</strong> <span class="fill-text">${d.tenantTc || '................'}</span></p>
        <p><strong>Telefon :</strong> <span class="fill-text">${d.tenantPhone || '................'}</span></p>
        <p><strong>Tebligat Adresi :</strong> <span class="fill-text">${d.tenantAddress || '................'}</span></p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:16px; font-size:11pt; font-family:Arial,sans-serif;">3. TAHLİYE EDİLECEK TAŞINMAZIN BİLGİLERİ</h4>
        <p><strong>İl / İlçe :</strong> <span class="fill-text">${d.city || 'Sivas'} / ${d.district || 'Merkez'}</span> &nbsp;&nbsp;&nbsp;&nbsp; <strong>Mahalle :</strong> <span class="fill-text">${d.neighborhood || '................'}</span></p>
        <p><strong>Açık Adresi :</strong> <span class="fill-text">${d.propertyAddress || '................'}</span></p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:16px; font-size:11pt; font-family:Arial,sans-serif;">4. KESİN TAHLİYE TARİHİ</h4>
        <p style="font-size:12pt; background:#f8fafc; padding:10px; border:1px solid #cbd5e1; border-radius:6px;">
          Kiracı, yukarıda adresi belirtilen taşınmazı hiçbir mazeret ileri sürmeksizin <strong><span class="fill-text" style="color:#0f172a; text-decoration:underline;">${d.evictionDate || '..........'}</span></strong> tarihinde tahliye ederek, anahtarlarını kiraya verene noksansız teslim edeceğini kabul ve taahhüt eder.
        </p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:16px; font-size:11pt; font-family:Arial,sans-serif;">5. DİĞER HÜKÜMLER</h4>
        <p>5.1 İşbu tahliye taahhütnamesi kiracının serbest iradesiyle, kira ilişkisi kurulduktan ve mecur teslim alındıktan sonra düzenlenmiştir.</p>
        <p>5.2 Belirtilen tarihte tahliyenin gerçekleşmemesi durumunda; İcra ve İflas Kanunu'nun ilgili hükümleri uyarınca ilamsız tahliye takibi başlatılabileceğini, bu süreçte doğacak tüm icra, vekalet ve tazminat masraflarını ödemeyi peşinen kabul ve taahhüt ederim.</p>

        <p style="margin-top:20px;">İşbu tahliye taahhütnamesi <strong><span class="fill-text">${d.date}</span></strong> tanzim tarihinde 2 nüsha olarak tanzim edilip imza altına alınmıştır.</p>

        <div style="display:flex; justify-content:space-between; margin-top:50px; page-break-inside:avoid;">
          <div style="text-align:center; width:45%;">
            <strong>KİRAYA VEREN (MAL SAHİBİ)</strong><br>
            <span>${d.landlordName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
          <div style="text-align:center; width:45%;">
            <strong>KİRACI (TAAHHÜT EDEN)</strong><br>
            <span>${d.tenantName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
        </div>
      </div>
    `
  },

  // 3. EMLAK ALIM SATIM TELLALİYE (ARACILIK) SÖZLEŞMESİ
  {
    id: 'tellaliye',
    title: 'Alım Satım Tellaliye Sözleşmesi',
    category: 'Satış',
    icon: 'Briefcase',
    description: 'Alıcı, satıcı ve emlakçı arasında satış şartları, kapora ve hizmet bedelini güvenceye alan sözleşme.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      officeName: 'Altın Emlak Sivas (FOX Emlak)',
      officeAgent: 'Semih Gülek',
      officePhone: '0532 681 91 71',
      officeAddress: 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas',
      authNumber: '5800324',
      sellerName: '',
      sellerTc: '',
      sellerPhone: '',
      sellerAddress: '',
      buyerName: '',
      buyerTc: '',
      buyerPhone: '',
      buyerAddress: '',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: '',
      ada: '',
      parsel: '',
      propertyAddress: '',
      propertyType: 'Konut / Daire',
      salePrice: '',
      depositAmount: '',
      sellerCommissionRate: '2',
      buyerCommissionRate: '2',
      validityDuration: '3',
      exclusivity: 'Münhasır Yetkili'
    },
    renderHtml: (d) => `
      <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.45; font-size:11pt;">
        <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; margin-bottom:12px; font-size:13pt;">EMLAK ALIM SATIM TELLALİYE (ARACILIK) SÖZLEŞMESİ</h3>
        <p style="text-align:justify;">İşbu Emlak Alım Satım Tellaliye (Aracılık) Sözleşmesi, 6098 sayılı Türk Borçlar Kanunu'nun 520 ve devamı maddeleri ile Taşınmaz Ticareti Hakkında Yönetmelik hükümlerine uygun olarak aşağıdaki taraflar arasında akdedilmiştir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">MADDE 1 – TARAFLAR</h4>
        <div style="display:flex; justify-content:space-between; gap:15px; margin-bottom:10px;">
          <div style="width:32%;">
            <p><strong>SATICI</strong></p>
            <p><strong>Ad Soyad :</strong> <span class="fill-text">${d.sellerName || '................'}</span></p>
            <p><strong>TC/Vergi No :</strong> <span class="fill-text">${d.sellerTc || '................'}</span></p>
            <p><strong>Telefon :</strong> <span class="fill-text">${d.sellerPhone || '................'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.sellerAddress || '................'}</span></p>
          </div>
          <div style="width:32%;">
            <p><strong>ALICI</strong></p>
            <p><strong>Ad Soyad :</strong> <span class="fill-text">${d.buyerName || '................'}</span></p>
            <p><strong>TC/Vergi No :</strong> <span class="fill-text">${d.buyerTc || '................'}</span></p>
            <p><strong>Telefon :</strong> <span class="fill-text">${d.buyerPhone || '................'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.buyerAddress || '................'}</span></p>
          </div>
          <div style="width:32%;">
            <p><strong>EMLAK DANIŞMANI</strong></p>
            <p><strong>Ofis :</strong> <span class="fill-text">${d.officeName || 'Altın Emlak Sivas (FOX Emlak)'}</span></p>
            <p><strong>TTBS Yetki No :</strong> <span class="fill-text">${d.authNumber || '5800324'}</span></p>
            <p><strong>Yetkili :</strong> <span class="fill-text">${d.officeAgent || 'Semih Gülek'}</span></p>
            <p><strong>Telefon :</strong> <span class="fill-text">${d.officePhone || '0532 681 91 71'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.officeAddress || 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez/Sivas'}</span></p>
          </div>
        </div>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">MADDE 2 – TAŞINMAZ BİLGİLERİ VE SATIŞ BEDELİ</h4>
        <p><strong>Adres :</strong> <span class="fill-text">${d.propertyAddress || '................'}</span> (${d.neighborhood || ''} / ${d.district || 'Merkez'} / ${d.city || 'Sivas'})</p>
        <p><strong>Tapu Bilgileri :</strong> Ada: <span class="fill-text">${d.ada || '....'}</span> / Parsel: <span class="fill-text">${d.parsel || '....'}</span> &nbsp;&nbsp;&nbsp;&nbsp; <strong>Niteliği :</strong> <span class="fill-text">${d.propertyType || 'Mesken'}</span></p>
        <p><strong>Kararlaştırılan Satış Bedeli :</strong> <strong><span class="fill-text">${d.salePrice ? Number(d.salePrice).toLocaleString('tr-TR') + ' TL' : '................ TL'}</span></strong></p>
        ${d.depositAmount ? `<p><strong>Alınan Kapora / Cayma Akçesi :</strong> <strong><span class="fill-text">${Number(d.depositAmount).toLocaleString('tr-TR')} TL</span></strong> emlakçı gözetiminde teslim edilmiştir.</p>` : ''}

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">MADDE 3 – HİZMET BEDELİ (KOMİSYON)</h4>
        <p>3.1 Satıcı, satış bedelinin <strong>% ${d.sellerCommissionRate || '2'} + KDV</strong>'si tutarındaki hizmet bedelini emlak danışmanına ödemeyi kabul ve taahhüt eder.</p>
        <p>3.2 Alıcı, satış bedelinin <strong>% ${d.buyerCommissionRate || '2'} + KDV</strong>'si tutarındaki hizmet bedelini emlak danışmanına ödemeyi kabul ve taahhüt eder.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">MADDE 4 – CAYMA, CEZAİ ŞART VE KORUMA SÜRESİ</h4>
        <p>4.1 Taraflardan herhangi biri haklı bir sebep olmaksızın satıştan vazgeçerse; hem kendi komisyonunu hem de diğer tarafın ödeyeceği komisyon bedelini cezai şart olarak emlakçıya ödemekle yükümlüdür.</p>
        <p>4.2 İşbu sözleşme tarihinden itibaren <strong>6 (altı) ay</strong> süre içinde tarafların emlakçıyı devre dışı bırakarak doğrudan veya aracı vasıtasıyla tapu devri yapmaları halinde, hizmet bedeli hakkı aynen saklıdır.</p>

        <p style="margin-top:12px;">İşbu sözleşme <strong><span class="fill-text">${d.date}</span></strong> tarihinde 3 nüsha olarak tanzim edilmiştir.</p>

        <div style="display:flex; justify-content:space-between; margin-top:30px; page-break-inside:avoid;">
          <div style="text-align:center; width:30%;">
            <strong>SATICI</strong><br>
            <span>${d.sellerName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
          <div style="text-align:center; width:30%;">
            <strong>EMLAK DANIŞMANI</strong><br>
            <span>${d.officeAgent || 'Semih Gülek'}</span><br><br><br>
            <span>(İmza / Kaşe)</span>
          </div>
          <div style="text-align:center; width:30%;">
            <strong>ALICI</strong><br>
            <span>${d.buyerName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
        </div>
      </div>
    `
  },

  // 4. EMLAKÇI YER GÖSTERME SÖZLEŞMESİ
  {
    id: 'yer_gosterme',
    title: 'Yer Gösterme Sözleşmesi',
    category: 'Yetki',
    icon: 'MapPin',
    description: 'Müşteriye gezdirilen taşınmazları kayıt altına alan, 24 ay boyunca emlakçı komisyon hakkını koruyan resmi belge.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      officeName: 'Altın Emlak Sivas (FOX Emlak)',
      officeAgent: 'Semih Gülek',
      officePhone: '0532 681 91 71',
      officeAddress: 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas',
      authNumber: '5800324',
      clientName: '',
      clientTc: '',
      clientPhone: '',
      clientAddress: '',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: '',
      propertyAddress: '',
      propertyPrice: '',
      courtCity: 'Sivas'
    },
    renderHtml: (d) => `
      <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.45; font-size:11pt;">
        <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; margin-bottom:12px; font-size:13pt;">EMLAKÇI YER GÖSTERME SÖZLEŞMESİ</h3>
        <p style="text-align:justify;">İşbu Yer Gösterme Sözleşmesi, aşağıda bilgileri bulunan taraflar arasında, emlak danışmanının göstermiş olduğu taşınmazın korunması ve emlak danışmanının haklarının uzun süreli olarak güvence altına alınması amacıyla düzenlenmiştir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">1. TARAFLAR</h4>
        <div style="display:flex; justify-content:space-between; gap:20px; margin-bottom:12px;">
          <div style="width:48%;">
            <p><strong>EMLAK DANIŞMANI</strong></p>
            <p><strong>Firma Adı :</strong> <span class="fill-text">${d.officeName || 'Altın Emlak Sivas (FOX Emlak)'}</span></p>
            <p><strong>TTBS Yetki Belgesi No :</strong> <span class="fill-text">${d.authNumber || '5800324'}</span></p>
            <p><strong>Yetkili Ad Soyad :</strong> <span class="fill-text">${d.officeAgent || 'Semih Gülek'}</span></p>
            <p><strong>Telefon :</strong> <span class="fill-text">${d.officePhone || '0532 681 91 71'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.officeAddress || 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez/Sivas'}</span></p>
          </div>
          <div style="width:48%;">
            <p><strong>MÜŞTERİ (ALICI / KİRACI ADAYI)</strong></p>
            <p><strong>Adı Soyadı :</strong> <span class="fill-text">${d.clientName || '................'}</span></p>
            <p><strong>T.C. Kimlik No :</strong> <span class="fill-text">${d.clientTc || '................'}</span></p>
            <p><strong>Telefon :</strong> <span class="fill-text">${d.clientPhone || '................'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.clientAddress || '................'}</span></p>
          </div>
        </div>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">2. GÖSTERİLEN TAŞINMAZ BİLGİLERİ</h4>
        <table style="width:100%; border-collapse:collapse; margin-top:8px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #000; padding:6px; width:10%;">Sıra No</th>
              <th style="border:1px solid #000; padding:6px; width:45%;">Taşınmazın Açık Adresi / Ada-Parsel</th>
              <th style="border:1px solid #000; padding:6px; width:25%;">İstenen Satış / Kira Bedeli</th>
              <th style="border:1px solid #000; padding:6px; width:20%;">Gösterme Tarihi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #000; padding:6px; text-align:center;">1</td>
              <td style="border:1px solid #000; padding:6px;"><span class="fill-text">${d.propertyAddress || d.neighborhood || 'Belirtilen mülk'}</span> (${d.district || 'Merkez'} / ${d.city || 'Sivas'})</td>
              <td style="border:1px solid #000; padding:6px; text-align:right;"><strong><span class="fill-text">${d.propertyPrice ? Number(d.propertyPrice).toLocaleString('tr-TR') + ' TL' : '................ TL'}</span></strong></td>
              <td style="border:1px solid #000; padding:6px; text-align:center;"><span class="fill-text">${d.date}</span></td>
            </tr>
          </tbody>
        </table>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">3. KORUMA SÜRESİ VE HAKLAR (KRİTİK MADDE)</h4>
        <p>Müşteri; emlak danışmanı tarafından gösterilen taşınmazı, işbu sözleşmenin imza tarihinden itibaren <strong>24 (yirmi dört) ay</strong> boyunca; doğrudan, dolaylı, eş, çocuk, ortak veya üçüncü kişiler aracılığıyla satın alması veya kiralaması halinde, emlak danışmanının komisyon hakkının doğacağını gayrikabili rücu kabul, beyan ve taahhüt eder.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">4. HİZMET BEDELİ VE CEZAİ ŞART</h4>
        <p>Taşınmazın satın alınması halinde satış bedelinin <strong>%2 + KDV</strong>'si, kiralanması halinde <strong>bir aylık kira bedeli + KDV</strong> hizmet bedeli olarak ödenir. Emlak danışmanının devre dışı bırakılması halinde hizmet bedeli tutarı kadar cezai şart talep edilir.</p>

        <p>Uyuşmazlıklarda <strong>${d.courtCity || 'Sivas'} Mahkemeleri</strong> ve İcra Daireleri yetkilidir.</p>
        <p style="margin-top:12px;">İşbu sözleşme <strong><span class="fill-text">${d.date}</span></strong> tarihinde 2 nüsha olarak tanzim edilmiştir.</p>

        <div style="display:flex; justify-content:space-between; margin-top:40px; page-break-inside:avoid;">
          <div style="text-align:center; width:45%;">
            <strong>EMLAK DANIŞMANI</strong><br>
            <span>${d.officeAgent || 'Semih Gülek'}</span><br><br><br>
            <span>(İmza / Kaşe)</span>
          </div>
          <div style="text-align:center; width:45%;">
            <strong>MÜŞTERİ (ALICI / KİRACI ADAYI)</strong><br>
            <span>${d.clientName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
        </div>
      </div>
    `
  },

  // 5. EMLAKÇI YETKİ ALMA SÖZLEŞMESİ (SATICIDAN)
  {
    id: 'yetki_alma',
    title: 'Emlakçı Yetki Alma Sözleşmesi',
    category: 'Yetki',
    icon: 'ShieldCheck',
    description: 'Mülk sahibinden satış/kiralama için resmi aracılık yetkisi alma ve hakları koruma sözleşmesi.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      officeName: 'Altın Emlak Sivas (FOX Emlak)',
      officeAgent: 'Semih Gülek',
      officePhone: '0532 681 91 71',
      officeAddress: 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas',
      authNumber: '5800324',
      sellerName: '',
      sellerTc: '',
      sellerPhone: '',
      sellerAddress: '',
      city: 'Sivas',
      district: 'Merkez',
      neighborhood: '',
      ada: '',
      parsel: '',
      doorNo: '',
      propertyType: 'Mesken / Daire',
      propertyAddress: '',
      price: '',
      commissionRate: '2',
      durationMonths: '3',
      courtCity: 'Sivas'
    },
    renderHtml: (d) => `
      <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.45; font-size:11pt;">
        <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; margin-bottom:4px; font-size:13pt;">EMLAKÇI YETKİ ALMA SÖZLEŞMESİ</h3>
        <p style="text-align:center; font-size:10pt; color:#475569; margin-bottom:12px;">(Satıcıdan Alınacak Resmi Yetkilendirme Sözleşmesi)</p>
        <p style="text-align:justify;">İşbu sözleşme; aşağıda bilgileri yer alan Yetki Veren ile Yetkili Emlak Danışmanı arasında, Türk Borçlar Kanunu ve Taşınmaz Ticareti Hakkında Yönetmelik hükümleri çerçevesinde akdedilmiştir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">1. TARAFLAR</h4>
        <div style="display:flex; justify-content:space-between; gap:20px; margin-bottom:10px;">
          <div style="width:48%;">
            <p><strong>YETKİ VEREN (MAL SAHİBİ)</strong></p>
            <p><strong>Adı Soyadı / Ünvan :</strong> <span class="fill-text">${d.sellerName || '................'}</span></p>
            <p><strong>T.C. / Vergi No :</strong> <span class="fill-text">${d.sellerTc || '................'}</span></p>
            <p><strong>Telefon :</strong> <span class="fill-text">${d.sellerPhone || '................'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.sellerAddress || '................'}</span></p>
          </div>
          <div style="width:48%;">
            <p><strong>YETKİLİ EMLAK OFİSİ</strong></p>
            <p><strong>Ticari Ünvan :</strong> <span class="fill-text">${d.officeName || 'Altın Emlak Sivas (FOX Emlak)'}</span></p>
            <p><strong>Yetkili Kişi :</strong> <span class="fill-text">${d.officeAgent || 'Semih Gülek'}</span></p>
            <p><strong>Yetki Belgesi No :</strong> <span class="fill-text">${d.authNumber || '5800324'}</span></p>
            <p><strong>Telefon / Adres :</strong> <span class="fill-text">${d.officePhone || '0532 681 91 71'}</span> | <span class="fill-text">${d.officeAddress || 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez/Sivas'}</span></p>
          </div>
        </div>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">2. TAŞINMAZ VE YETKİ BİLGİLERİ</h4>
        <p><strong>Adres :</strong> <span class="fill-text">${d.propertyAddress || '................'}</span> (${d.neighborhood || ''} / ${d.district || 'Merkez'} / ${d.city || 'Sivas'})</p>
        <p><strong>Ada / Parsel / Bağımsız Bölüm :</strong> <span class="fill-text">${d.ada || '....'}</span> / <span class="fill-text">${d.parsel || '....'}</span> / <span class="fill-text">${d.doorNo || '....'}</span> &nbsp;&nbsp;&nbsp;&nbsp; <strong>Niteliği :</strong> <span class="fill-text">${d.propertyType || 'Mesken'}</span></p>
        <p><strong>İstenen Satış Bedeli :</strong> <strong><span class="fill-text">${d.price ? Number(d.price).toLocaleString('tr-TR') + ' TL' : '................ TL'}</span></strong></p>
        <p><strong>Yetki Süresi :</strong> İşbu sözleşme <strong><span class="fill-text">${d.date}</span></strong> tarihinde yürürlüğe girer ve <strong>${d.durationMonths || '3'} (Üç) ay</strong> süreyle geçerlidir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">3. HİZMET BEDELİ VE KORUYUCU HÜKÜMLER</h4>
        <p>3.1 Satışın gerçekleşmesi halinde Yetki Veren, satış bedeli üzerinden <strong>% ${d.commissionRate || '2'} + KDV</strong> oranında hizmet bedelini satış anında nakden ödemeyi kabul ve taahhüt eder.</p>
        <p>3.2 Yetki süresi içinde veya yetki bitiminden itibaren <strong>6 ay</strong> içinde, emlakçının bulduğu alıcıya veya yakınlarına satış yapılması halinde hizmet bedeli aynen ödenir.</p>

        <p style="margin-top:12px;">Uyuşmazlıklarda <strong>${d.courtCity || 'Sivas'} Mahkemeleri</strong> yetkilidir. Sözleşme <strong><span class="fill-text">${d.date}</span></strong> tarihinde 2 nüsha olarak tanzim edilmiştir.</p>

        <div style="display:flex; justify-content:space-between; margin-top:35px; page-break-inside:avoid;">
          <div style="text-align:center; width:45%;">
            <strong>YETKİ VEREN (MAL SAHİBİ)</strong><br>
            <span>${d.sellerName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
          <div style="text-align:center; width:45%;">
            <strong>YETKİLİ EMLAK DANIŞMANI</strong><br>
            <span>${d.officeAgent || 'Semih Gülek'}</span><br><br><br>
            <span>(İmza / Kaşe)</span>
          </div>
        </div>
      </div>
    `
  },

  // 6. BONO / SENET (SIRALI DÜZENLENEBİLİR)
  {
    id: 'bono_senet',
    title: 'Bono / Senet (Resmi Format)',
    category: 'Hukuki / Finansal',
    icon: 'CreditCard',
    description: 'Türk Ticaret Kanunu bono hükümlerine uygun, rakam ve yazıyla korumalı emre muharrer senet.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: '',
      creditorName: 'FOX EMLAK - Semih Gülek (Altın Emlak Sivas)',
      debtorName: '',
      debtorTc: '',
      debtorPhone: '',
      debtorAddress: '',
      guarantorName: '',
      guarantorTc: '',
      guarantorAddress: '',
      senetNo: '1/1',
      considerationType: 'nakden',
      courtCity: 'Sivas'
    },
    renderHtml: (d) => {
      const amountWords = d.amount ? numberToTurkishWords(d.amount) : '................................................';
      return `
        <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.5; font-size:11pt; border:2px solid #0f172a; padding:20px; border-radius:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:12px;">
            <div>
              <strong>SENET NO:</strong> <span class="fill-text">${d.senetNo || '1/1'}</span> &nbsp;&nbsp;&nbsp;&nbsp;
              <strong>DÜZENLEME TARİHİ:</strong> <span class="fill-text">${d.date}</span>
            </div>
            <div>
              <strong>VADE TARİHİ:</strong> <span class="fill-text" style="font-size:13pt; text-decoration:underline;">${d.dueDate || '..........'}</span> &nbsp;&nbsp;&nbsp;&nbsp;
              <strong>TUTAR:</strong> <span class="fill-text" style="font-size:13pt; background:#f1f5f9; padding:2px 8px; border:1px solid #000;">#${d.amount ? Number(d.amount).toLocaleString('tr-TR') : '................'} TL#</span>
            </div>
          </div>

          <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; letter-spacing:1px; margin:16px 0; font-size:14pt;">BONO (EMRE MUHARRER SENET)</h3>
          <p style="text-align:justify; font-size:12pt; line-height:1.7;">
            İşbu emre muharrer senedim mukabilinde <strong><span class="fill-text" style="text-decoration:underline;">${d.dueDate || '..........'}</span></strong> tarihinde, Sayın <strong><span class="fill-text">${d.creditorName || '................'}</span></strong> veya emrühavalesine, yukarıda yazılı yalnız <strong>#<span class="fill-text">${amountWords}</span>#</strong> Türk Lirası ödeyeceğim. Bedeli ${d.considerationType || 'nakden'} ahzolunmuştur. Vadesinde ödenmediği takdirde faiz, protesto ve vekalet ücreti dahil bilumum masrafları ödemeyi kabul ederim. İhtilaf vukuunda <strong>${d.courtCity || 'Sivas'} Mahkemeleri</strong> ve İcra Daireleri yetkilidir.
          </p>

          <div style="display:flex; justify-content:space-between; margin-top:40px; page-break-inside:avoid; border-top:1px dashed #64748b; padding-top:16px;">
            <div style="width:48%;">
              <p style="font-weight:bold; text-decoration:underline; font-size:11pt; margin-bottom:8px;">BORÇLU (KEŞİDECİ)</p>
              <p><strong>Adı Soyadı :</strong> <span class="fill-text">${d.debtorName || '................'}</span></p>
              <p><strong>T.C. Kimlik No :</strong> <span class="fill-text">${d.debtorTc || '................'}</span></p>
              <p><strong>Telefon :</strong> <span class="fill-text">${d.debtorPhone || '................'}</span></p>
              <p><strong>Adres :</strong> <span class="fill-text">${d.debtorAddress || '................'}</span></p>
              <div style="height:60px; border-bottom:1px solid #000; margin-top:20px; text-align:center;">
                <span style="font-size:9pt; color:#64748b;">(İmza)</span>
              </div>
            </div>

            <div style="width:48%;">
              <p style="font-weight:bold; text-decoration:underline; font-size:11pt; margin-bottom:8px;">MÜTESELSİL KEFİL (VARSA)</p>
              <p><strong>Adı Soyadı :</strong> <span class="fill-text">${d.guarantorName || '................'}</span></p>
              <p><strong>T.C. Kimlik No :</strong> <span class="fill-text">${d.guarantorTc || '................'}</span></p>
              <p><strong>Adres :</strong> <span class="fill-text">${d.guarantorAddress || '................'}</span></p>
              <div style="height:60px; border-bottom:1px solid #000; margin-top:45px; text-align:center;">
                <span style="font-size:9pt; color:#64748b;">(İmza)</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  },

  // 7. İŞYERİ KİRA SÖZLEŞMESİ
  {
    id: 'isyeri_kira',
    title: 'İşyeri Kira Sözleşmesi',
    category: 'Kira',
    icon: 'Store',
    description: 'Ticari mülkler, ofis, dükkan ve mağazalar için stopaj/KDV, devir ve cezai şart içeren işyeri kira sözleşmesi.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      landlordName: '',
      landlordTaxOffice: '',
      landlordTaxNo: '',
      landlordAddress: '',
      tenantName: '',
      tenantCompanyType: 'Şahıs Firması / Şirket',
      tenantTaxOffice: '',
      tenantTaxNo: '',
      tenantAddress: '',
      propertyAddress: '',
      ada: '',
      parsel: '',
      activityType: 'İşyeri (Ticari Faaliyet)',
      startDate: new Date().toISOString().split('T')[0],
      duration: '1 (Bir) Yıl',
      rentAmount: '',
      paymentDay: '1 - 5',
      depositAmount: '',
      transferOption: 'B' // A: Devir Hakkı Var, B: Devir Hakkı Yok
    },
    renderHtml: (d) => `
      <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.45; font-size:11pt;">
        <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; margin-bottom:12px; font-size:13pt;">İŞYERİ KİRA SÖZLEŞMESİ</h3>
        <p style="text-align:justify;">Bu işyeri kira sözleşmesi, 6098 sayılı Türk Borçlar Kanunu (TBK) ve ilgili ticari mevzuat hükümlerine uygun olarak düzenlenmiştir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">MADDE 1 – TARAFLAR</h4>
        <div style="display:flex; justify-content:space-between; gap:20px; margin-bottom:10px;">
          <div style="width:48%;">
            <p><strong>KİRAYA VEREN (MÜLK SAHİBİ)</strong></p>
            <p><strong>Ad Soyad / Ünvan :</strong> <span class="fill-text">${d.landlordName || '................'}</span></p>
            <p><strong>Vergi No / TCKN :</strong> <span class="fill-text">${d.landlordTaxNo || '................'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.landlordAddress || '................'}</span></p>
          </div>
          <div style="width:48%;">
            <p><strong>KİRACI (TİCARİ İŞLETME)</strong></p>
            <p><strong>Ad Soyad / Ünvan :</strong> <span class="fill-text">${d.tenantName || '................'}</span></p>
            <p><strong>Tüzel Kişilik Türü :</strong> <span class="fill-text">${d.tenantCompanyType || '................'}</span></p>
            <p><strong>Vergi No / TCKN :</strong> <span class="fill-text">${d.tenantTaxNo || '................'}</span></p>
            <p><strong>Tebligat Adresi :</strong> <span class="fill-text">${d.tenantAddress || '................'}</span></p>
          </div>
        </div>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">MADDE 2 – KİRAYA KONU TAŞINMAZ</h4>
        <p><strong>Açık Adres :</strong> <span class="fill-text">${d.propertyAddress || '................'}</span></p>
        <p><strong>Tapu Bilgileri :</strong> Ada: <span class="fill-text">${d.ada || '....'}</span> / Parsel: <span class="fill-text">${d.parsel || '....'}</span> &nbsp;&nbsp;&nbsp;&nbsp; <strong>Faaliyet Konusu :</strong> <span class="fill-text">${d.activityType || 'Ticari Faaliyet'}</span></p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">MADDE 3 – SÜRE VE KİRA BEDELİ</h4>
        <p>Sözleşme başlangıç tarihi <strong><span class="fill-text">${d.startDate || d.date}</span></strong> olup <strong>${d.duration || '1 (Bir)'}</strong> yıl sürelidir.</p>
        <p>Aylık net kira bedeli <strong><span class="fill-text">${d.rentAmount ? Number(d.rentAmount).toLocaleString('tr-TR') + ' TL + KDV / Stopaj' : '................ TL'}</span></strong>'dir. Ödemeler her ayın <strong><span class="fill-text">${d.paymentDay || '1 - 5'}</span></strong> gününe kadar banka hesabına yapılır.</p>
        <p>Depozito Güvence Bedeli: <strong><span class="fill-text">${d.depositAmount ? Number(d.depositAmount).toLocaleString('tr-TR') + ' TL' : '................ TL'}</span></strong> nakden/teminat olarak ödenmiştir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">MADDE 4 – DEVİR VE ALT KİRALAMA</h4>
        ${d.transferOption === 'A'
          ? `<p><strong>DEVİR HAKKI OLAN:</strong> Kiracı, kiraya verenin makul yazılı onayı ile işyerini aynı faaliyet alanında üçüncü bir kişiye devredebilir.</p>`
          : `<p><strong>DEVİR HAKKI OLMAYAN:</strong> Kiracı, işyerini üçüncü kişilere kısmen veya tamamen devredemez, alt kiraya veremez ve ortak alamaz.</p>`
        }

        <p style="margin-top:14px;">İşbu sözleşme <strong><span class="fill-text">${d.date}</span></strong> tarihinde 2 nüsha olarak imzalanmıştır.</p>

        <div style="display:flex; justify-content:space-between; margin-top:35px; page-break-inside:avoid;">
          <div style="text-align:center; width:45%;">
            <strong>KİRAYA VEREN</strong><br>
            <span>${d.landlordName || '................'}</span><br><br><br>
            <span>(İmza / Kaşe)</span>
          </div>
          <div style="text-align:center; width:45%;">
            <strong>KİRACI</strong><br>
            <span>${d.tenantName || '................'}</span><br><br><br>
            <span>(İmza / Kaşe)</span>
          </div>
        </div>
      </div>
    `
  },

  // 8. GAYRİMENKUL DANIŞMANI İŞ ORTAKLIĞI SÖZLEŞMESİ
  {
    id: 'is_ortakligi',
    title: 'Danışman İş Ortaklığı Sözleşmesi',
    category: 'Ofis / Ekip',
    icon: 'Users',
    description: 'Broker ile gayrimenkul danışmanı arasındaki komisyon paylaşımı, prim sistemi ve portföy mülkiyet sözleşmesi.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      brokerCompany: 'FOX EMLAK - Semih Gülek (Altın Emlak Sivas)',
      brokerManager: 'Semih Gülek',
      brokerTaxNo: '5800324 (VKN: 4160184689 - Sivas Site V.D.)',
      brokerAddress: 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas',
      agentName: '',
      agentTc: '',
      agentPhone: '',
      agentAddress: '',
      agentLevel5No: '',
      agentShare: '50',
      brokerShare: '50',
      nonCompeteMonths: '12',
      contractDuration: '1 (Bir) Yıl'
    },
    renderHtml: (d) => `
      <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.45; font-size:11pt;">
        <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; margin-bottom:12px; font-size:13pt;">GAYRİMENKUL DANIŞMANI ÇALIŞMA, KOMİSYON PAYLAŞIMI VE PRİM SÖZLEŞMESİ</h3>
        <p style="text-align:justify;">İşbu sözleşme; Taşınmaz Ticareti Hakkında Yönetmelik hükümleri uyarınca Broker ile Bağımsız Gayrimenkul Danışmanı arasında akdedilmiştir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">1. TARAFLAR</h4>
        <div style="display:flex; justify-content:space-between; gap:20px; margin-bottom:10px;">
          <div style="width:48%;">
            <p><strong>1.1 BROKER (EMLAK OFİSİ)</strong></p>
            <p><strong>Ticari Ünvan :</strong> <span class="fill-text">${d.brokerCompany || 'FOX EMLAK - Semih Gülek (Altın Emlak Sivas)'}</span></p>
            <p><strong>Yetkili Kişi :</strong> <span class="fill-text">${d.brokerManager || 'Semih Gülek'}</span></p>
            <p><strong>Yetki No :</strong> <span class="fill-text">${d.brokerTaxNo || '5800324'}</span></p>
            <p><strong>Adres :</strong> <span class="fill-text">${d.brokerAddress || 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas'}</span></p>
          </div>
          <div style="width:48%;">
            <p><strong>1.2 GAYRİMENKUL DANIŞMANI</strong></p>
            <p><strong>Adı Soyadı :</strong> <span class="fill-text">${d.agentName || '................'}</span></p>
            <p><strong>T.C. Kimlik No :</strong> <span class="fill-text">${d.agentTc || '................'}</span></p>
            <p><strong>Seviye 5 Belge No :</strong> <span class="fill-text">${d.agentLevel5No || '................'}</span></p>
            <p><strong>Telefon / Adres :</strong> <span class="fill-text">${d.agentPhone || '................'}</span> | <span class="fill-text">${d.agentAddress || '................'}</span></p>
          </div>
        </div>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">2. HUKUKİ STATÜ VE KOMİSYON PAYLAŞIMI</h4>
        <p>2.1 Danışman, ofis bünyesinde bağımsız mesleki danışman statüsünde çalışır; taraflar arasında işçi-işveren ilişkisi bulunmamaktadır.</p>
        <p>2.2 <strong>Komisyon Paylaşım Oranı :</strong> Danışman Payı: <strong>% <span class="fill-text">${d.agentShare || '50'}</span></strong> &nbsp;&nbsp;|&nbsp;&nbsp; Broker Payı: <strong>% <span class="fill-text">${d.brokerShare || '50'}</span></strong></p>
        <p>2.3 Ofise ait tüm ilan, CRM kayıtları, müşteri rehberi ve portföy verileri münhasıran Broker mülkiyetindedir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">3. GİZLİLİK VE REKABET YASAĞI</h4>
        <p>Danışman; sözleşme süresince ve ayrılma tarihinden itibaren <strong>${d.nonCompeteMonths || '12'} ay</strong> boyunca, Broker portföyündeki müşterilerle doğrudan veya başka bir ofis namına çalışamaz. Aksi halde son yılın ortalama komisyonunun 3 katı cezai şart ödenir.</p>

        <p style="margin-top:14px;">İşbu sözleşme <strong><span class="fill-text">${d.date}</span></strong> tarihinde 2 nüsha olarak imzalanmıştır.</p>

        <div style="display:flex; justify-content:space-between; margin-top:40px; page-break-inside:avoid;">
          <div style="text-align:center; width:45%;">
            <strong>BROKER (EMLAK OFİSİ)</strong><br>
            <span>${d.brokerManager || 'Semih Gülek'}</span><br><br><br>
            <span>(İmza / Kaşe)</span>
          </div>
          <div style="text-align:center; width:45%;">
            <strong>GAYRİMENKUL DANIŞMANI</strong><br>
            <span>${d.agentName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
        </div>
      </div>
    `
  },

  // 9. KVKK AYDINLATMA VE AÇIK RIZA METNİ
  {
    id: 'kvkk_aydinlatma',
    title: 'KVKK Açık Rıza ve Aydınlatma Metni',
    category: 'Hukuki / Finansal',
    icon: 'Shield',
    description: '6698 sayılı Kanun kapsamında müşterilerden veya danışmanlardan alınması zorunlu açık rıza belgesi.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      companyName: 'FOX EMLAK - Semih Gülek (Altın Emlak Sivas)',
      companyAddress: 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas',
      companyPhone: '0532 681 91 71',
      companyEmail: 'sivas@altinemlak.com.tr',
      clientName: '',
      clientTc: '',
      clientPhone: '',
      clientAddress: '',
      consentStatus: 'Kabul Ediyorum'
    },
    renderHtml: (d) => `
      <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.45; font-size:11pt;">
        <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; margin-bottom:12px; font-size:13pt;">KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK)<br>AÇIK RIZA VE AYDINLATMA METNİ</h3>
        <p style="text-align:justify;">İşbu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, aşağıda bilgileri yer alan Veri Sorumlusu tarafından hazırlanmıştır.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">1. VERİ SORUMLUSU</h4>
        <p><strong>Ticari Ünvan :</strong> <span class="fill-text">${d.companyName || 'FOX EMLAK - Semih Gülek (Altın Emlak Sivas)'}</span></p>
        <p><strong>Adres / Telefon :</strong> <span class="fill-text">${d.companyAddress || 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas'}</span> | <span class="fill-text">${d.companyPhone || '0532 681 91 71'}</span></p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">2. İLGİLİ KİŞİ (VERİ SAHİBİ)</h4>
        <p><strong>Adı Soyadı :</strong> <span class="fill-text">${d.clientName || '................'}</span></p>
        <p><strong>T.C. Kimlik No :</strong> <span class="fill-text">${d.clientTc || '................'}</span></p>
        <p><strong>Telefon / Adres :</strong> <span class="fill-text">${d.clientPhone || '................'}</span> | <span class="fill-text">${d.clientAddress || '................'}</span></p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">3. İŞLENEN VERİLER VE İŞLEME AMAÇLARI</h4>
        <p>Tarafınızca paylaşılan kimlik, iletişim, tapu, portföy ve finansal verileriniz; emlak aracılık faaliyetlerinin yürütülmesi, tapu ve belediye işlemlerinin takibi, sözleşme akdedilmesi ve yasal yükümlülüklerin ifası amacıyla işlenmektedir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:4px; margin-top:12px; font-size:11pt; font-family:Arial,sans-serif;">4. AÇIK RIZA BEYANI</h4>
        <p style="background:#f8fafc; padding:10px; border:1px solid #cbd5e1; border-radius:6px;">
          Yukarıda yer alan Aydınlatma Metni'ni okuduğumu, kişisel verilerimin belirtilen amaçlar kapsamında işlenmesine, saklanmasına ve aktarılmasına açık rıza verdiğimi beyan ederim.<br><br>
          <strong>[ X ] KABUL EDİYORUM &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] KABUL ETMİYORUM</strong>
        </p>

        <p style="margin-top:16px;">Tarih: <strong><span class="fill-text">${d.date}</span></strong></p>

        <div style="display:flex; justify-content:flex-end; margin-top:40px; page-break-inside:avoid;">
          <div style="text-align:center; width:45%;">
            <strong>İLGİLİ KİŞİ (VERİ SAHİBİ)</strong><br>
            <span>${d.clientName || '................'}</span><br><br><br>
            <span>(İmza)</span>
          </div>
        </div>
      </div>
    `
  },

  // 10. SAAS YAZILIM KULLANIM, SUNUCU BARINDIRMA VE KVKK VERİ İŞLEYEN SÖZLEŞMESİ (DPA)
  {
    id: 'saas_veri_isleyen',
    title: 'SaaS Altyapı & Veri İşleyen Sözleşmesi',
    category: 'Hukuki / Finansal',
    icon: 'Shield',
    description: 'Sunucu ve yazılım sağlayıcı ile emlak ofisi arasında, veri sorumluluğunu emlak işletmesine devreden ve tam rücu hakkı sağlayan sözleşme.',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      providerCompany: 'Ceylantek Bilgi Teknolojileri',
      providerManager: 'Halil Ceylan',
      providerTaxNo: '',
      providerAddress: 'Sivas',
      providerPhone: '',
      providerEmail: 'info@ceylantek.com',
      clientCompany: 'FOX EMLAK - Semih Gülek (Altın Emlak Sivas)',
      clientManager: 'Semih Gülek',
      clientTaxNo: '4160184689 (TC: 52063119434)',
      clientTaxOffice: 'Sivas Site V.D.',
      clientTtbsNo: '5800324',
      clientAddress: 'Eğriköprü Mah. Mahmut Özdemir Cad. No: 32E Merkez / Sivas',
      clientPhone: '0532 681 91 71',
      clientEmail: 'sivas@altinemlak.com.tr',
      serverDomain: 'altinemlak.ceylantek.com',
      monthlyFee: '5.000 TL + KDV',
      courtCity: 'Sivas'
    },
    renderHtml: (d) => `
      <div class="contract-doc" style="font-family:'Times New Roman',Times,serif; color:#000; line-height:1.45; font-size:10pt;">
        <h3 style="text-align:center; font-family:Arial,sans-serif; font-weight:bold; margin-bottom:4px; font-size:12.5pt;">YAZILIM KULLANIM (SaaS), SUNUCU BARINDIRMA<br>VE KVKK VERİ İŞLEYEN SÖZLEŞMESİ</h3>
        <p style="text-align:center; font-size:9pt; color:#475569; margin-bottom:12px;">(6698 Sayılı KVKK ve 5651 Sayılı Kanun Uyarınca Sorumluluk ve Rücu Hükümleri)</p>
        
        <p style="text-align:justify;">İşbu Sözleşme; aşağıda bilgileri yer alan <strong>Hizmet Sağlayıcı</strong> ile <strong>Emlak İşletmesi (Müşteri)</strong> arasında, bulut tabanlı gayrimenkul yönetim yazılımı, sunucu barındırma altyapısının temini ve sisteme işlenen kişisel verilerin yasal sorumluluğunun belirlenmesi amacıyla akdedilmiştir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:3px; margin-top:12px; font-size:10.5pt; font-family:Arial,sans-serif;">MADDE 1 – TARAFLAR VE HUKUKİ SIFATLAR</h4>
        <div style="display:flex; justify-content:space-between; gap:20px; margin-bottom:10px;">
          <div style="width:48%;">
            <p><strong>1.1 HİZMET SAĞLAYICI (VERİ İŞLEYEN / YER SAĞLAYICI)</strong></p>
            <p><strong>Ticari Ünvan :</strong> <span class="fill-text">${d.providerCompany || 'Ceylantek Bilgi Teknolojileri'}</span></p>
            <p><strong>Yetkili Temsilci :</strong> <span class="fill-text">${d.providerManager || 'Halil Ceylan'}</span></p>
            <p><strong>Vergi / TC No :</strong> <span class="fill-text">${d.providerTaxNo || '................'}</span></p>
            <p><strong>Tebligat Adresi :</strong> <span class="fill-text">${d.providerAddress || 'Sivas'}</span></p>
            <p><strong>İletişim :</strong> <span class="fill-text">${d.providerPhone || '................'}</span> | <span class="fill-text">${d.providerEmail || 'info@ceylantek.com'}</span></p>
          </div>
          <div style="width:48%;">
            <p><strong>1.2 EMLAK İŞLETMESİ (MÜNHASIR VERİ SORUMLUSU / İÇERİK SAĞLAYICI)</strong></p>
            <p><strong>Ticari Ünvan :</strong> <span class="fill-text">${d.clientCompany || '................'}</span></p>
            <p><strong>Yetkili / Broker :</strong> <span class="fill-text">${d.clientManager || '................'}</span></p>
            <p><strong>TTBS Yetki Belgesi No :</strong> <span class="fill-text">${d.clientTtbsNo || '................'}</span></p>
            <p><strong>Vergi Dairesi / No :</strong> <span class="fill-text">${d.clientTaxOffice || '..........'} / ${d.clientTaxNo || '..........'}</span></p>
            <p><strong>Tebligat Adresi :</strong> <span class="fill-text">${d.clientAddress || '................'}</span></p>
            <p><strong>İletişim :</strong> <span class="fill-text">${d.clientPhone || '................'}</span> | <span class="fill-text">${d.clientEmail || '................'}</span></p>
          </div>
        </div>

        <h4 style="border-bottom:1px solid #000; padding-bottom:3px; margin-top:10px; font-size:10.5pt; font-family:Arial,sans-serif;">MADDE 2 – HUKUKİ STATÜ, VERİ SORUMLULUĞU VE KAPSAM</h4>
        <p>2.1 <strong>Veri Sorumlusu Statüsü:</strong> 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) m. 3/1-ı uyarınca; sisteme kaydedilen tüm alıcı, satıcı, mülk sahibi, kiracı ve personele ait kişisel verilerin işleme amaçlarını ve vasıtalarını belirleyen tek ve <strong>MÜNHASIR VERİ SORUMLUSU</strong> Emlak İşletmesi'dir.</p>
        <p>2.2 <strong>Veri İşleyen ve Yer Sağlayıcı Statüsü:</strong> Hizmet Sağlayıcı; 6698 sayılı KVKK m. 3/1-ğ uyarınca yalnızca teknik sunucu ve yazılım ortamı sağlayan <strong>"Veri İşleyen"</strong> ve 5651 sayılı Kanun m. 5 uyarınca <strong>"Yer Sağlayıcı"</strong> konumundadır. Hizmet Sağlayıcı'nın sisteme girilen verileri denetleme, içeriğini araştırma veya hukuka aykırılık kontrolü yapma yükümlülüğü kesinlikle yoktur.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:3px; margin-top:10px; font-size:10.5pt; font-family:Arial,sans-serif;">MADDE 3 – EMLAK İŞLETMESİNİN BEYAN VE TAAHHÜTLERİ</h4>
        <p>3.1 Emlak İşletmesi; sisteme kaydettiği tüm telefon, kimlik, tapu, fiyat ve ada-parsel verilerini ilgili kişilere KVKK m. 10 uyarınca aydınlatma yaparak ve gereken hallerde açık rızalarını alarak sisteme işlediğini kabul, beyan ve taahhüt eder.</p>
        <p>3.2 Emlak İşletmesi; sistem üzerinden yayımlanan tüm ilanların Taşınmaz Ticareti Hakkında Yönetmelik ve EİDS (Elektronik İlan Doğrulama Sistemi) kurallarına uygun olduğunu, mülk sahiplerinden yasal yetki alındığını, sahte veya yanıltıcı ilan verilmediğini garanti eder.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:3px; margin-top:10px; font-size:10.5pt; font-family:Arial,sans-serif;">MADDE 4 – SORUMSUZLUK, TAM RÜCU VE TAZMİNAT ŞARTI (INDEMNIFICATION)</h4>
        <p>4.1 Emlak İşletmesi'nin sisteme girdiği veriler, ilanlar, KVKK ihlalleri, telif hakkı ihlalleri veya mevzuata aykırı herhangi bir eylemi sebebiyle; Kişisel Verileri Koruma Kurulu (KVKK), Ticaret Bakanlığı, Vergi Daireleri, Tüketici Hakem Heyetleri veya üçüncü kişiler tarafından <strong>Hizmet Sağlayıcı'ya (veya yetkililerine) yöneltilebilecek her türlü idari para cezası, adli ceza, tazminat ve rücu taleplerinin tek ve asıl muhatabı Emlak İşletmesi'dir</strong>.</p>
        <p>4.2 Hizmet Sağlayıcı aleyhine herhangi bir ceza veya tazminata hükmedilmesi halinde; Emlak İşletmesi doğacak tüm ana para, faiz, yargılama gideri ve avukatlık vekalet ücretlerini ilk yazılı bildirim üzerine hiçbir defi ve itiraz ileri sürmeksizin <strong>Hizmet Sağlayıcı'ya derhal, nakden ve defaten ödemeyi gayrikabili rücu kabul, beyan ve taahhüt eder</strong>.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:3px; margin-top:10px; font-size:10.5pt; font-family:Arial,sans-serif;">MADDE 5 – TEKNİK GÜVENLİK VE ERİŞİM YETKİSİ</h4>
        <p>Hizmet Sağlayıcı sunucuda makul teknik güvenlik (SSL şifreleme, güvenlik duvarı, izolasyon) tedbirlerini almakla yükümlüdür. Emlak İşletmesi çalışanlarının kullanıcı adı/şifrelerini çaldırması, yerel bilgisayarlarına zararlı yazılım bulaşması veya içeriden müşteri verisi sızdırması durumunda Hizmet Sağlayıcı'nın hiçbir hukuki ve cezai sorumluluğu bulunmamaktadır.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:3px; margin-top:10px; font-size:10.5pt; font-family:Arial,sans-serif;">MADDE 6 – HİZMET BEDELİ, SÜRE VE FESİH</h4>
        <p>6.1 İşbu sözleşme imza tarihinden itibaren 1 (bir) yıl süreyle geçerli olup, taraflarca 30 gün önceden yazılı fesih bildirilmedikçe aynı şartlarla yıllık olarak yenilenir.</p>
        <p>6.2 Yazılım ve sunucu altyapı kullanım bedeli aylık <strong><span class="fill-text">${d.monthlyFee || '5.000 TL + KDV'}</span></strong> olup, her ayın ilk 5 iş günü içinde Hizmet Sağlayıcı banka hesabına ödenir.</p>

        <h4 style="border-bottom:1px solid #000; padding-bottom:3px; margin-top:10px; font-size:10.5pt; font-family:Arial,sans-serif;">MADDE 7 – YETKİLİ MAHKEME</h4>
        <p>İşbu sözleşmeden doğacak her türlü uyuşmazlığın çözümünde <strong>${d.courtCity || 'Sivas'} Mahkemeleri ve İcra Daireleri</strong> münhasıran yetkilidir.</p>

        <p style="margin-top:14px;">İşbu 7 maddeden ibaret sözleşme <strong><span class="fill-text">${d.date}</span></strong> tarihinde 2 (iki) nüsha olarak tanzim edilip taraflarca okunarak imza altına alınmıştır.</p>

        <div style="display:flex; justify-content:space-between; margin-top:35px; page-break-inside:avoid;">
          <div style="text-align:center; width:45%;">
            <strong>HİZMET SAĞLAYICI (VERİ İŞLEYEN)</strong><br>
            <span>${d.providerCompany || 'Ceylantek Bilgi Teknolojileri'}</span><br>
            <span>Yetkili: ${d.providerManager || 'Halil Ceylan'}</span><br><br><br>
            <span>(İmza / Kaşe)</span>
          </div>
          <div style="text-align:center; width:45%;">
            <strong>EMLAK İŞLETMESİ (VERİ SORUMLUSU)</strong><br>
            <span>${d.clientCompany || '................'}</span><br>
            <span>Yetkili: ${d.clientManager || '................'}</span><br><br><br>
            <span>(İmza / Kaşe)</span>
          </div>
        </div>
      </div>
    `
  }
];
