import { useEffect, useState } from "react";
import { adminApi, type Doctor } from "../api";

export function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    adminApi
      .doctors()
      .then(setDoctors)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email) return;

    setSubmitting(true);
    setError(null);
    try {
      await adminApi.createDoctor({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      setIsModalOpen(false);
      setForm({ fullName: "", email: "", password: "" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Врачи клиники</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-clinic-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-clinic-primary/90 transition"
        >
          Добавить врача
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">ФИО</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-right">Количество занятий</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-3 font-medium">{d.fullName}</td>
                <td className="p-3 text-gray-500">{d.email}</td>
                <td className="p-3 text-right">{d.visitCount ?? 0}</td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-gray-500">
                  Нет врачей
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Добавить врача</h3>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">ФИО</span>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">Email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">Пароль</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Минимум 8 символов"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </label>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border rounded-lg py-2"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.fullName || !form.email}
                  className="flex-1 bg-clinic-primary text-white rounded-lg py-2 disabled:opacity-50"
                >
                  {submitting ? "..." : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
