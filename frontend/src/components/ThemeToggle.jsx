import { Moon, Sun } from 'lucide-react';
import { useLocale } from '../context/LocaleContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="navbar-button navbar-button-icon focus-ring shrink-0"
      aria-label={`${t('common.theme')}: ${theme === 'dark' ? t('common.dark') : t('common.light')}`}
      title={`${t('common.theme')}: ${theme === 'dark' ? t('common.dark') : t('common.light')}`}
    >
      <Icon className="pointer-events-none h-4 w-4" />
    </button>
  );
}
