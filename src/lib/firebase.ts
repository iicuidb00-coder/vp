import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// .env.local 이 아직 설정되지 않은 개발 초기 단계에서도 앱이 죽지 않도록 가드
export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(
        firebaseConfig.apiKey ? firebaseConfig : { projectId: "demo-project" }
      );

export const db = getFirestore(app);
