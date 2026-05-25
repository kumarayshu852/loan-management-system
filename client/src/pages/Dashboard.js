import { useState, useEffect } from 'react';
import API from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard');
      setDashData(res.data);
      toast.success("Dashboard Loaded");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
        Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-gray-500 text-xs mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-gray-800">
            {dashData?.totalCustomers || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-gray-500 text-xs mb-1">Active Loans</p>
          <p className="text-2xl font-bold text-blue-600">
            {dashData?.activeLoans || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-gray-500 text-xs mb-1">Total Loan</p>
          <p className="text-xl font-bold text-green-600">
            ₹{dashData?.stats?.totalLoanAmount?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-gray-500 text-xs mb-1">Total Pending</p>
          <p className="text-xl font-bold text-red-500">
            ₹{dashData?.stats?.totalPending?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recent Loans */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-base font-bold text-gray-800 mb-3">
            Recent Loans
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 rounded-l-lg">
                    Name
                  </th>
                  <th className="text-center px-3 py-2">Amount</th>
                  <th className="text-center px-3 py-2 rounded-r-lg">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashData?.recentLoans?.length === 0 && (
                  <tr>
                    <td colSpan="3"
                        className="text-center py-4 text-gray-400">
                      No loans yet
                    </td>
                  </tr>
                )}
                {dashData?.recentLoans?.map((loan) => (
                  <tr key={loan._id}
                      className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {loan.customerId?.name || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      ₹{loan.amount?.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">
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

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-base font-bold text-gray-800 mb-3">
            Recent Payments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 rounded-l-lg">
                    Name
                  </th>
                  <th className="text-center px-3 py-2">Amount</th>
                  <th className="text-center px-3 py-2 rounded-r-lg">
                    Mode
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashData?.recentPayments?.length === 0 && (
                  <tr>
                    <td colSpan="3"
                        className="text-center py-4 text-gray-400">
                      No payments yet
                    </td>
                  </tr>
                )}
                {dashData?.recentPayments?.map((payment) => (
                  <tr key={payment._id}
                      className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {payment.loanId?.customerId?.name || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-center
                                   text-green-600 font-semibold">
                      ₹{payment.paidAmount?.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="bg-blue-50 text-blue-600
                                       px-2 py-1 rounded-full
                                       text-xs font-medium">
                        {payment.paymentMode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}