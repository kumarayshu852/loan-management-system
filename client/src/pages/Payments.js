import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await API.get('/payments');
      setPayments(res.data);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-700 text-white
                      px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="bg-white text-blue-700 w-9 h-9 rounded-lg flex
                          items-center justify-center font-bold text-lg">
            ₹
          </div>
          <span className="text-xl font-bold">LMS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">👤 {user?.name}</span>
          <button onClick={handleLogout}
            className="bg-white text-blue-700 px-4 py-1.5 rounded-lg
                       text-sm font-semibold hover:bg-gray-100 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="flex pt-16">

        {/* Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-56
                          bg-blue-800 text-white p-4 overflow-y-auto z-40">
          <ul className="space-y-1 mt-2">
            {[
              { name: 'Dashboard', path: '/dashboard', icon: '📊' },
              { name: 'Customers', path: '/customers', icon: '👥' },
              { name: 'Loans', path: '/loans', icon: '💰' },
              { name: 'Payments', path: '/payments', icon: '💳' },
              { name: 'Reports', path: '/reports', icon: '📈' },
            ].map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg
                    flex items-center gap-3 text-sm font-medium transition
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
        <main className="ml-56 flex-1 p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              All Payments
            </h2>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg
                            text-sm font-medium">
              Total: {payments.length} payments
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow text-center">
              <p className="text-gray-500 text-sm mb-1">Total Payments</p>
              <p className="text-3xl font-bold text-gray-800">
                {payments.length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow text-center">
              <p className="text-gray-500 text-sm mb-1">Total Received</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{payments
                  .reduce((sum, p) => sum + p.paidAmount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow text-center">
              <p className="text-gray-500 text-sm mb-1">Cash Payments</p>
              <p className="text-2xl font-bold text-blue-600">
                {payments.filter(p => p.paymentMode === 'Cash').length}
              </p>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <p className="text-center py-10 text-gray-400">Loading...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b">
                    <th className="text-left px-6 py-3">#</th>
                    <th className="text-left px-6 py-3">Customer</th>
                    <th className="text-left px-6 py-3">Loan Amount</th>
                    <th className="text-left px-6 py-3">Paid Amount</th>
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-left px-6 py-3">Mode</th>
                    <th className="text-left px-6 py-3">Note</th>
                    <th className="text-center px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="8"
                          className="text-center py-10 text-gray-400">
                        No payments yet
                      </td>
                    </tr>
                  )}
                  {payments.map((p, i) => (
                    <tr key={p._id}
                        className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {p.loanId?.customerId?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        ₹{p.loanId?.amount?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-green-600 font-semibold">
                        ₹{p.paidAmount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(p.paymentDate)
                          .toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs
                          font-medium
                          ${p.paymentMode === 'Cash'
                            ? 'bg-green-50 text-green-600'
                            : p.paymentMode === 'UPI'
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-blue-50 text-blue-600'}`}>
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {p.note || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            navigate(`/loans/${p.loanId?._id}`)}
                          className="bg-blue-50 text-blue-600 px-3 py-1
                                     rounded-lg text-xs font-medium
                                     hover:bg-blue-100">
                          View Loan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}