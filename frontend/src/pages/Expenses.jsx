import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';
import { vendorService } from '../services/vendorService';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Receipt,
  Plus,
  Edit,
  Trash2,
  Paperclip,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewReceiptUrl, setViewReceiptUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Catering',
    vendor: '',
    amount: '',
    paymentStatus: 'Paid',
    paymentDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);

  const fetchExpensesAndVendors = async () => {
    try {
      setLoading(true);
      const [expRes, venRes] = await Promise.all([
        expenseService.getExpenses(),
        vendorService.getVendors()
      ]);
      setExpenses(expRes.data || []);
      setVendors(venRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndVendors();
  }, []);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'Catering',
      vendor: '',
      amount: '',
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: ''
    });
    setReceiptFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      title: exp.title,
      category: exp.category || 'Catering',
      vendor: exp.vendor?._id || exp.vendor || '',
      amount: exp.amount,
      paymentStatus: exp.paymentStatus || 'Paid',
      paymentDate: exp.paymentDate ? new Date(exp.paymentDate).toISOString().split('T')[0] : '',
      dueDate: exp.dueDate ? new Date(exp.dueDate).toISOString().split('T')[0] : '',
      notes: exp.notes || ''
    });
    setReceiptFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      if (formData.vendor) data.append('vendor', formData.vendor);
      data.append('amount', formData.amount);
      data.append('paymentStatus', formData.paymentStatus);
      if (formData.paymentDate) data.append('paymentDate', formData.paymentDate);
      if (formData.dueDate) data.append('dueDate', formData.dueDate);
      if (formData.notes) data.append('notes', formData.notes);
      if (receiptFile) data.append('receipt', receiptFile);

      if (editingExpense) {
        await expenseService.updateExpense(editingExpense._id, data);
      } else {
        await expenseService.createExpense(data);
      }
      setIsModalOpen(false);
      fetchExpensesAndVendors();
    } catch (err) {
      alert(err.message || 'Failed to save expense');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await expenseService.deleteExpense(deleteId);
      setDeleteId(null);
      fetchExpensesAndVendors();
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-gold-400" />
            <span>Expense Tracking & Receipts</span>
          </h1>
          <p className="text-xs text-gray-400">Record payments, link vendor contracts, and upload digital receipts</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all text-xs flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading expense records..." />
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No Expenses Logged"
          description="Keep your wedding budget accurate by recording venue deposits, catering fees, and decor payments."
          actionText="Add Expense"
          onAction={handleOpenAdd}
          icon={Receipt}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-amber-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-charcoal-800/60 border-b border-amber-500/10 text-gold-300 uppercase tracking-wider font-medium">
                <tr>
                  <th className="p-4">Expense Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 font-mono">Amount</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4 text-center">Receipt</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      {exp.title}
                      {exp.notes && <p className="text-[10px] text-gray-400 font-normal">{exp.notes}</p>}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap leading-none bg-amber-500/10 text-gold-300 border border-amber-500/20">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-gold-300 text-sm">
                      ${exp.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <Badge status={exp.paymentStatus} />
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(exp.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      {exp.receiptUrl ? (
                        <button
                          onClick={() => setViewReceiptUrl(`http://localhost:5000${exp.receiptUrl}`)}
                          className="p-1.5 bg-amber-500/10 text-gold-300 hover:bg-amber-500/20 rounded-lg border border-amber-500/30"
                          title="View Digital Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-gray-600 text-[10px]">No file</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(exp._id)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Expense Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Serena Catering Advance Deposit"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Decoration">Decoration</option>
                <option value="Photography">Photography</option>
                <option value="Videography">Videography</option>
                <option value="Clothing">Clothing</option>
                <option value="Invitations">Invitations</option>
                <option value="Transportation">Transportation</option>
                <option value="Makeup">Makeup</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Amount ($ USD) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="15000"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Payment Date</label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Upload Receipt (Image / PDF)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files[0])}
                className="w-full p-2 bg-charcoal-800 border border-amber-500/20 rounded-xl text-xs text-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes..."
              className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
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
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Receipt Image Modal */}
      {viewReceiptUrl && (
        <Modal
          isOpen={!!viewReceiptUrl}
          onClose={() => setViewReceiptUrl(null)}
          title="Digital Receipt Document"
          maxWidth="max-w-xl"
        >
          <div className="text-center p-2">
            <img src={viewReceiptUrl} alt="Receipt" className="max-h-[70vh] mx-auto rounded-xl shadow-2xl" />
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense record?"
      />
    </div>
  );
};

export default Expenses;
