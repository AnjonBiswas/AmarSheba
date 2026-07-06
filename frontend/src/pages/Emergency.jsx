import {
  Ambulance,
  BadgeInfo,
  Building2,
  Flame,
  Heart,
  HeartPulse,
  MapPin,
  Phone,
  Search,
  Shield,
  Siren,
  UtilityPole,
  Waves,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import {
  getLocalizedEmergency,
  readEmergencyFavorites,
  readEmergencyServices,
  writeEmergencyFavorites,
} from '../utils/emergencyStorage.js';

const copy = {
  en: {
    eyebrow: 'Emergency directory',
    title: 'Emergency Services',
    intro: 'Search trusted emergency contacts, call instantly, and keep important numbers saved for fast access.',
    search: 'Search ambulance, police, hospital, fire, blood...',
    nearby: 'Nearby Emergency Services',
    nationalOnly: 'Location permission was denied. Showing national emergency contacts only.',
    locationLoading: 'Checking location permission...',
    allContacts: 'All Emergency Contacts',
    callNow: 'Call Now',
    details: 'View Details',
    hideDetails: 'Hide Details',
    favorite: 'Save Favorite',
    saved: 'Saved',
    noResults: 'No emergency contacts matched your search.',
    address: 'Address',
    district: 'District',
    status: 'Active',
  },
  bn: {
    eyebrow: 'জরুরি নির্দেশিকা',
    title: 'জরুরি সেবা',
    intro: 'বিশ্বস্ত জরুরি নম্বর খুঁজুন, সরাসরি কল করুন এবং প্রয়োজনীয় নম্বর সংরক্ষণ করুন।',
    search: 'অ্যাম্বুলেন্স, পুলিশ, হাসপাতাল, ফায়ার, রক্ত খুঁজুন...',
    nearby: 'নিকটবর্তী জরুরি সেবা',
    nationalOnly: 'লোকেশন অনুমতি দেওয়া হয়নি। শুধু জাতীয় জরুরি নম্বর দেখানো হচ্ছে।',
    locationLoading: 'লোকেশন অনুমতি যাচাই করা হচ্ছে...',
    allContacts: 'সব জরুরি যোগাযোগ',
    callNow: 'কল করুন',
    details: 'বিস্তারিত',
    hideDetails: 'বিস্তারিত বন্ধ',
    favorite: 'ফেভারিটে রাখুন',
    saved: 'সংরক্ষিত',
    noResults: 'আপনার অনুসন্ধানের সাথে কোনো জরুরি যোগাযোগ মেলেনি।',
    address: 'ঠিকানা',
    district: 'জেলা',
    status: 'সক্রিয়',
  },
};

const iconMap = {
  Ambulance,
  'Fire Service': Flame,
  Police: Shield,
  'Women & Child Helpline': Heart,
  'National Emergency': Siren,
  'Electricity Emergency': Zap,
  'Gas Emergency': UtilityPole,
  'Hospital Emergency': Building2,
  'Blood Donation': HeartPulse,
  'Disaster Management': Waves,
};

function distanceKm(from, service) {
  if (!from || !service.latitude || !service.longitude) {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRadians(service.latitude - from.latitude);
  const dLon = toRadians(service.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(service.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Emergency() {
  const { locale } = useLocale();
  const text = copy[locale] || copy.en;
  usePageTitle(text.title);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('search') || '');
  const [expandedId, setExpandedId] = useState(null);
  const [locationState, setLocationState] = useState('loading');
  const [position, setPosition] = useState(null);
  const [favorites, setFavorites] = useState(() => readEmergencyFavorites());
  const services = useMemo(() => readEmergencyServices().filter((service) => service.isActive !== false), []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationState('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({ latitude: result.coords.latitude, longitude: result.coords.longitude });
        setLocationState('granted');
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 },
    );
  }, []);

  const visibleServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const baseServices = locationState === 'denied'
      ? services.filter((service) => service.isNational)
      : services;

    return baseServices
      .map((service) => ({ ...getLocalizedEmergency(service, locale), distance: distanceKm(position, service) }))
      .filter((service) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          service.name,
          service.nameBn,
          service.category,
          service.description,
          service.descriptionBn,
          service.district,
          service.phone,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (a.distance == null || b.distance == null) {
          return 0;
        }

        return a.distance - b.distance;
      });
  }, [locale, locationState, position, query, services]);

  const toggleFavorite = (serviceId) => {
    const next = favorites.includes(serviceId)
      ? favorites.filter((id) => id !== serviceId)
      : [...favorites, serviceId];

    setFavorites(next);
    writeEmergencyFavorites(next);
  };

  return (
    <section className="container-shell py-10">
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold uppercase text-red-600 dark:text-red-200">{text.eyebrow}</p>
        <div className="mt-2 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl dark:text-white">{text.title}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-300">{text.intro}</p>
          </div>
          <a
            href="tel:999"
            className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
          >
            <Phone className="h-4 w-4" />
            999
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text.search}
            className="focus-ring h-12 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm dark:border-slate-800 dark:bg-slate-900"
          />
        </label>
        <div className="flex min-h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <MapPin className="h-4 w-4 text-sheba-600 dark:text-sheba-100" />
          {locationState === 'loading' ? text.locationLoading : locationState === 'granted' ? text.nearby : text.nationalOnly}
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-black text-slate-950 dark:text-white">
        {locationState === 'granted' ? text.nearby : text.allContacts}
      </h2>

      {visibleServices.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleServices.map((service) => {
            const Icon = iconMap[service.category] || BadgeInfo;
            const isExpanded = expandedId === service.id;
            const isFavorite = favorites.includes(service.id);

            return (
              <article key={service.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sheba-300 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-md bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(service.id)}
                    className={`focus-ring grid h-10 w-10 place-items-center rounded-md border ${
                      isFavorite
                        ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100'
                        : 'border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:text-slate-300'
                    }`}
                    aria-label={isFavorite ? text.saved : text.favorite}
                    title={isFavorite ? text.saved : text.favorite}
                  >
                    <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="mt-4 text-xs font-black uppercase text-sheba-700 dark:text-sheba-100">{service.category}</p>
                <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">{service.displayName}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">{service.displayDescription}</p>
                <p className="mt-4 flex items-center gap-2 text-2xl font-black text-red-600 dark:text-red-100">
                  <Phone className="h-5 w-5" />
                  {service.phone}
                </p>
                {service.distance != null && (
                  <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{service.distance.toFixed(1)} km</p>
                )}
                {isExpanded && (
                  <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    <p><span className="font-bold text-slate-800 dark:text-slate-100">{text.district}:</span> {service.district}</p>
                    <p><span className="font-bold text-slate-800 dark:text-slate-100">{text.address}:</span> {service.address}</p>
                    <p><span className="font-bold text-slate-800 dark:text-slate-100">{text.status}:</span> {service.isActive ? 'Yes' : 'No'}</p>
                  </div>
                )}
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <a
                    href={`tel:${service.phone}`}
                    className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
                  >
                    <Phone className="h-4 w-4" />
                    {text.callNow}
                  </a>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : service.id)}
                    className="focus-ring h-11 rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:text-slate-100"
                  >
                    {isExpanded ? text.hideDetails : text.details}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-md border border-slate-200 bg-white p-5 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {text.noResults}
        </p>
      )}
    </section>
  );
}

