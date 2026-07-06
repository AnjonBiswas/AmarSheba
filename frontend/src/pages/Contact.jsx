import { Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function Contact() {
  const { t } = useLocale();
  usePageTitle(t('contact.title'));
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(t('contact.required'));
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || t('contact.error'));
      }

      setSuccess(t('contact.success'));
      setForm({ name: '', email: '', topic: '', message: '' });
    } catch (submitError) {
      setError(submitError.message || t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title={t('contact.title')} intro={t('contact.intro')} />
      <section className="container-shell grid gap-6 pb-12 lg:grid-cols-[1fr_0.75fr]">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          {success && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
              {success}
            </p>
          )}
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
              {error}
            </p>
          )}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('contact.name')}</span>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('contact.email')}</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('contact.topic')}</span>
            <input
              value={form.topic}
              onChange={(event) => updateField('topic', event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('contact.message')}</span>
            <textarea
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              className="focus-ring min-h-36 rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="focus-ring h-12 rounded-md bg-sheba-600 px-5 text-sm font-bold text-white transition hover:bg-sheba-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? t('contact.sending') : t('common.sendMessage')}
          </button>
        </form>
        <aside className="rounded-md border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{t('contact.office')}</h2>
          <div className="mt-5 grid gap-4 text-slate-600 dark:text-slate-300">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-sheba-600 dark:text-sheba-100" />
              Dhaka, Bangladesh
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-sheba-600 dark:text-sheba-100" />
              hello@amarsheba.local
            </p>
            <p>{t('contact.hours')}</p>
          </div>
        </aside>
      </section>
    </>
  );
}
