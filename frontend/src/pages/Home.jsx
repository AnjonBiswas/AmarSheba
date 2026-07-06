import { Ambulance, ArrowRight, Building2, CheckCircle2, Flame, HeartPulse, Megaphone, Shield, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { services } from '../data/services.js';
import { ADMIN_STORAGE_KEYS, readJson } from '../utils/adminStorage.js';
import { filterServices } from '../utils/search.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';

const noticeStyles = {
  info: 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-100',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
};

function RevealedServiceCard({ service, index }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <ServiceCard service={service} />
    </div>
  );
}

export default function Home() {
  const { locale, t, translations } = useLocale();
  usePageTitle('Home');
  const [query, setQuery] = useState('');
  const [notices] = useState(() => readJson(ADMIN_STORAGE_KEYS.notices, []));
  const [dismissedNotices, setDismissedNotices] = useState(() => readJson('amarsheba_dismissed_notices', []));
  const visibleServices = useMemo(
    () => filterServices(services.slice(0, 6), translations, query),
    [query, translations],
  );
  const activeNotices = notices.filter((notice) => !dismissedNotices.includes(notice.id));
  const emergencyHelp = [
    { label: locale === 'bn' ? 'অ্যাম্বুলেন্স' : 'Ambulance', icon: Ambulance, query: 'ambulance' },
    { label: locale === 'bn' ? 'ফায়ার' : 'Fire', icon: Flame, query: 'fire' },
    { label: locale === 'bn' ? 'পুলিশ' : 'Police', icon: Shield, query: 'police' },
    { label: locale === 'bn' ? 'রক্ত' : 'Blood', icon: HeartPulse, query: 'blood' },
    { label: locale === 'bn' ? 'হাসপাতাল' : 'Hospital', icon: Building2, query: 'hospital' },
  ];

  const dismissNotice = (noticeId) => {
    const next = [...dismissedNotices, noticeId];
    setDismissedNotices(next);
    localStorage.setItem('amarsheba_dismissed_notices', JSON.stringify(next));
  };

  return (
    <>
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="container-shell grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <p className="text-sm font-bold uppercase text-sheba-700 dark:text-sheba-100">{t('home.eyebrow')}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-normal text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              {t('home.title')}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{t('home.intro')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/services"
                className="btn-pop focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md bg-sheba-600 px-5 text-sm font-bold text-white hover:bg-sheba-700"
              >
                {t('home.primaryAction')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="btn-pop focus-ring inline-flex h-12 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-bold text-slate-700 hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:text-slate-100"
              >
                {t('home.secondaryAction')}
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[t('home.statOne'), t('home.statTwo'), t('home.statThree')].map((stat) => (
                <div key={stat} className="flex items-center gap-3 rounded-md bg-white p-4 dark:bg-slate-950">
                  <CheckCircle2 className="h-5 w-5 text-sheba-600 dark:text-sheba-100" />
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{stat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {activeNotices.length > 0 && (
        <section className="container-shell pt-6">
          <div className="grid gap-3">
            {activeNotices.map((notice) => (
              <div key={notice.id} className={`flex gap-3 rounded-md border p-4 text-sm font-semibold leading-6 ${noticeStyles[notice.type] || noticeStyles.info}`}>
                <Megaphone className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="min-w-0 flex-1">
                  {notice.title && <span className="font-black">{notice.title}: </span>}
                  {notice.message || notice.text}
                </p>
                <button
                  type="button"
                  onClick={() => dismissNotice(notice.id)}
                  className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-white/70 dark:hover:bg-slate-900/70"
                  aria-label={t('common.dismiss')}
                  title={t('common.dismiss')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-red-100 bg-red-50/70 dark:border-red-500/20 dark:bg-red-500/5">
        <div className="container-shell py-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-red-600 dark:text-red-200">{locale === 'bn' ? 'জরুরি সহায়তা' : 'Emergency Help'}</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{locale === 'bn' ? 'দ্রুত জরুরি নম্বর খুলুন' : 'Open quick emergency contacts'}</h2>
            </div>
            <Link to="/services/emergency" className="btn-pop focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-bold text-red-600 dark:border-red-500/30 dark:bg-slate-950 dark:text-red-100">
              {locale === 'bn' ? 'সব দেখুন' : 'View all'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {emergencyHelp.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.query}
                  to={`/services/emergency?search=${item.query}`}
                  className="btn-pop focus-ring flex min-h-20 items-center gap-3 rounded-md border border-red-100 bg-white p-4 font-black text-slate-900 shadow-sm hover:border-red-300 hover:text-red-600 dark:border-red-500/20 dark:bg-slate-900 dark:text-white dark:hover:text-red-100"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-red-600 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-shell py-10">
        <div className="mb-6 max-w-2xl">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        {visibleServices.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleServices.map((service, index) => (
              <RevealedServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-slate-200 bg-white p-5 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {t('common.noResults')}
          </p>
        )}
      </section>
    </>
  );
}
