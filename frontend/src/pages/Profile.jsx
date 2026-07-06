import { Pencil, Save } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    language: locale,
  });

  usePageTitle(t('dashboard.profileTitle'));

  const saveProfile = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    updateProfile(form);
    setLocale(form.language);
    setEditing(false);
    setMessage(t('dashboard.profileSaved'));
  };

  return (
    <section className="container-shell py-10">
      <div className="mx-auto max-w-3xl rounded-md border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-sheba-700 dark:text-sheba-100">{t('auth.dashboardEyebrow')}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{t('dashboard.profileTitle')}</h1>
          </div>
          <button
            type="button"
            onClick={() => setEditing((current) => !current)}
            className="btn-pop focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-100"
          >
            <Pencil className="h-4 w-4" />
            {editing ? t('dashboard.cancel') : t('dashboard.editName')}
          </button>
        </div>

        <p className="mt-3 text-slate-600 dark:text-slate-300">{t('auth.dashboardIntro')}</p>

        {message && (
          <p className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
            {message}
          </p>
        )}

        <form className="mt-6 grid gap-4" onSubmit={saveProfile}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.name')}</span>
            <input
              value={form.name}
              readOnly={!editing}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 read-only:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:read-only:bg-slate-900"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.email')}</span>
            <input
              value={currentUser?.email || ''}
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
                    setForm((current) => ({ ...current, language: value }));
                    localStorage.setItem('amarsheba-locale', value);
                    setLocale(value);
                  }}
                  className={`focus-ring h-10 rounded-md text-sm font-bold transition-colors duration-150 ${
                    form.language === value ? 'bg-sheba-600 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </label>

          {editing && (
            <button className="btn-pop focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-sheba-600 px-4 text-sm font-bold text-white">
              <Save className="h-4 w-4" />
              {t('dashboard.saveProfile')}
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
