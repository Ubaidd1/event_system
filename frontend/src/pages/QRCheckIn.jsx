import React, { useState, useEffect } from 'react';
import { checkinService } from '../services/checkinService';
import { eventService } from '../services/eventService';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Search,
  History,
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const QRCheckIn = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [checkInSuccess, setCheckInSuccess] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchEventsAndHistory = async () => {
    try {
      const [evRes, histRes] = await Promise.all([
        eventService.getEvents(),
        checkinService.getCheckInHistory()
      ]);
      setEvents(evRes.data || []);
      if (evRes.data && evRes.data.length > 0) {
        setSelectedEventId(evRes.data[0]._id);
      }
      setHistory(histRes.data?.checkIns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchEventsAndHistory();
  }, []);

  const handleVerify = async (tokenToVerify) => {
    const targetToken = tokenToVerify || tokenInput;
    if (!targetToken) return;

    setVerifying(true);
    setVerificationResult(null);
    setCheckInSuccess(null);

    try {
      const res = await checkinService.verifyQR(targetToken, selectedEventId);
      setVerificationResult(res.data);
      if (res.data.valid && res.data.invitation) {
        setAttendeesCount(res.data.invitation.allowedAttendees || 1);
      }
    } catch (err) {
      setVerificationResult({
        valid: false,
        status: 'INVALID',
        message: err.message || 'Verification error'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!verificationResult?.invitation) return;

    try {
      const res = await checkinService.processCheckIn({
        invitationId: verificationResult.invitation.id,
        eventId: selectedEventId,
        attendeesCount: attendeesCount
      });
      setCheckInSuccess(res.data.message);
      setVerificationResult(null);
      setTokenInput('');
      fetchEventsAndHistory();
    } catch (err) {
      alert(err.message || 'Check-in failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-emerald-400" />
            <span>Entrance QR Check-In Portal</span>
          </h1>
          <p className="text-xs text-gray-400">Mobile/Tablet entrance security portal for real-time guest pass verification and duplicate prevention</p>
        </div>

        {/* Event Selector */}
        <div className="flex items-center space-x-2 bg-charcoal-800 p-2 rounded-2xl border border-amber-500/20">
          <Calendar className="w-4 h-4 text-gold-400" />
          <span className="text-xs font-semibold text-gray-300">Active Event:</span>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setVerificationResult(null);
            }}
            className="bg-charcoal-900 text-xs font-serif font-bold text-gold-300 px-3 py-1.5 rounded-xl border border-amber-500/30 focus:outline-none"
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.name} ({ev.venue})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Scanner & Manual Token Input Area */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-amber-500/20 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-serif font-bold text-white">Scan Guest QR Pass</h3>
            <p className="text-xs text-gray-400">Position guest QR pass code or enter secure token below</p>
          </div>

          {/* Scanner Simulation Area */}
          <div className="p-8 rounded-2xl bg-charcoal-900 border-2 border-dashed border-amber-500/30 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors flex items-center justify-center"></div>
            <div className="relative z-10 space-y-3">
              <QrCode className="w-16 h-16 mx-auto text-gold-400 animate-pulse" />
              <p className="text-xs font-mono text-amber-200/80">Camera Scanner Active</p>
            </div>
          </div>

          {/* Manual Token Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="Enter Token e.g. INV-8F72A9C1..."
                className="w-full pl-10 pr-4 py-2.5 bg-charcoal-800 border border-amber-500/20 rounded-xl text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || !tokenInput}
              className="px-5 py-2.5 bg-gold-gradient text-charcoal-900 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:opacity-95"
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {/* Sample Token Helper Shortcuts */}
          <div className="pt-2">
            <p className="text-[11px] text-gray-400 font-semibold mb-2">Test Sample Tokens:</p>
            <div className="flex flex-wrap gap-2">
              {['INV-8F72A9C1', 'INV-9K41B8X2', 'INV-3M19C5Z7'].map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    setTokenInput(sample);
                    handleVerify(sample);
                  }}
                  className="px-2.5 py-1 bg-charcoal-800 hover:bg-charcoal-700 text-gold-300 font-mono text-xs rounded-lg border border-amber-500/20"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Result Verification Display Area */}
        <div className="lg:col-span-6 space-y-4">
          {/* Successful Check-in Banner */}
          {checkInSuccess && (
            <div className="glass-card p-6 rounded-3xl border-2 border-emerald-500/40 bg-emerald-500/10 space-y-3 animate-fade-in text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-2xl font-serif font-bold text-white">Check-In Successful</h3>
              <p className="text-sm font-semibold text-emerald-300">{checkInSuccess}</p>
            </div>
          )}

          {/* Verification Result Card */}
          {verificationResult && (
            <div className="glass-card p-6 rounded-3xl border-2 border-amber-500/30 space-y-5 animate-fade-in">
              {/* VALID RESULT */}
              {verificationResult.status === 'VALID' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>✓ Valid Invitation Verified</span>
                  </div>

                  <div className="p-4 bg-charcoal-800/80 rounded-2xl border border-amber-500/20 space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-white">
                      {verificationResult.invitation.guestName}
                    </h3>
                    {verificationResult.invitation.family && (
                      <p className="text-xs text-amber-300 font-medium">Family: {verificationResult.invitation.family}</p>
                    )}
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-gold-300 border border-amber-500/20">
                        Category: {verificationResult.invitation.category}
                      </span>
                      <Badge status={verificationResult.invitation.rsvpStatus} />
                    </div>
                  </div>

                  <div className="p-4 bg-charcoal-800/80 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span>Target Event:</span>
                      <strong className="text-gold-300">{verificationResult.event?.name}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span>Invited Guests Count:</span>
                      <strong className="text-white font-mono">{verificationResult.invitation.allowedAttendees} Guests</strong>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm Checked-In Attendees</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={attendeesCount}
                        onChange={(e) => setAttendeesCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2.5 bg-charcoal-900 border border-amber-500/20 rounded-xl text-white font-bold font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmCheckIn}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>[ Confirm Entrance Check-In ]</span>
                  </button>
                </div>
              )}

              {/* DUPLICATE RESULT */}
              {verificationResult.status === 'DUPLICATE' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-lg">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                      <span>⚠ Already Checked In</span>
                    </div>
                    <p className="text-xs text-amber-200/90">{verificationResult.message}</p>

                    <div className="p-3 bg-charcoal-800 rounded-xl text-xs space-y-1 text-gray-300">
                      <p>Guest: <strong className="text-white">{verificationResult.invitation.guestName}</strong></p>
                      <p>Scanned At: <strong className="text-gold-300">{new Date(verificationResult.checkInDetails.scannedAt).toLocaleTimeString()}</strong></p>
                      <p>Scanned By: <strong className="text-white">{verificationResult.checkInDetails.scannedBy}</strong></p>
                    </div>
                  </div>
                </div>
              )}

              {/* EVENT MISMATCH RESULT */}
              {verificationResult.status === 'EVENT_MISMATCH' && (
                <div className="p-5 bg-rose-500/10 border-2 border-rose-500/50 rounded-2xl space-y-3 text-center">
                  <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
                  <h3 className="text-xl font-serif font-bold text-rose-400">⚠ Event Pass Mismatch!</h3>
                  <p className="text-xs text-rose-200 font-semibold">{verificationResult.message}</p>
                  <div className="p-3 bg-charcoal-800 rounded-xl text-xs space-y-1.5 text-gray-300 text-left border border-white/10">
                    <p>Guest Name: <strong className="text-white">{verificationResult.invitation?.guestName}</strong></p>
                    <p>Pass Issued For: <strong className="text-gold-300">{verificationResult.passEvent?.name}</strong></p>
                    <p>Active Entrance: <strong className="text-rose-400">{verificationResult.scannerEvent?.name}</strong></p>
                  </div>
                </div>
              )}

              {/* INVALID RESULT */}
              {verificationResult.status === 'INVALID' && (
                <div className="p-4 bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl space-y-3 text-center">
                  <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
                  <h3 className="text-xl font-serif font-bold text-rose-400">✕ Invalid QR Code</h3>
                  <p className="text-xs text-gray-300">{verificationResult.message}</p>
                </div>
              )}
            </div>
          )}

          {!verificationResult && !checkInSuccess && (
            <div className="glass-card p-10 rounded-3xl border border-amber-500/10 text-center space-y-3 min-h-[300px] flex flex-col items-center justify-center">
              <QrCode className="w-12 h-12 text-gray-600" />
              <h4 className="text-lg font-serif text-gray-300">Waiting for Scan</h4>
              <p className="text-xs text-gray-500">Scan or enter token to view real-time entrance verification status.</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Entrance Check-in Logs Table */}
      <div className="glass-card p-6 rounded-3xl border border-amber-500/10 space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
          <h3 className="text-lg font-serif font-semibold text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-gold-400" />
            <span>Check-In History Log</span>
          </h3>
        </div>

        {loadingHistory ? (
          <LoadingSpinner label="Loading entrance logs..." />
        ) : history.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No check-ins recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-charcoal-800/60 border-b border-white/5 text-gold-300 uppercase tracking-wider font-medium">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Guest / Family</th>
                  <th className="p-3">Event</th>
                  <th className="p-3 text-center">Attendees</th>
                  <th className="p-3">Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-amber-500/5">
                    <td className="p-3 font-mono text-amber-300">
                      {new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {item.guest?.name || item.family?.name || 'Guest'}
                    </td>
                    <td className="p-3 text-gray-300">{item.event?.name || 'Event'}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-400">
                      {item.attendeesCount} Guests
                    </td>
                    <td className="p-3 text-gray-400">{item.scannedBy?.name || 'Staff'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCheckIn;
