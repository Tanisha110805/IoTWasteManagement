import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Play, Square } from 'lucide-react';

const API = 'http://localhost:3001/api';
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Simulator() {
  const [running, setRunning] = useState(false);
  const [interval, setIntervalMs] = useState(3);
  const [log, setLog] = useState([]);
  const timerRef = useRef(null);
  const logRef = useRef(null);

  const addLog = (msg) => {
    const ts = new Date().toLocaleTimeString();
    setLog(prev => [...prev.slice(-50), { ts, msg }]);
  };

  const tick = async () => {
    try {
      await axios.post(`${API}/simulator/tick`, {}, auth());
      addLog('Tick: Generated data for all bins');
    } catch {
      addLog('Error: Failed to connect to server');
    }
  };

  const start = () => {
    setRunning(true);
    addLog(`Started simulator (${interval}s interval)`);
    tick();
    timerRef.current = window.setInterval(tick, interval * 1000);
  };

  const stop = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    addLog('Stopped simulator');
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Simulator</h1>
      <p className="text-slate-500">Generate fake telemetry data to test the dashboard.</p>

      <div className="card flex flex-wrap gap-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Interval (seconds)</label>
          <input
            type="number" min="1" max="60"
            value={interval} disabled={running}
            onChange={e => setIntervalMs(parseInt(e.target.value) || 3)}
            className="w-24 p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
          />
        </div>

        {!running ? (
          <button onClick={start} className="btn-primary flex items-center gap-2">
            <Play className="h-5 w-5" /> Start Simulation
          </button>
        ) : (
          <button onClick={stop} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
            <Square className="h-5 w-5" /> Stop Simulation
          </button>
        )}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="bg-slate-800 text-slate-300 px-4 py-2 text-sm font-mono flex justify-between">
          <span>simulator.log</span>
          <span>{log.length} entries</span>
        </div>
        <div ref={logRef} className="h-64 overflow-y-auto bg-slate-900 text-emerald-400 p-4 font-mono text-sm space-y-1">
          {log.length === 0 && <p className="text-slate-500">Waiting to start...</p>}
          {log.map((l, i) => (
            <div key={i}>
              <span className="text-slate-500">[{l.ts}]</span> {l.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
