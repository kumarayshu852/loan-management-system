import { useState, useEffect } from 'react';
import API from '../api';
import Layout from '../components/Layout';
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

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.error(err.response?.data?.message || 'Failed');
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

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Customers
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg
                     text-sm font-semibold hover:bg-blue-700 transition">
          + Add Customer
        </button>
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
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">
                    Address
                  </th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">
                    Aadhaar
                  </th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="6"
                        className="text-center py-10 text-gray-400">
                      No customers yet
                    </td>
                  </tr>
                )}
                {customers.map((c, i) => (
                  <tr key={c._id}
                      className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-600
                                   hidden md:table-cell">
                      {c.address || '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {c.aadhaarImage &&
                       c.aadhaarImage.startsWith('http') ? (
                        
                          <a href={c.aadhaarImage}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-xs">
                          View Image
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          No image
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(c._id)}
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
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50
                        flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6
                          w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800">
                Add Customer
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({
                    ...form, name: e.target.value
                  })}
                  required
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"/>
              </div>

              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Phone *
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) => setForm({
                    ...form, phone: e.target.value
                  })}
                  required
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"/>
              </div>

              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Address
                </label>
                <textarea
                  placeholder="Enter address"
                  value={form.address}
                  onChange={(e) => setForm({
                    ...form, address: e.target.value
                  })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"/>
              </div>

              <div>
                <label className="block text-gray-700 text-sm
                                  font-medium mb-1">
                  Aadhaar Image
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setAadhaarImage(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg
                             px-4 py-2.5 text-sm text-gray-500
                             focus:outline-none
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
                  {submitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}