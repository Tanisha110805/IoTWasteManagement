/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';

const API = '/api';
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchN = async () => {
    try { const res = await axios.get(`${API}/notifications`, auth()); setNotifications(res.data.notifications); } catch (e) { console.error(e); }
  };
  const markAllRead = async () => {
    try { await axios.put(`${API}/notifications/read-all`, {}, auth()); fetchN(); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchN();
    return () => { mounted = false; };
  }, []);

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">You have {unread} unread notifications.</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-primary flex items-center gap-2">
            <Check className="h-4 w-4" /> Mark All as Read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {['all', 'critical', 'warning', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm capitalize ${filter === f ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-slate-500">No notifications found.</p>
        ) : (
          filtered.map(n => {
            const isCrit = n.type === 'critical';
            const isWarn = n.type === 'warning';
            const Icon = isCrit ? AlertTriangle : isWarn ? AlertCircle : Info;
            const colorClass = isCrit ? 'text-red-500 bg-red-100 dark:bg-red-900/30' : isWarn ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' : 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';

            return (
              <div key={n.id} className={`card flex gap-4 items-start ${n.is_read ? 'opacity-60' : 'border-l-4 border-l-emerald-500'}`}>
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{n.message}</p>
                  <p className="text-sm text-slate-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
