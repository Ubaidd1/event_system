import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle
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
  Tooltip,
  Legend
} from 'recharts';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await reportService.getReports();
        setReportData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner label="Compiling ShaadiSphere analytics reports..." />;

  const { guestAnalytics, eventAnalytics, financialAnalytics } = reportData;

  const rsvpPieData = [
    { name: 'Confirmed', value: guestAnalytics.confirmed },
    { name: 'Pending', value: guestAnalytics.pending },
    { name: 'Declined', value: guestAnalytics.declined }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-gold-400" />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-xs text-gray-400">Comprehensive system analytics across guest RSVPs, event attendance, and financial spending</p>
        </div>
      </div>

      {/* Top Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance Rate"
          value={`${guestAnalytics.attendanceRate}%`}
          subtitle={`${guestAnalytics.confirmed} / ${guestAnalytics.totalGuests} Guests Confirmed`}
          icon={Users}
        />
        <StatCard
          title="Total Budget Utilization"
          value={`$${financialAnalytics.totalSpent.toLocaleString()}`}
          subtitle={`Budget Cap: $${financialAnalytics.totalBudget.toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard
          title="Remaining Balance"
          value={`$${financialAnalytics.remainingBudget.toLocaleString()}`}
          subtitle="Available Unspent Funds"
          icon={TrendingUp}
        />
        <StatCard
          title="Events Scheduled"
          value={eventAnalytics.length}
          subtitle="Wedding Timeline Ceremonies"
          icon={Calendar}
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Confirmation Pie */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
          <h3 className="text-lg font-serif font-semibold text-white border-b border-amber-500/10 pb-3 flex items-center space-x-2">
            <PieIcon className="w-5 h-5 text-gold-400" />
            <span>RSVP Status Distribution</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rsvpPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rsvpPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141418', borderColor: 'rgba(212, 175, 55, 0.3)', borderRadius: '12px' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
          <h3 className="text-lg font-serif font-semibold text-white border-b border-amber-500/10 pb-3 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-gold-400" />
            <span>Financial Spending by Category</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialAnalytics.categorySpending}>
                <XAxis dataKey="category" stroke="#9ca3af" fontSize={11} tickLine={false} />
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

      {/* Event Entrance Attendance Table Report */}
      <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
        <h3 className="text-lg font-serif font-semibold text-white border-b border-amber-500/10 pb-3 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gold-400" />
          <span>Event Attendance & Check-In Report</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-charcoal-800/60 border-b border-amber-500/10 text-gold-300 uppercase tracking-wider font-medium">
              <tr>
                <th className="p-3">Event Name</th>
                <th className="p-3">Venue</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-center">Invited</th>
                <th className="p-3 text-center">Checked In</th>
                <th className="p-3 text-center">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {eventAnalytics.map((ev) => (
                <tr key={ev.eventName} className="hover:bg-amber-500/5">
                  <td className="p-3 font-semibold text-white">{ev.eventName}</td>
                  <td className="p-3 text-gray-400">{ev.venue}</td>
                  <td className="p-3 text-amber-200/80">{new Date(ev.date).toLocaleDateString()}</td>
                  <td className="p-3 text-center font-mono">{ev.invitedCount}</td>
                  <td className="p-3 text-center font-mono text-emerald-400 font-bold">{ev.checkInsCount}</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-gold-300 border border-amber-500/20">
                      {ev.attendanceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
