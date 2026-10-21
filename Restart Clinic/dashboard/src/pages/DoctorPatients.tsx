import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doctorApi, stageLabel, type Patient } from "../api";

export function DoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorApi.patients().then(setPatients).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">Мои пациенты</h2>
      {patients.length === 0 ? (
        <p className="text-gray-500">Нет прикреплённых пациентов</p>
      ) : (
        <div className="grid gap-3">
          {patients.map((p) => (
            <Link
              key={p.id}
              to={`/doctor/patients/${p.id}`}
              className="bg-white rounded-xl p-4 shadow hover:shadow-md transition block"
            >
              <p className="font-medium">{p.fullName ?? "Без имени"}</p>
              <p className="text-sm text-gray-500">
                {stageLabel(p.stage)} · Визитов: {p.visitCount}
                {p.courseCompleted && " · Курс завершён"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
