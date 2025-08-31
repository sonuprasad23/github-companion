import { useRef, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
// Prism language imports...
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';

import { X, Download, Loader } from 'lucide-react';
import { FileIcon } from './FileIcon';

interface MainContentProps {
  openFiles: string[];
  activeFile: string | null;
  onFileSelect: (filePath: string) => void;
  onFileClose: (filePath: string) => void;
  fileContents: Record<string, string>;
  onUpdateContent: (filePath: string, content: string) => void;
  dirtyFiles: Set<string>;
  onDownload: () => void;
  isDownloading: boolean;
}

export function MainContent({
  openFiles,
  activeFile,
  onFileSelect,
  onFileClose,
  fileContents,
  onUpdateContent,
  dirtyFiles,
  onDownload,
  isDownloading,
}: MainContentProps) {
  
  // getLanguage function remains the same...
  const getLanguage = (filename: string): string => {
    const extension = filename.split('.').pop() || '';
    switch (extension) {
      case 'js': return 'javascript';
      case 'jsx': return 'jsx';
      case 'ts': return 'typescript';
      case 'tsx': return 'tsx';
      case 'py': return 'python';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'css': return 'css';
      default: return 'clike';
    }
  };

  const currentContent = activeFile ? fileContents[activeFile] || '' : '';
  const language = activeFile ? getLanguage(activeFile) : 'clike';
  const lineCount = currentContent.split('\n').length;

  const highlightCode = (code: string) => 
    Prism.highlight(code, Prism.languages[language] || Prism.languages.clike, language);

  return (
    <div className="h-full w-full flex flex-col bg-[#0d1117]">
      <div className="flex-shrink-0 bg-[#161b22] border-b border-[#30363d] flex justify-between items-center">
        <div className="flex overflow-x-auto">
            {openFiles.map(file => {
              const isActive = file === activeFile;
              return (
                <div
                  key={file}
                  className={`flex items-center py-2 px-4 border-r border-[#30363d] cursor-pointer whitespace-nowrap ${isActive ? 'bg-[#0d1117] text-white' : 'text-[#8b949e] hover:bg-[#21262d]'}`}
                  onClick={() => onFileSelect(file)}
                >
                  <FileIcon filename={file} />
                  <span className="text-sm ml-2">{file.split('/').pop()}</span>
                  {dirtyFiles.has(file) && <div className="w-2 h-2 rounded-full bg-yellow-400 ml-2" title="Unsaved changes"></div>}
                  <button
                    className="ml-3 p-0.5 rounded-sm hover:bg-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
                    onClick={e => { e.stopPropagation(); onFileClose(file); }}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
        </div>
        <div className="pr-4">
            <button 
                onClick={onDownload} 
                disabled={isDownloading}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#21262d] text-sm text-[#c9d1d9] rounded-md hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDownloading ? (
                    <>
                        <Loader size={16} className="animate-spin" />
                        Zipping...
                    </>
                ) : (
                    <>
                        <Download size={16} />
                        Download ZIP
                    </>
                )}
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-auto">
        {activeFile ? (
          <>
            <div className="sticky top-0 left-0 h-fit bg-[#0d1117] py-2.5 pr-4 pl-2 text-right text-[#8b949e] font-mono text-sm select-none" style={{ lineHeight: '1.5rem' }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            
            <div className="flex-1 relative">
              <Editor
                value={currentContent}
                onValueChange={code => onUpdateContent(activeFile, code)}
                highlight={highlightCode}
                padding={10}
                className="absolute inset-0 font-mono text-sm caret-white"
                style={{
                  fontFamily: '"Fira Code", "Menlo", "Consolas", monospace',
                  fontSize: 14,
                  lineHeight: '1.5rem',
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#8b949e]">
            Select a file to begin editing.
          </div>
        )}
      </div>
    </div>
  );
}