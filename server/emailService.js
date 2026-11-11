/**
 * Brevo (Sendinblue) & SMTP Email Service
 * Altın Emlak Otomasyon Motoru
 * 
 * Brevo REST API v3 üzerinden çalışır (tamamen ücretsiz: günde 300 / ayda 9.000 e-posta).
 * Harici karmaşık kütüphane gerektirmez, doğrudan standart fetch ile çalışır.
 */

export class EmailService {
  constructor() {
    this.defaultSender = {
      name: 'Altın Emlak Sivas',
      email: 'bildirim@altinemlaksivas.com'
    };
  }

  /**
   * Brevo API üzerinden e-posta gönderir
   */
  async sendWithBrevo({ apiKey, sender, to, subject, htmlContent, textContent }) {
    if (!apiKey) {
      console.warn('[EmailService] Brevo API anahtarı tanımlı değil, e-posta konsola loglandı.');
      console.log(`[Email MOCK] Kime: ${to.map(t => t.email).join(', ')} | Konu: ${subject}`);
      return { success: false, reason: 'api_key_missing', mock: true };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: sender || this.defaultSender,
          to,
          subject,
          htmlContent: htmlContent || `<p>${textContent || ''}</p>`,
          textContent: textContent || ''
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('[EmailService] Brevo API hatası:', data);
        return { success: false, error: data };
      }

      console.log('[EmailService] E-posta başarıyla gönderildi:', data.messageId);
      return { success: true, messageId: data.messageId };
    } catch (err) {
      console.error('[EmailService] Ağ/Gönderim hatası:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * 1. Kartvizitten yeni talep geldiğinde danışmana anlık bildirim
   */
  async notifyAgentNewLead({ apiKey, agent, leadData, settings }) {
    const sender = settings?.sender || this.defaultSender;
    const subject = `🎉 Yeni Müşteri Talebi: ${leadData.name} (Dijital Kartvizitinizden)`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 20px; border-radius: 8px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px; color: #f59e0b;">Altın Emlak Sivas</h2>
          <p style="margin: 5px 0 0; font-size: 13px; color: #94a3b8;">Dijital Kartvizit İletişim Otomasyonu</p>
        </div>
        
        <div style="padding: 24px 0;">
          <p style="font-size: 15px; color: #334155;">Sayın <strong>${agent.name}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Kişisel dijital kartvizit sayfanız üzerinden yeni bir potansiyel müşteri formu doldurdu. Bilgiler aşağıdadır:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 140px; color: #475569;">Müşteri Adı:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: bold;">${leadData.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Telefon:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #2563eb; font-weight: bold;">
                <a href="tel:${leadData.phone}" style="color: #2563eb; text-decoration: none;">${leadData.phone}</a>
              </td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">E-posta:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${leadData.email || 'Belirtilmedi'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">İşlem Türü / Talep:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #059669; font-weight: bold;">${leadData.requestType || 'Genel İletişim / Değerleme'}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Müşteri Notu:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #334155; font-style: italic;">"${leadData.notes || 'Mesaj bırakılmadı.'}"</td>
            </tr>
          </table>

          <div style="margin-top: 25px; text-align: center;">
            <a href="https://wa.me/${(leadData.phone || '').replace(/[^0-9]/g, '')}" 
               style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
              💬 Müşteriye WhatsApp'tan Yaz
            </a>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #94a3b8; text-align: center;">
          Bu e-posta Altın Emlak Sivas CRM Otopilotu tarafından otomatik olarak üretilmiştir.
        </div>
      </div>
    `;

    return this.sendWithBrevo({
      apiKey,
      sender,
      to: [{ email: agent.email, name: agent.name }],
      subject,
      htmlContent
    });
  }

  /**
   * 2. Form dolduran müşteriye teşekkür & güven e-postası
   */
  async sendCustomerWelcome({ apiKey, agent, customerEmail, customerName, settings }) {
    if (!customerEmail) return { success: false, reason: 'no_customer_email' };
    const sender = settings?.sender || this.defaultSender;
    const subject = `Talebiniz Alındı — Altın Emlak Sivas / ${agent.name}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="background: #0f172a; padding: 25px; border-radius: 8px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 22px; color: #f59e0b;">Altın Emlak Sivas</h2>
          <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">Güvenilir Gayrimenkul & Yatırım Çözümleri</p>
        </div>

        <div style="padding: 24px 0;">
          <p style="font-size: 16px; color: #1e293b;">Sayın <strong>${customerName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Gayrimenkul uzmanımız <strong>${agent.name}</strong> için bıraktığınız talep başarıyla tarafımıza ulaşmıştır. 
            Uzmanımız mülkünüz veya aradığınız gayrimenkul ile ilgili detayları inceleyip en kısa sürede sizinle iletişime geçecektir.
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Danışmanınızın İletişim Bilgileri:</h4>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;">👤 <strong>${agent.name}</strong> (${agent.title || 'Saha Uzmanı'})</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;">📞 Telefon: <a href="tel:${agent.phone}" style="color: #2563eb;">${agent.phone}</a></p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;">✉️ E-posta: ${agent.email}</p>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #94a3b8; text-align: center;">
          Altın Emlak Sivas • İstasyon Caddesi / Sivas • Telefon: 0346 222 00 00
        </div>
      </div>
    `;

    return this.sendWithBrevo({
      apiKey,
      sender,
      to: [{ email: customerEmail, name: customerName }],
      subject,
      htmlContent
    });
  }

  /**
   * 3. Yetki belgesi bitimine 3 gün kala danışmana alarm e-postası
   */
  async notifyAuthorityExpiring({ apiKey, agent, listing, daysLeft = 3, settings }) {
    const sender = settings?.sender || this.defaultSender;
    const subject = `⚠️ Yetki Belgesi Hatırlatması: ${listing.title} (${daysLeft} Gün Kaldı!)`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fecaca; border-radius: 12px; background: #ffffff;">
        <div style="background: #dc2626; padding: 20px; border-radius: 8px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">⚠️ Otopilot Yetki Belgesi Alarmı</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #fee2e2;">Yetki Süresi Dolmak Üzere</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 15px; color: #1e293b;">Sayın <strong>${agent.name}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Aşağıdaki portföyünüzün resmi yetki belgesi süresinin dolmasına <strong>${daysLeft} gün</strong> kalmıştır. Mülk sahibi ile iletişime geçerek yetki uzatma sözleşmesini imzalamanız önerilir.
          </p>

          <div style="background: #fef2f2; border: 1px solid #f87171; border-radius: 8px; padding: 15px; margin: 15px 0;">
            <p style="margin: 0 0 6px 0; font-weight: bold; color: #991b1b;">İlan Kodu: ${listing.id}</p>
            <p style="margin: 0 0 6px 0; color: #1e293b; font-size: 14px;"><strong>${listing.title}</strong></p>
            <p style="margin: 0; color: #475569; font-size: 13px;">Konum: ${listing.district}, ${listing.neighborhood} / Fiyat: ${listing.price?.toLocaleString('tr-TR')} ₺</p>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #94a3b8; text-align: center;">
          Altın Emlak Sivas • Otopilot Operasyon Merkezi
        </div>
      </div>
    `;

    return this.sendWithBrevo({
      apiKey,
      sender,
      to: [{ email: agent.email, name: agent.name }],
      subject,
      htmlContent
    });
  }

  /**
   * 4. Eşleşen portföy bülteni (Müşteriye otomatik portföy önerisi)
   */
  async sendMatchingListingToCustomer({ apiKey, customer, listing, agent, settings }) {
    if (!customer.email) return { success: false, reason: 'no_customer_email' };
    const sender = settings?.sender || this.defaultSender;
    const subject = `🏡 Kriterlerinize Uygun Yeni Bir Portföy Geldi: ${listing.district} / ${listing.roomCount || ''}`;

    const photoUrl = listing.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px; color: #f59e0b;">Altın Emlak Sivas</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Aradığınız Gayrimenkul Eşleşti</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 15px; color: #1e293b;">Sayın <strong>${customer.name}</strong>,</p>
          <p style="font-size: 14px; color: #475569;">
            Ofisimize portföy arayışınıza uygun yeni bir mülk girişi yapıldı:
          </p>

          <div style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin: 15px 0;">
            <img src="${photoUrl}" alt="${listing.title}" style="width: 100%; height: 240px; object-fit: cover; display: block;" />
            <div style="padding: 16px;">
              <span style="background: #2563eb; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                ${listing.type === 'satilik' ? 'Satılık' : 'Kiralık'}
              </span>
              <h3 style="margin: 10px 0 6px 0; color: #0f172a; font-size: 16px;">${listing.title}</h3>
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px;">📍 ${listing.district}, ${listing.neighborhood} • ${listing.grossM2 || ''} m² • ${listing.roomCount || ''}</p>
              <p style="margin: 0; color: #d97706; font-size: 18px; font-weight: bold;">
                ${listing.price?.toLocaleString('tr-TR')} ${listing.currency || '₺'}
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <a href="tel:${agent.phone}" style="background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block;">
              📞 Danışman ${agent.name} İle Görüş
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendWithBrevo({
      apiKey,
      sender,
      to: [{ email: customer.email, name: customer.name }],
      subject,
      htmlContent
    });
  }
}

export const emailService = new EmailService();
