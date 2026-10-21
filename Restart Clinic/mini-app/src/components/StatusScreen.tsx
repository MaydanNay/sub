type StatusVariant = "waiting" | "auth" | "error";

function resolveVariant(message: string): StatusVariant {
  if (message.includes("не открыт") || message.includes("администратор")) {
    return "waiting";
  }
  if (
    message.includes("бот") ||
    message.includes("авториза") ||
    message.includes("Telegram") ||
    message.includes("/start")
  ) {
    return "auth";
  }
  return "error";
}

function StatusIcon({ variant }: { variant: StatusVariant }) {
  if (variant === "waiting") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden>
        <circle cx="32" cy="32" r="30" className="fill-teal-50 stroke-teal-200" strokeWidth="2" />
        <path
          d="M32 18v16l10 6"
          className="stroke-teal-600"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="32" r="3" className="fill-teal-600" />
      </svg>
    );
  }

  if (variant === "auth") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden>
        <circle cx="32" cy="32" r="30" className="fill-amber-50 stroke-amber-200" strokeWidth="2" />
        <rect
          x="22"
          y="28"
          width="20"
          height="16"
          rx="3"
          className="stroke-amber-600"
          strokeWidth="2"
        />
        <path
          d="M26 28v-4a6 6 0 0 1 12 0v4"
          className="stroke-amber-600"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="32" cy="36" r="2" className="fill-amber-600" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden>
      <circle cx="32" cy="32" r="30" className="fill-slate-50 stroke-slate-200" strokeWidth="2" />
      <path
        d="M32 20v18M32 44h.01"
        className="stroke-slate-500"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 animate-spin" aria-hidden>
      <circle
        cx="32"
        cy="32"
        r="26"
        className="stroke-teal-100"
        strokeWidth="4"
      />
      <path
        d="M32 6a26 26 0 0 1 26 26"
        className="stroke-teal-600"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LoadingScreen() {
  return (
    <div className="app-shell bg-gradient-to-b from-white to-teal-50/80 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <LoadingIcon />
        <p className="text-sm font-medium text-teal-800/70">Загрузка...</p>
      </div>
    </div>
  );
}

function getCopy(message: string, variant: StatusVariant) {
  if (variant === "waiting") {
    return {
      title: "Заявка принята",
      subtitle: "Администратор откроет доступ после оформления в клинике",
    };
  }
  if (variant === "auth") {
    return {
      title: message,
      subtitle: "Откройте приложение через кнопку в чате с ботом",
    };
  }
  return {
    title: message,
    subtitle: "Попробуйте обновить или напишите /start боту",
  };
}

export function StatusScreen({ message }: { message: string }) {
  const variant = resolveVariant(message);
  const { title, subtitle } = getCopy(message, variant);

  const badge =
    variant === "waiting" ? "Ожидание доступа" : variant === "auth" ? "Нужен вход" : "Внимание";

  return (
    <div className="app-shell bg-gradient-to-b from-white via-teal-50/40 to-teal-100/30">
      <main className="app-scroll flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg shadow-teal-900/5 border border-teal-100/80 px-6 py-8 text-center my-auto">
          <div className="flex flex-col items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-50/80">
              <StatusIcon variant={variant} />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-teal-100 text-teal-700">
              {badge}
            </span>
          </div>

          <h1 className="text-lg font-semibold text-slate-800 leading-snug mb-2">{title}</h1>

          <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>

          {variant === "waiting" && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
