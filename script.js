/* ==========================================================================
   1. SYSTEM BOOT SCREEN SEQUENCE
   ========================================================================== */
(function startAstraBoot() {
    const bootLogsList = [
        "Memory: 16384MB available",
        "CPU: 8 cores online",
        "Loading /boot/initramfs...",
        "Mounting filesystems... done",
        "Starting udev daemon...",
        "Initializing display server...",
        "Loading theme: deep-space-dark",
        "Starting window manager...",
        "Initializing audio subsystem...",
        "Starting astra-display-manager.service",
        "Starting astra-network.service",
        "Starting astra-audio.service",
        "Starting astra-dock.service"
    ];

    function run() {
        const logsContainer = document.getElementById('boot-logs');
        const percentageText = document.getElementById('boot-percentage');
        const ringFill = document.getElementById('boot-ring');

        if (!logsContainer || !percentageText || !ringFill) return;

        let step = 0;
        const totalSteps = bootLogsList.length;

        const interval = setInterval(() => {
            if (step < totalSteps) {
                const time = (Math.random() * 0.08).toFixed(6);
                const logLine = document.createElement('div');
                logLine.className = 'log-line';
                logLine.innerHTML = `<span class="log-timestamp">[ ${time} ]</span> <span>${bootLogsList[step]}</span>`;
                logsContainer.appendChild(logLine);
                logsContainer.scrollTop = logsContainer.scrollHeight;

                step++;
                const progress = Math.round((step / totalSteps) * 100);
                percentageText.textContent = `${progress}%`;

                const offset = 440 - (440 * progress) / 100;
                ringFill.style.strokeDashoffset = offset;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    const bootScreen = document.getElementById('boot-screen');
                    if (bootScreen) bootScreen.classList.add('fade-out');
                }, 600);
            }
        }, 150);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        run();
    } else {
        document.addEventListener('DOMContentLoaded', run);
    }
})();

/* ==========================================================================
   2. TOP BAR CLOCK & WIDGET LOGIC
   ========================================================================== */
function updateClock() {
    const now = new Date();

    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
    const topBarTime = document.getElementById('top-datetime');
    if (topBarTime) {
        topBarTime.textContent = now.toLocaleString('en-US', options);
    }

    const clockDigital = document.getElementById('clock-digital');
    if (clockDigital) {
        clockDigital.textContent = now.toLocaleTimeString('en-US', { hour12: true });
    }

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondHand = document.getElementById('second-hand');
    const minuteHand = document.getElementById('minute-hand');
    const hourHand = document.getElementById('hour-hand');

    if (secondHand) secondHand.style.transform = `rotate(${seconds * 6}deg)`;
    if (minuteHand) minuteHand.style.transform = `rotate(${(minutes + seconds / 60) * 6}deg)`;
    if (hourHand) hourHand.style.transform = `rotate(${(hours % 12 + minutes / 60) * 30}deg)`;
}

setInterval(updateClock, 1000);
updateClock();

/* ==========================================================================
   3. CALENDAR WIDGET LOGIC
   ========================================================================== */
let currentCalendarDate = new Date();

function renderCalendar() {
    const calendarMonth = document.getElementById('calendar-month');
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarMonth || !calendarGrid) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    calendarMonth.textContent = `${monthNames[month]} ${year}`;

    calendarGrid.innerHTML = '';

    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayLabels.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.style.fontWeight = '600';
        dayHeader.style.color = '#8a92ae';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    for (let date = 1; date <= daysInMonth; date++) {
        const dateEl = document.createElement('div');
        dateEl.textContent = date;

        if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dateEl.classList.add('active-day');
        }

        calendarGrid.appendChild(dateEl);
    }
}

document.getElementById('prev-month')?.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month')?.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();

/* ==========================================================================
   4. WINDOW MANAGEMENT & DRAGGING
   ========================================================================== */
let highestZIndex = 100;

function openWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        highestZIndex++;
        win.style.zIndex = highestZIndex;
        win.classList.add('active');
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.classList.remove('active');
    }
}

let activeDragWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function startDrag(event, windowId) {
    activeDragWindow = document.getElementById(windowId);
    if (!activeDragWindow) return;

    highestZIndex++;
    activeDragWindow.style.zIndex = highestZIndex;

    const rect = activeDragWindow.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
}

function onDrag(event) {
    if (!activeDragWindow) return;
    activeDragWindow.style.left = `${event.clientX - dragOffsetX}px`;
    activeDragWindow.style.top = `${event.clientY - dragOffsetY}px`;
}

function stopDrag() {
    activeDragWindow = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
}

/* ==========================================================================
   5. CALCULATOR APP LOGIC
   ========================================================================== */
let calcExpression = '';

function calcInput(value) {
    const display = document.getElementById('calc-display');
    if (!display) return;

    if (display.textContent === '0' && value !== '.') {
        calcExpression = value;
    } else {
        calcExpression += value;
    }
    display.textContent = calcExpression;
}

function calcEquals() {
    const display = document.getElementById('calc-display');
    if (!display) return;

    try {
        const result = eval(calcExpression.replace(/×/g, '*').replace(/÷/g, '/'));
        display.textContent = result;
        calcExpression = String(result);
    } catch {
        display.textContent = 'Error';
        calcExpression = '';
    }
}

/* ==========================================================================
   6. CUSTOM DESKTOP CONTEXT MENU
   ========================================================================== */
const contextMenu = document.getElementById('context-menu');

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!contextMenu) return;

    const x = Math.min(e.clientX, window.innerWidth - 170);
    const y = Math.min(e.clientY, window.innerHeight - 150);

    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.classList.add('visible');
});

document.addEventListener('click', hideContextMenu);

function hideContextMenu() {
    if (contextMenu) {
        contextMenu.classList.remove('visible');
    }
}