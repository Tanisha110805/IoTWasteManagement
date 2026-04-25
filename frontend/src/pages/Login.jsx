import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { username, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <Trash2 className="h-12 w-12 text-emerald-500 mb-2" />
          <h1 className="text-2xl font-bold text-slate-800">SmartBin Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text" required
              value={username} onChange={e => setUsername(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button type="submit" className="w-full btn-primary py-2 mt-4">Sign In</button>
        </form>
      </div>
    </div>
  );
}
