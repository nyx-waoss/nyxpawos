console.log("[NyxPawOS] Current: sys.js");
/*
sys.js es el archivo principal de NyxPawOS, no confundir con el maestro!! El maestro carga todo y luego "muere", el principal (este) maneja todo el sistema pero no lo carga.

*/

const startupErrorText = document.getElementById('startupscrtext');
const startupLoading = document.getElementById('startupscrimg');

if (startupErrorText) {
    startupErrorText.classList.add('hidden');
}
if (startupLoading) {
    startupLoading.classList.add('hidden');
}

const sysConsoleLog = {
    log: (args) => {
        console.log('[NyxPawOS] ', args)
    },
    error: (args) => {
        console.error('[NyxPawOS] ', args)
    },
    warn: (args) => {
        console.warn('[NyxPawOS] ', args)
    }
};

setTimeout(() => {
    if (navigator.onLine) {
        sysPreloadApp('sysshutdown', true);
        SysVar.sysshutdownUIAvailable = true;
    } else {
        SysVar.sysshutdownUIAvailable = false;
    }
},1000);

let system_crashed = false;
/*BSOD */
function sysBsod(errorCode, errorText, type='normal') {
    document.documentElement.style.cursor = 'none';
    

    const _crashStack = new Error().stack;
    
    window.crashInfo = {
        causedby: _crashStack?.split('\n')[2]?.trim() || 'Unknown',
        stack: _crashStack,
        errorCode: errorCode,
        errorText: errorText,
        type: type,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        loadedApps: [...(AppManager?.loadedApps?.keys() || [])],
        memory: performance?.memory?.usedJSHeapSize || null,
    };

    try {
        localStorage.setItem('sys_last_crash', JSON.stringify({
            type: 'fatal',
            title: 'System Crash',
            info: `Code: ${errorCode} | ${errorText} | Caused by: ${crashInfo.causedby}`,
            date: new Date(),
            stack: crashInfo.stack
        }));
    } catch(e) {}

    const crashLogText = `Code: ${errorCode} | ${errorText} | Caused by: ${crashInfo.causedby}`;
    tempSysAddEvent('fatal', 'System Crash', crashLogText);
    localStorage.setItem('sysStartupConfig', 'ShowBSODAlert');

    system_crashed = true;

    console.log('🔴 BSOD called:', errorCode, errorText, type);
    console.trace();
    if (document.getElementById('bsod')) return;
    sysComQuitTasks();
    //const bsodDiv = document.getElementById('bsod');
    document.querySelectorAll("body *:not(script)").forEach(el => el.remove());
    const bsodDiv = document.createElement('div');
    bsodDiv.className = 'hidden';
    bsodDiv.id = 'bsod';
    if (type === 'booting') {
        bsodDiv.innerHTML =
        `<h1>❌</h1>
        <p id="bsodErrorCode" class='hidden'></p>
        <p id="bsodErrorText" class='hidden'></p>
        <p>0 0 0 0 0 F<br>0 0 0 0 0 D</p>`;
    } else {
        bsodDiv.innerHTML =
        `<h1>❌</h1>
        <h3>An unexpected system error has occurred.</h3>
        <p>It will restart automatically to continue.</p>
        <div id="sysdivider"></div>
        <p id="bsodErrorCode" class='hidden'>X-XXX-XXX</p>
        <p id="bsodErrorText">Unknown error.</p>`;
    }
    document.body.appendChild(bsodDiv);


    setTimeout(() => {
        const errorCodeOut = document.getElementById('bsodErrorCode');
        const errorTextOut = document.getElementById('bsodErrorText');

        errorCodeOut.textContent = errorCode;
        errorTextOut.textContent = errorText;
        bsodDiv.classList.remove('hidden');
        localStorage.setItem('sys_status', 'shutdown');
        window._bsodTimeout = setTimeout(() => {
            window.location.href = "index.html";
        }, 10000);
    },300);
}
//fin del sistema de bsod

//check
function checkLoadingTimeout() {
    setTimeout(() => {
        const startupScr = document.getElementById('startupscr');
        if (!startupScr) return;
        if (!startupScr.classList.contains('hidden')) {
            console.warn('An unknown error has occurred. Bootscreen is taking too long.');

            const loadProgressText = document.getElementById('startupscr_progresstext');
            if (loadProgressText) {
                loadProgressText.classList.remove('hidden');
                loadProgressText.textContent = 'Unexpected error, please check console!';
                loadProgressText.style.color = '#ff9800';
            }
        }
    }, 15000); // espera 15 segundos a ver si ya se quito la pinchi pantalla de carga o no
}
checkLoadingTimeout();
localStorage.removeItem('sys_boot_heartbeat');

const params = new URLSearchParams(window.location.search);
const mode = params.get('mode');

if (mode === 'safe') {
    document.body.style.backgroundImage = "url('assets/bs.png')";
    document.documentElement.style.setProperty('--blur-multiplier', 0);
    document.getElementById('main-style').href = 'safe.css';
}

//vars
/*const systemSound = {
    error: new Audio('../assets/error.mp3'),
    info: new Audio('../assets/error2.mp3'),
    noti: new Audio('../assets/noti.mp3')
};*/

//let formato24h = false;
//let appDownloaded = []

if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        
        sysUpdateBattery(battery);
        
        battery.addEventListener('levelchange', () => {
            sysUpdateBattery(battery);
        });
        
        battery.addEventListener('chargingchange', () => {
            sysUpdateBattery(battery);
        });
    });
} else {
    sysUpdateBattery('error');
    console.warn('Battery API not available');
}


const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

function connectMediaElements() {
    const mediaElements = document.querySelectorAll('audio, video');
    
    mediaElements.forEach(element => {
        if (!element.dataset.connected) {
            const source = audioContext.createMediaElementSource(element);
            source.connect(gainNode);
            element.dataset.connected = 'true';
        }
    });
}

connectMediaElements();

const observer = new MutationObserver(connectMediaElements);
observer.observe(document.body, { childList: true, subtree: true });

document.getElementById('sysaudio_el').addEventListener('input', function() {
    const volume = this.value / 100;
    gainNode.gain.value = volume;
});

let sysEmgMenuTimer = null;
let sysUsers = localStorage.getItem('sysUsers');
if (sysUsers) {
    sysUsers = JSON.parse(sysUsers);
} else {
    sysUsers = {
        'user': {
            displayName: 'User',
            password: '',
            createdAt: Date.now(),
            permlevel: 'admin'
        }
    };
}

const monthsNM = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

let actualDate = new Date();
let StarredDates = new Set();
let systemIsOffline = false;





/*VARIABLES GLOBALES */
window.SysVar = window.SysVar || {};
SysVar.devMode = false;
SysVar.sysEvents = [];
SysVar.format24h = false;
SysVar.appDownloaded = [];
SysVar.systemSound = {
    error: new Audio('../assets/error.mp3'),
    info: new Audio('../assets/error2.mp3'),
    noti: new Audio('../assets/noti.mp3')
};
SysVar.showconsoleerr = document.getElementById('showerrorscheckbox');
SysVar.blockShutdown = false;
SysVar.lockedSession = true;
SysVar.disableJSload = false;
SysVar.windowManager0 = true;
SysVar.sessionAutoStart = [
    "input",
    "UI",
    "audio",
    "programs",
    "session"
];
SysVar.currenttheme = 'dark';//light
SysVar.themes = {
    dark: {
        '--btn-primary-base': 'rgb(0, 145, 255)',
        '--btn-primary-hover': 'rgb(54, 168, 255)',
        '--btn-primary-active': 'rgb(0, 126, 222)',

        '--sysbar-base': 'rgba(0, 0, 0, 0.288)',
        '--sysbar-second': '#0000007b',
        '--sysbar-third': '#181818ea',

        '--btn-secondary-base': 'rgba(75, 75, 75, 0.5)',
        '--btn-secondary-hover': 'rgba(101, 101, 101, 0.66)',
        '--btn-secondary-active': 'rgba(45, 45, 45, 0.5)',

        '--win-grab-bg': 'rgba(0, 0, 0, 0.288)',
        '--win-grab-title': 'rgb(255, 255, 255)',

        '--win-grab-btn-icon': 'rgb(255, 255, 255)',
        '--win-grab-btn': 'rgba(0, 0, 0, 0.372)',
        '--win-grab-btn-hover': 'rgba(107, 107, 107, 0.425)',

        '--win-bg': 'rgba(0, 0, 0, 0.656)',
        '--win-second': 'rgba(0, 0, 0, 0.438)',
        '--win-text': 'rgb(255, 255, 255)',

        '--uisetting-base': 'rgb(46, 46, 46)',
        '--uisetting-hover': 'rgb(62, 62, 62)',
        '--settings-divider': 'rgba(255, 255, 255, 0.212)',

        '--uisetting-second': '#555',
        '--uisetting-third': '#292929',

        '--file-btn-base': 'rgba(75, 75, 75, 0.5)',
        '--file-btn-hover': 'rgba(101, 101, 101, 0.66)',
        '--file-btn-active': 'rgba(45, 45, 45, 0.5)',
        '--file-btn-selected': 'rgba(0, 78, 138, 0.419)',
        '--file-btn-border': 'rgba(0, 0, 0, 0.5)'
    },
    light: {
        '--btn-primary-base': 'rgb(0, 145, 255)',
        '--btn-primary-hover': 'rgb(54, 168, 255)',
        '--btn-primary-active': 'rgb(0, 126, 222)',

        '--sysbar-base': 'rgba(255, 255, 255, 0.288)',
        '--sysbar-second': '#ffffff7b',
        '--sysbar-third': '#ffffffea',

        '--btn-secondary-base': 'rgba(255, 255, 255, 0.5)',
        '--btn-secondary-hover': 'rgba(255, 255, 255, 0.66)',
        '--btn-secondary-active': 'rgba(255, 255, 255, 0.5)',

        '--win-grab-bg': 'rgba(255, 255, 255, 0.288)',
        '--win-grab-title': 'rgb(0, 0, 0)',

        '--win-grab-btn-icon': 'rgb(0, 0, 0)',
        '--win-grab-btn': 'rgba(255, 255, 255, 0.372)',
        '--win-grab-btn-hover': 'rgba(0, 0, 0, 0.425)',

        '--win-bg': 'rgba(255, 255, 255, 0.656)',
        '--win-second': 'rgba(255, 255, 255, 0.438)',
        '--win-text': 'rgb(0, 0, 0)',

        '--uisetting-base': 'rgb(226, 226, 226)',
        '--uisetting-hover': 'rgb(203, 203, 203)',
        '--settings-divider': 'rgba(50, 50, 50, 0.212)',

        '--uisetting-second': '#b4b4b4',
        '--uisetting-third': '#9c9c9c',

        '--file-btn-base': 'rgba(0, 0, 0, 0.2)',
        '--file-btn-hover': 'rgba(0, 0, 0, 0.35)',
        '--file-btn-active': 'rgba(0, 0, 0, 0.5)',
        '--file-btn-selected': 'rgba(0, 78, 138, 0.419)',
        '--file-btn-border': 'rgba(0, 0, 0, 0.5)'
    }
};
SysVar.currentuser = {
    user: 'system',
    dName: 'System',
    permissions: 'system'
};
SysVar.filesQuickAccess = [
    {
        emoji:'🎬',
        text: 'Videos',
        _dynamicRoute: `videos`,
        eltype: 'folder'
    },
    {
        emoji:'🖼️',
        text: 'Imagenes',
        _dynamicRoute: `images`,
        eltype: 'folder'
    },
    {
        emoji:'📄',
        text: 'Documentos',
        _dynamicRoute: `documents`,
        eltype: 'folder'
    },
    {
        emoji:'⬇️',
        text: 'Descargas',
        _dynamicRoute: `downloads`,
        eltype: 'folder'
    },
    {
        emoji:'🖥️',
        text: 'This PC',
        route: '/',
        eltype: 'folder'
    }
];

SysVar.notifications = []
SysVar.flagAlwaysAllowEvals = false;
SysVar.pointerFilesSaveDialogOpen = false;
SysVar.pointerFilesSaveDialogFilename = 'mi-nota.txt';
SysVar.pointerFilesSaveDialogSaveYN = false;
SysVar.tempCurrentAppBarApp = '';
SysVar.appBarIcons = [
  { "icon": "assets/apps/settings/3.png", "name": "Configuracion", "app": "settings", "minimized": false, "permanent": true },
  { "icon": "assets/apps/notes/3.png", "name": "Bloc de notas", "app": "notes", "minimized": false, "permanent": true },
  { "icon": "assets/apps/calc/3.png", "name": "Calculadora", "app": "calc", "minimized": false, "permanent": true },
  { "icon": "assets/apps/browser/3.png", "name": "PawNet", "app": "browser", "minimized": false, "permanent": true },
  { "icon": "assets/apps/files/3.png", "name": "Archivos", "app": "files", "minimized": false, "permanent": true },
  { "icon": "assets/apps/calendar/3.png", "name": "Calendario", "app": "calendar", "minimized": false, "permanent": true },
  { "icon": "assets/apps/terminal/3.png", "name": "Terminal", "app": "terminal", "minimized": false, "permanent": true }
];
SysVar.tempCurrentAppCenterApp = '';
SysVar.tempCurrentAppCenterImg = '';
SysVar.tempCurrentAppCenterName = '';
SysVar.appsUsage = [];
SysVar.pointerTopZ = 0;
SysVar.currentlang = "auto";
SysVar.userversion = "26.1";
SysVar.maxversion = "26.1";
SysVar.nytclient_apikey = "";
SysVar.notebookai_notebooks = [];
SysVar.loggedUsers = [];
SysVar.windowsBeforeLock = {};
SysVar.userBeforeLock = null;
SysVar.bootFinished = false;
SysVar.sysshutdownUIAvailable = false;
SysVar.sysRunningServices = [
    {
        name: 'Dock',
        id: 'dock.srv',
        icon: 'assets/apps/launchpad/3.png',
    },
    {
        name: 'Window Manager',
        id: 'windowmanager.srv',
        icon: 'assets/desktop.png',
    },
    {
        name: 'Language Manager',
        id: 'langmanager.srv',
        icon: 'assets/apps/unknown.png',
    },
    {
        name: 'Language Pack Service',
        id: 'lang.json',
        icon: 'assets/apps/unknown.png',
    },
    {
        name: 'AI Service',
        id: 'aiservice.srv',
        icon: 'assets/nekiri.png',
    },
    {
        name: 'NeptuneFS',
        id: 'filesystemNFS.srv',
        icon: 'assets/apps/unknown.png',
    },
    {
        name: 'System Critical',
        id: 'mainsession/sys.srv',
        icon: 'assets/therianb.png',
    }
];
SysVar.contacts_contacts = [];
SysVar.safeFiles = [];
SysVar.logonAutoStart = [];
SysVar.userDataCollection = {
    ip:"unknown",
    internetProvider:"unknown",
    city:"unknown",
    country:"unknown",
};
SysVar.userPrivacyPreferences = ['location','network'];


