console.log('Current: apps/eventviewer.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.eventviewer = {
    displayName: 'Event Viewer',
    icon: '../../assets/apps/eventviewer.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:
const sbR_title = document.getElementById('sidebarR_EName');
const sbR_info = document.getElementById('sidebarR_EInfo');

window.SysVar = window.SysVar || {};

const eventTypes = {
    'info': 'ℹ️',
    'warn': '⚠️',
    'error': '❌',
    'log': '📝',
    'fatal': '💥'
};

function clearEvents() {
    SysVar.sysEvents = [];
    updateEventList();
}

const _prevSysAddEvent = window.sysAddEvent;
window.sysAddEvent = function(type, title, info) {
    const newEvent = { type, title, info, date: new Date() };
    SysVar.sysEvents.unshift(newEvent);
    if (SysVar.sysEvents.length > 500) {
        SysVar.sysEvents.pop();
    }
    updateEventList();
};

function updateEventList() {
    const centerdiv = document.getElementById('eventviewer_centerdiv');
    const sbR_title = document.getElementById('sidebarR_EName');
    const sbR_info = document.getElementById('sidebarR_EInfo');
    if (!centerdiv) return;

    centerdiv.innerHTML = '';

    SysVar.sysEvents.forEach(function(event, idx) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'eventviewer_event';
        eventDiv.dataset.idx = idx;

        const icon = document.createElement('label');
        icon.textContent = eventTypes[event.type] || '❓';

        const title = document.createElement('p');
        title.textContent = event.title;

        eventDiv.appendChild(icon);
        eventDiv.appendChild(title);
        centerdiv.appendChild(eventDiv);
    });

    centerdiv.addEventListener('click', function(e) {
        const target = e.target.closest('.eventviewer_event');
        if (!target) return;

        const selEvent = SysVar.sysEvents[target.dataset.idx];
        if (!selEvent) return;

        sbR_title.textContent = selEvent.title;
        sbR_info.textContent = `${selEvent.type} at ${selEvent.date}\n==================\n${selEvent.info}`;
    });
}







//Codigo arriba ⬆️⬆️

function init_eventviewer() {
    updateEventList();
    const sbR_title = document.getElementById('sidebarR_EName');
    const sbR_info = document.getElementById('sidebarR_EInfo');
    sbR_title.textContent = 'Evento';
    sbR_info.textContent = 'Selecciona un evento';
}

function cleanup_eventviewer() {
    window.sysAddEvent = _prevSysAddEvent;

    const centerdiv = document.getElementById('eventviewer_centerdiv');
    if (centerdiv) centerdiv.innerHTML = '';
}

window.scriptReady('eventviewer');
//template version 2.0