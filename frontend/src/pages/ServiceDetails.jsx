import { ArrowLeft, CheckCircle2, ExternalLink, Heart, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { fetchServiceById, getDisplayContent } from '../utils/servicesApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { getCustomFaqs, getServiceContent } from '../utils/adminStorage.js';

const STORAGE_KEYS = {
  saved: 'amarsheba_saved',
  favorites: 'amarsheba_favorites',
  recent: 'amarsheba_recent',
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

function normalizeIds(items) {
  return items.map((item) => (typeof item === 'string' ? item : item?.id)).filter(Boolean);
}

function normalizeRecentEntries(items) {
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
    .filter(Boolean);
}

function getChecklistKey(serviceId) {
  return `amarsheba_checklist_${serviceId}`;
}

function InfoSection({ title, children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sheba-600 dark:bg-sheba-100" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { locale, t, translations } = useLocale();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const details = useMemo(
    () => (service ? getDisplayContent(service, locale, translations) : null),
    [locale, service, translations],
  );
  usePageTitle(details?.title || t('common.pageNotFound'));
  const [savedServices, setSavedServices] = useState(() => normalizeIds(readJson(STORAGE_KEYS.saved, [])));
  const [favoriteServices, setFavoriteServices] = useState(() => normalizeIds(readJson(STORAGE_KEYS.favorites, [])));
  const [checkedItems, setCheckedItems] = useState(() => readJson(getChecklistKey(serviceId), []));

  useEffect(() => {
    let active = true;

    async function loadService() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchServiceById(serviceId);

        if (active) {
          setService(data);
        }
      } catch (loadError) {
        if (active) {
          setService(null);
          setError(loadError.message || 'Could not load service details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadService();

    return () => {
      active = false;
    };
  }, [serviceId]);

  useEffect(() => {
    if (!service) {
      return;
    }

    const recent = normalizeRecentEntries(readJson(STORAGE_KEYS.recent, []));
    writeJson(
      STORAGE_KEYS.recent,
      [
        { id: service.id, title: details.title, visitedAt: Date.now() },
        ...recent.filter((entry) => entry.id !== service.id),
      ].slice(0, 10),
    );
    setCheckedItems(readJson(getChecklistKey(service.id), []));
  }, [details?.title, service]);

  if (loading) {
    return (
      <section className="container-shell py-12">
        <LoadingSpinner />
      </section>
    );
  }

  if (error || !service || !details) {
    return (
      <section className="container-shell py-12">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{t('common.pageNotFound')}</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">{error || t('notFound.intro')}</p>
        <Link
          to="/services"
          className="btn-pop focus-ring mt-6 inline-flex h-11 items-center rounded-md bg-sheba-600 px-4 text-sm font-bold text-white"
        >
          {t('serviceDetails.back')}
        </Link>
      </section>
    );
  }

  const relatedServices = service.related.map((relatedId) => ({ id: relatedId })).filter(Boolean);
  const faqItems = [...details.faq, ...getCustomFaqs(service.id)];
  const isSaved = savedServices.includes(service.id);
  const isFavorite = favoriteServices.includes(service.id);
  const checklistTotal = details.checklist.length;
  const checklistCompleted = checkedItems.length;
  const checklistProgress = checklistTotal ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  const toggleServiceCollection = (key, serviceIdToToggle, setter, current, requiresAuth = false) => {
    if (requiresAuth && !isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const next = current.includes(serviceIdToToggle)
      ? current.filter((id) => id !== serviceIdToToggle)
      : [serviceIdToToggle, ...current];

    setter(next);
    writeJson(key, next);
  };

  const toggleChecklistItem = (index) => {
    const nextChecked = checkedItems.includes(index)
      ? checkedItems.filter((item) => item !== index)
      : [...checkedItems, index].sort((a, b) => a - b);

    setCheckedItems(nextChecked);
    writeJson(getChecklistKey(service.id), nextChecked);
  };

  const printChecklist = () => {
    window.print();
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="container-shell py-10">
          <Link
            to="/services"
            className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-sheba-700 dark:text-sheba-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('serviceDetails.back')}
          </Link>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className={`h-2 w-24 rounded-full ${service.accent}`} />
              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-normal text-slate-950 dark:text-white">
                {details.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{details.description}</p>
            </div>
            <div className="no-print flex flex-wrap gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() => toggleServiceCollection(STORAGE_KEYS.saved, service.id, setSavedServices, savedServices, true)}
                className={`btn-pop focus-ring inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-bold ${
                  isSaved
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100'
                    : 'border-slate-200 text-slate-700 hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:text-slate-100'
                }`}
              >
                {isSaved && <CheckCircle2 className="h-4 w-4" />}
                {isSaved ? `${t('serviceDetails.saved')} ✓` : t('serviceDetails.save')}
              </button>
              <button
                type="button"
                onClick={() => toggleServiceCollection(STORAGE_KEYS.favorites, service.id, setFavoriteServices, favoriteServices)}
                className={`btn-pop focus-ring inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-bold ${
                  isFavorite
                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100'
                    : 'border-slate-200 text-slate-700 hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:text-slate-100'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? t('serviceDetails.favorited') : t('serviceDetails.favorite')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="container-shell grid gap-5 py-10 lg:grid-cols-[1fr_0.9fr]">
        <InfoSection title={t('serviceDetails.overview')}>
          <p>{details.overview}</p>
        </InfoSection>
        <InfoSection title={t('serviceDetails.eligibility')}>
          <p>{details.eligibility}</p>
        </InfoSection>
        <InfoSection title={t('serviceDetails.requiredDocuments')}>
          <BulletList items={details.requiredDocuments} />
        </InfoSection>
        <InfoSection title={t('serviceDetails.checklist')}>
          <div className="print-checklist grid gap-4">
            <div className="print-only">
              <h1>{details.title}</h1>
              <p>{t('serviceDetails.printDate').replace('{date}', new Date().toLocaleDateString())}</p>
              <p>{t('common.disclaimer')}</p>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                <span>
                  {t('serviceDetails.checklistComplete')
                    .replace('{done}', checklistCompleted)
                    .replace('{total}', checklistTotal)}
                </span>
                <span>{checklistProgress}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-sheba-600 transition-all duration-500 ease-out" style={{ width: `${checklistProgress}%` }} />
              </div>
            </div>
            {details.checklist.map((item, index) => (
              <label key={item} className="flex cursor-pointer gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={checkedItems.includes(index)}
                  onChange={() => toggleChecklistItem(index)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-sheba-600"
                />
                <span className={`transition-all duration-200 ${checkedItems.includes(index) ? 'text-slate-400 line-through opacity-70 dark:text-slate-500' : 'opacity-100'}`}>
                  {item}
                </span>
              </label>
            ))}
            <button
              type="button"
              onClick={printChecklist}
              className="btn-pop focus-ring inline-flex h-11 w-fit items-center gap-2 rounded-md bg-sheba-600 px-4 text-sm font-bold text-white hover:bg-sheba-700"
            >
              <Printer className="h-4 w-4" />
              {t('serviceDetails.downloadChecklist')}
            </button>
          </div>
        </InfoSection>
        <InfoSection title={t('serviceDetails.fees')}>
          <p>{details.fees}</p>
        </InfoSection>
        <InfoSection title={t('serviceDetails.timeline')}>
          <p>{details.timeline}</p>
        </InfoSection>
      </section>

      <section className="container-shell grid gap-5 pb-10 lg:grid-cols-[1fr_0.9fr]">
        <InfoSection title={t('serviceDetails.steps')}>
          <ol className="grid gap-3">
            {details.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-sheba-50 text-xs font-bold text-sheba-700 dark:bg-sheba-500/15 dark:text-sheba-100">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </InfoSection>

        <div className="grid gap-5">
          <InfoSection title={t('serviceDetails.officialLink')}>
            <a
              href={service.officialLink}
              target="_blank"
              rel="noreferrer"
              className="btn-pop focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-sheba-600 px-4 text-sm font-bold text-white hover:bg-sheba-700"
            >
              {t('serviceDetails.openOfficial')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </InfoSection>
          <InfoSection title={t('serviceDetails.relatedServices')}>
            <div className="flex flex-wrap gap-2">
              {relatedServices.map((related) => (
                <Link
                  key={related.id}
                  to={`/services/${related.id}`}
                  className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:text-slate-100"
                >
                  {getServiceContent(related.id, translations)?.title || related.id}
                </Link>
              ))}
            </div>
          </InfoSection>
        </div>
      </section>

      <section className="container-shell pb-12">
        <InfoSection title={t('serviceDetails.faq')}>
          <div className="grid gap-3">
            {faqItems.map((item) => (
              <details key={item.q} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                <summary className="cursor-pointer font-bold text-slate-950 dark:text-white">{item.q}</summary>
                <p className="mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </InfoSection>
      </section>
    </>
  );
}
