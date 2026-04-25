import { useEffect, useState } from 'react';
import axios, { API, auth } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/analytics`, auth()).then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

  const { perBin, distribution } = data;
  const pieData = [
    { name: 'Low (0-25%)', value: distribution.low || 0 },
    { name: 'Moderate (25-50%)', value: distribution.moderate || 0 },
    { name: 'High (50-75%)', value: distribution.high || 0 },
    { name: 'Critical (75%+)', value: distribution.critical || 0 },
  ];
  const radarData = perBin.map(b => ({ bin: b.name, avg: b.avg_level || 0, max: b.max_level || 0 }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Average vs Max Fill Level</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perBin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip />
                <Bar dataKey="avg_level" fill="#10b981" name="Average" />
                <Bar dataKey="max_level" fill="#f59e0b" name="Maximum" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Fill Level Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Bin Performance Radar</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="65%">
                <PolarGrid />
                <PolarAngleAxis dataKey="bin" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Average" dataKey="avg" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Radar name="Maximum" dataKey="max" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                <Legend />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Bin Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="py-4 px-6 text-sm font-semibold">Bin Name</th>
                  <th className="py-4 px-6 text-sm font-semibold">Average</th>
                  <th className="py-4 px-6 text-sm font-semibold">Maximum</th>
                  <th className="py-4 px-6 text-sm font-semibold">Minimum</th>
                  <th className="py-4 px-6 text-sm font-semibold">Readings</th>
                </tr>
              </thead>
              <tbody>
                {perBin.map((b, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-6 font-medium">{b.name}</td>
                    <td className="py-4 px-6 text-slate-500">{b.avg_level}%</td>
                    <td className="py-4 px-6 font-semibold text-red-500">{b.max_level}%</td>
                    <td className="py-4 px-6 font-semibold text-emerald-500">{b.min_level}%</td>
                    <td className="py-4 px-6 text-slate-500">{b.readings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
