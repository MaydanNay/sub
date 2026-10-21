import { genderLabel } from "@restart-clinic/shared";
import type { PatientData } from "../api";

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </dt>
      <dd className="text-base font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function MedcardPage({ data }: { data: PatientData }) {
  return (
    <>
      <header className="bg-clinic-primary text-white px-4 py-5 rounded-b-3xl shadow-lg">
        <h1 className="text-xl font-bold">Медкарта</h1>
        <p className="text-sm mt-1 opacity-90">Электронная карта пациента</p>
      </header>

      <div className="px-4 -mt-2">
        <section className="bg-white rounded-2xl shadow-md p-5 mt-4 border border-slate-100">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-teal-600" fill="none" aria-hidden>
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M4 20c0-4 3.6-6 8-6s8 2 8 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {data.profile.fullName ?? "Пациент"}
              </p>
              <p className="text-sm text-gray-500">
                Этап {data.journey.stage} · {data.journey.stageLabel}
              </p>
            </div>
          </div>

          <dl>
            <InfoRow label="ФИО" value={data.profile.fullName ?? "—"} />
            <InfoRow label="Пол" value={genderLabel(data.profile.gender)} />
            <InfoRow label="Возраст" value={data.profile.age ?? "—"} />
            <InfoRow label="Диагноз" value={data.profile.diagnosis ?? "—"} />
            <InfoRow label="Врач" value={data.profile.doctorName ?? "—"} />
          </dl>
        </section>

        <p className="text-xs text-center text-gray-400 mt-4 px-2">
          Данные вносятся клиникой. Для изменений обратитесь к администратору.
        </p>
      </div>
    </>
  );
}