//Servicios
function sysCloseServiceById(serviceId) {
    if (serviceId.endsWith('.srv') || serviceId.endsWith('.json')) {
        SysVar.sysRunningServices = SysVar.sysRunningServices.filter(item => item.id !== serviceId);
    }
}

/*VARIABLES GLOBALES END */
//reestablecer variables desde localstorage:
const usedBefore = localStorage.getItem('used-before');

//---------------------------------------------------------------------------------------------------------------------
let _isSavingConfig = false;
async function saveDataReg() {
    if (!window.fsReady) {
        console.warn('saveDataReg called before FS ready, aborting.');
        return;
    }
    _isSavingConfig = true;
    try {
        if (mode === 'safe') {
            const confirmSaveRege = await showMsgBox("msgbox_data","Quieres guardar los cambios?", "Guardar", "Descartar");
            if (!confirmSaveRege) {
                return;
            }
        }

        try {
            if (!window.fs.fileExist('/system')) {
                window.fs.createFolder('system', '/');
            }
            if (!window.fs.fileExist('/system/general')) {
                window.fs.createFolder('general', '/system');
            }
            const props = {
                format24h: SysVar.format24h,
                windowManager0: SysVar.windowManager0,
                disableJSload: SysVar.disableJSload,
                devMode: SysVar.devMode,
                currenttheme: SysVar.currenttheme,
                currentlang: SysVar.currentlang,
                userversion: SysVar.userversion,
                wallpaper: SysVar.wallpaper,
                nytclient_apikey: SysVar.nytclient_apikey,
                filesQuickAccess: JSON.stringify(SysVar.filesQuickAccess),
                sessionAutoStart: JSON.stringify(SysVar.sessionAutoStart),
                appBarIcons: JSON.stringify(SysVar.appBarIcons),
                notebookai_notebooks: JSON.stringify(SysVar.notebookai_notebooks),
                contacts_contacts: JSON.stringify(SysVar.contacts_contacts),
                safeFiles: JSON.stringify(SysVar.safeFiles),
                logonAutoStart: JSON.stringify(SysVar.logonAutoStart),
                userPrivacyPreferences: JSON.stringify(SysVar.userPrivacyPreferences)
            };

            let configContent = '';
            for (const [key, value] of Object.entries(props)) {
                if (value !== undefined) {
                    configContent += `${key}=${value};\n`;
                } else {
                    console.error(`Error while saving data: "${key}" is undefined`);
                }
            }

            let eventsContent = '';
            if (SysVar.sysEvents !== undefined) {
                eventsContent = JSON.stringify(SysVar.sysEvents);
            }

            if (window.fs.fileExistInPath('main.conf', '/system/general')) {
                window.fs.modifyFile('main.conf', configContent, '/system/general');
            } else {
                window.fs.createFile('main.conf', configContent, '/system/general');
            }

            if (window.fs.fileExistInPath('events.data', '/system/general')) {
                window.fs.modifyFile('events.data', eventsContent, '/system/general');
            } else {
                window.fs.createFile('events.data', eventsContent, '/system/general');
            }

            console.log('[NyxPawOS] Config saved to /system/general/main.conf');

        } catch (error) {
            console.error('Error while saving data:', error);
        }
    } finally {
        _isSavingConfig = false;
    }
}

    /*
    try {
        if (SysVar.sessionAutoStart !== undefined) {
            localStorage.setItem('sessionAutoStart', JSON.stringify(SysVar.sessionAutoStart));
        } else {
            console.error('Error while saving data: "sessionAutoStart" is undefined');
        }
        if (SysVar.sysEvents !== undefined) {
            localStorage.setItem('sysEvents', JSON.stringify(SysVar.sysEvents));
        } else {
            console.error('Error while saving data: "sysEvents" is undefined');
        }
    } catch (error) {
        console.error('Error while saving data arrays:',error);
    }
    

    const data = {};
    const props = [
        'format24h',
        'windowManager0',
        'disableJSload',
        'devMode',
        'currenttheme',
        'filesQuickAccess'
    ]

    props.forEach(prop => {
        if (SysVar[prop] !== undefined) {
            data[prop] = prop === 'filesQuickAccess'
                /? JSON.stringify(SysVar[prop])
                : SysVar[prop];
        } else {
            console.error(`Error while saving data: "${prop}" is undefined`);
        }
    });

    if (Object.keys(data).length > 0) {
        try {
            localStorage.setItem('SysRegConfig', JSON.stringify(data));
        } catch (error) {
            console.error('Error while saving data:',error);
        }
    }
    */


function normalizeConfigValue(raw) {
    return raw
        .replace(/'/g, '"')
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
}

function loadDataReg() {
    try {
        if (window.fs.fileExistInPath('main.conf', '/system/general')) {
            const configContent = openFile('main.conf', '/system/general');

            if (configContent) {
                //const lines = configContent.split('\n');
                const singleLine = configContent
                    .replace(/;\s*\n/g, ';\n')
                    .split('\n')
                    .reduce((acc, line) => {
                        if (/^[a-zA-Z_][a-zA-Z0-9_]*=/.test(line.trim())) {
                            acc.push(line);
                        } else {
                            if (acc.length > 0) {
                                acc[acc.length - 1] += line;
                            }
                        }
                        return acc;
                    }, []); 


                for (const line of singleLine) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.includes('=')) continue;

                    const eqIndex = trimmed.indexOf('=');
                    const key = trimmed.substring(0, eqIndex).trim();
                    const rawValue = trimmed.substring(eqIndex + 1).trim().replace(/;$/, '');

                    try {
                        switch (key) {
                            case 'format24h':
                                SysVar.format24h = rawValue === 'true';
                                break;
                            case 'windowManager0':
                                SysVar.windowManager0 = rawValue === 'true';
                                break;
                            case 'disableJSload':
                                SysVar.disableJSload = rawValue === 'true';
                                break;
                            case 'devMode':
                                SysVar.devMode = rawValue === 'true';
                                break;
                            case 'currenttheme':
                                SysVar.currenttheme = rawValue;
                                break;
                            case 'currentlang':
                                SysVar.currentlang = rawValue;
                                break;
                            case 'userversion':
                                SysVar.userversion = rawValue;
                                break;
                            case 'nytclient_apikey':
                                SysVar.nytclient_apikey = rawValue;
                                break;
                            case 'filesQuickAccess':
                                SysVar.filesQuickAccess = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'appBarIcons':
                                SysVar.appBarIcons = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'sessionAutoStart':
                                SysVar.sessionAutoStart = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'notebookai_notebooks':
                                SysVar.notebookai_notebooks = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'safeFiles':
                                SysVar.safeFiles = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'contacts_contacts':
                                SysVar.contacts_contacts = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'logonAutoStart':
                                SysVar.logonAutoStart = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'userPrivacyPreferences':
                                SysVar.userPrivacyPreferences = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'wallpaper':
                                SysVar.wallpaper = rawValue;
                                break;
                            default:
                                console.warn(`loadDataReg: unknown key "${key}" in main.conf`);
                        }
                    } catch (parseError) {
                        console.error(`Error parsing key "${key}" in main.conf:`, parseError);
                    }
                }

                console.log('[NyxPawOS] Config loaded from /system/general/main.conf');
            }
        } else {
            console.warn('loadDataReg: main.conf not found, using defaults');
        }

        if (window.fs.fileExistInPath('events.data', '/system/general')) {
            const eventsContent = openFile('events.data', '/system/general');
            if (eventsContent) {
                SysVar.sysEvents = JSON.parse(eventsContent);
            }
        }
        const lastCrash = localStorage.getItem('sys_last_crash');
        if (lastCrash) {
            try {
                const crashEvent = JSON.parse(lastCrash);
                SysVar.sysEvents.unshift(crashEvent);
                localStorage.removeItem('sys_last_crash');
                // Ya que el FS esta listo, guardar los eventos actualizados
                // saveDataReg() se llamara despues del boot, pero por si acaso:
                if (window.fs && window.fs.fileExistInPath('events.data', '/system/general')) {
                    window.fs.modifyFile('events.data', JSON.stringify(SysVar.sysEvents), '/system/general');
                }
            } catch(e) {
                console.error('Error recovering crash log:', e);
            }
        }

        initSysTheme();
        SysVar.appBarIcons = SysVar.appBarIcons.filter(a => a.app !== 'appcenter');

    } catch (error) {
        console.error('Error while loading data:', error);
    }
    /*
    try {
        const sessionAUST = localStorage.getItem('sessionAutoStart');
        const sessionSYEV = localStorage.getItem('sysEvents');
        if (sessionAUST !== null) {
            SysVar.sessionAutoStart = JSON.parse(sessionAUST);
        }
        if (sessionSYEV !== null) {
            SysVar.sysEvents = JSON.parse(sessionSYEV);
        }
    } catch (error) {
        console.error('Error while loading data arrays:',error);
    }
    
    try {
        const saved = localStorage.getItem('SysRegConfig');
        if (saved) {
            const data = JSON.parse(saved);

            if (data.format24h !== undefined) SysVar.format24h = data.format24h;
            if (data.windowManager0 !== undefined) SysVar.windowManager0 = data.windowManager0;
            if (data.disableJSload !== undefined) SysVar.disableJSload = data.disableJSload;
            if (data.devMode !== undefined) SysVar.devMode = data.devMode;
            if (data.currenttheme !== undefined) SysVar.currenttheme = data.currenttheme;

            if (data.filesQuickAccess !== undefined) {
                try {
                    SysVar.filesQuickAccess = JSON.parse(data.filesQuickAccess);
                } catch (error) {
                    console.error('Error while loading data "filesQuickAccess":',error);
                }
            }
        }
    } catch (error) {
        console.error('Error while loading data:',error);
    }
    */
}

function msgBoxTranslateText(str) {
    const lang = SysVar.currentlang || "en";
    return translations[lang]?.[str] ?? translations["en"]?.[str] ?? str;
}

//funcion msgbox
function showPromptMsgBox(title, text, okbtn_text, cancelbtn_text, options={}) {
    const _title = msgBoxTranslateText(title);
    const _text = msgBoxTranslateText(text);
    const _okbtn_text = msgBoxTranslateText(okbtn_text);
    const _cancelbtn_text = msgBoxTranslateText(cancelbtn_text);
    return new Promise((resolve) => {
        const {
            as_win = false,
            icon = '⚠️'
        } = options;
        if (!as_win) {
            const msgBox = document.getElementById('msg-box')
            const msgTitle = document.getElementById('msg-box-title');
            const msgText = document.getElementById('msg-box-text');
            const msgInput = document.getElementById('msg-box-input');
            const msgButtonOk = document.getElementById('msg-box-okbtn');
            const msgButtonCancel = document.getElementById('msg-box-cancelbtn');
            const bgOverlay = document.getElementById('msg-box-bgoverlay');

            bgOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.445)";

            msgTitle.textContent = _title;
            msgText.textContent = _text;
            msgButtonOk.textContent = _okbtn_text;
            msgButtonCancel.textContent = _cancelbtn_text;
            msgInput.value = '';
            msgInput.setAttribute('autocomplete', 'off');

            msgBox.style.zIndex = topZ + 10;
            bgOverlay.style.zIndex = topZ + 9;

            msgBox.classList.remove('hidden');
            msgButtonOk.classList.remove('hidden');
            bgOverlay.classList.remove('hidden');
            msgInput.classList.remove('hidden');

            msgInput.focus();

            const handleEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    msgButtonOk.click();
                }
            };
            msgInput.addEventListener('keydown', handleEnter);

            msgButtonOk.onclick = () => {
                const value = msgInput.value.trim();
                msgBox.classList.add('hidden');
                bgOverlay.classList.add('hidden');
                msgInput.classList.add('hidden');
                msgInput.removeEventListener('keydown', handleEnter);
                resolve({confirmed: true, value: value});
            };

            msgButtonCancel.onclick = () => {
                msgBox.classList.add('hidden');
                bgOverlay.classList.add('hidden');
                msgInput.classList.add('hidden');
                msgInput.removeEventListener('keydown', handleEnter);
                resolve({confirmed: false, value: null});
            };
        } else {
            const msgBox = document.getElementById('msg-box-win')
            const msgTitle = document.getElementById('msg-box-win-title');
            const msgText = document.getElementById('msg-box-win-text');
            const msgInput = document.getElementById('msg-box-win-input');
            const msgButtonOk = document.getElementById('msg-box-win-okbtn');
            const msgButtonCancel = document.getElementById('msg-box-win-cancelbtn');
            const msgIcon = document.getElementById('msg-box-win-icon');

            msgTitle.textContent = _title;
            msgText.textContent = _text;
            msgButtonOk.textContent = _okbtn_text;
            msgButtonCancel.textContent = _cancelbtn_text;
            msgIcon.textContent = icon;
            msgInput.value = '';
            msgInput.setAttribute('autocomplete', 'off');

            msgBox.style.zIndex = topZ + 10;

            msgBox.classList.remove('hidden');
            msgButtonOk.classList.remove('hidden');
            msgInput.classList.remove('hidden');

            msgInput.focus();

            const handleEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    msgButtonOk.click();
                }
            };
            msgInput.addEventListener('keydown', handleEnter);

            msgButtonOk.onclick = () => {
                const value = msgInput.value.trim();
                msgBox.classList.add('hidden');
                msgInput.classList.add('hidden');
                msgInput.removeEventListener('keydown', handleEnter);
                resolve({confirmed: true, value: value});
            };

            msgButtonCancel.onclick = () => {
                msgBox.classList.add('hidden');
                msgInput.classList.add('hidden');
                msgInput.removeEventListener('keydown', handleEnter);
                resolve({confirmed: false, value: null});
            };
        }
    });
}

