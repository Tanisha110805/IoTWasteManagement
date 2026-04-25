/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, AlertTriangle, CheckCircle, ThermometerSun, Droplets, Activity, TrendingUp, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = '/api';
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API}/dashboard`, auth());
      setData(res.data);
      if (!selectedBin && res.data.bins.length > 0) setSelectedBin(res.data.bins[0].id);
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async (binId) => {
    try {
      const res = await axios.get(`${API}/bins/${binId}/history`, auth());
      setHistory(res.data.history.map(h => ({
        time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        level: h.level,
      })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchDashboard(); const t = setInterval(fetchDashboard, 5000); return () => clearInterval(t); }, []);
  useEffect(() => { if (selectedBin) fetchHistory(selectedBin); }, [selectedBin]);

  if (!data) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  const { bins, stats } = data;

  const statCards = [
    { label: 'Total Bins', value: stats.totalBins, icon: Trash2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Critical', value: stats.criticalBins, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Warning', value: stats.warningBins, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Normal', value: stats.normalBins, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Avg Fill', value: `${stats.avgLevel}%`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-sm shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-md ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Active Bins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bins.map(bin => {
              const active = selectedBin === bin.id;
              const isCrit = bin.level >= 80;
              const isWarn = bin.level >= 50 && bin.level < 80;
              const colorClass = isCrit ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <div 
                  key={bin.id} 
                  onClick={() => setSelectedBin(bin.id)}
                  className={`card cursor-pointer transition-colors ${active ? 'ring-2 ring-emerald-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{bin.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-md text-white font-medium ${colorClass}`}>
                      {bin.level}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                    <MapPin className="h-4 w-4" /> {bin.location}
                  </p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                    <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${bin.level}%` }}></div>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500">
                    {bin.temperature != null && <span className="flex items-center gap-1"><ThermometerSun className="h-4 w-4" /> {bin.temperature}°C</span>}
                    {bin.humidity != null && <span className="flex items-center gap-1"><Droplets className="h-4 w-4" /> {bin.humidity}%</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card h-96 sticky top-20 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Fill Level History</h2>
          {history.length > 0 ? (
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} domain={[0, 100]} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="level" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">No data selected</div>
          )}
        </div>
      </div>
    </div>
  );
}
