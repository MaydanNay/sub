export type TabId = "visits" | "journey" | "medcard";

function NavIcon({ id, active }: { id: TabId; active: boolean }) {
  const color = active ? "text-teal-600" : "text-gray-400";

  if (id === "visits") {
    return (
      <svg viewBox="0 0 24 24" className={`w-6 h-6 ${color}`} fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 14h2v2H8z" fill="currentColor" />
      </svg>
    );
  }

  if (id === "journey") {
    return (
      <svg viewBox="0 0 24 24" className={`w-6 h-6 ${color}`} fill="none" aria-hidden>
        <path
          d="M4 12h4l2-6 4 12 2-6h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 ${color}`} fill="none" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BottomNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "visits", label: "Посещения" },
    { id: "journey", label: "Путь героя" },
    { id: "medcard", label: "Медкарта" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-bottom z-10">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 transition-colors ${
                isActive ? "text-teal-600" : "text-gray-400"
              }`}
            >
              <NavIcon id={tab.id} active={isActive} />
              <span className={`text-[11px] leading-tight text-center ${isActive ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
