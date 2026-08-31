import React, { useState, useEffect } from 'react';
import { invitationService } from '../services/invitationService';
import { guestService } from '../services/guestService';
import { familyService } from '../services/familyService';
import { eventService } from '../services/eventService';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Mail,
  QrCode,
  Sparkles,
  Plus,
  Eye,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  Award,
  Calendar
} from 'lucide-react';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [families, setFamilies] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const [previewInvite, setPreviewInvite] = useState(null);

  const [formData, setFormData] = useState({
    recipientType: 'guest', // 'guest' or 'family'
    guestId: '',
    familyId: '',
    eventId: '',
    templateStyle: 'Royal Gold',
    title: 'Together with their families',
    customMessage: 'We request the pleasure of your company to celebrate our wedding celebration.'
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [invRes, gRes, fRes, eRes] = await Promise.all([
        invitationService.getInvitations(),
        guestService.getGuests(),
        familyService.getFamilies(),
        eventService.getEvents()
      ]);
      setInvitations(invRes.data || []);
      setGuests(gRes.data.guests || []);
      setFamilies(fRes.data || []);
      setEvents(eRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      recipientType: 'guest',
      guestId: guests[0]?._id || '',
      familyId: families[0]?._id || '',
      eventId: events[0]?._id || '',
      templateStyle: 'Royal Gold',
      title: 'Together with their families',
      customMessage: 'We request the pleasure of your company to celebrate our wedding celebration.'
    });
    setIsModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        eventId: formData.eventId,
        templateStyle: formData.templateStyle,
        title: formData.title,
        customMessage: formData.customMessage
      };

      if (formData.recipientType === 'guest') {
        payload.guestId = formData.guestId;
      } else {
        payload.familyId = formData.familyId;
      }

      await invitationService.createInvitation(payload);
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert(err.message || 'Failed to create invitation');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invitation pass?')) return;
    try {
      await invitationService.deleteInvitation(id);
      fetchInitialData();
    } catch (err) {
      alert(err.message || 'Failed to delete invitation');
    }
  };

  const handleCopyLink = (token) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <Mail className="w-6 h-6 text-gold-400" />
            <span>Invitation Cards & Secure QR Passes</span>
          </h1>
          <p className="text-xs text-gray-400">Design personalized wedding invitation posters with encrypted QR access tokens</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all text-xs flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Invitation</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading invitations database..." />
      ) : invitations.length === 0 ? (
        <EmptyState
          title="No Invitations Created"
          description="Generate personalized luxury invitation cards with unique secure QR codes for your guests."
          actionText="Generate Invitation"
          onAction={handleOpenCreate}
          icon={Mail}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv) => (
            <div key={inv._id} className="glass-card glass-card-hover p-6 rounded-2xl border border-amber-500/20 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-gold-300 border border-amber-500/20">
                    {inv.templateStyle}
                  </span>
                  {inv.event && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>{inv.event.name}</span>
                    </span>
                  )}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPreviewInvite(inv)}
                      className="p-1.5 text-gold-300 hover:bg-amber-500/10 rounded-lg"
                      title="Interactive Card Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(inv._id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-center py-2 border-y border-white/5 space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white">
                    {inv.guest?.name || inv.family?.name || 'Honored Guest'}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono">Token: <strong className="text-gold-300">{inv.secureToken}</strong></p>
                </div>

                <div className="flex justify-center">
                  <div className="p-2 bg-white rounded-xl shadow-lg border border-amber-500/30">
                    <img src={inv.qrCodeUrl} alt="QR" className="w-28 h-28 mx-auto" />
                  </div>
                </div>

                <p className="text-xs text-center text-gray-400 italic line-clamp-2">
                  "{inv.customMessage}"
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopyLink(inv.secureToken)}
                  className="flex-1 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-xs text-gray-200 font-semibold rounded-xl border border-white/10 flex items-center justify-center space-x-1 transition-colors"
                >
                  {copiedToken === inv.secureToken ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copy Public Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`/invite/${inv.secureToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-gold-300 border border-amber-500/30 rounded-xl transition-colors"
                  title="Open Public Card View"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Invitation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Secure Invitation Card"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Target Recipient</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, recipientType: 'guest' })}
                className={`py-2 rounded-xl text-xs font-semibold border ${
                  formData.recipientType === 'guest'
                    ? 'bg-amber-500/20 text-gold-300 border-amber-500/40'
                    : 'bg-charcoal-800 text-gray-400 border-white/5'
                }`}
              >
                Individual Guest
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, recipientType: 'family' })}
                className={`py-2 rounded-xl text-xs font-semibold border ${
                  formData.recipientType === 'family'
                    ? 'bg-amber-500/20 text-gold-300 border-amber-500/40'
                    : 'bg-charcoal-800 text-gray-400 border-white/5'
                }`}
              >
                Family Circle
              </button>
            </div>

            {formData.recipientType === 'guest' ? (
              <select
                value={formData.guestId}
                onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                {guests.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name} ({g.category})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={formData.familyId}
                onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                {families.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} (Family Group)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Target Event Pass *</label>
            <select
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white font-serif font-semibold focus:outline-none focus:border-amber-500"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name} ({ev.venue})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">Each event requires its own unique event-specific QR pass code.</p>
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Invitation Theme Style</label>
            <select
              value={formData.templateStyle}
              onChange={(e) => setFormData({ ...formData, templateStyle: e.target.value })}
              className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Royal Gold">Royal Gold</option>
              <option value="Modern Ivory">Modern Ivory</option>
              <option value="Velvet Rose">Velvet Rose</option>
              <option value="Classic Midnight">Classic Midnight</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Header Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Custom Message</label>
            <textarea
              rows="3"
              value={formData.customMessage}
              onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
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
              Generate QR Card
            </button>
          </div>
        </form>
      </Modal>

      {/* Interactive Invitation Preview Modal */}
      {previewInvite && (
        <Modal
          isOpen={!!previewInvite}
          onClose={() => setPreviewInvite(null)}
          title="Invitation Card Preview"
          maxWidth="max-w-lg"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-b from-charcoal-800 to-charcoal-900 border-2 border-amber-500/30 text-center space-y-6">
            <div className="space-y-1">
              <Sparkles className="w-8 h-8 text-gold-400 mx-auto" />
              <h2 className="text-3xl font-serif font-bold text-gold-gradient">Abdullah & Sarah</h2>
              <p className="text-xs uppercase tracking-widest text-amber-200/70 font-semibold">Wedding Celebration</p>
            </div>

            <div className="py-4 border-y border-amber-500/20 space-y-2">
              <p className="text-xs uppercase tracking-wider text-gray-400">{previewInvite.title}</p>
              <h3 className="text-xl font-serif font-bold text-white">
                {previewInvite.guest?.name || previewInvite.family?.name || 'Honored Guest'}
              </h3>
              <p className="text-xs text-gray-300 italic px-4 font-serif">
                "{previewInvite.customMessage}"
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block border-2 border-amber-500/40 shadow-2xl">
              <img src={previewInvite.qrCodeUrl} alt="QR" className="w-40 h-40 mx-auto" />
              <p className="text-[10px] font-mono text-gray-700 font-bold mt-1">Pass Token: {previewInvite.secureToken}</p>
            </div>

            <div className="text-[11px] text-amber-200/60 font-medium">
              Present this secure QR code at entrance for event check-in
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Invitations;
