import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';

export default function BackToTop() {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="btn-pop focus-ring fixed bottom-24 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-soft hover:border-sheba-500 hover:text-sheba-700 sm:bottom-28 sm:right-6 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      aria-label={t('common.backToTop')}
      title={t('common.backToTop')}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
