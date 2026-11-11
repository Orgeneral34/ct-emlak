import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Users, Key, ShieldCheck, CheckCircle2, PauseCircle,
  Trash2, Edit3, Eye, Copy, Check, Search, Phone, MapPin, FileBadge,
  Sparkles, RefreshCw, UserPlus, Lock, Unlock, ExternalLink, Share2,
  Briefcase, Layers, Award, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INITIAL_OFFICE_FORM = {
  name: '',
  shortBadge: '',
  city: '',
  district: '',
  brandColor: '#f59e0b',
  companyTitle: '',
  ownerName: '',
  tcKimlikNo: '',
  taxOffice: '',
  taxNumber: '',
  ttbsNo: '',
  mykBelgeNo: '',
  mersisNo: '',
  chamberRegistryNo: '',
  phone: '',
  email: '',
  address: '',
  plan: 'Kurumsal Multi-Office',
  status: 'aktif',
  monthlyFee: 2500,
  expiresAt: '2027-12-31',
  notes: '',
  // Initial Broker fields (only for create)
  brokerName: '',
  brokerUsername: '',
  brokerPassword: '',
  brokerPhone: '',
  brokerEmail: '',
  brokerTitle: 'Ofis Broker & Kurucu'
};

const INITIAL_USER_FORM = {
  officeId: 'OFC-01',
  name: '',
  username: '',
  password: '',
  role: 'danisman',
  title: 'Gayrimenkul Danışmanı',
  phone: '',
  email: '',
  mykNo: '',
  ttbsNo: '',
  commissionRate: 50,
  uzmanlik: ''
};

