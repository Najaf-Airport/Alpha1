// ملف: js/admin.js

// تأكد من تحميل firebase-init.js قبله
// (Firebase-init.js يجب أن يحتوي على تهيئة Firebase وتعيين 'auth' و 'db' كمتغيرات عامة)

// دالة لمطابقة تنسيق الشهر (بإضافة صفر بادئ إذا كان أقل من 10)
function formatMonth(month) {
    return month < 10 ? `0${month}` : `${month}`;
}

// **لف كل الكود داخل هذا الحدث لضمان تحميل DOM بالكامل**
document.addEventListener('DOMContentLoaded', () => {
    let selectedMonth = new Date().getMonth() + 1; // الشهر الحالي (1-12)
    let selectedYear = new Date().getFullYear();

    // **عناصر الرسائل لتسهيل الإدارة - تم نقل جلبها إلى هنا (داخل DOMContentLoaded)**
    const monthSelector = document.getElementById('monthSelector');
    const yearSelector = document.getElementById('yearSelector');
    const noUserStatsMsg = document.getElementById('noUserStats');
    const noAllFlightsMsg = document.getElementById('noAllFlights');
    const adminErrorMsg = document.getElementById('adminError');
    const totalFlightsCountSpan = document.getElementById('totalFlightsCount');
    const usersTableBody = document.getElementById('usersTableBody');
    const allFlightsTableBody = document.getElementById('allFlightsTableBody');
    const logoutBtn = document.getElementById('logoutBtn'); // جلب زر تسجيل الخروج
    const userNameDisplay = document.getElementById('userNameDisplay'); // لعرض اسم المستخدم في لوحة التحكم

    // تحديث الشهر والسنة الافتراضيين في الواجهة إذا كانت العناصر موجودة
    if (monthSelector) monthSelector.value = selectedMonth;
    if (yearSelector) yearSelector.value = selectedYear;

    // تحديث رسائل الأخطاء في البداية لتكون مخفية وإعادة تعيين العناصر
    function resetAdminUI() {
        if (noUserStatsMsg) noUserStatsMsg.style.display = 'none';
        if (noAllFlightsMsg) noAllFlightsMsg.style.display = 'none';
        if (adminErrorMsg) adminErrorMsg.style.display = 'none';
        if (totalFlightsCountSpan) totalFlightsCountSpan.textContent = '0';
        if (usersTableBody) usersTableBody.innerHTML = '';
        if (allFlightsTableBody) allFlightsTableBody.innerHTML = '';
    }

    // استدعاء دالة إعادة التعيين عند تحميل الصفحة لأول مرة
    resetAdminUI();

    auth.onAuthStateChanged(user => {
        if (user) {
            // التحقق مما إذا كان المستخدم هو المسؤول (باستخدام نفس البريد الإلكتروني في القواعد)
            if (user.email === 'ahmedaltalqani@gmail.com') { // *** تأكد من مطابقة هذا البريد الإلكتروني تماماً ***
                if (userNameDisplay) {
                    userNameDisplay.textContent = `مرحباً بك، المسؤول (${user.email})!`;
                }
                loadAdminData(); // تحميل البيانات للمسؤول
                // إضافة مستمعي التغيير بعد التأكد من تسجيل دخول المسؤول
                if (monthSelector) monthSelector.addEventListener('change', loadAdminData);
                if (yearSelector) yearSelector.addEventListener('change', loadAdminData);
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        auth.signOut().then(() => {
                            window.location.href = 'index.html'; // أو login.html
                        }).catch(error => {
                            console.error("Error signing out:", error);
                            alert("حدث خطأ أثناء تسجيل الخروج.");
                        });
                    });
                }
            } else {
                alert('ليس لديك صلاحية الوصول لهذه الصفحة.');
                auth.signOut().then(() => {
                    window.location.href = 'index.html'; // أو login.html
                }).catch(error => {
                    console.error("Error signing out:", error);
                });
            }
        } else {
            window.location.href = 'index.html'; // أو login.html
        }
    });

    async function loadAdminData() {
        resetAdminUI(); // إعادة تعيين الواجهة قبل تحميل بيانات جديدة

        // تأكد من أن العناصر موجودة قبل محاولة قراءة قيمتها
        selectedMonth = parseInt(monthSelector ? monthSelector.value : new Date().getMonth() + 1);
        selectedYear = parseInt(yearSelector ? yearSelector.value : new Date().getFullYear());

        // تهيئة اسم الوثيقة للشهر والسنة ليتطابق مع Firestore (مثال: 2025-06)
        const monthYearDocId = `${selectedYear}-${formatMonth(selectedMonth)}`;

        try {
            // جلب جميع المستخدمين لهذا الشهر
            // (المسؤول يحتاج صلاحية قراءة /months/{monthId}/users/{userId})
            const usersSnapshot = await db.collection('months').doc(monthYearDocId) // استخدام التنسيق الجديد
                .collection('users').get();

            if (usersSnapshot.empty) {
                if (noUserStatsMsg) noUserStatsMsg.style.display = 'block';
                if (noAllFlightsMsg) noAllFlightsMsg.style.display = 'block';
                console.warn("لا توجد إحصائيات للمستخدمين لهذا الشهر.");
                return;
            }

            if (noUserStatsMsg) noUserStatsMsg.style.display = 'none'; // إخفاء الرسالة إذا كان هناك مستخدمون

            let totalFlights = 0;
            const allFlightsData = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                // يمكنك محاولة جلب اسم المستخدم من Auth أيضاً إذا كان مسجلاً
                // const userAuthInfo = await auth.getUser(userId); // تحتاج إلى Admin SDK في الخلفية لهذا

                // جلب رحلات كل مستخدم
                // (المسؤول يحتاج صلاحية قراءة /months/{monthId}/users/{userId}/flights/{flightDocId})
                const flightsSnapshot = await db.collection('months').doc(monthYearDocId) // استخدام التنسيق الجديد
                    .collection('users').doc(userId)
                    .collection('flights')
                    .orderBy('timestamp', 'desc')
                    .get();

                const flightCount = flightsSnapshot.size;
                totalFlights += flightCount;

                // إضافة صف لجدول إحصائيات المستخدمين
                if (usersTableBody) {
                    const row = usersTableBody.insertRow();
                    row.insertCell(0).textContent = userId; // UID
                    row.insertCell(1).textContent = flightCount;
                }

                flightsSnapshot.forEach(flightDoc => {
                    const flight = flightDoc.data();
                    allFlightsData.push({
                        userId: userId,
                        fltNo: flight.fltNo || 'غير محدد',
                        date: flight.date,
                        timestamp: flight.timestamp, // للاستفادة من الترتيب
                        name: flight.name || 'غير محدد', // الاسم الذي أدخله المستخدم في الرحلة
                        notes: flight.notes || 'لا توجد ملاحظات'
                    });
                });
            }

            if (totalFlightsCountSpan) totalFlightsCountSpan.textContent = totalFlights; // تحديث إجمالي عدد الرحلات

            // فرز جميع الرحلات حسب التاريخ (الأحدث أولاً)
            allFlightsData.sort((a, b) => {
                // التحقق من وجود timestamp قبل المقارنة
                if (a.timestamp && b.timestamp) {
                    return b.timestamp.toDate() - a.timestamp.toDate();
                }
                return 0; // للحالات التي لا يوجد فيها timestamp (يجب أن يكون موجوداً)
            });

            if (allFlightsData.length > 0) {
                if (noAllFlightsMsg) noAllFlightsMsg.style.display = 'none'; // إخفاء رسالة لا توجد رحلات
                if (allFlightsTableBody) {
                    allFlightsData.forEach(flight => {
                        const row = allFlightsTableBody.insertRow();
                        row.insertCell(0).textContent = flight.date;
                        row.insertCell(1).textContent = flight.fltNo;
                        row.insertCell(2).textContent = flight.name; // عرض الاسم
                        row.insertCell(3).textContent = flight.userId; // UID
                        row.insertCell(4).textContent = flight.notes;
                    });
                }
            } else {
                if (noAllFlightsMsg) noAllFlightsMsg.style.display = 'block'; // إذا لم تكن هناك رحلات بعد الفرز
            }

        } catch (error) {
            console.error("Error loading admin data:", error);
            if (adminErrorMsg) {
                adminErrorMsg.textContent = `خطأ في تحميل البيانات: ${error.message}`;
                adminErrorMsg.style.display = 'block';
            }
            resetAdminUI(); // إعادة تعيين الواجهة في حالة الخطأ
        }
    }

    // دالة تصدير الإحصائيات (تحتاج لمكتبة خارجية مثل docx)
    document.getElementById('exportStatsBtn').addEventListener('click', () => {
        alert('تصدير الإحصائيات يتطلب مكتبة خارجية (مثل docx.js) لتوليد ملف Word.');
        // يجب إضافة منطق التصدير الفعلي هنا
    });

    // دالة تصدير كل الرحلات (تحتاج لمكتبة خارجية مثل docx)
    document.getElementById('exportAllFlightsBtn').addEventListener('click', () => {
        alert('تصدير كل الرحلات يتطلب مكتبة خارجية (مثل docx.js) لتوليد ملف Word.');
        // يجب إضافة منطق التصدير الفعلي هنا
    });
}); // **نهاية DOMContentLoaded**
