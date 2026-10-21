import { useEffect, useState } from "react";
import { adminApi, type PushNotification } from "../api";

type PushType = "NIGHTMARE" | "MOTIVATIONAL" | "SYSTEM";

const TABS: { id: PushType; label: string; desc: string }[] = [
  { id: "NIGHTMARE", label: "Кошмарики", desc: "Случайные пуши для пациентов, которые долго не были на занятиях." },
  { id: "MOTIVATIONAL", label: "Мотивирующие", desc: "Подбадривающие уведомления за достижения и прогресс." },
  { id: "SYSTEM", label: "Системные", desc: "Общие уведомления (напоминания о записи, системные события)." },
];

export function AdminPushNotifications() {
  const [messages, setMessages] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<PushType>("NIGHTMARE");

  const load = () => {
    adminApi.pushNotifications()
      .then(setMessages)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setSubmitting(true);
    try {
      await adminApi.createPushNotification(text.trim(), activeTab);
      setText("");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить это уведомление?")) return;
    
    try {
      await adminApi.deletePushNotification(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Загрузка...</div>;
  }

  const activeMessages = messages.filter(m => m.type === activeTab);
  const currentTabInfo = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Пуш уведомления</h2>
          <p className="text-sm text-gray-500 mt-1">
            Настройте тексты для автоматических рассылок Telegram бота.
          </p>
        </div>
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeTab === tab.id ? "bg-white text-clinic-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
          <p className="text-sm text-blue-800">{currentTabInfo.desc}</p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
          <input
            type="text"
            className="flex-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-clinic-primary outline-none"
            placeholder={`Введите новое сообщение для раздела "${currentTabInfo.label}"...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="bg-clinic-primary text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 hover:bg-clinic-dark transition"
          >
            Добавить
          </button>
        </form>

        <h3 className="font-semibold text-slate-700 mb-4">Существующие шаблоны ({activeMessages.length})</h3>
        
        {activeMessages.length === 0 ? (
          <p className="text-gray-500 text-sm">Список пуст. Добавьте хотя бы один шаблон в этот раздел.</p>
        ) : (
          <ul className="space-y-3">
            {activeMessages.map((m) => (
              <li key={m.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-800">{m.text}</span>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-red-500 hover:text-red-700 p-2 shrink-0 ml-4"
                  title="Удалить"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
