import { useEffect, useState } from "react";
import type { PatientData } from "../api";
import { resolveMascotImageSrc, resolveMascotPngSrc } from "../lib/mascotImage";



function StageTrack({ stage }: { stage: number }) {
  return (
    <div className="flex items-center gap-1 my-4">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full h-2 rounded-full ${
              s <= stage ? "bg-clinic-accent" : "bg-slate-100"
            }`}
          />
          <span className={`text-xs ${s === stage ? "font-bold text-clinic-dark" : "text-gray-400"}`}>
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

const REWARD_LABELS: Record<string, string> = {
  GOLD: "🥇 Золото",
  SILVER: "🥈 Серебро",
  BRONZE: "🥉 Бронза",
  NONE: "",
};

function MascotAvatar({
  gender,
  imageIndex,
  stage,
}: {
  gender: PatientData["profile"]["gender"];
  imageIndex: number;
  stage: number;
}) {
  const [src, setSrc] = useState(() => resolveMascotImageSrc(gender, imageIndex));
  const useLegacyFilters = gender !== "MALE" && gender !== "FEMALE";

  useEffect(() => {
    setSrc(resolveMascotImageSrc(gender, imageIndex));
  }, [gender, imageIndex]);

  const handleImageError = () => {
    const fallback = resolveMascotPngSrc(gender, imageIndex);
    if (src !== fallback) {
      setSrc(fallback);
    }
  };

  return (
    <div className="relative mx-auto mb-3 w-64 h-64">
      <img
        src={src}
        alt="Ваш персонаж"
        width={256}
        height={256}
        decoding="async"
        fetchPriority="high"
        onError={handleImageError}
        className="relative w-full h-full object-contain drop-shadow-md"
        style={{
          filter: useLegacyFilters
            ? stage === 1
              ? "saturate(0.85) brightness(0.95)"
              : stage === 3
                ? "saturate(1.1) brightness(1.05)"
                : undefined
            : undefined,
        }}
      />
    </div>
  );
}

export function JourneyPage({ data }: { data: PatientData }) {
  return (
    <>
      <header className="bg-clinic-primary text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <h1 className="text-xl font-bold">Путь героя</h1>
        <p className="text-sm mt-1 opacity-90">
          Этап {data.journey.stage}: {data.journey.stageLabel}
        </p>
      </header>

      <div className="px-4 -mt-2">
        <section className="bg-white rounded-2xl shadow-md p-5 mt-4 border border-slate-100">
          <h2 className="font-semibold text-clinic-dark mb-2">Ваш прогресс</h2>
          <StageTrack stage={data.journey.stage} />
        </section>

        <section className="bg-white rounded-2xl shadow-md p-5 mt-4 text-center border border-slate-100">
          <MascotAvatar
            gender={data.profile.gender}
            imageIndex={data.mascot.imageIndex}
            stage={data.journey.stage}
          />

          <div className="mt-6 text-left">
            <div className="flex justify-between text-xs mb-1 text-gray-500">
              <span>Прогресс текущего этапа</span>
              <span className="font-semibold text-clinic-accent">
                {Math.min(
                  100,
                  Math.round(
                    (((data.mascot.stats.endurance +
                      data.mascot.stats.ligaments +
                      data.mascot.stats.balance) /
                      3) /
                      (data.journey.stage === 3 ? 50 : 100)) *
                      100
                  )
                )}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-clinic-accent rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (((data.mascot.stats.endurance +
                        data.mascot.stats.ligaments +
                        data.mascot.stats.balance) /
                        3) /
                        (data.journey.stage === 3 ? 50 : 100)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
            
            <p
              className={`text-sm leading-relaxed ${
                data.journey.warning ? "text-amber-700 bg-amber-50 p-3 rounded-xl" : "text-gray-600"
              }`}
            >
              {data.journey.motivation}
            </p>
          </div>
        </section>

        {data.journey.courseCompleted && data.journey.rewardTier !== "NONE" && (
          <section className="bg-gradient-to-r from-clinic-gold/20 to-clinic-accent/20 rounded-2xl p-5 mt-4 text-center border border-clinic-gold/40">
            <p className="font-bold text-lg">Курс завершён!</p>
            <p className="mt-1">{REWARD_LABELS[data.journey.rewardTier]}</p>
          </section>
        )}

        {(data.rewards ?? []).length > 0 && (
          <section className="bg-white rounded-2xl shadow-md p-5 mt-4 border border-slate-100">
            <h2 className="font-semibold text-clinic-dark mb-3">Призы</h2>
            <ul className="space-y-3">
              {(data.rewards ?? []).map((reward) => (
                <li
                  key={reward.id}
                  className={`rounded-xl p-4 border ${
                    reward.earned
                      ? "bg-amber-50 border-amber-200"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{reward.earned ? "🎁" : "🔒"}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">{reward.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{reward.triggerLabel}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{reward.sourceLabel}</p>
                      {reward.description && (
                        <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                      )}
                      {reward.earned && reward.grantedAt && (
                        <p className="text-xs text-amber-700 mt-1">
                          Получен{" "}
                          {new Date(reward.grantedAt).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
