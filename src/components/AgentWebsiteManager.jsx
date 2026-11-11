import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import UserAvatar from './UserAvatar';
import { 
  Globe, Eye, Users, Building, ExternalLink, 
  Settings, Video, Star, MessageSquare, ClipboardCheck, 
  Check, Copy, Share2, Sparkles, Mail, Send, Camera, Trash2, Upload
} from 'lucide-react';

export default function AgentWebsiteManager({ onOpenPublicCard }) {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('traffic');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const avatarInputRef = useRef(null);

  // Agent Website Profile State
  const [profile, setProfile] = useState({
    slug: currentUser?.slug || currentUser?.username || 'kartvizit',
    title: currentUser?.title || 'Gayrimenkul & Yatırım Danışmanı',
    bio: currentUser?.bio || '',
    videoCvUrl: currentUser?.videoCvUrl || '',
    specialties: (currentUser?.specialties || ['Lüks Konut', 'Ticari Gayrimenkul']).join(', '),
    views: currentUser?.websiteStats?.views || 0,
    leadsCount: currentUser?.websiteStats?.leadsCount || 0,
    brevoApiKey: ''
  });

  const [saving, setSaving] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState('');

  // Load current settings from backend
  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(s => {
      if (s) {
        setProfile(prev => ({
          ...prev,
          brevoApiKey: s.brevoApiKey || '',
          senderEmail: s.brevoSenderEmail || ''
        }));
      }
    }).catch(() => {});
  }, []);

  const cardUrl = `${window.location.origin}/${profile.slug || currentUser?.slug || 'kartvizit'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Görsel boyutu en fazla 10MB olabilir.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.uploadPhoto(formData);
      if (res && res.url) {
        setAvatarUrl(res.url);
        await api.updateUser(currentUser.id, { avatar: res.url });
        if (updateCurrentUserProfile) {
          updateCurrentUserProfile({ avatar: res.url });
        }
      }
    } catch (err) {
      alert('Fotoğraf yüklenirken hata oluştu: ' + err.message);
    } finally {
      setUploadingPhoto(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Profil fotoğrafınızı kaldırmak istediğinize emin misiniz?')) return;
    try {
      setAvatarUrl('');
      await api.updateUser(currentUser.id, { avatar: '' });
      if (updateCurrentUserProfile) {
        updateCurrentUserProfile({ avatar: '' });
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save settings and user info
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brevoApiKey: profile.brevoApiKey,
          brevoSenderEmail: profile.senderEmail
        })
      });

      if (currentUser?.id) {
        await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: profile.title,
            bio: profile.bio,
            videoCvUrl: profile.videoCvUrl,
            specialties: profile.specialties.split(',').map(s => s.trim())
          })
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Kaydedilemedi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    const testEmail = prompt('Test e-postasının gönderileceği adresi giriniz:', currentUser?.email || 'test@gmail.com');
    if (!testEmail) return;

    setTestEmailStatus('Gönderiliyor...');
    try {
      const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testRecipient: testEmail,
          apiKey: profile.brevoApiKey
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailStatus('✓ Test e-postası başarıyla gönderildi!');
      } else {
        setTestEmailStatus(`Hata: ${JSON.stringify(data.error || data.reason)}`);
      }
    } catch (err) {
      setTestEmailStatus('Hata: ' + err.message);
    }
  };

  return (
    <div className="pb-24 pt-3 max-w-6xl mx-auto px-3 sm:px-4 space-y-5">
      
      {/* Top Banner (Matching Screenshot 2) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>🌐 Kişisel Web Sitem & Dijital Kartvizit</span>
          </h1>
          <p className="text-xs text-rose-600 font-bold mt-1">
            Sizi portallardan ayıran, tamamen size özel "Emlak Uzmanı" dijital ofisiniz.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border">
              {cardUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              {copied ? 'Kopyalandı!' : 'Kopyala'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/${profile.slug || currentUser?.slug || 'kartvizit'}`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Yayına Al / Canlı Önizle</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Left Sub-Nav + Right Content (Matching Screenshot 2) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        
        {/* Left Sub-Navigation Menu */}
        <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm space-y-1">
          {[
            { id: 'traffic', label: '📈 Trafik & Rapor' },
            { id: 'identity', label: '⚙️ Kimlik & Tema' },
            { id: 'videocv', label: '🎥 Video CV & Sunum' },
            { id: 'showcase', label: '🏢 Vitrin İlanlarım' },
            { id: 'specialties', label: '📍 Bölge Uzmanlığı' },
            { id: 'reviews', label: '⭐ Yorumlar & Başarı' },
            { id: 'leads', label: '📩 Gelen Talepler' },
            { id: 'email_auto', label: '📬 Brevo E-posta Otomasyonu' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl font-bold text-xs transition flex items-center justify-between ${
                activeSubTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3 space-y-4">
          
          {/* SubTab 1: Trafik & Rapor (KPI Cards matching Screenshot 2) */}
          {activeSubTab === 'traffic' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>Web Sitesi Performansı</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950 text-white shadow-sm space-y-1">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOPLAM GÖRÜNTÜLENME</p>
                    <p className="text-3xl font-black text-amber-400">{profile.views}</p>
                    <p className="text-[10px] text-slate-400">Tekil ziyaretçi sayısı</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                    <p className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">WEB'DEN GELEN MÜŞTERİ</p>
                    <p className="text-3xl font-black text-blue-900">{profile.leadsCount}</p>
                    <p className="text-[10px] text-blue-600 font-semibold">Doğrudan form bırakanlar</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                    <p className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">AKTİF VİTRİN İLANI</p>
                    <p className="text-3xl font-black text-amber-900">{currentUser?.activeListingsCount ?? 0}</p>
                    <p className="text-[10px] text-amber-700 font-semibold">Kartvizitte yayında olanlar</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase">Kartvizit Paylaşım Kısayolları</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Bağlantıyı Kopyala</span>
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Altın Emlak Sivas danışman kartvizitimi inceleyin: ${cardUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                  >
                    <span>WhatsApp Durumunda Paylaş</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: Kimlik & Biyografi */}
          {activeSubTab === 'identity' && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-slate-900">Danışman Kimlik & Biyografi Bilgileri</h3>

              {/* Profil Fotoğrafı Yükleme Alanı */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <UserAvatar
                      user={{ ...currentUser, avatar: avatarUrl || currentUser?.avatar }}
                      className="w-16 h-16 rounded-2xl"
                      textSize="text-lg"
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Profil Fotoğrafı</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dijital kartvizitinizde ve ofis sisteminde görünecek kurumsal vesikalık/portre fotoğrafınız.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleUploadAvatar}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPhoto ? 'Yükleniyor...' : 'Fotoğraf Yükle'}</span>
                  </button>
                  {(avatarUrl || currentUser?.avatar) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl text-xs transition"
                      title="Fotoğrafı Kaldır (İsim Baş Harflerine Dön)"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kartvizit Linki (Slug)</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-mono">
                      altinemlak.../
                    </span>
                    <input
                      type="text"
                      value={profile.slug}
                      onChange={(e) => setProfile({ ...profile, slug: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-r-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Uzmanlık Unvanı</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Biyografi & Müşteri Karşılama Metni</label>
                  <textarea
                    rows="3"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl font-medium resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 shadow"
                  >
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SubTab 3: Video CV & Tanıtım */}
          {activeSubTab === 'videocv' && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-slate-900">Video CV & Müşteri Tanıtım Turu</h3>
              <p className="text-xs text-slate-500">
                YouTube Shorts veya Instagram Reels videonuzun bağlantısını buraya ekleyin. Kartvizitinizde oynatıcı olarak görünecektir.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Video Bağlantısı</label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/shorts/... veya https://youtu.be/..."
                    value={profile.videoCvUrl}
                    onChange={(e) => setProfile({ ...profile, videoCvUrl: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
                  >
                    Videoyu Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 4: Brevo E-posta Otomasyonu */}
          {activeSubTab === 'email_auto' && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-sm text-slate-900">Brevo E-posta Otomasyon Ayarları (%100 Ücretsiz)</h3>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-bold">💡 Ücretsiz Brevo Entegrasyonu:</p>
                <p>
                  Brevo (Sendinblue) üzerinden günde 300 adet e-postayı tamamen ücretsiz gönderebilirsiniz. 
                  Ücretsiz açacağınız Brevo hesabınızdan <strong>SMTP & API</strong> menüsünden aldığınız API anahtarını buraya yapıştırmanız yeterlidir.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Brevo API Anahtarı (xkeysib-...)</label>
                  <input
                    type="password"
                    placeholder="xkeysib-..."
                    value={profile.brevoApiKey}
                    onChange={(e) => setProfile({ ...profile, brevoApiKey: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gönderici E-posta Adresi</label>
                  <input
                    type="email"
                    placeholder="info@altinemlak.com"
                    value={profile.senderEmail || ''}
                    onChange={(e) => setProfile({ ...profile, senderEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm"
                  >
                    🧪 Test E-postası Gönder
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow"
                  >
                    Ayarları Kaydet
                  </button>
                </div>

                {testEmailStatus && (
                  <p className="text-xs font-bold text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-xl border">
                    {testEmailStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SubTab 5: Bölge Uzmanlığı */}
          {activeSubTab === 'specialties' && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-black text-sm text-slate-900">📍 Bölge & Gayrimenkul Uzmanlık Alanlarım</h3>
              <p className="text-slate-500">
                Dijital kartvizitinizde isminizin altında rozet olarak görünecek uzmanlık alanlarınızı virgülle ayırarak yazın.
              </p>
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Uzmanlık Etiketleri (Virgülle Ayırın)</label>
                  <input
                    type="text"
                    placeholder="Örn: Eğriköprü Lüks Konut, Paşabahçe Villa, Ticari Dükkan, Arsa Yatırımı"
                    value={profile.specialties}
                    onChange={(e) => setProfile({ ...profile, specialties: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.specialties.split(',').map((s, idx) => s.trim() && (
                    <span key={idx} className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-bold text-[11px]">
                      ✓ {s.trim()}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 shadow"
                  >
                    {saving ? 'Kaydediliyor...' : 'Uzmanlıkları Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SubTabs: Vitrin İlanları, Yorumlar, Gelen Talepler */}
          {(activeSubTab === 'showcase' || activeSubTab === 'reviews' || activeSubTab === 'leads') && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-black text-sm text-slate-900">
                {activeSubTab === 'showcase' && '🏢 Vitrin İlanlarım Yönetimi'}
                {activeSubTab === 'reviews' && '⭐ Müşteri Yorumları & Başarı Rozetleri'}
                {activeSubTab === 'leads' && '📩 Kartvizitten Gelen Müşteri Talepleri'}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {activeSubTab === 'showcase' && (
                  <>Portföy eklerken veya düzenlerken <strong>Aktif</strong> statüsünde olan tüm ilanlarınız (Mevcut: <strong>{currentUser?.activeListingsCount ?? 0} ilan</strong>) kişisel dijital kartvizitinizde müşterilerinize otomatik olarak vitrinlenir.</>
                )}
                {activeSubTab === 'reviews' && (
                  <>Kartvizitinizde <strong>TTBS Yetki Belgesi No: 5800324</strong>, <strong>MYK Seviye 5 (YB0322/17UY0333-5/00/594)</strong> ve <strong>EİDS Doğrulamalı Danışman</strong> güven rozetleri otomatik olarak gösterilmektedir.</>
                )}
                {activeSubTab === 'leads' && (
                  <>Dijital kartvizitiniz üzerinden iletişim formunu dolduran müşteriler otomatik olarak <strong>Müşteri & CRM</strong> ekranınıza ve bildirim çekmecenize düşer.</>
                )}
              </p>
              <div className="pt-1">
                <a
                  href={`/${profile.slug || currentUser?.slug || 'kartvizit'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kartvizitimde Canlı Gör</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
