import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="glass mx-auto max-w-7xl px-6 h-16 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3 group">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <Github className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            GitHub Companion
          </h1>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          <a href="#" className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors duration-200">
            Documentation
          </a>
          <a href="#" className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors duration-200">
            About
          </a>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>v1.0.0</span>
          </div>
        </nav>
      </div>
    </header>
  );
}