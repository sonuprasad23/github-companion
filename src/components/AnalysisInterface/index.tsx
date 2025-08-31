import { useState, useRef, useEffect } from 'react';
import { ActivityBar } from './ActivityBar';
import { SideBar } from './SideBar';
import { MainContent } from './MainContent';
import { Panel } from './Panel';
import { AnalysisResultData } from '../../types';
import { fetchFileContent, downloadProjectAsZip } from '../../services/api';
import { Download, Loader } from 'lucide-react';

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
            />
        </div>
      </div>
    </div>
  );
}