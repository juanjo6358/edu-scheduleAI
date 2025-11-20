import React from 'react';
import { GeneratedSchedule, Teacher, Subject, DAYS, HOURS, RECREO_INDEX, DayOfWeek } from '../types';
import { AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';

interface ScheduleGridProps {
  scheduleData: GeneratedSchedule | null;
  teachers: Teacher[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  scheduleData,
  teachers,
  subjects,
  isLoading,
  error,
}) => {
  
  // Helper to get content for a specific cell
  const getCellContent = (day: DayOfWeek, hourIndex: number) => {
    if (hourIndex === RECREO_INDEX) return { type: 'recreo', label: 'RECREO' };

    if (!scheduleData) return null;

    const slots = scheduleData.schedule.filter(
      (s) => s.day === day && s.hourIndex === hourIndex
    );

    if (slots.length === 0) return null;

    // Check for overlaps (AI should prevent this, but we visualize it if it happens)
    const isConflict = slots.length > 1;

    return {
      type: isConflict ? 'conflict' : 'class',
      slots: slots.map(slot => {
        const subj = subjects.find(s => s.id === slot.subjectId);
        const teacher = teachers.find(t => t.id === slot.teacherId);
        return { ...slot, subj, teacher };
      })
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Analizando restricciones y generando horario...</p>
        <p className="text-sm text-gray-400 mt-2">La IA está optimizando para evitar solapamientos.</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
            <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-2"/>
            <h3 className="text-lg font-bold text-red-800 mb-1">Error</h3>
            <p className="text-red-600">{error}</p>
        </div>
    )
  }

  if (!scheduleData) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-400">Configura los profesores y asignaturas, luego pulsa "Generar Horario".</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Conflict / Status Banner */}
        {scheduleData.conflicts && scheduleData.conflicts.length > 0 ? (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-amber-800">Notas de la IA:</h3>
                        <ul className="list-disc list-inside text-sm text-amber-700 mt-1">
                            {scheduleData.conflicts.map((c, idx) => <li key={idx}>{c}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center">
                 <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
                 <span className="text-green-800 font-medium">Horario generado con éxito. Sin conflictos detectados.</span>
            </div>
        )}

      {/* The Grid */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="w-full min-w-[800px] border-collapse bg-white">
          <thead>
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                Hora
              </th>
              {DAYS.map((day) => (
                <th key={day} className="p-4 bg-gray-50 border-b border-gray-200 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/5">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {HOURS.map((timeLabel, hIndex) => (
              <tr key={hIndex} className={hIndex === RECREO_INDEX ? 'bg-gray-100/50' : 'hover:bg-gray-50/50'}>
                {/* Time Column */}
                <td className="p-3 text-xs font-medium text-gray-500 border-r border-gray-100 whitespace-nowrap">
                  {timeLabel}
                </td>

                {/* Days Columns */}
                {DAYS.map((day) => {
                  const content = getCellContent(day, hIndex);
                  
                  if (content?.type === 'recreo') {
                    return (
                      <td key={day} className="p-2 bg-gray-100 text-center border-r border-gray-100 last:border-0">
                        <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Recreo</span>
                      </td>
                    );
                  }

                  if (!content) {
                    return <td key={day} className="p-2 border-r border-gray-100 last:border-0"></td>;
                  }

                  if (content.type === 'conflict') {
                     return (
                        <td key={day} className="p-2 border-r border-gray-100 bg-red-50 relative">
                             <div className="text-xs text-red-700 font-bold mb-1 flex items-center justify-center gap-1">
                                <AlertTriangle className="w-3 h-3"/> SOLAPAMIENTO
                             </div>
                             {content.slots.map((slot, idx) => (
                                 <div key={idx} className="mb-1 p-1 bg-red-100 rounded border border-red-200 text-xs">
                                     <div className="font-bold">{slot.subj?.name}</div>
                                     <div>{slot.teacher?.name}</div>
                                 </div>
                             ))}
                        </td>
                     )
                  }

                  // Normal class
                  const slot = content.slots[0];
                  return (
                    <td key={day} className="p-2 border-r border-gray-100 last:border-0 align-top h-24">
                        <div className={`h-full w-full p-2 rounded-lg border shadow-sm transition-transform hover:scale-[1.02] flex flex-col justify-between ${slot.subj?.color || 'bg-gray-100'}`}>
                            <div>
                                <div className="font-bold text-sm leading-tight mb-1 text-gray-900">
                                    {slot.subj?.name}
                                </div>
                                <div className="text-xs text-gray-700 font-medium flex items-center gap-1">
                                    <User className="w-3 h-3 opacity-50" />
                                    {slot.teacher?.name}
                                </div>
                            </div>
                            {/* Optional: Add Room if we had it */}
                        </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Simple helper icon
const User = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);