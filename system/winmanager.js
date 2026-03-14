console.log("Current: winmanager.js");

//ventanas
//Codigo general pa todo xd:
let topZ = 9992;

window.SysVar = window.SysVar || {};

document.querySelectorAll(".window").forEach(win => {
    initWindowBehavior(win);
    win.dataset.winInitialized = 'true';
});



const customSizes = {
    settings: { width: '800px', height: '600px' },
    calc: { width: '310px', height: '480px' },
    calendar: { width: '470px', height: '610px'},
    toybox: { width: '800px', height: '480px'},
    weather: { width: '490px', height: '280px'},
    arcade: { width: '980px', height: '630px'},
    nkbrief: { width: '940px', height: '600px'}
};

// Estas son las excepciones para apps que no siguen el patron (mas o menos xD)
const windowExceptions = {
    settings: 'win_config'
};
const closeExceptions = { //esto es lo mismo q lo de arriba pero pal boton de cerrar
    settings: 'btn_config'
};

const defaultSize = { width: '700px', height: '480px' };

function initWindowManager() {
    const triggers = document.querySelectorAll('[id^="appbar-"], [id^="appcenter-"]');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const appName = trigger.id.replace('appbar-', '').replace('appcenter-', '');

            //AppManager.loadApp(appName); <-- ya no se usa, ahora se usa la funcion sysExecApp(appName); q es mas facil y dinamica jeje
            sysExecApp(appName);

            /* YA NO SE USA:
            const windowId = windowExceptions[appName] || `win_${appName}`;
            const closeId = closeExceptions[appName] || `btn_${appName}`;
            const windowEl = document.getElementById(windowId);
            
            if (!windowEl) {
                showAlertBox("❌ Error",`No se ha encontrado la aplicacion: ${windowId}`);
                return;
            }
            
            const size = customSizes[appName] || defaultSize;
            
            windowEl.style.width = size.width;
            windowEl.style.height = size.height;
            windowEl.classList.remove('hidden');
            
            const closeBtn = document.getElementById(closeId);
            if (closeBtn && !closeBtn.dataset.listenerAdded) {
                closeBtn.addEventListener('click', () => {
                    windowEl.classList.add('hidden');
                });
                closeBtn.dataset.listenerAdded = 'true';
            }*/
        });
    });
}

function setupCloseButtons() {
    document.querySelectorAll('.grab-btn').forEach(btn => {
        if (btn.textContent === 'X') {

            if (btn.dataset.closeListenerAdded) return;
            btn.dataset.closeListenerAdded = 'true';

            btn.addEventListener('click', (e) => {
                const winEl = e.target.closest('.window');
                const windowId = winEl.id;
                let appName = windowId.replace('win_', '');
                
                const appNameMap = {
                    'config': 'settings',

                    'askforfilecreation': null,
                    'savenote': null,
                    'askForVideoFile': null,
                    'askForImageFile': null,
                    'askforuserspassword': null,
                    'sysaskfornewuserdata': null
                };

                if  (appNameMap.hasOwnProperty(appName) && appNameMap[appName] === null) {
                    winEl.classList.add('hidden');
                    return;
                }

                if (appNameMap.hasOwnProperty(appName)) {
                    appName = appNameMap[appName];
                }

                if (AppManager.loadedApps.has(appName)) {
                    AppManager.unloadApp(appName);
                } else {
                    winEl.classList.add('hidden');
                }
            });
        }
    });
}

async function minimizeWindow(win) {
    const appNameMap = {'config':'settings'};
    const raw = win.id.replace('win_', '');
    const appName = appNameMap[raw] || raw;
    win.dataset.minimized = 'true';
    win.classList.add('hidden');

    const appObj = SysVar.appBarIcons.find(a => a.app === appName);
    if (appObj) {
        appObj.minimized = true;
        renderAppBar();
    } else {
        const appIcon = await getPathAppIcon(appName);
        const displayName = AppManager.loadedApps.get(appName)?.displayName || appName;
        appBarAddApp(appIcon, displayName, appName, true, false);
    }
    renderAppBar();
}

