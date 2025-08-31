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
            className="flex items-center py-1 cursor-pointer hover:bg-[#21262d40] rounded"
            style={{ paddingLeft: `${level * 12}px` }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown size={16} className="mr-1 text-gray-400" /> : <ChevronRight size={16} className="mr-1 text-gray-400" />}
            <Folder size={16} className="mr-2 text-yellow-400" />
            <span className="text-sm">{node.name}</span>
          </div>
        )}
        {isExpanded && (
          <div>
            {Object.values(node.children).sort((a,b) => (a.children ? -1 : 1) - (b.children ? -1 : 1) || a.name.localeCompare(b.name)).map(child => (
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
      className={`flex items-center py-1 cursor-pointer rounded ${isActive ? 'bg-[#21262d]' : 'hover:bg-[#21262d40]'}`}
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
      className="h-full bg-[#161b22] border-r border-[#30363d] flex flex-col overflow-hidden select-none"
      style={{ width: `${width}px` }}
    >
      <div className="p-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wider border-b border-[#30363d] flex-shrink-0">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        <TreeNodeComponent node={fileTree} onFileClick={onFileClick} activeFile={activeFile} />
      </div>
    </div>
  );
}