import { Search } from 'lucide-react';
import { useLocale } from '../context/LocaleContext.jsx';

export default function SearchBar({ value, onChange }) {
  const { t } = useLocale();

  return (
    <label className="relative block w-full">
      <span className="sr-only">{t('common.searchPlaceholder')}</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('common.searchPlaceholder')}
        className="focus-ring h-12 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-900 shadow-sm transition placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
    </label>
  );
}
