import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Guests from './pages/Guests';
import Families from './pages/Families';
import Events from './pages/Events';
import Invitations from './pages/Invitations';
import PublicInvitation from './pages/PublicInvitation';
import QRCheckIn from './pages/QRCheckIn';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import Vendors from './pages/Vendors';
import Reports from './pages/Reports';
import SecurityLogs from './pages/SecurityLogs';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invite/:token" element={<PublicInvitation />} />

          {/* Protected Dashboard Layout Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/guests" element={<Guests />} />
              <Route path="/events" element={<Events />} />
              <Route path="/check-in" element={<QRCheckIn />} />

              {/* Manager & Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
                <Route path="/families" element={<Families />} />
                <Route path="/invitations" element={<Invitations />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/security" element={<SecurityLogs />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;