function showMsgBox(title, text, okbtn_text, cancelbtn_text, options={}) {
    const _title = msgBoxTranslateText(title);
    const _text = msgBoxTranslateText(text);
    const _okbtn_text = msgBoxTranslateText(okbtn_text);
    const _cancelbtn_text = msgBoxTranslateText(cancelbtn_text);
    return new Promise((resolve) => {
        const {
            as_win = false,
            icon = '⚠️'
        } = options;
        if (!as_win) {
            const msgBox = document.getElementById('msg-box');
            const msgTitle = document.getElementById('msg-box-title');
            const msgText = document.getElementById('msg-box-text');
            const msgInput = document.getElementById('msg-box-input');
            const msgButtonOk = document.getElementById('msg-box-okbtn');
            const msgButtonCancel = document.getElementById('msg-box-cancelbtn');
            const bgOverlay = document.getElementById('msg-box-bgoverlay');

            bgOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.445)";

            msgTitle.textContent = _title;
            msgText.textContent = _text;
            msgButtonOk.textContent = _okbtn_text;
            msgButtonCancel.textContent = _cancelbtn_text;
            

            msgBox.style.zIndex = topZ + 10;
            bgOverlay.style.zIndex = topZ + 9;

            msgInput.classList.add('hidden');
            msgBox.classList.remove('hidden');
            msgButtonOk.classList.remove('hidden');
            bgOverlay.classList.remove('hidden');

            msgButtonOk.onclick = () => {
            msgBox.classList.add('hidden');
            bgOverlay.classList.add('hidden');
                resolve(true);
            };

            msgButtonCancel.onclick = () => {
                msgBox.classList.add('hidden');
                bgOverlay.classList.add('hidden');
                resolve(false);
            };
        } else {
            const msgBox = document.getElementById('msg-box-win');
            const msgTitle = document.getElementById('msg-box-win-title');
            const msgText = document.getElementById('msg-box-win-text');
            const msgInput = document.getElementById('msg-box-win-input');
            const msgButtonOk = document.getElementById('msg-box-win-okbtn');
            const msgButtonCancel = document.getElementById('msg-box-win-cancelbtn');
            const msgIcon = document.getElementById('msg-box-win-icon');

            msgTitle.textContent = _title;
            msgText.textContent = _text;
            msgButtonOk.textContent = _okbtn_text;
            msgButtonCancel.textContent = _cancelbtn_text;
            msgIcon.textContent = icon;

            msgBox.style.zIndex = topZ + 10;

            msgInput.classList.add('hidden');
            msgBox.classList.remove('hidden');
            msgButtonOk.classList.remove('hidden');

            msgButtonOk.onclick = () => {
                msgBox.classList.add('hidden');
                resolve(true);
            };

            msgButtonCancel.onclick = () => {
                msgBox.classList.add('hidden');
                resolve(false);
            };
        }
    });
}

function showAlertBox(title, text, options={}) {
    const _title = msgBoxTranslateText(title);
    const _text = msgBoxTranslateText(text);
    const {
        as_win = false,
        icon = '⚠️'
    } = options;
    if (!as_win) {
        const msgBox = document.getElementById('msg-box');
        const msgTitle = document.getElementById('msg-box-title');
        const msgText = document.getElementById('msg-box-text');
        const msgInput = document.getElementById('msg-box-input');
        const msgButtonOk = document.getElementById('msg-box-okbtn');
        const msgButtonCancel = document.getElementById('msg-box-cancelbtn');
        const bgOverlay = document.getElementById('msg-box-bgoverlay');

        sysPlaySound('error');

        bgOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.445)";

        msgTitle.textContent = _title;
        msgText.textContent = _text;
        msgButtonOk.textContent = "Sin definir";
        msgButtonCancel.textContent = "Ok";

        msgBox.style.zIndex = topZ + 10;
        bgOverlay.style.zIndex = topZ + 9;

        msgInput.classList.add('hidden');
        msgBox.classList.remove('hidden');
        msgButtonOk.classList.add('hidden');
        bgOverlay.classList.remove('hidden');

        msgButtonCancel.onclick = () => {
            msgBox.classList.add('hidden');
            bgOverlay.classList.add('hidden');
        };
    } else {
        const msgBox = document.getElementById('msg-box-win');
        const msgTitle = document.getElementById('msg-box-win-title');
        const msgText = document.getElementById('msg-box-win-text');
        const msgInput = document.getElementById('msg-box-win-input');
        const msgButtonOk = document.getElementById('msg-box-win-okbtn');
        const msgButtonCancel = document.getElementById('msg-box-win-cancelbtn');
        const msgIcon = document.getElementById('msg-box-win-icon');

        sysPlaySound('error');


        msgTitle.textContent = _title;
        msgText.textContent = _text;
        msgButtonOk.textContent = "Sin definir";
        msgButtonCancel.textContent = "Ok";
        msgIcon.textContent = icon;

        msgBox.style.zIndex = topZ + 10;

        msgInput.classList.add('hidden');
        msgBox.classList.remove('hidden');
        msgButtonOk.classList.add('hidden');

        msgButtonCancel.onclick = () => {
            msgBox.classList.add('hidden');
        };
    }
}
/*Ejemplo de uso para los prompts y msgbox

CONFIRMACION:
                                              ⬇ Titulo         ⬇ Pregunta                           ⬇ Texto del boton 1   ⬇ Texto del boton 2
const confirmDeleteData = await showMsgBox("Advertencia!","Quieres borrar todos tus datos?", "Eliminar mis datos", "Cancelar",{as_win:false,icon:'⚠️'});
    if (confirmDeleteData) {                                                                                    Mostrar como ventana ↑                 ↑ Icono
        //Que hacer si se confirma y despues si quieres pon algun else o algo :D
    }

ALERTAS:
               ⬇ Titulo          ⬇ Texto de la alerta          ⬇ Mostrar como ventana 
showAlertBox("Advertencia!","Este es un mensaje de alerta.",{as_win:false,icon:'⚠️'});
                                                                                     ↑ Icono



PROMPTS:
async function preguntarNombre() {//         ⬇ Titulo       ⬇ Pregunta       ⬇ Boton 1   ⬇ Texto del boton 2
    const nombre = await showPromptMsgBox('Nombre', 'Cual es tu nombre?', 'Enviar', 'Cancelar',{as_win:false,icon:'⚠️'});
    if (!nombre.confirmed) return; //cerrar si se cancela                        Mostrar como ventana ↑                 ↑ Icono
    if (!nombre.value) { //mostrar error si no se ingresa nada
        showAlertBox('Error','Ingresa un nombre');
        return;
    }

    //codigo
}










*/

//---------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------------
//Funciones del clima
// Variables globales
window.Weathertemp = undefined;
window.Weatherfeels = undefined;
window.Weathermin = undefined;
window.Weathermax = undefined;
window.Weatherplace = undefined;
window.Weatherdescripcion = undefined;
window.WeatherLoaded = false;
window.WeatherPromise = null;

