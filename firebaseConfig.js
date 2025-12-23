import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { Platform } from 'react-native';

// Suas credenciais do Flint
const firebaseConfig = {
  apiKey: "AIzaSyBPxmoA_ITRUAMV_lQ4Zv7ZX21tziLnFiI",
  authDomain: "flint-19896.firebaseapp.com",
  projectId: "flint-19896",
  storageBucket: "flint-19896.firebasestorage.app",
  messagingSenderId: "191284724830",
  appId: "1:191284724830:web:a815300587b7aa8162e0cf",
  measurementId: "G-3E6GCZPNT8"
};

// 1. Inicializa o App
const app = initializeApp(firebaseConfig);

// 2. Inicializa a Autenticação (Híbrida)
/** @type {import('firebase/auth').Auth} */
let auth;

if (Platform.OS === 'web') {
  // NA WEB
  auth = getAuth(app);
} else {
  // NO MOBILE
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// 3. Inicializa o Banco de Dados
const db = getFirestore(app);

// Exporta
export { app, auth, db };
