import React, { useState, useEffect } from 'react';
import { vendorService } from '../services/vendorService';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Catering',
    phone: '',
    email: '',
    contractAmount: '',
    amountPaid: 0,
    dueDate: '',
    paymentStatus: 'Pending',
    notes: ''
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await vendorService.getVendors();
      setVendors(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'Catering',
      phone: '',
      email: '',
      contractAmount: '',
      amountPaid: 0,
      dueDate: '',
      paymentStatus: 'Pending',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category || 'Catering',
      phone: vendor.phone || '',
      email: vendor.email || '',
      contractAmount: vendor.contractAmount,
      amountPaid: vendor.amountPaid,
      dueDate: vendor.dueDate ? new Date(vendor.dueDate).toISOString().split('T')[0] : '',
      paymentStatus: vendor.paymentStatus || 'Pending',
      notes: vendor.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        contractAmount: parseFloat(formData.contractAmount) || 0,
        amountPaid: parseFloat(formData.amountPaid) || 0
      };

      if (editingVendor) {
        await vendorService.updateVendor(editingVendor._id, payload);
      } else {
        await vendorService.createVendor(payload);
      }
      setIsModalOpen(false);
      fetchVendors();
    } catch (err) {
      alert(err.message || 'Failed to save vendor');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await vendorService.deleteVendor(deleteId);
      setDeleteId(null);
      fetchVendors();
    } catch (err) {
      alert(err.message || 'Failed to delete vendor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-gold-400" />
            <span>Vendor Management</span>
          </h1>
          <p className="text-xs text-gray-400">Manage contracts, contact info, due dates, and payment balances with wedding vendors</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all text-xs flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading vendor directory..." />
      ) : vendors.length === 0 ? (
        <EmptyState
          title="No Vendors Added"
          description="Add your catering, venue, photography, and decor vendors to manage contract amounts and payments."
          actionText="Add Vendor"
          onAction={handleOpenAdd}
          icon={Briefcase}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((vendor) => {
            const remaining = vendor.contractAmount - vendor.amountPaid;
            const paidPct = vendor.contractAmount > 0 ? Math.min(Math.round((vendor.amountPaid / vendor.contractAmount) * 100), 100) : 0;
            return (
              <div key={vendor._id} className="glass-card glass-card-hover p-6 rounded-2xl border border-amber-500/15 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap leading-none bg-amber-500/10 text-gold-300 border border-amber-500/20">
                      {vendor.category}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white mt-1">{vendor.name}</h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Badge status={vendor.paymentStatus} />
                    <button
                      onClick={() => handleOpenEdit(vendor)}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(vendor._id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  {vendor.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-gold-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-gold-400" />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                </div>

                {/* Contract Financial Progress */}
                <div className="p-3 rounded-xl bg-charcoal-800/70 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Contract Amount:</span>
                    <strong className="text-white font-mono">${vendor.contractAmount.toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Amount Paid:</span>
                    <strong className="text-emerald-400 font-mono">${vendor.amountPaid.toLocaleString()} ({paidPct}%)</strong>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-1.5">
                    <span className="text-gray-400">Remaining Balance:</span>
                    <strong className="text-gold-300 font-mono">${remaining.toLocaleString()}</strong>
                  </div>

                  <div className="w-full h-1.5 bg-charcoal-900 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPct}%` }}></div>
                  </div>
                </div>

                {vendor.dueDate && (
                  <p className="text-[11px] text-amber-200/70 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gold-400" />
                    <span>Payment Due Date: {new Date(vendor.dueDate).toLocaleDateString()}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Details' : 'Add New Vendor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Vendor Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Serena Grand Catering"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 51 111 133 133"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="events@vendor.com"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Contract Amount ($ USD) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.contractAmount}
                onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                placeholder="25000"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Amount Paid ($ USD)</label>
              <input
                type="number"
                min="0"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
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

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Payment Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Notes / Terms</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Service agreement notes..."
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
              {editingVendor ? 'Save Changes' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Vendor"
        message="Are you sure you want to remove this vendor?"
      />
    </div>
  );
};

export default Vendors;
