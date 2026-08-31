import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { activityService } from '../services/activityService';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ShieldCheck, Users, Clock, ShieldAlert } from 'lucide-react';

const SecurityLogs = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsersAndLogs = async () => {
    try {
      setLoading(true);
      const [uRes, lRes] = await Promise.all([
        authService.getAllUsers(),
        activityService.getActivityLogs()
      ]);
      setUsers(uRes.data || []);
      setLogs(lRes.data?.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndLogs();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authService.updateUserRole(userId, newRole);
      fetchUsersAndLogs();
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    }
  };

  if (loading) return <LoadingSpinner label="Loading security & audit system..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-gold-400" />
            <span>Role-Based Access Control & Audit Logs</span>
          </h1>
          <p className="text-xs text-gray-400">Admin system control panel for managing user permissions and system activity logs</p>
        </div>
      </div>

      {/* User Roles & Permissions Control */}
      <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
        <h3 className="text-lg font-serif font-semibold text-white border-b border-amber-500/10 pb-3 flex items-center space-x-2">
          <Users className="w-5 h-5 text-gold-400" />
          <span>User Role Assignments</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-charcoal-800/60 border-b border-amber-500/10 text-gold-300 uppercase tracking-wider font-medium">
              <tr>
                <th className="p-3">User Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Current Role</th>
                <th className="p-3">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-amber-500/5">
                  <td className="p-3 font-semibold text-white">{u.name}</td>
                  <td className="p-3 text-gray-400">{u.email}</td>
                  <td className="p-3">
                    <Badge status={u.role} />
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-2.5 py-1 bg-charcoal-800 border border-amber-500/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Admin">Admin (Full Control)</option>
                      <option value="Manager">Manager (Guest/Budget)</option>
                      <option value="Staff">Staff (QR Check-In)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Audit Activity Logs */}
      <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
        <h3 className="text-lg font-serif font-semibold text-white border-b border-amber-500/10 pb-3 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gold-400" />
          <span>System Audit Log Stream</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-charcoal-800/60 border-b border-amber-500/10 text-gold-300 uppercase tracking-wider font-medium">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-amber-500/5">
                  <td className="p-3 font-mono text-amber-300">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-white">{log.userName || 'System'}</td>
                  <td className="p-3">
                    <Badge status={log.userRole || 'Staff'} />
                  </td>
                  <td className="p-3 font-medium text-gold-300">{log.action}</td>
                  <td className="p-3 text-gray-400">{log.entityType}</td>
                  <td className="p-3 text-gray-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
