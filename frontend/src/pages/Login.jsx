import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function Login() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const { t } = useLocale();
  usePageTitle(t('auth.loginTitle'));
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const successMessage = location.state?.registered ? t('auth.registerSuccess') : '';

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.emailOrPhone.trim() || !form.password) {
      setError(t('auth.errors.required'));
      return;
    }

    setLoading(true);
    const result = await login(form.emailOrPhone, form.password);
    setLoading(false);

    if (!result.ok) {
      setError(t(`auth.errors.${result.error}`));
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <section className="container-shell grid min-h-[calc(100vh-18rem)] place-items-center py-12">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-sheba-700 dark:text-sheba-100">{t('auth.loginEyebrow')}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{t('auth.loginTitle')}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('auth.loginIntro')}</p>
        </div>

        {error && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
            {error}
          </p>
        )}
        {successMessage && !error && (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
            {successMessage}
          </p>
        )}

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.emailOrPhone')}</span>
            <input
              value={form.emailOrPhone}
              onChange={(event) => updateField('emailOrPhone', event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              autoComplete="username"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('auth.password')}</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              autoComplete="current-password"
            />
          </label>
          <button
            disabled={loading}
            className="btn-pop focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md bg-sheba-600 px-5 text-sm font-bold text-white hover:bg-sheba-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogIn className="h-4 w-4" />
            {loading ? t('auth.loginLoading') : t('auth.loginButton')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          {t('auth.noAccount')}{' '}
          <Link className="font-bold text-sheba-700 hover:underline dark:text-sheba-100" to="/register">
            {t('auth.registerLink')}
          </Link>
        </p>
      </div>
    </section>
  );
}
