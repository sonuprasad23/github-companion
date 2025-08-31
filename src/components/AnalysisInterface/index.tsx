import { useState, useRef, useEffect } from 'react';
import { ActivityBar } from './ActivityBar';
import { SideBar } from './SideBar';
import { MainContent } from './MainContent';
import { Panel } from './Panel';
import { AnalysisResultData } from '../../types';
import { fetchFileContent, downloadProjectAsZip } from '../../services/api';

interface AnalysisInterfaceProps {
  analysisResult: AnalysisResultData;
  sessionId: string;
}

export function AnalysisInterface({ analysisResult, sessionId }: AnalysisInterfaceProps) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [activePanelTab, setActivePanelTab] = useState('summary');
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [pinnedFiles, setPinnedFiles] = useState<string[]>([]);

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [panelHeight, setPanelHeight] = useState(300);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileClick = async (filePath: string) => {
    if (!openFiles.includes(filePath) && !fileContents[filePath]) {
      try {
        const { content } = await fetchFileContent(sessionId, filePath);
        setFileContents(prev => ({ ...prev, [filePath]: content }));
        setOpenFiles(prev => [...prev, filePath]);
      } catch (error) {
        console.error("Failed to fetch file content:", error);
        setFileContents(prev => ({ ...prev, [filePath]: `// Error loading file: ${error}` }));
        setOpenFiles(prev => [...prev, filePath]);
      }
    }
    setActiveFile(filePath);
    if (!pinnedFiles.includes(filePath)) {
        setPinnedFiles(prev => [...prev, filePath]);
    }
  };
  
  const handlePinToggle = (filePath: string) => {
    setPinnedFiles(prev => 
        prev.includes(filePath)
            ? prev.filter(p => p !== filePath)
            : [...prev, filePath]
    );
  };

  const handleCloseFile = (filePath: string) => {
    const newOpenFiles = openFiles.filter(file => file !== filePath);
    setOpenFiles(newOpenFiles);
    
    if (activeFile === filePath) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  const handleUpdateFileContent = (filePath: string, content: string) => {
    setFileContents(prev => ({ ...prev, [filePath]: content }));
    setDirtyFiles(prev => new Set(prev).add(filePath));
  };
  
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const modified_files = Array.from(dirtyFiles).map(path => ({
            path,
            content: fileContents[path]
        }));

        const blob = await downloadProjectAsZip(sessionId, modified_files);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const repoName = analysisResult.repo_url.split('/').pop() || 'repository';
        a.download = `${repoName}-modified.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Download failed:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  useEffect(() => {
    const handleResize = (
      e: MouseEvent,
      setter: React.Dispatch<React.SetStateAction<number>>,
      startPos: number,
      startSize: number,
      dimension: 'width' | 'height'
    ) => {
      const delta = dimension === 'width' ? e.clientX - startPos : startPos - e.clientY;
      const newSize = startSize + delta;
      const minSize = dimension === 'width' ? 200 : 100;
      const maxSize = dimension === 'width' ? 500 : (containerRef.current?.clientHeight ?? 800) / 2;
      setter(Math.max(minSize, Math.min(newSize, maxSize)));
    };

    const setupResizer = (
      resizer: HTMLElement,
      setter: React.Dispatch<React.SetStateAction<number>>,
      dimension: 'width' | 'height'
    ) => {
      const startResize = (e: MouseEvent) => {
        e.preventDefault();
        const startPos = dimension === 'width' ? e.clientX : e.clientY;
        const startSize = dimension === 'width' ? sidebarWidth : panelHeight;
        
        const onMouseMove = (moveEvent: MouseEvent) => handleResize(moveEvent, setter, startPos, startSize, dimension);
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.cursor = dimension === 'width' ? 'ew-resize' : 'ns-resize';
        document.body.style.userSelect = 'none';
      };
      resizer.addEventListener('mousedown', startResize);
      return () => resizer.removeEventListener('mousedown', startResize);
    };

    const sidebarResizer = document.getElementById('sidebar-resizer');
    const panelResizer = document.getElementById('panel-resizer');

    let sidebarCleanup: () => void = () => {};
    let panelCleanup: () => void = () => {};

    if (sidebarResizer && showSidebar) sidebarCleanup = setupResizer(sidebarResizer, setSidebarWidth, 'width');
    if (panelResizer) panelCleanup = setupResizer(panelResizer, setPanelHeight, 'height');

    return () => {
      sidebarCleanup();
      panelCleanup();
    };
  }, [sidebarWidth, panelHeight, showSidebar]);

  return (
    <div className="w-full flex-1 flex overflow-hidden" ref={containerRef}>
      <ActivityBar 
        toggleSidebar={() => setShowSidebar(!showSidebar)} 
        showSidebar={showSidebar}
        onChatClick={() => setActivePanelTab('chat')}
      />
      
      {showSidebar && (
        <>
          <SideBar
            width={sidebarWidth}
            files={analysisResult.directory_structure}
            onFileClick={handleFileClick}
            activeFile={activeFile}
          />
          <div id="sidebar-resizer" className="w-1.5 cursor-ew-resize bg-transparent hover:bg-[#2f81f7] transition-colors flex-shrink-0" />
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0">
            <MainContent
              openFiles={openFiles}
              activeFile={activeFile}
              onFileSelect={setActiveFile}
              onFileClose={handleCloseFile}
              fileContents={fileContents}
              onUpdateContent={handleUpdateFileContent}
              dirtyFiles={dirtyFiles}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
        </div>
        <div id="panel-resizer" className="h-1.5 cursor-ns-resize bg-transparent hover:bg-[#2f81f7] transition-colors flex-shrink-0" />
        <div className="flex-shrink-0">
            <Panel
              height={panelHeight}
              activeTab={activePanelTab}
              onTabChange={setActivePanelTab}
              repoSummary={analysisResult.initial_summary}
              sessionId={sessionId}
              pinnedFiles={pinnedFiles}
              onPinToggle={handlePinToggle}
            />
        </div>
      </div>
    </div>
  );
}```

#### **`frontend/src/components/AnalysisInterface/Panel.tsx` (Updated)**

This is the final, most intelligent version of the panel. It now displays pinned files, allows removing them, and sends them with every chat message for maximum AI context.

```typescript
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

    const newUserMessage: Message = { id: Date.now(), role: 'user', content: userInput };
    setFinishedMessageIds(prev => new Set(prev).add(newUserMessage.id));
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await postChatMessage(sessionId, userInput, pinnedFiles);
      const newAssistantMessage: Message = { id: Date.now() + 1, role: 'assistant', content: response.answer };
      setChatHistory(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      const errorMessage: Message = { id: Date.now() + 1, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
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
              {isLoading && <ChatMessage message={{id: 0, role: 'assistant', content: 'Thinking...'}} isLoading={true} isFinished={false} onFinished={() => {}} />}
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