import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TargetAudience } from '../contracts';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeNotif, setActiveNotif] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: TargetAudience.ALL,
    targetMemberIds: [],
    expiryDate: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [nRes, mRes] = await Promise.all([
        api.getNotifications(),
        api.getMembers()
      ]);
      setNotifications(nRes.data);
      setMembers(mRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 0);

    setFormData({
      title: '',
      message: '',
      targetAudience: TargetAudience.ALL,
      targetMemberIds: [],
      expiryDate: nextWeek.toISOString().slice(0, 16)
    });
    setFormError('');
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (notif) => {
    setActiveNotif(notif);
    setFormData({
      title: notif.title,
      message: notif.message,
      targetAudience: notif.targetAudience,
      targetMemberIds: notif.targetMemberIds || [],
      expiryDate: new Date(notif.expiryDate).toISOString().slice(0, 16)
    });
    setFormError('');
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim() || !formData.expiryDate) {
      setFormError('All fields are required');
      return;
    }
    if (formData.targetAudience === TargetAudience.INDIVIDUAL && formData.targetMemberIds.length === 0) {
      setFormError('Please select at least one individual devotee');
      return;
    }

    try {
      await api.createNotification(formData);
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim() || !formData.expiryDate) {
      setFormError('All fields are required');
      return;
    }

    try {
      await api.updateNotification(activeNotif._id, formData);
      setEditModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement? Devotees will no longer see it on their feed.')) {
      try {
        await api.deleteNotification(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline text-headline-sm text-secondary">Broadcast Center</h2>
          <p className="text-xs text-on-surface-muted">
            Publish targeted notifications (All, Paid Donors, Unpaid, or Individual Devotees) per SRS Section 8.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-[#C85A17] text-white px-4 py-2 rounded-full font-label text-label-sm font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">campaign</span>
          <span>Broadcast Notification</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-on-surface-muted text-sm font-label">Loading announcements...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-surface-card p-12 text-center rounded-2xl border border-border text-on-surface-muted">
            <span className="material-symbols-outlined text-4xl text-accent mb-2">campaign</span>
            <p className="text-sm font-bold text-secondary font-headline">No active announcements</p>
            <p className="text-xs text-on-surface-muted mt-0.5">Click "Broadcast Notification" to send an announcement.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isExpired = new Date(notif.expiryDate) < new Date();

            return (
              <div
                key={notif._id}
                className={`bg-surface-card rounded-2xl p-5 border transition shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  isExpired ? 'border-border opacity-60 bg-surface-muted/30' : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                        notif.targetAudience === TargetAudience.ALL
                          ? 'bg-secondary/10 text-secondary'
                          : notif.targetAudience === TargetAudience.PAID
                          ? 'bg-success/10 text-success'
                          : notif.targetAudience === TargetAudience.UNPAID
                          ? 'bg-warning/15 text-warning'
                          : 'bg-accent/20 text-on-accent'
                      }`}
                    >
                      Audience: {notif.targetAudience}
                    </span>

                    {isExpired ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono bg-surface-muted text-on-surface-muted">
                        Expired
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono bg-success/10 text-success flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        Active on Feed & Email
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline font-bold text-base text-secondary leading-snug">{notif.title}</h3>
                  <p className="text-xs text-on-surface-muted leading-relaxed max-w-3xl">{notif.message}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-on-surface-muted font-mono pt-1">
                    <span>Published: {new Date(notif.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    <span>Expires: {new Date(notif.expiryDate).toLocaleDateString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {notif.targetMemberIds?.length > 0 && (
                      <span className="text-secondary font-semibold">
                        Targeted: {notif.targetMemberIds.length} devotee(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                  <button
                    onClick={() => handleOpenEdit(notif)}
                    className="p-1.5 rounded-full border border-border hover:bg-surface-muted text-secondary transition"
                    title="Edit Announcement"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="p-1.5 rounded-full border border-error/20 hover:bg-error/10 text-error transition"
                    title="Delete Announcement"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Notification Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-headline text-base font-bold text-secondary">
                Broadcast Temple Announcement
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-on-surface-muted hover:text-secondary p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="my-2 p-2.5 rounded-xl bg-error/10 text-error text-xs border border-error/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-secondary mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Annadhanam & Prasadam Notice"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-surface font-body text-secondary"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details of the announcement, pooja schedule changes, or guidelines..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-surface font-body"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-secondary mb-1">Target Audience (SRS 8.2) *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-surface font-body"
                  >
                    <option value={TargetAudience.ALL}>All Members</option>
                    <option value={TargetAudience.PAID}>Paid Members (Donors)</option>
                    <option value={TargetAudience.UNPAID}>Unpaid Members</option>
                    <option value={TargetAudience.INDIVIDUAL}>Selected Individual Members</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-secondary mb-1">Expiry Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-surface font-mono"
                  />
                </div>
              </div>

              {formData.targetAudience === TargetAudience.INDIVIDUAL && (
                <div className="p-3 bg-surface-muted rounded-xl border border-border">
                  <label className="block font-bold text-secondary mb-1">
                    Select Individual Devotees:
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {members.filter(m => m.isActive).map(m => (
                      <label key={m._id} className="flex items-center gap-2 text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.targetMemberIds.includes(m._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                targetMemberIds: [...formData.targetMemberIds, m._id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targetMemberIds: formData.targetMemberIds.filter(id => id !== m._id)
                              });
                            }
                          }}
                          className="rounded text-primary"
                        />
                        <span>{m.name} ({m.mobileNumber})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-surface-muted text-on-surface-muted text-[11px] flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">mail</span>
                <span>
                  <strong>SRS 8.4:</strong> Delivered via website feed & dispatched as email. Auto-marked read on viewing.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-full font-semibold text-on-surface-muted hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#C85A17] text-white font-bold rounded-full shadow-sm"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && activeNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-headline text-base font-bold text-secondary">
                Edit Announcement
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-on-surface-muted hover:text-secondary p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-secondary mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-border rounded-xl bg-surface text-secondary font-body"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 border border-border rounded-xl bg-surface font-body"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Expiry Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full p-2.5 border border-border rounded-xl bg-surface font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-full font-semibold text-on-surface-muted hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#C85A17] text-white font-bold rounded-full shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