function initWeatherInfo() {
    WeatherPromise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(function(position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            Promise.all([
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weathercode&daily=temperature_2m_max,temperature_2m_min&timezone=auto`)
                    .then(res => res.json()),
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                    .then(res => res.json())
            ]).then(([data, place]) => {
                window.Weathertemp = data.current.temperature_2m;
                window.Weatherfeels = data.current.apparent_temperature;
                window.Weathermin = data.daily.temperature_2m_min[0];
                window.Weathermax = data.daily.temperature_2m_max[0];
                window.Weatherdescripcion = getWeatherDescription(data.current.weathercode);

                window.Weatherplace = place.address.city 
                    || place.address.town 
                    || place.address.village 
                    || "Desconocido";

                window.WeatherLoaded = true;
                resolve();
            }).catch(reject);

        }, reject);
    });

    return WeatherPromise;
}

function getWeatherDescription(code) {

    if (code === 0) return "Despejado";
    if (code >= 1 && code <= 3) return "Parcialmente nublado";
    if (code >= 51 && code <= 67) return "Lluvia";
    if (code >= 95) return "Tormenta";

    return "Otro";
}

/*Sistema */
/*funciones del sistema*/
const askForPasswordWin = document.getElementById('win_askforuserspassword');
const loginscrLoginText = document.getElementById('loginscr_logintext');
const loginscr = document.getElementById('loginscr');
let loginin_user = '';

async function sysshutdown(askConfirm = true,typeshutdown='normal',extrainfo) {
    try {
        document.getElementById('start-dropdown').classList.add('hidden');
        document.getElementById('control-dropdown').classList.add('hidden');
        document.getElementById('nekiri-dropdown').classList.add('hidden');
        document.getElementById('brief-dropdown').classList.add('hidden');
        document.getElementById('appbar-ctxmenu').classList.add('hidden');
        
        document.getElementById('quickview').classList.add('hidden');
        hideappcenter();
        if (SysVar.blockShutdown) {
            showAlertBox('msgbox_err_icon', 'function sysshutdown() is blocked by your administrator');
        } else {
            if (askConfirm) {
                let shutdownCustomMsg = ''
                if (typeshutdown === 'normal') {
                    shutdownCustomMsg = "Quieres apagar el sistema? Asegurate de guardar tus datos";
                } else if (typeshutdown === 'fromapp') {
                    shutdownCustomMsg = `La app ${extrainfo} esta intentando apagar el sistema.\nContinuar?`;
                } else {
                    shutdownCustomMsg = "Quieres apagar el sistema? Asegurate de guardar tus datos";
                }
                if (SysVar.sysshutdownUIAvailable) {
                    if (SysVar.currentuser.user === 'system' || !document.getElementById('loginscr').classList.contains('hidden')) {
                        SysVar.lockedSession = false;
                        setTimeout(() => {
                            SysVar.lockedSession = true;
                        },110);
                    }
                    sysExecApp('sysshutdown');
                    await waitUntil(() => typeof sysshutdownMode === 'function');
                    setTimeout(() => sysshutdownMode('shutdown',shutdownCustomMsg), 90);

                } else {
                    const confirmSysShutdown = await showMsgBox("msgbox_warning_icon",shutdownCustomMsg, "Apagar", "Cancelar");
                    
                    if (confirmSysShutdown) {
                        hideTopBar();
                        hideAppBar();
                        sysComQuitTasks();

                        await saveDataReg();

                        localStorage.setItem('sys_status', 'shutdown');
                        
                        document.getElementById('loginscr').classList.add('hidden');
                        
                        setTimeout(() => {
                            document.documentElement.style.setProperty('--wallpaper', 'black');
                            document.documentElement.style.cursor = 'none';
                            setTimeout(() => {
                                document.body.classList.add("hidden");
                                const sysScripts = document.querySelectorAll('script');
                                sysScripts.forEach(script => script.parentNode.removeChild(script));
                                localStorage.setItem('sys_status', 'off');
                                window.close();
                            }, 1100);
                        }, 900);
                        
                    }
                }
            } else {
                hideTopBar();
                hideAppBar();
                sysComQuitTasks();
                await saveDataReg();
                
                localStorage.setItem('sys_status', 'shutdown');
                setTimeout(() => {
                    document.documentElement.style.setProperty('--wallpaper', 'black');
                    setTimeout(() => {
                        document.body.classList.add("hidden");
                        const sysScripts = document.querySelectorAll('script');
                        sysScripts.forEach(script => script.parentNode.removeChild(script));
                        localStorage.setItem('sys_status', 'off');
                        window.close();
                    }, 1100);
                }, 900);
            }
        }
    }  catch (error) {
        console.error('Failed to shutdown system: ', error);
        showAlertBox('msgbox_err_icon', 'El sistema no se pudo apagar');
    }
}

async function sysrestart(askConfirm = true) {
    try {
        hideappcenter();
        document.getElementById('quickview').classList.add('hidden');
        document.getElementById('start-dropdown').classList.add('hidden');
        document.getElementById('control-dropdown').classList.add('hidden');
        document.getElementById('nekiri-dropdown').classList.add('hidden');
        document.getElementById('brief-dropdown').classList.add('hidden');
        document.getElementById('appbar-ctxmenu').classList.add('hidden');
        
        if (askConfirm) {
            if (SysVar.sysshutdownUIAvailable) {
                if (SysVar.currentuser.user === 'system' || !document.getElementById('loginscr').classList.contains('hidden')) {
                    SysVar.lockedSession = false;
                    setTimeout(() => {
                        SysVar.lockedSession = true;
                    },110);
                }
                sysExecApp('sysshutdown');
                await waitUntil(() => typeof sysshutdownMode === 'function');
                setTimeout(() => sysshutdownMode('restart'), 90);
            } else {
                const confirmSysRestart = await showMsgBox("msgbox_warning_icon","Quieres reiniciar el sistema? Asegurate de guardar tus datos", "Reiniciar", "Cancelar");
                
                if (confirmSysRestart) {
                    await saveDataReg();

                    hideTopBar();
                    hideAppBar();
                    sysComQuitTasks();
                    document.getElementById('loginscr').classList.add('hidden');
                    localStorage.setItem('sys_status', 'off');
                    setTimeout(() => {
                        document.getElementById('loginscr').classList.add('hidden');
                        window.location.href = "index.html";
                    }, 2200);   
                }
            }
        } else {
            await saveDataReg();

            hideTopBar();
            hideAppBar();
            sysComQuitTasks();
            localStorage.setItem('sys_status', 'off');
            setTimeout(() => {                
                document.getElementById('loginscr').classList.add('hidden');
                window.location.href = "index.html";
            }, 2200);
        }
    } catch (error) {
        console.error('Failed to reboot system: ', error);
        showAlertBox('msgbox_err_icon', 'El sistema no se pudo reiniciar');
    }
}
/*
function showSysinfo(inTabId) {
    showSysinfo(inTabId)

}*/

function updateNotisList(animateNewItem=false) {
    const notisList = document.getElementById('NotificationList');
    notisList.innerHTML = '';

    SysVar.notifications.forEach((notiElArr, idx) => {
        let notiData = notiElArr;
        if (typeof notiElArr === 'string') {
            try {
                const jsonString = notiElArr
                    .replace(/(\w+):/g, '"$1":')
                    .replace(/:'([^']+)'/g, ':"$1"');
                
                notiData = JSON.parse(jsonString);
            } catch (e) {
                console.error('Error parsing notification:', e);
                return;
            }
        }

        const notiItem = document.createElement('div');
        notiItem.className = 'sysNotification';
        notiItem._notiRef = notiData;

        if (animateNewItem && idx === 0) {
            notiItem.style.animation = 'slideIn 0.2s ease-out';
        }

        const notiItemDel = document.createElement('button');
        notiItemDel.className = 'sysNotificationDel';
        notiItemDel.innerHTML = 'X';
        notiItemDel.onclick = () => {
            const refIndex = SysVar.notifications.indexOf(notiItem._notiRef);

            notiItem.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
            notiItem.style.transform = 'translateX(120%)';
            notiItem.style.opacity = '0';

            setTimeout(() => {
                
                const height = notiItem.offsetHeight;
                notiItem.style.transition = 'height 0.2s ease-out, margin 0.2s ease-out, padding 0.2s ease-out';
                notiItem.style.overflow = 'hidden';
                notiItem.style.height = height + 'px';

                notiItem.offsetHeight;

                notiItem.style.height = '0';
                notiItem.style.marginTop = '0';
                notiItem.style.marginBottom = '0';
                notiItem.style.paddingTop = '0';
                notiItem.style.paddingBottom = '0';

                setTimeout(() => {
                    if (refIndex !== -1) {
                        SysVar.notifications.splice(refIndex, 1);
                    }
                    notiItem.remove();

                    if (SysVar.notifications.length === 0) {
                        notisList.classList.add('hidden');
                    }
                }, 200);

            }, 200);
        }

        const notiItemIco = document.createElement('img');
        notiItemIco.src = notiData.icon;

        const notiItemMain = document.createElement('div');
        notiItemMain.className = 'sysNotificationMain';

        const notiItemTitle = document.createElement('p');
        notiItemTitle.textContent = notiData.title;
        notiItemTitle.className = 'notiItem_title';

        const notiItemCont = document.createElement('p');
        notiItemCont.textContent = notiData.content;

        notiItemMain.appendChild(notiItemTitle);
        notiItemMain.appendChild(notiItemCont);

        const notiItemIconAndCont = document.createElement('div');
        notiItemIconAndCont.className = 'sysNotificationIconAndCont';
        notiItemIconAndCont.appendChild(notiItemIco);
        notiItemIconAndCont.appendChild(notiItemMain);

        const notiItemFirstBtn = document.createElement('button');
        if (notiData.firstbtn.show) {
            notiItemFirstBtn.classList = 'sysNotificationBtn';
        } else {
            notiItemFirstBtn.classList = 'sysNotificationBtn hidden';
        }
        notiItemFirstBtn.textContent = notiData.firstbtn.text;
        notiItemFirstBtn.onclick = () => {
            if (notiData.firstbtn.action === "exec") {
                sysExecApp(String(notiData.firstbtn.data));
            } else if (notiData.firstbtn.action === "alert") {
                showAlertBox('msgbox_noti', String(notiData.firstbtn.data), {as_win:true,icon:'ℹ️'});
            } else if (notiData.secondbtn.action === "delnoti") {
                const refIndex = SysVar.notifications.indexOf(notiItem._notiRef);
                notiItem.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
                notiItem.style.transform = 'translateX(120%)';
                notiItem.style.opacity = '0';
                setTimeout(() => {
                    const height = notiItem.offsetHeight;
                    notiItem.style.transition = 'height 0.2s ease-out, margin 0.2s ease-out, padding 0.2s ease-out';
                    notiItem.style.overflow = 'hidden';
                    notiItem.style.height = height + 'px';
                    notiItem.offsetHeight;
                    notiItem.style.height = '0';
                    notiItem.style.marginTop = '0';
                    notiItem.style.marginBottom = '0';
                    notiItem.style.paddingTop = '0';
                    notiItem.style.paddingBottom = '0';
                    setTimeout(() => {
                        if (refIndex !== -1) {SysVar.notifications.splice(refIndex, 1);}
                        notiItem.remove();
                        if (SysVar.notifications.length === 0) {notisList.classList.add('hidden');}
                    }, 200);
                }, 200);
            } else if (notiData.firstbtn.action === "eval") {
                eval(String(notiData.firstbtn.data)); //Peligroso? Si. Hay una opcion mejor? Probablemente. La conozco? No. Por eso uso eval.
            } else {
                console.warn(`[Notification] ${String(notiData.firstbtn.action)} is not a valid action.`);
            }
        }
        const notiItemSecondBtn = document.createElement('button');
        if (notiData.secondbtn.show) {
            notiItemSecondBtn.classList = 'sysNotificationBtn';
        } else {
            notiItemSecondBtn.classList = 'sysNotificationBtn hidden';
        }
        notiItemSecondBtn.textContent = notiData.secondbtn.text;
        notiItemSecondBtn.onclick = () => {
            if (notiData.secondbtn.action === "exec") {
                sysExecApp(String(notiData.secondbtn.data));
            } else if (notiData.secondbtn.action === "alert") {
                showAlertBox('msgbox_noti', String(notiData.secondbtn.data), {as_win:true,icon:'ℹ️'});
            } else if (notiData.secondbtn.action === "delnoti") {
                const refIndex = SysVar.notifications.indexOf(notiItem._notiRef);
                notiItem.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
                notiItem.style.transform = 'translateX(120%)';
                notiItem.style.opacity = '0';
                setTimeout(() => {
                    const height = notiItem.offsetHeight;
                    notiItem.style.transition = 'height 0.2s ease-out, margin 0.2s ease-out, padding 0.2s ease-out';
                    notiItem.style.overflow = 'hidden';
                    notiItem.style.height = height + 'px';
                    notiItem.offsetHeight;
                    notiItem.style.height = '0';
                    notiItem.style.marginTop = '0';
                    notiItem.style.marginBottom = '0';
                    notiItem.style.paddingTop = '0';
                    notiItem.style.paddingBottom = '0';
                    setTimeout(() => {
                        if (refIndex !== -1) {SysVar.notifications.splice(refIndex, 1);}
                        notiItem.remove();
                        if (SysVar.notifications.length === 0) {notisList.classList.add('hidden');}
                    }, 200);
                }, 200);
            } else if (notiData.secondbtn.action === "eval") {
                eval(String(notiData.secondbtn.data)); //Peligroso: Si. Hay una opcion mejor?: Probablemente. La conozco?: No. Por eso uso eval.
            } else {
                console.warn(`[Notification] ${String(notiData.secondbtn.action)} is not a valid action.`);
            }
        }

        const notiItemBtnsDiv = document.createElement('div');
        notiItemBtnsDiv.className = 'sysNotificationBtnsDiv';
        notiItemBtnsDiv.appendChild(notiItemFirstBtn);
        notiItemBtnsDiv.appendChild(notiItemSecondBtn);

        notiItem.appendChild(notiItemDel);
        notiItem.appendChild(notiItemIconAndCont);
        notiItem.appendChild(notiItemBtnsDiv);

        notisList.appendChild(notiItem);
    });
}

function createNotification(icon='assets/nekiri.png', title='Notificacion', content='Nueva notificacion', firstbtn={ show:false, text:"Boton 1", action:"alert", data:"Boton 1 Presionado" }, secondbtn={ show:false, text:"Boton 2", action:"alert", data:"Boton 2 Presionado" }) {
    //firstbtn es algo tipo { show:false, text:"Boton 1", action:"exec", data:"notes" } <-- Ejecuta la app de notas
    SysVar.notifications.unshift({
        icon: icon,
        title: title,
        content: content,
        firstbtn: firstbtn,
        secondbtn: secondbtn
    });

    const notisList = document.getElementById('NotificationList');
    notisList.classList.remove('hidden');
    notisList.style.zIndex = topZ+10;

    updateNotisList(true);
}


function showappinfo() {
    const getWinInfoID = getFocusedWindowId();
    if (getWinInfoID === null) {
        showAlertBox("msgbox_warning","No hay informacion de la aplicacion actual", {as_win:true,icon:'⚠️'});
        return;
    }
    const getWinInfoTitle = getWindowTitleById(getWinInfoID);
    if (getWinInfoTitle === null) {
        showAlertBox("msgbox_unknown","Programa desconocido o inexistente", {as_win:true,icon:'⚠️'});
        return;
    }
    showAlertBox(getWinInfoTitle,`${getWinInfoTitle}\nID: ${getWinInfoID}`, {as_win:true,icon:'ℹ️'});
}

function hideTopBar() {
    const topBar = document.getElementById('top_bar');
    topBar.style.transform = 'translateY(-100%)';
}

function showTopBar() {
    const topBar = document.getElementById('top_bar');
    topBar.style.transform = 'translateY(0)';
}

function hideAppBar() {
    const appBar = document.getElementById('appbar');
    appBar.style.transform = 'translateX(-100vw)';
}

function showAppBar() {
    const appBar = document.getElementById('appbar');
    appBar.style.transform = 'translateX(0)';
}

/*document.querySelectorAll(".appbar-app").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
        const rect = btn.getBoundingClientRect();
        appsLabel.textContent = btn.querySelector("img").alt;
        appsLabel.style.left = rect.right + 8 + "px";
        appsLabel.style.top = rect.top + rect.height / 2 + "px";
        appsLabel.style.opacity = "1";
        appsLabel.style.transform = "translateY(-50%)";
    });
    btn.addEventListener("mouseleave", () => {
        appsLabel.style.opacity = "0";
    });
});*/

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

//appcenter
const appCenterClsBtn = document.getElementById('appcenterclose');
const appCenterWindow = document.getElementById('win_appcenter');
appCenterClsBtn.addEventListener('click', () => {
    appCenterWindow.classList.add('appcenter-hidden');
});

function hideappcenter() {
    appCenterWindow.classList.add('appcenter-hidden');
}

function sysBlurSetto(blurlevel) {
    document.documentElement.style.setProperty('--blur-multiplier', blurlevel);
}
//---------------------------------------------------------------------------------------------------------------------
/*reloj */
function updateTime() {
    const timeText = document.getElementById('timetext');
    if (!timeText) return;

    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    let period = "";

    if (!SysVar.format24h) {
        period = hours >= 12 ? " PM" : " AM";
        hours = hours % 12 || 12;
    }

    const h = hours.toString().padStart(2, "0");
    const m = minutes.toString().padStart(2, "0");
    const s = seconds.toString().padStart(2, "0");

    timeTextLogin = document.getElementById('loginscr_time');
    timeText.textContent = `${h}:${m}:${s}${period}`;
    timeTextLogin.textContent = `${h}:${m}${period}`;
}

appsLabel = document.getElementById('app-labels');
const appBarCtxMenu = document.getElementById('appbar-ctxmenu');

const startButton = document.getElementById('topbar_button');
const startDropdown = document.getElementById('start-dropdown');

let startDPOpen = false;

startButton.addEventListener("click", (e) => {
    e.stopPropagation();

    if (document.fullscreenElement) {
        document.getElementById('dropdown-menu-fullscreen').classList.add('hidden');
    } else {
        document.getElementById('dropdown-menu-fullscreen').classList.remove('hidden');
    }

    if (startDPOpen) {
        startDropdown.classList.add('hidden');
        startDPOpen = false;
        return;
    }

    const rect = startButton.getBoundingClientRect();

    startDropdown.style.left = rect.left + "px";
    startDropdown.style.top = rect.bottom + "px";
    startDropdown.style.zIndex = topZ + 3;
    startDropdown.classList.remove('hidden');

    startDPOpen = true;
});

startDropdown.addEventListener("click", () => {
    startDropdown.classList.add('hidden');
    startDPOpen = false;
});

document.addEventListener("click", () => {
    appBarCtxMenu.classList.add('hidden');
    document.getElementById('appcenter_ctxm').classList.add('hidden');
    document.getElementById('appcenter_ctxm_delappbtn').classList.add('hidden');
    if (!startDPOpen) return;

    startDropdown.classList.add('hidden');
    startDPOpen = false;
});

let programDPOpen = false;
const programButton = document.getElementById('topbar_program');
const programDropdown = document.getElementById('program-dropdown');
let currentTopBarApp = '';

programButton.addEventListener('click',(e) => {
    e.stopPropagation();
    if (programDPOpen) {
        programDropdown.classList.add('hidden');
        programDPOpen = false;
        return;
    }
    const rect = programButton.getBoundingClientRect();
    programDropdown.style.left = rect.left + 'px';
    programDropdown.style.top = rect.bottom + 'px';
    programDropdown.style.zIndex = topZ + 3;
    programDropdown.classList.remove('hidden');
    programDPOpen = true;
});

function updateTopBarProgram(winEl) {
    const appNameMap = { 'win_config': 'settings' };
    const rawId = winEl.id.replace('win_', '');
    const appName = appNameMap[winEl.id] || rawId;

    const systemWindows = [
        'askforfilecreation', 'savenote', 'askForVideoFile',
        'askForImageFile', 'askforuserspassword', 'sysaskfornewuserdata'
    ];
    if (systemWindows.includes(rawId)) return;

    currentTopBarApp = appName;
    const displayName = AppManager.loadedApps.get(appName)?.displayName
        || winEl.querySelector('.grab-title')?.textContent?.trim()
        || appName;

    programButton.textContent = displayName;
    programButton.classList.remove('hidden');

    window._topBarAbort?.abort();
    window._topBarAbort = new AbortController();

    document.querySelector('#program-dropdown button:last-child').addEventListener('click', () => {
        const focused = document.querySelector('.window.win-focused');
        if (!focused) return;
        const rawId = focused.id.replace('win_', '');
        const appName = { 'config': 'settings' }[rawId] || rawId;
        AppManager.unloadApp(appName);
        programDropdown.classList.add('hidden');
        programDPOpen = false;
    }, { signal: window._topBarAbort.signal });
}

window.addEventListener('load', () => {
    if (typeof AppManager === 'undefined') return;
    const _origUnload = AppManager.unloadApp.bind(AppManager);
    AppManager.unloadApp = function(appName) {
        _origUnload(appName);
        const focused = document.querySelector('.window.win-focused');
        if (!focused) {
            programButton.classList.add('hidden');
            programDropdown.classList.add('hidden');
        }
    };
});
function toggleFocusedFullscreen() {
    if (!currentTopBarApp) return;
    const windowExceptions = { settings: 'win_config' };
    const winId = windowExceptions[currentTopBarApp] || `win_${currentTopBarApp}`;
    const winEl = document.getElementById(winId);
    if (!winEl) return;

    const isFullscreen = winEl.classList.contains('win-fullscreen')
                      || winEl.classList.contains('win-max');

    sysFullscreenApp(currentTopBarApp, !isFullscreen);

    programDropdown.classList.add('hidden');
    programDPOpen = false;
}

function closeFocusedApp() {
    if (!currentTopBarApp) return;
    AppManager.unloadApp(currentTopBarApp);
    programButton.classList.add('hidden');
    programDropdown.classList.add('hidden');
    programDPOpen = false;
    currentTopBarApp = '';
}


const nekiriInput = document.getElementById('nekiri_input');
const nekiriRes = document.getElementById('nekiri_response');
const nekiriSend = document.getElementById('nekiri_send');
const nekiriSmartcard = document.getElementById('nekiri_smartcard');
const nekiriSmartcardBtn = document.getElementById('nekiri_search');
const nekiriSmartcardImg = document.getElementById('nekiri_netimg');

let nekiriDPOpen = false;
const nekiriButton = document.getElementById('topbar_nekiri');
const nekiriDropdown = document.getElementById('nekiri-dropdown');

nekiriButton.addEventListener('click', (e) => {
    e.stopPropagation();

    if (nekiriDPOpen) {
        nekiriDropdown.classList.add('hidden');
        nekiriDPOpen = false;
        return;
    }

    const rect = nekiriButton.getBoundingClientRect();

    nekiriDropdown.style.right = (window.innerWidth - rect.right) + "px";
    nekiriDropdown.style.top = rect.bottom + "px";
    nekiriDropdown.style.zIndex = topZ + 10;

    nekiriDropdown.classList.remove('hidden');

    nekiriDPOpen = true;
});

nekiriSend.addEventListener('click', () => {
    nekiriShowAnswer();
});

nekiriInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        nekiriShowAnswer();
    }
});

let nekiriAnswers = [];
let nekiriButtonAction = '';
let nekiriButtonActionArg = '';


function nekiriShowSmartCard(type, args1 = '', args2 = '') {
    if (type === 'search') {
        nekiriSmartcardBtn.textContent = args1;
        nekiriButtonActionArg = args2;
        nekiriButtonAction = 'search';
        nekiriSmartcardImg.src = 'assets/apps/browser/3.png';
        nekiriSmartcard.classList.remove('hidden');
    }
}

async function nekiriRunBtnFunc() {
    if (nekiriButtonAction === 'search') {
        sysExecApp('browser');
        await waitUntil(() => typeof browserSetWebTo === 'function');
        browserSetWebTo(nekiriButtonActionArg);
    }
} 



let nekiridp_nekiriresponse = ''
function nekiriShowAnswer() {
    nekiriSmartcard.classList.add('hidden');
    try {
        nekiridp_nekiriresponse = sysNekiriAsk(nekiriInput.value, undefined, 'system', {});
        nekiriInput.value = '';
    } catch(e) {
        console.error('Cannot get AI response:'+e);
        nekiriRes.textContent = `Ocurrio un error, vuelve a intentarlo mas tarde...`;
        nekiriInput.value = '';
        return;
    }
    if (nekiridp_nekiriresponse.card.show == true) {
        nekiriShowSmartCard(nekiridp_nekiriresponse.card.type, nekiridp_nekiriresponse.card.title, nekiridp_nekiriresponse.card.url);
    }
    if ((nekiridp_nekiriresponse.code).startsWith('2')) {
        nekiriRes.textContent = nekiridp_nekiriresponse.ans;
    } else if (nekiridp_nekiriresponse.code == '403') {
        nekiriRes.textContent = 'No tengo permiso para hacer eso.';
    } else if (nekiridp_nekiriresponse.code == '422') {
        nekiriRes.textContent = nekiridp_nekiriresponse.ans;
    } else if (nekiridp_nekiriresponse.code == '409') {
        nekiriRes.textContent = 'Si quieres resumir, modificar, o expandir un texto intentalo de nuevo en NotebookAI.';
    } else {
        nekiriRes.textContent = `Ocurrio un error: ${nekiridp_nekiriresponse.ans}`;
    }
    
    //nekiriShowSmartCard('search','Buscar en internet', encodeURI(`https://www.google.com/search?q=${userInput}&igu=1`));

    nekiriInput.value = '';
}

let controlDPOpen = false;
const controlButton = document.getElementById('topbar_control');
const controlDropdown = document.getElementById('control-dropdown');

controlButton.addEventListener("click", (e) => {
    e.stopPropagation();

    if (controlDPOpen) {
        controlDropdown.classList.add('hidden');
        controlDPOpen = false;
        return;
    }

    const rect = controlButton.getBoundingClientRect();

    controlDropdown.style.right = (window.innerWidth - rect.right) + "px";
    controlDropdown.style.top = rect.bottom + "px";
    controlDropdown.style.zIndex = topZ + 10;
    controlDropdown.classList.remove('hidden');

    controlDPOpen = true;
});

let briefDPOpen = false;
const briefButton = document.getElementById('topbar_brief');
const briefDropdown = document.getElementById('brief-dropdown');

briefButton.addEventListener('click', (e) => {
    e.stopPropagation();

    if (briefDPOpen) {
        briefDropdown.classList.add('hidden');
        briefDPOpen = false;
        return;
    }

    const rect = briefButton.getBoundingClientRect();

    briefDropdown.style.right = (window.innerWidth - rect.right) + "px";
    briefDropdown.style.top = rect.bottom + "px";
    briefDropdown.style.zIndex = topZ + 10;
    briefDropdown.style.backgroundImage = getNBriefBackgroundImg();

    briefDropdown.classList.remove('hidden');

    briefDPOpen = true;

    showDPNBriefDataWeather();
    showDPNBriefDataUsage();
});

function getNBriefBackgroundImg() {
    try {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        const NBriefCurrentTime = hours * 60 + minutes;

        const dayStart = 6 * 60;
        const dayEnd = 13 * 60 + 45;

        const eveningStart = 13 * 60 + 46;
        const eveningEnd = 18 * 60 + 25;

        if (NBriefCurrentTime >= dayStart && NBriefCurrentTime <= dayEnd) {
            return "url('assets/morning.png')";
        } else if (NBriefCurrentTime >= eveningStart && NBriefCurrentTime <= eveningEnd) {
            return "url('assets/afternoon.png')";
        } else {
            return "url('assets/night.png')";
        }
    } catch(error) {
        console.error('Error when loading nekiri brief background: '+error);
        return "url('assets/morning.png')";
    }
}

async function showDPNBriefDataWeather() {
    const weatherPlace = document.getElementById('brief_dp_content_weather_text_place');
    const weatherIcon = document.getElementById('brief_dp_content_weather_icon');
    const weatherTemp = document.getElementById('brief_dp_content_weather_text_temp');
    const weatherMaxNMin = document.getElementById('brief_dp_content_weather_text_maxmin');
    const weatherDescription = document.getElementById('brief_dp_content_weather_text_description');
    const weatherFeelslike = document.getElementById('brief_dp_content_weather_text_feelslike');

    try {
        if (!WeatherLoaded) {
            await (WeatherPromise || initWeatherInfo());
        }
    } catch(error) {
        console.error('Cannot get weather: '+error);
        weatherDescription.textContent = 'No se pudo obtener el clima.';
        weatherIcon.src = 'assets/weather/cloud.png';

        weatherPlace.textContent = 'Sin info';
        weatherTemp.textContent = '--';
        weatherMaxNMin.textContent = `↑ -- / ↓ --`;
        weatherFeelslike.textContent = `Sensacion termica desconocida`;

        return;
    }

    weatherPlace.textContent = Weatherplace;
    weatherTemp.textContent = `${Weathertemp}°C`;
    weatherMaxNMin.textContent = `↑ ${Weathermax}° / ↓ ${Weathermin}°`;
    weatherDescription.textContent = Weatherdescripcion;
    weatherFeelslike.textContent = `Sensacion termica de ${Weatherfeels}°C`;
    if (Weatherdescripcion === 'Despejado') {
        weatherIcon.src = 'assets/weather/sun.png';
    } else if (Weatherdescripcion === 'Parcialmente nublado') {
        weatherIcon.src = 'assets/weather/cloudy.png';
    } else if (Weatherdescripcion === 'Lluvia') {
        weatherIcon.src = 'assets/weather/rainy.png';
    } else if (Weatherdescripcion === 'Tormenta') {
        weatherIcon.src = 'assets/weather/thunder.png';
    } else {
        weatherIcon.src = 'assets/weather/cloud.png';
    }
}

async function showDPNBriefDataUsage() {
    const usageAppsContainer = document.getElementById('brief_dp_content_usage');
    usageAppsContainer.innerHTML = '';
    if (SysVar.appsUsage.length <= 0) {
        const appCard = document.createElement('div');
        appCard.className = 'brief_dp_content_usage_card';

        const appCardImg = document.createElement('img');
        appCardImg.className = 'brief_dp_content_usage_card_img';
        appCardImg.src = 'assets/nekiri.png';

        const appCardContent = document.createElement('div');
        appCardContent.className = 'brief_dp_content_usage_card_content';

        const appCardContentAppname = document.createElement('p');
        appCardContentAppname.className = 'brief_dp_content_usage_card_content_appname';
        appCardContentAppname.textContent = 'No has usado apps todavia.';
        const appCardContentUsage = document.createElement('p');
        appCardContentUsage.className = 'brief_dp_content_usage_card_content_apptimeuse';
        appCardContentUsage.textContent = '--';

        appCardContent.appendChild(appCardContentAppname);
        appCardContent.appendChild(appCardContentUsage);

        appCard.appendChild(appCardImg);
        appCard.appendChild(appCardContent);

        usageAppsContainer.appendChild(appCard);
        return;
    }
    const sortedUsage = [...SysVar.appsUsage].sort((a,b) => {
        const toSecs = (entry) =>
            parseInt(entry.hours) * 3600 +
            parseInt(entry.minutes) * 60 +
            parseInt(entry.secs);
        return toSecs(b) - toSecs(a);
    });
    const top3apps = sortedUsage.slice(0, 3);
    for (let i = 0; i < top3apps.length; i++) {
        const object = top3apps[i];

        const appCard = document.createElement('div');
        appCard.className = 'brief_dp_content_usage_card';

        const appCardImg = document.createElement('img');
        appCardImg.className = 'brief_dp_content_usage_card_img';
        appCardImg.src = await getPathAppIcon(object.app);

        const appCardContent = document.createElement('div');
        appCardContent.className = 'brief_dp_content_usage_card_content';

        const appCardContentAppname = document.createElement('p');
        appCardContentAppname.className = 'brief_dp_content_usage_card_content_appname';
        appCardContentAppname.textContent = object.app;
        const appCardContentUsage = document.createElement('p');
        appCardContentUsage.className = 'brief_dp_content_usage_card_content_apptimeuse';
        if (object.hours === '0' || object.hours === undefined || object.hours === null) {
            appCardContentUsage.textContent = `${object.minutes}m ${object.secs}s`;
        } else {
            appCardContentUsage.textContent = `${object.hours}h ${object.minutes}m`;
        }

        appCardContent.appendChild(appCardContentAppname);
        appCardContent.appendChild(appCardContentUsage);

        appCard.appendChild(appCardImg);
        appCard.appendChild(appCardContent);

        usageAppsContainer.appendChild(appCard);
    }
}



//sys shortcuts
//const sysEmgMenu = document.getElementById('sys-emg-menu');

document.addEventListener('keydown', e => {
    if (e.repeat) return;

    const tag = document.activeElement.tagName;
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (!document.getElementById('appcenter_nekiriHint').classList.contains('hidden')) {
            appcenterAskNekiri();
        }
    }
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;

    if ((e.ctrlKey || e.metaKey) && e.altKey && e.shiftKey && e.key.toLowerCase() === 'm') {
        if (!sysEmgMenuTimer) {
            sysEmgMenuTimer = setTimeout(() => {
                //sysEmgMenu.classList.remove('hidden');
                const sysEmgMenu = document.createElement('div');
                sysEmgMenu.id = 'sys-emg-menu';
                sysEmgMenu.innerHTML = 
                `<p>System Emergency Menu</p>
        <button onclick="document.getElementById('sys-emg-menu').remove()">❌ Close</button>
        <button onclick="sysclosesesion(); document.getElementById('sys-emg-menu').remove();">🔓 Sign Out</button>
        <button onclick="sysExecApp('taskmanager'); document.getElementById('sys-emg-menu').remove();">📋 Task Manager</button>
        <button onclick="sysShowRunDialog(); document.getElementById('sys-emg-menu').remove();">⌨️ Execute</button>
        <button onclick="sysshutdown(); document.getElementById('sys-emg-menu').remove();">⏻ Shutdown</button>
        <button onclick="sysrestart(); document.getElementById('sys-emg-menu').remove();">🔄 Reboot</button>
        <div></div>
        <button onclick="window.close()">🔴 EMERGENCY SHUTDOWN</button>
        <button onclick="window.location.href = 'index.html'">🟠 EMERGENCY RESTART</button>`;
                sysEmgMenu.style.zIndex = topZ + 30;
                document.body.appendChild(sysEmgMenu);
            }, 10);
        }
    }

    if (e.ctrlKey && e.shiftKey && e.key.toLocaleLowerCase() === 'e') {
        e.preventDefault();
        sysShowRunDialog();
    }

    if (e.key === 'Escape') {
        e.preventDefault();
        document.getElementById('quickview').classList.add('hidden');
        document.getElementById('quickview_vid').classList.add('hidden');
        document.getElementById('quickview_img').classList.add('hidden');
        document.getElementById('quickview_img').classList.add('hidden');
    }

    if (e.key === ' ') {
        e.preventDefault();
        
        if (!document.getElementById('quickview').classList.contains('hidden')) {
            hidequickview();
            return;
        }

        if (!AppManager.loadedApps.has('files')) return;

        const selected = window.fs.getSelectedItem();
        const selectedType = window.fs.getSelectedItemType();

        if (selected && selectedType === 'file') {
            e.preventDefault();
            const content = window.fs.openFile(selected);
            const ext = selected.split('.').pop().toLowerCase();

            if (['mp4', 'webm', 'ogg'].includes(ext)) {
                showQuickViewWin('video', content);
            } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
                const fullPath = window.fs.getCurrentDirectory();
                const cleanSelected = selected.replace(/[\uFE0F\uFE0E\u200D]/g, '').trim();
                const imgPath = fullPath === '/' ? `/${cleanSelected}` : `${fullPath}/${cleanSelected}`;
                _openDB().then(db => {
                    const tx = db.transaction('media', 'readonly');
                    const req = tx.objectStore('media').get(imgPath);
                    req.onsuccess = () => {
                        if (req.result) {
                            const url = URL.createObjectURL(req.result);
                            showQuickViewWin('img', url);
                        } else {
                            showAlertBox('msgbox_err', 'Imagen no encontrada.', {as_win:true, icon:'❌'});
                        }
                    };
                });
            } else {
                showQuickViewWin('text', content);
            }
        }
    }

    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (document.getElementById('win_appcenter').classList.contains('appcenter-hidden')) {
            sysExecApp('appcenter');
            setTimeout(() => {
                document.getElementById('appcenter_searchbar').focus();
            },120);
        } else {
            document.getElementById('win_appcenter').classList.add('appcenter-hidden');
            document.getElementById('appcenter_searchbar').value = '';
        }
    }
    if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        if (document.getElementById('win_appcenter').classList.contains('appcenter-hidden')) {
            sysExecApp('appcenter');
            setTimeout(() => {
                document.getElementById('appcenter_searchbar').focus();
            },120);
        } else {
            document.getElementById('win_appcenter').classList.add('appcenter-hidden');
            document.getElementById('appcenter_searchbar').value = '';
        }
    }
    
});