export default function SuperAdminOfficesView({ onNavigateTab }) {
  const { currentOffice, switchOffice, refreshOffices, refreshUsers } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('offices'); // 'offices' | 'users' | 'onboarding'
  const [offices, setOffices] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOfficeId, setFilterOfficeId] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [toast, setToast] = useState(null);

  // Office Modal
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [officeForm, setOfficeForm] = useState(INITIAL_OFFICE_FORM);
  const [savingOffice, setSavingOffice] = useState(false);

  // User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState(INITIAL_USER_FORM);
  const [savingUser, setSavingUser] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [officeList, userList] = await Promise.all([
        api.getSuperAdminOffices(),
        api.getSuperAdminUsers('ALL')
      ]);
      setOffices(Array.isArray(officeList) ? officeList : []);
      setAllUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      showToast(err.message || 'Veriler yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open Create Office Modal
  const handleOpenCreateOffice = () => {
    setEditingOffice(null);
    setOfficeForm({
      ...INITIAL_OFFICE_FORM,
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
    });
    setIsOfficeModalOpen(true);
  };

  // Open Edit Office Modal
  const handleOpenEditOffice = (office) => {
    setEditingOffice(office);
    setOfficeForm({
      ...INITIAL_OFFICE_FORM,
      name: office.name || '',
      shortBadge: office.shortBadge || '',
      city: office.city || '',
      district: office.district || '',
      brandColor: office.brandColor || '#f59e0b',
      companyTitle: office.companyTitle || '',
      ownerName: office.ownerName || '',
      tcKimlikNo: office.tcKimlikNo || '',
      taxOffice: office.taxOffice || '',
      taxNumber: office.taxNumber || '',
      ttbsNo: office.ttbsNo || '',
      mykBelgeNo: office.mykBelgeNo || '',
      mersisNo: office.mersisNo || '',
      chamberRegistryNo: office.chamberRegistryNo || '',
      phone: office.phone || '',
      email: office.email || '',
      address: office.address || '',
      plan: office.plan || 'Kurumsal Multi-Office',
      status: office.status || 'aktif',
      monthlyFee: office.monthlyFee ?? 2500,
      expiresAt: office.expiresAt || '2027-12-31',
      notes: office.notes || ''
    });
    setIsOfficeModalOpen(true);
  };

  const handleSaveOffice = async (e) => {
    e.preventDefault();
    if (!officeForm.name.trim()) {
      showToast('Lütfen ofis adını giriniz.', 'error');
      return;
    }
    setSavingOffice(true);
    try {
      if (editingOffice) {
        await api.updateSuperAdminOffice(editingOffice.id, officeForm);
        showToast(`"${officeForm.name}" ofis bilgileri güncellendi.`);
      } else {
        const res = await api.createSuperAdminOffice(officeForm);
        showToast(`"${res.office?.name}" ofisi başarıyla kuruldu!${res.broker ? ` Yönetici: @${res.broker.username}` : ''}`);
      }
      setIsOfficeModalOpen(false);
      await loadAll();
      await refreshOffices();
      await refreshUsers();
    } catch (err) {
      showToast(err.message || 'Ofis kaydedilemedi.', 'error');
    } finally {
      setSavingOffice(false);
    }
  };

  const handleToggleOfficeStatus = async (office) => {
    const nextStatus = office.status === 'askida' ? 'aktif' : 'askida';
    const confirmMsg = nextStatus === 'askida'
      ? `"${office.name}" ofisini ASKIYA ALMAK istediğinize emin misiniz? Bu ofisteki kullanıcılar sisteme giriş yapamayacak.`
      : `"${office.name}" ofisini tekrar AKTİF hale getirmek istiyor musunuz?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.updateSuperAdminOffice(office.id, { status: nextStatus });
      showToast(`"${office.name}" durumu "${nextStatus.toUpperCase()}" olarak güncellendi.`);
      await loadAll();
      await refreshOffices();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteOffice = async (office) => {
    if (office.id === 'OFC-01') {
      showToast('Ana ofis (OFC-01) silinemez.', 'error');
      return;
    }
    if (!window.confirm(`DİKKAT! "${office.name}" (${office.id}) ofisini ve bu ofise bağlı tüm kullanıcı/portföy verilerini silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await api.deleteSuperAdminOffice(office.id);
      if (currentOffice?.id === office.id) {
        await switchOffice('OFC-01');
      }
      showToast(`"${office.name}" ofisi silindi.`);
      await loadAll();
      await refreshOffices();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSwitchToOffice = async (office) => {
    await switchOffice(office.id);
    showToast(`Aktif ofis "${office.name}" olarak değiştirildi. Tüm menüler bu ofisin verilerini gösteriyor.`);
  };

  // User Management Handlers
  const handleOpenCreateUser = (defaultOfficeId = null) => {
    setEditingUser(null);
    setUserForm({
      ...INITIAL_USER_FORM,
      officeId: defaultOfficeId || currentOffice?.id || 'OFC-01'
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserForm({
      officeId: u.officeId || 'OFC-01',
      name: u.name || '',
      username: u.username || '',
      password: u.password || '',
      role: u.role || 'danisman',
      title: u.title || '',
      phone: u.phone || '',
      email: u.email || '',
      mykNo: u.mykNo || '',
      ttbsNo: u.ttbsNo || '',
      commissionRate: u.commissionRate ?? 50,
      uzmanlik: Array.isArray(u.uzmanlik) ? u.uzmanlik.join(', ') : (u.uzmanlik || '')
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.username.trim()) {
      showToast('Ad Soyad ve Kullanıcı Adı zorunludur.', 'error');
      return;
    }
    setSavingUser(true);
    try {
      const payload = {
        ...userForm,
        uzmanlik: typeof userForm.uzmanlik === 'string'
          ? userForm.uzmanlik.split(',').map(s => s.trim()).filter(Boolean)
          : userForm.uzmanlik
      };
      if (editingUser) {
        await api.updateUser(editingUser.id, payload);
        showToast(`"${userForm.name}" kullanıcı bilgileri güncellendi.`);
      } else {
        await api.createUser(payload);
        showToast(`"${userForm.name}" kullanıcısı oluşturuldu.`);
      }
      setIsUserModalOpen(false);
      await loadAll();
      await refreshUsers();
    } catch (err) {
      showToast(err.message || 'Kullanıcı kaydedilemedi.', 'error');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.isSuperAdmin || u.username === 'halil') {
      showToast('Süper Admin hesabı silinemez.', 'error');
      return;
    }
    if (!window.confirm(`"${u.name}" (@${u.username}) kullanıcısını silmek istediğinize emin misiniz?`)) return;
    try {
      await api.deleteUser(u.id);
      showToast(`"${u.name}" kullanıcısı silindi.`);
      await loadAll();
      await refreshUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // KPI calculations
  const activeOfficeCount = offices.filter(o => o.status === 'aktif').length;
  const totalAgentCount = allUsers.length;
  const totalListingsCount = offices.reduce((acc, o) => acc + (o.stats?.listingCount || 0), 0);
  const totalMonthlySaaSRevenue = offices
    .filter(o => o.status === 'aktif')
    .reduce((acc, o) => acc + (Number(o.monthlyFee) || 0), 0);

  const filteredUsers = allUsers.filter(u => {
    if (filterOfficeId !== 'ALL' && (u.officeId || 'OFC-01') !== filterOfficeId) return false;
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.officeName || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });

  const onboardingChecklistText = `🏛️ *CT EMLAK – YENİ OFİS KURULUM EVRAK & BİLGİ LİSTESİ*

Merhaba, ofisinizin *CT Emlak Kurumsal Portföy & CRM* sistemini kurabilmemiz için aşağıdaki bilgileri iletmenizi rica ederiz:

1️⃣ *Ofis Marka Bilgileri:*
• Ofis Tabela / Marka Adı (Örn: Altın Emlak Sivas):
• Şehir ve İlçe:
• Ofis Sabit / Kurumsal Telefonu:
• Ofis Açık Adresi:

2️⃣ *Resmi Belge Bilgileri (E-Sözleşme & Yasal Uyum İçin):*
• Vergi Levhası Fotoğrafı (veya Ticari Ünvan, Vergi Dairesi, Vergi/TC No)
• Taşınmaz Ticareti Yetki Belgesi (TTBS No)
• Sorumlu Emlak Danışmanı MYK Seviye 5 Belge No

3️⃣ *Personel & Danışman Listesi (Giriş Hesapları İçin):*
• Ofis Broker / Yöneticisi Ad Soyad & Cep Telefonu:
• Danışmanların Ad Soyad, Cep Telefonu ve varsa MYK Seviye 4 Belge Numaraları:`;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: toast.type === 'error' ? '#dc2626' : '#059669',
            color: 'white',
            padding: '14px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(15, 23, 42, 0.95) 65%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '18px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.72rem',
                padding: '4px 10px',
                borderRadius: '999px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              CT EMLAK SAAS SÜPER ADMİN
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
              Ceylantek Multi-Office Yönetim Merkezi
            </span>
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Ofis Kurulum, Lisans & Merkezi Kullanıcı Yönetimi
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px', marginBottom: 0 }}>
            Yeni emlak ofisleri açın, yasal belgelerini tanımlayın, kullanıcı şifrelerini yönetin ve tek tıkla istediğiniz ofisin paneline geçiş yapın.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={loadAll}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px' }}
          >
            <RefreshCw size={16} /> Yenile
          </button>
          <button
            onClick={() => handleOpenCreateUser(currentOffice?.id)}
            style={{
              background: 'rgba(59, 130, 246, 0.18)',
              border: '1px solid rgba(59, 130, 246, 0.45)',
              color: '#60a5fa',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <UserPlus size={17} /> Ofise Personel Ekle
          </button>
          <button
            onClick={handleOpenCreateOffice}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              color: '#0f172a',
              padding: '11px 18px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Plus size={18} /> Yeni Emlak Ofisi Kur
          </button>
        </div>
      </div>

      {/* SaaS KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>TOPLAM EMLAK OFİSİ</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            {offices.length} <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>({activeOfficeCount} Aktif)</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
            Multi-Office İzole Veritabanı
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>TOPLAM KULLANICI / DANIŞMAN</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            {totalAgentCount}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
            Tüm ofislerdeki broker ve danışmanlar
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>TOPLAM KAYITLI PORTFÖY</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            {totalListingsCount}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
            Tüm ofislerin toplam ilan sayısı
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #a855f7' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>AYLIK SAAS LİSANS GELİRİ</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            {totalMonthlySaaSRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
            Aktif ofis abonelikleri toplamı
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '12px',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={() => setActiveSubTab('offices')}
          style={{
            background: activeSubTab === 'offices' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(30, 41, 59, 0.7)',
            color: activeSubTab === 'offices' ? '#0f172a' : '#cbd5e1',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Building2 size={17} /> Ofisler & Lisans Yönetimi ({offices.length})
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          style={{
            background: activeSubTab === 'users' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(30, 41, 59, 0.7)',
            color: activeSubTab === 'users' ? '#0f172a' : '#cbd5e1',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Key size={17} /> Tüm Kullanıcılar & Şifreler ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('onboarding')}
          style={{
            background: activeSubTab === 'onboarding' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(30, 41, 59, 0.7)',
            color: activeSubTab === 'onboarding' ? '#0f172a' : '#cbd5e1',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileBadge size={17} /> Yeni Ofis Kurulum Evrak Şablonu
        </button>
      </div>

      {/* TAB 1: OFFICES */}
      {activeSubTab === 'offices' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.25rem' }}>
          {offices.map((office) => {
            const isSelected = currentOffice?.id === office.id;
            const isSuspended = office.status === 'askida';
            return (
              <div
                key={office.id}
                className="card"
                style={{
                  padding: '1.35rem',
                  border: isSelected
                    ? '2px solid #f59e0b'
                    : isSuspended
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected
                    ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.09) 0%, rgba(15, 23, 42, 0.9) 100%)'
                    : 'rgba(15, 23, 42, 0.85)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: office.brandColor || '#f59e0b',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '1.1rem',
                          flexShrink: 0
                        }}
                      >
                        {(office.name || 'CT').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#f8fafc' }}>
                            {office.name}
                          </h3>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(255,255,255,0.08)',
                              color: '#cbd5e1',
                              fontWeight: 700
                            }}
                          >
                            {office.id}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                          {office.companyTitle || office.ownerName || 'Ticari Ünvan Girilmedi'} • {office.city || 'Türkiye'}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background:
                          office.status === 'aktif'
                            ? 'rgba(16, 185, 129, 0.18)'
                            : office.status === 'askida'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(59, 130, 246, 0.2)',
                        color:
                          office.status === 'aktif'
                            ? '#34d399'
                            : office.status === 'askida'
                            ? '#f87171'
                            : '#60a5fa'
                      }}
                    >
                      {office.status === 'aktif' ? '● AKTİF' : office.status === 'askida' ? '⏸ ASKIDA' : '★ DEMO'}
                    </span>
                  </div>

                  {/* Legal & Official Credentials */}
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(2, 6, 23, 0.55)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b' }}>TTBS Yetki No:</span>{' '}
                      <strong style={{ color: '#e2e8f0' }}>{office.ttbsNo || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Vergi No:</span>{' '}
                      <strong style={{ color: '#e2e8f0' }}>{office.taxNumber || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Sorumlu Broker:</span>{' '}
                      <strong style={{ color: '#e2e8f0' }}>{office.ownerName || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Aylık Lisans:</span>{' '}
                      <strong style={{ color: '#fbbf24' }}>{(Number(office.monthlyFee) || 0).toLocaleString('tr-TR')} ₺</strong>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                      marginTop: '0.85rem'
                    }}
                  >
                    <div style={{ background: 'rgba(30,41,59,0.5)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>{office.stats?.userCount || 0}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Personel</div>
                    </div>
                    <div style={{ background: 'rgba(30,41,59,0.5)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>{office.stats?.listingCount || 0}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Portföy</div>
                    </div>
                    <div style={{ background: 'rgba(30,41,59,0.5)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>{office.stats?.leadCount || 0}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CRM Kaydı</div>
                    </div>
                    <div style={{ background: 'rgba(30,41,59,0.5)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>{office.stats?.contractCount || 0}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Sözleşme</div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => handleSwitchToOffice(office)}
                    style={{
                      flex: 1,
                      background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: isSelected ? '#34d399' : '#0f172a',
                      border: isSelected ? '1px solid rgba(16, 185, 129, 0.45)' : 'none',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {isSelected ? <CheckCircle2 size={15} /> : <Eye size={15} />}
                    {isSelected ? 'Aktif Yönetilen Ofis' : 'Bu Ofise Geç (Yönet)'}
                  </button>

                  <button
                    onClick={() => {
                      setFilterOfficeId(office.id);
                      setActiveSubTab('users');
                    }}
                    title="Bu ofisin kullanıcılarını ve şifrelerini gör"
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      padding: '9px 11px',
                      borderRadius: '9px',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Users size={15} /> Şifreler
                  </button>

                  <button
                    onClick={() => handleOpenEditOffice(office)}
                    title="Ofis ve Resmi Belgeleri Düzenle"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: '#e2e8f0',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '9px 11px',
                      borderRadius: '9px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => handleToggleOfficeStatus(office)}
                    title={office.status === 'askida' ? 'Ofisi Aktifleştir' : 'Ofisi Askıya Al'}
                    style={{
                      background: office.status === 'askida' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: office.status === 'askida' ? '#34d399' : '#fbbf24',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '9px 11px',
                      borderRadius: '9px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {office.status === 'askida' ? <Unlock size={15} /> : <Lock size={15} />}
                  </button>

                  {office.id !== 'OFC-01' && (
                    <button
                      onClick={() => handleDeleteOffice(office)}
                      title="Ofisi Sil"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '9px 11px',
                        borderRadius: '9px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ALL USERS & PASSWORDS ACROSS ALL OFFICES */}
      {activeSubTab === 'users' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <select
                value={filterOfficeId}
                onChange={(e) => setFilterOfficeId(e.target.value)}
                style={{
                  background: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                <option value="ALL">🏢 Tüm Ofisler ({allUsers.length} Kullanıcı)</option>
                {offices.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.id})
                  </option>
                ))}
              </select>

              <div style={{ position: 'relative', minWidth: '250px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
                />
                <input
                  type="text"
                  placeholder="İsim, kullanıcı adı, ofis veya tel ara..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '10px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => handleOpenCreateUser(filterOfficeId !== 'ALL' ? filterOfficeId : currentOffice?.id)}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#0f172a',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <UserPlus size={16} /> Yeni Kullanıcı Ekle
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '12px 10px' }}>Ad Soyad / Ünvan</th>
                  <th style={{ padding: '12px 10px' }}>Bağlı Olduğu Ofis</th>
                  <th style={{ padding: '12px 10px' }}>Rol</th>
                  <th style={{ padding: '12px 10px' }}>Kullanıcı Adı</th>
                  <th style={{ padding: '12px 10px' }}>Giriş Şifresi</th>
                  <th style={{ padding: '12px 10px' }}>Telefon</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const credText = `🏛️ *${u.officeName || 'CT Emlak'} - Kurumsal Giriş Bilgileriniz*\n👤 Kullanıcı Adı: ${u.username}\n🔑 Şifre: ${u.password || '—'}`;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.title || 'Danışman'}</div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            background: 'rgba(245, 158, 11, 0.14)',
                            color: '#fbbf24',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {u.officeName || u.officeId || 'Altın Emlak Sivas'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {u.isSuperAdmin || u.username === 'halil' ? (
                          <span style={{ color: '#c084fc', fontWeight: 800, fontSize: '0.76rem' }}>👑 SÜPER ADMİN</span>
                        ) : u.role === 'broker' ? (
                          <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.76rem' }}>⭐ BROKER / YÖNETİCİ</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.76rem' }}>DANIŞMAN</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <code
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            color: '#e2e8f0',
                            fontWeight: 700
                          }}
                        >
                          @{u.username}
                        </code>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <code
                            style={{
                              background: 'rgba(16, 185, 129, 0.12)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              color: '#34d399',
                              fontWeight: 800
                            }}
                          >
                            {u.password || '—'}
                          </code>
                          <button
                            onClick={() => copyText(u.password || '', `pw_${u.id}`)}
                            title="Şifreyi Kopyala"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: copiedKey === `pw_${u.id}` ? '#10b981' : '#94a3b8',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedKey === `pw_${u.id}` ? <Check size={15} /> : <Copy size={15} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => copyText(credText, `cred_${u.id}`)}
                            title="WhatsApp İçin Giriş Bilgisi Kartını Kopyala"
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedKey === `cred_${u.id}` ? <Check size={14} /> : <Share2 size={14} />}
                            {copiedKey === `cred_${u.id}` ? 'Kopyalandı' : 'Bilgi Kopyala'}
                          </button>
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              color: '#e2e8f0',
                              border: '1px solid rgba(255,255,255,0.12)',
                              padding: '6px 9px',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                          {!u.isSuperAdmin && u.username !== 'halil' && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '6px 9px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ONBOARDING CHECKLIST FOR NEW CLIENTS */}
      {activeSubTab === 'onboarding' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', fontWeight: 800 }}>
                Yeni Emlak Ofisi Kurulumu İçin Müşteriden İstenecek Bilgiler Şablonu
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Yeni bir emlak ofisine CT Emlak lisansı verirken aşağıdaki metni tek tıkla kopyalayıp WhatsApp'tan ofis sahibine gönderebilirsiniz.
              </p>
            </div>
            <button
              onClick={() => copyText(onboardingChecklistText, 'onboarding_tpl')}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {copiedKey === 'onboarding_tpl' ? <Check size={17} /> : <Copy size={17} />}
              {copiedKey === 'onboarding_tpl' ? 'Şablon Kopyalandı!' : 'WhatsApp Şablonunu Kopyala'}
            </button>
          </div>

          <pre
            style={{
              background: '#090d16',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1.25rem',
              color: '#e2e8f0',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap'
            }}
          >
            {onboardingChecklistText}
          </pre>
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT OFFICE */}
      {isOfficeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.82)',
            backdropFilter: 'blur(6px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              background: '#0f172a',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                {editingOffice ? `✏️ Ofis Düzenle: ${editingOffice.name}` : '🏛️ Yeni Emlak Ofisi Kurulum Sihirbazı'}
              </h2>
              <button
                onClick={() => setIsOfficeModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.35rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOffice} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Section 1: Marka & Kurumsal Kimlik */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.85rem', marginBottom: '10px' }}>
                  1. OFİS TABELA & GÖRÜNÜM BİLGİLERİ (SOL ÜST MENÜDE GÖRÜNECEK AD)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Ofis Marka / Tabela Adı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Altın Emlak Sivas / Kristal Emlak"
                      value={officeForm.name}
                      onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Şehir</label>
                    <input
                      type="text"
                      placeholder="Örn: Sivas / Ankara / İstanbul"
                      value={officeForm.city}
                      onChange={(e) => setOfficeForm({ ...officeForm, city: e.target.value, shortBadge: officeForm.shortBadge || e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Kısa Rozet (Logo Yanı)</label>
                    <input
                      type="text"
                      placeholder="Örn: Sivas / Merkez"
                      value={officeForm.shortBadge}
                      onChange={(e) => setOfficeForm({ ...officeForm, shortBadge: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Ofis Telefonu</label>
                    <input
                      type="text"
                      placeholder="0532 ..."
                      value={officeForm.phone}
                      onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Ofis Açık Adresi</label>
                  <input
                    type="text"
                    placeholder="Mahalle, Cadde, No, İlçe/İl"
                    value={officeForm.address}
                    onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              {/* Section 2: Resmi Belgeler */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.85rem', marginBottom: '10px' }}>
                  2. RESMİ BELGE & YASAL UYUM BİLGİLERİ (SÖZLEŞMELERE OTOMATİK BASILIR)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Vergi Levhası Ticari Ünvan</label>
                    <input
                      type="text"
                      placeholder="Örn: FOX EMLAK - SEMİH GÜLEK"
                      value={officeForm.companyTitle}
                      onChange={(e) => setOfficeForm({ ...officeForm, companyTitle: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Sorumlu Emlak Danışmanı</label>
                    <input
                      type="text"
                      placeholder="Ad Soyad"
                      value={officeForm.ownerName}
                      onChange={(e) => setOfficeForm({ ...officeForm, ownerName: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>TTBS Yetki Belge No</label>
                    <input
                      type="text"
                      placeholder="Örn: 5800324"
                      value={officeForm.ttbsNo}
                      onChange={(e) => setOfficeForm({ ...officeForm, ttbsNo: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>MYK Seviye 5 Belge No</label>
                    <input
                      type="text"
                      placeholder="Örn: YB0322/17UY0333-5/00/594"
                      value={officeForm.mykBelgeNo}
                      onChange={(e) => setOfficeForm({ ...officeForm, mykBelgeNo: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Vergi Dairesi</label>
                    <input
                      type="text"
                      placeholder="Örn: SİTE VERGİ DAİRESİ MÜD."
                      value={officeForm.taxOffice}
                      onChange={(e) => setOfficeForm({ ...officeForm, taxOffice: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Vergi Kimlik No (VKN)</label>
                    <input
                      type="text"
                      placeholder="Örn: 4160184689"
                      value={officeForm.taxNumber}
                      onChange={(e) => setOfficeForm({ ...officeForm, taxNumber: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: SaaS Abonelik */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 800, color: '#c084fc', fontSize: '0.85rem', marginBottom: '10px' }}>
                  3. CT EMLAK SAAS LİSANS & ABONELİK AYARLARI
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Lisans Durumu</label>
                    <select
                      value={officeForm.status}
                      onChange={(e) => setOfficeForm({ ...officeForm, status: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="demo">Demo / Deneme</option>
                      <option value="askida">Askıda (Giriş Kilitli)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Aylık Lisans Ücreti (₺)</label>
                    <input
                      type="number"
                      value={officeForm.monthlyFee}
                      onChange={(e) => setOfficeForm({ ...officeForm, monthlyFee: Number(e.target.value) })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Lisans Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={officeForm.expiresAt}
                      onChange={(e) => setOfficeForm({ ...officeForm, expiresAt: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: İlk Broker Hesabı (Sadece Yeni Ofis Kurarken) */}
              {!editingOffice && (
                <div style={{ background: 'rgba(16, 185, 129, 0.07)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.85rem', marginBottom: '6px' }}>
                    4. OFİSİN İLK YÖNETİCİ (BROKER) HESABINI OTOMATİK OLUŞTUR
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    Ofis sahibi bu kullanıcı adı ve şifreyle giriş yaptığında doğrudan kendi ofis adını ({officeForm.name || 'Yeni Ofis'}) görecektir.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Broker Ad Soyad</label>
                      <input
                        type="text"
                        placeholder="Örn: Ahmet Yılmaz"
                        value={officeForm.brokerName}
                        onChange={(e) => setOfficeForm({ ...officeForm, brokerName: e.target.value })}
                        className="form-input"
                        style={{ width: '100%', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Giriş Kullanıcı Adı</label>
                      <input
                        type="text"
                        placeholder="Örn: ahmetyilmaz"
                        value={officeForm.brokerUsername}
                        onChange={(e) => setOfficeForm({ ...officeForm, brokerUsername: e.target.value })}
                        className="form-input"
                        style={{ width: '100%', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Giriş Şifresi</label>
                      <input
                        type="text"
                        placeholder="Örn: Ahmet2026!"
                        value={officeForm.brokerPassword}
                        onChange={(e) => setOfficeForm({ ...officeForm, brokerPassword: e.target.value })}
                        className="form-input"
                        style={{ width: '100%', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Broker Cep Telefonu</label>
                      <input
                        type="text"
                        placeholder="0532 ..."
                        value={officeForm.brokerPhone}
                        onChange={(e) => setOfficeForm({ ...officeForm, brokerPhone: e.target.value })}
                        className="form-input"
                        style={{ width: '100%', marginTop: '4px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsOfficeModalOpen(false)}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={savingOffice}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#0f172a',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {savingOffice ? 'Kaydediliyor...' : editingOffice ? 'Değişiklikleri Kaydet' : 'Ofisi ve Yöneticiyi Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT USER FOR ANY OFFICE */}
      {isUserModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.82)',
            backdropFilter: 'blur(6px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '1.5rem',
              background: '#0f172a',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                {editingUser ? `👤 Kullanıcı Düzenle: ${editingUser.name}` : '👤 Ofise Yeni Kullanıcı / Danışman Ekle'}
              </h2>
              <button
                onClick={() => setIsUserModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.35rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Bağlı Olduğu Ofis *</label>
                  <select
                    value={userForm.officeId}
                    onChange={(e) => setUserForm({ ...userForm, officeId: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    {offices.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Yetki Rolü *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        role: e.target.value,
                        title: e.target.value === 'broker' ? 'Ofis Broker & Yönetici' : 'Gayrimenkul Danışmanı'
                      })
                    }
                    className="form-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="danisman">Gayrimenkul Danışmanı</option>
                    <option value="broker">Ofis Broker / Yönetici</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Ünvan</label>
                  <input
                    type="text"
                    value={userForm.title}
                    onChange={(e) => setUserForm({ ...userForm, title: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Kullanıcı Adı (@username) *</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Giriş Şifresi *</label>
                  <input
                    type="text"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Cep Telefonu</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8' }}>MYK Belge No</label>
                  <input
                    type="text"
                    value={userForm.mykNo}
                    onChange={(e) => setUserForm({ ...userForm, mykNo: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="btn btn-secondary">
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#0f172a',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {savingUser ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
