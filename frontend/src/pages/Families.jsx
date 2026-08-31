import React, { useState, useEffect } from 'react';
import { familyService } from '../services/familyService';
import { invitationService } from '../services/invitationService';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import {
  Home,
  Plus,
  Edit,
  Trash2,
  Users,
  QrCode,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';

const Families = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [generatedInvite, setGeneratedInvite] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    headContact: '',
    email: '',
    phone: '',
    notes: ''
  });

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const res = await familyService.getFamilies();
      setFamilies(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleOpenAdd = () => {
    setEditingFamily(null);
    setFormData({ name: '', headContact: '', email: '', phone: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (family) => {
    setEditingFamily(family);
    setFormData({
      name: family.name,
      headContact: family.headContact || '',
      email: family.email || '',
      phone: family.phone || '',
      notes: family.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFamily) {
        await familyService.updateFamily(editingFamily._id, formData);
      } else {
        await familyService.createFamily(formData);
      }
      setIsModalOpen(false);
      fetchFamilies();
    } catch (err) {
      alert(err.message || 'Failed to save family');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await familyService.deleteFamily(deleteId);
      setDeleteId(null);
      fetchFamilies();
    } catch (err) {
      alert(err.message || 'Failed to delete family');
    }
  };

  const handleGenerateFamilyQR = async (familyId) => {
    try {
      const res = await invitationService.createInvitation({ familyId });
      setGeneratedInvite(res.data);
    } catch (err) {
      alert(err.message || 'Failed to generate family QR code');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <Home className="w-6 h-6 text-gold-400" />
            <span>Family Groups</span>
          </h1>
          <p className="text-xs text-gray-400">Group guests into family circles for consolidated invitations and entrance QR codes</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all text-xs flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Family Group</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading family groups..." />
      ) : families.length === 0 ? (
        <EmptyState
          title="No Family Groups Created"
          description="Create family groups (e.g. Mansoor Family, Khan Family) to send combined invitations and QR passes."
          actionText="Create First Family"
          onAction={handleOpenAdd}
          icon={Home}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {families.map((fam) => (
            <div key={fam._id} className="glass-card glass-card-hover p-6 rounded-2xl border border-amber-500/15 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Home className="w-5 h-5 text-gold-400" />
                    <h3 className="text-xl font-serif font-bold text-white">{fam.name}</h3>
                  </div>
                  {fam.headContact && (
                    <p className="text-xs text-amber-200/80 mt-1">Head Contact: <strong>{fam.headContact}</strong></p>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleGenerateFamilyQR(fam._id)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-gold-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Family QR</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(fam)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(fam._id)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-white/5">
                {fam.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-gold-400" />
                    <span>{fam.phone}</span>
                  </div>
                )}
                {fam.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-gold-400" />
                    <span>{fam.email}</span>
                  </div>
                )}
              </div>

              {/* Members preview list */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Family Members ({fam.memberCount || 0})</span>
                  </span>
                </div>

                {fam.members && fam.members.length > 0 ? (
                  <div className="space-y-1.5">
                    {fam.members.map((m) => (
                      <div key={m._id} className="flex items-center justify-between p-2 rounded-lg bg-charcoal-800/60 text-xs">
                        <span className="font-medium text-white">{m.name}</span>
                        <Badge status={m.rsvpStatus} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No guests assigned to this family yet. Assign in Guest Management.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Family Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFamily ? 'Edit Family Group' : 'Create New Family Group'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Family Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mansoor Family"
              className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Head of Family Contact</label>
            <input
              type="text"
              value={formData.headContact}
              onChange={(e) => setFormData({ ...formData, headContact: e.target.value })}
              placeholder="e.g. Tariq Mansoor"
              className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="family@example.com"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
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
              className="px-5 py-2 font-bold text-charcoal-900 bg-gold-gradient rounded-xl shadow-md shadow-amber-500/20"
            >
              {editingFamily ? 'Save Changes' : 'Create Family'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Generated Family QR Code Modal */}
      {generatedInvite && (
        <Modal
          isOpen={!!generatedInvite}
          onClose={() => setGeneratedInvite(null)}
          title="Generated Secure Family Invitation Pass"
          maxWidth="max-w-md"
        >
          <div className="text-center space-y-4 p-2">
            <div className="p-4 bg-white rounded-2xl inline-block border-4 border-amber-500/30 shadow-xl">
              <img src={generatedInvite.qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Family Unique Secure Token</p>
              <h3 className="text-2xl font-mono font-bold text-white tracking-widest">{generatedInvite.secureToken}</h3>
            </div>

            <div className="p-3 bg-charcoal-800/80 rounded-xl border border-amber-500/20 text-xs text-gray-300 space-y-1">
              <p><span className="text-gray-400">Family Pass:</span> <strong className="text-white">{generatedInvite.family?.name}</strong></p>
              <p><span className="text-gray-400">Public Invitation Link:</span></p>
              <a
                href={`/invite/${generatedInvite.secureToken}`}
                target="_blank"
                rel="noreferrer"
                className="text-gold-300 hover:underline break-all font-mono"
              >
                {window.location.origin}/invite/{generatedInvite.secureToken}
              </a>
            </div>

            <button
              onClick={() => setGeneratedInvite(null)}
              className="w-full py-2.5 bg-gold-gradient text-charcoal-900 font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Family Group"
        message="Are you sure? Guests in this family will become individual guests."
      />
    </div>
  );
};

export default Families;
