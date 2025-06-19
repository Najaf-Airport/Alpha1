// ملف: js/register.js

// تأكد أن firebase-init.js تم تحميله قبل هذا الملف
// (Firebase-init.js يجب أن يحتوي على تهيئة Firebase وتعيين 'auth' كمتغير عام)

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = registerForm.registerEmail.value;
            const password = registerForm.registerPassword.value;

            try {
                // إنشاء حساب مستخدم جديد
                await auth.createUserWithEmailAndPassword(email, password);
                messageDiv.className = 'message success-message';
                messageDiv.textContent = 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.';
                // يمكنك إعادة التوجيه لصفحة تسجيل الدخول هنا
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000); // إعادة التوجيه بعد ثانيتين
            } catch (error) {
                console.error("Error registering:", error);
                messageDiv.className = 'message error-message';
                messageDiv.textContent = 'خطأ في التسجيل: ' + error.message;
            }
        });
    }
});
