import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Teacher, Subject, HOURS, DAYS, GeneratedSchedule, RECREO_INDEX, Course } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSmartSchedule = async (
  teachers: Teacher[],
  subjects: Subject[],
  courses: Course[]
): Promise<GeneratedSchedule> => {
  const ai = getClient();

  // Construct a clear context for the model
  const prompt = `
    Actúa como un experto planificador escolar. Genera un horario semanal escolar evitando conflictos (solapamientos).
    
    **Contexto de Datos:**
    - Cursos (Grupos de alumnos): ${JSON.stringify(courses)}
    - Profesores: ${JSON.stringify(teachers)}
    - Asignaturas (Clases a programar): ${JSON.stringify(subjects)}
    
    **Estructura Temporal:**
    1. La semana tiene 5 días: ${DAYS.join(", ")}.
    2. Hay ${HOURS.length} bloques horarios por día (índices 0 a ${HOURS.length - 1}).
    3. El bloque índice ${RECREO_INDEX} es RECREO. NO asignes ninguna clase en el índice ${RECREO_INDEX}.
    
    **Reglas CRÍTICAS (Restricciones Duras):**
    1. Debes asignar exactamente 'hoursPerWeek' bloques para cada asignatura.
    2. **CONFLICTO PROFESOR:** Un 'teacherId' NO puede estar en dos asignaturas al mismo tiempo (mismo día y hora).
    3. **CONFLICTO ALUMNOS (CURSO):** Un 'courseId' NO puede tener dos asignaturas asignadas al mismo tiempo. Los alumnos no pueden estar en dos sitios a la vez.
    
    **Objetivos (Restricciones Suaves):**
    1. Distribuye las clases de manera equilibrada durante la semana.
    2. Intenta no poner la misma asignatura más de una vez al día si es posible, a menos que las horas semanales sean altas.
    
    **Salida:**
    Si encuentras conflictos imposibles de resolver matemáticamente con las horas disponibles, indícalo en el campo 'conflicts'.
    Devuelve un objeto JSON con la lista de asignaciones (schedule) y notas sobre conflictos.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      schedule: {
        type: Type.ARRAY,
        description: "Lista de asignaciones de clases a horarios.",
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING, enum: DAYS },
            hourIndex: { type: Type.INTEGER, description: "Índice del bloque horario (0-6)" },
            subjectId: { type: Type.STRING, description: "ID de la asignatura asignada" },
            teacherId: { type: Type.STRING, description: "ID del profesor asignado (redundante pero útil)" },
          },
          required: ["day", "hourIndex", "subjectId", "teacherId"],
        },
      },
      conflicts: {
        type: Type.ARRAY,
        description: "Lista de mensajes de texto explicando cualquier conflicto o ajuste realizado.",
        items: { type: Type.STRING },
      },
    },
    required: ["schedule", "conflicts"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for rigorous logic
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedSchedule;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw error;
  }
};