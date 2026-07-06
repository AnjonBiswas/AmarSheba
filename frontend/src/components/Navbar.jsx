import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const links = [
  { to: '/', label: 'nav.home' },
  { to: '/services', label: 'nav.services' },
  { to: '/assistant', label: 'nav.assistant' },
  { to: '/about', label: 'nav.about' },
  { to: '/contact', label: 'nav.contact' },
  { to: '/faq', label: 'nav.faq' },
];

function navClass({ isActive }) {
  const underline = isActive ? 'after:w-[calc(100%-1.5rem)]' : 'after:w-0 hover:after:w-[calc(100%-1.5rem)]';

  return `relative rounded-md px-3 py-2 text-sm font-semibold leading-none transition after:absolute after:bottom-0 after:left-3 after:h-0.5 after:bg-sheba-600 after:transition-all after:duration-300 ${underline} ${
    isActive
      ? 'bg-sheba-50 text-sheba-700 dark:bg-sheba-500/15 dark:text-sheba-100'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
  }`;
}

function getAuthLabels(locale, t) {
  return {
    dashboard: locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
    profile: locale === 'bn' ? 'প্রোফাইল / সেটিংস' : 'Profile / Settings',
    admin: t('nav.admin'),
    logout: t('auth.logout'),
    login: t('auth.loginLink'),
    roleAdmin: locale === 'bn' ? 'অ্যাডমিন' : 'Admin',
    roleUser: locale === 'bn' ? 'নাগরিক' : 'Citizen',
  };
}

function getDashboardPath(user) {
  return user?.role === 'admin' ? '/admin' : '/dashboard';
}

