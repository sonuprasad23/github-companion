import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';

import { X, Download, Loader, Code2 } from 'lucide-react';
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
    <div className="h-full w-full flex flex-col bg-background/50 backdrop-blur-sm">
      {/* Tab Bar */}
      <div className="flex-shrink-0 bg-surface/50 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
        <div className="flex overflow-x-auto hide-scrollbar">
          {openFiles.map(file => {
            const isActive = file === activeFile;
            return (
              <div
                key={file}
                className={`
                    group flex items-center py-2.5 px-4 border-r border-white/5 cursor-pointer whitespace-nowrap transition-all duration-200
                    ${isActive ? 'bg-primary/10 text-primary border-t-2 border-t-primary' : 'text-text-secondary hover:bg-white/5 hover:text-white border-t-2 border-t-transparent'}
                  `}
                onClick={() => onFileSelect(file)}
              >
                <FileIcon filename={file} />
                <span className="text-sm ml-2 font-medium">{file.split('/').pop()}</span>
                {dirtyFiles.has(file) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-accent ml-2 animate-pulse" title="Unsaved changes" />
                )}
                <button
                  className={`ml-2 p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'hover:bg-primary/20 text-primary' : 'hover:bg-white/10 text-text-secondary'}`}
                  onClick={e => { e.stopPropagation(); onFileClose(file); }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="pr-4 pl-4 border-l border-white/5">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/20"
          >
            {isDownloading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Zipping...
              </>
            ) : (
              <>
                <Download size={14} />
                Download ZIP
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-auto relative group">
        {activeFile ? (
          <>
            {/* Line Numbers */}
            <div className="sticky top-0 left-0 h-fit bg-surface/30 py-2.5 pr-4 pl-0 text-right text-text-muted font-mono text-sm select-none border-r border-white/5" style={{ lineHeight: '1.5rem', minWidth: '3rem' }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="hover:text-text-secondary transition-colors px-2">{i + 1}</div>
              ))}
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative">
              <Editor
                value={currentContent}
                onValueChange={code => onUpdateContent(activeFile, code)}
                highlight={highlightCode}
                padding={10}
                className="absolute inset-0 font-mono text-sm caret-primary"
                textareaClassName="focus:outline-none"
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: 14,
                  lineHeight: '1.5rem',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full w-full items-center justify-center text-text-muted space-y-4">
            <div className="p-4 rounded-full bg-white/5 text-white/20">
              <Code2 size={48} />
            </div>
            <p className="text-lg font-medium">Select a file to begin editing</p>
            <p className="text-sm text-text-muted/60">Choose a file from the sidebar to view its content</p>
          </div>
        )}
      </div>
    </div>
  );
}