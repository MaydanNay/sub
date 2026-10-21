const API_URL = import.meta.env.VITE_API_URL ?? "";

function apiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "X-Telegram-Init-Data": getInitData(),
  };
  if (typeof window !== "undefined" && window.location.hostname.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }
  return headers;
}

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "API вернул не JSON (проверьте VITE_API_URL и что backend запущен на :3001)"
    );
  }
}

export async function fetchPatientData() {
  const initData = getInitData();
  if (!initData) {
    throw new Error("Нет данных Telegram. Откройте через кнопку бота.");
  }

  const res = await fetch(`${API_URL}/api/patient/me`, {
    method: "POST",
    headers: {
      ...apiHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ initData }),
  });

  const body = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(body.message ?? body.error ?? "Ошибка загрузки");
  }

  return body;
}

export interface PatientData {
  profile: {
    fullName: string | null;
    age: number | null;
    gender: "MALE" | "FEMALE" | null;
    diagnosis: string | null;
    doctorName: string | null;
  };
  journey: {
    stage: 1 | 2 | 3 | 4;
    stageLabel: string;
    courseCompleted: boolean;
    rewardTier: string;
    motivation: string;
    warning: boolean;
  };
  mascot: {
    imageIndex: number;
    stats: { endurance: number; ligaments: number; balance: number };
    showInternalBars: boolean;
  };
  visits: {
    completed: number;
    scheduled: number;
    targetVisits: number | null;
    nextVisitAt: string | null;
    courseTotal: number;
    medalQuotas: { BRONZE: number; SILVER: number; GOLD: number };
    medalUsed: { BRONZE: number; SILVER: number; GOLD: number };
    history: Array<{
      id: string;
      title: string;
      visitNumber: number;
      date: string;
      note: string | null;
      medals: Array<{ tier: string; emoji: string }>;
      slotMedal: { tier: string; emoji: string };
      earned: boolean;
    }>;
  };
  rewards: Array<{
    id: string;
    title: string;
    description: string | null;
    trigger: string;
    triggerLabel: string;
    sourceLabel: string;
    grantedAt: string | null;
    earned: boolean;
  }>;
}
function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? "";
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
        disableVerticalSwipes?: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}
