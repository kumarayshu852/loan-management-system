import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords match nahi karte!');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      toast.success('Registration successful! Ab login karo.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center
                          justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-1">Register as Admin</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email *
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password *
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => setForm({
                ...form, confirmPassword: e.target.value
              })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg
                       font-semibold hover:bg-blue-700 transition
                       disabled:opacity-50 mt-2">
            {loading ? 'Registering...' : 'Register'}
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-500 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login"
              className="text-blue-600 font-medium hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}