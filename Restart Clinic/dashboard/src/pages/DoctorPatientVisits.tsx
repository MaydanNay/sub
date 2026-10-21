import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doctorApi, MEDAL_EMOJI, type PatientDetail } from "../api";

export function DoctorPatientVisits() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    doctorApi
      .patient(id)
      .then(setPatient)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !patient) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to={`/doctor/patients/${patient.id}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shrink-0"
          title="Назад"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">История визитов</h2>
          <p className="text-sm text-gray-500 mt-1">{patient.fullName}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          <ul className="space-y-4">
            {patient.visits.map((v, index, arr) => {
              const title = v.title ?? `Посещение №${patient.visitCount - index}`;
              return (
              <li key={v.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <div>
                      <div className="font-medium text-slate-800">{title}</div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        {new Date(v.createdAt).toLocaleString("ru-RU", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {v.note && <div className="text-sm text-slate-600 mt-1">{v.note}</div>}
                      {v.medals && v.medals.length > 0 && (
                        <div className="text-lg mt-1">
                          {v.medals.map((m, i) => (
                            <span key={`${m.tier}-${i}`}>{MEDAL_EMOJI[m.tier]}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
            })}
            {patient.visits.length === 0 && (
              <li className="text-center text-slate-500 py-8">
                Нет проведенных визитов
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
