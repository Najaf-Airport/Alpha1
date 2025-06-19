// ملف: js/login.js

// تأكد أن firebase-init.js تم تحميله قبل هذا الملف في الـ HTML
// (Firebase-init.js يجب أن يحتوي على تهيئة Firebase وتعيين 'auth' كمتغير عام)

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                // تسجيل الدخول
                await auth.signInWithEmailAndPassword(email, password);
                messageDiv.className = 'message success-message';
                messageDiv.textContent = 'تم تسجيل الدخول بنجاح!';

                // إعادة التوجيه إلى صفحة الرحلات (أو لوحة المسؤول إذا كان البريد الإلكتروني للمسؤول)
                if (email === 'ahmedaltalqani@gmail.com') { // *** تأكد من مطابقة هذا البريد الإلكتروني تماماً ***
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'flights.html';
                }

            } catch (error) {
                console.error("Error logging in:", error);
                console.log("Full error object:", error); // **هذا السطر يساعد في Debugging**
                messageDiv.className = 'message error-message';
                messageDiv.textContent = 'خطأ في تسجيل الدخول: ' + (error.message || 'حدث خطأ غير معروف.');
            }
        });
    }

    // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
    auth.onAuthStateChanged(user => {
        if (user) {
            // إذا كان المستخدم مسجلاً للدخول بالفعل، أعد التوجيه
            if (user.email === 'ahmedaltalqani@gmail.com') { // *** تأكد من مطابقة هذا البريد الإلكتروني تماماً ***
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'flights.html';
            }
        }
    });
});
