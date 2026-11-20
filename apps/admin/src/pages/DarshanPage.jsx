import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function DarshanPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getDarshanSettings();
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKaryakramChange = (index, field, value) => {
    const updated = [...settings.dailyKaryakrams];
    updated[index][field] = value;
    setSettings({ ...settings, dailyKaryakrams: updated });
    setSaveSuccess(false);
  };

  const handleAddKaryakram = () => {
    const updated = [
      ...settings.dailyKaryakrams,
      { time: '12:00 PM', title: 'New Pooja / Seva', details: 'Details of ritual and naivedyam' }
    ];
    setSettings({ ...settings, dailyKaryakrams: updated });
    setSaveSuccess(false);
  };

  const handleRemoveKaryakram = (index) => {
    const updated = settings.dailyKaryakrams.filter((_, i) => i !== index);
    setSettings({ ...settings, dailyKaryakrams: updated });
    setSaveSuccess(false);
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    try {
      await api.updateDarshanSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !settings) {
    return <div className="py-12 text-center text-on-surface-muted text-sm font-label">Loading Darshan schedules...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline text-headline-sm text-secondary">Darshan Feed Manager</h2>
          <p className="text-xs text-on-surface-muted">
            Configure the temple's daily pooja timings, opening/closing hours, and Darshan feed details per SRS Section 9.6.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="bg-primary hover:bg-[#C85A17] text-white px-5 py-2 rounded-full font-label text-label-sm font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">save</span>
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-2xl bg-success/10 border border-success/30 text-success text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="font-bold">Darshan schedule settings updated successfully! Live on member app.</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6 text-xs">
        {/* Timings Card */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
          <h3 className="font-headline text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-lg">schedule</span>
            <span>Temple Operational Hours & General Pooja Timings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block font-bold text-secondary mb-1">
                Morning Opening Time *
              </label>
              <input
                type="text"
                required
                value={settings.openingHours}
                onChange={(e) => {
                  setSettings({ ...settings, openingHours: e.target.value });
                  setSaveSuccess(false);
                }}
                className="w-full p-2.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-mono text-secondary"
              />
            </div>

            <div>
              <label className="block font-bold text-secondary mb-1">
                Night Closing Time *
              </label>
              <input
                type="text"
                required
                value={settings.closingHours}
                onChange={(e) => {
                  setSettings({ ...settings, closingHours: e.target.value });
                  setSaveSuccess(false);
                }}
                className="w-full p-2.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-mono text-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-secondary mb-1">
              General Pooja Timings Summary *
            </label>
            <input
              type="text"
              required
              value={settings.poojaTimings}
              onChange={(e) => {
                setSettings({ ...settings, poojaTimings: e.target.value });
                setSaveSuccess(false);
              }}
              className="w-full p-2.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-mono text-secondary"
            />
          </div>

          <div>
            <label className="block font-bold text-secondary mb-1">
              General Darshan Notices & Devotee Guidelines
            </label>
            <textarea
              rows={3}
              value={settings.generalInfo}
              onChange={(e) => {
                setSettings({ ...settings, generalInfo: e.target.value });
                setSaveSuccess(false);
              }}
              placeholder="Guidelines regarding traditional dress codes, footwear counters, senior citizen queues, etc."
              className="w-full p-2.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:outline-none text-xs font-body"
            />
          </div>
        </div>

        {/* Daily Karyakrams Card */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-accent text-lg">auto_awesome</span>
                <span>Daily Karyakrams Schedule (SRS Section 5.3)</span>
              </h3>
              <p className="text-on-surface-muted text-xs mt-0.5">
                The exact chronological rituals celebrated daily in the sanctum sanctorum.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddKaryakram}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border bg-surface-muted hover:bg-border text-secondary font-label text-xs font-semibold transition"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              <span>Add Pooja Slot</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {settings.dailyKaryakrams.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-border bg-surface flex flex-col md:flex-row md:items-center gap-3"
              >
                <div className="w-full md:w-36 shrink-0">
                  <label className="block text-[10px] font-bold text-on-surface-muted uppercase mb-1 font-label">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    value={item.time}
                    onChange={(e) => handleKaryakramChange(index, 'time', e.target.value)}
                    className="w-full p-2 rounded-lg border border-border bg-surface-card text-xs font-mono font-semibold text-secondary"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-on-surface-muted uppercase mb-1 font-label">
                    Ritual / Seva Title
                  </label>
                  <input
                    type="text"
                    required
                    value={item.title}
                    onChange={(e) => handleKaryakramChange(index, 'title', e.target.value)}
                    className="w-full p-2 rounded-lg border border-border bg-surface-card text-xs font-bold text-secondary font-headline"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-on-surface-muted uppercase mb-1 font-label">
                    Ritual Details
                  </label>
                  <input
                    type="text"
                    value={item.details}
                    onChange={(e) => handleKaryakramChange(index, 'details', e.target.value)}
                    className="w-full p-2 rounded-lg border border-border bg-surface-card text-xs text-on-surface-muted"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveKaryakram(index)}
                  className="p-2 text-on-surface-muted hover:text-error hover:bg-error/10 rounded-lg self-end md:self-center transition"
                  title="Remove Slot"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-[#C85A17] text-white font-bold text-xs shadow-sm transition"
          >
            Save All Darshan Schedules
          </button>
        </div>
      </form>
    </div>
  );
}
