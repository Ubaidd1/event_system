import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Mail,
  QrCode,
  DollarSign,
  Receipt,
  Briefcase,
  BarChart3,
  ShieldCheck,
  LogOut,
  Sparkles,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Guests', path: '/guests', icon: Users, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Families', path: '/families', icon: Home, roles: ['Admin', 'Manager'] },
    { name: 'Events', path: '/events', icon: Calendar, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Invitations', path: '/invitations', icon: Mail, roles: ['Admin', 'Manager'] },
    { name: 'QR Check-In', path: '/check-in', icon: QrCode, roles: ['Admin', 'Manager', 'Staff'], badge: 'Live Portal' },
    { name: 'Budget', path: '/budget', icon: DollarSign, roles: ['Admin', 'Manager'] },
    { name: 'Expenses', path: '/expenses', icon: Receipt, roles: ['Admin', 'Manager'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['Admin', 'Manager'] },
    { name: 'Role & Audit Logs', path: '/security', icon: ShieldCheck, roles: ['Admin'] },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-charcoal-900 border-r border-amber-500/10 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-amber-500/10 flex items-center space-x-3">
        <div className="p-2.5 bg-gold-gradient rounded-xl shadow-lg shadow-amber-500/20 text-charcoal-900">
          <Sparkles className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-serif font-bold text-gold-gradient tracking-wide">
            ShaadiSphere
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-amber-200/60">
            Luxury Wedding SaaS
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-gold-300 border border-amber-500/30 shadow-md shadow-amber-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-charcoal-800'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 text-gold-400" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-amber-500/10 bg-charcoal-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gold-gradient text-charcoal-900 flex items-center justify-center font-bold text-sm font-serif">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Organizer'}</p>
              <span className="inline-block text-[11px] font-medium text-gold-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
