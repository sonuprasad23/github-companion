import { AnalysisResultData } from '../types';

// Use the environment variable for the backend URL, with a fallback for local development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

type ModifiedFile = {
    path: string;
    content: string;
}

export async function startAnalysis(repo_url: string): Promise<{ session_id: string }> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_url }),
  });
  if (!response.ok) throw new Error('Failed to start analysis.');
  return response.json();
}

export async function pollStatus(session_id: string): Promise<{ status: string; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/status/${session_id}`);
  if (!response.ok) throw new Error('Failed to get status.');
  return response.json();
}

export async function fetchResults(session_id: string): Promise<AnalysisResultData> {
  const response = await fetch(`${API_BASE_URL}/result/${session_id}`);
  if (!response.ok) throw new Error('Failed to fetch results.');
  return response.json();
}

export async function postChatMessage(session_id: string, query: string): Promise<{ answer: string }> {
  const response = await fetch(`${API_BASE_URL}/chat/${session_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error('Failed to get chat response.');
  return response.json();
}

export async function fetchFileContent(session_id: string, path: string): Promise<{ path: string; content: string }> {
  const response = await fetch(`${API_BASE_URL}/file-content/${session_id}?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch file content.');
  }
  return response.json();
}

export async function downloadProjectAsZip(session_id: string, modified_files: ModifiedFile[]): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/download-zip/${session_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modified_files }),
    });

    if (!response.ok) {
        throw new Error('Failed to download project.');
    }
    return response.blob();
}