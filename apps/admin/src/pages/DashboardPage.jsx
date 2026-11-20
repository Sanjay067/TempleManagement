import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { PaymentStatus, EventStatus } from '../contracts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingContributions, setPendingContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, contributionsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getContributions({ status: PaymentStatus.PENDING })
      ]);
      setStats(statsRes.data);
      setPendingContributions(contributionsRes.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards (KPIs) - Stitch Design */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Key Performance Indicators">
        
        {/* Metric 1: Total Registered Members */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border shadow-[0_2px_12px_rgba(139,30,30,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-muted font-label uppercase tracking-wider block">
              Total Members
            </span>
            <p className="font-headline text-2xl text-secondary font-bold font-mono mt-1">
              {stats.totalRegisteredMembers.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-success font-semibold flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              <span>+128 this month</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
        </div>

        {/* Metric 2: Total Contributions Collected */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border shadow-[0_2px_12px_rgba(139,30,30,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-muted font-label uppercase tracking-wider block">
              Total Collections
            </span>
            <p className="font-headline text-2xl text-secondary font-bold font-mono mt-1">
              ₹{stats.totalContributionsCollected.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-on-surface-muted font-mono mt-1 block">
              Online UPI + Offline
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">account_balance</span>
          </div>
        </div>

        {/* Metric 3: Pending Verifications (Amber Alert Card) */}
        <div className="bg-amber-500/10 p-5 rounded-2xl border-2 border-warning/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-900 font-label font-bold uppercase tracking-wider block">
              Pending Verifications
            </span>
            <p className="font-headline text-2xl text-warning font-bold font-mono mt-1">
              {stats.pendingVerificationsCount} Pending
            </p>
            <Link
              to="/payments"
              className="text-[11px] text-warning hover:underline font-semibold flex items-center gap-1 mt-1"
            >
              <span>Review submissions now</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-warning text-white flex items-center justify-center shadow">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
        </div>

        {/* Metric 4: Active Upcoming Events */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border shadow-[0_2px_12px_rgba(139,30,30,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-muted font-label uppercase tracking-wider block">
              Active Events
            </span>
            <p className="font-headline text-2xl text-secondary font-bold font-mono mt-1">
              {stats.upcomingEventsCount} Scheduled
            </p>
            <span className="text-[11px] text-primary font-semibold mt-1 block">
              Next: Maha Shivaratri
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">event_available</span>
          </div>
        </div>

      </section>

      {/* Main Workspace Split: Quick Verification Queue + Operations Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Quick Verification Queue (Stitch Design) */}
        <div className="lg:col-span-2 bg-surface-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between bg-surface-card">
            <div>
              <h2 className="font-headline text-headline-sm text-secondary">Quick Verification Queue</h2>
              <p className="text-xs text-on-surface-muted">
                Devotee UPI payment screenshots awaiting administrative audit
              </p>
            </div>
            <Link
              to="/payments"
              className="text-primary hover:underline text-xs font-label font-semibold flex items-center gap-1"
            >
              <span>View All ({stats.pendingVerificationsCount})</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="bg-surface-muted/60 border-b border-border text-on-surface-muted font-label text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt ID</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Screenshot</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingContributions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-muted text-xs">
                      No pending payment proofs awaiting review. All submissions audited!
                    </td>
                  </tr>
                ) : (
                  pendingContributions.map((c, idx) => {
                    const initials = c.member?.name
                      ? c.member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'DV';

                    return (
                      <tr key={c._id} className="hover:bg-surface-muted/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-secondary">
                          #RCP-{c._id.slice(-4).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                              {initials}
                            </span>
                            <span className="font-medium text-secondary">{c.member?.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs max-w-[160px] truncate">
                          {c.event?.title}
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-secondary">
                          ₹{c.amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          {c.paymentProofUrl ? (
                            <Link
                              to="/payments"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                            >
                              <span className="material-symbols-outlined text-sm">image</span>
                              <span>Preview Proof</span>
                            </Link>
                          ) : (
                            <span className="text-on-surface-muted text-xs italic">Offline</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to="/payments"
                            className="bg-primary hover:bg-[#C85A17] text-white px-3 py-1 rounded-full text-xs font-label font-semibold inline-flex items-center gap-1 shadow-sm transition"
                          >
                            <span>Verify</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Temple Operations & Darshan Schedule Summary */}
        <div className="space-y-6">

          {/* Today's Schedule Card (Stitch Design) */}
          <div className="bg-surface-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-headline text-headline-sm text-secondary">Today's Darshan Feed</h3>
                <span className="text-xs text-on-surface-muted">Live on devotee member app</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Published</span>
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/60">
                <span className="font-semibold text-secondary">Temple Hours:</span>
                <span className="font-mono text-on-surface-muted">05:00 AM - 12:30 PM | 04:00 PM - 09:00 PM</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/60">
                <span className="font-semibold text-secondary">Next Aarti:</span>
                <span className="font-mono text-primary font-bold">Sayaratchai (06:30 PM)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/60">
                <span className="font-semibold text-secondary">Chief Priest:</span>
                <span className="text-on-surface-muted">Venkataramana Dikshitar</span>
              </div>
            </div>

            <Link
              to="/darshan"
              className="w-full border border-border bg-surface-muted hover:bg-border text-secondary py-2 rounded-xl text-xs font-label font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Edit Today's Pooja Timetable</span>
            </Link>
          </div>

          {/* Active Cancelled Event Notice Status (Stitch Design / SRS 3.3) */}
          <div className="bg-surface-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-warning">
              <span className="material-symbols-outlined text-lg">warning</span>
              <h4 className="font-label text-xs font-bold uppercase tracking-wider text-secondary">
                Active Cancellation Notice
              </h4>
            </div>
            <p className="text-xs text-on-surface-muted leading-relaxed mb-3">
              <span className="font-semibold text-secondary">Pradosham Abhishekam (10 Nov)</span> is displaying a cancellation banner on member app for 24h. 18 past member contributions remain permanently preserved.
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-muted pt-2 border-t border-border">
              <span>Expires in: 8h 14m</span>
              <span className="text-success font-semibold">Ledger Locked</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
