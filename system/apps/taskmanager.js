console.log("Current: apps/taskmanager.js");
//Codigo aqui:
let taskManagerInterval = null;

function refreshTaskList() {
    const container = document.querySelector('.content_taskmanager');
    if (!container) return;

    const apps = AppManager.getLoadedAppsInfo();
    const topbar = document.getElementById('taskmanager_topbar');
    
    Array.from(container.children).forEach(child => {
        if (child.id !== 'taskmanager_topbar') {
            child.remove();
        }
    });

    if (apps.length === 0) {
        const emptyMsg = document.createElement('p');

        emptyMsg.textContent = 'No hay aplicaciones ejecutandose';
        emptyMsg.style.color = '#ffffff';
        emptyMsg.style.marginTop = '20px';
        container.appendChild(emptyMsg);
        return;
    }

    apps.forEach(app => {
        const taskDiv = createTaskElement(app);
        container.appendChild(taskDiv);
    });

    updateTopbarInfo(apps);
}

function createTaskElement(app) {
    const div = document.createElement('div');
    div.className = 'taskmanager_task';
    div.dataset.appName = app.name;

    const img = document.createElement('img');
    img.src = app.icon;
    img.alt = app.displayName;

    const infoDiv = document.createElement('div');
    infoDiv.style.flex = '1';
    infoDiv.style.display = 'flex';
    infoDiv.style.flexDirection = 'column';
    infoDiv.style.gap = '2px';

    const nameP = document.createElement('p');
    nameP.textContent = app.displayName;
    nameP.style.margin = '0';
    nameP.style.fontSize = '14px';

    const uptimeP = document.createElement('p');
    uptimeP.textContent = formatUptime(app.uptime);
    uptimeP.style.margin = '0';
    uptimeP.style.fontSize = '11px';
    uptimeP.style.color = '#ffffff';

    infoDiv.appendChild(nameP);
    infoDiv.appendChild(uptimeP);


    const clsBtnsDiv = document.createElement('div');
    clsBtnsDiv.style.display = 'flex';
    clsBtnsDiv.style.gap = '6px';
    clsBtnsDiv.style.marginRight = '8px';


    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.background = 'rgba(244, 67, 54, 0.2)';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.color = 'white';
    closeBtn.style.padding = '4px 8px';
    closeBtn.style.marginRight = '8px';
    closeBtn.style.cursor = 'pointer';

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeApp(app.name);
    });

    const forceBtn = document.createElement('button');
    forceBtn.textContent = '⚠️';
    forceBtn.style.background = 'rgba(244, 67, 54, 0.2)';
    forceBtn.style.border = 'none';
    forceBtn.style.borderRadius = '4px';
    forceBtn.style.color = 'white';
    forceBtn.style.padding = '4px 8px';
    forceBtn.style.marginRight = '8px';
    forceBtn.style.cursor = 'pointer';

    forceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        AppManager.forceUnloadApp(app.name);
    });

    clsBtnsDiv.appendChild(closeBtn);
    clsBtnsDiv.appendChild(forceBtn);


    div.appendChild(img);
    div.appendChild(infoDiv);
    div.appendChild(clsBtnsDiv);

    return div;
}

function formatUptime(miliseconds) {
    const seconds = Math.floor(miliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

function closeApp(appName) {
    AppManager.unloadApp(appName);
    refreshTaskList();
}

function updateTopbarInfo(apps) {
    const topbar = document.getElementById('taskmanager_topbar');
    if (!topbar) return;

    let infoSpan = topbar.querySelector('.taskmanager-info');
    if (!infoSpan) {
        infoSpan = document.createElement('span');
        infoSpan.className = 'taskmanager-info';
        infoSpan.style.marginLeft = 'auto';
        infoSpan.style.marginRight = '10px';
        infoSpan.style.color = 'rgb(129, 129, 129)';
        infoSpan.style.fontSize = '12px';
        topbar.appendChild(infoSpan);
    }

    const memory = AppManager.getMemoryUsage();
    const memoryText = memory ? ` | RAM: ${memory.used}` : '';
    infoSpan.textContent = `Apps: ${apps.length}${memoryText}`;
}





//Codigo arriba ⬆️⬆️

function init_taskmanager() {
    console.log('Initiating taskmanager...');
    refreshTaskList();

    taskManagerInterval = setInterval(() => {
        refreshTaskList();
    }, 1000);
}

function cleanup_taskmanager() {
    console.log('Cleaning taskmanager...');

    if (taskManagerInterval) {
        clearInterval(taskManagerInterval);
        taskManagerInterval = null;
    }
}

window.scriptReady('taskmanager');