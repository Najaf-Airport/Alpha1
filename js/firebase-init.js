// ملف: js/firebase-init.js

// تهيئة Firebase
// تأكد من استبدال هذه القيم بقيم مشروعك الخاصة من Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // <--- استبدل هذا
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // <--- استبدل هذا
    projectId: "YOUR_PROJECT_ID", // <--- استبدل هذا
    storageBucket: "YOUR_PROJECT_ID.appspot.com", // <--- استبدل هذا
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- استبدل هذا
    appId: "YOUR_APP_ID" // <--- استبدل هذا
};

// قم بتهيئة Firebase
firebase.initializeApp(firebaseConfig);

// قم بتهيئة خدمات Firebase التي ستستخدمها
const auth = firebase.auth();
const db = firebase.firestore();

// تمكين وضع عدم الاتصال بالإنترنت (اختياري، ولكن يفضل)
// db.enablePersistence()
//     .catch(err => {
//         if (err.code == 'failed-precondition') {
//             console.warn('Persistence not enabled: Multiple tabs open, persistence can only be enabled in one.');
//         } else if (err.code == 'unimplemented') {
//             console.warn('Persistence not enabled: The current browser does not support all of the features.');
//         }
//     });
