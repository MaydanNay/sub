import type { PatientData } from "../api";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VisitsPage({ data }: { data: PatientData }) {
  const {
    completed,
    scheduled,
    targetVisits,
    nextVisitAt,
    history,
    courseTotal,
    medalQuotas,
    medalUsed,
  } = data.visits;
  const denominator = targetVisits ?? scheduled;
  const discipline =
    denominator > 0 ? Math.min(100, Math.round((completed / denominator) * 100)) : 0;

  const medalTotal = medalQuotas.BRONZE + medalQuotas.SILVER + medalQuotas.GOLD;
  const earnedTotal = medalUsed.BRONZE + medalUsed.SILVER + medalUsed.GOLD;

  return (
    <>
      <header className="bg-clinic-primary text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <h1 className="text-xl font-bold">Посещения</h1>
        <p className="text-sm mt-1 opacity-90">История и ближайшие записи</p>
      </header>

      <div className="px-4 -mt-2 space-y-4 mt-4">
        <section className="bg-white rounded-2xl shadow-md p-5 border border-slate-100">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-sm text-gray-500">Пройдено / назначено</p>
              <p className="text-2xl font-bold text-clinic-dark">
                {completed} <span className="text-gray-400 font-normal text-lg">/ {denominator}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Дисциплина</p>
              <p className="text-2xl font-bold text-teal-600">{discipline}%</p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-clinic-accent rounded-full transition-all"
              style={{ width: `${discipline}%` }}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-5 border border-slate-100">
          <div className="flex justify-between items-end mb-2">
            <p className="text-sm font-medium text-gray-700">Медали курса</p>
            <p className="text-xs text-gray-500">{courseTotal} визитов = 100%</p>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex mb-3">
            <div
              className="bg-amber-700/80"
              style={{ width: `${medalTotal ? (medalQuotas.BRONZE / medalTotal) * 100 : 30}%` }}
            />
            <div
              className="bg-slate-400"
              style={{ width: `${medalTotal ? (medalQuotas.SILVER / medalTotal) * 100 : 30}%` }}
            />
            <div
              className="bg-yellow-500"
              style={{ width: `${medalTotal ? (medalQuotas.GOLD / medalTotal) * 100 : 40}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-amber-50 py-2">
              <p>🥉 {medalUsed.BRONZE}/{medalQuotas.BRONZE}</p>
              <p className="text-xs text-gray-500">30%</p>
            </div>
            <div className="rounded-lg bg-slate-50 py-2">
              <p>🥈 {medalUsed.SILVER}/{medalQuotas.SILVER}</p>
              <p className="text-xs text-gray-500">30%</p>
            </div>
            <div className="rounded-lg bg-yellow-50 py-2">
              <p>🥇 {medalUsed.GOLD}/{medalQuotas.GOLD}</p>
              <p className="text-xs text-gray-500">40%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Получено {earnedTotal} из {medalTotal} медалей
          </p>
        </section>

        {nextVisitAt && (
          <section className="bg-teal-50 rounded-2xl p-4 border border-teal-100 flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-teal-600" fill="none" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">
                Следующий визит
              </p>
              <p className="font-semibold text-slate-800 mt-0.5">{formatDate(nextVisitAt)}</p>
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          <h2 className="font-semibold text-clinic-dark px-5 pt-5 pb-3">История</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 px-5 pb-5">Пока нет отмеченных визитов</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {history.map((visit) => {
                const displayMedals =
                  visit.medals.length > 0
                    ? visit.medals
                    : [{ tier: visit.slotMedal.tier, emoji: visit.slotMedal.emoji }];
                const isEarned = visit.earned;

                return (
                <li key={visit.id} className="px-5 py-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">{visit.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(visit.date)}</p>
                    {visit.note && (
                      <p className="text-sm text-gray-500 mt-0.5">{visit.note}</p>
                    )}
                  </div>
                  <div
                    className={`text-2xl leading-none shrink-0 pl-2 ${isEarned ? "" : "opacity-35"}`}
                    title={isEarned ? "Медаль получена" : "Медаль этого посещения"}
                  >
                    {displayMedals.map((m, i) => (
                      <span key={`${m.tier}-${i}`}>{m.emoji}</span>
                    ))}
                  </div>
                </li>
              );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
