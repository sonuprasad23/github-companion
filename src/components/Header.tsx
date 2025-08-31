import { Code2 } from 'lucide-react'; // Using a slightly different icon for variety

export function Header() {
  return (
    <header className="w-full flex items-center px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="text-[#c9d1d9]">
          <Code2 size={24} />
        </div>
        <h3 className="text-xl font-medium text-[#c9d1d9]">Github Companion</h3>
      </div>
    </header>
  );
}