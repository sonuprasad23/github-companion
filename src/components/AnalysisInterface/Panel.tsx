import { useState } from 'react';
import { Send, Pin, X, Sparkles, MessageSquare } from 'lucide-react';
import { postChatMessage } from '../../services/api';
import { ChatMessage } from './ChatMessage';

interface PanelProps {
  height: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  repoSummary: string;
  sessionId: string;
  pinnedFiles: string[];
  onPinToggle: (filePath: string) => void;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export function Panel({ height, activeTab, onTabChange, repoSummary, sessionId, pinnedFiles, onPinToggle }: PanelProps) {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finishedMessageIds, setFinishedMessageIds] = useState<Set<number>>(new Set());

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: String(userInput)
    };

    setFinishedMessageIds(prev => new Set(prev).add(newUserMessage.id));
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await postChatMessage(sessionId, userInput, pinnedFiles);
      const newAssistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: String(response.answer || 'No response received.')
      };
      setChatHistory(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypingFinished = (messageId: number) => {
    setFinishedMessageIds(prev => new Set(prev).add(messageId));
  };

  return (
    <div
      className="border-t border-white/5 bg-surface/50 backdrop-blur-md flex flex-col overflow-hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
      style={{ height: `${height}px` }}
    >
      <div className="flex-shrink-0 bg-surface/30 border-b border-white/5 flex items-center px-2">
        <button
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'summary' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-white hover:bg-white/5'}`}
          onClick={() => onTabChange('summary')}
        >
          <Sparkles size={16} />
          <span>AI Summary</span>
        </button>
        <button
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'chat' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-white hover:bg-white/5'}`}
          onClick={() => onTabChange('chat')}
        >
          <MessageSquare size={16} />
          <span>AI Chat</span>
        </button>
      </div>
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'summary' && (
          <div className="p-6 text-text-secondary prose prose-invert max-w-none overflow-y-auto h-full scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <h2 className="text-xl font-bold text-white mb-4">Repository Overview</h2>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{repoSummary}</div>
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto space-y-6 font-mono scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50 space-y-2">
                  <MessageSquare size={32} />
                  <p>Ask a question to start exploring.</p>
                </div>
              )}
              {chatHistory.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isFinished={finishedMessageIds.has(msg.id)}
                  onFinished={() => handleTypingFinished(msg.id)}
                />
              ))}
              {isLoading && (
                <ChatMessage
                  message={{ id: 0, role: 'assistant', content: 'Thinking...' }}
                  isLoading={true}
                  isFinished={false}
                  onFinished={() => { }}
                />
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-surface/30 relative z-10">
              {pinnedFiles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-3 animate-fade-in">
                  <div className="bg-primary/10 p-1 rounded-md">
                    <Pin size={12} className="text-primary" />
                  </div>
                  {pinnedFiles.map(file => (
                    <div key={file} className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-xs text-text-secondary px-2 py-1 rounded-lg">
                      <span>{file.split('/').pop()}</span>
                      <button onClick={() => onPinToggle(file)} className="text-text-muted hover:text-error transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center bg-white/5 rounded-xl border border-white/10 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question about the codebase..."
                  className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-white placeholder-text-muted text-sm font-sans"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isLoading}
                  className="p-2 mr-2 text-text-muted hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 duration-200"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
