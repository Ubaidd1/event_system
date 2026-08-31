import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { invitationService } from '../services/invitationService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  Heart,
  Users,
  Shirt
} from 'lucide-react';

const PublicInvitation = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('Confirmed');
  const [plusOnes, setPlusOnes] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  useEffect(() => {
    const fetchPublicInvitation = async () => {
      try {
        setLoading(true);
        const res = await invitationService.getPublicInvitation(token);
        setData(res.data);
        setRsvpStatus(res.data.rsvpStatus || 'Confirmed');
        setPlusOnes(res.data.plusOnesAssigned || 0);
      } catch (err) {
        setError(err.message || 'Invalid or expired invitation link');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchPublicInvitation();
    }
  }, [token]);

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await invitationService.submitPublicRSVP(token, {
        rsvpStatus,
        plusOnesAssigned: plusOnes,
        notes
      });
      setSubmittedMessage(`Thank you! Your RSVP status has been recorded as '${rsvpStatus}'.`);
    } catch (err) {
      alert(err.message || 'Failed to submit RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4"><LoadingSpinner label="Opening your personalized invitation..." /></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-3xl text-center max-w-md border border-rose-500/30 space-y-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full inline-block">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Invitation Not Found</h2>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const { wedding, guestName, category, qrCodeUrl, events, allowedPlusOnes, title, customMessage } = data;

  return (
    <div className="min-h-screen bg-charcoal-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl glass-card rounded-3xl border-2 border-amber-500/30 p-6 sm:p-10 shadow-2xl relative z-10 space-y-8 my-8">
        {/* Luxury Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-gold-gradient rounded-2xl shadow-lg shadow-amber-500/20 text-charcoal-900">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <p className="text-xs uppercase tracking-widest text-gold-300 font-semibold">{title || 'Together with their families'}</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gold-gradient tracking-wide">
            {wedding?.coupleNames || 'Abdullah & Sarah'}
          </h1>
          <p className="text-sm font-medium text-amber-200/80">
            {wedding?.title || 'Wedding Celebration'} • 19 March 2027
          </p>
        </div>

        {/* Personalized Guest Welcome */}
        <div className="p-6 rounded-2xl bg-charcoal-800/80 border border-amber-500/20 text-center space-y-2">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Cordially Invited</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">{guestName}</h2>
          <p className="text-xs text-amber-300/90 italic font-serif max-w-md mx-auto">
            "{customMessage || 'We request the pleasure of your company to celebrate our wedding.'}"
          </p>
        </div>

        {/* Events Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-semibold text-white flex items-center space-x-2 border-b border-amber-500/15 pb-2">
            <Calendar className="w-5 h-5 text-gold-400" />
            <span>Wedding Ceremonies Schedule</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events && events.map((ev) => (
              <div key={ev._id || ev.name} className="p-4 rounded-xl bg-charcoal-800/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-gold-300 text-base">{ev.name}</h4>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                    {ev.startTime}
                  </span>
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  <div className="flex items-center space-x-1.5 text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-start space-x-1.5 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                    <span>{ev.venue}</span>
                  </div>
                  {ev.dressCode && (
                    <div className="flex items-center space-x-1.5 text-purple-300 text-[11px]">
                      <Shirt className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Dress Code: {ev.dressCode}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secure Entrance Pass QR Code */}
        <div className="p-6 rounded-2xl bg-charcoal-800/90 border-2 border-amber-500/30 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gold-300">
            <QrCode className="w-5 h-5" />
            <h3 className="text-lg font-serif font-semibold text-white">Your Secure Entrance QR Pass</h3>
          </div>

          <div className="p-4 bg-white rounded-2xl inline-block border-4 border-amber-500/40 shadow-2xl">
            <img src={qrCodeUrl} alt="QR Access Pass" className="w-48 h-48 mx-auto" />
            <p className="text-xs font-mono font-bold text-gray-800 mt-2">ACCESS TOKEN: {token}</p>
          </div>

          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Please present this secure QR code at entrance for automated check-in verification.
          </p>
        </div>

        {/* Interactive RSVP Form */}
        <div className="p-6 rounded-2xl bg-charcoal-800/60 border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-lg font-serif font-semibold text-white">Confirm Your RSVP Response</h3>
            <Badge status={rsvpStatus} />
          </div>

          {submittedMessage ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="font-semibold">{submittedMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRsvpStatus('Confirmed')}
                  className={`py-3 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all ${
                    rsvpStatus === 'Confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-charcoal-800 text-gray-400 border-white/5'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accepts with Joy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRsvpStatus('Declined')}
                  className={`py-3 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all ${
                    rsvpStatus === 'Declined'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10'
                      : 'bg-charcoal-800 text-gray-400 border-white/5'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Regretfully Declines</span>
                </button>
              </div>

              {allowedPlusOnes > 0 && rsvpStatus === 'Confirmed' && (
                <div>
                  <label className="block font-semibold uppercase text-gray-300 mb-1">
                    Number of Additional Guests (Max: {allowedPlusOnes})
                  </label>
                  <select
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {[...Array(allowedPlusOnes + 1).keys()].map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? 'Attending Alone' : `+${n} Additional Guest(s)`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold uppercase text-gray-300 mb-1">Well Wishes / Special Notes</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Send a warm message to Abdullah & Sarah..."
                  className="w-full p-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gold-gradient text-charcoal-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-opacity"
              >
                {submitting ? 'Submitting RSVP...' : 'Submit RSVP Response'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicInvitation;
