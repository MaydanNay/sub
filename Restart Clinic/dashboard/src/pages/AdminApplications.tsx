import { useEffect, useState } from "react";
import { adminApi, type Application, type Doctor } from "../api";

export function AdminApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "" as "" | "MALE" | "FEMALE",
    diagnosis: "",
    doctorId: "",
    nextVisitAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([adminApi.applications(), adminApi.doctors()])
      .then(([a, d]) => {
        setApps(a);
        setDoctors(d);
        if (d[0]) setForm((f) => ({ ...f, doctorId: d[0].id }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await adminApi.approve(selected.id, {
        fullName: form.fullName.trim(),
        age: Number(form.age),
        gender: form.gender as "MALE" | "FEMALE",
        diagnosis: form.diagnosis.trim(),
        doctorId: form.doctorId,
        nextVisitAt: new Date(form.nextVisitAt).toISOString(),
      });
      setSelected(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Новые заявки</h2>
      {apps.length === 0 ? (
        <p className="text-gray-500">Нет новых заявок</p>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl p-4 shadow flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  @{app.telegramUsername ?? "без username"} · {app.phone}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(app.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
              <button
                onClick={() => {
                  setForm({
                    fullName: "",
                    age: "",
                    gender: "",
                    diagnosis: "",
                    doctorId: doctors[0]?.id ?? "",
                    nextVisitAt: "",
                  });
                  setSelected(app);
                }}
                className="bg-clinic-primary text-white px-4 py-2 rounded-lg text-sm"
              >
                Открыть доступ
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Карточка пациента</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">ФИО</span>
                <input
                  placeholder="Иванов Иван Иванович"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">Возраст</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="30"
                  value={form.age}
                  onChange={(e) =>
                    setForm({ ...form, age: e.target.value.replace(/\D/g, "") })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">Пол</span>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value as "" | "MALE" | "FEMALE" })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Выберите</option>
                  <option value="MALE">Мужской</option>
                  <option value="FEMALE">Женский</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Диагноз / тип травмы
                </span>
                <input
                  placeholder="Например: разрыв ACL"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Лечащий врач
                </span>
                <select
                  value={form.doctorId}
                  onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">
                  Время первого приёма
                </span>
                <input
                  type="datetime-local"
                  value={form.nextVisitAt}
                  onChange={(e) => setForm({ ...form, nextVisitAt: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 border rounded-lg py-2"
              >
                Отмена
              </button>
              <button
                onClick={approve}
                disabled={
                  submitting ||
                  !form.fullName.trim() ||
                  !form.diagnosis.trim() ||
                  !Number(form.age) ||
                  !form.gender ||
                  !form.doctorId ||
                  !form.nextVisitAt
                }
                className="flex-1 bg-clinic-primary text-white rounded-lg py-2 disabled:opacity-50"
              >
                {submitting ? "..." : "Открыть доступ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
