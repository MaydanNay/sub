import { useEffect, useState } from "react";
import { doctorApi, type Visit } from "../api";
import { Link } from "react-router-dom";

type Scheduled = { id: string; fullName: string | null; nextVisitAt: string };

export function DoctorCalendar() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [scheduled, setScheduled] = useState<Scheduled[]>([]);
  const [loading, setLoading] = useState(true);

  // Current month state
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    doctorApi
      .calendar()
      .then((data) => {
        setVisits(data.visits);
        setScheduled(data.scheduled);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка...</p>;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Convert Sunday = 0 to Monday = 0
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: startOffset }, (_, i) => null);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Календарь занятий</h2>
        <div className="flex items-center gap-4 bg-white rounded-lg shadow px-2 py-1">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded text-gray-600">
            &larr;
          </button>
          <span className="font-medium w-32 text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded text-gray-600">
            &rarr;
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-gray-50 text-sm font-medium text-gray-500">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
            <div key={day} className="p-3 text-center border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)]">
          {padding.map((_, i) => (
            <div key={`pad-${i}`} className="border-r border-b bg-gray-50/50 p-2" />
          ))}
          
          {days.map((day) => {
            // Find items for this day
            const dayVisits = visits.filter((v) => {
              if (!v.createdAt) return false;
              const d = new Date(v.createdAt);
              return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
            });
            const dayScheduled = scheduled.filter((s) => {
              if (!s.nextVisitAt) return false;
              const d = new Date(s.nextVisitAt);
              return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
            });
            
            const now = new Date();
            const isToday = now.getFullYear() === currentYear && now.getMonth() === currentMonth && now.getDate() === day;
            
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            return (
              <Link 
                to={`/doctor/calendar/${dateStr}`}
                key={day} 
                className={`border-r border-b p-2 flex flex-col gap-1 transition hover:bg-gray-100 ${isToday ? 'bg-blue-50/30' : ''}`}
              >
                <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-clinic-primary text-white' : 'text-gray-700'}`}>
                  {day}
                </span>
                
                <div className="flex flex-col gap-1 mt-1">
                  {dayScheduled.length > 0 && (
                    <div className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 font-medium text-center">
                      Запланировано: {dayScheduled.length}
                    </div>
                  )}
                  {dayVisits.length > 0 && (
                    <div className="text-xs bg-green-100 text-green-800 rounded px-2 py-1 font-medium text-center">
                      Проведено: {dayVisits.length}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 flex gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-100 rounded-sm inline-block"></span>
          <span>Запланировано</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-100 rounded-sm inline-block"></span>
          <span>Проведено</span>
        </div>
      </div>
    </div>
  );
}
