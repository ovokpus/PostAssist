// API Request Types
export interface PostGenerationRequest {
  paper_title: string;
  additional_context?: string;
  target_audience?: 'academic' | 'professional' | 'general';
  tone?: 'professional' | 'casual' | 'enthusiastic';
}

export interface PostStatusRequest {
  task_id: string;
}

export interface PostVerificationRequest {
  post_content: string;
  paper_title: string;
  verification_type?: 'technical' | 'style' | 'both';
}

export interface BatchPostRequest {
  papers: Array<{
    paper_title: string;
    additional_context?: string;
    target_audience?: 'academic' | 'professional' | 'general';
    tone?: 'professional' | 'casual' | 'enthusiastic';
  }>;
}

// API Response Types
export interface LinkedInPost {
  content: string;
  hashtags: string[];
  engagement_score?: number;
  word_count: number;
  character_count: number;
}

export interface VerificationReport {
  technical_accuracy: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  style_compliance: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  overall_score: number;
  recommendations: string[];
}

export interface AgentFeedback {
  agent_name: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  current_activity?: string;
  progress: number;
  findings?: string;
  last_update: string;
  error_message?: string;
}

export interface TeamProgress {
  team_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  current_focus?: string;
  agents: AgentFeedback[];
  team_findings?: string;
  started_at?: string;
  completed_at?: string;
}

export interface TaskStatus {
  task_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  current_step: string;
  // New detailed agent feedback
  teams: TeamProgress[];
  current_team?: string;
  phase?: string;
  detailed_status?: string;
  estimated_completion: string;
  error_message?: string;
}

export interface PostGenerationResponse {
  task_id: string;
  status: string;
  message: string;
  estimated_completion_time: string;
}

export interface PostStatusResponse {
  task_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  current_step?: string;
  teams: TeamProgress[];
  current_team?: string;
  phase?: string;
  detailed_status?: string;
  result?: LinkedInPost;
  verification?: VerificationReport;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface PostVerificationResponse {
  verification_id: string;
  post_content: string;
  verification_report: VerificationReport;
  verified_at: string;
  overall_rating: 'excellent' | 'good' | 'needs_improvement' | 'poor';
}

export interface BatchPostResponse {
  batch_id: string;
  status: string;
  total_posts: number;
  completed_posts: number;
  failed_posts: number;
  task_ids: string[];
  estimated_completion_time: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version: string;
  uptime: string;
  dependencies: {
    openai: string;
    tavily: string;
    redis: string;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  status_code: number;
  timestamp: string;
}

// UI State Types
export interface GenerationState {
  isGenerating: boolean;
  currentStep: string;
  progress: number;
  taskId?: string;
  error?: string;
}

export interface PostState {
  content: string;
  hashtags: string[];
  engagement_hooks: string[];
  call_to_action: string;
  character_count: number;
  estimated_reach: number;
  verification?: VerificationReport;
}

export interface BatchState {
  batchId?: string;
  totalPosts: number;
  completedPosts: number;
  failedPosts: number;
  taskIds: string[];
  isProcessing: boolean;
  results: LinkedInPost[];
}

// Form Types
export interface PostForm {
  paperTitle: string;
  additionalContext: string;
  targetAudience: 'academic' | 'professional' | 'general';
  tone: 'professional' | 'casual' | 'enthusiastic';
}

export interface BatchForm {
  papers: Array<{
    paperTitle: string;
    additionalContext: string;
    targetAudience: 'academic' | 'professional' | 'general';
    tone: 'professional' | 'casual' | 'enthusiastic';
  }>;
}

// API Client Types
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export interface ApiError extends Error {
  status: number;
  response?: ErrorResponse;
}

// WebSocket Types (for real-time updates)
export interface WebSocketMessage {
  type: 'status_update' | 'generation_complete' | 'error' | 'progress';
  data: TaskStatus | LinkedInPost | ErrorResponse | { progress: number };
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

// Utility Types
export type ApiEndpoint = 
  | '/generate-post'
  | '/status'
  | '/verify-post'
  | '/batch-generate'
  | '/health';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  method: HttpMethod;
  endpoint: ApiEndpoint;
  data?: Record<string, unknown>;
  params?: Record<string, string>;
  headers?: Record<string, string>;
} 