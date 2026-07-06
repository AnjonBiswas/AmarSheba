import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function FAQ() {
  const { t, translations } = useLocale();
  const [openIndex, setOpenIndex] = useState(0);
  usePageTitle(t('faq.title'));

  return (
    <>
      <PageHeader title={t('faq.title')} intro={t('faq.intro')} />
      <section className="container-shell grid gap-4 pb-12">
        {translations.faq.items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <article key={item.q} className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="focus-ring flex w-full items-center justify-between gap-4 rounded-md p-5 text-left text-lg font-bold text-slate-950 dark:text-white"
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid overflow-hidden transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="min-h-0">
                  <p className="px-5 pb-5 leading-7 text-slate-600 dark:text-slate-300">{item.a}</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
