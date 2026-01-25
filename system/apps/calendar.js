console.log("Current: apps/calendar.js");

function renderCalendar() {
    const monthYear = document.getElementById('calendar_monthYear');
    const days = document.getElementById('calendar_daysid');

    const month = actualDate.getMonth();
    const year = actualDate.getFullYear();

    monthYear.textContent = `${monthsNM[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const dayFormattedMonth = new Date(year, month + 1, 0).getDate();

    const dateToday = new Date();
    const sameMonth = dateToday.getMonth() === month && dateToday.getFullYear() === year;

    days.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const dayEmpty = document.createElement('div');
        dayEmpty.className = 'calendar_day empty';
        days.appendChild(dayEmpty);
    }

    for (let day = 1; day <= dayFormattedMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar_day';

        if (sameMonth && day === dateToday.getDate()) {
            dayElement.classList.add('today');
        }

        const keyStarred = `${year}-${month}-${day}`;

        dayElement.innerHTML = `
            <span class="calendar_day-number">${day}</span>
            ${StarredDates.has(keyStarred) ? '<span class="calendar_star">⭐</span>' : ''}
        `;

        dayElement.onclick = () => toggleStar(year, month, day);

        days.appendChild(dayElement);
    }
}

function toggleStar(year, month, day) {
    const key = `${year}-${month}-${day}`;

    if (StarredDates.has(key)) {
        StarredDates.delete(key);
    } else {
        StarredDates.add(key);
    }

    renderCalendar();
}

function changeMonth(direction) {
    actualDate.setMonth(actualDate.getMonth() + direction);
    renderCalendar();
}



/*Funcion de inicializacion:
Esta funcion se ejecuta automaticamente, osea lo que pongas en la siguente funcion se ejecuta al abrir la app: */
function init_calendar() {
    console.log('Initiating calendar...')
    //Auto:
    renderCalendar();
}


//y esta lo contrario, se ejecuta al cerrar el programa
function cleanup_calendar() {
    console.log('Cleaning calendar...');
    
    const daysDiv = document.getElementById('calendar_daysid');
    if (daysDiv) {
        daysDiv.innerHTML = '';
    }
    
    actualDate = new Date();
    StarredDates = new Set();
    
}

window.scriptReady('calendar');