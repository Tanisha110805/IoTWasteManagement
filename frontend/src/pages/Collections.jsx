/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import axios, { API, auth } from '../api';
import { Truck, Plus, X } from 'lucide-react';


export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [bins, setBins]               = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [formBin, setFormBin]         = useState('');
  const [formDriver, setFormDriver]   = useState('');

  const fetchAll = async () => {
    try {
      const [c, d] = await Promise.all([
        axios.get(`${API}/collections`, auth()),
        axios.get(`${API}/dashboard`, auth()),
      ]);
      setCollections(c.data.collections);
      setBins(d.data.bins);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formBin) return;
    try {
      await axios.post(`${API}/collections`, { bin_id: formBin, collected_by: formDriver || 'Admin' }, auth());
      setShowForm(false); setFormBin(''); setFormDriver('');
      fetchAll();
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collection Log</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Record Collection'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold">New Collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Bin</label>
              <select
                value={formBin} onChange={e => setFormBin(e.target.value)} required
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
              >
                <option value="">Choose a bin...</option>
                {bins.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Collected By</label>
              <input
                value={formDriver} onChange={e => setFormDriver(e.target.value)}
                placeholder="Driver name"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Record</button>
        </form>
      )}

      <div className="space-y-4">
        {collections.length === 0 ? (
          <p className="text-slate-500">No collections recorded.</p>
        ) : (
          collections.map(c => (
            <div key={c.id} className="card flex gap-4 items-start">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                <Truck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{c.bin_name}</h3>
                <p className="text-slate-500">{c.bin_location}</p>
                <div className="flex gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span><strong>Driver:</strong> {c.collected_by}</span>
                  <span><strong>Level Before:</strong> {c.level_before}%</span>
                  <span><strong>Time:</strong> {new Date(c.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
