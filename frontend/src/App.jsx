import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Collections from './pages/Collections';
import Simulator from './pages/Simulator';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [dark, setDark]   = useState(localStorage.getItem('dark') === 'true');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('dark', dark);
  }, [dark]);

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login setToken={setToken} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen overflow-hidden text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">
        
        {/* Sidebar Container */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <div className="w-64 h-full">
            <Sidebar setToken={setToken} dark={dark} setDark={setDark} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          
          {/* Header */}
          <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 min-h-[4rem] flex items-center px-4 sticky top-0 z-40">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 font-semibold text-lg">SmartBin Dashboard</h1>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/"              element={<Dashboard />} />
              <Route path="/map"           element={<MapView />} />
              <Route path="/analytics"     element={<Analytics />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/collections"   element={<Collections />} />
              <Route path="/simulator"     element={<Simulator />} />
              <Route path="*"              element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
