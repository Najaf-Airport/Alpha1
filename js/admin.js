// ملف: js/admin.js

// استيراد auth و db من firebase-init.js
import { auth, db } from "./firebase-init.js";

// دالة لمطابقة تنسيق الشهر (بإضافة صفر بادئ إذا كان أقل من 10)
function formatMonth(month) {
    return month < 10 ? `0${month}` : `${month}`;
}

document.addEventListener('DOMContentLoaded', () => {
    let selectedMonth = new Date().getMonth() + 1;
    let selectedYear = new Date().getFullYear();

    const monthSelector = document.getElementById('monthSelector');
    const yearSelector = document.getElementById('yearSelector');
    const noUserStatsMsg = document.getElementById('noUserStats');
    const noAllFlightsMsg = document.getElementById('noAllFlights');
    const adminErrorMsg = document.getElementById('adminError');
    const totalFlightsCountSpan = document.getElementById('totalFlightsCount');
    const usersTableBody = document.getElementById('usersTableBody');
    const allFlightsTableBody = document.getElementById('allFlightsTableBody');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (monthSelector) monthSelector.value = selectedMonth;
    if (yearSelector) yearSelector.value = selectedYear;

    function resetAdminUI() {
        if (noUserStatsMsg) noUserStatsMsg.style.display = 'none';
        if (noAllFlightsMsg) noAllFlightsMsg.style.display = 'none';
        if (adminErrorMsg) adminErrorMsg.style.display = 'none';
        if (totalFlightsCountSpan) totalFlightsCountSpan.textContent = '0';
        if (usersTableBody) usersTableBody.innerHTML = '';
        if (allFlightsTableBody) allFlightsTableBody.innerHTML = '';
    }

    resetAdminUI();

    auth.onAuthStateChanged(user => {
        if (user) {
            if (user.email === 'ahmedaltalqani@gmail.com') { // *** تأكد من مطابقة هذا البريد الإلكتروني تماماً ***
                if (userNameDisplay) {
                    userNameDisplay.textContent = `مرحباً بك، المسؤول (${user.email})!`;
                }
                loadAdminData();
                if (monthSelector) monthSelector.addEventListener('change', loadAdminData);
                if (yearSelector) yearSelector.addEventListener('change', loadAdminData);
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        auth.signOut().then(() => {
                            window.location.href = 'index.html';
                        }).catch(error => {
                            console.error("Error signing out:", error);
                            alert("حدث خطأ أثناء تسجيل الخروج.");
                        });
                    });
                }
            } else {
                alert('ليس لديك صلاحية الوصول لهذه الصفحة.');
                auth.signOut().then(() => {
                    window.location.href = 'index.html';
                }).catch(error => {
                    console.error("Error signing out:", error);
                });
            }
        } else {
            window.location.href = 'index.html';
        }
    });

    async function loadAdminData() {
        resetAdminUI();

        selectedMonth = parseInt(monthSelector ? monthSelector.value : new Date().getMonth() + 1);
        selectedYear = parseInt(yearSelector ? yearSelector.value : new Date().getFullYear());

        const monthYearDocId = `${selectedYear}-${formatMonth(selectedMonth)}`;

        try {
            const usersSnapshot = await db.collection('months').doc(monthYearDocId)
                .collection('users').get();

            if (usersSnapshot.empty) {
                if (noUserStatsMsg) noUserStatsMsg.style.display = 'block';
                if (noAllFlightsMsg) noAllFlightsMsg.style.display = 'block';
                console.warn("لا توجد إحصائيات للمستخدمين لهذا الشهر.");
                return;
            }

            if (noUserStatsMsg) noUserStatsMsg.style.display = 'none';

            let totalFlights = 0;
            const allFlightsData = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;

                const flightsSnapshot = await db.collection('months').doc(monthYearDocId)
                    .collection('users').doc(userId)
                    .collection('flights')
                    .orderBy('timestamp', 'desc')
                    .get();

                const flightCount = flightsSnapshot.size;
                totalFlights += flightCount;

                if (usersTableBody) {
                    const row = usersTableBody.insertRow();
                    row.insertCell(0).textContent = userId;
                    row.insertCell(1).textContent = flightCount;
                }

                flightsSnapshot.forEach(flightDoc => {
                    const flight = flightDoc.data();
                    allFlightsData.push({
                        userId: userId,
                        fltNo: flight.fltNo || 'غير محدد',
                        date: flight.date,
                        timestamp: flight.timestamp,
                        name: flight.name || 'غير محدد',
                        notes: flight.notes || 'لا توجد ملاحظات'
                    });
                });
            }

            if (totalFlightsCountSpan) totalFlightsCountSpan.textContent = totalFlights;

            allFlightsData.sort((a, b) => {
                if (a.timestamp && b.timestamp) {
                    // استخدام .toDate() للتحويل إلى كائن Date للمقارنة
                    return b.timestamp.toDate() - a.timestamp.toDate();
                }
                return 0;
            });

            if (allFlightsData.length > 0) {
                if (noAllFlightsMsg) noAllFlightsMsg.style.display = 'none';
                if (allFlightsTableBody) {
                    allFlightsData.forEach(flight => {
                        const row = allFlightsTableBody.insertRow();
                        row.insertCell(0).textContent = flight.date;
                        row.insertCell(1).textContent = flight.fltNo;
                        row.insertCell(2).textContent = flight.name;
                        row.insertCell(3).textContent = flight.userId;
                        row.insertCell(4).textContent = flight.notes;
                    });
                }
            } else {
                if (noAllFlightsMsg) noAllFlightsMsg.style.display = 'block';
            }

        } catch (error) {
            console.error("Error loading admin data:", error);
            if (adminErrorMsg) {
                adminErrorMsg.textContent = `خطأ في تحميل البيانات: ${error.message}`;
                adminErrorMsg.style.display = 'block';
            }
            resetAdminUI();
        }
    }

    document.getElementById('exportStatsBtn').addEventListener('click', () => {
        alert('تصدير الإحصائيات يتطلب مكتبة خارجية (مثل docx.js) لتوليد ملف Word.');
    });

    document.getElementById('exportAllFlightsBtn').addEventListener('click', () => {
        alert('تصدير كل الرحلات يتطلب مكتبة خارجية (مثل docx.js) لتوليد ملف Word.');
    });
});
