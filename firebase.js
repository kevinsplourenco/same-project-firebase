export const firebaseConfig = {
apiKey: 'YOUR_API_KEY',
authDomain: 'YOUR_AUTH_DOMAIN',
projectId: 'YOUR_PROJECT_ID',
storageBucket: 'YOUR_STORAGE_BUCKET',
messagingSenderId: 'YOUR_MSG_SENDER_ID',
appId: 'YOUR_APP_ID',
};

import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);

function requireUID() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

// Helpers de caminho escopados ao usuário logado (tenant = UID)
export const userCol = (name) => collection(db, "tenants", requireUID(), name);
export const userDoc = (...segments) =>
  doc(db, "tenants", requireUID(), ...segments);

