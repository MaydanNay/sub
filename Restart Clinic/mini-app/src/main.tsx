import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { fetchPatientData, type PatientData } from "./api";
import { LoadingScreen, StatusScreen } from "./components/StatusScreen";
import { preloadMascotImage, prefetchNextMascotImage } from "./lib/mascotImage";

function Root() {
  const [data, setData] = useState<PatientData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setError("Откройте через Telegram-бот Restart Clinic");
      setLoading(false);
      return;
    }

    tg.ready();
    tg.expand();
    tg.disableVerticalSwipes?.();
    tg.setHeaderColor?.("#FFFFFF");
    tg.setBackgroundColor?.("#FFFFFF");

    if (!tg.initData) {
      setError("Нет данных авторизации. Откройте через кнопку «app» в боте.");
      setLoading(false);
      return;
    }

    fetchPatientData()
      .then(async (patient) => {
        await preloadMascotImage(patient.profile.gender, patient.mascot.imageIndex);
        prefetchNextMascotImage(patient.profile.gender, patient.mascot.imageIndex);
        setData(patient);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <StatusScreen message={error} />;
  return data ? <App data={data} /> : null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
