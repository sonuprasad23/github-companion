import React from 'react';
import { LoaderIcon } from 'lucide-react';
interface LoadingStateProps {
  status: string;
}
export function LoadingState({
  status
}: LoadingStateProps) {
  return <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <div className="animate-spin text-[#2f81f7] mb-6">
          <LoaderIcon size={48} />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-[#c9d1d9]">
          Analyzing Repository
        </h2>
        <p className="text-[#8b949e] text-lg">{status}</p>
      </div>
    </div>;
}