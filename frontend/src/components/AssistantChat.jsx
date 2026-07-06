import { Bot, ExternalLink, RotateCcw, Send, Sparkles, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext.jsx';
import { services } from '../data/services.js';
import { generateAssistantReply } from '../utils/assistantEngine.js';

function createWelcomeMessage(t) {
  return {
    id: 'welcome',
    role: 'assistant',
    content: t('assistant.welcome'),
  };
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AssistantChat({ compact = false }) {
  const { locale, t, translations } = useLocale();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [createWelcomeMessage(t)]);
  const suggestedQuestions = translations.assistant.suggestedQuestions;
  const quickActions = translations.assistant.quickActions;

  const serviceLinks = useMemo(
    () =>
      services.slice(0, compact ? 4 : 8).map((service) => ({
        id: service.id,
        title: translations.services[service.id].title,
      })),
    [compact, translations],
  );

  const sendMessage = (message) => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    const reply = generateAssistantReply(trimmed, translations, services, locale);
    setMessages((current) => [
      ...current,
      { id: createMessageId(), role: 'user', content: trimmed },
      { id: createMessageId(), role: 'assistant', content: reply },
    ]);
    setInput('');
  };

  const resetChat = () => {
    setMessages([createWelcomeMessage(t)]);
    setInput('');
  };

  return (
    <section className={`flex h-full flex-col rounded-md border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900 ${compact ? 'max-h-[min(640px,calc(100vh-7rem))]' : 'min-h-[680px]'}`}>
      <header className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-sheba-600 text-white">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">{t('assistant.title')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('assistant.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetChat}
            className="btn-pop focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:text-slate-200"
            aria-label={t('assistant.reset')}
            title={t('assistant.reset')}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid gap-4 overflow-y-auto p-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          {t('assistant.disclaimer')}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('assistant.suggestedTitle')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="btn-pop focus-ring rounded-md border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:text-slate-100"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {!compact && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('assistant.quickActionsTitle')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {quickActions.map((action) => (
                <button
                  key={action.prompt}
                  type="button"
                  onClick={() => sendMessage(action.prompt)}
                  className="btn-pop focus-ring flex items-center gap-2 rounded-md bg-slate-50 p-3 text-left text-sm font-semibold text-slate-700 hover:bg-sheba-50 hover:text-sheba-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-sheba-500/15"
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('assistant.historyTitle')}</p>
          <div className="grid gap-3">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`animate-message-in flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sheba-50 text-sheba-700 dark:bg-sheba-500/15 dark:text-sheba-100">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-md px-4 py-3 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-sheba-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-200'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    <UserRound className="h-4 w-4" />
                  </span>
                )}
              </article>
            ))}
          </div>
        </div>

        {!compact && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('assistant.serviceLinksTitle')}</p>
            <div className="flex flex-wrap gap-2">
              {serviceLinks.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-sheba-500 hover:text-sheba-700 dark:border-slate-700 dark:text-slate-100"
                >
                  {service.title}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        className="mt-auto flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(input);
        }}
      >
        <label className="sr-only" htmlFor={compact ? 'floating-assistant-input' : 'assistant-input'}>
          {t('assistant.inputLabel')}
        </label>
        <input
          id={compact ? 'floating-assistant-input' : 'assistant-input'}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('assistant.inputPlaceholder')}
          className="focus-ring min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <button
          type="submit"
          className="btn-pop focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md bg-sheba-600 text-white hover:bg-sheba-700"
          aria-label={t('assistant.send')}
          title={t('assistant.send')}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
