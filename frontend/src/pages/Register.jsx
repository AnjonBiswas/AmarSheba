import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function Register() {
  const { isAuthenticated, isLoading, register } = useAuth();
  const { t } = useLocale();
  usePageTitle(t('auth.registerTitle'));
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password || !form.confirmPassword) {
      return 'required';
    }

    if (form.password.length < 6) {
      return 'passwordLength';
    }

    if (form.password !== form.confirmPassword) {
      return 'passwordMismatch';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(t(`auth.errors.${validationError}`));
      return;
    }

    setLoading(true);
    const result = await register(form.name, form.email, form.phone, form.password);
    setLoading(false);

    if (!result.ok) {
      setError(t(`auth.errors.${result.error}`));
      return;
    }

    navigate('/login', { replace: true, state: { registered: true } });
  };

  return (
    <section className="container-shell grid min-h-[calc(100vh-18rem)] place-items-center py-12">
      <div className="w-full max-w-lg rounded-md border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-sheba-700 dark:text-sheba-100">{t('auth.registerEyebrow')}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{t('auth.registerTitle')}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('auth.registerIntro')}</p>
        </div>

        {error && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
            {error}
          </p>
        )}

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.name')}</span>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              autoComplete="name"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.email')}</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              autoComplete="email"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.phone')}</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              autoComplete="tel"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.password')}</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                autoComplete="new-password"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.confirmPassword')}</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                autoComplete="new-password"
              />
            </label>
          </div>
          <button
            disabled={loading}
            className="btn-pop focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md bg-sheba-600 px-5 text-sm font-bold text-white hover:bg-sheba-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? t('auth.registerLoading') : t('auth.registerButton')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          {t('auth.hasAccount')}{' '}
          <Link className="font-bold text-sheba-700 hover:underline dark:text-sheba-100" to="/login">
            {t('auth.loginLink')}
          </Link>
        </p>
      </div>
    </section>
  );
}
