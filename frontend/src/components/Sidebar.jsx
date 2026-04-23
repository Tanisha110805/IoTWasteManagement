import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, Bell, Truck, Play, LogOut, Trash2, Sun, Moon, X } from 'lucide-react';

const links = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map',           icon: Map,             label: 'Map View' },
  { to: '/analytics',     icon: BarChart3,       label: 'Analytics' },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
  { to: '/collections',   icon: Truck,           label: 'Collections' },
  { to: '/simulator',     icon: Play,            label: 'Simulator' },
];

export default function Sidebar({ setToken, dark, setDark, setIsOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  return (
    <aside className="h-full w-64 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-emerald-500" />
          <span className="font-bold text-lg">SmartBin</span>
        </div>
        <button className="md:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setIsOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors
              ${isActive 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <button onClick={() => setDark(!dark)} className="flex items-center gap-3 w-full px-3 py-2 rounded-md font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-md font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
