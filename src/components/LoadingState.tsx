import { Loader, AlertTriangle } from 'lucide-react';

interface LoadingStateProps {
  status: string;
  isError?: boolean;
}

export function LoadingState({ status, isError = false }: LoadingStateProps) {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <div className={`mb-6 ${isError ? 'text-red-500' : 'text-[#2f81f7] animate-spin'}`}>
          {isError ? <AlertTriangle size={48} /> : <Loader size={48} />}
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-[#c9d1d9]">
          {isError ? 'An Error Occurred' : 'Analyzing Repository'}
        </h2>
        <p className="text-[#8b949e] text-lg text-center">{status}</p>
      </div>
    </div>
  );
}