import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { services } from '../data/services.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { getServiceContent } from '../utils/adminStorage.js';
import { filterServices } from '../utils/search.js';

const popularServiceIds = ['identity', 'passport', 'tax', 'driving-license'];

export default function NotFound() {
  const { t, translations } = useLocale();
  usePageTitle(t('common.pageNotFound'));
  const [query, setQuery] = useState('');
  const popularServices = services.filter((service) => popularServiceIds.includes(service.id));
  const visibleServices = useMemo(() => filterServices(services, translations, query), [query, translations]);
  const listedServices = query.trim() ? visibleServices : popularServices;

  return (
    <>
      <PageHeader title={t('common.pageNotFound')} intro={t('notFound.intro')} />
      <section className="container-shell grid gap-6 pb-12">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="focus-ring inline-flex h-12 w-fit items-center rounded-md bg-sheba-600 px-5 text-sm font-bold text-white transition hover:bg-sheba-700"
          >
            {t('common.backHome')}
          </Link>
          <Link
            to="/services"
            className="focus-ring inline-flex h-12 w-fit items-center rounded-md border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:text-slate-100"
          >
            {t('nav.services')}
          </Link>
        </div>

        <div className="max-w-2xl">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            {query.trim() ? t('servicesPage.title') : t('notFound.popularTitle')}
          </h2>
          {listedServices.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {listedServices.map((service) => {
                const details = getServiceContent(service.id, translations);

                return (
                  <Link
                    key={service.id}
                    to={`/services/${service.id}`}
                    className="focus-ring rounded-md border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 transition hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {details.title}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-slate-200 bg-white p-5 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {t('common.noResults')}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
