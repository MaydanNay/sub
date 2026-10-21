import { useEffect, useRef, useState } from "react";
import { adminApi, genderLabel, stageLabel, type Doctor, type Patient } from "../api";
import { AdminPatientRewardsModal } from "./AdminPatientRewardsModal";

function RowMenu({
  patient,
  onPin,
  onEdit,
  onRewards,
  onDelete,
}: {
  patient: Patient;
  onPin: () => void;
  onEdit: () => void;
  onRewards: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        aria-label="Меню"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onPin();
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            {patient.isPinned ? "Открепить" : "Закрепить"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            Редактировать
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onRewards();
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            Призы
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [rewardsPatient, setRewardsPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "" as "" | "MALE" | "FEMALE",
    diagnosis: "",
    doctorId: "",
    nextVisitAt: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([adminApi.patients(), adminApi.doctors()])
      .then(([p, d]) => {
        setPatients(p);
        setDoctors(d);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openEdit = (patient: Patient) => {
    setForm({
      fullName: patient.fullName ?? "",
      age: patient.age != null ? String(patient.age) : "",
      gender: patient.gender ?? "",
      diagnosis: patient.diagnosis ?? "",
      doctorId: patient.doctor?.id ?? doctors[0]?.id ?? "",
      nextVisitAt: patient.nextVisitAt
        ? new Date(patient.nextVisitAt).toISOString().slice(0, 16)
        : "",
    });
    setEditing(patient);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSubmitting(true);
    try {
      await adminApi.updatePatient(editing.id, {
        fullName: form.fullName,
        age: Number(form.age),
        gender: form.gender ? (form.gender as "MALE" | "FEMALE") : undefined,
        diagnosis: form.diagnosis,
        doctorId: form.doctorId,
        nextVisitAt: form.nextVisitAt
          ? new Date(form.nextVisitAt).toISOString()
          : null,
      });
      setEditing(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePin = async (patient: Patient) => {
    try {
      await adminApi.pinPatient(patient.id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const remove = async (patient: Patient) => {
    if (!confirm(`Удалить пациента ${patient.fullName ?? ""}?`)) return;
    try {
      await adminApi.deletePatient(patient.id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    }
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">База пациентов</h2>
      <div className="bg-white rounded-xl shadow overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 w-8" />
              <th className="p-3">ФИО</th>
              <th className="p-3">Пол</th>
              <th className="p-3">Телефон</th>
              <th className="p-3">Врач</th>
              <th className="p-3">Приём</th>
              <th className="p-3">Этап</th>
              <th className="p-3">Доступ</th>
              <th className="p-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 text-center">
                  {p.isPinned && (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-teal-600 inline" fill="currentColor" aria-hidden>
                      <path d="M16 3H8l-1 5H3v2h4l2 10h6l2-10h4V8h-4l-1-5z" />
                    </svg>
                  )}
                </td>
                <td className="p-3 font-medium">{p.fullName ?? "—"}</td>
                <td className="p-3">{genderLabel(p.gender)}</td>
                <td className="p-3">{p.phone ?? "—"}</td>
                <td className="p-3">{p.doctor?.fullName ?? "—"}</td>
                <td className="p-3">
                  {p.nextVisitAt
                    ? new Date(p.nextVisitAt).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td className="p-3">{stageLabel(p.stage)}</td>
                <td className="p-3">{p.hasAppAccess ? "✅" : "🔒"}</td>
                <td className="p-3">
                  <RowMenu
                    patient={p}
                    onPin={() => togglePin(p)}
                    onEdit={() => openEdit(p)}
                    onRewards={() => setRewardsPatient(p)}
                    onDelete={() => remove(p)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Редактировать пациента</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">ФИО</span>
                <input
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
                  <option value="">Не указан</option>
                  <option value="MALE">Мужской</option>
                  <option value="FEMALE">Женский</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">Диагноз</span>
                <input
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">Врач</span>
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
                  Время приёма
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
                onClick={() => setEditing(null)}
                className="flex-1 border rounded-lg py-2"
              >
                Отмена
              </button>
              <button
                onClick={saveEdit}
                disabled={submitting || !form.fullName}
                className="flex-1 bg-clinic-primary text-white rounded-lg py-2 disabled:opacity-50"
              >
                {submitting ? "..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rewardsPatient && (
        <AdminPatientRewardsModal
          patient={rewardsPatient}
          doctors={doctors}
          onClose={() => setRewardsPatient(null)}
        />
      )}
    </div>
  );
}
