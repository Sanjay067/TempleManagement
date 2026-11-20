import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PaymentStatus } from '../contracts';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.getCollectionReports();
      setReports(res.data);
      if (res.data.length > 0) {
        setExpandedEventId(res.data[0].eventId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalAllCollections = reports.reduce((sum, r) => sum + r.totalAmountCollected, 0);
  const totalContributorsCount = reports.reduce((sum, r) => sum + r.numberOfContributors, 0);

  const toggleExpand = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const exportToCSV = (eventReport = null) => {
    let rows = [];
    rows.push(['Event Name', 'Member Name', 'Mobile Number', 'Amount (INR)', 'Payment Mode', 'Status', 'Is Offline', 'Submission Date']);
    const targetReports = eventReport ? [eventReport] : reports;

    targetReports.forEach(rep => {
      rep.records.forEach(rec => {
        rows.push([
          `"${rep.eventName}"`,
          `"${rec.memberName}"`,
          `"${rec.mobileNumber}"`,
          rec.amount,
          rec.paymentMode,
          rec.status,
          rec.isOffline ? 'Yes' : 'No',
          `"${new Date(rec.date).toISOString()}"`
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = eventReport
      ? `temple_report_${eventReport.eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`
      : `temple_all_contributions_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (eventReport = null) => {
    let content = 'Event Name\tMember Name\tMobile Number\tAmount (INR)\tPayment Mode\tStatus\tIs Offline\tSubmission Date\n';
    const targetReports = eventReport ? [eventReport] : reports;

    targetReports.forEach(rep => {
      rep.records.forEach(rec => {
        content += `${rep.eventName}\t${rec.memberName}\t${rec.mobileNumber}\t${rec.amount}\t${rec.paymentMode}\t${rec.status}\t${rec.isOffline ? 'Yes' : 'No'}\t${new Date(rec.date).toLocaleDateString('en-IN')}\n`;
      });
    });

    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = eventReport
      ? `temple_report_${eventReport.eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xls`
      : `temple_all_contributions_audit_${new Date().toISOString().slice(0, 10)}.xls`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline text-headline-sm text-secondary">Financial & Collection Reports</h2>
          <p className="text-xs text-on-surface-muted">
            Event-wise offering summaries, devotee donor audits, and Excel/CSV export per SRS Section 9.4.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-surface-card hover:bg-surface-muted text-secondary font-label text-xs font-semibold shadow-xs transition"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportToExcel(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-[#C85A17] text-white font-label text-xs font-semibold shadow-sm transition"
          >
            <span className="material-symbols-outlined text-sm">table_view</span>
            <span>Export Excel (.xls)</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface-card p-5 rounded-2xl border border-border shadow-sm">
          <span className="text-xs font-label uppercase tracking-wider text-on-surface-muted block">
            Grand Total Collections
          </span>
          <div className="font-headline text-2xl font-bold font-mono text-secondary mt-1">
            ₹{totalAllCollections.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-on-surface-muted font-mono mt-1 block">
            All online and counter offerings
          </span>
        </div>

        <div className="bg-surface-card p-5 rounded-2xl border border-border shadow-sm">
          <span className="text-xs font-label uppercase tracking-wider text-on-surface-muted block">
            Unique Devotee Donors
          </span>
          <div className="font-headline text-2xl font-bold font-mono text-secondary mt-1">
            {totalContributorsCount}
          </div>
          <span className="text-[11px] text-on-surface-muted font-mono mt-1 block">
            Verified registered contributors
          </span>
        </div>

        <div className="bg-surface-card p-5 rounded-2xl border border-border shadow-sm">
          <span className="text-xs font-label uppercase tracking-wider text-on-surface-muted block">
            Tracked Temple Events
          </span>
          <div className="font-headline text-2xl font-bold font-mono text-secondary mt-1">
            {reports.length}
          </div>
          <span className="text-[11px] text-on-surface-muted font-mono mt-1 block">
            Including cancelled & past festivals
          </span>
        </div>
      </div>

      {/* Reports Accordion */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-on-surface-muted text-sm font-label">Generating collection reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-surface-card p-12 text-center rounded-2xl border border-border text-on-surface-muted">
            No event collection records found.
          </div>
        ) : (
          reports.map((report) => {
            const isExpanded = expandedEventId === report.eventId;

            return (
              <div
                key={report.eventId}
                className="bg-surface-card rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                {/* Event Summary Bar */}
                <div
                  onClick={() => toggleExpand(report.eventId)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface-muted/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl">temple_hindu</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline font-bold text-sm text-secondary">{report.eventName}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-surface-muted text-secondary">
                          {report.eventStatus}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-muted mt-0.5 font-mono">
                        Date: {new Date(report.eventDateTime).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-on-surface-muted uppercase font-label block">Donors</span>
                      <span className="font-bold text-xs text-secondary font-mono">{report.numberOfContributors} devotees</span>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-on-surface-muted uppercase font-label block">Collections</span>
                      <span className="font-headline font-bold text-base text-secondary font-mono">
                        ₹{report.totalAmountCollected.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToCSV(report);
                        }}
                        title="Download Event CSV"
                        className="p-1.5 rounded-full border border-border hover:bg-surface-muted text-secondary transition"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToExcel(report);
                        }}
                        title="Download Event Excel"
                        className="p-1.5 rounded-full border border-border hover:bg-surface-muted text-secondary transition"
                      >
                        <span className="material-symbols-outlined text-sm">table_view</span>
                      </button>

                      <div className="p-1 text-on-surface-muted">
                        <span className="material-symbols-outlined text-lg">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Table */}
                {isExpanded && (
                  <div className="border-t border-border bg-surface-muted/30 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold font-headline text-secondary uppercase tracking-wider">
                        Individual Offerings ({report.records.length})
                      </h4>
                      <span className="text-[11px] text-on-surface-muted font-mono">
                        SRS Section 12: Permanent Financial Ledger
                      </span>
                    </div>

                    {report.records.length === 0 ? (
                      <div className="py-6 text-center text-xs text-on-surface-muted">
                        No individual offerings recorded for this event yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-border bg-surface-card">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-surface-muted/60 text-on-surface-muted font-label text-[11px] uppercase border-b border-border">
                            <tr>
                              <th className="py-2.5 px-3.5">Devotee Name</th>
                              <th className="py-2.5 px-3.5">Mobile</th>
                              <th className="py-2.5 px-3.5">Amount (₹)</th>
                              <th className="py-2.5 px-3.5">Payment Mode</th>
                              <th className="py-2.5 px-3.5">Status</th>
                              <th className="py-2.5 px-3.5">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-on-surface">
                            {report.records.map((rec) => (
                              <tr key={rec.id} className="hover:bg-surface-muted/30">
                                <td className="py-2.5 px-3.5 font-semibold text-secondary">
                                  {rec.memberName}
                                </td>
                                <td className="py-2.5 px-3.5 text-on-surface-muted font-mono text-[11px]">
                                  {rec.mobileNumber}
                                </td>
                                <td className="py-2.5 px-3.5 font-bold font-mono text-secondary">
                                  ₹{rec.amount?.toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-muted font-semibold text-on-surface-muted">
                                    {rec.paymentMode} {rec.isOffline ? '(Offline)' : ''}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      rec.status === PaymentStatus.PAID
                                        ? 'bg-success/10 text-success'
                                        : rec.status === PaymentStatus.PENDING
                                        ? 'bg-warning/15 text-warning font-mono'
                                        : 'bg-error/10 text-error'
                                    }`}
                                  >
                                    {rec.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3.5 text-on-surface-muted font-mono text-[11px]">
                                  {new Date(rec.date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
