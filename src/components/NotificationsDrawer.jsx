import React from 'react';
import { formatDate } from '../utils/formatters';
import { 
  X, Bell, CheckCheck, Trash2, Sparkles, 
  ArrowRight, Flame, Building, User, ExternalLink
} from './Icons';

export default function NotificationsDrawer({ 
  isOpen, 
  onClose, 
  notifications = [], 
  onMarkRead, 
  onMarkAllRead,
  onSelectNotification
}) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-dark-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-left text-slate-800">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between safe-top">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-black text-base text-white">Bildirimler & Eşleşmeler</h3>
                <p className="text-xs text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} yeni okunmamış eşleşme var` : 'Tüm bildirimler okundu'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">
              Toplam {notifications.length} Bildirim
            </span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 transition"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tümünü Okundu Say</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <Bell className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700">Henüz Bildirim Yok</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Sistemde yeni bir portföy veya talep eşleşmesi olduğunda anında burada göreceksiniz.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead && onMarkRead) onMarkRead(notif.id);
                    if (onSelectNotification) onSelectNotification(notif);
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                    notif.isRead
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-amber-50/60 border-amber-300 hover:border-amber-400 shadow-xs'
                  }`}
                >
                  {!notif.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute top-3.5 right-3.5 ring-2 ring-white" />
                  )}

                  <div className="flex items-start gap-2.5 pr-4">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-black text-xs text-slate-900 truncate">
                          {notif.title}
                        </span>
                        {notif.score && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 shrink-0">
                            %{notif.score}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
                        <span>{formatDate(notif.createdAt)}</span>
                        <span className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                          İncele <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Altın Emlak Sivas • Gerçek Zamanlı Eşleştirme Sistemi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
