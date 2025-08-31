import { useState, useEffect, useMemo } from 'react';
import { Copy, Terminal, User } from 'lucide-react';
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
    <div className="bg-[#0d1117] rounded-md my-2 text-sm font-sans">
      <div className="flex justify-between items-center px-4 py-1 bg-[#21262d] rounded-t-md text-xs text-gray-400">
        <span>{language}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 hover:text-white disabled:opacity-50" disabled={isCopied}>
          {isCopied ? 'Copied!' : <><Copy size={14} /> Copy code</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto"><code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
    </div>
  );
};

const parseMarkdown = (text: string) => {
  const parts = text.split(/(``````)/g);
  return parts.filter(part => part.length > 0).map((part) => {
    const codeMatch = part.match(/``````/);
    if (codeMatch) {
      return { type: 'code', language: codeMatch[1] || 'bash', content: codeMatch[2].trim() };
    }
    return { type: 'text', content: part };
  });
};

interface ChatMessageProps {
    message: { id: number; role: 'user' | 'assistant'; content: string };
    isFinished: boolean;
    onFinished: () => void;
    isLoading?: boolean;
}

export function ChatMessage({ message, isFinished, onFinished, isLoading = false }: ChatMessageProps) {
  const { role, content } = message;
  const isUser = role === 'user';
  
  const safeContent = content || '';
  const parsedContent = useMemo(() => parseMarkdown(safeContent), [safeContent]);
  const typewriterContent = useTypewriter(safeContent, isFinished, onFinished);
  const parsedTypewriterContent = useMemo(() => parseMarkdown(typewriterContent), [typewriterContent]);

  const contentToRender = isUser ? parsedContent : (isFinished ? parsedContent : parsedTypewriterContent);

  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-8 h-8 rounded-full bg-[#30363d] flex items-center justify-center flex-shrink-0 mt-1">
        {isUser ? <User size={18} /> : <Terminal size={18} />}
      </div>
      <div className="flex-1 pt-1.5">
        {isLoading ? (
            <span className="animate-pulse">{safeContent}</span>
        ) : (
          contentToRender.map((part, index) => {
              if (part.type === 'code') {
                return <CodeBlock key={index} language={part.language} code={part.content} />;
              }
              const textWithLists = part.content.split('\n').map((line, lineIndex) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('* ')) {
                  return <li key={lineIndex} className="ml-4 list-disc font-sans">{trimmedLine.substring(2)}</li>;
                }
                return <span key={lineIndex} className="font-sans text-gray-300 leading-relaxed">{line}<br/></span>;
              });
              return <div key={index}>{textWithLists}</div>;
            })
        )}
      </div>
    </div>
  );
}
