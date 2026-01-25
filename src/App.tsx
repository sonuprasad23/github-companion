import { useState } from 'react';
import { Header } from './components/Header';
import { InitialState } from './components/InitialState';
import { LoadingState } from './components/LoadingState';
import { AnalysisInterface } from './components/AnalysisInterface';
import { startAnalysis, pollStatus, fetchResults } from './services/api';
import { AnalysisResultData } from './types';

export type AppState = 'initial' | 'loading' | 'analysis' | 'error';

export function App() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [loadingStatus, setLoadingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setAppState('loading');
    setLoadingStatus('Initializing analysis...');
    try {
      const { session_id } = await startAnalysis(url);
      setSessionId(session_id);

      const poll = setInterval(async () => {
        try {
          const statusData = await pollStatus(session_id);
          switch (statusData.status) {
            case 'pending':
              setLoadingStatus('Waiting in queue...');
              break;
            case 'processing':
              setLoadingStatus('Cloning & analyzing repository...');
              break;
            case 'vectorizing':
              setLoadingStatus('Creating AI knowledge base...');
              break;
            case 'completed':
              setLoadingStatus('Finalizing results...');
              clearInterval(poll);
              const resultData = await fetchResults(session_id);
              setAnalysisResult(resultData);
              setAppState('analysis');
              break;
            case 'failed':
              throw new Error(statusData.message || 'Analysis failed in the backend.');
          }
        } catch (error) {
          clearInterval(poll);
          handleError(error instanceof Error ? error.message : 'An unknown polling error occurred.');
        }
      }, 3000);

    } catch (error) {
      handleError(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setAppState('error');
    setTimeout(() => setAppState('initial'), 5000);
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <LoadingState status={loadingStatus} />;
      case 'analysis':
        if (analysisResult && sessionId) {
          return <AnalysisInterface analysisResult={analysisResult} sessionId={sessionId} />;
        }
        handleError("Analysis result is missing.");
        return <InitialState onAnalyze={handleAnalyze} />;
      case 'error':
        return <LoadingState status={errorMessage} />;
      case 'initial':
      default:
        return <InitialState onAnalyze={handleAnalyze} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-secondary/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        <main className="flex-1 flex overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}




