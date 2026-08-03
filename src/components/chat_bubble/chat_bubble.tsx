import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useContent } from '../../locales';
import './chat_bubble.scss';

type Phase = 'typing' | 'running' | 'output' | 'clearing';
type StatusKey = 'ready' | 'running' | 'done' | 'connected';
type Status = 'ready' | 'running' | 'done' | 'connected';

declare global {
  interface Window {
    botpress?: { open?: () => void };
  }
}

const ChatBubble: React.FC = () => {
  const content = useContent();

  const [commandIndex, setCommandIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [status, setStatus] = useState<Status>('ready');
  const [codeText, setCodeText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [footerLift, setFooterLift] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const commands = content.chatBubble.commands;

  const openChat = useCallback(() => {
    if (window.botpress?.open) {
      window.botpress.open();
      setStatus('connected');
    }
  }, []);

  useEffect(() => {
    const current = commands[commandIndex];

    const run = (delay: number, fn: () => void) => {
      timeoutRef.current = window.setTimeout(fn, delay);
    };

    if (phase === 'typing') {
      if (charIndex < current.code.length) {
        setCodeText(current.code.substring(0, charIndex + 1));
        run(70 + Math.random() * 50, () => setCharIndex((c) => c + 1));
      } else {
        setStatus('running');
        setPhase('running');
      }
    } else if (phase === 'running') {
      run(current.duration, () => {
        setOutputText(current.output);
        setStatus('done');
        setPhase('output');
      });
    } else if (phase === 'output') {
      run(2000, () => {
        setOutputText('');
        setStatus('ready');
        setPhase('clearing');
      });
    } else if (phase === 'clearing') {
      run(300, () => {
        setCodeText('');
        setCharIndex(0);
        setCommandIndex((i) => (i + 1) % commands.length);
        setPhase('typing');
      });
    }

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [phase, charIndex, commandIndex, commands]);

  useEffect(() => {
    let disposed = false;

    const hideFab = (root: Document | ShadowRoot | HTMLElement) => {
      const candidates = root.querySelectorAll<HTMLElement>(
        '.bpFabContainer, [class*="bpFabContainer"]'
      );
      candidates.forEach((el) => {
        el.style.setProperty('display', 'none', 'important');
      });
      const hosts = root.querySelectorAll<HTMLElement>('*');
      hosts.forEach((host) => {
        if (host.shadowRoot) hideFab(host.shadowRoot);
      });
      return candidates.length > 0;
    };

    const interval = window.setInterval(() => {
      if (disposed) return;
      hideFab(document);
    }, 500);

    const stop = window.setTimeout(() => window.clearInterval(interval), 20000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, []);

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>('.footer-container');
    const bubble = bubbleRef.current;
    if (bubble) {
      const h = bubble.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--chat-bubble-height', `${h}px`);
    }
    if (!footer) return;

    const computeLift = () => {
      const rect = footer.getBoundingClientRect();
      const overlap = window.innerHeight - rect.top;
      setFooterLift(Math.max(0, overlap + 16));
    };

    computeLift();
    window.addEventListener('scroll', computeLift, { passive: true });
    window.addEventListener('resize', computeLift);
    return () => {
      window.removeEventListener('scroll', computeLift);
      window.removeEventListener('resize', computeLift);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const inField = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || (t as HTMLElement).isContentEditable);
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !inField) {
        e.preventDefault();
        openChat();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openChat]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openChat();
    }
  };

  return (
    <div
      ref={bubbleRef}
      className={`chat-bubble${phase === 'running' ? ' is-running' : ''}${status === 'connected' ? ' is-open' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={content.chatBubble.ariaLabel}
      onClick={openChat}
      onKeyDown={handleKeyDown}
      style={{ transform: `translateY(-${footerLift}px)` }}
    >
      <div className="chat-bubble__header">
        <div className="chat-bubble__dots">
          <span className="chat-bubble__dot chat-bubble__dot--red" />
          <span className="chat-bubble__dot chat-bubble__dot--yellow" />
          <span className="chat-bubble__dot chat-bubble__dot--green" />
        </div>
        <span className="chat-bubble__title">{content.chatBubble.title}</span>
      </div>
      <div className="chat-bubble__body">
        <div className="chat-bubble__line">
          <span className="chat-bubble__prompt">{content.chatBubble.prompt}</span>
          <span className="chat-bubble__code">{codeText}</span>
          <span className="chat-bubble__cursor">{content.chatBubble.cursor}</span>
        </div>
        <div className={`chat-bubble__output${outputText ? ' show' : ''}`}>{outputText}</div>
      </div>
      <div className="chat-bubble__status">
        <span className="chat-bubble__status-dot" />
        <span className="chat-bubble__status-text">{content.chatBubble.statuses[status as StatusKey]}</span>
      </div>
    </div>
  );
};

export default ChatBubble;
