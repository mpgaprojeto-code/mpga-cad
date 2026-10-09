import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration provided for mpga-cadastro
export const firebaseConfig = {
  apiKey: "AIzaSyCxt-cVJ4R_SWuDF6m2JVOBsWK2LXHSn1Q",
  authDomain: "mpga-cadastro.firebaseapp.com",
  projectId: "mpga-cadastro",
  storageBucket: "mpga-cadastro.firebasestorage.app",
  messagingSenderId: "979797356332",
  appId: "1:979797356332:web:a32b03c58ff57b4d010689",
  measurementId: "G-VXDQQK8XN3"
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics conditionally (only in supported browser environments)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn('Firebase Analytics initialization skipped:', e);
      }
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}
