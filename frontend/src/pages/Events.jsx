import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  Shirt
} from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '18:00',
    endTime: '23:00',
    venue: '',
    address: '',
    description: '',
    dressCode: ''
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents();
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      date: '2027-03-19',
      startTime: '18:00',
      endTime: '23:00',
      venue: '',
      address: '',
      description: '',
      dressCode: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      startTime: event.startTime || '18:00',
      endTime: event.endTime || '23:00',
      venue: event.venue || '',
      address: event.address || '',
      description: event.description || '',
      dressCode: event.dressCode || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, formData);
      } else {
        await eventService.createEvent(formData);
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to save event');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await eventService.deleteEvent(deleteId);
      setDeleteId(null);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-gold-400" />
            <span>Wedding Ceremonies & Events</span>
          </h1>
          <p className="text-xs text-gray-400">Schedule Mehndi, Baraat, Nikkah, and Walima functions with location & RSVP stats</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all text-xs flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading wedding timeline..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="No Events Scheduled"
          description="Create your first wedding event (e.g. Nikkah, Mehndi, Baraat) to begin inviting guests."
          actionText="Create Event"
          onAction={handleOpenAdd}
          icon={Calendar}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev, index) => (
            <div key={ev._id} className="glass-card glass-card-hover p-6 rounded-2xl border border-amber-500/15 space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    Event #{index + 1}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white mt-1">{ev.name}</h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(ev._id)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timing & Venue */}
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-center space-x-2 text-amber-300">
                  <Calendar className="w-4 h-4 text-gold-400" />
                  <span className="font-semibold">
                    {new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-gray-300">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span>{ev.startTime} - {ev.endTime}</span>
                </div>

                <div className="flex items-start space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{ev.venue}</strong>
                    {ev.address && <p className="text-gray-400 text-[11px]">{ev.address}</p>}
                  </div>
                </div>

                {ev.dressCode && (
                  <div className="flex items-center space-x-2 text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                    <Shirt className="w-4 h-4 text-purple-400" />
                    <span>Dress Code: <strong>{ev.dressCode}</strong></span>
                  </div>
                )}

                {ev.description && (
                  <p className="text-gray-400 italic pt-1">{ev.description}</p>
                )}
              </div>

              {/* Attendance Analytics Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-center">
                <div className="p-2 rounded-xl bg-charcoal-800/80 border border-white/5">
                  <p className="text-[10px] text-gray-400 uppercase">Assigned</p>
                  <p className="text-base font-serif font-bold text-white">{ev.assignedGuestsCount || 0}</p>
                </div>
                <div className="p-2 rounded-xl bg-charcoal-800/80 border border-white/5">
                  <p className="text-[10px] text-emerald-400 uppercase">Confirmed</p>
                  <p className="text-base font-serif font-bold text-emerald-400">{ev.confirmedCount || 0}</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] text-gold-300 uppercase">Checked In</p>
                  <p className="text-base font-serif font-bold text-gold-300">{ev.checkInCount || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event Details' : 'Create New Wedding Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Event Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Grand Baraat Banquet"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Venue Name *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Serena Grand Ballroom"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-300 mb-1">Dress Code</label>
              <input
                type="text"
                value={formData.dressCode}
                onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                placeholder="e.g. Royal Traditional Ethnic"
                className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Address Location</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Khayaban-e-Suhrawardy, Islamabad"
              className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-gray-300 mb-1">Description / Guidelines</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event sequence, details..."
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
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This will unassign it from guests and check-ins."
      />
    </div>
  );
};

export default Events;
