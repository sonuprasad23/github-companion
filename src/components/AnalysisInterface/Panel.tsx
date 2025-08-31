import { useState } from 'react';
import { Send, Pin, X } from 'lucide-react';
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
      className="border-t border-[#30363d] bg-[#161b22] flex flex-col overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div className="flex-shrink-0 bg-[#161b22] border-b border-[#30363d]">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary' ? 'text-[#c9d1d9] border-b-2 border-[#2f81f7]' : 'text-[#8b949e] hover:text-[#c9d1d9]'}`}
          onClick={() => onTabChange('summary')}
        >
          AI SUMMARY
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'chat' ? 'text-[#c9d1d9] border-b-2 border-[#2f81f7]' : 'text-[#8b949e] hover:text-[#c9d1d9]'}`}
          onClick={() => onTabChange('chat')}
        >
          AI CHAT
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'summary' && (
          <div className="p-4 text-[#c9d1d9] prose prose-invert max-w-none overflow-y-auto h-full">
            <h2>Repository Summary</h2>
            <p>{repoSummary}</p>
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono">
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
                  message={{id: 0, role: 'assistant', content: 'Thinking...'}} 
                  isLoading={true} 
                  isFinished={false} 
                  onFinished={() => {}} 
                />
              )}
            </div>
            
            <div className="p-3 border-t border-[#30363d] space-y-2">
                {pinnedFiles.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Pin size={14} className="text-gray-400 flex-shrink-0" />
                        {pinnedFiles.map(file => (
                            <div key={file} className="flex items-center gap-1.5 bg-[#21262d] text-xs text-gray-300 px-2 py-1 rounded">
                                <span>{file.split('/').pop()}</span>
                                <button onClick={() => onPinToggle(file)} className="text-gray-500 hover:text-white">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
              <div className="flex items-center bg-[#0d1117] rounded-md border border-[#30363d] focus-within:border-[#2f81f7] focus-within:ring-1 focus-within:ring-[#2f81f7]">
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question about the codebase..."
                  className="flex-1 bg-transparent border-none outline-none py-2 px-3 text-[#c9d1d9] placeholder-[#8b949e] font-mono"
                  disabled={isLoading}
                />
                <button onClick={handleSendMessage} disabled={!userInput.trim() || isLoading} className="p-2 text-[#8b949e] hover:text-[#c9d1d9] disabled:opacity-50">
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