function ProfileMenu({
  currentUser,
  locale,
  t,
  onLogout,
  onNavigate,
  mobile = false,
  closeMobileMenu = () => {},
}) {
  const labels = useMemo(() => getAuthLabels(locale, t), [locale, t]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const roleLabel = currentUser.role === 'admin' ? labels.roleAdmin : labels.roleUser;
  const dashboardPath = getDashboardPath(currentUser);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleMenuAction = (path) => {
    setMenuOpen(false);
    closeMobileMenu();
    onNavigate(path);
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    closeMobileMenu();
    onLogout();
  };

  const triggerClass = mobile
    ? 'focus-ring relative flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-3 text-left leading-none dark:border-slate-700 dark:bg-slate-900'
    : 'focus-ring relative inline-flex min-h-14 max-w-[340px] cursor-pointer items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold leading-none text-slate-700 shadow-sm transition-colors duration-150 hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:text-sheba-100';

  const dropdownClass = mobile
    ? 'mt-2 grid gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900'
    : 'absolute right-0 top-[calc(100%+0.5rem)] z-[80] min-w-[240px] rounded-md border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900';

  const itemClass =
    'focus-ring relative flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold leading-none text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-100 dark:hover:bg-slate-800';

  return (
    <div ref={menuRef} className={mobile ? 'w-full' : 'relative shrink-0'}>
      <button
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        className={triggerClass}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <div className="pointer-events-none flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-sheba-600 text-sm font-black text-white">
            {currentUser.avatar}
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className="block truncate text-sm font-bold">{currentUser.name}</span>
              <span className="shrink-0 rounded-md bg-sheba-50 px-2 py-0.5 text-xs font-bold text-sheba-700 dark:bg-sheba-500/15 dark:text-sheba-100">
                {roleLabel}
              </span>
            </div>
            {!mobile && (
              <span className="block truncate pt-1 text-xs leading-none text-slate-500 dark:text-slate-400">{currentUser.email}</span>
            )}
          </div>
        </div>
        <ChevronDown className={`pointer-events-none h-4 w-4 shrink-0 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {menuOpen && (
        <div className={dropdownClass} role="menu">
          <button type="button" onClick={() => handleMenuAction(dashboardPath)} className={itemClass} role="menuitem">
            <LayoutDashboard className="pointer-events-none h-4 w-4 shrink-0" />
            <span className="pointer-events-none">{labels.dashboard}</span>
          </button>
          <button type="button" onClick={() => handleMenuAction('/profile')} className={itemClass} role="menuitem">
            <Settings className="pointer-events-none h-4 w-4 shrink-0" />
            <span className="pointer-events-none">{labels.profile}</span>
          </button>
          {currentUser.role === 'admin' && (
            <button type="button" onClick={() => handleMenuAction('/admin')} className={itemClass} role="menuitem">
              <ShieldCheck className="pointer-events-none h-4 w-4 shrink-0" />
              <span className="pointer-events-none">{labels.admin}</span>
            </button>
          )}
          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
          <button
            type="button"
            onClick={handleLogoutClick}
            className={`${itemClass} text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-100 dark:hover:bg-red-500/10`}
            role="menuitem"
          >
            <LogOut className="pointer-events-none h-4 w-4 shrink-0" />
            <span className="pointer-events-none">{labels.logout}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { locale, t } = useLocale();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login', { replace: true });
  };

  const navigateAndClose = (path) => {
    setOpen(false);
    navigate(path);
  };

  const desktopAuthControls = isAuthenticated ? (
    <ProfileMenu
      currentUser={currentUser}
      locale={locale}
      t={t}
      onLogout={handleLogout}
      onNavigate={navigateAndClose}
    />
  ) : (
    <NavLink
      to="/login"
      className="focus-ring relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-sheba-600 px-4 text-sm font-bold leading-none text-white transition-colors duration-150 hover:bg-sheba-700"
      onClick={() => setOpen(false)}
    >
      <LogIn className="pointer-events-none h-4 w-4" />
      <span className="pointer-events-none">{t('auth.loginLink')}</span>
    </NavLink>
  );

  const mobileAuthControls = isAuthenticated ? (
    <ProfileMenu
      currentUser={currentUser}
      locale={locale}
      t={t}
      mobile
      onLogout={handleLogout}
      onNavigate={navigateAndClose}
      closeMobileMenu={() => setOpen(false)}
    />
  ) : (
    <NavLink
      to="/login"
      className="focus-ring relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-sheba-600 px-4 text-sm font-bold leading-none text-white transition-colors duration-150 hover:bg-sheba-700"
      onClick={() => setOpen(false)}
    >
      <LogIn className="pointer-events-none h-4 w-4" />
      <span className="pointer-events-none">{t('auth.loginLink')}</span>
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <nav className="container-shell relative z-10 flex min-h-16 items-center justify-between gap-4 py-2" aria-label="Main navigation">
        <NavLink to="/" className="focus-ring flex shrink-0 items-center gap-3 rounded-md" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-md bg-sheba-600 text-lg font-black text-white">A</span>
          <span>
            <span className="block text-base font-black text-slate-950 dark:text-white">{t('common.appName')}</span>
            <span className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">{t('common.tagline')}</span>
          </span>
        </NavLink>

        <div className="hidden min-w-0 items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {t(link.label)}
            </NavLink>
          ))}
        </div>

        <div className="hidden min-w-0 items-center justify-end gap-2 lg:flex">
          <LanguageToggle />
          <ThemeToggle />
          {desktopAuthControls}
        </div>

        <button
          type="button"
          className="focus-ring navbar-button navbar-button-icon lg:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? t('nav.close') : t('nav.menu')}
        >
          {open ? <X className="pointer-events-none h-5 w-5" /> : <Menu className="pointer-events-none h-5 w-5" />}
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 ease-in-out lg:hidden dark:border-slate-800 dark:bg-slate-950 ${
          open ? 'pointer-events-auto max-h-[32rem] opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="container-shell grid gap-2 py-4">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass} onClick={() => setOpen(false)}>
              {t(link.label)}
            </NavLink>
          ))}
          <div className="grid gap-2 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            {mobileAuthControls}
          </div>
        </div>
      </div>
    </header>
  );
}
