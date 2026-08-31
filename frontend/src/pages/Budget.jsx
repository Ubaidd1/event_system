import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DollarSign, Edit, PieChart, CreditCard, CheckCircle2, TrendingUp } from 'lucide-react';

const Budget = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(50000);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await budgetService.getBudget();
      setBudgetData(res.data);
      setNewBudget(res.data.totalBudget);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    try {
      await budgetService.updateBudget(newBudget);
      setIsModalOpen(false);
      fetchBudget();
    } catch (err) {
      alert(err.message || 'Failed to update budget');
    }
  };

  if (loading) return <LoadingSpinner label="Calculating wedding financial metrics..." />;

  const { totalBudget, totalSpent, remainingBudget, pendingVendorPayments, categoryBreakdown } = budgetData;

  const spentPercentage = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-gold-400" />
            <span>Budget Management</span>
          </h1>
          <p className="text-xs text-gray-400">Track total wedding budget, category allocations, and remaining balances</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all text-xs flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Update Total Budget Cap</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Budget Target"
          value={`$${totalBudget.toLocaleString()}`}
          subtitle="Total allocated budget"
          icon={DollarSign}
        />
        <StatCard
          title="Total Spent to Date"
          value={`$${totalSpent.toLocaleString()}`}
          subtitle={`${spentPercentage}% of total budget used`}
          icon={TrendingUp}
        />
        <StatCard
          title="Remaining Balance"
          value={`$${remainingBudget.toLocaleString()}`}
          subtitle={remainingBudget >= 0 ? 'Within allocated budget' : 'Over budget limit'}
          icon={CheckCircle2}
        />
        <StatCard
          title="Budget Status"
          value={remainingBudget >= 0 ? 'On Track' : 'Over Limit'}
          subtitle={remainingBudget >= 0 ? 'Under budget ceiling' : 'Expenses exceed budget'}
          icon={CreditCard}
        />
      </div>

      {/* Overall Budget Progress Bar */}
      <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-serif font-bold text-white">Overall Budget Utilization</span>
          <span className="font-mono font-bold text-gold-300">${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()} ({spentPercentage}%)</span>
        </div>

        <div className="w-full h-3 bg-charcoal-800 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPercentage > 90 ? 'bg-rose-500' : 'bg-gold-gradient'
            }`}
            style={{ width: `${spentPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
        <h3 className="text-lg font-serif font-semibold text-white border-b border-amber-500/10 pb-3 flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-gold-400" />
          <span>Category Spending Allocations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryBreakdown && categoryBreakdown.map((cat) => {
            const catPct = totalSpent > 0 ? Math.round((cat.spent / totalSpent) * 100) : 0;
            return (
              <div key={cat.category} className="p-4 rounded-xl bg-charcoal-800/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{cat.category}</span>
                  <span className="font-mono font-bold text-gold-300">${cat.spent.toLocaleString()} ({catPct}%)</span>
                </div>
                <div className="w-full h-2 bg-charcoal-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500/70 rounded-full"
                    style={{ width: `${catPct}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span>{cat.count} recorded expense(s)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Update Total Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Total Wedding Budget"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateBudget} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Total Budget Amount ($ USD) *</label>
            <input
              type="number"
              required
              min="0"
              value={newBudget}
              onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-300 bg-charcoal-700 hover:bg-charcoal-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-charcoal-900 bg-gold-gradient rounded-xl shadow-md"
            >
              Save Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;
