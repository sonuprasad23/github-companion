export interface FileDetail {
  path: string;
  size_bytes: number;
}

export interface AnalysisResultData {
  repo_url: string;
  directory_structure: FileDetail[];
  initial_summary: string;
}