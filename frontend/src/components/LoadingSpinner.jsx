import { useLocale } from '../context/LocaleContext.jsx';

export default function LoadingSpinner() {
  const { locale, t } = useLocale();

  return (
    <div className="container-shell grid min-h-[50vh] place-items-center py-12">
      <div className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
        <div className="relative grid h-14 w-14 place-items-center">
          <span className="absolute h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sheba-600 dark:border-slate-800 dark:border-t-sheba-100" />
          <span className="h-3 w-3 animate-pulse rounded-full bg-sheba-600 dark:bg-sheba-100" />
        </div>
        <p className="animate-pulse text-sm font-black text-sheba-700 dark:text-sheba-100">
          {locale === 'bn' ? 'আমার সেবা' : t('common.appName')}
        </p>
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    </div>
  );
}
