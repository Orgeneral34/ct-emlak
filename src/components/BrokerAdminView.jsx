import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import UserAvatar from './UserAvatar';
import { 
  ShieldCheck, UserPlus, Users, Search, Edit3, Trash2, 
  Key, Target, Phone, Mail, CheckCircle2, AlertTriangle, 
  X, Sparkles, Building, Lock, Camera, Upload
} from './Icons';

export default function BrokerAdminView() {
  const { users, currentUser, isBroker, refreshUsers, switchUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Add Form state
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    password: '123',
    role: 'agent',
    title: 'Gayrimenkul Danışmanı',
    phone: '0532 ',
    email: '',
    monthlyTarget: 400000,
    avatar: ''
  });

  // Edit Form state
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'agent',
    title: '',
    phone: '',
    email: '',
    monthlyTarget: 400000,
    avatar: ''
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const editAvatarRef = useRef(null);
  const addAvatarRef = useRef(null);

  if (!isBroker) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl shadow-xl border border-slate-200 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-slate-900">Broker Yetkisi Gereklidir</h3>
        <p className="text-xs text-slate-500 mt-2">
          Bu sayfaya yalnızca Altın Emlak Sivas Broker yöneticileri (Ahmet Mithat Soyipek & Semih Gülek) erişebilir.
        </p>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const mName = u.name.toLowerCase().includes(q);
      const mUser = u.username?.toLowerCase().includes(q);
      const mPhone = u.phone?.includes(q);
      const mTitle = u.title?.toLowerCase().includes(q);
      if (!mName && !mUser && !mPhone && !mTitle) return false;
    }
    return true;
  });

  const brokerCount = users.filter(u => u.role === 'broker').length;
  const agentCount = users.filter(u => u.role === 'agent').length;
  const totalTargetRevenue = users.reduce((acc, u) => acc + (u.monthlyTarget || 0), 0);

  // Handle Add User
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setErrorMsg('Lütfen isim ve soyisim girin.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      await api.createUser(addForm);
      await refreshUsers();
      setShowAddModal(false);
      setAddForm({
        name: '',
        username: '',
        password: '123',
        role: 'agent',
        title: 'Sivas Konut & Rezidans Uzmanı',
        phone: '0532 ',
        email: '',
        monthlyTarget: 350000
      });
      alert('Yeni danışman başarıyla sisteme eklendi!');
    } catch (err) {
      setErrorMsg(err.message || 'Kullanıcı eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Modal
  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      username: user.username || '',
      password: '', // leave empty to not change
      role: user.role,
      title: user.title,
      phone: user.phone,
      email: user.email,
      monthlyTarget: user.monthlyTarget || 300000,
      avatar: user.avatar || ''
    });
    setErrorMsg('');
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const updates = { ...editForm };
      if (!updates.password) {
        delete updates.password; // Do not overwrite if blank
      }
      await api.updateUser(editingUser.id, updates);
      await refreshUsers();
      setShowEditModal(false);
      setEditingUser(null);
      alert('Kullanıcı bilgileri güncellendi!');
    } catch (err) {
      setErrorMsg(err.message || 'Güncelleme yapılamadı.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user) => {
    if (user.id === currentUser.id) {
      alert('Kendinizi silemezsiniz!');
      return;
    }
    if (window.confirm(`"${user.name}" adlı kullanıcıyı sistemden silmek istediğinize emin misiniz?`)) {
      try {
        await api.deleteUser(user.id);
        await refreshUsers();
        alert('Kullanıcı başarıyla silindi.');
      } catch (err) {
        alert(err.message || 'Kullanıcı silinemedi.');
      }
    }
  };

  // Avatar Upload Handler for Add and Edit Modals
  const handleAvatarUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Görsel boyutu en fazla 10MB olabilir.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.uploadPhoto(formData);
      if (res && res.url) {
        if (isEdit) {
          setEditForm(prev => ({ ...prev, avatar: res.url }));
        } else {
          setAddForm(prev => ({ ...prev, avatar: res.url }));
        }
      }
    } catch (err) {
      alert('Fotoğraf yüklenemedi: ' + (err.message || 'Hata'));
    } finally {
      setUploadingAvatar(false);
      if (isEdit && editAvatarRef.current) editAvatarRef.current.value = '';
      if (!isEdit && addAvatarRef.current) addAvatarRef.current.value = '';
    }
  };

  return (
    <div className="pb-24 pt-4 max-w-7xl mx-auto px-3 sm:px-6 space-y-5 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center border border-amber-400/30">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <span>👑 Ekip & Danışman Yönetim Merkezi</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                ADMIN YÖNETİMİ
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tüm Personel Kadrosu, Kullanıcı Adı ve Şifre Belirleme, Yetki ve Hedef Tanımlamaları
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-card flex items-center justify-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Yeni Danışman / Broker Ekle</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Toplam Personel</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{users.length}</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Aktif Hesap</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-black text-amber-600 uppercase tracking-wider">Broker / Yönetici</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{brokerCount}</p>
          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Tam Yetkili Yönetici</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Saha Danışmanları</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{agentCount}</p>
          <p className="text-[10px] text-blue-700 font-semibold mt-0.5">Sivas Bölgesi Saha Ekibi</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Aylık Toplam Hedef Ciro</p>
          <p className="text-xl font-black text-emerald-700 mt-1 truncate">{formatCurrency(totalTargetRevenue)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Tüm Ekip Toplamı</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="İsim, kullanıcı adı, telefon veya unvan ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold">
          {[
            { id: 'all', label: `Tümü (${users.length})` },
            { id: 'broker', label: `👑 Broker (${brokerCount})` },
            { id: 'agent', label: `Saha Danışmanı (${agentCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl border transition ${
                roleFilter === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Danışman / Broker</th>
                <th className="py-3 px-4">Kullanıcı Adı</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Uzmanlık & Unvan</th>
                <th className="py-3 px-4 text-right">Aylık Hedef</th>
                <th className="py-3 px-4 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((user) => {
                const isUserBroker = user.role === 'broker';
                const isCurrent = user.id === currentUser?.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    {/* User Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserAvatar
                            user={user}
                            className="w-10 h-10 rounded-2xl"
                            textSize="text-xs"
                          />
                          {isUserBroker && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[9px] shadow">
                              👑
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full">
                                Siz
                              </span>
                            )}
                          </div>
                          <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${
                            isUserBroker ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isUserBroker ? 'Broker / Yönetici' : 'Saha Danışmanı'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      @{user.username || user.email?.split('@')[0]}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {user.phone}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {user.title}
                    </td>

                    {/* Target */}
                    <td className="py-3 px-4 text-right font-black text-slate-800">
                      {formatCurrency(user.monthlyTarget || 300000)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(user)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 text-xs flex items-center gap-1 transition shadow-xs"
                          title="Şifresini veya Bilgilerini Düzenle"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                          <span>Şifre / Düzenle</span>
                        </button>
                        
                        <button
                          onClick={() => switchUser(user.id)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Bu Kullanıcı Rolüne Geçiş Yap"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.id === currentUser?.id}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Kullanıcıyı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: YENİ DANIŞMAN / BROKER EKLE --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-dark-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
            
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-sm">Yeni Danışman / Broker Ekle</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 text-xs">
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                  {errorMsg}
                </div>
              )}

              {/* Danışman Profil Fotoğrafı */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <UserAvatar
                  user={{ name: addForm.name || 'Yeni Danışman', avatar: addForm.avatar }}
                  className="w-14 h-14 rounded-2xl shadow-sm"
                  textClassName="text-base font-black"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-xs">Profil Fotoğrafı</p>
                  <p className="text-[10px] text-slate-500">Boş bırakılırsa isim baş harfleri kullanılır.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="file"
                      ref={addAvatarRef}
                      onChange={(e) => handleAvatarUpload(e, false)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => addAvatarRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{uploadingAvatar ? 'Yükleniyor...' : 'Fotoğraf Seç'}</span>
                    </button>
                    {addForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setAddForm(prev => ({ ...prev, avatar: '' }))}
                        className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[11px] transition"
                      >
                        Kaldır
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet Yıldırım"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kullanıcı Adı</label>
                  <input
                    type="text"
                    placeholder="Örn: mehmet.yildirim"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giriş Şifresi</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rol / Yetki</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="agent">Saha Danışmanı</option>
                    <option value="broker">Broker / Yönetici Ortak</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon Numarası</label>
                  <input
                    type="text"
                    placeholder="0532 123 45 67"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uzmanlık & Unvan</label>
                <input
                  type="text"
                  placeholder="Örn: Sivas Konut & Rezidans Uzmanı"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Aylık Hedef Ciro (TRY)</label>
                <input
                  type="number"
                  placeholder="350000"
                  value={addForm.monthlyTarget}
                  onChange={(e) => setAddForm({ ...addForm, monthlyTarget: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow transition"
                >
                  {saving ? 'Kaydediliyor...' : 'Danışmanı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: DANIŞMAN DÜZENLE & ŞİFRE DEĞİŞTİR --- */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-dark-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
            
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">Danışman Düzenle & Şifre Sıfırla</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5 text-xs">
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                  {errorMsg}
                </div>
              )}

              {/* Danışman Profil Fotoğrafı Düzenle */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <UserAvatar
                  user={{ name: editForm.name || editingUser.name, avatar: editForm.avatar }}
                  className="w-14 h-14 rounded-2xl shadow-sm"
                  textClassName="text-base font-black"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-xs">Profil Fotoğrafı</p>
                  <p className="text-[10px] text-slate-500">Kullanıcının sisteme ve dijital kartvizitine yansır.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="file"
                      ref={editAvatarRef}
                      onChange={(e) => handleAvatarUpload(e, true)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => editAvatarRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-sm transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{uploadingAvatar ? 'Yükleniyor...' : 'Fotoğraf Değiştir'}</span>
                    </button>
                    {editForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, avatar: '' }))}
                        className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[11px] transition"
                      >
                        Kaldır
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Yeni Şifre (Boş bırakılırsa değişmez)</label>
                  <input
                    type="text"
                    placeholder="Yeni şifre girin..."
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rol</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="agent">Saha Danışmanı</option>
                    <option value="broker">Broker / Yönetici Ortak</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon Numarası</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uzmanlık & Unvan</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Aylık Hedef Ciro (TRY)</label>
                <input
                  type="number"
                  value={editForm.monthlyTarget}
                  onChange={(e) => setEditForm({ ...editForm, monthlyTarget: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow transition"
                >
                  {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
