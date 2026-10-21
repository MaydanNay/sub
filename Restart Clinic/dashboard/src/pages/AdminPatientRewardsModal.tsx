import { useEffect, useState } from "react";
import {
  adminApi,
  REWARD_TRIGGER_LABELS,
  type Doctor,
  type Patient,
  type PatientReward,
  type PatientRewardTrigger,
  type RewardIssuerType,
} from "../api";

type IssuerOption = "ADMIN" | string;

export function AdminPatientRewardsModal({
  patient,
  doctors,
  onClose,
}: {
  patient: Patient;
  doctors: Doctor[];
  onClose: () => void;
}) {
  const [rewards, setRewards] = useState<PatientReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    trigger: "STAGE_1" as PatientRewardTrigger,
    issuer: (patient.doctor?.id ?? "ADMIN") as IssuerOption,
  });

  const load = () => {
    adminApi
      .patientRewards(patient.id)
      .then(setRewards)
      .finally(() => setLoading(false));
  };

  useEffect(load, [patient.id]);

  const addReward = async () => {
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const issuerType: RewardIssuerType = form.issuer === "ADMIN" ? "ADMIN" : "DOCTOR";
      await adminApi.createPatientReward(patient.id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        trigger: form.trigger,
        issuerType,
        doctorId: issuerType === "DOCTOR" ? form.issuer : undefined,
      });
      setForm((f) => ({ ...f, title: "", description: "" }));
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  const removeReward = async (rewardId: string) => {
    setBusy(true);
    try {
      await adminApi.deletePatientReward(patient.id, rewardId);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-1">Призы пациента</h3>
        <p className="text-sm text-gray-500 mb-4">{patient.fullName}</p>

        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <>
            {rewards.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {rewards.map((reward) => (
                  <li
                    key={reward.id}
                    className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800">
                        {reward.grantedAt ? "🎁" : "🔒"} {reward.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {reward.triggerLabel ?? REWARD_TRIGGER_LABELS[reward.trigger]}
                        {reward.sourceLabel ? ` · ${reward.sourceLabel}` : ""}
                      </p>
                      {reward.description && (
                        <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                      )}
                    </div>
                    {!reward.grantedAt && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeReward(reward.id)}
                        className="text-xs text-red-600 hover:underline shrink-0"
                      >
                        Удалить
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Призы ещё не назначены</p>
            )}

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block">
                <span className="text-sm font-medium text-gray-600">От лица</span>
                <select
                  value={form.issuer}
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="ADMIN">Администратор (Restart Clinic)</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Врач: {d.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-600">Название приза</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Например: Массажный курс"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-600">Описание</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-600">Выдать при достижении</span>
                <select
                  value={form.trigger}
                  onChange={(e) =>
                    setForm({ ...form, trigger: e.target.value as PatientRewardTrigger })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  {(Object.keys(REWARD_TRIGGER_LABELS) as PatientRewardTrigger[]).map((key) => (
                    <option key={key} value={key}>
                      {REWARD_TRIGGER_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={busy || !form.title.trim()}
                onClick={addReward}
                className="w-full bg-clinic-primary text-white py-2 rounded-lg disabled:opacity-50"
              >
                Добавить приз
              </button>
            </div>
          </>
        )}

        <button onClick={onClose} className="w-full border rounded-lg py-2 mt-4">
          Закрыть
        </button>
      </div>
    </div>
  );
}
