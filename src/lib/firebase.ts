import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

