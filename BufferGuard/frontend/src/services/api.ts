import axios from 'axios';
import {
  DashboardSummary,
  RecentActivity,
  ScanResult,
  ScanSummaryItem,
  SimulationResult,
  SimulationPreset,
  PlaygroundExample,
  CompileResult,
  RunApprovedResult,
  ReportItem,
  AnalyticsOverview,
  AnalyticsTrend,
  LearningTopic
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // System Health
  async getHealth() {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },

  async getRecentActivity(): Promise<RecentActivity> {
    const res = await apiClient.get<RecentActivity>('/dashboard/activity');
    return res.data;
  },

  // Scanner
  async analyzeCode(filename: string, code: string): Promise<ScanResult> {
    const res = await apiClient.post<ScanResult>('/scanner/analyze', { filename, code });
    return res.data;
  },

  async uploadCodeFile(file: File): Promise<ScanResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ScanResult>('/scanner/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getScanHistory(): Promise<ScanSummaryItem[]> {
    const res = await apiClient.get<ScanSummaryItem[]>('/scanner/history');
    return res.data;
  },

  async getScanResult(scanId: number): Promise<ScanResult> {
    const res = await apiClient.get<ScanResult>(`/scanner/results/${scanId}`);
    return res.data;
  },

  async getSamplePrograms(): Promise<Record<string, { title: string; filename: string; code: string }>> {
    const res = await apiClient.get('/scanner/samples');
    return res.data;
  },

  // Simulator
  async runSimulation(
    bufferSize: number,
    inputText: string,
    simulationMode: 'SAFE' | 'UNSAFE_CONCEPTUAL'
  ): Promise<SimulationResult> {
    const res = await apiClient.post<SimulationResult>('/simulator/run', {
      buffer_size: bufferSize,
      input_text: inputText,
      simulation_mode: simulationMode,
    });
    return res.data;
  },

  async getSimulationPresets(): Promise<SimulationPreset[]> {
    const res = await apiClient.get<SimulationPreset[]>('/simulator/examples');
    return res.data;
  },

  // Playground
  async getPlaygroundExamples(): Promise<PlaygroundExample[]> {
    const res = await apiClient.get<PlaygroundExample[]>('/playground/examples');
    return res.data;
  },

  async compileCodeSyntax(code: string): Promise<CompileResult> {
    const res = await apiClient.post<CompileResult>('/playground/compile', { code });
    return res.data;
  },

  async runApprovedExample(exampleId: string): Promise<RunApprovedResult> {
    const res = await apiClient.post<RunApprovedResult>('/playground/run-approved', {
      example_id: exampleId,
    });
    return res.data;
  },

  // Reports
  async listReports(): Promise<ReportItem[]> {
    const res = await apiClient.get<ReportItem[]>('/reports');
    return res.data;
  },

  async generateReport(scanId: number, reportType: 'PDF' | 'JSON' | 'CSV'): Promise<ReportItem> {
    const res = await apiClient.post<ReportItem>('/reports/generate', {
      scan_id: scanId,
      report_type: reportType,
    });
    return res.data;
  },

  getReportDownloadUrl(reportId: number): string {
    return `${API_BASE_URL}/reports/${reportId}/download`;
  },

  getQuickExportUrl(scanId: number, format: 'pdf' | 'json' | 'csv'): string {
    return `${API_BASE_URL}/reports/quick-export/${scanId}?format=${format}`;
  },

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const res = await apiClient.get<AnalyticsOverview>('/analytics/overview');
    return res.data;
  },

  async getAnalyticsTrends(): Promise<AnalyticsTrend[]> {
    const res = await apiClient.get<AnalyticsTrend[]>('/analytics/trends');
    return res.data;
  },

  // Learning
  async getLearningTopics(): Promise<LearningTopic[]> {
    const res = await apiClient.get<LearningTopic[]>('/learning/topics');
    return res.data;
  },

  async getTopicDetail(topicId: string): Promise<LearningTopic> {
    const res = await apiClient.get<LearningTopic>(`/learning/topics/${topicId}`);
    return res.data;
  },

  async updateTopicProgress(topicId: string, completionStatus: boolean, quizScore: number) {
    const res = await apiClient.post('/learning/progress', {
      topic_id: topicId,
      completion_status: completionStatus,
      quiz_score: quizScore,
    });
    return res.data;
  },
};
