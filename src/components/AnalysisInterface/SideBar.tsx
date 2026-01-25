import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { FileIcon } from './FileIcon';
import { FileDetail } from '../../types';

interface TreeNode {
  name: string;
  path: string;
  children?: { [key: string]: TreeNode };
}

const buildFileTree = (files: FileDetail[]): TreeNode => {
  const root: TreeNode = { name: 'root', path: '', children: {} };
  files.forEach(file => {
    let current = root;
    file.path.split('/').forEach((part, index, arr) => {
      if (!current.children) current.children = {};
      if (!current.children[part]) {
        const isFile = index === arr.length - 1;
        current.children[part] = {
          name: part,
          path: isFile ? file.path : [current.path, part].filter(Boolean).join('/'),
          ...(!isFile && { children: {} })
        };
      }
      current = current.children[part];
    });
  });
  return root;
};

interface TreeNodeComponentProps {
  node: TreeNode;
  onFileClick: (path: string) => void;
  activeFile: string | null;
  level?: number;
}

function TreeNodeComponent({ node, onFileClick, activeFile, level = 0 }: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (node.children) { // It's a directory
    const isRoot = node.name === 'root';
    return (
      <div>
        {!isRoot && (
          <div
            className="flex items-center py-1.5 cursor-pointer hover:bg-white/5 rounded-md transition-colors text-text-secondary hover:text-white"
            style={{ paddingLeft: `${level * 12}px` }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown size={14} className="mr-1 opacity-70" /> : <ChevronRight size={14} className="mr-1 opacity-70" />}
            <Folder size={14} className="mr-2 text-accent" />
            <span className="text-sm font-medium">{node.name}</span>
          </div>
        )}
        {isExpanded && (
          <div>
            {Object.values(node.children).sort((a, b) => (a.children ? -1 : 1) - (b.children ? -1 : 1) || a.name.localeCompare(b.name)).map(child => (
              <TreeNodeComponent
                key={child.path}
                node={child}
                onFileClick={onFileClick}
                activeFile={activeFile}
                level={isRoot ? 0 : level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // It's a file
  const isActive = node.path === activeFile;
  return (
    <div
      className={`
        flex items-center py-1.5 cursor-pointer rounded-md transition-all duration-200
        ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-white/5 hover:text-white'}
      `}
      style={{ paddingLeft: `${level * 12 + 12}px` }}
      onClick={() => onFileClick(node.path)}
    >
      <FileIcon filename={node.name} />
      <span className="text-sm ml-2">{node.name}</span>
    </div>
  );
}

interface SideBarProps {
  width: number;
  files: FileDetail[];
  onFileClick: (path: string) => void;
  activeFile: string | null;
}

export function SideBar({ width, files, onFileClick, activeFile }: SideBarProps) {
  const fileTree = buildFileTree(files);
  return (
    <div
      className="h-full bg-surface/50 backdrop-blur-md border-r border-white/5 flex flex-col overflow-hidden select-none"
      style={{ width: `${width}px` }}
    >
      <div className="p-3 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-white/5 flex-shrink-0 flex items-center justify-between">
        <span>Explorer</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        <TreeNodeComponent node={fileTree} onFileClick={onFileClick} activeFile={activeFile} />
      </div>
    </div>
  );
}