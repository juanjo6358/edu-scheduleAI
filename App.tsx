import React, { useState, useEffect } from 'react';
import { DataInput } from './components/DataInput';
import { ScheduleGrid } from './components/ScheduleGrid';
import { Teacher, Subject, GeneratedSchedule, Level, Course, SchoolData } from './types';
import { generateSmartSchedule } from './services/geminiService';
import { saveSchoolData, loadSchoolData } from './services/firebase';
import { CalendarClock, Sparkles, RefreshCw, Save, Cloud } from 'lucide-react';

function App() {
  // --- STATE ---
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Schedule State
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'schedule'>('input');
  
  // Firebase Status
  const [isSaving, setIsSaving] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadData = async () => {
      const data = await loadSchoolData();
      if (data) {
        setLevels(data.levels || []);
        setCourses(data.courses || []);
        setTeachers(data.teachers || []);
        setSubjects(data.subjects || []);
      } else {
        // Load defaults only if DB is empty
        const defaultLevelId = 'l1';
        const defaultCourseId = 'c1';
        const defaultTeacherId = 't1';
        
        setLevels([{ id: defaultLevelId, name: 'Primaria' }]);
        setCourses([{ id: defaultCourseId, name: '1º A', levelId: defaultLevelId }]);
        setTeachers([
            { id: defaultTeacherId, name: 'Ana García', specialty: 'General' },
            { id: 't2', name: 'Carlos Ruiz', specialty: 'Inglés' }
        ]);
        setSubjects([
            { id: 's1', name: 'Matemáticas', teacherId: defaultTeacherId, courseId: defaultCourseId, hoursPerWeek: 4, color: 'bg-blue-100 border-blue-200 text-blue-800' },
            { id: 's2', name: 'Inglés', teacherId: 't2', courseId: defaultCourseId, hoursPerWeek: 3, color: 'bg-red-100 border-red-200 text-red-800' }
        ]);
      }
    };
    loadData();
  }, []);

  // --- SAVE HANDLER ---
  const handleSave = async () => {
      setIsSaving(true);
      const data: SchoolData = { levels, courses, teachers, subjects };
      try {
        await saveSchoolData(data);
      } catch (e) {
          console.error(e);
          alert("Error guardando en la base de datos. Revisa la consola.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleGenerate = async () => {
    if (teachers.length === 0 || subjects.length === 0 || courses.length === 0) {
      alert("Por favor asegura que hay Cursos, Profesores y Asignaturas definidos.");
      return;
    }

    // Auto-save before generating
    handleSave();

    setIsLoading(true);
    setError(null);
    setActiveTab('schedule');

    try {
      // We pass courses so the AI knows the groups to avoid overlapping
      const result = await generateSmartSchedule(teachers, subjects, courses);
      setSchedule(result);
    } catch (err) {
      setError("Hubo un error al conectar con la IA. Verifica tu API Key o intenta de nuevo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
               <CalendarClock className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                EduSchedule AI
                </h1>
                <p className="text-xs text-gray-400">Planificador Escolar Inteligente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={handleSave}
                className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                disabled={isSaving}
             >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Cloud className="w-4 h-4"/>}
                {isSaving ? "Guardando..." : "Guardar Cambios"}
             </button>
             <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
             <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button 
                onClick={() => setActiveTab('input')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'input' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                }`}
                >
                Configuración
                </button>
                <button 
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'schedule' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                }`}
                >
                Horario Generado
                </button>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Content */}
        {activeTab === 'input' && (
            <div className="space-y-8 animate-fade-in">
                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-indigo-900">1. Define la estructura académica</h2>
                        <p className="text-indigo-700/80 text-sm mt-1">
                           Crea Niveles, Cursos, Profesores y Asignaturas. La IA cruzará estos datos para evitar conflictos.
                        </p>
                    </div>
                    <button 
                        onClick={handleGenerate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 font-semibold flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
                    >
                        <Sparkles className="w-5 h-5" />
                        Generar Horario
                    </button>
                </div>
                
                <DataInput 
                    levels={levels} setLevels={setLevels}
                    courses={courses} setCourses={setCourses}
                    teachers={teachers} setTeachers={setTeachers}
                    subjects={subjects} setSubjects={setSubjects}
                />
            </div>
        )}

        {activeTab === 'schedule' && (
            <div className="animate-fade-in">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Vista Global del Horario</h2>
                        <p className="text-gray-500 text-sm">Mostrando todas las clases generadas para todos los cursos.</p>
                    </div>
                    {!isLoading && schedule && (
                        <button 
                            onClick={handleGenerate}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-2 bg-white px-4 py-2 rounded-lg border hover:bg-gray-50 shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Regenerar Distribución
                        </button>
                    )}
                </div>
                
                <ScheduleGrid 
                    scheduleData={schedule} 
                    teachers={teachers} 
                    subjects={subjects}
                    isLoading={isLoading}
                    error={error}
                />
            </div>
        )}

      </main>
    </div>
  );
}

export default App;