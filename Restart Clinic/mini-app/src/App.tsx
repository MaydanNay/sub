import { useState } from "react";
import type { PatientData } from "./api";
import { BottomNav, type TabId } from "./components/BottomNav";
import { JourneyPage } from "./pages/JourneyPage";
import { MedcardPage } from "./pages/MedcardPage";
import { VisitsPage } from "./pages/VisitsPage";

function Page({ tab, data }: { tab: TabId; data: PatientData }) {
  switch (tab) {
    case "visits":
      return <VisitsPage data={data} />;
    case "medcard":
      return <MedcardPage data={data} />;
    default:
      return <JourneyPage data={data} />;
  }
}

export function App({ data }: { data: PatientData }) {
  const [tab, setTab] = useState<TabId>("journey");

  return (
    <div className="app-shell">
      <main className="app-scroll">
        <div className="pb-24">
          <Page tab={tab} data={data} />
        </div>
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
