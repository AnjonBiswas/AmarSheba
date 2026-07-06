import { Languages } from 'lucide-react';
import { useLocale } from '../context/LocaleContext.jsx';

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
      className="navbar-button focus-ring shrink-0 gap-2 whitespace-nowrap"
      aria-label={t('common.language')}
      title={t('common.language')}
    >
      <Languages className="pointer-events-none h-4 w-4 shrink-0" />
      <span className="pointer-events-none">{locale === 'en' ? 'বাংলা' : 'English'}</span>
    </button>
  );
}
