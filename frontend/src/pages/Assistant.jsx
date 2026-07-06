import AssistantChat from '../components/AssistantChat.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function Assistant() {
  const { t } = useLocale();
  usePageTitle(t('assistant.pageTitle'));

  return (
    <>
      <PageHeader title={t('assistant.pageTitle')} intro={t('assistant.pageIntro')} />
      <section className="container-shell pb-12">
        <AssistantChat />
      </section>
    </>
  );
}
