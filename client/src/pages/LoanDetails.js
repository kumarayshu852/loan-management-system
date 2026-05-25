import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LoanDetails() {
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    paidAmount: '', paymentDate: '', paymentMode: 'Cash', note: ''
  });
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchLoan();
    fetchPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLoan = async () => {
    try {
      const res = await API.get(`/loans/${id}`);
      setLoan(res.data);
    } catch (err) {
      toast.error('Loan not found');
      navigate('/loans');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await API.get(`/payments/loan/${id}`);
      setPayments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/payments', { ...form, loanId: id });
      toast.success('Payment added!');
      setShowModal(false);
      setForm({
        paidAmount: '', paymentDate: '',
        paymentMode: 'Cash', note: ''
      });
      fetchLoan();
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-500">Loading...</p>
    </div>
  );

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

          {/* Back Button */}
          <button
            onClick={() => navigate('/loans')}
            className="text-blue-600 hover:underline text-sm mb-4 
                       flex items-center gap-1">
            ← Back to Loans
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Loan Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                👤 Customer Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">
                    {loan?.customerId?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">
                    {loan?.customerId?.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium">
                    {loan?.customerId?.address || 'N/A'}
                  </span>
                </div>
                {loan?.customerId?.aadhaarImage && loan.customerId.aadhaarImage.startsWith('http') && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aadhaar</span>
                    
                      <a href={loan.customerId.aadhaarImage}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline">
                      View Image
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Loan Info */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                💰 Loan Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Loan Amount</span>
                  <span className="font-medium">
                    ₹{loan?.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Interest Rate</span>
                  <span className="font-medium text-orange-500">
                    {loan?.interestRate}% / month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Months Running</span>
                  <span className="font-medium">{loan?.months} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Interest</span>
                  <span className="font-medium text-orange-500">
                    ₹{loan?.totalInterest?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-500">Total Payable</span>
                  <span className="font-bold">
                    ₹{loan?.totalPayable?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Paid</span>
                  <span className="font-medium text-green-600">
                    ₹{loan?.totalPaid?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Remaining</span>
                  <span className="font-bold text-red-500 text-base">
                    ₹{loan?.remaining?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${loan?.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : loan?.status === 'Closed'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-yellow-100 text-yellow-700'}`}>
                    {loan?.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reason</span>
                  <span className="font-medium">{loan?.reason || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loan Date</span>
                  <span className="font-medium">
                    {new Date(loan?.date).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                💳 Payment History
              </h3>
              {loan?.status !== 'Closed' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg
                             text-sm font-semibold hover:bg-blue-700 transition">
                  + Add Payment
                </button>
              )}
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-4 py-2 rounded-l-lg">#</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Amount</th>
                  <th className="text-left px-4 py-2">Mode</th>
                  <th className="text-left px-4 py-2 rounded-r-lg">Note</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="5"
                        className="text-center py-6 text-gray-400">
                      No payments yet
                    </td>
                  </tr>
                )}
                {payments.map((p, i) => (
                  <tr key={p._id}
                      className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      ₹{p.paidAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-600 px-2 py-1
                                       rounded-full text-xs font-medium">
                        {p.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex
                        items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full
                          max-w-md mx-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800">Add Payment</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">

              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Paid Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={form.paidAmount}
                  onChange={(e) => setForm({
                    ...form, paidAmount: e.target.value
                  })}
                  required
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"/>
              </div>

              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm({
                    ...form, paymentDate: e.target.value
                  })}
                  required
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"/>
              </div>

              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Payment Mode *
                </label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => setForm({
                    ...form, paymentMode: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500">
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partial payment"
                  value={form.note}
                  onChange={(e) => setForm({
                    ...form, note: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"/>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700
                             py-2.5 rounded-lg font-semibold
                             hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5
                             rounded-lg font-semibold hover:bg-blue-700
                             transition disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}