function restoreWindow(winOrId) {
    const appNameMap = {'config':'settings'};
    const win = typeof winOrId === 'string'
        ? document.getElementById(winOrId)
        : winOrId;

    if (!win) return;

    win.classList.remove('hidden');
    win.dataset.minimized = 'false';

    const raw = win.id.replace('win_', '');
    const appName = appNameMap[raw] || raw;
    
    const appObj = SysVar.appBarIcons.find(a => a.app === appName);
    if (appObj) {
        appObj.minimized = false;
        if (!appObj.permanent) {
            appObj.minimized = false;
            const idx = SysVar.appBarIcons.findIndex(a => a.app === appName);
            if (idx !== -1) SysVar.appBarIcons.splice(idx, 1);
            renderAppBar();
        } else {
            appObj.minimized = false;
            renderAppBar();
        }
    } else {
        renderAppBar();
    }
}

function initWindowBehavior(win) {
    const grab = win.querySelector(".grab");
    const resizeHandle = win.querySelector(".resize-handle");

    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    let resizing = false;
    let startX, startY, startWidth, startHeight;

    let savedWidth = null;
    let savedHeight = null;
    let savedLeft = null;
    let savedTop = null;

    const closeBtn = grab.querySelector('.grab-btn');
    if (!win.classList.contains('no-noresize')) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '4px';
        buttonsContainer.style.alignItems = 'center';
        buttonsContainer.style.flexShrink = '0';
        

        const maximizeBtn = document.createElement('button');
        maximizeBtn.className = 'grab-btn';
        maximizeBtn.textContent = '□';

        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'grab-btn';
        minimizeBtn.textContent = '_';

        maximizeBtn.addEventListener('click', () => {
            if (SysVar.windowManager0) {
                if (win.classList.contains('win-max')) {
                    win.classList.remove('win-max');
                    maximizeBtn.textContent = '□';

                    if (savedWidth) win.style.width = savedWidth;
                    if (savedHeight) win.style.height = savedHeight;
                    if (savedLeft) win.style.left = savedLeft;
                    if (savedTop) win.style.top = savedTop;
                    showTopBar();   
                } else {
                    savedWidth = win.style.width || window.getComputedStyle(win).width;
                    savedHeight = win.style.height || window.getComputedStyle(win).height;
                    savedLeft = win.style.left || window.getComputedStyle(win).left;
                    savedTop = win.style.top || window.getComputedStyle(win).top;

                    win.classList.add('win-max');
                    win.style.width = '';
                    win.style.height = '';
                    win.style.left = '';
                    win.style.top = '';
                    maximizeBtn.textContent = '❐';
                    hideTopBar();
                }
            }
        });

        minimizeBtn.addEventListener('click', () => {
            minimizeWindow(win);
        });

        closeBtn.remove();
        buttonsContainer.appendChild(minimizeBtn);
        buttonsContainer.appendChild(maximizeBtn);
        buttonsContainer.appendChild(closeBtn);

        grab.appendChild(buttonsContainer);
    } 

    grab.addEventListener("mousedown", (e) => {
        if (SysVar.windowManager0) {
            if (e.target.closest("button")) return;
            if (win.classList.contains('win-max')) return;

            dragging = true;
            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;
            win.style.zIndex = ++topZ;
        }
    });

    win.addEventListener('mousedown', () => {
        win.style.zIndex = ++topZ;
        document.querySelectorAll('.window').forEach(w => w.classList.remove('win-focused'));
        win.classList.add('win-focused');
    });

    if (resizeHandle && !win.classList.contains('no-resize')) {
        resizeHandle.addEventListener("mousedown", (e) => {
            if (SysVar.windowManager0) {
                resizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = win.offsetWidth;
                startHeight = win.offsetHeight;
                win.style.zIndex = ++topZ;
                e.preventDefault();
            }
        });
    }

    document.addEventListener("mousemove", (e) => {
        if (SysVar.windowManager0) {
            if (dragging) {
                win.style.left = `${e.clientX - offsetX}px`;
                win.style.top = `${e.clientY - offsetY}px`;
            }

            if (resizing) {
                win.style.width =
                    Math.max(startWidth + (e.clientX - startX), 200) + "px";
                win.style.height =
                    Math.max(startHeight + (e.clientY - startY), 120) + "px";
            }
        }
    });

    document.addEventListener("mouseup", () => {
        if (SysVar.windowManager0) {
            dragging = false;
            resizing = false;
        }
    });
}

window.minimizeWindow = minimizeWindow;
window.restoreWindow = restoreWindow;
window.initNewWindow = function(winEl) {
    initWindowBehavior(winEl);
    setupCloseButtons();
}

window.scriptReady('winmanager');