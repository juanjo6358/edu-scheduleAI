import React, { useState } from 'react';
import { Teacher, Subject, Level, Course } from '../types';
import { Trash2, Plus, User, BookOpen, Pencil, Check, X, Layers, GraduationCap } from 'lucide-react';

interface DataInputProps {
  levels: Level[];
  setLevels: React.Dispatch<React.SetStateAction<Level[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}

export const DataInput: React.FC<DataInputProps> = ({
  levels, setLevels,
  courses, setCourses,
  teachers, setTeachers,
  subjects, setSubjects,
}) => {
  // --- LEVELS STATE ---
  const [newLevelName, setNewLevelName] = useState('');

  // --- COURSES STATE ---
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedLevelIdForCourse, setSelectedLevelIdForCourse] = useState('');

  // --- TEACHERS STATE ---
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSpec, setNewTeacherSpec] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherSpec, setEditTeacherSpec] = useState('');

  // --- SUBJECTS STATE ---
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectHours, setNewSubjectHours] = useState(3);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(''); // Subject belongs to a course
  
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectHours, setEditSubjectHours] = useState(0);
  const [editSubjectTeacherId, setEditSubjectTeacherId] = useState('');
  const [editSubjectCourseId, setEditSubjectCourseId] = useState('');

  const colors = [
    'bg-red-100 border-red-200 text-red-800',
    'bg-blue-100 border-blue-200 text-blue-800',
    'bg-green-100 border-green-200 text-green-800',
    'bg-yellow-100 border-yellow-200 text-yellow-800',
    'bg-purple-100 border-purple-200 text-purple-800',
    'bg-pink-100 border-pink-200 text-pink-800',
    'bg-indigo-100 border-indigo-200 text-indigo-800',
    'bg-orange-100 border-orange-200 text-orange-800',
  ];

  // --- LEVEL ACTIONS ---
  const addLevel = () => {
    if (!newLevelName) return;
    const newLevel: Level = { id: Math.random().toString(36).substr(2, 9), name: newLevelName };
    setLevels([...levels, newLevel]);
    setNewLevelName('');
    if (!selectedLevelIdForCourse) setSelectedLevelIdForCourse(newLevel.id);
  };

  const removeLevel = (id: string) => {
    setLevels(levels.filter(l => l.id !== id));
    // Cleanup courses in this level
    const coursesToRemove = courses.filter(c => c.levelId === id).map(c => c.id);
    setCourses(courses.filter(c => c.levelId !== id));
    setSubjects(subjects.filter(s => !coursesToRemove.includes(s.courseId)));
  };

  // --- COURSE ACTIONS ---
  const addCourse = () => {
    if (!newCourseName || !selectedLevelIdForCourse) return;
    const newCourse: Course = { 
      id: Math.random().toString(36).substr(2, 9), 
      name: newCourseName, 
      levelId: selectedLevelIdForCourse 
    };
    setCourses([...courses, newCourse]);
    setNewCourseName('');
    if (!selectedCourseId) setSelectedCourseId(newCourse.id);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    setSubjects(subjects.filter(s => s.courseId !== id));
  };

  // --- TEACHER ACTIONS ---
  const addTeacher = () => {
    if (!newTeacherName) return;
    const newTeacher: Teacher = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeacherName,
      specialty: newTeacherSpec || 'General',
    };
    setTeachers([...teachers, newTeacher]);
    setNewTeacherName('');
    setNewTeacherSpec('');
    if (!selectedTeacherId) setSelectedTeacherId(newTeacher.id);
  };

  const removeTeacher = (id: string) => {
    setTeachers(teachers.filter((t) => t.id !== id));
    // Optional: Warn about subjects losing teacher
  };

  const startEditingTeacher = (teacher: Teacher) => {
    setEditingTeacherId(teacher.id);
    setEditTeacherName(teacher.name);
    setEditTeacherSpec(teacher.specialty);
  };

  const saveTeacher = () => {
    if (!editingTeacherId || !editTeacherName) return;
    setTeachers(teachers.map(t => 
      t.id === editingTeacherId ? { ...t, name: editTeacherName, specialty: editTeacherSpec } : t
    ));
    setEditingTeacherId(null);
  };

  // --- SUBJECT ACTIONS ---
  const addSubject = () => {
    if (!newSubjectName || !selectedTeacherId || !selectedCourseId) return;
    const color = colors[subjects.length % colors.length];
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSubjectName,
      teacherId: selectedTeacherId,
      courseId: selectedCourseId,
      hoursPerWeek: newSubjectHours,
      color,
    };
    setSubjects([...subjects, newSubject]);
    setNewSubjectName('');
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const startEditingSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setEditSubjectName(subject.name);
    setEditSubjectHours(subject.hoursPerWeek);
    setEditSubjectTeacherId(subject.teacherId);
    setEditSubjectCourseId(subject.courseId);
  };

  const saveSubject = () => {
    if (!editingSubjectId || !editSubjectName || !editSubjectTeacherId || !editSubjectCourseId) return;
    setSubjects(subjects.map(s => 
      s.id === editingSubjectId 
        ? { ...s, name: editSubjectName, hoursPerWeek: editSubjectHours, teacherId: editSubjectTeacherId, courseId: editSubjectCourseId }
        : s
    ));
    setEditingSubjectId(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Row: Levels and Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. LEVELS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                <Layers className="mr-2 w-5 h-5 text-indigo-600" />
                1. Niveles Educativos
            </h2>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Ej. Primaria"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newLevelName}
                    onChange={(e) => setNewLevelName(e.target.value)}
                />
                <button onClick={addLevel} disabled={!newLevelName} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {levels.map(l => (
                    <div key={l.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                        <span className="font-medium">{l.name}</span>
                        <button onClick={() => removeLevel(l.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                    </div>
                ))}
                {levels.length === 0 && <p className="text-gray-400 text-sm italic">Añade un nivel (Ej: Primaria).</p>}
            </div>
        </div>

        {/* 2. COURSES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                <GraduationCap className="mr-2 w-5 h-5 text-indigo-600" />
                2. Cursos / Grupos
            </h2>
            <div className="flex gap-2 mb-4">
                <select 
                    className="w-1/3 p-2 border rounded-lg bg-white"
                    value={selectedLevelIdForCourse}
                    onChange={(e) => setSelectedLevelIdForCourse(e.target.value)}
                >
                    <option value="" disabled>Nivel...</option>
                    {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <input
                    type="text"
                    placeholder="Ej. 1º A"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                />
                <button onClick={addCourse} disabled={!newCourseName || !selectedLevelIdForCourse} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {courses.map(c => {
                    const level = levels.find(l => l.id === c.levelId);
                    return (
                        <div key={c.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                            <div>
                                <span className="font-medium">{c.name}</span>
                                <span className="text-xs text-gray-500 ml-2">({level?.name})</span>
                            </div>
                            <button onClick={() => removeCourse(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    )
                })}
                 {courses.length === 0 && <p className="text-gray-400 text-sm italic">Añade cursos a los niveles.</p>}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. TEACHERS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <User className="mr-2 w-5 h-5 text-indigo-600" />
            3. Profesores
          </h2>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Nombre"
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Especialidad"
              className="w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newTeacherSpec}
              onChange={(e) => setNewTeacherSpec(e.target.value)}
            />
            <button
              onClick={addTeacher}
              disabled={!newTeacherName}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {teachers.map((t) => (
              <div key={t.id} className="p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition border border-transparent hover:border-gray-200">
                {editingTeacherId === t.id ? (
                  <div className="flex items-center gap-2">
                    <input className="flex-1 p-1 border rounded text-sm" value={editTeacherName} onChange={e => setEditTeacherName(e.target.value)} />
                    <input className="w-1/3 p-1 border rounded text-sm" value={editTeacherSpec} onChange={e => setEditTeacherSpec(e.target.value)} />
                    <button onClick={saveTeacher} className="text-green-600"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingTeacherId(null)} className="text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditingTeacher(t)} className="text-gray-400 hover:text-indigo-600 p-1"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => removeTeacher(t.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
             {teachers.length === 0 && <p className="text-gray-400 text-sm italic">Define el claustro de profesores.</p>}
          </div>
        </div>

        {/* 4. SUBJECTS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <BookOpen className="mr-2 w-5 h-5 text-indigo-600" />
            4. Asignaturas
          </h2>

          <div className="flex flex-col gap-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-2">
              <select
                className="w-1/2 p-2 border rounded-lg bg-white text-sm"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="" disabled>Curso...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input
                type="text"
                placeholder="Materia (ej. Lengua)"
                className="flex-1 p-2 border rounded-lg text-sm"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
               <select
                className="flex-1 p-2 border rounded-lg bg-white text-sm"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
              >
                <option value="" disabled>Profesor...</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
               <span className="text-xs font-semibold text-gray-500">Horas:</span>
               <input
                  type="number" min="1" max="10"
                  className="w-12 p-2 border rounded-lg text-sm"
                  value={newSubjectHours}
                  onChange={(e) => setNewSubjectHours(parseInt(e.target.value))}
               />
               <button
                onClick={addSubject}
                disabled={!newSubjectName || !selectedTeacherId || !selectedCourseId}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {subjects.map((s) => {
              const teacher = teachers.find(t => t.id === s.teacherId);
              const course = courses.find(c => c.id === s.courseId);
              
              if (editingSubjectId === s.id) {
                return (
                   <div key={s.id} className="p-3 rounded-lg border bg-white shadow-sm flex flex-col gap-2">
                      <input className="w-full p-1 border text-sm" value={editSubjectName} onChange={e => setEditSubjectName(e.target.value)} />
                      <div className="flex gap-2">
                          <select className="flex-1 p-1 border text-sm" value={editSubjectCourseId} onChange={e => setEditSubjectCourseId(e.target.value)}>
                              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <select className="flex-1 p-1 border text-sm" value={editSubjectTeacherId} onChange={e => setEditSubjectTeacherId(e.target.value)}>
                              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <input type="number" className="w-10 p-1 border text-sm" value={editSubjectHours} onChange={e => setEditSubjectHours(parseInt(e.target.value))} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={saveSubject} className="text-green-600"><Check className="w-4 h-4"/></button>
                        <button onClick={() => setEditingSubjectId(null)} className="text-red-500"><X className="w-4 h-4"/></button>
                      </div>
                   </div>
                );
              }

              return (
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg border ${s.color} hover:shadow-md transition-shadow`}>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider bg-white/50 px-1 rounded text-gray-600">{course?.name || '?'}</span>
                        <p className="font-semibold truncate">{s.name}</p>
                    </div>
                    <p className="text-xs opacity-80 truncate mt-1">Prof: {teacher?.name} | {s.hoursPerWeek}h</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                     <button onClick={() => startEditingSubject(s)} className="opacity-60 hover:opacity-100 text-indigo-700 p-1"><Pencil className="w-4 h-4" /></button>
                     <button onClick={() => removeSubject(s.id)} className="opacity-60 hover:opacity-100 text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
             {subjects.length === 0 && <p className="text-gray-400 text-sm italic">Vincula asignaturas a cursos y profesores.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};