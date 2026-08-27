import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { getEventsForDate } from '../utils/anniversaryCalculator';
import { Game } from '../types';

interface CalendarViewProps {
  games: Game[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ games }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // カレンダーのグリッドを生成 (日曜始まり)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            ゲームカレンダー
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-blue-600 hover:shadow-sm"
              aria-label="前月"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="px-4 font-semibold text-lg min-w-[120px] text-center">
              {format(currentMonth, 'yyyy年 MM月')}
            </span>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-blue-600 hover:shadow-sm"
              aria-label="翌月"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <button 
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            今日
          </button>
        </div>
      </header>

      {/* カレンダー本体 */}
      <main className="flex-1 p-4 md:p-6 mx-auto w-full max-w-7xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
            {weekDays.map((day, index) => (
              <div 
                key={day} 
                className={`py-3 text-center text-sm font-semibold 
                  ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px border-b border-l border-r border-gray-200">
            {calendarDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const events = getEventsForDate(day, games);
              const today = isToday(day);

              return (
                <div 
                  key={day.toISOString()} 
                  className={`min-h-[120px] p-2 bg-white transition-colors
                    ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'text-gray-700 hover:bg-blue-50/30'}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`
                      flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full
                      ${today ? 'bg-blue-600 text-white shadow-sm' : ''}
                      ${!today && day.getDay() === 0 ? 'text-red-500' : ''}
                      ${!today && day.getDay() === 6 ? 'text-blue-500' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    {events.map((event, idx) => (
                      <div 
                        key={`${event.gameId}-${idx}`}
                        className={`
                          px-2 py-1.5 text-xs font-semibold rounded-md shadow-sm border
                          ${event.type === 'anniversary' 
                            ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200' 
                            : 'bg-gradient-to-r from-sky-100 to-blue-100 text-blue-800 border-blue-200'}
                          truncate transition-transform hover:scale-[1.02] cursor-default
                        `}
                        title={event.label}
                      >
                        {event.label}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarView;
