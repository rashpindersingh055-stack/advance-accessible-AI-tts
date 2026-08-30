import React, { useState, useEffect } from 'react';
import { 
  Bell, X, CheckCheck, Sparkles, AlertTriangle, Info, Radio, 
  Clock, ShieldCheck, Trash2, CheckCircle2, MessageSquare
} from 'lucide-react';
import { soundFx } from '../utils/soundfx';

export default function NotificationsModal({
  isOpen,
  onClose,
  userProfile,
  onUnreadCountChange
}) {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vm_read_notifs') || '[]');
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const userEmail = userProfile?.email || '';

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/user-notifications?user_email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.notifications || [];
        setNotifications(items);
        
        // Calculate unread
        const unread = items.filter((n) => !readIds.includes(n.id)).length;
        if (onUnreadCountChange) onUnreadCountChange(unread);
      } else {
        // Default welcome notification if no backend
        const defaultNotif = [
          {
            id: 101,
            title: 'Welcome to Vision Max Intelligence Neural Studio v2.0!',
            message: 'Experience 30 Google Gemini neural voices, AI Speech Director with Gemini 3.6 Flash, and lossless 24kHz audio mastering.',
            type: 'announcement',
            sender: 'admin star',
            created_at: new Date().toISOString()
          }
        ];
        setNotifications(defaultNotif);
        if (onUnreadCountChange) onUnreadCountChange(defaultNotif.length);
      }
    } catch (e) {
      console.info('Notifications fetch:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    soundFx.playButtonClick();
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem('vm_read_notifs', JSON.stringify(allIds));
    if (onUnreadCountChange) onUnreadCountChange(0);
  };

  const markSingleAsRead = (id) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem('vm_read_notifs', JSON.stringify(updated));
    const unread = notifications.filter((n) => !updated.includes(n.id)).length;
    if (onUnreadCountChange) onUnreadCountChange(unread);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>System Notifications</span>
              </h2>
              <p className="text-xs text-slate-400">Official updates &amp; announcements from Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playButtonClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const isRead = readIds.includes(notif.id);
              return (
                <div
                  key={notif.id}
                  onClick={() => markSingleAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isRead
                      ? 'bg-slate-950/60 border-slate-800/80 opacity-80'
                      : 'bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-950/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {!isRead && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>}
                      <span className="font-extrabold text-sm text-white">{notif.title}</span>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 border ${
                      notif.type === 'alert'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : notif.type === 'update'
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                    }`}>
                      {notif.type || 'announcement'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{notif.message}</p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                    <span>Sender: <strong className="text-indigo-400">{notif.sender || 'admin star'}</strong></span>
                    <span>{notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Just now'}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">No notifications right now.</p>
              <p className="text-[11px] text-slate-500">You are all caught up with the latest updates!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
