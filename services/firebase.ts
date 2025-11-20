import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { SchoolData } from '../types';

// CONFIGURACIÓN:
// 1. Crea un proyecto en https://console.firebase.google.com/
// 2. Copia la configuración de tu Web App aquí abajo.
// 3. Si dejas los valores por defecto ("API_KEY_AQUI"), la app usará
//    automáticamente el LocalStorage del navegador (solo guardará en este PC).

const firebaseConfig = {
  apiKey: "API_KEY_AQUI",
  authDomain: "proyecto.firebaseapp.com",
  projectId: "proyecto-id",
  storageBucket: "proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:12345:web:abcde"
};

let db: any = null;
let useLocalStorage = true;

try {
    // Detectamos si es la configuración real o la de ejemplo
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "API_KEY_AQUI") {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        useLocalStorage = false;
        console.log("✅ Conectado a Firebase Cloud.");
    } else {
        console.warn("⚠️ Firebase no configurado. Usando LocalStorage (navegador) para guardar datos.");
    }
} catch (e) {
    console.error("Error inicializando Firebase, cambiando a LocalStorage:", e);
    useLocalStorage = true;
}

const LOCAL_STORAGE_KEY = 'eduSchedule_data';

export const saveSchoolData = async (data: SchoolData) => {
  // 1. MODO LOCAL STORAGE (Sin configuración)
  if (useLocalStorage || !db) {
      try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          console.log("Datos guardados en LocalStorage");
          return;
      } catch (e) {
          console.error("Error guardando en LocalStorage", e);
          throw e;
      }
  }

  // 2. MODO FIREBASE (Con configuración)
  try {
    // Guardamos todo en un solo documento 'schoolData' en la colección 'schedules'
    await setDoc(doc(db, "schedules", "mainConfig"), data);
    console.log("Datos guardados en Firebase");
  } catch (e) {
    console.error("Error guardando en Firebase:", e);
    throw e;
  }
};

export const loadSchoolData = async (): Promise<SchoolData | null> => {
  // 1. MODO LOCAL STORAGE
  if (useLocalStorage || !db) {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
          return JSON.parse(localData) as SchoolData;
      }
      return null;
  }

  // 2. MODO FIREBASE
  try {
    const docRef = doc(db, "schedules", "mainConfig");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as SchoolData;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error cargando de Firebase:", e);
    // Fallback a local si falla la red
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : null;
  }
};