import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Customers', path: '/customers', icon: '👥' },
    { name: 'Loans', path: '/loans', icon: '💰' },
    { name: 'Payments', path: '/payments', icon: '💳' },
    { name: 'Reports', path: '/reports', icon: '📈' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-700
                      text-white px-4 py-3 flex justify-between
                      items-center shadow">
        <div className="flex items-center gap-3">
          {/* Hamburger - Mobile Only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-white text-2xl font-bold
                       w-8 h-8 flex items-center justify-center">
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <div className="bg-white text-blue-700 w-8 h-8 rounded-lg
                          flex items-center justify-center
                          font-bold text-lg">
            ₹
          </div>
          <span className="text-lg font-bold">LMS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm hidden sm:block">👤 {user?.name}</span>
          <span className="text-sm sm:hidden">👤</span>
          <button onClick={handleLogout}
            className="bg-white text-blue-700 px-3 py-1.5 rounded-lg
                       text-sm font-semibold hover:bg-gray-100
                       transition">
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex pt-14">

        {/* Sidebar */}
        <aside className={`
          fixed left-0 top-14 h-[calc(100vh-56px)]
          bg-blue-800 text-white p-4 overflow-y-auto z-40
          transition-transform duration-300
          w-56
          ${sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'}
        `}>
          <ul className="space-y-1 mt-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg
                    flex items-center gap-3 text-sm font-medium
                    transition
                    ${location.pathname === item.path
                      ? 'bg-blue-600'
                      : 'hover:bg-blue-600'}`}>
                  <span>{item.icon}</span>
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="w-full md:ml-56 flex-1 p-4 md:p-6
                         min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>
    </div>
  );
}