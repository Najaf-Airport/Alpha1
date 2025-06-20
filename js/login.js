// ملف: js/login.js

// استيراد auth من firebase-init.js
import { auth } from "./firebase-init.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                // استخدام auth مباشرة
                await auth.signInWithEmailAndPassword(email, password);
                messageDiv.className = 'message success-message';
                messageDiv.textContent = 'تم تسجيل الدخول بنجاح!';

                if (email === 'ahmedaltalqani@gmail.com') { // *** تأكد من مطابقة هذا البريد الإلكتروني تماماً ***
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'flights.html';
                }

            } catch (error) {
                console.error("Error logging in:", error);
                messageDiv.className = 'message error-message';
                messageDiv.textContent = 'خطأ في تسجيل الدخول: ' + (error.message || 'حدث خطأ غير معروف.');
            }
        });
    }

    // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
    auth.onAuthStateChanged(user => {
        if (user) {
            if (user.email === 'ahmedaltalqani@gmail.com') { // *** تأكد من مطابقة هذا البريد الإلكتروني تماماً ***
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'flights.html';
            }
        }
    });
});
