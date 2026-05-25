import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerId: '', amount: '', interestRate: '', reason: '', date: ''
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchLoans();
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await API.get('/loans');
      setLoans(res.data);
    } catch (err) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/loans', form);
      toast.success('Loan created!');
      setShowModal(false);
      setForm({
        customerId: '', amount: '',
        interestRate: '', reason: '', date: ''
      });
      fetchLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create loan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm('Delete this loan?')) return;
  try {
    await API.delete(`/loans/${id}`);
    toast.success('Loan deleted!');
    fetchLoans();
  } catch (err) {
    toast.error('Failed to delete loan');
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
            <h2 className="text-2xl font-bold text-gray-800">Loans</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg
                         font-semibold hover:bg-blue-700 transition">
              + Add Loan
            </button>
          </div>

          {/* Loans Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <p className="text-center py-10 text-gray-400">Loading...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b">
                    <th className="text-left px-6 py-3">#</th>
                    <th className="text-left px-6 py-3">Customer</th>
                    <th className="text-left px-6 py-3">Amount</th>
                    <th className="text-left px-6 py-3">Interest</th>
                    <th className="text-left px-6 py-3">Months</th>
                    <th className="text-left px-6 py-3">Total Payable</th>
                    <th className="text-left px-6 py-3">Paid</th>
                    <th className="text-left px-6 py-3">Remaining</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-center px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.length === 0 && (
                    <tr>
                      <td colSpan="10"
                          className="text-center py-10 text-gray-400">
                        No loans yet — Add one!
                      </td>
                    </tr>
                  )}
                  {loans.map((loan, i) => (
                    <tr key={loan._id}
                        className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {loan.customerId?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        ₹{loan.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-orange-500">
                        {loan.interestRate}%
                      </td>
                      <td className="px-6 py-4">
                        {loan.months} mo
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ₹{loan.totalPayable?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-green-600">
                        ₹{loan.totalPaid?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-red-500 font-medium">
                        ₹{loan.remaining?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs 
                          font-semibold
                          ${loan.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : loan.status === 'Closed'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-100 text-yellow-700'}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/loans/${loan._id}`)}
                          className="bg-blue-50 text-blue-600 px-3 py-1
                                     rounded-lg text-xs font-medium
                                     hover:bg-blue-100">
                          View
                        </button>
                         <button
                         onClick={() => handleDelete(loan._id)}
                         className="bg-red-50 text-red-500 px-3 py-1
                         rounded-lg text-xs font-medium
                         hover:bg-red-100">
                            Delete
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

      {/* Add Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex
                        items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full
                          max-w-md mx-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800">Create Loan</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Customer Select */}
              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Select Customer *
                </label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({
                    ...form, customerId: e.target.value
                  })}
                  required
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500">
                  <option value="">Choose customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Loan Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={(e) => setForm({
                    ...form, amount: e.target.value
                  })}
                  required
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"/>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Interest Rate (% per month) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={form.interestRate}
                  onChange={(e) => setForm({
                    ...form, interestRate: e.target.value
                  })}
                  required
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"/>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Business, Medical"
                  value={form.reason}
                  onChange={(e) => setForm({
                    ...form, reason: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"/>
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Loan Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({
                    ...form, date: e.target.value
                  })}
                  required
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
                  {submitting ? 'Saving...' : 'Save Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}