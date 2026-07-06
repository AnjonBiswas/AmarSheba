import { Siren } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { fetchServices } from '../utils/servicesApi.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import { filterServices } from '../utils/search.js';

function EmergencyServiceCard({ locale }) {
  const title = locale === 'bn' ? 'জরুরি সেবা' : 'Emergency Services';
  const description = locale === 'bn'
    ? 'অ্যাম্বুলেন্স, পুলিশ, ফায়ার, হাসপাতাল, রক্ত ও জাতীয় জরুরি নম্বর দ্রুত খুঁজুন।'
    : 'Find ambulance, police, fire, hospital, blood, and national emergency contacts quickly.';
  const action = locale === 'bn' ? 'সেবা দেখুন' : 'View Services';

  return (
    <article className="group cursor-pointer rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-red-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="h-2 w-16 rounded-full bg-red-600 transition-all duration-200 group-hover:w-full" />
      <div className="mt-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-100">
          <Siren className="h-5 w-5" />
        </span>
        <p className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">
          {locale === 'bn' ? 'জরুরি সহায়তা' : 'Emergency support'}
        </p>
      </div>
      <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
      <Link to="/services/emergency" className="btn-pop focus-ring mt-5 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
        {action}
      </Link>
    </article>
  );
}

function RevealedCard({ children, index }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {children}
    </div>
  );
}

export default function Services() {
  const { locale, t, translations } = useLocale();
  usePageTitle(t('servicesPage.title'));
  const [query, setQuery] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadServices() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchServices();

        if (active) {
          setServices(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Could not load services.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  const visibleServices = useMemo(() => filterServices(services, translations, query), [query, services, translations]);
  const emergencyMatches = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return true;
    }

    return ['emergency', 'urgent', 'ambulance', 'police', 'fire', 'hospital', '999', 'জরুরি', 'অ্যাম্বুলেন্স', 'পুলিশ']
      .some((keyword) => keyword.toLowerCase().includes(normalized) || normalized.includes(keyword.toLowerCase()));
  }, [query]);

  return (
    <>
      <PageHeader title={t('servicesPage.title')} intro={t('servicesPage.intro')} />
      <section className="container-shell pb-12">
        <div className="mb-6 max-w-2xl">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
            {error}
          </p>
        ) : visibleServices.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {emergencyMatches && (
              <RevealedCard index={0}>
                <EmergencyServiceCard locale={locale} />
              </RevealedCard>
            )}
            {visibleServices.map((service, index) => (
              <RevealedCard key={service.id} index={emergencyMatches ? index + 1 : index}>
                <ServiceCard service={service} />
              </RevealedCard>
            ))}
          </div>
        ) : emergencyMatches ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <RevealedCard index={0}>
              <EmergencyServiceCard locale={locale} />
            </RevealedCard>
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
