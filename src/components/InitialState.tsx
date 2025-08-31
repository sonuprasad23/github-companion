import React, { useState } from 'react';
interface InitialStateProps {
  onAnalyze: (url: string) => void;
}
export function InitialState({
  onAnalyze
}: InitialStateProps) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(true);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation for GitHub URL
    if (url.trim() && url.includes('github.com/')) {
      onAnalyze(url);
    } else {
      setIsValid(false);
    }
  };
  return <div className="w-full flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-xl p-6 bg-[#161b22] border border-[#30363d] rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-[#c9d1d9]">
          Analyze a Public GitHub Repository
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input type="url" value={url} onChange={e => {
            setUrl(e.target.value);
            setIsValid(true);
          }} placeholder="https://github.com/langchain-ai/langchain" className={`w-full p-3 bg-[#0d1117] border ${isValid ? 'border-[#30363d] focus:border-[#2f81f7]' : 'border-[#f85149]'} rounded-md text-[#c9d1d9] placeholder-[#8b949e] outline-none transition-colors focus:ring-1 focus:ring-[#2f81f7]`} />
            {!isValid && <p className="mt-2 text-sm text-[#f85149]">
                Please enter a valid GitHub repository URL
              </p>}
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-[#2f81f7] hover:bg-[#2c74df] text-white font-medium rounded-md transition-colors">
            Analyze
          </button>
        </form>
      </div>
    </div>;
}