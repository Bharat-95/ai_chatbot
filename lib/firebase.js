// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDeKe7mH8RAzKsK1Sgp8R8gUKImXr89cmo",
  authDomain: "fb-marketplace-bot.firebaseapp.com",
  projectId: "fb-marketplace-bot",
  storageBucket: "fb-marketplace-bot.firebasestorage.app",
  messagingSenderId: "227747844655",
  appId: "1:227747844655:web:ce0c414fa22b90bd08acda",
  measurementId: "G-RDHRDD8R6J"
};

// Prevent re-initialization (important in Next.js hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics should only run in the browser and when supported
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
