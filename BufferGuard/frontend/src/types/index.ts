export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type ConfidenceLevel = 'Confirmed' | 'Potential' | 'Safe operation' | 'Insufficient evidence';

export interface Vulnerability {
  id: number;
  scan_id: number;
  vulnerability_type: string;
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  line_number: number;
  code_snippet: string;
  description: string;
  possible_consequences: string;
  recommendation: string;
  safer_code: string;
  cwe_id: string;
}

export interface ScanResult {
  id: number;
  filename: string;
  source_hash: string;
  scan_timestamp: string;
  status: string;
  total_findings: number;
  security_score: number;
  code_content: string;
  vulnerabilities: Vulnerability[];
}

export interface ScanSummaryItem {
  id: number;
  filename: string;
  scan_timestamp: string;
  status: string;
  total_findings: number;
  security_score: number;
}

export interface DashboardSummary {
  total_scans: number;
  potential_vulnerabilities: number;
  confirmed_vulnerabilities: number;
  high_risk_findings: number;
  safe_programs: number;
  total_simulations: number;
  overall_security_score: number;
  latest_scan_date: string | null;
}

export interface RecentActivity {
  recent_scans: {
    id: number;
    filename: string;
    timestamp: string;
    findings: number;
    score: number;
    status: string;
  }[];
  recent_simulations: {
    id: number;
    buffer_size: number;
    input_length: number;
    mode: string;
    is_overflow: boolean;
    created_at: string;
  }[];
  latest_findings: {
    id: number;
    scan_id: number;
    type: string;
    severity: SeverityLevel;
    line: number;
    cwe: string;
  }[];
}

export interface MemoryCell {
  index: number;
  char: string;
  byte_hex: string;
  is_occupied: boolean;
  is_buffer: boolean;
  is_overflow: boolean;
  is_null_terminator: boolean;
  address_offset: string;
}

export interface SimulationResult {
  id?: number;
  buffer_size: number;
  input_text: string;
  input_length: number;
  simulation_mode: 'SAFE' | 'UNSAFE_CONCEPTUAL';
  result: string;
  is_overflow: boolean;
  excess_bytes: number;
  cells: MemoryCell[];
  explanation: string;
  created_at?: string;
}

export interface SimulationPreset {
  id: string;
  title: string;
  buffer_size: number;
  input_text: string;
  mode: 'SAFE' | 'UNSAFE_CONCEPTUAL';
  description: string;
}

export interface PlaygroundExample {
  id: string;
  title: string;
  filename: string;
  description: string;
  is_safe: boolean;
  code: string;
  input_payload: string;
  expected_result: string;
}

export interface CompileResult {
  success: boolean;
  message?: string;
  output?: string;
  errors?: string;
  is_syntax_valid: boolean;
}

export interface RunApprovedResult {
  success: boolean;
  example_id?: string;
  title?: string;
  compiled?: boolean;
  returncode?: number;
  stdout?: string;
  stderr?: string;
  is_safe?: boolean;
  execution_time_ms?: number;
  error?: string;
  security_note?: string;
}

export interface ReportItem {
  id: number;
  scan_id: number;
  report_type: 'PDF' | 'JSON' | 'CSV';
  generated_at: string;
  file_path: string;
}

export interface AnalyticsOverview {
  scans_comparison: {
    total: number;
    safe: number;
    vulnerable: number;
    safe_percentage: number;
  };
  severity_distribution: Record<string, number>;
  cwe_distribution: { cwe: string; count: number }[];
  simulation_metrics: {
    total: number;
    overflow_detected: number;
    safe_bounded: number;
  };
}

export interface AnalyticsTrend {
  id: number;
  timestamp: string;
  score: number;
  findings: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  content_markdown: string;
  c_example_unsafe: string;
  c_example_safe: string;
  quizzes: QuizQuestion[];
  completed?: boolean;
  score?: number;
}
