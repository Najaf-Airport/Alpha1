// ملف: js/firebase-init.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
// تعديل هنا: استيراد getFirestore و enablePersistence من مساراتها الصحيحة
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { enablePersistence } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore/lite.js"; // <-- هذا هو التغيير الأساسي

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

// تمكين وضع عدم الاتصال بالإنترنت (اختياري، ولكن يفضل)
// الآن enablePersistence ستكون متاحة بشكل صحيح
enablePersistence(db)
    .catch(err => {
        if (err.code == 'failed-precondition') {
            console.warn('Persistence not enabled: Multiple tabs open, persistence can only be enabled in one.');
        } else if (err.code == 'unimplemented') {
            console.warn('Persistence not enabled: The current browser does not support all of the features.');
        }
    });

// قم بتصدير auth و db ليتم استيرادها في ملفات JS الأخرى
export { auth, db };
