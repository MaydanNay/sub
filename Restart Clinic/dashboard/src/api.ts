const API_URL = import.meta.env.VITE_API_URL ?? "";

function getToken() {
  return localStorage.getItem("rc_token");
}

export function setToken(token: string) {
  localStorage.setItem("rc_token", token);
}

export function clearToken() {
  localStorage.removeItem("rc_token");
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Ошибка запроса");
  }

  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: StaffUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => api<StaffUser>("/api/auth/me"),
};

export const adminApi = {
  applications: () => api<Application[]>("/api/admin/applications"),
  approve: (id: string, data: ApproveData) =>
    api(`/api/admin/applications/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  patients: () => api<Patient[]>("/api/admin/patients"),
  doctors: () => api<Doctor[]>("/api/admin/doctors"),
  updatePatient: (
    id: string,
    data: Partial<{
      fullName: string;
      age: number;
      gender: Gender;
      diagnosis: string;
      doctorId: string;
      stage: number;
      nextVisitAt: string | null;
    }>
  ) =>
    api<Patient>(`/api/admin/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  pinPatient: (id: string) =>
    api<Patient>(`/api/admin/patients/${id}/pin`, { method: "PATCH" }),
  deletePatient: (id: string) =>
    api<{ ok: boolean }>(`/api/admin/patients/${id}`, { method: "DELETE" }),
  createDoctor: (data: { email: string; fullName: string; password?: string }) =>
    api<Doctor>(`/api/admin/doctors`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  pushNotifications: () => api<PushNotification[]>("/api/admin/push-notifications"),
  createPushNotification: (text: string, type: "NIGHTMARE" | "MOTIVATIONAL" | "SYSTEM") =>
    api<PushNotification>("/api/admin/push-notifications", {
      method: "POST",
      body: JSON.stringify({ text, type }),
    }),
  deletePushNotification: (id: string) =>
    api<{ ok: boolean }>(`/api/admin/push-notifications/${id}`, { method: "DELETE" }),
  patientRewards: (patientId: string) =>
    api<PatientReward[]>(`/api/admin/patients/${patientId}/rewards`),
  createPatientReward: (
    patientId: string,
    data: {
      title: string;
      description?: string;
      trigger: PatientRewardTrigger;
      issuerType: RewardIssuerType;
      doctorId?: string;
    }
  ) =>
    api<PatientReward>(`/api/admin/patients/${patientId}/rewards`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deletePatientReward: (patientId: string, rewardId: string) =>
    api<{ ok: boolean }>(`/api/admin/patients/${patientId}/rewards/${rewardId}`, {
      method: "DELETE",
    }),
};

export const doctorApi = {
  patients: () => api<Patient[]>("/api/doctor/patients"),
  patient: (id: string) => api<PatientDetail>(`/api/doctor/patients/${id}`),
  recordVisit: (id: string, data?: { note?: string; title?: string; medals?: MedalTier[] }) =>
    api(`/api/doctor/patients/${id}/visit`, {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    }),
  medalStats: (id: string) =>
    api<MedalStats>(`/api/doctor/patients/${id}/medals`),
  setStage: (id: string, stage: number) =>
    api(`/api/doctor/patients/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    }),
  setNextVisit: (id: string, nextVisitAt: string) =>
    api(`/api/doctor/patients/${id}/next-visit`, {
      method: "PATCH",
      body: JSON.stringify({ nextVisitAt }),
    }),
  setTargetVisits: (id: string, targetVisits: number | null) =>
    api(`/api/doctor/patients/${id}/target-visits`, {
      method: "PATCH",
      body: JSON.stringify({ targetVisits }),
    }),
  completeCourse: (id: string) =>
    api<Patient & { disciplinePercent: number }>(
      `/api/doctor/patients/${id}/complete-course`,
      { method: "POST" }
    ),
  calendar: () =>
    api<{ visits: Visit[]; scheduled: Array<{ id: string; fullName: string | null; nextVisitAt: string }> }>(
      "/api/doctor/calendar"
    ),
  createReward: (
    patientId: string,
    data: { title: string; description?: string; trigger: PatientRewardTrigger }
  ) =>
    api<PatientReward>(`/api/doctor/patients/${patientId}/rewards`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteReward: (patientId: string, rewardId: string) =>
    api<{ ok: boolean }>(`/api/doctor/patients/${patientId}/rewards/${rewardId}`, {
      method: "DELETE",
    }),
};

export interface StaffUser {
  id: string;
  role: "ADMIN" | "DOCTOR";
  fullName: string;
  email: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  visitCount?: number;
}

export type Gender = "MALE" | "FEMALE";

export interface Patient {
  id: string;
  fullName: string | null;
  age: number | null;
  gender: Gender | null;
  diagnosis: string | null;
  phone: string | null;
  stage: string;
  hasAppAccess: boolean;
  endurance: number;
  ligaments: number;
  balance: number;
  visitCount: number;
  completedVisits?: number;
  targetVisits?: number | null;
  courseCompleted: boolean;
  rewardTier: string;
  nextVisitAt: string | null;
  isPinned?: boolean;
  doctor?: { id: string; fullName: string } | null;
}

export interface PatientDetail extends Patient {
  visits: Visit[];
  rewards: PatientReward[];
}

export type PatientRewardTrigger =
  | "STAGE_1"
  | "STAGE_2"
  | "STAGE_3"
  | "STAGE_4"
  | "COURSE_COMPLETE";

export type RewardIssuerType = "ADMIN" | "DOCTOR";

export interface PatientReward {
  id: string;
  title: string;
  description: string | null;
  trigger: PatientRewardTrigger;
  triggerLabel?: string;
  grantedAt: string | null;
  earned?: boolean;
  issuerType: RewardIssuerType;
  sourceLabel?: string;
}

export interface Visit {
  id: string;
  createdAt: string;
  title?: string | null;
  note: string | null;
  patient?: { fullName: string };
  medals?: VisitMedal[];
}

export type MedalTier = "BRONZE" | "SILVER" | "GOLD";

export interface VisitMedal {
  id?: string;
  tier: MedalTier;
  emoji?: string;
}

export interface MedalStats {
  total: number;
  quotas: Record<MedalTier, number>;
  used: Record<MedalTier, number>;
}

export interface Application {
  id: string;
  phone: string;
  telegramUsername: string | null;
  status: string;
  createdAt: string;
  patient: Patient;
}

export interface ApproveData {
  fullName: string;
  age: number;
  gender: Gender;
  diagnosis: string;
  doctorId: string;
  nextVisitAt?: string;
}

const STAGE_NUM: Record<string, number> = {
  STAGE_1: 1,
  STAGE_2: 2,
  STAGE_3: 3,
  STAGE_4: 4,
};

export function stageLabel(stage: string) {
  const n = STAGE_NUM[stage] ?? 1;
  return `Этап ${n}`;
}

export { genderLabel, REWARD_TRIGGER_LABELS, MEDAL_EMOJI } from "@restart-clinic/shared";

export interface PushNotification {
  id: string;
  text: string;
  type: "NIGHTMARE" | "MOTIVATIONAL" | "SYSTEM";
  createdAt: string;
}
