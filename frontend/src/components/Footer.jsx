import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext.jsx';

export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
      <div className="container-shell flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{t('common.appName')}</p>
          <p>{t('footer.note')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="hover:text-sheba-700 dark:hover:text-sheba-100" to="/services">
            {t('nav.services')}
          </Link>
          <Link className="hover:text-sheba-700 dark:hover:text-sheba-100" to="/contact">
            {t('nav.contact')}
          </Link>
          <span>
            © {year} {t('footer.rights')}
          </span>
        </div>
      </div>
    </footer>
  );
}
