import { useState } from 'react';
import { ArrowRight, Search, Sparkles, Github, Code, Zap } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface InitialStateProps {
  onAnalyze: (url: string) => void;
}

export function InitialState({ onAnalyze }: InitialStateProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  const features = [
    {
      icon: <Code className="w-6 h-6 text-accent" />,
      title: "Deep Code Analysis",
      description: "AI-powered understanding of your entire codebase architecture."
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Instant Insights",
      description: "Get answers to complex questions about your project in seconds."
    },
    {
      icon: <Github className="w-6 h-6 text-white" />,
      title: "GitHub Integration",
      description: "Seamlessly works with any public GitHub repository."
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 relative z-10">
      <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-slide-up">
          <Sparkles className="w-4 h-4" />
          <span>Next Gen Code Companion</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-slide-up [animation-delay:100ms]">
          Understand any <br />
          <span className="text-gradient">GitHub Repository</span>
        </h1>

        <p className="text-xl text-text-secondary max-w-2xl mx-auto animate-slide-up [animation-delay:200ms]">
          Stop guessing. Start understanding. transform the way you explore code with our advanced AI companion.
        </p>

        {/* Input Section */}
        <Card className="max-w-2xl mx-auto mt-12 p-2 bg-surface/50 animate-slide-up [animation-delay:300ms]">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full text-white bg-transparent border-none focus:ring-0 pl-12 h-12 placeholder:text-text-muted"
              />
            </div>
            <Button type="submit" disabled={!url} icon={<ArrowRight className="w-4 h-4" />}>
              Analyze
            </Button>
          </form>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left animate-slide-up [animation-delay:500ms]">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-300"
            >
              <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}