document.addEventListener('keyup', () => {
    clearTimeout(sysEmgMenuTimer);
    sysEmgMenuTimer = null;
})






  








/*Sonidos UI */
function sysPlaySound(soundname, loop=false) {
    if (SysVar.sessionAutoStart.includes('audio')) {
        if (SysVar.systemSound[soundname]) {
            SysVar.systemSound[soundname].currentTime = 0;
            SysVar.systemSound[soundname].loop = loop;
            SysVar.systemSound[soundname].play().catch(e => console.log('Failed to play system sound'));
        }
    } else {
        console.error('Audio Service not found');
        showAlertBox('msgbox_err', 'System Audio Service not found!', {as_win:true,icon:'❌'});
    }
}

function sysStopSound(soundname) {
    if (SysVar.systemSound[soundname]) {
        SysVar.systemSound[soundname].loop = false;
        SysVar.systemSound[soundname].pause();
        SysVar.systemSound[soundname].currentTime = 0;
    }
}

async function sysPreloadApp(appName, bypassLock = false) {
    if (typeof AppManager === 'undefined') return;
    if (SysVar.lockedSession && !bypassLock) return;
    await AppManager.preloadApp(appName);
}

window.sysPreloadApp = sysPreloadApp;

function sysExecApp(appName, options = {}) {
    if (typeof AppManager === 'undefined') {
        console.error('AppManager not available');
        return;
    }


    if (appName !== 'syssetup') {
        if (SysVar.lockedSession) {
            console.error('Session locked');
            showAlertBox('msgbox_err', 'The current session is locked by your administrator', {as_win:true,icon:'❌'});
            return;
        }
    }

    if (appName === 'appcenter') {
        const appCenter = document.getElementById('win_appcenter');
        if (appCenter) {
            document.getElementById('appcenter_searchbar').value = '';
    
            document.querySelectorAll('#appcenterapps .appcenter_appdiv').forEach(appDiv => {
                appDiv.classList.remove('appcenter-searchhidden');
            });
            document.getElementById('appcenter_nekiriHint').classList.add('hidden');
    
            appCenter.style.zIndex = topZ + 10;
            
            appCenter.classList.remove('appcenter-hidden');
            
            return;
        }
    }

    AppManager.loadApp(appName)
        .then(() => {
            const windowExceptions = {settings: 'win_config'};
            const windowID = windowExceptions[appName] || `win_${appName}`;
            const windowEL = document.getElementById(windowID);

            if (windowEL) {
                if (!windowEL.dataset.winInitialized) {
                    window.initNewWindow(windowEL);
                    windowEL.dataset.winInitialized = 'true';
                }
                if (typeof updateTopBarProgram === 'function') {
                    updateTopBarProgram(windowEL);
                }
            }

            if (windowEL && windowEL.classList.contains('fullscreen')) {
                sysFullscreenApp(appName, true);
            }

            if (options.tab && typeof window[`openSettingsTab`] === 'function') {
                window[`openSettingsTab`](options.tab);
            }

            renderAppBar();
        })
        .catch(err => {
            console.error(`Failed to execute '${appName}': `, err);
            document.documentElement.style.cursor = "default";
            if (navigator.onLine) {
                showAlertBox('msgbox_err_icon', `Ocurrio un error al abrir ${appName}`);
            } else {
                showAlertBox('msgbox_nonetwork', `Conectate a internet para abrir ${appName}`);
            }
        });
}

