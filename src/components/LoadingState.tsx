import { Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/Card';

interface LoadingStateProps {
  status: string;
}

export function LoadingState({ status }: LoadingStateProps) {
  const steps = [
    "Initializing analysis...",
    "Cloning & analyzing repository...",
    "Creating AI knowledge base...",
    "Finalizing results..."
  ];

  const currentStepIndex = steps.findIndex(step => step === status || status.includes(step.split('...')[0]));
  const progress = Math.max(5, ((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="flex items-center justify-center w-full h-full p-4 relative z-10">
      <Card className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary/50 border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Analyzing Repository</h2>
          <p className="text-text-secondary h-6">{status}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-4 pt-4 text-left">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={index} className={`flex items-center space-x-3 text-sm ${isCurrent ? 'text-white' : isCompleted ? 'text-success' : 'text-text-muted'}`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <div className={`w-4 h-4 rounded-full border-2 ${isCurrent ? 'border-primary animate-pulse' : 'border-white/10'}`} />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}