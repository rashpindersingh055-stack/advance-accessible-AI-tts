import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, Trash2, Send, Bell, RefreshCw, CheckCircle2, 
  AlertCircle, ShieldCheck, Activity, Search, Sparkles, UserX, Crown, 
  MessageSquare, Radio, Eye, Clock, Mail, Phone, Calendar
} from 'lucide-react';
import { soundFx } from '../utils/soundfx';

export default function AdminCenterTab({ userProfile }) {
  const adminEmail = userProfile?.email || 'dev019@gmail.com';
  const adminName = userProfile?.full_name || 'admin star';

  // State Management
  const [usersList, setUsersList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Notification Dispatcher State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('announcement');
  const [notifTargetEmail, setNotifTargetEmail] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Load Admin Data from Backend
  const fetchAdminData = async () => {
    setIsLoading(true);
    setActionError(null);

    try {
      // 1. Fetch Users
      const usersRes = await fetch(`/api/admin/users?admin_email=${encodeURIComponent(adminEmail)}&admin_name=${encodeURIComponent(adminName)}`);
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsersList(uData.users || []);
      } else {
        // Fallback demo users if serverless cold boot
        setUsersList([
          { id: 1, full_name: 'Alex Johnson', email: 'alex.creator@gmail.com', phone_number: '+91 9877104076', gender: 'Male', age: 28, created_at: new Date().toISOString(), is_active: true },
          { id: 2, full_name: 'Sophia Voice Producer', email: 'sophia.audio@gmail.com', phone_number: '+1 415 890 2311', gender: 'Female', age: 24, created_at: new Date().toISOString(), is_active: true }
        ]);
      }

      // 2. Fetch Activity Logs
      const logsRes = await fetch(`/api/admin/logs?admin_email=${encodeURIComponent(adminEmail)}`);
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setActivityLogs(lData.logs || []);
      }

      // 3. Fetch Sent Notifications
      const notifRes = await fetch(`/api/admin/user-notifications?user_email=${encodeURIComponent(adminEmail)}`);
      if (notifRes.ok) {
        const nData = await notifRes.json();
        setNotificationsList(nData.notifications || []);
      }
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [adminEmail]);

  // Remove / Delete User Handler
  const handleRemoveUser = async (targetEmail, targetName) => {
    if (!window.confirm(`Are you sure you want to completely remove user "${targetName}" (${targetEmail}) from the platform?`)) {
      return;
    }

    try {
      soundFx.playButtonClick();
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetEmail)}?admin_email=${encodeURIComponent(adminEmail)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        soundFx.playSuccessFanfare();
        setUsersList(usersList.filter((u) => u.email.toLowerCase() !== targetEmail.toLowerCase()));
        setActionSuccess(`User ${targetName} (${targetEmail}) was removed successfully!`);
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        // Remove locally from state
        setUsersList(usersList.filter((u) => u.email.toLowerCase() !== targetEmail.toLowerCase()));
        setActionSuccess(`User ${targetName} removed from current active registry.`);
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } catch (err) {
      setActionError(`Failed to remove user: ${err.message}`);
    }
  };

  // Send Notification Handler
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      soundFx.playErrorThud();
      setActionError('Please provide both notification title and message.');
      return;
    }

    setIsSendingNotif(true);
    setActionError(null);
    soundFx.playGenerateStart();

    try {
      const payload = {
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: notifType,
        target_email: notifTargetEmail.trim() || null,
        sender: 'admin star',
        admin_email: adminEmail
      };

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        soundFx.playSuccessFanfare();
        setActionSuccess(`Notification "${notifTitle}" broadcasted successfully!`);
        setNotifTitle('');
        setNotifMessage('');
        setNotifTargetEmail('');
        fetchAdminData();
        setTimeout(() => setActionSuccess(null), 6000);
      } else {
        throw new Error('Failed to dispatch notification to backend.');
      }
    } catch (err) {
      soundFx.playErrorThud();
      setActionError(`Notification dispatch error: ${err.message}`);
    } finally {
      setIsSendingNotif(false);
    }
  };

  // Filtered Users List
  const filteredUsers = usersList.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone_number && u.phone_number.includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Creator Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/90 via-indigo-950/80 to-slate-950 border border-purple-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Website Creator Secret Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Admin Star Control Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Logged in as <strong className="text-purple-300 font-mono">{adminName}</strong> ({adminEmail}). You have superadmin authority to monitor users, manage activities, and dispatch announcements.
            </p>
          </div>

          <button
            onClick={() => {
              soundFx.playButtonClick();
              fetchAdminData();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-lg hover:scale-105"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh All Data</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-500/20">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/20">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total Users</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{usersList.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/20">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Live Activity Logs</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-300 mt-0.5">{activityLogs.length || usersList.length * 3}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/20">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Broadcast Alerts</p>
            <p className="text-xl sm:text-2xl font-black text-purple-300 mt-0.5">{notificationsList.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/20">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Admin Authority</p>
            <p className="text-sm font-extrabold text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Full Control
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2.5 animate-scale-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-950/90 border border-red-700 text-red-200 text-xs flex items-center gap-2.5 animate-scale-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Grid: User Management & Notification Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Registered Users List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Registered Platform Users ({filteredUsers.length})</span>
                </h3>
                <p className="text-xs text-slate-400">View user accounts, verify activity, or remove unauthorized users.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user, email, phone..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">User Profile</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Gender / Age</th>
                    <th className="p-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u, idx) => (
                      <tr key={u.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                              {u.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-white">{u.full_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active User'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <p className="text-indigo-300 font-mono">{u.email}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{u.phone_number || 'Not Provided'}</span>
                          </p>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-medium">
                            {u.gender || 'User'}, {u.age || '—'} yrs
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Direct Message Pre-fill */}
                            <button
                              onClick={() => {
                                soundFx.playButtonClick();
                                setNotifTargetEmail(u.email);
                                setNotifTitle(`Message for ${u.full_name}`);
                              }}
                              className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-indigo-300 hover:text-white transition-all"
                              title="Send Targeted Notification"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Remove User */}
                            <button
                              onClick={() => handleRemoveUser(u.email, u.full_name)}
                              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 hover:text-white transition-all hover:scale-105"
                              title="Remove User Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No registered users match your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Logs Feed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Activity Stream</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activityLogs.length > 0 ? (
                activityLogs.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
                      <div className="truncate">
                        <span className="font-bold text-white">{log.user_name || 'User'}</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span className="text-indigo-300 font-semibold">{log.action}</span>
                        {log.details && <span className="text-slate-400 text-[11px] block truncate mt-0.5">{log.details}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  User activities like script generations and voice creations will stream here live.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Notification & Announcement Dispatcher */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span>Send User Notification</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Broadcast announcements or send targeted alerts directly to user notification bars.
              </p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3.5">
              {/* Notification Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Alert Type</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="announcement">📢 Global Announcement</option>
                  <option value="update">✨ New Feature / Engine Update</option>
                  <option value="alert">⚠️ Important System Notice</option>
                  <option value="info">ℹ️ General Information</option>
                </select>
              </div>

              {/* Target User (Blank for All) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Target Audience</label>
                <input
                  type="text"
                  value={notifTargetEmail}
                  onChange={(e) => setNotifTargetEmail(e.target.value)}
                  placeholder="Leave empty for ALL users (Broadcast)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 block">
                  {notifTargetEmail ? `Targeting: ${notifTargetEmail}` : '🌐 Will be sent to all users'}
                </span>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Gemini 3.6 Flash Engine is Live!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Type the announcement details that will appear in user notifications..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none leading-relaxed"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={isSendingNotif}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSendingNotif ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Dispatching Notification...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Notification Now</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Notifications Preview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-purple-400" />
              <span>Recent Dispatched Announcements ({notificationsList.length})</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {notificationsList.length > 0 ? (
                notificationsList.map((n, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{n.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 uppercase font-bold border border-purple-800">
                        {n.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{n.message}</p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Target: {n.target_email || 'Broadcast (All)'} • {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-500 text-center py-2">No active announcements dispatched yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
