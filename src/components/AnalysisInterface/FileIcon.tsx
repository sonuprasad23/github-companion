import { File, FileJson, FileText, Braces, BrainCircuit } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  js: Braces,
  jsx: Braces,
  ts: Braces,
  tsx: Braces,
  py: BrainCircuit,
  json: FileJson,
  md: FileText,
  css: FileText,
  html: FileText,
};

const colorMap: { [key: string]: string } = {
    js: 'text-yellow-400',
    jsx: 'text-blue-400',
    ts: 'text-blue-400',
    tsx: 'text-blue-400',
    py: 'text-green-400',
    json: 'text-orange-400',
    md: 'text-gray-400',
}

interface FileIconProps {
  filename: string;
}

export function FileIcon({ filename }: FileIconProps) {
  const extension = filename.split('.').pop() || '';
  const IconComponent = iconMap[extension] || File;
  const colorClass = colorMap[extension] || 'text-gray-500';

  return <IconComponent size={16} className={colorClass} />;
}