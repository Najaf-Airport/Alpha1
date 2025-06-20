// ملف: js/flights.js

// استيراد auth و db من firebase-init.js
import { auth, db } from "./firebase-init.js";
import { doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"; // قم باستيراد doc إذا كنت تستخدمها بشكل مباشر

// دالة لمطابقة تنسيق الشهر (بإضافة صفر بادئ إذا كان أقل من 10)
function formatMonth(month) {
    return month < 10 ? `0${month}` : `${month}`;
}

let currentUserName = localStorage.getItem('userName');
let currentUserEmail = '';

auth.onAuthStateChanged(user => {
    if (user) {
        currentUserEmail = user.email;
        if (!currentUserName) {
            currentUserName = prompt('الرجاء إدخال اسمك (سيتم حفظه تلقائياً):');
            if (currentUserName) {
                localStorage.setItem('userName', currentUserName);
            } else {
                alert('يجب إدخال الاسم للمتابعة.');
                auth.signOut();
                window.location.href = 'index.html';
                return;
            }
        }
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = currentUserName;
        }
        renderFlightForms();
        loadPreviousFlights(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            localStorage.removeItem('userName');
            window.location.href = 'index.html';
        }).catch(error => {
            console.error("Error signing out:", error);
            alert("حدث خطأ أثناء تسجيل الخروج.");
        });
    });
}

function createFlightCard(index) {
    const card = document.createElement('div');
    card.classList.add('flight-card');
    card.innerHTML = `
        <h3>الرحلة رقم ${index + 1}</h3>
        <div class="form-group">
            <label for="date-${index}">التاريخ:</label>
            <input type="date" id="date-${index}" required>
        </div>
        <div class="form-group">
            <label for="fltNo-${index}">رقم الرحلة (FLT.NO):</label>
            <input type="text" id="fltNo-${index}" required>
        </div>
        <div class="form-group">
            <label for="onChocks-${index}">وصول الطائرة (ON chocks Time):</label>
            <input type="time" id="onChocks-${index}">
        </div>
        <div class="form-group">
            <label for="openDoor-${index}">فتح الباب (Open Door Time):</label>
            <input type="time" id="openDoor-${index}">
        </div>
        <div class="form-group">
            <label for="startCleaning-${index}">بدء التنظيف (Start Cleaning Time):</label>
            <input type="time" id="startCleaning-${index}">
        </div>
        <div class="form-group">
            <label for="completeCleaning-${index}">انتهاء التنظيف (Complete Cleaning Time):</label>
            <input type="time" id="completeCleaning-${index}">
        </div>
        <div class="form-group">
            <label for="readyBoarding-${index}">استعداد الصعود (Ready Boarding Time):</label>
            <input type="time" id="readyBoarding-${index}">
        </div>
        <div class="form-group">
            <label for="startBoarding-${index}">بدء الصعود (Start Boarding Time):</label>
            <input type="time" id="startBoarding-${index}">
        </div>
        <div class="form-group">
            <label for="completeBoarding-${index}">اكتمال الصعود (Complete Boarding Time):</label>
            <input type="time" id="completeBoarding-${index}">
        </div>
        <div class="form-group">
            <label for="closeDoor-${index}">إغلاق الباب (Close Door Time):</label>
            <input type="time" id="closeDoor-${index}">
        </div>
        <div class="form-group">
            <label for="offChocks-${index}">مغادرة الطائرة (Off chocks Time):</label>
            <input type="time" id="offChocks-${index}">
        </div>
        <div class="form-group">
            <label for="name-${index}">الاسم:</label>
            <input type="text" id="name-${index}" value="${currentUserName || ''}" readonly required>
        </div>
        <div class="form-group">
            <label for="notes-${index}">ملاحظات:</label>
            <textarea id="notes-${index}"></textarea>
        </div>
    `;
    return card;
}

function renderFlightForms() {
    const container = document.getElementById('flightFormsContainer');
    if (container) {
        container.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            container.appendChild(createFlightCard(i));
        }
    }
}

