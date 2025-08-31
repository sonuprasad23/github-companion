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
    setTimeout(() => setAppState('initial'), 5000); // Reset after 5s
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
        return <LoadingState status={errorMessage} isError={true} />;
      case 'initial':
      default:
        return <InitialState onAnalyze={handleAnalyze} />;
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}