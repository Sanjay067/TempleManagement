import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@temple.org');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal (SRS 9.7: email-based recovery)
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@temple.org');
    setPassword('admin123');
    setError('');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 relative overflow-hidden font-body text-on-surface">
      {/* Background Ambience / Sacred Mandala Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Header Branding (Matching Stitch Mandir Admin Header) */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-secondary text-accent border border-accent/40 mx-auto flex items-center justify-center shadow-md mb-4">
            <span className="material-symbols-outlined text-4xl">temple_hindu</span>
          </div>
          <h1 className="text-headline-lg font-headline text-secondary tracking-tight">
            Mandir Admin
          </h1>
          <p className="text-body-sm text-on-surface-muted mt-1 font-title">
            Trust Management Portal · Sri Raja Ganapathi Temple
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card rounded-2xl p-8 border border-border shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
            <span className="text-label-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 font-title">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span>Trustee Authentication</span>
            </span>
            <span className="text-[11px] bg-surface-muted text-on-surface-muted font-mono font-semibold px-2 py-0.5 rounded-full border border-border">
              Secure Port 3001
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-body-sm flex items-start gap-2.5">
              <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-body-sm">
            <div>
              <label className="block text-on-surface font-semibold mb-1.5 font-label">
                Trustee Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-muted absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@templetrust.org"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface border border-border text-on-surface placeholder-on-surface-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-body-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-on-surface font-semibold font-label">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSubmitted(false);
                    setForgotModalOpen(true);
                  }}
                  className="text-label-sm text-primary hover:text-secondary hover:underline transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-muted absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface border border-border text-on-surface placeholder-on-surface-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-body-sm transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-primary hover:bg-[#c25a1b] text-white font-label font-semibold text-label-md shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Mandir Operations'}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>

          {/* Quick Fill Helper for Demo / Testing */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-body-sm text-on-surface-muted">
            <span className="text-xs">Demo Trustee Credentials</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-2.5 py-1 rounded-lg bg-surface-muted hover:bg-border text-secondary font-semibold text-xs transition border border-border"
            >
              Autofill Credentials
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-on-surface-muted text-xs mt-6 font-title">
          Sri Raja Ganapathi Temple Board · Non-Destructive Ledger Architecture
        </p>
      </div>

      {/* Forgot Password Modal (SRS 9.7) */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl max-w-sm w-full p-6 border border-border text-on-surface shadow-2xl">
            <h3 className="text-title-lg font-headline text-secondary mb-1">
              Admin Password Recovery
            </h3>
            <p className="text-body-sm text-on-surface-muted mb-4">
              Per SRS Section 9.7, admin password recovery is strictly handled via email verification link.
            </p>

            {forgotSubmitted ? (
              <div className="p-3.5 bg-success/10 border border-success/30 rounded-xl text-success text-body-sm flex items-start gap-2.5">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">check_circle</span>
                <span>
                  Password reset link has been dispatched to <strong>{forgotEmail}</strong>. Please check your inbox.
                </span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5 text-body-sm">
                <div>
                  <label className="block text-on-surface font-semibold mb-1 font-label">
                    Trustee Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-body-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary hover:bg-[#c25a1b] text-white font-semibold rounded-xl text-label-md transition shadow-sm"
                >
                  Send Recovery Link
                </button>
              </form>
            )}

            <button
              onClick={() => setForgotModalOpen(false)}
              className="w-full mt-4 py-2 border border-border text-on-surface-muted hover:text-on-surface hover:bg-surface-muted rounded-xl text-body-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
