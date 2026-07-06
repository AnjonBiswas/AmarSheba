import { Check } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function About() {
  const { t, translations } = useLocale();
  usePageTitle(t('about.title'));

  return (
    <>
      <PageHeader title={t('about.title')} intro={t('about.intro')} />
      <section className="container-shell grid gap-6 pb-12 lg:grid-cols-2">
        <article className="rounded-md border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{t('about.missionTitle')}</h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{t('about.mission')}</p>
        </article>
        <article className="rounded-md border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{t('about.valuesTitle')}</h2>
          <ul className="mt-4 grid gap-3">
            {translations.about.values.map((value) => (
              <li key={value} className="flex gap-3 text-slate-600 dark:text-slate-300">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-sheba-600 dark:text-sheba-100" />
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
