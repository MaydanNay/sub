import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { doctorApi, genderLabel, MEDAL_EMOJI, REWARD_TRIGGER_LABELS, stageLabel, type MedalTier, type PatientDetail, type PatientRewardTrigger } from "../api";

export function DoctorPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [nextVisit, setNextVisit] = useState("");
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rewardForm, setRewardForm] = useState({
    title: "",
    description: "",
    trigger: "STAGE_1" as PatientRewardTrigger,
  });
  const [visitMedals, setVisitMedals] = useState<MedalTier[]>([]);
  const [visitTitle, setVisitTitle] = useState("");
  const [medalStats, setMedalStats] = useState<{
    quotas: Record<MedalTier, number>;
    used: Record<MedalTier, number>;
    total: number;
  } | null>(null);

  const load = () => {
    if (!id) return;
    Promise.all([doctorApi.patient(id), doctorApi.medalStats(id)])
      .then(([p, stats]) => {
        setPatient(p);
        setMedalStats(stats);
        const map: Record<string, number> = { STAGE_1: 1, STAGE_2: 2, STAGE_3: 3, STAGE_4: 4 };
        setStage(map[p.stage] ?? 1);
        if (p.nextVisitAt) {
          setNextVisit(new Date(p.nextVisitAt).toISOString().slice(0, 16));
        }
        setVisitTitle(`Посещение №${(p.completedVisits ?? p.visitCount) + 1}`);
      })
      .finally(() => setLoading(false));
  };

  const addVisitMedal = (tier: MedalTier) => {
    if (visitMedals.length >= 10) return;
    if (!medalStats) return;
    const used = medalStats.used[tier] + visitMedals.filter((m) => m === tier).length;
    if (used >= medalStats.quotas[tier]) return;
    setVisitMedals((prev) => [...prev, tier]);
  };

  const removeVisitMedal = (index: number) => {
    setVisitMedals((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(load, [id]);

  const action = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !patient) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Link
        to="/doctor/patients"
        className="inline-flex items-center text-sm text-clinic-primary hover:underline mb-4"
      >
        ← К списку пациентов
      </Link>

      <article className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <header className="bg-clinic-primary text-white px-6 py-5">
          <h1 className="text-xl font-bold">{patient.fullName}</h1>
          <p className="text-sm text-white/80 mt-1">
            {patient.diagnosis} · {genderLabel(patient.gender)} · {stageLabel(patient.stage)}
          </p>
        </header>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-xl bg-slate-50 py-3">
              <p className="text-gray-500 mb-1">Выносливость</p>
              <p className="text-lg font-bold text-clinic-dark">{patient.endurance}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 py-3">
              <p className="text-gray-500 mb-1">Связки</p>
              <p className="text-lg font-bold text-clinic-dark">{patient.ligaments}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 py-3">
              <p className="text-gray-500 mb-1">Баланс</p>
              <p className="text-lg font-bold text-clinic-dark">{patient.balance}%</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-600">Название посещения</span>
              <input
                value={visitTitle}
                onChange={(e) => setVisitTitle(e.target.value)}
                placeholder="Посещение №1"
                disabled={patient.courseCompleted}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </label>
          </div>

          <button
            disabled={busy || patient.courseCompleted}
            onClick={() =>
              action(async () => {
                await doctorApi.recordVisit(patient.id, {
                  title: visitTitle.trim() || undefined,
                  medals: visitMedals,
                });
                setVisitMedals([]);
              })
            }
            className="w-full bg-clinic-primary text-white py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-clinic-dark transition"
          >
            ✅ Пациент прошёл занятие
          </button>

          {medalStats && (
            <div className="rounded-xl border border-slate-100 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700">Медали за посещение</h3>
                <span className="text-xs text-gray-500">
                  {visitMedals.length}/10 на визит
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Квота на курс ({medalStats.total} визитов): 🥉 {medalStats.used.BRONZE}/{medalStats.quotas.BRONZE} · 🥈 {medalStats.used.SILVER}/{medalStats.quotas.SILVER} · 🥇 {medalStats.used.GOLD}/{medalStats.quotas.GOLD}
              </p>
              <div className="flex gap-2">
                {(["BRONZE", "SILVER", "GOLD"] as MedalTier[]).map((tier) => {
                  const remaining =
                    medalStats.quotas[tier] -
                    medalStats.used[tier] -
                    visitMedals.filter((m) => m === tier).length;
                  return (
                    <button
                      key={tier}
                      type="button"
                      disabled={busy || patient.courseCompleted || remaining <= 0 || visitMedals.length >= 10}
                      onClick={() => addVisitMedal(tier)}
                      className="flex-1 border rounded-lg py-2 text-lg hover:bg-slate-50 disabled:opacity-40"
                      title={`Осталось: ${remaining}`}
                    >
                      {MEDAL_EMOJI[tier]}
                    </button>
                  );
                })}
              </div>
              {visitMedals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {visitMedals.map((tier, index) => (
                    <button
                      key={`${tier}-${index}`}
                      type="button"
                      onClick={() => removeVisitMedal(index)}
                      className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-sm"
                      title="Убрать"
                    >
                      {MEDAL_EMOJI[tier]} ×
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-slate-100 p-4 flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600">Этап реабилитации</label>
              <select
                value={stage}
                onChange={(e) => setStage(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                disabled={patient.courseCompleted}
              >
                {[1, 2, 3, 4].map((s) => (
                  <option key={s} value={s}>
                    Этап {s} (12 визитов)
                  </option>
                ))}
              </select>
            </div>
            <button
              disabled={busy || patient.courseCompleted}
              onClick={() => action(() => doctorApi.setStage(patient.id, stage))}
              className="bg-clinic-accent text-white px-4 py-2 rounded-lg shrink-0"
            >
              Сменить
            </button>
          </div>

          <div className="rounded-xl border border-slate-100 p-4 flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600">Следующий визит</label>
              <input
                type="datetime-local"
                value={nextVisit}
                onChange={(e) => setNextVisit(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <button
              disabled={busy || !nextVisit}
              onClick={() =>
                action(() => doctorApi.setNextVisit(patient.id, new Date(nextVisit).toISOString()))
              }
              className="bg-clinic-accent text-white px-4 py-2 rounded-lg shrink-0"
            >
              Назначить
            </button>
          </div>

          <div className="rounded-xl border border-slate-100 p-4 flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600">Сколько визитов должен пройти этот пациент?</label>
              <input
                type="number"
                min="0"
                value={patient.targetVisits ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setPatient({ ...patient, targetVisits: val ? Number(val) : null });
                }}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="Без ограничений"
              />
            </div>
            <button
              disabled={busy}
              onClick={() =>
                action(() => doctorApi.setTargetVisits(patient.id, patient.targetVisits ?? null))
              }
              className="bg-clinic-accent text-white px-4 py-2 rounded-lg shrink-0"
            >
              Сохранить
            </button>
          </div>

          <div className="rounded-xl border border-slate-100 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Призы пациента</h3>

            {patient.rewards.length > 0 ? (
              <ul className="space-y-2">
                {patient.rewards.map((reward) => (
                  <li
                    key={reward.id}
                    className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800">
                        {reward.grantedAt ? "🎁" : "🔒"} {reward.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {REWARD_TRIGGER_LABELS[reward.trigger]}
                        {reward.grantedAt &&
                          ` · получен ${new Date(reward.grantedAt).toLocaleDateString("ru-RU")}`}
                        {reward.sourceLabel && ` · ${reward.sourceLabel}`}
                      </p>
                      {reward.description && (
                        <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                      )}
                    </div>
                    {!reward.grantedAt && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          action(() => doctorApi.deleteReward(patient.id, reward.id))
                        }
                        className="text-xs text-red-600 hover:underline shrink-0"
                      >
                        Удалить
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Призы ещё не назначены</p>
            )}

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block">
                <span className="text-sm font-medium text-gray-600">Название приза</span>
                <input
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  placeholder="Например: Массажный курс"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-600">Описание (необязательно)</span>
                <input
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  placeholder="Детали приза"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-600">Выдать при достижении</span>
                <select
                  value={rewardForm.trigger}
                  onChange={(e) =>
                    setRewardForm({
                      ...rewardForm,
                      trigger: e.target.value as PatientRewardTrigger,
                    })
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
                disabled={busy || !rewardForm.title.trim()}
                onClick={() =>
                  action(async () => {
                    await doctorApi.createReward(patient.id, {
                      title: rewardForm.title.trim(),
                      description: rewardForm.description.trim() || undefined,
                      trigger: rewardForm.trigger,
                    });
                    setRewardForm({ title: "", description: "", trigger: "STAGE_1" });
                  })
                }
                className="w-full bg-clinic-accent text-white py-2 rounded-lg disabled:opacity-50"
              >
                Добавить приз
              </button>
            </div>
          </div>

          {!patient.courseCompleted ? (
            <button
              disabled={busy}
              onClick={() => {
                if (!confirm("Завершить курс и выдать медаль?")) return;
                action(async () => {
                  const result = await doctorApi.completeCourse(patient.id);
                  alert(
                    `Дисциплина: ${result.disciplinePercent}% · Награда: ${result.rewardTier}`
                  );
                });
              }}
              className="w-full border-2 border-clinic-primary text-clinic-primary py-3 rounded-xl font-medium hover:bg-teal-50 transition"
            >
              🏅 Завершить курс
            </button>
          ) : (
            <p className="text-center text-clinic-primary font-medium py-2">
              Курс завершён · {patient.rewardTier}
            </p>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-center">
            <Link 
              to={`/doctor/patients/${patient.id}/visits`} 
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3 rounded-xl font-medium transition w-full text-center"
            >
              Посмотреть историю визитов
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
