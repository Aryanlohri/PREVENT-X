/**
 * PreventX API Helper — Centralized HTTP client for all backend communication.
 * Manages JWT auth tokens, request/response handling, and error normalization.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ─── Token Management ──────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem("preventx_token");
}

export function setToken(token: string): void {
  localStorage.setItem("preventx_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("preventx_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ─── Core Request Helpers ──────────────────────────────────────

export interface ApiError {
  status: number;
  detail: string;
}

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "detail" in err &&
    typeof (err as { status: unknown }).status === "number" &&
    typeof (err as { detail: unknown }).detail === "string"
  );
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // If body isn't JSON, use the default message
    }
    const err: ApiError = { status: res.status, detail };
    throw err;
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

// ─── Auth API ──────────────────────────────────────────────────

interface AuthResponse {
  access_token: string;
  token_type: string;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const data = await apiPost<AuthResponse>("/auth/login", { email, password });
  setToken(data.access_token);
  return data;
}

export async function signupUser(
  full_name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiPost<AuthResponse>("/auth/signup", {
    full_name,
    email,
    password,
  });
  setToken(data.access_token);
  return data;
}

export function logoutUser(): void {
  clearToken();
}

// ─── Type Definitions for API Responses ────────────────────────

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  pre_existing_condition: string | null;
}

export interface VitalRecord {
  id: number;
  user_id: number;
  blood_pressure_sys: number | null;
  blood_pressure_dia: number | null;
  heart_rate: number | null;
  blood_sugar: number | null;
  bmi: number | null;
  timestamp: string;
}

export interface MedicationRecord {
  id: number;
  user_id: number;
  name: string;
  time: string;
  taken: boolean;
  date: string;
}

export interface DailyLogRecord {
  id: number;
  user_id: number;
  sleep_quality: number | null;
  physical_activity: number | null;
  diet_quality: number | null;
  stress_level: number | null;
  date: string;
}

export interface RiskPrediction {
  risk_level: string;
  risk_score: number;
  probabilities: {
    low: number;
    moderate: number;
    high: number;
  };
}

export interface ChatMessagePayload {
  role: string;
  content: string;
}

export interface ChatResponse {
  response: string;
}

export interface QuickQuestionsResponse {
  questions: string[];
}

export interface VitalCreatePayload {
  blood_pressure_sys?: number;
  blood_pressure_dia?: number;
  heart_rate?: number;
  blood_sugar?: number;
  bmi?: number;
}

export interface MedicationCreatePayload {
  name: string;
  time: string;
  taken?: boolean;
}

export interface DailyLogCreatePayload {
  sleep_quality?: number;
  stress_level?: number;
  diet_quality?: number;
  physical_activity?: number;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  pre_existing_condition?: string;
}

export interface LifestylePlanResponse {
  calories: string;
  macros: string;
  workout_type: string;
  intensity: string;
  daily_goals: {
    label: string;
    current: number;
    target: number;
    unit?: string;
  }[];
  daily_meals: {
    type: string;
    time: string;
    items: { name: string; cal: number }[];
  }[];
  daily_workouts: {
    name: string;
    type: string;
    intensity: string;
    time: string;
    duration: string;
    calories: number;
  }[];
  weekly_meals: {
    day: string;
    meals: number;
    calories: number;
    protein: number;
  }[];
  weekly_workouts: {
    day: string;
    workouts: number;
    calories: number;
    duration: string;
  }[];
}

export interface SymptomCheckRequest {
  symptoms: string[];
}

export interface PredictionItem {
  probable_disease: string;
  confidence: number;
  prevention_steps: string[];
  recommended_doctors: string[];
  diet_advice: string[];
  medication_advice: string[];
}

export interface SymptomCheckResponse {
  urgency_level: string;
  predictions: PredictionItem[];
}

// ─── Domain API Functions ──────────────────────────────────────

export const fetchUserProfile = () => apiGet<UserProfile>("/api/users/me");
export const updateUserProfile = (payload: ProfileUpdatePayload) => apiPut<UserProfile>("/api/users/me", payload);

export const fetchVitals = () => apiGet<VitalRecord[]>("/api/vitals");
export const createVital = (payload: VitalCreatePayload) => apiPost<VitalRecord>("/api/vitals", payload);

export const fetchMedications = () => apiGet<MedicationRecord[]>("/api/medications");
export const createMedication = (payload: MedicationCreatePayload) => apiPost<MedicationRecord>("/api/medications", payload);
export const toggleMedication = (medId: number, taken: boolean) => apiPatch<MedicationRecord>(`/api/medications/${medId}`, { taken });

export const fetchDailyLogs = () => apiGet<DailyLogRecord[]>("/api/daily-logs");
export const postDailyLog = (payload: DailyLogCreatePayload) => apiPost<DailyLogRecord>("/api/daily-logs", payload);
export const fetchRiskPrediction = () => apiGet<RiskPrediction>("/api/ml/predict-risk");
export const fetchLifestylePlan = () => apiGet<LifestylePlanResponse>("/api/ml/my-lifestyle-plan");
export const fetchQuickQuestions = () => apiGet<QuickQuestionsResponse>("/api/chat/quick-questions");
export const predictDisease = (symptoms: string[]) => apiPost<SymptomCheckResponse>("/api/ml/predict-disease", { symptoms });

export const sendChatMessage = (messages: ChatMessagePayload[]) =>
  apiPost<ChatResponse>("/api/chat", { messages });
