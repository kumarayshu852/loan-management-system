import { useState, useEffect } from 'react';
import API from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart,
  Pie, Cell, Legend
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

  // Bar chart data
  const barData = [
    {
      name: 'Loan',
      amount: data?.summary?.totalLoanAmount || 0
    },
    {
      name: 'Paid',
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
  })) || [];

  return (
    <Layout>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
        Reports & Analytics
      </h2>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg
                       text-sm font-semibold hover:bg-blue-700
                       transition">
            Filter
          </button>
          <button
            onClick={handleClear}
            className="border border-gray-300 text-gray-600 px-4
                       py-2 rounded-lg text-sm font-semibold
                       hover:bg-gray-50 transition">
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-400">Loading...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <p className="text-gray-500 text-xs mb-1">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {data?.summary?.totalCustomers || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <p className="text-gray-500 text-xs mb-1">Total Loan</p>
              <p className="text-lg font-bold text-blue-600">
                ₹{data?.summary?.totalLoanAmount
                  ?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <p className="text-gray-500 text-xs mb-1">
                Total Received
              </p>
              <p className="text-lg font-bold text-green-600">
                ₹{data?.summary?.totalPaid?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <p className="text-gray-500 text-xs mb-1">
                Total Pending
              </p>
              <p className="text-lg font-bold text-red-500">
                ₹{data?.summary?.totalPending?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            {/* Bar Chart */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4">
                📊 Loan vs Collection
              </h3>
              <ResponsiveContainer width="100%" height={220}>
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
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4">
                💳 Payment Mode Wise
              </h3>
              {pieData.length === 0 ? (
                <p className="text-center text-gray-400 py-16">
                  No payments yet
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
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
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">
              📅 Monthly Collections
            </h3>
            {monthlyData.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                No data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) =>
                      `₹${val.toLocaleString()}`}/>
                  <Bar dataKey="amount" name="Collected"
                       fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Customer Wise Table */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-base font-bold text-gray-800 mb-4">
              👥 Customer Wise Loans
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="text-left px-4 py-2 rounded-l-lg">
                      #
                    </th>
                    <th className="text-left px-4 py-2">Customer</th>
                    <th className="text-left px-4 py-2
                                   hidden md:table-cell">
                      Phone
                    </th>
                    <th className="text-left px-4 py-2">Loan</th>
                    <th className="text-left px-4 py-2
                                   hidden md:table-cell">
                      Paid
                    </th>
                    <th className="text-left px-4 py-2">Remaining</th>
                    <th className="text-left px-4 py-2
                                   hidden md:table-cell">
                      Interest
                    </th>
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
                      <td className="px-4 py-3 text-gray-600
                                     hidden md:table-cell">
                        {loan.customerId?.phone || '—'}
                      </td>
                      <td className="px-4 py-3">
                        ₹{loan.amount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-green-600
                                     font-medium hidden md:table-cell">
                        ₹{loan.totalPaid?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-red-500 font-medium">
                        ₹{loan.remaining?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-orange-500
                                     hidden md:table-cell">
                        {loan.interestRate}%
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full
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
          </div>
        </>
      )}
    </Layout>
  );
}