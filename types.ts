export enum DayOfWeek {
  Lunes = 'Lunes',
  Martes = 'Martes',
  Miercoles = 'Miércoles',
  Jueves = 'Jueves',
  Viernes = 'Viernes'
}

export interface Level {
  id: string;
  name: string; // e.g., "Primaria", "Secundaria"
}

export interface Course {
  id: string;
  name: string; // e.g., "1º A", "2º B"
  levelId: string;
}

export interface Teacher {
  id: string;
  name: string;
  specialty: string;
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string; 
  courseId: string; // Link to the specific group of students
  hoursPerWeek: number;
  color: string;
}

// Represents a single cell in the grid
export interface ScheduleSlot {
  day: DayOfWeek;
  hourIndex: number; // e.g., 0 for 8:00, 1 for 9:00
  subjectId: string;
  teacherId: string;
}

// The full schedule response from AI
export interface GeneratedSchedule {
  schedule: ScheduleSlot[];
  conflicts: string[]; // Explanations of resolved or remaining conflicts
}

export interface SchoolData {
  levels: Level[];
  courses: Course[];
  teachers: Teacher[];
  subjects: Subject[];
}

export const HOURS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 11:30 (Recreo)",
  "11:30 - 12:30",
  "12:30 - 13:30",
  "13:30 - 14:30"
];

export const RECREO_INDEX = 3; // The index of the break time

export const DAYS = [
  DayOfWeek.Lunes,
  DayOfWeek.Martes,
  DayOfWeek.Miercoles,
  DayOfWeek.Jueves,
  DayOfWeek.Viernes
];