function sysComQuitTasks() {
    const loadedApps = AppManager.getLoadedApps();
    for (const appName of loadedApps) {
        AppManager.unloadApp(appName);
    }
}

function sysFullscreenApp(appName, enable = true) {
    const windowExceptions = {
        settings: 'win_config'
    };

    const windowID = windowExceptions[appName] || `win_${appName}`;
    const windowEL = document.getElementById(windowID);

    if (!windowEL) {
        console.error(`Window not found: ${windowID}`);
        return false;
    }

    if (enable) {
        windowEL.classList.add('win-fullscreen');
        windowEL.classList.remove('win-max');
        hideTopBar();
        hideAppBar();
    } else {
        windowEL.classList.remove('win-fullscreen');
        showTopBar();
        showAppBar();
    }

    return true;
}

window.sysFullscreenApp = sysFullscreenApp;
window.sysExecApp = sysExecApp;
window.sysComQuitTasks = sysComQuitTasks;

async function sysShowRunDialog() {
    const commandRun = await showPromptMsgBox('⬆️ Ejecutar', 'Ingresa el ID o quickCommand para ejecutar', 'Ejecutar', 'Cancelar');
    if (!commandRun.confirmed) return;
    if (!commandRun.value) {
        showAlertBox('msgbox_warning_icon','Ingresa un ID o quickCommand valido!');
        return;
    }
    try {

        const fullCommand = commandRun.value.split(" ");
        const command = fullCommand[0];
        const args = fullCommand.slice(1);

        if (command === 'exec') {
            sysExecApp(args[0]);
        } else if (command === 'q') {
            if (args[0] === 'run') {
                sysExecApp(args[1]);
            } else if (args[0] === 'shutdown') {
                if (args[1] === '-now') {
                    sysshutdown();
                } else {
                    const shutdownTime = args[1];
                    setTimeout(() => {
                        sysshutdown();
                    }, shutdownTime);
                }
            }
        } else if (command === 'com') {
            const consoleCom = args.join(' ');
            sysExecApp('terminal');
            await waitUntil(() => typeof runCommand === 'function');
            runCommand(consoleCom);
        } else if (command === 'dev') {
            if (SysVar.devMode) {
                if (args[0] === '--as$npss') {
                    if (args[1] === 'system.appBar.show()') {
                        showAppBar();
                    } else if (args[1] === 'system.appBar.hide()') {
                        hideAppBar();
                    } else if (args[1] === 'system.topBar.show()') {
                        showTopBar();
                    } else if (args[1] === 'system.topBar.hide()') {
                        hideTopBar();
                    } else if (args[1] === 'system.bypass.loginscr()') {
                        loginscr.classList.add('hidden');
                    } else if (args[1] === 'mod.desktopBG()') {
                        document.body.style.backgroundImage = `url(${args[2]})`;
                    } else {
                        showAlertBox('msgbox_err_icon', `${args[1]} is not supported as a NyxPawBasicScript! This error might occur if:\n- The script is too large\n- The script did not execute with enough permissions`)
                    }
                } else if (args[0] === '--as$npss') {
                    showAlertBox('msgbox_err_icon', 'npss (NyxPawSystemScripts) are no longer supported on quickCommand, please use the terminal or execute a npbs (NyxPawBasicScript).');
                } else if (args[0] === '--as$jsgs') {
                    const FNStr = args[1];
                    const FNMatch = FNStr.match(/^(\w+)\((.*)\)$/);

                    if (FNMatch) {
                        const jscomFN = FNMatch[1];
                        const jscomArgs = FNMatch[2].split(',').map(a => a.trim());

                        if (typeof window[jscomFN] === 'function') {
                            window[jscomFN](...jscomArgs);
                        }
                    }
                }
            } else {
                showAlertBox('msgbox_err_icon', 'No tienes permisos para ejecutar el comando: Modo dev no activado!');
            }
        } else if (command === 'eval') {
            const jsToExec = args.join(' ');
            if (SysVar.flagAlwaysAllowEvals) {
                eval(jsToExec);
            } else if (SysVar.devMode) {
                const sureToExecEval = await showPromptMsgBox('msgbox_warning_icon', 'Esta acción ejecutará código arbitrario en tiempo real. Un uso incorrecto puede causar pérdida de datos, errores críticos o vulnerabilidades de seguridad. Si no sabes exactamente qué hace este comando, cancela ahora.', 'Cancelar', 'Continuar');
                if (sureToExecEval.confirmed) return;
                eval(jsToExec);
            } else {
                showAlertBox('msgbox_err_icon', 'No tienes permisos para ejecutar el comando: Modo dev no activado!');
            }
        } else {
            showAlertBox('msgbox_err_icon', 'Comando desconocido');
        }

    } catch(error) {
        showAlertBox('msgbox_err_icon','Error:'+error);
    }
}


if (usedBefore) {
    if (!SysVar.sessionAutoStart.includes('input')) {
        document.body.style.pointerEvents = 'none';
        document.documentElement.style.cursor = 'none';
    }
}

async function formatSystem() {
    const confirmDeleteData = await showMsgBox("msgbox_warning_icon", "Estas a punto de borrar todos tus datos y configuraciones! Realmente quieres proceder? Tu sistema se apagara!", "Eliminar mis datos", "Cancelar");
    if (confirmDeleteData) {
        sysComQuitTasks();
        hideAppBar();
        hideTopBar();

        localStorage.clear();
        indexedDB.deleteDatabase("NeptuneFS");

        setTimeout(() => {
            window.close();
        }, 2000);
    }
}

function getBTSVGRoute(level) {
    if (level >= 80) {
        return 'assets/system/bt-full.svg';
    } else if (level >= 60) {
        return 'assets/system/bt-semifull.svg';
    } else if (level >= 40) {
        return 'assets/system/bt-half.svg';
    } else if (level >= 20) {
        return 'assets/system/bt-low.svg';
    } else {
        return 'assets/system/bt-none.svg';
    }
}

function sysUpdateBattery(battery) {
    if (battery === 'error') {
        const btIcon = document.getElementById('topbar_battery');
        btIcon.src = 'assets/system/error.svg';
        btIcon.classList.remove('battery-charging');
        btIcon.classList.remove('battery-empty');
    } else {
        const level = Math.round(battery.level * 100);
        const charging = battery.charging;

        const btIcon = document.getElementById('topbar_battery');

        btIcon.src = getBTSVGRoute(level);

        if (level < 10) {
            btIcon.classList.add('battery-empty');
        } else {
            btIcon.classList.remove('battery-empty');
        }

        if (level < 10 && !battery.charging) {
            createNotification('assets/system/bt-none.svg', 'Batería baja', `Batería al ${level}%. Conecta tu cargador pronto.`);
        }

        if (charging) {
            btIcon.src = 'assets/system/bt-charge.svg'
            btIcon.classList.add('battery-charging');
        } else {
            btIcon.src = getBTSVGRoute(level);
            btIcon.classList.remove('battery-charging');
        }
    }
}

function tempSysAddEvent(type, title, info) {
    const newEvent = {
        type: type,
        title: title,
        info: info,
        date: new Date()
    };

    SysVar.sysEvents.unshift(newEvent);
    if (SysVar.sysEvents.length > 500) {
        SysVar.sysEvents.pop();
    }
}

const showABEnabled = SysVar.showconsoleerr;

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('error', (e) => {
        if (e.filename && e.filename.includes(window.location.origin)) {
            //const errorMsg = `${e.message}\nArchivo: ${e.filename}\nLínea: ${e.lineno}`;
            const errorMsg = `Error: ${e.message}`;
            if (showABEnabled && showABEnabled.checked) {
                showAlertBox('msgbox_err', errorMsg, {as_win:true, icon:'❌'});
            }
            try {
                sysAddEvent('error', 'Error', errorMsg);
            } catch(error) {
                tempSysAddEvent('error', 'Error', errorMsg);
            }
        }
    });

    window.addEventListener('unhandledrejection', (e) => {
        const errorMsg = `Error: ${e.reason}`;
        if (showABEnabled && showABEnabled.checked) {
            showAlertBox('msgbox_err', errorMsg, {as_win:true, icon:'❌'});
        }
        try {
            sysAddEvent('error', 'Error', errorMsg);
        } catch(error) {
            tempSysAddEvent('error', 'Error', errorMsg);
        }
    })
});

const originalWarn = console.warn;
const originalError = console.error;
const originalInfo = console.info;
const originalLog = console.log;

const isMainWindow = window === window.top;

console.warn = function(...args) {
    originalWarn.apply(console, args);

    if (isMainWindow) {
        const errorMsg = args.join(' ');
        if (showABEnabled && showABEnabled.checked) {
            showAlertBox('msgbox_warning', errorMsg, {as_win:true, icon:'⚠️'});
        }
        try {
            sysAddEvent('warn', 'Warning', errorMsg);
        } catch(error) {
            tempSysAddEvent('warn', 'Warning', errorMsg);
        }
    }
}

console.error = function(...args) {
    originalError.apply(console, args);

    if (isMainWindow) {
        const errorMsg = args.join(' ');
        if (showABEnabled && showABEnabled.checked) {
            showAlertBox('msgbox_err', errorMsg, {as_win:true, icon:'❌'});
        }
        try {
            sysAddEvent('error', 'Error', errorMsg);
        } catch(error) {
            tempSysAddEvent('error', 'Error', errorMsg);
        }
    }
}

console.log = function(...args) {
    originalLog.apply(console, args);

    if (isMainWindow) {
        const msg = args.join(' ');
        try {
            sysAddEvent('log', 'Log', msg);
        } catch(error) {
            tempSysAddEvent('log', 'Log', msg);
        }
    }
}

console.info = function(...args) {
    originalInfo.apply(console, args);

    if (isMainWindow) {
        const msg = args.join(' ');
        try {
            sysAddEvent('info', 'Info', msg);
        } catch(error) {
            tempSysAddEvent('info', 'Info', msg);
        }
    }
}

window.addEventListener('message', (event) => {
    
    const { action, windowId, enable } = event.data;
    
    if (action === 'fullscreen') {
        const appName = windowId.replace('win_', '').replace('config', 'settings');
        sysFullscreenApp(appName, enable);
    } else if (action === 'maximize') {
        maximizeWindow(windowId);
    } else if (action === 'restore') {
        restoreWindow(windowId);
    } else if (action === 'shutdown') {
        const appName = windowId.replace('win_', '').replace('config', 'settings');
        sysshutdown(true,'fromapp',appName);
    } else if (action === 'launch') {
        const appName = windowId.replace('win_', '').replace('config', 'settings');
        sysExecApp(appName);
    } else if (action === 'logout') {
        sysclosesesion();
    } else if (action === 'kill') {
        const appName = windowId.replace('win_', '').replace('config', 'settings');
        AppManager.unloadApp(appName);
    } else if (action === 'addtoappbar') {
        const appName = windowId.replace('win_', '').replace('config', 'settings');
        requestAddAppBar(appName);
    }
});

function maximizeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win || !SysVar.windowManager0) return;
    
    if (win.classList.contains('win-max')) return;
    
    win.dataset.savedWidth = win.style.width || window.getComputedStyle(win).width;
    win.dataset.savedHeight = win.style.height || window.getComputedStyle(win).height;
    win.dataset.savedLeft = win.style.left || window.getComputedStyle(win).left;
    win.dataset.savedTop = win.style.top || window.getComputedStyle(win).top;
    
    win.classList.add('win-max');
    win.style.width = '';
    win.style.height = '';
    win.style.left = '';
    win.style.top = '';
    
    const maximizeBtn = win.querySelector('.grab-btn:not(:last-child)');
    if (maximizeBtn && maximizeBtn.textContent === '□') {
        maximizeBtn.textContent = '❐';
    }
    
    hideTopBar();
}

function restoreWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;
    
    win.classList.remove('win-max');
    win.classList.remove('win-fullscreen');
    
    if (win.dataset.savedWidth) {
        win.style.width = win.dataset.savedWidth;
        win.style.height = win.dataset.savedHeight;
        win.style.left = win.dataset.savedLeft;
        win.style.top = win.dataset.savedTop;
    }
    
    const maximizeBtn = win.querySelector('.grab-btn:not(:last-child)');
    if (maximizeBtn && maximizeBtn.textContent === '❐') {
        maximizeBtn.textContent = '□';
    }
    
    showTopBar();
    showAppBar();
}

function getFocusedWindowId() {

    const focused = document.querySelectorAll('.window.win-focused');

    if (focused.length === 0) {
        console.warn('Focused window not found.');
        return null;
    }

    if (focused.length > 1) {

        console.warn('Multiple windows focused.');

        focused.forEach(win => win.classList.remove('win-focused'));

        const last = focused[focused.length - 1];
        last.classList.add('win-focused');

        return last.id;
    }

    return focused[0].id;
}

function getWindowTitleById(winId) {

    const windowElement = document.getElementById(winId);

    if (!windowElement || !windowElement.classList.contains('window')) {
        return null;
    }

    const titleSpan = windowElement.querySelector('.grab-title');

    return titleSpan ? titleSpan.textContent.trim() : null;
}

function waitUntil(conditionFn, interval = 50) {
  return new Promise(resolve => {
    const check = setInterval(() => {
      if (conditionFn()) {
        clearInterval(check);
        resolve();
      }
    }, interval);
  });
}


document.addEventListener('mouseup', () => {
    document.querySelectorAll('.appbar-app').forEach(b => {
        b.style.transition = '';
    });
});
function _renderAppBarImpl() {
    if (!SysVar.sysRunningServices.some(item => item.id === 'dock.srv')) {
        document.getElementById('appbar').innerHTML = '';
        showAlertBox('msgbox_err','No se encontro el servicio del AppBar', {as_win:true,icon:'❌'});
        return;
    }
    const appBar = document.getElementById('appbar');
    appBar.innerHTML = '';

    SysVar.appBarIcons.forEach(appObj => {
        if (!("minimized" in appObj)) appObj.minimized = false;
        if (!("permanent" in appObj)) appObj.permanent = true;
    });

    function createAppBtn(appObj) {
        const btn = document.createElement('button');
        btn.className = 'appbar-app';
        btn.style.transition = 'none';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                btn.style.transition = '';
            });
        });
        btn.id = `appbar-${appObj.app}`;

        const img = document.createElement('img');
        img.className = 'app-img';
        img.src = appObj.icon;
        img.alt = appObj.name;
        btn.appendChild(img);

        const dot = document.createElement('div');
        dot.className = 'appbar-dot';
        dot.id = `appbar-dot-${appObj.app}`;
        const isLoaded = AppManager.loadedApps.has(appObj.app);
        const isMinimized = appObj.minimized === true;
        if (isLoaded || isMinimized) {
            dot.style.opacity = '1';
            dot.classList.add('appbar-dot-active');
        } else {
            dot.style.opacity = '0';
        }
        btn.appendChild(dot);

        btn.addEventListener('click', () => sysExecApp(appObj.app));

        btn.addEventListener('contextmenu', () => {
            const rect = btn.getBoundingClientRect();
            SysVar.tempCurrentAppBarApp = appObj.app;
            document.getElementById('appbar-ctxmenu-run').classList.add('hidden');
            document.getElementById('appbar-ctxmenu-del').classList.add('hidden');
            document.getElementById('appbar-ctxmenu-restore').classList.add('hidden');
            document.getElementById('appbar-ctxmenu-quit').classList.add('hidden');
            if (appObj.minimized) {
                document.getElementById('appbar-ctxmenu-restore').classList.remove('hidden');
                document.getElementById('appbar-ctxmenu-quit').classList.remove('hidden');
            } else {
                document.getElementById('appbar-ctxmenu-run').classList.remove('hidden');
                document.getElementById('appbar-ctxmenu-del').classList.remove('hidden');
            }
            if (AppManager.loadedApps.has(appObj.app)) {
                document.getElementById('appbar-ctxmenu-quit').classList.remove('hidden');
            }
            appBarCtxMenu.style.left = rect.right + 8 + 'px';
            appBarCtxMenu.style.top = rect.top + rect.height / 2 + 'px';
            appBarCtxMenu.style.transform = 'translateY(-50%)';
            appBarCtxMenu.style.zIndex = topZ + 2;
            appBarCtxMenu.classList.remove('hidden');
        });

        btn.addEventListener('mouseenter', () => {
            const rect = btn.getBoundingClientRect();
            appsLabel.textContent = appObj.name;
            appsLabel.style.left = rect.right + 8 + 'px';
            appsLabel.style.top = rect.top + rect.height / 2 + 'px';
            appsLabel.style.opacity = '1';
            appsLabel.style.transform = 'translateY(-50%)';
            appsLabel.style.zIndex = topZ + 2;

            const allBtns = [...document.querySelectorAll('.appbar-app')];
            const index = allBtns.indexOf(btn);
            allBtns.forEach((b, i) => {
                b.classList.remove('appbar-neighbor-1', 'appbar-neighbor-2');
                const dist = Math.abs(i - index);
                if (dist === 1) b.classList.add('appbar-neighbor-1');
                if (dist === 2) b.classList.add('appbar-neighbor-2');
            });
        });
        btn.addEventListener('mouseleave', () => {
            appsLabel.style.opacity = '0';
            document.querySelectorAll('.appbar-app').forEach(b => {
                b.classList.remove('appbar-neighbor-1', 'appbar-neighbor-2');
            });
        });

        btn.addEventListener('mousedown', () => {
            document.querySelectorAll('.appbar-app').forEach(b => {
                b.style.transition = 'none';
            });
        });

        return btn;
    }

    SysVar.appBarIcons
        .filter(a => a.permanent)
        .forEach(appObj => appBar.appendChild(createAppBtn(appObj)));

    const minimizedWins = SysVar.appBarIcons.filter(a => !a.permanent && a.minimized === true);
    const permanentWins = SysVar.appBarIcons.filter(a => a.permanent);
    if (minimizedWins.length > 0 && permanentWins.length > 0) {
        const separator = document.createElement('div');
        separator.className = 'appbar-separator';
        appBar.appendChild(separator);

        minimizedWins.forEach(appObj => appBar.appendChild(createAppBtn(appObj)));
    }

    const btnAppcenter = document.createElement('button');
    btnAppcenter.className = 'appbar-app';
    btnAppcenter.id = 'appbar-appcenter';
    const imgAppcenter = document.createElement('img');
    imgAppcenter.className = 'app-img';
    imgAppcenter.src = 'assets/apps/Launchpad/3.png';
    imgAppcenter.alt = 'App Center';
    btnAppcenter.appendChild(imgAppcenter);
    btnAppcenter.addEventListener('click', () => sysExecApp('appcenter'));
    appBar.appendChild(btnAppcenter);
}
function renderAppBar() {
    clearTimeout(renderAppBar._debounce);
    renderAppBar._debounce = setTimeout(_renderAppBarImpl, 80);
}

function appBarAddApp(icon, name, app, minimized = false, permanent = true) {
    const exists = SysVar.appBarIcons.some(a => a.app === app);
    if (exists) {
        console.warn(`appBarAddApp: "${app}" already on app bar.`);
        return;
    }
    SysVar.appBarIcons.push({ icon, name, app, minimized, permanent });
    renderAppBar();
}

function appBarRemoveApp(app) {
    if (app === 'appcenter') {
        if (!SysVar.devMode) {
            showAlertBox('msgbox_warning','No puedes eliminar el App Center.',{icon:'⚠️',as_win:true});
            return;
        }
    }
    const index = SysVar.appBarIcons.findIndex(a => a.app === app);
    if (index === -1) {
        console.warn(`appBarRemoveApp: "${app}" no esta en el AppBar`);
        return;
    }

    SysVar.appBarIcons.splice(index, 1);
    renderAppBar();
    //saveDataReg();
}

// Watcher para main.conf - recarga SysVar cuando el archivo cambia externamente
/*let _mainConfLastContent = null; //Codigo comentado porque hacer esto es costoso
let _watchMainConfDebounce = null;

function watchMainConf() {
    if (!window.fs) return;
    if (_isSavingConfig) return;

    clearTimeout(_watchMainConfDebounce);
    _watchMainConfDebounce = setTimeout(() => {
        try {
            if (!window.fs.fileExistInPath('main.conf', '/system/general')) return;
            const currentContent = openFile('main.conf', '/system/general');
            if (_mainConfLastContent === null) {
                _mainConfLastContent = currentContent;
                return;
            }
            if (currentContent !== _mainConfLastContent) {
                _mainConfLastContent = currentContent;
                loadDataReg();
                renderAppBar();
            }
        } catch (e) {
            if (SysVar.devMode) console.error(e);
        }
    }, 500);
}

setInterval(watchMainConf, 2000);*/

document.getElementById('appcenterapps').addEventListener('contextmenu', (e) => {
    const appDiv = e.target.closest('.appcenter_appdiv');
    if (!appDiv) return;
    
    SysVar.tempCurrentAppCenterApp = appDiv.id.replace('appcenter-','');
    SysVar.tempCurrentAppCenterName = appDiv.querySelector('p').textContent;
    SysVar.tempCurrentAppCenterImg = appDiv.querySelector('img').src;

    const appCenterCtxm = document.getElementById('appcenter_ctxm');
    appCenterCtxm.style.left = e.clientX + 'px';
    appCenterCtxm.style.top = e.clientY + 'px';
    const appCenterZIndex = getComputedStyle(document.getElementById('win_appcenter')).zIndex;
    appCenterCtxm.style.zIndex = appCenterZIndex+2;

    if (SysVar.appDownloaded.includes(SysVar.tempCurrentAppCenterApp)) {
        document.getElementById('appcenter_ctxm_delappbtn').classList.remove('hidden');
    } else {
        document.getElementById('appcenter_ctxm_delappbtn').classList.add('hidden');
    }

    appCenterCtxm.classList.remove('hidden');
});

function appcenter_ctxmb_addapp() {
    appBarAddApp(SysVar.tempCurrentAppCenterImg,SysVar.tempCurrentAppCenterName,SysVar.tempCurrentAppCenterApp);
}

function appcenter_ctxmb_delapp() {
    if (SysVar.appDownloaded.includes(SysVar.tempCurrentAppCenterName)) {
        SysVar.appDownloaded = SysVar.appDownloaded.filter(x => x !== SysVar.tempCurrentAppCenterName);
        document.getElementById(`appcenter-${SysVar.tempCurrentAppCenterApp}`).classList.add('hidden');
        if (SysVar.appBarIcons.some(a => a.app === SysVar.tempCurrentAppCenterApp)) {
            appBarRemoveApp(SysVar.tempCurrentAppCenterApp);
        }
    }
}



document.getElementById('appcenter_searchbar').addEventListener('input', function() {
    const query = this.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const allApps = document.querySelectorAll('#appcenterapps .appcenter_appdiv');

    allApps.forEach(appDiv => {
        if (appDiv.id === 'appcenter-nekiri') return;

        const appName = appDiv.querySelector('p').textContent.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (query === '' || appName.includes(query)) {
            appDiv.classList.remove('appcenter-searchhidden');
        } else {
            appDiv.classList.add('appcenter-searchhidden');
        }
    });

    const visibleApps = [...allApps].filter(appDiv => 
        appDiv.id !== 'appcenter-nekiri' && !appDiv.classList.contains('appcenter-searchhidden')
    );

    document.getElementById('appcenter_nekiriHint').classList.add('hidden');

    if (visibleApps.length === 0 && query !== '') {
        document.getElementById('appcenter_nekiriHint').classList.remove('hidden');
    }
});

function appcenterAskNekiri() {
    hideappcenter();
    const rect = document.getElementById('topbar_nekiri').getBoundingClientRect();
    nekiriDropdown.style.right = (window.innerWidth - rect.right) + "px";
    nekiriDropdown.style.top = rect.bottom + "px";
    nekiriDropdown.classList.remove('hidden');
    nekiriDPOpen = true;
    
    const searchQuery = document.getElementById('appcenter_searchbar').value;
    if (searchQuery) {
        nekiriInput.value = searchQuery;
    }
    nekiriInput.focus();
    setTimeout(() => {
        document.getElementById('nekiri_send').click();
    },100);
}

function showQuickViewWin(filetype, content) {
    const QVWindow = document.getElementById('quickview');
    const QVvid = document.getElementById('quickview_vid');
    const QVimg = document.getElementById('quickview_img');
    const QVtext = document.getElementById('quickview_text');
    if (filetype === 'video') {
        QVvid.classList.remove('hidden');
        QVvid.src = content;
    } else if (filetype === 'img') {
        QVimg.classList.remove('hidden');
        QVimg.src = content;
    } else if (filetype === 'text') {
        QVtext.classList.remove('hidden');
        QVtext.textContent = content;
    } else {
        console.warn('Unknown filetype on quickview: '+filetype);
        QVtext.classList.remove('hidden');
        QVtext.textContent = `${filetype} is not a valid type.`;
        QVWindow.classList.remove('hidden');
        return;
    }
    QVWindow.classList.remove('hidden');
    QVWindow.style.zIndex = topZ+2;
}

function hidequickview() {
    const QVimg = document.getElementById('quickview_img');
    if (QVimg.src && QVimg.src.startsWith('blob:')) {
        URL.revokeObjectURL(QVimg.src);
    }
    document.getElementById('quickview').classList.add('hidden');
    document.getElementById('quickview_vid').classList.add('hidden');
    QVimg.src = '';
    QVimg.classList.add('hidden');
    document.getElementById('quickview_text').classList.add('hidden');
    document.getElementById('quickview_text').textContent = '';
}

async function requestAddAppBar(apptoaddname) {
    const confirmAddAppTAB = await showMsgBox("msgbox_request",`Una aplicacion quiere agregar ${apptoaddname} al AppBar\nPermitir?`, "Permitir", "Cancelar",{as_win: false,icon: '💻'});
    if (confirmAddAppTAB) {
        const apptoaddicon = await getPathAppIcon(apptoaddname);
        appBarAddApp(apptoaddicon, apptoaddname, apptoaddname);
    }
}

