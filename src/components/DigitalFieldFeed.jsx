import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import UserAvatar from './UserAvatar';
import { 
  Camera, Plus, Heart, MessageCircle, Share2, 
  MapPin, Eye, Building2, Sparkles, Filter, 
  ExternalLink, UserCheck, Flame, Trash2, Upload
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function DigitalFieldFeed({ onOpenListingDetail, onOpenAgentCard }) {
  const { currentUser, isBroker } = useAuth();
  const [stories, setStories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // all, favorites
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [newStoryText, setNewStoryText] = useState('');
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryPhotoUrl, setNewStoryPhotoUrl] = useState('');
  const [uploadingStoryPhoto, setUploadingStoryPhoto] = useState(false);
  const [activeStoryView, setActiveStoryView] = useState(null);
  const storyPhotoInputRef = useRef(null);

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    setLoading(true);
    try {
      const [sData, lData] = await Promise.all([
        api.getStories(),
        api.getListings()
      ]);
      setStories(Array.isArray(sData) ? sData : []);
      setListings(Array.isArray(lData) ? lData : []);
    } catch (err) {
      console.error('Saha akışı yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadStoryPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingStoryPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.uploadPhoto(formData);
      if (res && res.url) {
        setNewStoryPhotoUrl(res.url);
      }
    } catch (err) {
      alert('Görsel yüklenemedi: ' + err.message);
    } finally {
      setUploadingStoryPhoto(false);
      if (storyPhotoInputRef.current) storyPhotoInputRef.current.value = '';
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newStoryText.trim()) return;

    try {
      const created = await api.createStory({
        agentId: currentUser?.id || 'USR-00',
        agentName: currentUser?.name || 'Altın Emlak Danışmanı',
        agentAvatar: currentUser?.avatar || '',
        title: newStoryTitle || 'Saha Paylaşımı',
        content: newStoryText,
        mediaUrl: newStoryPhotoUrl || ''
      });
      setStories(prev => [created, ...prev]);
      setShowStoryModal(false);
      setNewStoryText('');
      setNewStoryTitle('');
      setNewStoryPhotoUrl('');
    } catch (err) {
      alert('Paylaşım yapılamadı: ' + err.message);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Bu saha hikayesini silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteStory(storyId);
      setStories(prev => prev.filter(s => s.id !== storyId));
      setActiveStoryView(null);
    } catch (err) {
      alert('Silinemedi: ' + err.message);
    }
  };

  return (
    <div className="pb-24 pt-3 max-w-xl mx-auto px-3 sm:px-4 space-y-5">
      
      {/* Top Motivational Quote (Matching Screenshot 1) */}
      <div className="text-center py-2">
        <h1 className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight italic font-serif">
          "Bugün Sahada hareketlilik var mı?"
        </h1>
      </div>

      {/* Stories Carousel (Sahaya Çık + Danışman Hikayeleri) */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
        
        {/* Story 1: Add Story (Sahaya Çık) */}
        <div 
          onClick={() => setShowStoryModal(true)}
          className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-500 p-0.5 flex items-center justify-center relative bg-white group-hover:scale-105 transition shadow-sm">
            <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Plus className="w-6 h-6" />
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow border border-white">
              +
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-700">Sahaya Çık</span>
        </div>

        {/* Stories from Consultants */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => setActiveStoryView(story)}
            className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-rose-500 shadow-md">
              <UserAvatar
                name={story.agentName}
                avatar={story.agentAvatar}
                className="w-full h-full rounded-full border-2 border-white"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-800 max-w-[70px] truncate text-center">
              {(story.agentName || 'Danışman').split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Filter Tabs: Tüm Akış, Favorilerim, Filtreler */}
      <div className="flex items-center justify-center gap-2">
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 shadow-inner text-xs font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-1.5 rounded-xl transition ${
              filterMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tüm Akış
          </button>
          <button
            onClick={() => setFilterMode('favorites')}
            className={`px-4 py-1.5 rounded-xl transition ${
              filterMode === 'favorites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Favorilerim
          </button>
        </div>

        <button
          onClick={() => alert('Filtreleme seçenekleri')}
          className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 shadow-sm"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filtreler</span>
        </button>
      </div>

      {/* FEED POSTS (Listings & Field Stories as Feed Cards) */}
      <div className="space-y-4">
        {listings.map((item) => (
          <div 
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition"
          >
            {/* Post Header: Agent Info & Vitrin Link */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserAvatar
                  name={item.agentName}
                  avatar={item.agentAvatar}
                  className="w-10 h-10 rounded-2xl"
                />
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">{item.agentName}</h4>
                  <button
                    onClick={() => onOpenAgentCard && onOpenAgentCard(item.agentName.toLowerCase().replace(/\s+/g, ''))}
                    className="text-[10px] text-blue-600 hover:underline font-semibold block"
                  >
                    Danışman Vitrini İçin Tıkla
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full border">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>{item.viewsCount || 24}</span>
                </span>
              </div>
            </div>

            {/* Post Image Container with Badges */}
            <div 
              onClick={() => onOpenListingDetail && onOpenListingDetail(item)}
              className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer group"
            >
              <img
                src={item.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              
              {/* Top Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-600 text-white shadow uppercase">
                  {item.type === 'satilik' ? 'Satılık' : 'Kiralık'}
                </span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur shadow">
                  {item.category === 'konut' ? 'Konut' : item.category === 'ticari' ? 'İşyeri' : 'Arsa'}
                </span>
              </div>

              {item.videoUrl && (
                <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-red-600 text-white shadow flex items-center gap-1 animate-pulse">
                  <span>🎬 Video</span>
                </span>
              )}

              {/* Bottom Scrim & Price */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white">
                <h3 className="font-extrabold text-xs sm:text-sm line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-lg font-black text-amber-400 mt-0.5">
                  {formatCurrency(item.price, item.currency)}
                </p>
              </div>
            </div>

            {/* Post Bottom Bar: Likes, Comments, Share */}
            <div className="p-3.5 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => alert('Gönderi beğenildi!')}
                  className="flex items-center gap-1 hover:text-red-500 transition font-bold"
                >
                  <Heart className="w-4 h-4 text-slate-400 hover:text-red-500" />
                  <span>14</span>
                </button>
                <button 
                  onClick={() => onOpenListingDetail && onOpenListingDetail(item)}
                  className="flex items-center gap-1 hover:text-blue-600 transition font-bold"
                >
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <span>Yorum</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>{item.district}, {item.neighborhood}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE STORY MODAL */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm text-slate-900">Sahaya Çık — Hikaye Paylaş</h3>
              <button onClick={() => setShowStoryModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Başlık</label>
                <input
                  type="text"
                  placeholder="Örn: İstasyon Caddesi Keşif Turu"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Saha Fotoğrafı (Opsiyonel)</label>
                <input
                  type="file"
                  ref={storyPhotoInputRef}
                  onChange={handleUploadStoryPhoto}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={uploadingStoryPhoto}
                    onClick={() => storyPhotoInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingStoryPhoto ? 'Yükleniyor...' : 'Fotoğraf Seç'}</span>
                  </button>
                  {newStoryPhotoUrl && (
                    <span className="text-emerald-600 font-bold text-[11px]">✓ Fotoğraf Eklendi</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ne paylaşmak istersiniz?</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Portföy teslim aldım, müşteriyle görüştük vb..."
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  className="w-full p-3 rounded-xl border resize-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStoryModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow"
                >
                  Paylaş
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STORY MODAL */}
      {activeStoryView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActiveStoryView(null)}>
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserAvatar name={activeStoryView.agentName} avatar={activeStoryView.agentAvatar} className="w-9 h-9 rounded-full" />
                <div>
                  <p className="font-bold text-xs">{activeStoryView.agentName}</p>
                  <p className="text-[10px] text-amber-400">{activeStoryView.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(isBroker || activeStoryView.agentId === currentUser?.id) && (
                  <button
                    onClick={() => handleDeleteStory(activeStoryView.id)}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                    title="Hikayeyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setActiveStoryView(null)} className="text-slate-400 hover:text-white px-2">✕</button>
              </div>
            </div>
            {activeStoryView.mediaUrl && (
              <img src={activeStoryView.mediaUrl} alt="" className="w-full max-h-72 object-cover" />
            )}
            <div className="p-4 text-xs text-slate-200 leading-relaxed">
              {activeStoryView.content}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
