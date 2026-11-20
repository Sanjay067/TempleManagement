import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fraud History Modal
  const [selectedMember, setSelectedMember] = useState(null);
  const [fraudHistory, setFraudHistory] = useState([]);
  const [fraudModalOpen, setFraudModalOpen] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await api.getMembers();
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFraudHistory = async (member) => {
    try {
      setSelectedMember(member);
      const res = await api.getMemberFraudHistory(member._id);
      setFraudHistory(res.data.history);
      setFraudModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleRedBorder = async (member) => {
    const newStatus = !member.hasRedBorder;
    const confirmMessage = newStatus
      ? `Apply Red Border flag to ${member.name}? It will be visible across the entire platform.`
      : `Manually clear the Red Border status for ${member.name}? (Historical fraud logs will remain permanently saved per SRS 7).`;

    if (window.confirm(confirmMessage)) {
      try {
        await api.updateRedBorder(member._id, newStatus);
        loadMembers();
        if (selectedMember && selectedMember._id === member._id) {
          setSelectedMember({ ...selectedMember, hasRedBorder: newStatus });
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const redBorderCount = members.filter(m => m.hasRedBorder).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline text-headline-sm text-secondary">Member Directory & Fraud Oversight</h2>
          <p className="text-xs text-on-surface-muted">
            Audit devotee profiles, enforce SRS Section 7 fraud threshold rules, and manage public red-border statuses.
          </p>
        </div>

        {redBorderCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-error/10 text-error border border-error/30 text-xs font-bold font-mono">
            <span className="material-symbols-outlined text-base">shield</span>
            <span>{redBorderCount} Devotee(s) with Active Red Border</span>
          </div>
        )}
      </div>

      {/* SRS Compliance Policy Banner */}
      <div className="p-4 rounded-2xl bg-surface-card border border-border text-xs text-on-surface shadow-xs space-y-1">
        <div className="flex items-center gap-2 text-secondary font-bold font-headline">
          <span className="material-symbols-outlined text-accent text-lg">info</span>
          <span>SRS Section 7 & Section 9.5 Specifications</span>
        </div>
        <p className="text-[11px] text-on-surface-muted leading-relaxed">
          When a member exceeds five (5) confirmed fake payment attempts, their profile receives an automatic public <strong>Red Border</strong>. Detailed fraud audit notes are visible only to admins. Admin may manually clear the red-border status while preserving historical logs. Advanced search and temporary deactivation are excluded in V1.
        </p>
      </div>

      {/* Members Table */}
      <div className="bg-surface-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-on-surface-muted text-sm font-label">Loading member records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead className="bg-surface-muted/60 text-on-surface-muted font-label text-[11px] uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Devotee Profile</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Total Kanikai (₹)</th>
                  <th className="py-3 px-4">Fake Strikes</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Fraud Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => {
                  const hasRedBorder = member.hasRedBorder;
                  const isDeleted = !member.isActive;

                  const initials = member.name
                    ? member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'DV';

                  return (
                    <tr
                      key={member._id}
                      className={`hover:bg-surface-muted/30 transition-colors ${
                        hasRedBorder ? 'bg-error/5' : isDeleted ? 'opacity-60 bg-surface-muted/20' : ''
                      }`}
                    >
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <span
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                hasRedBorder
                                  ? 'fraud-red-border bg-error/20 text-error'
                                  : 'bg-primary/20 text-primary'
                              }`}
                            >
                              {initials}
                            </span>
                            {hasRedBorder && (
                              <span
                                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-fraud border-2 border-white"
                                title="Red Border Active"
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-secondary">{member.name}</span>
                              {hasRedBorder && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-fraud text-white font-extrabold font-mono">
                                  RED BORDER
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-on-surface-muted block mt-0.5 font-mono">
                              Joined: {new Date(member.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="space-y-0.5 font-mono">
                          <div className="flex items-center gap-1.5 text-secondary">
                            <span className="material-symbols-outlined text-xs text-on-surface-muted">phone</span>
                            <span>{member.mobileNumber}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-on-surface-muted">
                            <span className="material-symbols-outlined text-xs">mail</span>
                            <span className="truncate max-w-[150px]">{member.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-xs text-on-surface-muted max-w-[180px]">
                        <span className="line-clamp-2">{member.address}</span>
                      </td>

                      {/* Total Contributed */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold font-mono text-secondary">
                          ₹{member.totalContributed?.toLocaleString('en-IN') || 0}
                        </div>
                        <span className="text-[10px] text-on-surface-muted font-mono block">
                          {member.contributionCount || 0} offering(s)
                        </span>
                      </td>

                      {/* Strikes */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded-md font-bold ${
                            member.fakePaymentCount > 5
                              ? 'bg-error text-white'
                              : member.fakePaymentCount > 0
                              ? 'bg-warning/20 text-warning'
                              : 'bg-surface-muted text-on-surface-muted'
                          }`}
                        >
                          {member.fakePaymentCount || 0} / 5
                        </span>
                        {member.fakePaymentCount > 5 && (
                          <span className="text-[10px] text-error font-semibold block mt-0.5">
                            Threshold exceeded!
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isDeleted ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-surface-muted text-on-surface-muted">
                            Deleted (Soft Delete)
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-success/10 text-success">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenFraudHistory(member)}
                            className="px-2.5 py-1 rounded-full border border-border hover:bg-surface-muted text-secondary font-semibold text-[11px] flex items-center gap-1 transition"
                          >
                            <span className="material-symbols-outlined text-xs">history</span>
                            <span>Audit Log ({member.fakePaymentCount || 0})</span>
                          </button>

                          {hasRedBorder ? (
                            <button
                              onClick={() => handleToggleRedBorder(member)}
                              className="px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/90 text-white font-bold text-[11px] transition shadow-xs"
                              title="Clear Red Border"
                            >
                              Clear Red Border
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleRedBorder(member)}
                              className="p-1 rounded-full text-on-surface-muted hover:text-error hover:bg-error/10 transition"
                              title="Apply Red Border manually"
                            >
                              <span className="material-symbols-outlined text-base">shield</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fraud History Modal */}
      {fraudModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-2xl">shield</span>
                <div>
                  <h3 className="font-headline font-bold text-secondary text-sm">
                    Fraud Audit Log — {selectedMember.name}
                  </h3>
                  <p className="text-[11px] text-on-surface-muted">Confidential Admin Records (SRS Section 7)</p>
                </div>
              </div>
              <button
                onClick={() => setFraudModalOpen(false)}
                className="text-on-surface-muted hover:text-secondary p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="my-4 p-3.5 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-muted font-label">Confirmed Fake Attempts:</span>
                <div className="font-headline text-lg font-bold font-mono text-error">
                  {selectedMember.fakePaymentCount} strike(s)
                </div>
              </div>
              <div>
                <span className="text-xs text-on-surface-muted font-label">Public Status:</span>
                <div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      selectedMember.hasRedBorder ? 'bg-fraud text-white' : 'bg-success/10 text-success'
                    }`}
                  >
                    {selectedMember.hasRedBorder ? 'RED BORDER ACTIVE' : 'CLEARED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold font-headline text-secondary uppercase tracking-wider">
                Permanent Audit Trail
              </h4>

              {fraudHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-on-surface-muted bg-surface rounded-xl border border-border">
                  No fraudulent attempts recorded for this devotee.
                </div>
              ) : (
                fraudHistory.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-3 rounded-xl border border-error/20 bg-error/5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-error">Strike #{idx + 1}</span>
                      <span className="text-on-surface-muted font-mono">
                        {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-on-surface text-xs leading-relaxed">
                      <strong>Reason:</strong> {item.reason}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-on-surface-muted font-label">
                SRS 7: Red border can be manually cleared.
              </span>

              <button
                type="button"
                onClick={() => handleToggleRedBorder(selectedMember)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition shadow-sm ${
                  selectedMember.hasRedBorder
                    ? 'bg-secondary hover:bg-secondary/90 text-white'
                    : 'bg-error text-white'
                }`}
              >
                {selectedMember.hasRedBorder ? 'Clear Red Border' : 'Apply Red Border'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
