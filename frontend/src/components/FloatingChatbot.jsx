import { MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';
import AssistantChat from './AssistantChat.jsx';

export default function FloatingChatbot() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setBounce(false), 3000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <div
        className={`mb-3 w-[calc(100vw-2rem)] max-w-md origin-bottom-right transition-all duration-200 ease-out ${
          open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <AssistantChat compact />
      </div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`btn-pop focus-ring ml-auto flex h-14 w-14 items-center justify-center rounded-md bg-sheba-600 text-white shadow-soft hover:bg-sheba-700 ${bounce ? 'animate-bounce' : ''}`}
        aria-label={open ? t('assistant.closeChat') : t('assistant.openChat')}
        title={open ? t('assistant.closeChat') : t('assistant.openChat')}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
