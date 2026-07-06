import { ArrowRight } from 'lucide-react';
import { useLocale } from '../context/LocaleContext.jsx';
import { Link } from 'react-router-dom';
import { getServiceContent } from '../utils/adminStorage.js';

export default function ServiceCard({ service }) {
  const { locale, t, translations } = useLocale();

  const localizedTitle = locale === 'bn' ? service.title_bn : service.title_en;
  const localizedDescription = locale === 'bn' ? service.description_bn : service.description_en;
  const details = getServiceContent(service.id, translations) || {
    title: localizedTitle || service.title,
    description: localizedDescription || service.description,
  };

  if (!details) {
    return null;
  }

  return (
    <article className="group cursor-pointer rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-sheba-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className={`h-2 w-16 rounded-full transition-all duration-200 group-hover:w-full ${service.accent}`} />
      <p className="mt-5 text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">{t('servicesPage.category')}</p>
      <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{details.title}</h2>
      <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {details.description}
      </p>
      <Link to={`/services/${service.id}`} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-sheba-700 transition dark:text-sheba-100">
        {t('common.learnMore')}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
