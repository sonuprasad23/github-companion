import React from 'react';
import { CodeIcon } from 'lucide-react';
export function Header() {
  return <header className="w-full flex items-center px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
      <div className="flex items-center gap-2">
        <div className="text-[#c9d1d9]">
          <CodeIcon size={24} />
        </div>
        <h3 className="text-xl font-medium text-[#c9d1d9]">Github Companion</h3>
      </div>
    </header>;
}