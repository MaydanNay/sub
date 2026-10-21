import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doctorApi, type Visit } from "../api";

type Scheduled = { id: string; fullName: string | null; nextVisitAt: string };

export function DoctorCalendarDay() {
  const { date } = useParams<{ date: string }>(); // Format: YYYY-MM-DD
  const [visits, setVisits] = useState<Visit[]>([]);
  const [scheduled, setScheduled] = useState<Scheduled[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"SCHEDULED" | "COMPLETED">("SCHEDULED");

  useEffect(() => {
    doctorApi
      .calendar()
      .then((data) => {
        // Filter by date
        const isSameDate = (dString: string | null) => {
          if (!dString) return false;
          const d = new Date(dString);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}` === date;
        };

        setVisits(data.visits.filter((v) => isSameDate(v.createdAt)));
        setScheduled(data.scheduled.filter((s) => isSameDate(s.nextVisitAt)));
      })
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) return <p>Загрузка...</p>;

  // Format date for display
  const displayDate = date ? new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  }) : '';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/doctor/calendar"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shrink-0"
            title="Назад"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Расписание</h2>
            <p className="text-sm text-gray-500 mt-1">{displayDate}</p>
          </div>
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("SCHEDULED")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${
              activeTab === "SCHEDULED" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Запланировано <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{scheduled.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${
              activeTab === "COMPLETED" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Проведено <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{visits.length}</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "SCHEDULED" && (
          <div>
            {scheduled.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Нет запланированных занятий</p>
            ) : (
               <ul className="space-y-2">
                {scheduled.map(s => (
                  <li key={s.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🕒</span>
                      <span className="font-medium text-gray-800">{s.fullName ?? "Без имени"}</span>
                    </div>
                    <Link to={`/doctor/patients/${s.id}`} className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition">
                      Открыть карточку
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "COMPLETED" && (
          <div>
            {visits.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Нет проведенных занятий</p>
            ) : (
              <ul className="space-y-2">
                {visits.map(v => (
                  <li key={v.id} className="border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:bg-slate-50 transition">
                    <span className="text-xl">✅</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {v.patient?.fullName ?? "Неизвестно"}
                      </div>
                      {v.note && <div className="text-sm text-gray-500 mt-1">{v.note}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
