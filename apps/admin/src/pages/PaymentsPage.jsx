import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { PaymentStatus, PaymentMode } from '../contracts';

export default function PaymentsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'OFFLINE' ? 'OFFLINE' : PaymentStatus.PENDING;

  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState(initialTab);
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [screenshotModalUrl, setScreenshotModalUrl] = useState(null);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [fraudModalItem, setFraudModalItem] = useState(null);
  const [fraudReason, setFraudReason] = useState('');
  const [offlineModalOpen, setOfflineModalOpen] = useState(initialTab === 'OFFLINE');

  // Offline Form
  const [offlineForm, setOfflineForm] = useState({
    memberId: '',
    eventId: '',
    amount: '',
    paymentMode: PaymentMode.CASH,
    status: PaymentStatus.PAID
  });
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get('tab') === 'OFFLINE') {
      setStatusFilter('OFFLINE');
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, mRes, eRes] = await Promise.all([
        api.getContributions(),
        api.getMembers(),
        api.getEvents()
      ]);
      setContributions(cRes.data);
      setMembers(mRes.data);
      setEvents(eRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contribution) => {
    try {
      await api.verifyContribution(contribution._id, 'APPROVE');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setActionError('Rejection reason is mandatory.');
      return;
    }
    try {
      await api.verifyContribution(rejectModalItem._id, 'REJECT', rejectReason);
      setRejectModalItem(null);
      setRejectReason('');
      setActionError('');
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleFraudSubmit = async (e) => {
    e.preventDefault();
    if (!fraudReason.trim()) {
      setActionError('Reason is required to log confirmed fraudulent attempt.');
      return;
    }
    try {
      const res = await api.flagFraud(fraudModalItem._id, fraudReason);
      setFraudModalItem(null);
      setFraudReason('');
      setActionError('');
      loadData();

      if (res.data.member.hasRedBorder) {
        alert(`🚨 STRIKE THRESHOLD EXCEEDED (> 5 strikes)!\n\nDevotee ${res.data.member.name} has now received a RED BORDER visible publicly across the entire platform per SRS Section 7.`);
      } else {
        alert(`Fraud strike recorded for ${res.data.member.name}. Current strikes: ${res.data.member.fakePaymentCount}/5.`);
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleOfflineSubmit = async (e) => {
    e.preventDefault();
    if (!offlineForm.memberId || !offlineForm.eventId || !offlineForm.amount) {
      setActionError('All fields are required');
      return;
    }
    try {
      await api.recordOfflineContribution(offlineForm);
      setOfflineModalOpen(false);
      setOfflineForm({
        memberId: '',
        eventId: '',
        amount: '',
        paymentMode: PaymentMode.CASH,
        status: PaymentStatus.PAID
      });
      setActionError('');
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const filteredContributions = contributions.filter(c => {
    if (statusFilter === 'OFFLINE' && !c.isOffline) return false;
    if (statusFilter !== 'ALL' && statusFilter !== 'OFFLINE' && c.status !== statusFilter) return false;
    if (selectedEventId !== 'ALL' && c.eventId !== selectedEventId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mName = c.member?.name?.toLowerCase() || '';
      const mMobile = c.member?.mobileNumber || '';
      const eTitle = c.event?.title?.toLowerCase() || '';
      if (!mName.includes(q) && !mMobile.includes(q) && !eTitle.includes(q)) return false;
    }
    return true;
  });

  const pendingCount = contributions.filter(c => c.status === PaymentStatus.PENDING).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline text-headline-sm text-secondary">Payment Verification Hub</h2>
          <p className="text-xs text-on-surface-muted">
            Audit devotee UPI screenshots, approve donations, and record offline offerings
          </p>
        </div>

        <button
          onClick={() => {
            setActionError('');
            setOfflineModalOpen(true);
          }}
          className="bg-primary hover:bg-[#C85A17] text-white px-4 py-2 rounded-full font-label text-label-sm font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Record Offline Offering</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-surface-muted rounded-xl text-xs font-semibold">
          {[
            { id: PaymentStatus.PENDING, label: 'Pending Verifications', count: pendingCount },
            { id: PaymentStatus.PAID, label: 'Approved (Paid)' },
            { id: PaymentStatus.REJECTED, label: 'Rejected / Flagged' },
            { id: 'OFFLINE', label: 'Offline Records' },
            { id: 'ALL', label: 'All Submissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition font-label flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-secondary text-white shadow-xs font-bold'
                  : 'text-on-surface-muted hover:text-secondary'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id ? 'bg-accent text-on-accent' : 'bg-warning text-white'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined text-sm absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted">
              search
            </span>
            <input
              type="text"
              placeholder="Search member or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-surface-card border border-border rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none w-52 font-body"
            />
          </div>

          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-1.5 bg-surface-card border border-border rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none font-body text-secondary font-semibold"
          >
            <option value="ALL">All Events</option>
            {events.map(e => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-on-surface-muted text-sm font-label">
            Loading contribution records...
          </div>
        ) : filteredContributions.length === 0 ? (
          <div className="p-12 text-center text-on-surface-muted">
            <span className="material-symbols-outlined text-4xl text-accent mb-2">payments</span>
            <p className="text-sm font-bold text-secondary font-headline">No offerings found</p>
            <p className="text-xs text-on-surface-muted mt-0.5">Switch status tabs or clear search filters to view more.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="bg-surface-muted/60 border-b border-border text-on-surface-muted font-label text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt ID</th>
                  <th className="py-3 px-4">Member Info</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Payment Proof</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContributions.map((c) => {
                  const isRedBorder = c.member?.hasRedBorder;
                  const isPending = c.status === PaymentStatus.PENDING;
                  const isPaid = c.status === PaymentStatus.PAID;
                  const isRejected = c.status === PaymentStatus.REJECTED;

                  const initials = c.member?.name
                    ? c.member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'DV';

                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-surface-muted/40 transition-colors ${
                        isRedBorder ? 'bg-red-50/40' : ''
                      }`}
                    >
                      {/* Receipt ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-secondary">
                        #RCP-{c._id.slice(-4).toUpperCase()}
                      </td>

                      {/* Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isRedBorder
                                ? 'fraud-red-border bg-red-100 text-red-700'
                                : 'bg-primary/20 text-primary'
                            }`}
                          >
                            {initials}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-secondary">{c.member?.name}</span>
                              {isRedBorder && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-fraud text-white font-extrabold rounded">
                                  RED BORDER
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-on-surface-muted font-mono block">
                              {c.member?.mobileNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-[170px]">
                          <span className="font-medium text-secondary truncate block">
                            {c.event?.title}
                          </span>
                          {c.isEventCancelled && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-error/10 text-error font-bold inline-block mt-0.5">
                              Cancelled Event
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-bold font-mono text-secondary text-sm">
                        ₹{c.amount?.toLocaleString('en-IN')}
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-surface-muted text-on-surface-muted">
                          {c.paymentMode} {c.isOffline ? '· (Offline)' : ''}
                        </span>
                      </td>

                      {/* Payment Proof */}
                      <td className="py-3.5 px-4">
                        {c.paymentProofUrl ? (
                          <button
                            onClick={() => setScreenshotModalUrl(c.paymentProofUrl)}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            <span className="material-symbols-outlined text-sm">image</span>
                            <span>Preview Proof</span>
                          </button>
                        ) : (
                          <span className="text-on-surface-muted italic text-xs">
                            {c.isOffline ? 'Counter Entry' : 'None'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            isPaid
                              ? 'bg-success/10 text-success'
                              : isPending
                              ? 'bg-warning/15 text-warning font-mono'
                              : 'bg-error/10 text-error'
                          }`}
                        >
                          {c.status}
                        </span>
                        {c.rejectionReason && (
                          <p className="text-[10px] text-error mt-0.5 max-w-[130px] truncate" title={c.rejectionReason}>
                            {c.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-on-surface-muted font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(c)}
                              className="bg-success hover:bg-[#156639] text-white px-2.5 py-1 rounded-full text-xs font-label font-semibold inline-flex items-center gap-1 shadow-sm transition"
                              title="Approve Offering"
                            >
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => {
                                setRejectModalItem(c);
                                setRejectReason('');
                                setActionError('');
                              }}
                              className="border border-border text-on-surface-muted hover:bg-surface-muted px-2.5 py-1 rounded-full text-xs font-label font-semibold transition"
                              title="Reject Offering"
                            >
                              <span>Reject</span>
                            </button>

                            <button
                              onClick={() => {
                                setFraudModalItem(c);
                                setFraudReason('');
                                setActionError('');
                              }}
                              className="p-1 rounded-full text-error hover:bg-error/10 transition"
                              title="Flag Confirmed Fraud (SRS Section 7)"
                            >
                              <span className="material-symbols-outlined text-base">shield</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-on-surface-muted text-[11px] font-mono">Audited</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Viewer Modal */}
      {screenshotModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="font-headline font-bold text-secondary text-sm">UPI Payment Proof Screenshot</span>
              <button
                onClick={() => setScreenshotModalUrl(null)}
                className="text-on-surface-muted hover:text-secondary p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="mt-3 bg-surface-muted rounded-xl overflow-hidden flex items-center justify-center max-h-[70vh]">
              <img
                src={screenshotModalUrl}
                alt="Payment Proof"
                className="w-full h-auto object-contain max-h-[68vh]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Submission Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border">
            <h3 className="font-headline font-bold text-secondary text-base">
              Reject Offering of ₹{rejectModalItem.amount}?
            </h3>
            <p className="text-xs text-on-surface-muted mt-1">
              Devotee: <strong>{rejectModalItem.member?.name}</strong>. Rejection requires a mandatory reason.
            </p>

            {actionError && (
              <div className="mt-2 p-2 bg-error/10 text-error text-xs rounded-lg border border-error/20">
                {actionError}
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Screenshot blurry, amount mismatch, or incomplete transaction confirmation..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 border border-border rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalItem(null)}
                  className="px-4 py-2 border border-border rounded-full text-xs font-semibold text-on-surface-muted hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-white rounded-full text-xs font-bold shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag Fraud Modal */}
      {fraudModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-error/30">
            <div className="flex items-center gap-2 text-error mb-2">
              <span className="material-symbols-outlined text-2xl">shield_with_heart</span>
              <h3 className="font-headline font-bold text-secondary text-base">
                Flag Offering as Fraudulent?
              </h3>
            </div>
            <p className="text-xs text-on-surface-muted">
              Devotee: <strong>{fraudModalItem.member?.name}</strong>. Confirmed strikes:{' '}
              <strong className="text-error font-mono">{fraudModalItem.member?.fakePaymentCount || 0}/5</strong>.
            </p>

            <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-xl text-[11px] text-error space-y-1">
              <span className="font-bold">SRS Section 7 Fraud Threshold Rule:</span>
              <p>Confirmed fake attempts are permanently recorded. If strikes exceed 5, the devotee receives an automatic public <strong>Red Border</strong>.</p>
            </div>

            {actionError && (
              <div className="mt-2 p-2 bg-error/10 text-error text-xs rounded-lg border border-error/20">
                {actionError}
              </div>
            )}

            <form onSubmit={handleFraudSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">
                  Fraud Detection Reason *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Photoshop modified receipt, duplicate UTR from prior year..."
                  value={fraudReason}
                  onChange={(e) => setFraudReason(e.target.value)}
                  className="w-full p-2.5 border border-border rounded-xl text-xs focus:ring-2 focus:ring-error focus:outline-none bg-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFraudModalItem(null)}
                  className="px-4 py-2 border border-border rounded-full text-xs font-semibold text-on-surface-muted hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-error text-white rounded-full text-xs font-bold shadow-sm"
                >
                  Confirm Fraud Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Offline Offering Modal */}
      {offlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-headline font-bold text-secondary text-base">
                Record Offline Offering
              </h3>
              <button
                onClick={() => setOfflineModalOpen(false)}
                className="text-on-surface-muted hover:text-secondary p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-muted mt-1 mb-4">
              Manually register cash, counter UPI, or bank transfer offerings received at the temple office.
            </p>

            {actionError && (
              <div className="mb-3 p-2 bg-error/10 text-error text-xs rounded-lg border border-error/20">
                {actionError}
              </div>
            )}

            <form onSubmit={handleOfflineSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-secondary mb-1">Select Devotee *</label>
                <select
                  required
                  value={offlineForm.memberId}
                  onChange={(e) => setOfflineForm({ ...offlineForm, memberId: e.target.value })}
                  className="w-full p-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-surface font-body"
                >
                  <option value="">-- Choose registered devotee --</option>
                  {members.filter(m => m.isActive).map(m => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.mobileNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Select Event *</label>
                <select
                  required
                  value={offlineForm.eventId}
                  onChange={(e) => setOfflineForm({ ...offlineForm, eventId: e.target.value })}
                  className="w-full p-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-surface font-body"
                >
                  <option value="">-- Choose event --</option>
                  {events.map(e => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Offering Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1001"
                  value={offlineForm.amount}
                  onChange={(e) => setOfflineForm({ ...offlineForm, amount: e.target.value })}
                  className="w-full p-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-surface font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-secondary mb-1">Payment Mode *</label>
                  <select
                    value={offlineForm.paymentMode}
                    onChange={(e) => setOfflineForm({ ...offlineForm, paymentMode: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-surface font-body"
                  >
                    <option value={PaymentMode.CASH}>Cash Offering</option>
                    <option value={PaymentMode.UPI}>Counter UPI QR</option>
                    <option value={PaymentMode.BANK_TRANSFER}>Bank Transfer (NEFT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-secondary mb-1">Status *</label>
                  <select
                    value={offlineForm.status}
                    onChange={(e) => setOfflineForm({ ...offlineForm, status: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-surface font-body"
                  >
                    <option value={PaymentStatus.PAID}>Paid</option>
                    <option value={PaymentStatus.NOT_PAID}>Not Paid (Pledged)</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-muted text-on-surface-muted text-[11px]">
                <strong>SRS 6.4 Invariant:</strong> Records your admin ID and the timestamp into the permanent audit ledger.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOfflineModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-full font-semibold text-on-surface-muted hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#C85A17] text-white font-bold rounded-full shadow-sm"
                >
                  Record Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
