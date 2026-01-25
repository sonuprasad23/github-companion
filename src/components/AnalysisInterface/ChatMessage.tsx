import { useState, useEffect, useMemo } from 'react';
import { Copy, User, Sparkles } from 'lucide-react';
import Prism from 'prismjs';

const useTypewriter = (text: string, isFinished: boolean, onFinished: () => void, speed = 10) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (isFinished) {
      setDisplayText(text);
      return;
    }

    setDisplayText('');
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(intervalId);
        onFinished();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, isFinished, onFinished, speed]);

  return displayText;
};

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const lang = Prism.languages[language] ? language : 'clike';
  const highlightedCode = Prism.highlight(code, Prism.languages[lang] || Prism.languages.clike, lang);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-background rounded-lg my-3 border border-white/10 overflow-hidden shadow-sm font-mono text-sm group">
      <div className="flex justify-between items-center px-4 py-2 bg-surface border-b border-white/5 text-xs text-text-muted">
        <span className="font-semibold text-primary">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 transition-colors text-text-secondary hover:text-white disabled:opacity-50"
          disabled={isCopied}
        >
          {isCopied ? (
            <span className="text-success">Copied!</span>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <pre className="p-4 overflow-x-auto bg-background/50 text-text-primary scrollbar-thin scrollbar-thumb-white/10">
          <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>
    </div>
  );
};

const parseMarkdown = (text: string) => {
  const parts = text.split(/(```[\s\S]*?```)/g); // Improved regex for code blocks including newlines
  return parts.filter(part => part.length > 0).map((part) => {
    const codeMatch = part.match(/```(\w*)\n([\s\S]*?)```/);
    if (codeMatch) {
      return { type: 'code' as const, language: codeMatch[1] || 'bash', content: codeMatch[2].trim() };
    }
    return { type: 'text' as const, content: part };
  });
};

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isFinished: boolean;
  onFinished: () => void;
  isLoading?: boolean;
}

export function ChatMessage({ message, isFinished, onFinished, isLoading = false }: ChatMessageProps) {
  const { role, content } = message;
  const isUser = role === 'user';

  const safeContent = String(content || '');
  const parsedContent = useMemo(() => parseMarkdown(safeContent), [safeContent]);
  const typewriterContent = useTypewriter(safeContent, isFinished, onFinished);
  const parsedTypewriterContent = useMemo(() => parseMarkdown(typewriterContent), [typewriterContent]);

  const contentToRender = isUser ? parsedContent : (isFinished ? parsedContent : parsedTypewriterContent);

  return (
    <div className={`flex items-start gap-4 text-sm animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg
        ${isUser ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}
      `}>
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`
          inline-block rounded-2xl px-5 py-3 
          ${isUser
            ? 'bg-primary/10 text-white border border-primary/20 rounded-tr-sm'
            : 'bg-white/5 text-text-secondary border border-white/5 rounded-tl-sm'
          }
        `}>
          {isLoading ? (
            <div className="flex space-x-1 h-5 items-center px-2">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
            </div>
          ) : (
            <div className={`whitespace-pre-wrap leading-relaxed ${isUser ? 'text-white' : 'text-text-secondary'}`}>
              {contentToRender.map((part, index) => {
                if (part.type === 'code') {
                  return <CodeBlock key={index} language={part.language} code={part.content} />;
                }
                const lines = part.content.split('\n');
                return (
                  <span key={index}>
                    {lines.map((line, lineIndex) => {
                      // Basic list detection
                      const trimmed = line.trim();
                      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        return <div key={lineIndex} className="flex gap-2 ml-1 my-1"><span className="text-secondary">•</span><span>{trimmed.substring(2)}</span><br /></div>
                      }
                      // Heading detection (basic)
                      if (trimmed.startsWith('### ')) return <h3 key={lineIndex} className="text-white font-bold text-base mt-3 mb-1">{trimmed.substring(4)}</h3>;
                      if (trimmed.startsWith('## ')) return <h2 key={lineIndex} className="text-white font-bold text-lg mt-4 mb-2">{trimmed.substring(3)}</h2>;

                      return <span key={lineIndex}>{line}{lineIndex < lines.length - 1 ? '\n' : ''}</span>
                    })}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
