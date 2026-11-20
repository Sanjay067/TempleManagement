import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(14);

  const fetchPending = async () => {
    try {
      const stats = await api.getDashboardStats();
      setPendingCount(stats.data.pendingVerificationsCount);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 4000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/', icon: 'dashboard' },
    {
      name: 'Payment Verification',
      path: '/payments',
      icon: 'payments',
      badge: pendingCount > 0 ? pendingCount : null
    },
    { name: 'Event Management', path: '/events', icon: 'event' },
    { name: 'Offline Entries', path: '/payments?tab=OFFLINE', icon: 'receipt_long' },
    { name: 'Financial Reports', path: '/reports', icon: 'assessment' },
    { name: 'Member Directory & Fraud', path: '/members', icon: 'group' },
    { name: 'Darshan Feed Manager', path: '/darshan', icon: 'schedule' },
    { name: 'Broadcast Center', path: '/notifications', icon: 'campaign' },
  ];

  const getPageInfo = () => {
    const current = navItems.find(item => item.path === location.pathname);
    switch (location.pathname) {
      case '/':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Operational metrics, verification queue, and daily temple governance'
        };
      case '/payments':
        return {
          title: 'Payment Verification Hub',
          subtitle: 'Audit devotee UPI screenshots, approve donations, and record offline offerings'
        };
      case '/events':
        return {
          title: 'Event Management Hub',
          subtitle: 'Publish, schedule, edit, or cancel temple festivals, poojas, and ceremonies'
        };
      case '/reports':
        return {
          title: 'Collection & Financial Reports',
          subtitle: 'Event-wise collection breakdowns, donor records, and Excel/CSV export'
        };
      case '/members':
        return {
          title: 'Member Directory & Fraud Oversight',
          subtitle: 'Manage devotees, strike penalties, and public red-border statuses'
        };
      case '/darshan':
        return {
          title: 'Darshan Feed Manager',
          subtitle: 'Configure daily karyakrams, pooja schedules, and temple opening hours'
        };
      case '/notifications':
        return {
          title: 'Broadcast Announcement Center',
          subtitle: 'Send targeted announcements to all devotees, donors, or specific members'
        };
      default:
        return {
          title: current?.name || 'Mandir Admin',
          subtitle: 'Trust Management Portal'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex-1 flex min-h-screen bg-surface text-on-surface font-body antialiased">
      {/* Left Collapsible Sidebar Navigation (Stitch Design) */}
      <aside className="hidden lg:flex w-64 bg-secondary text-white flex-col shrink-0 border-r border-accent/20 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Temple Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shrink-0">
            <span className="material-symbols-outlined text-2xl">temple_hindu</span>
          </div>
          <div>
            <h2 className="font-headline text-headline-sm text-white leading-tight">Mandir Admin</h2>
            <span className="text-xs text-white/70 font-label">Trust Management Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isOfflineTab = item.path.includes('tab=OFFLINE');
            const isActive = isOfflineTab
              ? location.pathname === '/payments' && location.search.includes('tab=OFFLINE')
              : location.pathname === item.path && !location.search.includes('tab=OFFLINE');

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label text-label-md transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-warning text-white text-[11px] font-bold px-2 py-0.5 rounded-full font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Invariant Banner */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-black/20 border border-white/10 text-xs">
          <div className="flex items-center gap-1.5 text-accent font-semibold text-[11px] mb-1">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>SRS Section 12 Invariant</span>
          </div>
          <p className="text-white/60 text-[10px] leading-relaxed">
            Zero hard deletes. Financial ledger permanently preserved.
          </p>
        </div>

        {/* Current Admin Footer Profile */}
        <div className="p-3 border-t border-white/10">
          <div className="bg-black/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent text-secondary flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label text-xs font-semibold text-white block truncate">
                {admin?.name || 'Chief Trustee (You)'}
              </span>
              <span className="text-[10px] text-white/60 block truncate">
                {admin?.email || 'admin@templetrust.org'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              type="button"
              className="text-white/70 hover:text-white transition"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 bg-secondary text-white flex flex-col z-10 p-3">
            <div className="p-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent text-2xl">temple_hindu</span>
                <span className="font-headline font-bold">Mandir Admin</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/80 p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label text-label-md transition-colors ${
                      isActive ? 'bg-primary text-white font-semibold' : 'text-white/80 hover:bg-white/10'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-warning text-white text-[11px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar (Stitch Design) */}
        <header className="bg-surface-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-muted text-secondary"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h1 className="font-headline text-headline-md text-secondary">{pageInfo.title}</h1>
              <p className="text-xs text-on-surface-muted">{pageInfo.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Offline Entry CTA */}
            <NavLink
              to="/payments?tab=OFFLINE"
              className="bg-surface-muted hover:bg-border text-secondary border border-border px-4 py-2 rounded-full font-label text-label-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Record Offline Offering</span>
            </NavLink>

            {/* Create Event CTA */}
            <NavLink
              to="/events?action=create"
              className="bg-primary hover:bg-[#C85A17] text-white px-4 py-2 rounded-full font-label text-label-sm font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">event</span>
              <span>+ Create New Event</span>
            </NavLink>

            <div className="h-6 w-[1px] bg-border hidden sm:block"></div>

            {/* Notification Bell */}
            <NavLink
              to="/notifications"
              className="relative p-2 rounded-full text-secondary hover:bg-surface-muted transition-colors"
              title="Notifications Center"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>
            </NavLink>
          </div>
        </header>

        {/* Main Dashboard Viewport */}
        <main className="p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
