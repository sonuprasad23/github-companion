import { File, MessageSquare } from 'lucide-react';

interface ActivityBarProps {
  toggleSidebar: () => void;
  showSidebar: boolean;
  onChatClick: () => void;
}

export function ActivityBar({
  toggleSidebar,
  showSidebar,
  onChatClick
}: ActivityBarProps) {
  return <div className="w-12 h-full bg-[#161b22] border-r border-[#30363d] flex flex-col items-center py-4">
      <button className={`w-12 h-12 flex items-center justify-center text-[#c9d1d9] hover:text-white ${showSidebar ? 'bg-[#21262d]' : ''}`} onClick={toggleSidebar} title="Toggle Explorer">
        <File size={20} />
      </button>
      <button className="w-12 h-12 flex items-center justify-center text-[#c9d1d9] hover:text-white" onClick={onChatClick} title="Focus AI Chat">
        <MessageSquare size={20} />
      </button>
    </div>;
}