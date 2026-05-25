import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', address: ''
  });
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('address', form.address);
      if (aadhaarImage) formData.append('aadhaarImage', aadhaarImage);

      await API.post('/customers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Customer added!');
      setShowModal(false);
      setForm({ name: '', phone: '', address: '' });
      setAadhaarImage(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await API.delete(`/customers/${id}`);
      toast.success('Customer deleted!');
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete');
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
        <main className="ml-56 flex-1 p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg
                         font-semibold hover:bg-blue-700 transition">
              + Add Customer
            </button>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <p className="text-center py-10 text-gray-400">Loading...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b">
                    <th className="text-left px-6 py-3">#</th>
                    <th className="text-left px-6 py-3">Name</th>
                    <th className="text-left px-6 py-3">Phone</th>
                    <th className="text-left px-6 py-3">Address</th>
                    <th className="text-left px-6 py-3">Aadhaar</th>
                    <th className="text-center px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan="6"
                          className="text-center py-10 text-gray-400">
                        No customers yet — Add one!
                      </td>
                    </tr>
                  )}
                  {customers.map((c, i) => (
                    <tr key={c._id}
                        className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {c.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{c.phone}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {c.address || '—'}
                      </td>
                      <td className="px-6 py-4">
                        {c.aadhaarImage && c.aadhaarImage.startsWith('http') ? (
                          
                            <a href={c.aadhaarImage}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-xs">
                            View Image
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/loans?customer=${c._id}`)}
                          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg
                                     text-xs font-medium hover:bg-blue-100 mr-2">
                          Loans
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="bg-red-50 text-red-500 px-3 py-1 rounded-lg
                                     text-xs font-medium hover:bg-red-100">
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

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center
                        justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md
                          mx-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800">Add Customer</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                             focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Phone *
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                             focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Address
                </label>
                <textarea
                  placeholder="Enter address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                             focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Aadhaar Image
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setAadhaarImage(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             text-sm text-gray-500"/>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5
                             rounded-lg font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg
                             font-semibold hover:bg-blue-700 transition
                             disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}