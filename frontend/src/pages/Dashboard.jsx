import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import {
  Users,
  UserCheck,
  DollarSign,
  Receipt,
  QrCode,
  Calendar,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  CreditCard
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStats();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner label="Fetching ShaadiSphere Analytics..." />;

  if (error) {
    return (
      <div className="glass-card p-8 text-center rounded-2xl border border-rose-500/20">
        <p className="text-rose-400 font-medium mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-gold-gradient text-charcoal-900 font-bold rounded-xl text-xs uppercase tracking-wider"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const { metrics, upcomingEvents, recentCheckIns, recentLogs, expenseChartData, rsvpChartData } = data;

  const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Wedding Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden border border-amber-500/20 bg-gradient-to-r from-charcoal-800 via-charcoal-800 to-amber-950/20">
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-gold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Official Wedding Dashboard</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide">
              {data.wedding?.coupleNames || 'Abdullah & Sarah'}
            </h1>
            <p className="text-sm text-gray-300">
              {data.wedding?.title || 'Wedding Celebration'} • 19 March 2027
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/guests')}
              className="px-4 py-2.5 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all text-xs flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Guest</span>
            </button>
            <button
              onClick={() => navigate('/invitations')}
              className="px-4 py-2.5 bg-charcoal-700 hover:bg-charcoal-800 text-gold-300 border border-amber-500/30 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate Invitation</span>
            </button>
            <button
              onClick={() => navigate('/check-in')}
              className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Open Check-In Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invited Guests"
          value={metrics.totalGuests}
          subtitle={`${metrics.confirmedRSVP} Confirmed • ${metrics.pendingRSVP} Pending`}
          icon={Users}
          trend="84% RSVP Response Rate"
        />
        <StatCard
          title="Confirmed RSVPs"
          value={metrics.confirmedRSVP}
          subtitle={`${metrics.declinedRSVP} Declined Guests`}
          icon={UserCheck}
          trend={`${metrics.totalCheckIns} Total Entrance Check-Ins`}
        />
        <StatCard
          title="Total Budget Spent"
          value={`$${metrics.totalSpent.toLocaleString()}`}
          subtitle={`Budget Cap: $${metrics.totalBudget.toLocaleString()}`}
          icon={DollarSign}
          trend={`$${metrics.remainingBudget.toLocaleString()} Remaining`}
        />
        <StatCard
          title="Pending Vendor Due"
          value={`$${metrics.pendingVendorPayments.toLocaleString()}`}
          subtitle="Outstanding balances"
          icon={CreditCard}
          trend="4 Active Vendors"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Status Chart */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-4">
            <div>
              <h3 className="text-lg font-serif font-semibold text-white">RSVP Status Breakdown</h3>
              <p className="text-xs text-gray-400">Guest attendance confirmation progress</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gold-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rsvpChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rsvpChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141418', borderColor: 'rgba(212, 175, 55, 0.3)', borderRadius: '12px' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs pt-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-gray-300">Confirmed ({metrics.confirmedRSVP})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-gray-300">Pending ({metrics.pendingRSVP})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-gray-300">Declined ({metrics.declinedRSVP})</span>
            </div>
          </div>
        </div>

        {/* Expenses Category Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-4">
            <div>
              <h3 className="text-lg font-serif font-semibold text-white">Expenses by Category</h3>
              <p className="text-xs text-gray-400">Financial distribution across wedding requirements</p>
            </div>
            <Receipt className="w-5 h-5 text-gold-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseChartData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141418', borderColor: 'rgba(212, 175, 55, 0.3)', borderRadius: '12px' }}
                  itemStyle={{ color: '#f0d67f' }}
                />
                <Bar dataKey="amount" fill="#c5a059" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Widgets Grid: Upcoming Events & Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
            <h3 className="text-lg font-serif font-semibold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gold-400" />
              <span>Upcoming Events</span>
            </h3>
            <button
              onClick={() => navigate('/events')}
              className="text-xs text-gold-300 hover:underline font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev) => (
                <div key={ev._id} className="p-3.5 rounded-xl bg-charcoal-800/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{ev.name}</h4>
                    <p className="text-xs text-amber-200/70">{ev.venue}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {ev.startTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-gold-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      {ev.confirmedCount || 0} RSVPs
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No events scheduled.</p>
            )}
          </div>
        </div>

        {/* Live Entrance Check-In Activity */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
            <h3 className="text-lg font-serif font-semibold text-white flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <span>Live Check-Ins</span>
            </h3>
            <button
              onClick={() => navigate('/check-in')}
              className="text-xs text-emerald-400 hover:underline font-medium"
            >
              Scanner
            </button>
          </div>

          <div className="space-y-3">
            {recentCheckIns && recentCheckIns.length > 0 ? (
              recentCheckIns.map((ci) => (
                <div key={ci._id} className="p-3 rounded-xl bg-charcoal-800/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {ci.guest?.name || 'Honored Guest'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Event: <span className="text-amber-300">{ci.event?.name || 'Wedding'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge status="Verified" />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(ci.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No check-ins logged yet today.</p>
            )}
          </div>
        </div>

        {/* System Activity Stream */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
            <h3 className="text-lg font-serif font-semibold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gold-400" />
              <span>Recent Activity</span>
            </h3>
            <button
              onClick={() => navigate('/security')}
              className="text-xs text-gold-300 hover:underline font-medium"
            >
              Audit Log
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log._id} className="text-xs space-y-1 p-2.5 rounded-lg bg-charcoal-800/40">
                  <div className="flex items-center justify-between text-gray-300 font-medium">
                    <span>{log.userName || 'System'}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-amber-200/80">{log.details || log.action}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No activity logs recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
