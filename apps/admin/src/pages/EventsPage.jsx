import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { EventStatus } from '../contracts';

const DEFAULT_TEMPLE_IMAGE = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80';

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(searchParams.get('action') === 'create');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [activeEvent, setActiveEvent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDateTime: '',
    expiryTime: '',
    imagesInput: '',
    isContributionRequired: true
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await api.getEvents();
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    tomorrow.setHours(9, 0, 0, 0);

    const expiry = new Date(tomorrow);
    expiry.setHours(22, 0, 0, 0);

    setFormData({
      title: '',
      description: '',
      eventDateTime: tomorrow.toISOString().slice(0, 16),
      expiryTime: expiry.toISOString().slice(0, 16),
      imagesInput: '',
      isContributionRequired: true
    });
    setFormError('');
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setActiveEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description,
      eventDateTime: new Date(evt.eventDateTime).toISOString().slice(0, 16),
      expiryTime: new Date(evt.expiryTime).toISOString().slice(0, 16),
      imagesInput: evt.images?.join('\n') || '',
      isContributionRequired: evt.isContributionRequired
    });
    setFormError('');
    setEditModalOpen(true);
  };

  const handleOpenCancel = (evt) => {
    setActiveEvent(evt);
    setCancelModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Title and description are required');
      return;
    }

    const images = formData.imagesInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    try {
      await api.createEvent({
        title: formData.title,
        description: formData.description,
        eventDateTime: formData.eventDateTime,
        expiryTime: formData.expiryTime,
        images,
        isContributionRequired: formData.isContributionRequired
      });
      setCreateModalOpen(false);
      loadEvents();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Event title is required');
      return;
    }

    const images = formData.imagesInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    try {
      await api.updateEvent(activeEvent._id, {
        title: formData.title,
        description: formData.description,
        eventDateTime: formData.eventDateTime,
        expiryTime: formData.expiryTime,
        images,
        isContributionRequired: formData.isContributionRequired
      });
      setEditModalOpen(false);
      loadEvents();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleConfirmCancel = async () => {
    if (!activeEvent) return;
    try {
      await api.cancelEvent(activeEvent._id);
      setCancelModalOpen(false);
      loadEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEvents = events.filter(e => {
    if (statusFilter === 'ALL') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline text-headline-sm text-secondary">Event Management Hub</h2>
          <p className="text-xs text-on-surface-muted">
            Create, schedule, edit, and cancel temple poojas, festivals, and cultural karyakrams.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-[#C85A17] text-white px-4 py-2 rounded-full font-label text-label-sm font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">event</span>
          <span>+ Create New Event</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-surface-muted rounded-xl w-fit text-xs font-semibold">
        {['ALL', EventStatus.UPCOMING, EventStatus.PAST, EventStatus.CANCELLED].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg transition font-label ${
              statusFilter === status
                ? 'bg-secondary text-white font-bold shadow-xs'
                : 'text-on-surface-muted hover:text-secondary'
            }`}
          >
            {status} ({events.filter(e => status === 'ALL' || e.status === status).length})
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-muted text-sm font-label">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-surface-card rounded-2xl p-12 text-center border border-dashed border-border">
          <span className="material-symbols-outlined text-4xl text-accent mb-2">event</span>
          <h3 className="text-sm font-bold text-secondary font-headline">No events found</h3>
          <p className="text-xs text-on-surface-muted mt-1">Try switching filters or create a new event.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const displayImage = evt.images && evt.images.length > 0 ? evt.images[0] : DEFAULT_TEMPLE_IMAGE;
            const isCancelled = evt.status === EventStatus.CANCELLED;
            const isPast = evt.status === EventStatus.PAST;

            return (
              <div
                key={evt._id}
                className={`bg-surface-card rounded-2xl border overflow-hidden shadow-sm flex flex-col ${
                  isCancelled ? 'border-error/40 bg-error/5' : 'border-border'
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-44 bg-surface-muted overflow-hidden">
                  <img
                    src={displayImage}
                    alt={evt.title}
                    className={`w-full h-full object-cover ${isCancelled ? 'grayscale-50' : ''}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full font-mono shadow-sm ${
                        isCancelled
                          ? 'bg-error text-white'
                          : isPast
                          ? 'bg-surface-muted text-secondary'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  {/* Photo count indicator */}
                  {evt.images?.length > 1 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                      <span className="material-symbols-outlined text-xs">image</span>
                      +{evt.images.length - 1} photos
                    </div>
                  )}

                  {/* Title */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-headline font-bold text-base leading-snug line-clamp-1">
                      {evt.title}
                    </h3>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-on-surface-muted line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-2 text-xs text-on-surface-muted pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-label">Event Date:</span>
                      <span className="font-semibold text-secondary font-mono">
                        {new Date(evt.eventDateTime).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-label">Auto Expiry:</span>
                      <span className="font-semibold text-secondary font-mono">
                        {new Date(evt.expiryTime).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-label">Kanikai Offering:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          evt.isContributionRequired
                            ? 'bg-success/10 text-success'
                            : 'bg-surface-muted text-on-surface-muted'
                        }`}
                      >
                        {evt.isContributionRequired ? 'Required (Online UPI)' : 'Free / Not Required'}
                      </span>
                    </div>

                    {isCancelled && evt.cancelledAt && (
                      <div className="p-2 rounded-lg bg-error/10 text-error text-[11px] flex items-start gap-1.5 border border-error/20">
                        <span className="material-symbols-outlined text-sm mt-0.5">warning</span>
                        <div>
                          <strong>Cancelled:</strong> {new Date(evt.cancelledAt).toLocaleString('en-IN')}
                          <p className="text-[10px] text-error mt-0.5">
                            SRS 3.3: Offering records preserved. No refunds.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="px-3 py-1.5 rounded-full border border-border text-secondary hover:bg-surface-muted font-semibold text-xs flex items-center gap-1 transition"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                      <span>Edit</span>
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => handleOpenCancel(evt)}
                        className="px-3 py-1.5 rounded-full border border-error/30 text-error hover:bg-error/10 font-semibold text-xs flex items-center gap-1 transition"
                      >
                        <span className="material-symbols-outlined text-xs">cancel</span>
                        <span>Cancel Event</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-base font-bold text-secondary font-headline">Create New Temple Event</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-on-surface-muted hover:text-secondary p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="my-3 p-3 rounded-xl bg-error/10 text-error text-xs border border-error/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-secondary mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maha Kumbhabhishekam & Special Yagasalai"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-xs font-body text-secondary"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details of the pooja, rituals, significance, and prasadam arrangements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-xs font-body"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-secondary mb-1">Event Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.eventDateTime}
                    onChange={(e) => setFormData({ ...formData, eventDateTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-secondary mb-1">Expiry Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.expiryTime}
                    onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-mono"
                  />
                  <span className="text-[10px] text-on-surface-muted">Auto transitions to Past Events after this</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">
                  Event Images (One URL per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imagesInput}
                  onChange={(e) => setFormData({ ...formData, imagesInput: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-mono"
                />
                <span className="text-[10px] text-on-surface-muted">
                  SRS 3.1: If left blank, canonical temple images will be displayed automatically.
                </span>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-secondary">Requires Kanikai Offering</span>
                  <p className="text-[11px] text-on-surface-muted">Enables online UPI contribution and payment proof submission</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isContributionRequired}
                  onChange={(e) => setFormData({ ...formData, isContributionRequired: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-border text-on-surface-muted hover:bg-surface-muted font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary hover:bg-[#C85A17] text-white font-bold text-xs shadow-sm transition"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-base font-bold text-secondary font-headline">Edit Event Details</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-on-surface-muted hover:text-secondary p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="my-3 p-3 bg-accent/15 border border-accent/30 rounded-xl text-on-accent text-xs">
              <strong>SRS 3.2 Invariant:</strong> Existing payment audit records will never be modified or deleted through event editing.
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-secondary mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs font-body text-secondary"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs font-body"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-secondary mb-1">Event Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.eventDateTime}
                    onChange={(e) => setFormData({ ...formData, eventDateTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-secondary mb-1">Expiry Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.expiryTime}
                    onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Event Images</label>
                <textarea
                  rows={2}
                  value={formData.imagesInput}
                  onChange={(e) => setFormData({ ...formData, imagesInput: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-border text-on-surface-muted hover:bg-surface-muted font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary hover:bg-[#C85A17] text-white font-bold text-xs shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Event Confirmation Modal (SRS Section 3.3) */}
      {cancelModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-error/30">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>

            <h3 className="font-headline text-headline-sm text-secondary">
              Cancel "{activeEvent.title}"?
            </h3>

            <div className="mt-3 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs space-y-1.5">
              <p className="font-bold">SRS Section 3.3 Non-Negotiable Invariants:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Offering records remain permanently preserved in the ledger.</li>
                <li>Cancelled event displays on member feed for 24h with a Cancelled label.</li>
                <li><strong>Strictly no refunds</strong> are provided.</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-full border border-border text-on-surface-muted hover:bg-surface-muted font-semibold text-xs"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-full bg-error text-white font-bold text-xs shadow-sm transition"
              >
                Yes, Cancel Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
