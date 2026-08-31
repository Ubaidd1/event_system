import React, { useState, useEffect } from 'react';
import { guestService } from '../services/guestService';
import { familyService } from '../services/familyService';
import { eventService } from '../services/eventService';
import { invitationService } from '../services/invitationService';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  QrCode,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Phone,
  Mail,
  Home
} from 'lucide-react';

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [families, setFamilies] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(null);
  const [generatedInvite, setGeneratedInvite] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Groom Family',
    allowedPlusOnes: 1,
    family: '',
    events: [],
    rsvpStatus: 'Pending',
    notes: ''
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [guestRes, famRes, evRes] = await Promise.all([
        guestService.getGuests({ search, rsvpStatus: rsvpFilter, category: categoryFilter }),
        familyService.getFamilies(),
        eventService.getEvents()
      ]);
      setGuests(guestRes.data.guests || []);
      setFamilies(famRes.data || []);
      setEvents(evRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [search, rsvpFilter, categoryFilter]);

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: 'Groom Family',
      allowedPlusOnes: 1,
      family: '',
      events: events.map(e => e._id), // select all by default
      rsvpStatus: 'Pending',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      category: guest.category || 'General',
      allowedPlusOnes: guest.allowedPlusOnes || 1,
      family: guest.family?._id || '',
      events: guest.events ? guest.events.map(e => e._id || e) : [],
      rsvpStatus: guest.rsvpStatus || 'Pending',
      notes: guest.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await guestService.updateGuest(editingGuest._id, formData);
      } else {
        await guestService.createGuest(formData);
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert(err.message || 'Failed to save guest');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await guestService.deleteGuest(deleteId);
      setDeleteId(null);
      fetchInitialData();
    } catch (err) {
      alert(err.message || 'Failed to delete guest');
    }
  };

  const handleGenerateQR = async (guestId) => {
    setGeneratingQR(guestId);
    try {
      const res = await invitationService.createInvitation({ guestId });
      setGeneratedInvite(res.data);
    } catch (err) {
      alert(err.message || 'Failed to generate invitation QR code');
    } finally {
      setGeneratingQR(null);
    }
  };

  const handleEventCheckbox = (eventId) => {
    setFormData(prev => {
      const current = prev.events;
      if (current.includes(eventId)) {
        return { ...prev, events: current.filter(id => id !== eventId) };
      } else {
        return { ...prev, events: [...current, eventId] };
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-gold-400" />
            <span>Guest Management</span>
          </h1>
          <p className="text-xs text-gray-400">Manage wedding attendees, plus-ones, RSVPs, and invitations</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all text-xs flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Guest</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-amber-500/10 flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-charcoal-800/80 border border-amber-500/20 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* RSVP Status Tabs */}
        <div className="flex items-center bg-charcoal-800/80 p-1 rounded-xl border border-amber-500/20">
          <button
            onClick={() => setRsvpFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rsvpFilter === '' ? 'bg-amber-500/20 text-gold-300' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Guests
          </button>
          <button
            onClick={() => setRsvpFilter('Confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rsvpFilter === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:text-white'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setRsvpFilter('Pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rsvpFilter === 'Pending' ? 'bg-amber-500/20 text-amber-300' : 'text-gray-400 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setRsvpFilter('Declined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rsvpFilter === 'Declined' ? 'bg-rose-500/20 text-rose-300' : 'text-gray-400 hover:text-white'
            }`}
          >
            Declined
          </button>
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-charcoal-800/80 border border-amber-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">All Categories</option>
          <option value="Groom Family">Groom Family</option>
          <option value="Bride Family">Bride Family</option>
          <option value="Groom Friend">Groom Friend</option>
          <option value="Bride Friend">Bride Friend</option>
          <option value="VIP">VIP</option>
        </select>
      </div>

      {/* Guest Table */}
      {loading ? (
        <LoadingSpinner label="Loading guest list..." />
      ) : guests.length === 0 ? (
        <EmptyState
          title="No Guests Found"
          description="No guests match your active search or filter rules. Click below to add your first guest."
          actionText="Add New Guest"
          onAction={handleOpenAdd}
          icon={Users}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-amber-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-charcoal-800/60 border-b border-amber-500/10 text-gold-300 uppercase tracking-wider font-medium">
                <tr>
                  <th className="p-4">Guest Name</th>
                  <th className="p-4">Family Group</th>
                  <th className="p-4">Contact info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Plus-Ones</th>
                  <th className="p-4">RSVP Status</th>
                  <th className="p-4">Assigned Events</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {guests.map((guest) => (
                  <tr key={guest._id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-4 font-medium text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gold-gradient text-charcoal-900 flex items-center justify-center font-bold font-serif text-xs">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{guest.name}</p>
                          {guest.notes && <p className="text-[10px] text-gray-400">{guest.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {guest.family ? (
                        <span className="inline-flex items-center space-x-1 text-amber-300 font-medium">
                          <Home className="w-3 h-3 text-gold-400" />
                          <span>{guest.family.name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4 space-y-0.5">
                      {guest.email && (
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Mail className="w-3 h-3 text-amber-400/70" />
                          <span>{guest.email}</span>
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Phone className="w-3 h-3 text-amber-400/70" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-500/10 text-gold-300 border border-amber-500/20 shadow-sm">
                        {guest.category}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-gray-200">
                      +{guest.allowedPlusOnes}
                    </td>
                    <td className="p-4">
                      <Badge status={guest.rsvpStatus} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {guest.events && guest.events.length > 0 ? (
                          guest.events.map((ev) => (
                            <span key={ev._id || ev} className="px-2 py-0.5 text-[10px] bg-charcoal-700 text-gray-300 rounded border border-white/5">
                              {ev.name || 'Event'}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-[10px]">All Events</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleGenerateQR(guest._id)}
                          disabled={generatingQR === guest._id}
                          title="Generate & View QR Invitation Token"
                          className="p-1.5 text-gold-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(guest)}
                          title="Edit Guest"
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(guest._id)}
                          title="Delete Guest"
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGuest ? 'Edit Guest Details' : 'Add New Wedding Guest'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Guest Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tariq Mansoor"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Groom Family">Groom Family</option>
                <option value="Bride Family">Bride Family</option>
                <option value="Groom Friend">Groom Friend</option>
                <option value="Bride Friend">Bride Friend</option>
                <option value="VIP">VIP</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="guest@example.com"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Assign Family</label>
              <select
                value={formData.family}
                onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">No Family (Individual)</option>
                {families.map((fam) => (
                  <option key={fam._id} value={fam._id}>
                    {fam.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Allowed Plus-Ones</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.allowedPlusOnes}
                onChange={(e) => setFormData({ ...formData, allowedPlusOnes: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">RSVP Status</label>
              <select
                value={formData.rsvpStatus}
                onChange={(e) => setFormData({ ...formData, rsvpStatus: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          {/* Assigned Events Checkboxes */}
          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-2">Assigned Wedding Events</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {events.map((ev) => (
                <label key={ev._id} className="flex items-center space-x-2 p-2 rounded-xl bg-charcoal-800 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(ev._id)}
                    onChange={() => handleEventCheckbox(ev._id)}
                    className="rounded accent-amber-500"
                  />
                  <span className="text-gray-200 font-medium">{ev.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Notes / Preferences</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Dietary preference, special seating required..."
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
              className="px-5 py-2 font-bold text-charcoal-900 bg-gold-gradient rounded-xl hover:opacity-95 shadow-md shadow-amber-500/20"
            >
              {editingGuest ? 'Save Changes' : 'Create Guest'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Generated Invitation QR Preview Modal */}
      {generatedInvite && (
        <Modal
          isOpen={!!generatedInvite}
          onClose={() => setGeneratedInvite(null)}
          title="Generated Secure QR Invitation"
          maxWidth="max-w-md"
        >
          <div className="text-center space-y-4 p-2">
            <div className="p-4 bg-white rounded-2xl inline-block border-4 border-amber-500/30 shadow-xl">
              <img src={generatedInvite.qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Unique Secure Token</p>
              <h3 className="text-2xl font-mono font-bold text-white tracking-widest">{generatedInvite.secureToken}</h3>
            </div>

            <div className="p-3 bg-charcoal-800/80 rounded-xl border border-amber-500/20 text-xs text-gray-300 space-y-1">
              <p><span className="text-gray-400">Guest:</span> <strong className="text-white">{generatedInvite.guest?.name}</strong></p>
              <p><span className="text-gray-400">Public Link:</span></p>
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
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Guest"
        message="Are you sure you want to remove this guest? This will also remove associated check-ins and invitations."
      />
    </div>
  );
};

export default Guests;
