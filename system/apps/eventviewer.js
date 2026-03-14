console.log('Current: apps/eventviewer.js');

//Codigo aqui:
const sbR_title = document.getElementById('sidebarR_EName');
const sbR_info = document.getElementById('sidebarR_EInfo');

window.SysVar = window.SysVar || {};
function sysAddEvent(type, title, info) {
    const newEvent = {
        type: type,
        title: title,
        info: info,
        date: new Date()
    };

    SysVar.sysEvents.unshift(newEvent);

    updateEventList();
}

const eventTypes = {
    'info': 'ℹ️',
    'warn': '⚠️',
    'error': '❌',
    'log': '📝',
    'fatal': '💥'
};

function updateEventList() {
    const centerdiv = document.getElementById('eventviewer_centerdiv');

    centerdiv.innerHTML = '';

    SysVar.sysEvents.forEach(function(event, idx) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'eventviewer_event';
        eventDiv.dataset.idx = idx;

        const icon = document.createElement('label');
        icon.textContent = eventTypes[event.type];

        const title = document.createElement('p');
        title.textContent = event.title;


        eventDiv.appendChild(icon);
        eventDiv.appendChild(title);

        centerdiv.appendChild(eventDiv);


        eventDiv.addEventListener('click', function() {
            const idx = eventDiv.dataset.idx;

            const selEvent = SysVar.sysEvents[idx];

            sbR_title.textContent = selEvent.title;
            sbR_info.textContent = selEvent.type + '\n' + selEvent.date + '\n==============\n' + selEvent.info;
        })
    });
}







//Codigo arriba ⬆️⬆️

function init_eventviewer() {
    updateEventList();
    sbR_title.textContent = 'Evento';
    sbR_info.textContent = 'Selecciona un evento';
}

function cleanup_eventviewer() {
    const centerdiv = document.getElementById('eventviewer_centerdiv');
    centerdiv.innerHTML = '';
    sbR_title.textContent = 'null';
    sbR_info.textContent = 'null';
}

window.scriptReady('eventviewer');
//template version 2.0