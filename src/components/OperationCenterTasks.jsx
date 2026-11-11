import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { 
  CheckCircle2, Clock, AlertTriangle, Plus, 
  Calendar, UserCheck, Tag, Trash2, ArrowRight, 
  Trophy, BarChart3, Filter, Check, Flame, Sparkles
} from 'lucide-react';

export default function OperationCenterTasks() {
  const { currentUser, isBroker } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs: 'board', 'leaderboard', 'reports'
  const [activeTab, setActiveTab] = useState('board');
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, next7, overdue

  // New Task Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: currentUser?.id || '',
    priority: 'orta', // yuksek, orta, dusuk
    dueDate: new Date().toISOString().split('T')[0],
    category: 'genel',
    points: 50
  });

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Görevler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setNewTask(prev => ({ 
          ...prev, 
          assignedTo: isBroker ? (prev.assignedTo || data[0].id) : (currentUser?.id || data[0].id) 
        }));
      }
    } catch (err) {}
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    // Kural: Admin herkese görev atayabilir ve puan belirler.
    // Düz kullanıcılar sadece kendilerine görev verebilir ve bu görevler 0 puan getirir.
    const isBrokerAssigned = Boolean(isBroker);
    const targetUserId = isBroker ? newTask.assignedTo : currentUser?.id;
    const assignedUser = users.find(u => u.id === targetUserId) || currentUser;
    const taskPoints = isBrokerAssigned ? (Number(newTask.points) || 50) : 0;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          assignedTo: targetUserId,
          assignedToName: assignedUser ? assignedUser.name : 'Atanmamış',
          assignedBy: currentUser?.id,
          assignedByName: currentUser?.name || 'Yönetici',
          isBrokerAssigned,
          points: taskPoints
        })
      });
      const created = await res.json();
      setTasks(prev => [created, ...prev]);
      setShowModal(false);
      setNewTask({
        title: '',
        description: '',
        assignedTo: isBroker ? (users[0]?.id || '') : (currentUser?.id || ''),
        priority: 'orta',
        dueDate: new Date().toISOString().split('T')[0],
        category: 'genel',
        points: 50
      });
    } catch (err) {
      alert('Görev oluşturulamadı: ' + err.message);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error('Durum güncellenemedi:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {}
  };

  // Filter Tasks by Time
  const nowStr = new Date().toISOString().split('T')[0];
  const next7Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredTasks = tasks.filter(t => {
    if (timeFilter === 'today') return t.dueDate === nowStr;
    if (timeFilter === 'next7') return t.dueDate >= nowStr && t.dueDate <= next7Date;
    if (timeFilter === 'overdue') return t.dueDate < nowStr && t.status !== 'done';
    return true;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  // Agent Leaderboard Stats - Puanlama Motoru
  const agentScoreMap = {};
  users.forEach(u => {
    const userDoneTasks = tasks.filter(t => t.assignedTo === u.id && t.status === 'done');
    // Sadece admin/broker tarafından atanan puanlı görevler puan kazandırır
    const adminTasksDone = userDoneTasks.filter(t => t.isBrokerAssigned || (Number(t.points) > 0));
    const selfTasksDone = userDoneTasks.filter(t => !t.isBrokerAssigned && (!t.points || Number(t.points) === 0));
    const earnedTaskPoints = adminTasksDone.reduce((sum, t) => sum + (Number(t.points) || 50), 0);
    const totalScore = (u.activeListingsCount || 0) * 10 + earnedTaskPoints;

    agentScoreMap[u.id] = {
      user: u,
      completedTasks: userDoneTasks.length,
      adminTasksDone: adminTasksDone.length,
      selfTasksDone: selfTasksDone.length,
      earnedTaskPoints,
      score: totalScore
    };
  });
  const leaderboardList = Object.values(agentScoreMap).sort((a, b) => b.score - a.score);

  return (
    <div className="pb-24 pt-3 max-w-7xl mx-auto px-3 sm:px-4 space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Operasyon Merkezi</span>
            <span>🚀</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Tüm ofis görevleri, otopilot alarmları ve danışman performans takibi.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>+ Yeni Görev Ata</span>
        </button>
      </div>

      {/* Main Tabs: Görev Panosu, Şampiyonlar Ligi, Ofis Raporları */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'board', label: '📌 Görev Panosu', count: tasks.length },
          { id: 'leaderboard', label: '🏆 Şampiyonlar Ligi', count: users.length },
          { id: 'reports', label: '📊 Ofis Raporları', count: null }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: GÖREV PANOSU (KANBAN) */}
      {/* ======================================================== */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          {/* Quick Time Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'today', label: '📅 Bugünün Görevleri' },
              { id: 'next7', label: '⏳ Gelecek 7 Gün' },
              { id: 'overdue', label: '⚠️ Gecikenler' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl border transition shrink-0 ${
                  timeFilter === f.id
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            
            {/* Column 1: Yapılacaklar */}
            <div className="bg-slate-100/90 rounded-3xl p-3.5 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-black text-xs text-slate-800 flex items-center gap-1.5 uppercase">
                  <span>📌 Yapılacaklar</span>
                </span>
                <span className="text-xs font-black bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700">
                  {todoTasks.length}
                </span>
              </div>

              <div className="space-y-2.5 min-h-[300px]">
                {todoTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-medium">Bu alanda görev yok</div>
                ) : (
                  todoTasks.map(t => (
                    <TaskCard 
                      key={t.id} 
                      task={t} 
                      onMove={(status) => handleUpdateStatus(t.id, status)}
                      onDelete={() => handleDeleteTask(t.id)} 
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 2: İşlemde */}
            <div className="bg-blue-50/60 rounded-3xl p-3.5 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-black text-xs text-blue-900 flex items-center gap-1.5 uppercase">
                  <span>⚡ İşlemde</span>
                </span>
                <span className="text-xs font-black bg-white px-2.5 py-0.5 rounded-full border border-blue-200 text-blue-800">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="space-y-2.5 min-h-[300px]">
                {inProgressTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-blue-400 font-medium">Bu alanda görev yok</div>
                ) : (
                  inProgressTasks.map(t => (
                    <TaskCard 
                      key={t.id} 
                      task={t} 
                      onMove={(status) => handleUpdateStatus(t.id, status)}
                      onDelete={() => handleDeleteTask(t.id)} 
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Tamamlandı */}
            <div className="bg-emerald-50/60 rounded-3xl p-3.5 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-black text-xs text-emerald-900 flex items-center gap-1.5 uppercase">
                  <span>✅ Tamamlandı</span>
                </span>
                <span className="text-xs font-black bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 text-emerald-800">
                  {doneTasks.length}
                </span>
              </div>

              <div className="space-y-2.5 min-h-[300px]">
                {doneTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-emerald-400 font-medium">Bu alanda görev yok</div>
                ) : (
                  doneTasks.map(t => (
                    <TaskCard 
                      key={t.id} 
                      task={t} 
                      onMove={(status) => handleUpdateStatus(t.id, status)}
                      onDelete={() => handleDeleteTask(t.id)} 
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ŞAMPİYONLAR LİGİ (LEADERBOARD) */}
      {/* ======================================================== */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
              Ofis Danışman Şampiyonlar Ligi
            </h3>
          </div>

          <div className="space-y-2">
            {leaderboardList.slice(0, 10).map((item, idx) => (
              <div 
                key={item.user.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-amber-400 text-slate-950 shadow' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <UserAvatar user={item.user} className="w-10 h-10 rounded-xl" />
                  <div>
                    <p className="text-xs font-black text-slate-900">{item.user.name}</p>
                    <p className="text-[10px] text-slate-400">{item.user.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-amber-600 flex items-center justify-end gap-1">
                    <span>🏆</span>
                    <span>{item.score} Puan</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    ⭐ +{item.earnedTaskPoints} Görev Puanı ({item.adminTasksDone} Puanlı Görev)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {item.selfTasksDone} Bireysel Görev (0 P) • {item.user.activeListingsCount || 0} İlan
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: OFİS RAPORLARI */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500">Toplam Atanan Görev</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{tasks.length}</p>
            <p className="text-xs text-slate-400 mt-1">Ofis geneli tüm süreçler</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-emerald-600">Tamamlanma Oranı</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">
              {tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">{doneTasks.length} görev sonuçlandırıldı</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-rose-600">Geciken Görevler</p>
            <p className="text-3xl font-black text-rose-600 mt-2">
              {tasks.filter(t => t.dueDate < nowStr && t.status !== 'done').length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Acil takip gereken işler</p>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Yeni Görev Ata</span>
                <span>📋</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Görev Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Paşabey Dairesi Tapu Başvurusu"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Açıklama / İş Emri Detayı</label>
                <textarea
                  rows="2"
                  placeholder="Yapılacak işlemler, notlar..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Danışman Seçimi & Puan Sistemi (Admin vs Normal Kullanıcı) */}
              {isBroker ? (
                <div className="space-y-2 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/90">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                      <span>👑</span>
                      <span>Broker Görev & Puan Ataması</span>
                    </span>
                    <span className="text-[10px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                      Puanlı Görev
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Kime Atansın?</label>
                      <select
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role === 'broker' ? 'Broker' : 'Danışman'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Ödül Puanı</label>
                      <select
                        value={newTask.points}
                        onChange={(e) => setNewTask({ ...newTask, points: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-400 font-black bg-white text-amber-900"
                      >
                        <option value={25}>⭐ 25 Puan (Basit İşlem)</option>
                        <option value={50}>⭐ 50 Puan (Standart)</option>
                        <option value={100}>⭐ 100 Puan (Kritik / Tapu)</option>
                        <option value={150}>⭐ 150 Puan (Büyük Başarı)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-800 leading-tight">
                    💡 Danışman bu görevi tamamladığında Şampiyonlar Ligi puanına seçilen puan doğrudan yansır.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span>👤</span>
                      <span>Bireysel İş Emri</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">
                      0 Puan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Atanan: <strong>{currentUser?.name || 'Kendiniz'}</strong> (Kural gereği kendi kendinize açtığınız görevler kişisel ajandanız içindir ve lig puanı kazandırmaz).
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Öncelik</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="yuksek">🔴 Yüksek</option>
                    <option value="orta">🟡 Orta</option>
                    <option value="dusuk">🟢 Düşük</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 shadow"
                >
                  {isBroker ? 'Görevi Ata & Puanı Tanımla' : 'Görevi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Single Kanban Card Sub-Component
function TaskCard({ task, onMove, onDelete }) {
  const priorityColor = 
    task.priority === 'yuksek' ? 'bg-red-50 text-red-700 border-red-200' :
    task.priority === 'orta' ? 'bg-amber-50 text-amber-700 border-amber-200' :
    'bg-emerald-50 text-emerald-700 border-emerald-200';

  const hasPoints = (task.points > 0 || task.isBrokerAssigned);

  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:shadow transition group">
      <div className="flex items-start justify-between gap-1.5">
        <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug">
          {task.title}
        </h4>
        <button
          type="button"
          onClick={onDelete}
          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-0.5"
          title="Sil"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-normal">
          {task.description}
        </p>
      )}

      {/* Points & Assignee Badge */}
      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 gap-1 flex-wrap">
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-bold text-slate-800 truncate">{task.assignedToName || 'Danışman'}</span>
          {task.assignedByName && task.assignedByName !== task.assignedToName && (
            <span className="text-[9px] text-slate-400 truncate" title={`Atayan: ${task.assignedByName}`}>
              (✍️ {task.assignedByName.split(' ')[0]})
            </span>
          )}
        </div>

        {hasPoints ? (
          <span 
            className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] flex items-center gap-1 shadow-2xs shrink-0"
            title="Yönetici tarafından atanan puanlı görev"
          >
            <span>⭐</span>
            <span>+{task.points || 50} Puan</span>
          </span>
        ) : (
          <span 
            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 font-semibold text-[10px] shrink-0"
            title="Bireysel oluşturulan görev (Puan getirmez)"
          >
            👤 Bireysel (0 P)
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{task.dueDate}</span>
        </span>

        {/* Status Mover Buttons */}
        <div className="flex items-center gap-1">
          {task.status !== 'todo' && (
            <button
              onClick={() => onMove('todo')}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
              title="Yapılacaklara Taşı"
            >
              ←
            </button>
          )}
          {task.status !== 'in_progress' && (
            <button
              onClick={() => onMove('in_progress')}
              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold"
              title="İşleme Al"
            >
              ⚡
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => onMove('done')}
              className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-black flex items-center gap-0.5"
              title={hasPoints ? `Tamamla ve Danışmana +${task.points || 50} Puan Kazandır` : "Tamamlandı Olarak İşaretle"}
            >
              <span>✓</span>
              {hasPoints && <span className="text-[9px]">Puanı Al</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
