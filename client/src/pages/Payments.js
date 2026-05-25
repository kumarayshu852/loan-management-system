import { useState, useEffect } from 'react';
import API from '../api';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const totalReceived = payments.reduce(
    (sum, p) => sum + p.paidAmount, 0
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          All Payments
        </h2>
        <div className="bg-blue-50 text-blue-600 px-3 py-1.5
                        rounded-lg text-sm font-medium">
          Total: {payments.length}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-gray-500 text-xs mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-gray-800">
            {payments.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-gray-500 text-xs mb-1">Total Received</p>
          <p className="text-xl font-bold text-green-600">
            ₹{totalReceived.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center
                        col-span-2 md:col-span-1">
          <p className="text-gray-500 text-xs mb-1">Cash Payments</p>
          <p className="text-2xl font-bold text-blue-600">
            {payments.filter(p => p.paymentMode === 'Cash').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b">
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Paid</th>
                  <th className="text-left px-4 py-3
                                 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left px-4 py-3
                                 hidden md:table-cell">
                    Mode
                  </th>
                  <th className="text-left px-4 py-3
                                 hidden lg:table-cell">
                    Note
                  </th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="7"
                        className="text-center py-10 text-gray-400">
                      No payments yet
                    </td>
                  </tr>
                )}
                {payments.map((p, i) => (
                  <tr key={p._id}
                      className="border-b last:border-0
                                 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {p.loanId?.customerId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      ₹{p.paidAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {new Date(p.paymentDate)
                        .toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full
                        text-xs font-medium
                        ${p.paymentMode === 'Cash'
                          ? 'bg-green-50 text-green-600'
                          : p.paymentMode === 'UPI'
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-blue-50 text-blue-600'}`}>
                        {p.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500
                                   hidden lg:table-cell">
                      {p.note || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
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
          </div>
        )}
      </div>
    </Layout>
  );
}