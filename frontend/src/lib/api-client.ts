// API client for the PostAssist FastAPI backend.
// This file was missing from the repo: the root .gitignore's Python `lib/` rule excluded frontend/src/lib.
// Calls go to /backend/* by default, which next.config.ts rewrites to the API (API_INTERNAL_URL).
// Set NEXT_PUBLIC_API_URL to call an API URL directly instead.
import axios from 'axios';
import {
  BatchPostRequest, BatchPostResponse, HealthCheckResponse, PostGenerationRequest, PostGenerationResponse,
  PostStatusResponse, PostVerificationRequest, PostVerificationResponse,
} from '@/types/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/backend',
  timeout: 150_000,
  headers: { 'Content-Type': 'application/json' },
});

export const generatePost = async (req: PostGenerationRequest) =>
  (await api.post<PostGenerationResponse>('/generate-post', req)).data;

export const getTaskStatus = async (taskId: string) =>
  (await api.get<PostStatusResponse>(`/status/${taskId}`)).data;

export const getAllTasks = async () => (await api.get<PostStatusResponse[]>('/tasks')).data;

export const verifyPost = async (req: PostVerificationRequest) =>
  (await api.post<PostVerificationResponse>('/verify-post', req)).data;

export const batchGenerate = async (req: BatchPostRequest) =>
  (await api.post<BatchPostResponse>('/batch-generate', req)).data;

export const getHealth = async () => (await api.get<HealthCheckResponse>('/health')).data;

/** Polls a task until it completes or fails, calling onUpdate with every status. */
export async function pollTaskStatus(
  taskId: string,
  onUpdate: (status: PostStatusResponse) => void,
  intervalMs = 2000,
  maxAttempts = 300,
): Promise<PostStatusResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getTaskStatus(taskId);
    onUpdate(status);
    if (status.status === 'completed' || status.status === 'failed') return status;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Task ${taskId} did not finish after ${maxAttempts} polls`);
}
