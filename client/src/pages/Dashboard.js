import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard');
      setDashData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-xl text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar - Fixed Top */}
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
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-4 py-1.5 rounded-lg 
                       text-sm font-semibold hover:bg-gray-100 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="flex pt-16">

        {/* Sidebar - Fixed */}
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
                    ${window.location.pathname === item.path
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
        <main className="ml-56 flex-1 p-6 min-h-[calc(100vh-64px)]">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow text-center">
              <p className="text-gray-500 text-sm mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashData?.totalCustomers || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow text-center">
              <p className="text-gray-500 text-sm mb-1">Active Loans</p>
              <p className="text-3xl font-bold text-blue-600">
                {dashData?.activeLoans || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow text-center">
              <p className="text-gray-500 text-sm mb-1">Total Loan Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{dashData?.stats?.totalLoanAmount?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow text-center">
              <p className="text-gray-500 text-sm mb-1">Total Pending</p>
              <p className="text-2xl font-bold text-red-500">
                ₹{dashData?.stats?.totalPending?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Recent Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Recent Loans */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Recent Loans
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="text-left px-3 py-2 rounded-l-lg w-1/3">
                      Name
                    </th>
                    <th className="text-center px-3 py-2 w-1/3">
                      Amount
                    </th>
                    <th className="text-center px-3 py-2 rounded-r-lg w-1/3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashData?.recentLoans?.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-gray-400">
                        No loans yet
                      </td>
                    </tr>
                  )}
                  {dashData?.recentLoans?.map((loan) => (
                    <tr key={loan._id} 
                        className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800 w-1/3">
                        {loan.customerId?.name || 'N/A'}
                      </td>
                      <td className="px-3 py-3 text-center w-1/3">
                        ₹{loan.amount?.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center w-1/3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${loan.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : loan.status === 'Closed'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-100 text-yellow-700'}`}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Recent Payments
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="text-left px-3 py-2 rounded-l-lg w-1/3">
                      Name
                    </th>
                    <th className="text-center px-3 py-2 w-1/3">
                      Amount
                    </th>
                    <th className="text-center px-3 py-2 rounded-r-lg w-1/3">
                      Mode
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashData?.recentPayments?.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-gray-400">
                        No payments yet
                      </td>
                    </tr>
                  )}
                  {dashData?.recentPayments?.map((payment) => (
                    <tr key={payment._id}
                        className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800 w-1/3">
                        {payment.loanId?.customerId?.name || 'N/A'}
                      </td>
                      <td className="px-3 py-3 text-center text-green-600 
                                     font-semibold w-1/3">
                        ₹{payment.paidAmount?.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center w-1/3">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 
                                         rounded-full text-xs font-medium">
                          {payment.paymentMode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}