import {
  Bell,
  Bookmark,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Heart,
  LayoutDashboard,
  Pencil,
  Settings,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const STORAGE_KEYS = {
  saved: 'amarsheba_saved',
  favorites: 'amarsheba_favorites',
  recent: 'amarsheba_recent',
  reminders: 'amarsheba_reminders',
};

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeServiceIds(items) {
  return items.map((item) => (typeof item === 'string' ? item : item?.id)).filter(Boolean);
}

function normalizeRecent(items) {
  return items
    .map((item) => {
      if (typeof item === 'string') {
        return { id: item, title: '', visitedAt: 0 };
      }

      return item?.id
        ? {
            id: item.id,
            title: item.title || '',
            visitedAt: item.visitedAt || (item.viewedAt ? new Date(item.viewedAt).getTime() : 0),
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, 10);
}

function getChecklistKey(serviceId) {
  return `amarsheba_checklist_${serviceId}`;
}

function createReminderId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isOverdue(date) {
  if (!date) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
}

function Panel({ children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {children}
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {text}
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, updateProfile } = useAuth();
  const { locale, setLocale, t, translations } = useLocale();
  usePageTitle(t('auth.dashboardEyebrow'));
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useState(() => normalizeServiceIds(readJson(STORAGE_KEYS.saved, [])));
  const [favorites, setFavorites] = useState(() => normalizeServiceIds(readJson(STORAGE_KEYS.favorites, [])));
  const [recent, setRecent] = useState(() => normalizeRecent(readJson(STORAGE_KEYS.recent, [])));
  const [reminders, setReminders] = useState(() => readJson(STORAGE_KEYS.reminders, []));
  const [reminderForm, setReminderForm] = useState({ serviceName: '', date: '', note: '' });
  const [profileForm, setProfileForm] = useState({ name: currentUser.name, language: locale });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const getServiceTitle = (serviceId) => translations.services[serviceId]?.title || serviceId;
  const getServiceDescription = (serviceId) => translations.services[serviceId]?.description || '';
  const activeReminders = reminders.filter((reminder) => !isOverdue(reminder.date)).length;
  const savedChecklistTotals = saved.reduce(
    (acc, serviceId) => {
      const checked = readJson(getChecklistKey(serviceId), []);
      const total = translations.services[serviceId]?.checklist?.length || 0;
      return { done: acc.done + checked.length, total: acc.total + total };
    },
    { done: 0, total: 0 },
  );
  const checklistPercent = savedChecklistTotals.total
    ? Math.round((savedChecklistTotals.done / savedChecklistTotals.total) * 100)
    : 0;

  const tabs = [
    { id: 'overview', label: t('dashboard.tabs.overview'), icon: LayoutDashboard },
    { id: 'saved', label: t('dashboard.tabs.saved'), icon: Bookmark },
    { id: 'favorites', label: t('dashboard.tabs.favorites'), icon: Heart },
    { id: 'recent', label: t('dashboard.tabs.recent'), icon: Clock },
    { id: 'checklists', label: t('dashboard.tabs.checklists'), icon: CheckCircle2 },
    { id: 'reminders', label: t('dashboard.tabs.reminders'), icon: Bell },
    { id: 'profile', label: t('dashboard.tabs.profile'), icon: Settings },
  ];

  const removeService = (key, serviceId) => {
    const current = key === STORAGE_KEYS.saved ? saved : favorites;
    const setter = key === STORAGE_KEYS.saved ? setSaved : setFavorites;
    const next = current.filter((id) => id !== serviceId);
    setter(next);
    writeJson(key, next);
  };

  const clearRecent = () => {
    setRecent([]);
    writeJson(STORAGE_KEYS.recent, []);
  };

  const addReminder = (event) => {
    event.preventDefault();

    if (!reminderForm.serviceName.trim() || !reminderForm.date) {
      return;
    }

    const next = [
      ...reminders,
      {
        id: createReminderId(),
        serviceName: reminderForm.serviceName.trim(),
        date: reminderForm.date,
        note: reminderForm.note.trim(),
      },
    ];
    setReminders(next);
    writeJson(STORAGE_KEYS.reminders, next);
    setReminderForm({ serviceName: '', date: '', note: '' });
  };

  const deleteReminder = (reminderId) => {
    const next = reminders.filter((reminder) => reminder.id !== reminderId);
    setReminders(next);
    writeJson(STORAGE_KEYS.reminders, next);
  };

  const saveProfile = (event) => {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      return;
    }

    updateProfile(profileForm);
    setLocale(profileForm.language);
    setEditingProfile(false);
    setProfileMessage(t('dashboard.profileSaved'));
  };

  const renderServiceCards = (ids, emptyText, removeKey) => {
    if (!ids.length) {
      return <EmptyState text={emptyText} />;
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ids.map((serviceId) => (
          <article key={serviceId} className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-bold text-slate-950 dark:text-white">{getServiceTitle(serviceId)}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {getServiceDescription(serviceId)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/services/${serviceId}`}
                className="btn-pop focus-ring inline-flex h-10 items-center rounded-md bg-sheba-600 px-3 text-sm font-bold text-white"
              >
                {t('dashboard.open')}
              </Link>
              <button
                type="button"
                onClick={() => removeService(removeKey, serviceId)}
                className="btn-pop focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:text-slate-200"
              >
                <Trash2 className="h-4 w-4" />
                {t('dashboard.remove')}
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <section className="container-shell py-10">
      <div className="mb-6 rounded-md border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold uppercase text-sheba-700 dark:text-sheba-100">{t('auth.dashboardEyebrow')}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
          {t('dashboard.hello').replace('{name}', currentUser.name)}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t('auth.dashboardIntro')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="rounded-md border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900" aria-label={t('dashboard.navLabel')}>
          <div className="flex gap-1 overflow-x-auto lg:grid lg:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn-pop focus-ring flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-bold transition-all duration-200 lg:w-full ${
                    isActive
                      ? 'bg-sheba-50 text-sheba-700 dark:bg-sheba-500/15 dark:text-sheba-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div key={activeTab} className="min-w-0" style={{ animation: 'fadeSlideUp 0.25s ease forwards' }}>
          {activeTab === 'overview' && (
            <div className="grid gap-5">
              <Panel>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                  {t('dashboard.hello').replace('{name}', currentUser.name)}
                </h2>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{t('dashboard.overviewIntro')}</p>
              </Panel>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  [t('dashboard.stats.saved'), saved.length],
                  [t('dashboard.stats.favorites'), favorites.length],
                  [t('dashboard.stats.activeReminders'), activeReminders],
                  [t('dashboard.stats.checklistProgress'), `${checklistPercent}%`],
                ].map(([label, value]) => (
                  <Panel key={label}>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
                  </Panel>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <Panel>
              <h2 className="mb-4 text-2xl font-black text-slate-950 dark:text-white">{t('dashboard.savedTitle')}</h2>
              {renderServiceCards(saved, t('dashboard.emptySaved'), STORAGE_KEYS.saved)}
            </Panel>
          )}

          {activeTab === 'favorites' && (
            <Panel>
              <h2 className="mb-4 text-2xl font-black text-slate-950 dark:text-white">{t('dashboard.favoritesTitle')}</h2>
              {renderServiceCards(favorites, t('dashboard.emptyFavorites'), STORAGE_KEYS.favorites)}
            </Panel>
          )}

          {activeTab === 'recent' && (
            <Panel>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">{t('dashboard.recentTitle')}</h2>
                {recent.length > 0 && (
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="btn-pop focus-ring h-10 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:text-slate-200"
                  >
                    {t('dashboard.clearAll')}
                  </button>
                )}
              </div>
              {!recent.length ? (
                <EmptyState text={t('dashboard.emptyRecent')} />
              ) : (
                <div className="grid gap-3">
                  {recent.map((entry) => (
                    <Link
                      key={`${entry.id}-${entry.visitedAt || 'legacy'}`}
                      to={`/services/${entry.id}`}
                      className="focus-ring rounded-md border border-slate-200 p-4 transition hover:border-sheba-500 dark:border-slate-800"
                    >
                      <h3 className="font-bold text-slate-950 dark:text-white">{entry.title || getServiceTitle(entry.id)}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {entry.visitedAt
                          ? t('dashboard.viewedAt').replace('{time}', new Date(entry.visitedAt).toLocaleString())
                          : t('dashboard.viewedUnknown')}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {activeTab === 'checklists' && (
            <Panel>
              <h2 className="mb-4 text-2xl font-black text-slate-950 dark:text-white">{t('dashboard.checklistsTitle')}</h2>
              {!saved.length ? (
                <EmptyState text={t('dashboard.emptyChecklists')} />
              ) : (
                <div className="grid gap-4">
                  {saved.map((serviceId) => {
                    const checked = readJson(getChecklistKey(serviceId), []);
                    const total = translations.services[serviceId]?.checklist?.length || 0;
                    const progress = total ? Math.round((checked.length / total) * 100) : 0;

                    return (
                      <Link key={serviceId} to={`/services/${serviceId}`} className="focus-ring rounded-md border border-slate-200 p-4 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-bold text-slate-950 dark:text-white">{getServiceTitle(serviceId)}</h3>
                          <span className="text-sm font-bold text-sheba-700 dark:text-sheba-100">{progress}%</span>
                        </div>
                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-sheba-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {t('dashboard.checklistProgress')
                            .replace('{done}', checked.length)
                            .replace('{total}', total)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {activeTab === 'reminders' && (
            <Panel>
              <h2 className="mb-4 text-2xl font-black text-slate-950 dark:text-white">{t('dashboard.remindersTitle')}</h2>
              <form className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto]" onSubmit={addReminder}>
                <input
                  value={reminderForm.serviceName}
                  onChange={(event) => setReminderForm((current) => ({ ...current, serviceName: event.target.value }))}
                  placeholder={t('dashboard.serviceName')}
                  className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <input
                  type="date"
                  value={reminderForm.date}
                  onChange={(event) => setReminderForm((current) => ({ ...current, date: event.target.value }))}
                  className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <input
                  value={reminderForm.note}
                  onChange={(event) => setReminderForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder={t('dashboard.reminderNote')}
                  className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <button className="btn-pop focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-sheba-600 px-4 text-sm font-bold text-white">
                  <CalendarPlus className="h-4 w-4" />
                  {t('dashboard.addReminder')}
                </button>
              </form>

              {!reminders.length ? (
                <EmptyState text={t('dashboard.emptyReminders')} />
              ) : (
                <div className="grid gap-3">
                  {reminders.map((reminder) => {
                    const overdue = isOverdue(reminder.date);
                    const serviceName = reminder.serviceName || getServiceTitle(reminder.serviceId);

                    return (
                      <article
                        key={reminder.id}
                        className={`flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between ${
                          overdue
                            ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div>
                          <h3 className="font-bold text-slate-950 dark:text-white">{serviceName}</h3>
                          <p className={`text-sm ${overdue ? 'font-bold text-red-700 dark:text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {reminder.date}
                            {overdue ? ` - ${t('dashboard.overdue')}` : ''}
                          </p>
                          {reminder.note && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{reminder.note}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteReminder(reminder.id)}
                          className="btn-pop focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:text-slate-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('dashboard.delete')}
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {activeTab === 'profile' && (
            <Panel>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">{t('dashboard.profileTitle')}</h2>
                <button
                  type="button"
                  onClick={() => setEditingProfile((current) => !current)}
                  className="btn-pop focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-100"
                >
                  <Pencil className="h-4 w-4" />
                  {editingProfile ? t('dashboard.cancel') : t('dashboard.editName')}
                </button>
              </div>
              {profileMessage && (
                <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                  {profileMessage}
                </p>
              )}
              <form className="grid max-w-xl gap-4" onSubmit={saveProfile}>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.name')}</span>
                  <input
                    value={profileForm.name}
                    readOnly={!editingProfile}
                    onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                    className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 read-only:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:read-only:bg-slate-900"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.email')}</span>
                  <input
                    value={currentUser.email}
                    readOnly
                    className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('dashboard.languagePreference')}</span>
                  <div className="grid grid-cols-2 rounded-md border border-slate-200 p-1 dark:border-slate-700">
                    {[
                      ['en', 'English'],
                      ['bn', 'বাংলা'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setProfileForm((current) => ({ ...current, language: value }));
                          localStorage.setItem('amarsheba-locale', value);
                          setLocale(value);
                        }}
                        className={`btn-pop focus-ring h-10 rounded-md text-sm font-bold ${
                          profileForm.language === value
                            ? 'bg-sheba-600 text-white'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </label>
                {editingProfile && (
                  <button className="btn-pop focus-ring h-11 rounded-md bg-sheba-600 px-4 text-sm font-bold text-white">
                    {t('dashboard.saveProfile')}
                  </button>
                )}
              </form>
            </Panel>
          )}
        </div>
      </div>
    </section>
  );
}
