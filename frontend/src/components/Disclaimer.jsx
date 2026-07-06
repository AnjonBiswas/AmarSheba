import { ShieldAlert } from 'lucide-react';
import { useLocale } from '../context/LocaleContext.jsx';

export default function Disclaimer() {
  const { t } = useLocale();

  return (
    <aside className="container-shell pb-8 pt-2">
      <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{t('common.disclaimer')}</p>
      </div>
    </aside>
  );
}