const saveFlightsBtn = document.getElementById('saveFlightsBtn');
if (saveFlightsBtn) {
    saveFlightsBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            alert('يرجى تسجيل الدخول أولاً.');
            return;
        }

        const userId = user.uid;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const flightData = [];
        let hasAtLeastOneValidFlight = false;

        const monthYearDocId = `${currentYear}-${formatMonth(currentMonth)}`;

        for (let i = 0; i < 5; i++) {
            const dateInput = document.getElementById(`date-${i}`);
            const fltNoInput = document.getElementById(`fltNo-${i}`);
            const onChocksTimeInput = document.getElementById(`onChocks-${i}`);
            const openDoorTimeInput = document.getElementById(`openDoor-${i}`);
            const startCleaningTimeInput = document.getElementById(`startCleaning-${i}`);
            const completeCleaningTimeInput = document.getElementById(`completeCleaning-${i}`);
            const readyBoardingTimeInput = document.getElementById(`readyBoarding-${i}`);
            const startBoardingTimeInput = document.getElementById(`startBoarding-${i}`);
            const completeBoardingTimeInput = document.getElementById(`completeBoarding-${i}`);
            const closeDoorTimeInput = document.getElementById(`closeDoor-${i}`);
            const offChocksTimeInput = document.getElementById(`offChocks-${i}`);
            const nameInput = document.getElementById(`name-${i}`);
            const notesInput = document.getElementById(`notes-${i}`);

            const date = dateInput ? dateInput.value.trim() : '';
            const fltNo = fltNoInput ? fltNoInput.value.trim() : '';
            const onChocksTime = onChocksTimeInput ? onChocksTimeInput.value : '';
            const openDoorTime = openDoorTimeInput ? openDoorTimeInput.value : '';
            const startCleaningTime = startCleaningTimeInput ? startCleaningTimeInput.value : '';
            const completeCleaningTime = completeCleaningTimeInput ? completeCleaningTimeInput.value : '';
            const readyBoardingTime = readyBoardingTimeInput ? readyBoardingTimeInput.value : '';
            const startBoardingTime = startBoardingTimeInput ? startBoardingTimeInput.value : '';
            const completeBoardingTime = completeBoardingTimeInput ? completeBoardingTimeInput.value : '';
            const closeDoorTime = closeDoorTimeInput ? closeDoorTimeInput.value : '';
            const offChocksTime = offChocksTimeInput ? offChocksTimeInput.value : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const notes = notesInput ? notesInput.value.trim() : '';

            if (!date && !fltNo && !name) {
                continue;
            }

            if (!date) {
                alert(`الرحلة رقم ${i + 1}: حقل "التاريخ" إجباري.`);
                return;
            }
            if (!fltNo) {
                alert(`الرحلة رقم ${i + 1}: حقل "رقم الرحلة (FLT.NO)" إجباري.`);
                return;
            }
            if (!name) {
                alert(`الرحلة رقم ${i + 1}: حقل "الاسم" إجباري.`);
                return;
            }

            hasAtLeastOneValidFlight = true;
            flightData.push({
                date: date,
                fltNo: fltNo,
                onChocksTime: onChocksTime,
                openDoorTime: openDoorTime,
                startCleaningTime: startCleaningTime,
                completeCleaningTime: completeCleaningTime,
                readyBoardingTime: readyBoardingTime,
                startBoardingTime: startBoardingTime,
                completeBoardingTime: completeBoardingTime,
                closeDoorTime: closeDoorTime,
                offChocksTime: offChocksTime,
                name: name,
                notes: notes,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        if (!hasAtLeastOneValidFlight) {
            alert('الرجاء إدخال بيانات كاملة (التاريخ، رقم الرحلة، الاسم) لرحلة واحدة على الأقل لحفظ البيانات.');
            return;
        }

        try {
            for (let i = 0; i < flightData.length; i++) {
                const data = flightData[i];
                const safeFltNo = (data.fltNo || 'NoFLT').replace(/[^a-zA-Z0-9]/g, '_');
                const docId = `${data.date}_${safeFltNo}_${new Date().getTime()}_${i}`;

                await db.collection('months').doc(monthYearDocId)
                          .collection('users').doc(userId)
                          .collection('flights').doc(docId).set(data);
            }
            alert('تم حفظ الرحلات بنجاح!');
            loadPreviousFlights(userId);
            renderFlightForms();

        } catch (error) {
            console.error("Error saving flights:", error);
            alert('حدث خطأ أثناء حفظ الرحلات. يرجى المحاولة مرة أخرى: ' + error.message);
        }
    });
}

async function loadPreviousFlights(userId) {
    const previousFlightsList = document.getElementById('previousFlightsList');
    const noPreviousFlightsMsg = document.getElementById('noPreviousFlights');

    if (previousFlightsList) previousFlightsList.innerHTML = '';
    if (noPreviousFlightsMsg) noPreviousFlightsMsg.style.display = 'block';

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthYearDocId = `${currentYear}-${formatMonth(currentMonth)}`;

    try {
        const snapshot = await db.collection('months').doc(monthYearDocId)
                                .collection('users').doc(userId)
                                .collection('flights')
                                .orderBy('timestamp', 'desc')
                                .get();

        if (snapshot.empty) {
            if (noPreviousFlightsMsg) noPreviousFlightsMsg.style.display = 'block';
            return;
        }
        if (noPreviousFlightsMsg) noPreviousFlightsMsg.style.display = 'none';

        if (previousFlightsList) {
            snapshot.forEach(doc => {
                const flight = doc.data();
                const item = document.createElement('div');
                item.classList.add('previous-flight-item');
                item.innerHTML = `
                    <div>
                        <strong>التاريخ:</strong> ${flight.date} <br>
                        <strong>رقم الرحلة:</strong> ${flight.fltNo || 'غير محدد'} <br>
                        <strong>الملاحظات:</strong> ${flight.notes || 'لا توجد'}
                    </div>
                `;
                previousFlightsList.appendChild(item);
            });
        }
    } catch (error) {
        console.error("Error loading previous flights:", error);
        if (previousFlightsList) {
            previousFlightsList.innerHTML = `<p style="color:red;">خطأ في تحميل الرحلات السابقة: ${error.message}</p>`;
        }
        if (noPreviousFlightsMsg) noPreviousFlightsMsg.style.display = 'none';
    }
}
