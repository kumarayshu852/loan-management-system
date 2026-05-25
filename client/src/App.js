import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Loans from './pages/Loans';
import LoanDetails from './pages/LoanDetails';
import Payments from './pages/Payments';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login"
        element={token
          ? <Navigate to="/dashboard" />
          : <Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      }/>
      <Route path="/customers" element={
        <ProtectedRoute><Customers /></ProtectedRoute>
      }/>
      <Route path="/loans" element={
        <ProtectedRoute><Loans /></ProtectedRoute>
      }/>
      <Route path="/loans/:id" element={
        <ProtectedRoute><LoanDetails /></ProtectedRoute>
      }/>
      <Route path="/payments" element={
        <ProtectedRoute><Payments /></ProtectedRoute>
      }/>
      <Route path="/reports" element={
        <ProtectedRoute><Reports /></ProtectedRoute>
      }/>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;