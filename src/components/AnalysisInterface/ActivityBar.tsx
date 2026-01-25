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
  return (
    <div className="w-12 h-full bg-surface border-r border-white/5 flex flex-col items-center py-4 z-20 relative">
      <button
        className={`
          w-10 h-10 mb-2 flex items-center justify-center rounded-lg transition-all duration-300
          ${showSidebar ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}
        `}
        onClick={toggleSidebar}
        title="Toggle Explorer"
      >
        <File size={20} />
      </button>
      <button
        className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300"
        onClick={onChatClick}
        title="Focus AI Chat"
      >
        <MessageSquare size={20} />
      </button>
    </div>
  );
}