const _appbarIconsCache = {};
async function getPathAppIcon(appName) {
    if (_appbarIconsCache[appName]) return _appbarIconsCache[appName];
    const routes = [
        `assets/apps/${appName}/3.png`,
        `assets/apps/${appName}.png`,
        `assets/${appName}.png`
    ];

    for (const route of routes) {
        try {
            const res = await fetch(route, { method: 'HEAD' });
            if (res.ok) {
                _appbarIconsCache[appName] = route;
                return route;
            };
        } catch (e) {}
    }

    _appbarIconsCache[appName] = 'assets/apps/unknown.png';
    return 'assets/apps/unknown.png';
}

window.getPathAppIcon = getPathAppIcon;
window.appBarAddApp = appBarAddApp;
window.appBarRemoveApp = appBarRemoveApp;
window.renderAppBar = renderAppBar;

setTimeout(() => {
    setInterval(() => {
        SysVar.pointerTopZ = (window.topZ || 9992);
    },2000);
},4000);

const topbarIconWifi = new Image();
topbarIconWifi.src = 'assets/system/wifi.png';
const topbarIconWifiError = new Image();
topbarIconWifiError.src = 'assets/system/wifi-error.png';

window.addEventListener('online', () => {
    sysPreloadApp('sysshutdown', true);
    SysVar.sysshutdownUIAvailable = true;
    document.getElementById('topbar_network').src = topbarIconWifi.src;
    if (systemIsOffline) {
        createNotification(topbarIconWifi.src, 'Reconectado', 'Conectado a internet nuevamente.');
    }
    systemIsOffline = false;
});
window.addEventListener('offline', () => {
    document.getElementById('topbar_network').src = topbarIconWifiError.src;
    systemIsOffline = true;
    createNotification(topbarIconWifiError.src, 'Desconectado', 'No hay conexion a internet.');
});
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        createNotification('assets/system/fullscreen.png', 'Pantalla completa', 'Para volver a pantalla completa presiona el icono de inicio > Fullscreen', { show:true, text:"Fullscreen", action:"eval", data:"document.documentElement.requestFullscreen()" });
    }
});

function loginscrHelpDialog() {
    SysVar.lockedSession = false;
    sysExecApp('loginhelp');
    setTimeout(() => {
        SysVar.lockedSession = true;
    },400)
}

function loginscrAccs() {
    document.body.classList.toggle("accs-high-contrast");
}

function reciveCall(number='+00 000 0000') {
    //TODO: Si esta en contactos entonces mostrar nombre en vez de numero
    createNotification('assets/system/call.png', String(number), 'Llamada entrante', { show:true, text:"Contestar", action:"alert", data:"Llamadas no implementadas." }, { show:true, text:"Rechazar", action:"delnoti", data:undefined });
}

let systemInactiveTime;
let systemInactiveExtra;
const _brightnessOverlay = document.createElement('div');
_brightnessOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: black;
    opacity: 0;
    pointer-events: none;
    z-index: 8999;
    transition: opacity 0.5s ease;
`;
document.body.appendChild(_brightnessOverlay);

function sysResetInactivityBrightness() {
    _brightnessOverlay.style.opacity = '0';
}

function sysLowerBrightness() {
    _brightnessOverlay.style.opacity = '0.4';
}

function sysResetInactivityTimer() {
    clearTimeout(systemInactiveTime);
    clearTimeout(systemInactiveExtra);

    sysResetInactivityBrightness();

    systemInactiveTime = setTimeout(() => {
        sysLowerBrightness();

        systemInactiveExtra = setTimeout(() => {
            syslockscr();
            sysResetInactivityBrightness();
        }, 10000);
    }, 60000);
}

document.addEventListener("mousemove", sysResetInactivityTimer);
document.addEventListener("keydown", sysResetInactivityTimer);
document.addEventListener("click", sysResetInactivityTimer);
document.addEventListener("scroll", sysResetInactivityTimer);

sysResetInactivityTimer();

setTimeout(() => {
    console.log(
    "%c🚫 Warning!",
    "color: red; font-size: 48px; font-weight: bold;"
    );

    console.log(
    "%cIf you don't know what you're doing, close this window immediately!",
    "font-size: 16px;"
    );

    console.log(
    "%cIf you like experimenting, go ahead, you won't get anything too dangerous from here anyway haha",
    "font-size: 16px;"
    );
},5000);

setInterval(() => {
    if (!SysVar.sysRunningServices.some(item => item.id === 'mainsession/sys.srv')) {
        sysBsod('X-SRV-CRT', 'Unknown error ocurred during session.');
    }
}, 10000);
function watchBootHeartbeat() {
    if (SysVar.bootFinished) return;
    
    const lastBeat = localStorage.getItem('sys_boot_heartbeat');
    if (!lastBeat) return;
    
    const silence = Date.now() - parseInt(lastBeat);
    
    if (silence > 6000) {
        sysBsod('','','booting');
        new Audio("../assets/crash.mp3").play();
    }
}

window._bootHeartbeatWatcher = setInterval(watchBootHeartbeat, 3000);

const specialcommandskeys = new Set();

document.addEventListener("keydown", (e) => {
  specialcommandskeys.add(e.key.toLowerCase());

  if (specialcommandskeys.has("q") && specialcommandskeys.has("e")) {
    if (e.shiftKey) {
        e.preventDefault();
        if (!SysVar.bootFinished) {
            console.log("Crashed by user command");
            sysBsod('','','booting');
            new Audio("../assets/crash.mp3").play();
        }
    }
  }
});

document.addEventListener("keyup", (e) => {
  specialcommandskeys.delete(e.key.toLowerCase());
});

let systemHalted = false;
function emergencyStop(reason) {
    if (systemHalted) return;
    systemHalted = true;
    sysBsod('','Crash Detected: '+reason+' | Please Restart System Manually');
    console.log("🛑 SYSTEM STOPPED: "+reason);

    const noop = () => {};
    window.setTimeout = noop;
    window.setInterval = noop;
    window.requestAnimationFrame = noop;
    EventTarget.prototype.addEventListener = noop;
    throw new Error("System halted: " + reason);
}
let _rafLast = performance.now();
let _rafLagSpikes = 0;
const RAF_LAG_THRESHOLD_MS = 800;
const RAF_SPIKE_LIMIT = 6;

function _rafLagLoop() {
    if (systemHalted) return;

    const now = performance.now();
    const diff = now - _rafLast;
    _rafLast = now;

    if (!document.hidden && diff > RAF_LAG_THRESHOLD_MS) {
        _rafLagSpikes++;
        console.warn(`⚠️ Lag spike #${_rafLagSpikes}: ${diff.toFixed(1)}ms`);
        if (_rafLagSpikes >= RAF_SPIKE_LIMIT) {
            emergencyStop("sustained lag");
            return;
        }
    } else if (!document.hidden) {
        _rafLagSpikes = 0;
    }

    requestAnimationFrame(_rafLagLoop);
}
requestAnimationFrame(_rafLagLoop);


let listenerCount = 0;
let lastListenerSnapshot = 0;
let lastListenerCheck = performance.now();
const LISTENER_GROWTH_LIMIT = 1000;
const LISTENER_WARMUP_MS = 5000;
const bootTime = performance.now();
const orig = EventTarget.prototype.addEventListener;

EventTarget.prototype.addEventListener = function(...args) {
    if (systemHalted) return;

    listenerCount++;

    const now = performance.now();
    const elapsed = now - lastListenerCheck;

    if (elapsed > 1000) {
        const growth = listenerCount - lastListenerSnapshot;
        const inWarmup = (now - bootTime) < LISTENER_WARMUP_MS;

        if (!inWarmup && growth > LISTENER_GROWTH_LIMIT) {
            emergencyStop(`listener spam (+${growth}/s)`);
        }

        if (growth > 200) {
            console.warn(`⚠️ Listener growth: +${growth}/s (total: ${listenerCount})`);
        }

        lastListenerSnapshot = listenerCount;
        lastListenerCheck = now;
    }

    return orig.apply(this, args);
};
const SysProtected = Object.freeze({
    sysAddEvent: window.sysAddEvent,
    sysBsod: window.sysBsod,
    emergencyStop: window.emergencyStop,
    sysExecApp: window.sysExecApp,
    sysshutdown: window.sysshutdown,
});

setInterval(() => {
    for (const [name, fn] of Object.entries(SysProtected)) {
        if (window[name] !== fn) {
            console.warn(`⚠️ System function overwritten: ${name} — restoring`);
            window[name] = fn;
        }
    }
}, 2000);

function _wallpaperFileName(id) {
    const isCustomUrl = id.startsWith('https://') || id.startsWith('http://');
    return isCustomUrl
        ? id.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_') + '.jpg'
        : `${id}.jpg`;
}

async function syssetwallpaperto(id) {
    if (id === 'default') {
        document.documentElement.style.setProperty('--wallpaper', 'url(assets/wallpaper.jpg)');
        SysVar.wallpaper = 'default';
        return;
    }

    SysVar.wallpaper = id;
    const currentUser = SysVar.currentuser.user;
    if (currentUser && currentUser !== 'system' && sysUsers[currentUser]) {
        sysUsers[currentUser].wallpaper = id;
        localStorage.setItem('sysUsers', JSON.stringify(sysUsers));
    }

    const savePath = '/system/wallpapers';
    const fileName = _wallpaperFileName(id);
    const fullPath = `${savePath}/${fileName}`;

    async function applyFromDB() {
        const db = await _openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('media', 'readonly');
            const req = tx.objectStore('media').get(fullPath);
            req.onsuccess = () => {
                if (!req.result) { reject('No encontrado en media store'); return; }
                const url = URL.createObjectURL(req.result);
                document.documentElement.style.setProperty('--wallpaper', `url(${url})`);
                resolve();
            };
            req.onerror = (e) => reject(e.target.error);
        });
    }

    if (window.fs.fileExistInPath(fileName, savePath)) {
        await applyFromDB();
        return;
    }

    document.getElementById('settings_loadingwallpapertext').textContent = 'Descargando...';
    document.getElementById('settings_loadingwallpapertext').classList.remove("hidden");
    console.log(`[Wallpaper] Descargando: ${id}...`);
    const ok = await downloadwallpaper(id);
    if (ok) {
        console.log(`[Wallpaper] Descarga finalizada: ${id}`);
        document.getElementById('settings_loadingwallpapertext').classList.add("hidden");
        await applyFromDB();
    } else {
        document.getElementById('settings_loadingwallpapertext').textContent = 'Ocurrio un error al descargar el fondo de pantalla.';
        setTimeout(()=>{
            document.getElementById('settings_loadingwallpapertext').classList.add("hidden");
        },1200);
        showAlertBox('Error', `No se pudo descargar el wallpaper.`, { as_win: true, icon: '❌' });
    }

    SysVar.wallpaper = id;
}

async function downloadwallpaper(id) {
    const screenWidth = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;
    let targetWidth = screenWidth * dpr;

    let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        const speed = connection.effectiveType;
        if (speed === "slow-2g" || speed === "2g") targetWidth *= 0.5;
        else if (speed === "3g") targetWidth *= 0.75;
    }

    if (targetWidth < 500) targetWidth = 500;
    if (targetWidth > 4000) targetWidth = 4000;
    targetWidth = Math.round(targetWidth);

    const isCustomUrl = id.startsWith('https://') || id.startsWith('http://');
    const url = isCustomUrl
        ? id
        : `https://images.unsplash.com/photo-${id}?q=80&w=${targetWidth}`;

    const savePath = '/system/wallpapers';
    const fileName = _wallpaperFileName(id);

    if (!window.fs.fileExist(savePath)) {
        window.fs.createFolder('wallpapers', '/system');
    }

    if (window.fs.fileExistInPath(fileName, savePath)) {
        console.log(`[Wallpaper] Ya existe: ${savePath}/${fileName}`);
        return true;
    }

    console.log(`[Wallpaper] Descargando: ${url}`);
    return await window.fs.downloadImageToFS(url, fileName, savePath);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

document.addEventListener('keydown',(e)=>{
    if (system_crashed && e.shiftKey && e.key === 'F') {
        renderCrashDetails();
        clearTimeout(window._bsodTimeout);
    }
    if (system_crashed && document.getElementById('crashDetailsDiv') && e.key === 'Enter') {
        window.location.href = "index.html";
        localStorage.setItem('sysStartupConfig', 'ShowBSODAlert');
    }
});

function renderCrashDetails() {
    document.documentElement.style.cursor = 'none';
    document.head.insertAdjacentHTML(
        'beforeend',
        '<style>*{cursor:none !important;}</style>'
    );
    const nav = performance.getEntriesByType("navigation")[0];

    const crashDetailsDiv = document.createElement('div');
    crashDetailsDiv.id = 'crashDetailsDiv';

    const crashDetailsText = document.createElement('span');
    //crashDetailsText.classList.add('textShowEvents');
    crashDetailsText.textContent = `
    [${window.performance.now() / 1000}] [!] System halted.
    [CRITICAL] Critical Error
    === Critical Error Information ===

    Instruction: ${window.crashInfo.causedby}
    Stack: ${window.crashInfo.stack}
    Error Code: ${window.crashInfo.errorCode}
    Failed: ${window.crashInfo.errorText}
    Exception_Class: ${window.crashInfo.type}
    Timestamp: ${window.crashInfo.timestamp}
    Source_Path: ${window.crashInfo.url}
    Loaded Apps: ${window.crashInfo.loadedApps}
    Mem_Dump: 0x${window.crashInfo.memory} [SEGMENTATION FAULT]
    Uptime: ${nav.loadEventEnd}

    ==================================
    [Info] Crash Log Saved in event viewer.
    [Info] Press ENTER to reboot_
    `;

    crashDetailsDiv.appendChild(crashDetailsText);
    document.body.appendChild(crashDetailsDiv);
}

setTimeout(()=>{
    if (SysVar.wallpaper) {
        syssetwallpaperto(SysVar.wallpaper);
    }
},1000);

setTimeout(()=>{
    if (SysVar.userPrivacyPreferences.includes('network') || SysVar.userPrivacyPreferences.includes('location')) {
        fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => {
                if (SysVar.userPrivacyPreferences.includes('network')) {
                    SysVar.userDataCollection.ip = data.ip;
                    SysVar.userDataCollection.internetProvider = data.org;
                }
                if (SysVar.userPrivacyPreferences.includes('location')) {
                    SysVar.userDataCollection.city = data.city;
                    SysVar.userDataCollection.country = data.country_name;
                }
        });
    }
},1000);

window.scriptReady('sys');