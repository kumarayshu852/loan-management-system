import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart,
  Pie, Cell
} from 'recharts';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = from && to ? `?from=${from}&to=${to}` : '';
      const res = await API.get(`/reports${params}`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (!from || !to) {
      toast.error('From aur To date dono select karo!');
      return;
    }
    fetchReports();
  };

  const handleClear = () => {
    setFrom('');
    setTo('');
    setTimeout(() => fetchReports(), 100);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Bar chart data
  const barData = [
    {
      name: 'Total Loan',
      amount: data?.summary?.totalLoanAmount || 0
    },
    {
      name: 'Total Paid',
      amount: data?.summary?.totalPaid || 0
    },
    {
      name: 'Pending',
      amount: data?.summary?.totalPending || 0
    },
    {
      name: 'Interest',
      amount: data?.summary?.totalInterest || 0
    },
  ];

  // Pie chart data
  const pieData = data?.paymentModeStats?.map(p => ({
    name: p._id,
    value: p.total
  })) || [];

  // Monthly chart data
  const monthlyData = data?.monthlyPayments?.map(m => ({
    name: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
    amount: m.total,
    count: m.count
  })) || [];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-700
                      text-white px-6 py-4 flex justify-between
                      items-center shadow">
        <div className="flex items-center gap-3">
          <div className="bg-white text-blue-700 w-9 h-9 rounded-lg
                          flex items-center justify-center font-bold
                          text-lg">
            ₹
          </div>
          <span className="text-xl font-bold">LMS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">👤 {user?.name}</span>
          <button onClick={handleLogout}
            className="bg-white text-blue-700 px-4 py-1.5 rounded-lg
                       text-sm font-semibold hover:bg-gray-100
                       transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="flex pt-16">

        {/* Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)]
                          w-56 bg-blue-800 text-white p-4
                          overflow-y-auto z-40">
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
        <main className="ml-56 flex-1 p-6">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Reports & Analytics
          </h2>

          {/* Date Filter */}
          <div className="bg-white rounded-xl shadow p-4 mb-6
                          flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-gray-600 text-sm
                                font-medium mb-1">
                From Date
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3
                           py-2 focus:outline-none
                           focus:ring-2 focus:ring-blue-500 text-sm"/>
            </div>
            <div>
              <label className="block text-gray-600 text-sm
                                font-medium mb-1">
                To Date
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3
                           py-2 focus:outline-none
                           focus:ring-2 focus:ring-blue-500 text-sm"/>
            </div>
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg
                         text-sm font-semibold hover:bg-blue-700
                         transition">
              Filter
            </button>
            <button
              onClick={handleClear}
              className="border border-gray-300 text-gray-600 px-5
                         py-2 rounded-lg text-sm font-semibold
                         hover:bg-gray-50 transition">
              Clear
            </button>
          </div>

          {loading ? (
            <p className="text-center py-10 text-gray-400">
              Loading...
            </p>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow text-center">
                  <p className="text-gray-500 text-sm mb-1">
                    Total Customers
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {data?.summary?.totalCustomers || 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow text-center">
                  <p className="text-gray-500 text-sm mb-1">
                    Total Loan
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{data?.summary?.totalLoanAmount
                      ?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow text-center">
                  <p className="text-gray-500 text-sm mb-1">
                    Total Received
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{data?.summary?.totalPaid
                      ?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow text-center">
                  <p className="text-gray-500 text-sm mb-1">
                    Total Pending
                  </p>
                  <p className="text-2xl font-bold text-red-500">
                    ₹{data?.summary?.totalPending
                      ?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Bar Chart */}
                <div className="bg-white rounded-xl shadow p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    📊 Loan vs Collection
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val) =>
                          `₹${val.toLocaleString()}`}/>
                      <Bar dataKey="amount" fill="#3b82f6"
                           radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-xl shadow p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    💳 Payment Mode Wise
                  </h3>
                  {pieData.length === 0 ? (
                    <p className="text-center text-gray-400 py-16">
                      No payments yet
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          dataKey="value"
                          label={({ name, value }) =>
                            `${name}: ₹${value.toLocaleString()}`}>
                          {pieData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}/>
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) =>
                            `₹${val.toLocaleString()}`}/>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Monthly Chart */}
              <div className="bg-white rounded-xl shadow p-5 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  📅 Monthly Collections
                </h3>
                {monthlyData.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">
                    No data yet
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val) =>
                          `₹${val.toLocaleString()}`}/>
                      <Legend />
                      <Bar dataKey="amount" name="Amount Collected"
                           fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Customer Wise Table */}
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  👥 Customer Wise Loans
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="text-left px-4 py-2 rounded-l-lg">
                        #
                      </th>
                      <th className="text-left px-4 py-2">Customer</th>
                      <th className="text-left px-4 py-2">Phone</th>
                      <th className="text-left px-4 py-2">Loan</th>
                      <th className="text-left px-4 py-2">Paid</th>
                      <th className="text-left px-4 py-2">Remaining</th>
                      <th className="text-left px-4 py-2">Interest</th>
                      <th className="text-left px-4 py-2 rounded-r-lg">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.customerWise?.length === 0 && (
                      <tr>
                        <td colSpan="8"
                            className="text-center py-6 text-gray-400">
                          No data found
                        </td>
                      </tr>
                    )}
                    {data?.customerWise?.map((loan, i) => (
                      <tr key={loan._id}
                          className="border-b last:border-0
                                     hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium
                                       text-gray-800">
                          {loan.customerId?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {loan.customerId?.phone || '—'}
                        </td>
                        <td className="px-4 py-3">
                          ₹{loan.amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-green-600
                                       font-medium">
                          ₹{loan.totalPaid?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-red-500
                                       font-medium">
                          ₹{loan.remaining?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-orange-500">
                          {loan.interestRate}%
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full
                            text-xs font-semibold
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}