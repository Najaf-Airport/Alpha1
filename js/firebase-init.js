// ملف: js/firebase-init.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiU4-PvYgqnWbVLgISz73P9D4HaSIhW-o", // قيمتك الخاصة
  authDomain: "abcd-3b894.firebaseapp.com", // قيمتك الخاصة
  projectId: "abcd-3b894", // قيمتك الخاصة
  storageBucket: "abcd-3b894.firebasestorage.app", // قيمتك الخاصة
  messagingSenderId: "41388459465", // قيمتك الخاصة
  appId: "1:41388459465:web:9c67ef67f0ad4810e55418" // قيمتك الخاصة
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// قم بتهيئة خدمات Firebase التي ستستخدمها
const auth = getAuth(app);
const db = getFirestore(app);

// لكي تكون المتغيرات 'auth' و 'db' متاحة عالمياً للملفات الأخرى
window.auth = auth;
window.db = db;

// تمكين وضع عدم الاتصال بالإنترنت (اختياري، ولكن يفضل)
// إذا أردت تمكين هذا، قم بإزالة التعليق من السطر التالي
// import { enablePersistence } from "firebase/firestore";
// enablePersistence(db)
//     .catch(err => {
//         if (err.code == 'failed-precondition') {
//             console.warn('Persistence not enabled: Multiple tabs open, persistence can only be enabled in one.');
//         } else if (err.code == 'unimplemented') {
//             console.warn('Persistence not enabled: The current browser does not support all of the features.');
//         }
//     });
