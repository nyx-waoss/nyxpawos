console.log("[NyxPawOS] Current: sys.js");
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

/*BSOD */
function sysBsod(errorCode, errorText) {
    sysComQuitTasks();
    //const bsodDiv = document.getElementById('bsod');
    const bsodDiv = document.createElement('div');
    bsodDiv.className = 'hidden';
    bsodDiv.id = 'bsod';
    bsodDiv.innerHTML =
    `<h1>A fatal system error occurred.<br>Ocurrio un error crítico del sistema</h1>
    <p>- The system cannot continue... Restarting in 10 seconds...<br>- El sistema no puede continuar... Se reiniciara en 10 segundos...<br>- 这个系统无法继续......10秒后重启......<br>- このシステムは続けられない...10秒後に再スタート...<br>- O sistema não pode continuar... Reiniciando em 10 segundos...</p>
    <div id="sysdivider"></div>
    <p>Error code:<br>Codigo de error:</p>
    <p id="bsodErrorCode">X-XXX-XXX</p>
    <p id="bsodErrorText">Undefined</p>`;
    document.body.appendChild(bsodDiv);

    try {
        sysAddEvent('fatal', 'Fatal', `Code ${errorCode}: ${errorText}`);
    } catch(error) {
        tempSysAddEvent('fatal', 'Fatal', `Code ${errorCode}: ${errorText}`);
    }

    setTimeout(() => {
        const errorCodeOut = document.getElementById('bsodErrorCode');
        const errorTextOut = document.getElementById('bsodErrorText');

        errorCodeOut.textContent = errorCode;
        errorTextOut.textContent = errorText;
        bsodDiv.classList.remove('hidden');
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
  { "icon": "assets/apps/browser/3.png", "name": "NyxPaw", "app": "browser", "minimized": false, "permanent": true },
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


/*VARIABLES GLOBALES END */
//reestablecer variables desde localstorage:
const usedBefore = localStorage.getItem('used-before');

//---------------------------------------------------------------------------------------------------------------------

async function saveDataReg() {
    if (mode === 'safe') {
        const confirmSaveRege = await showMsgBox("Datos","Quieres guardar los cambios?", "Guardar", "Descartar");
        if (!confirmSaveRege) {
            return;
        }
    }

    try {
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
            filesQuickAccess: JSON.stringify(SysVar.filesQuickAccess),
            sessionAutoStart: JSON.stringify(SysVar.sessionAutoStart),
            appBarIcons: JSON.stringify(SysVar.appBarIcons)
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
                            case 'filesQuickAccess':
                                SysVar.filesQuickAccess = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'appBarIcons':
                                SysVar.appBarIcons = JSON.parse(normalizeConfigValue(rawValue));
                                break;
                            case 'sessionAutoStart':
                                SysVar.sessionAutoStart = JSON.parse(normalizeConfigValue(rawValue));
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

//funcion msgbox
function showPromptMsgBox(title, text, okbtn_text, cancelbtn_text, options={}) {
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

            msgTitle.textContent = title;
            msgText.textContent = text;
            msgButtonOk.textContent = okbtn_text;
            msgButtonCancel.textContent = cancelbtn_text;
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

            msgTitle.textContent = title;
            msgText.textContent = text;
            msgButtonOk.textContent = okbtn_text;
            msgButtonCancel.textContent = cancelbtn_text;
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

            msgTitle.textContent = title;
            msgText.textContent = text;
            msgButtonOk.textContent = okbtn_text;
            msgButtonCancel.textContent = cancelbtn_text;
            

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

            msgTitle.textContent = title;
            msgText.textContent = text;
            msgButtonOk.textContent = okbtn_text;
            msgButtonCancel.textContent = cancelbtn_text;
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

        msgTitle.textContent = title;
        msgText.textContent = text;
        msgButtonOk.textContent = "Sin definir";
        msgButtonCancel.textContent = "Ok";

        msgBox.style.zIndex = topZ + 10;
        bgOverlay.style.zIndex = topZ + 9;

        msgInput.classList.add('hidden');
        msgBox.classList.remove('hidden');
        msgButtonOk.classList.add('hidden');
        bgOverlay.classList.remove('hidden');

        msgButtonCancel.addEventListener("click", () => {
            msgBox.classList.add('hidden');
            bgOverlay.classList.add('hidden');
        });
    } else {
        const msgBox = document.getElementById('msg-box-win');
        const msgTitle = document.getElementById('msg-box-win-title');
        const msgText = document.getElementById('msg-box-win-text');
        const msgInput = document.getElementById('msg-box-win-input');
        const msgButtonOk = document.getElementById('msg-box-win-okbtn');
        const msgButtonCancel = document.getElementById('msg-box-win-cancelbtn');
        const msgIcon = document.getElementById('msg-box-win-icon');

        sysPlaySound('error');


        msgTitle.textContent = title;
        msgText.textContent = text;
        msgButtonOk.textContent = "Sin definir";
        msgButtonCancel.textContent = "Ok";
        msgIcon.textContent = icon;

        msgBox.style.zIndex = topZ + 10;

        msgInput.classList.add('hidden');
        msgBox.classList.remove('hidden');
        msgButtonOk.classList.add('hidden');

        msgButtonCancel.addEventListener("click", () => {
            msgBox.classList.add('hidden');
        });
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
        hideappcenter();
        if (SysVar.blockShutdown) {
            showAlertBox('❌ Error', 'function sysshutdown() is blocked by your administrator');
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
                const confirmSysShutdown = await showMsgBox("⚠️ Advertencia!",shutdownCustomMsg, "Apagar", "Cancelar");
                
                if (confirmSysShutdown) {

                    await saveDataReg();

                    localStorage.setItem('sys_status', 'shutdown');
                    hideTopBar();
                    hideAppBar();
                    sysComQuitTasks();
                    document.getElementById('start-dropdown').classList.add('hidden');
                    document.getElementById('audio-dropdown').classList.add('hidden');
                    document.getElementById('nekiri-dropdown').classList.add('hidden');
                    document.getElementById('brief-dropdown').classList.add('hidden');
                    document.getElementById('appbar-ctxmenu').classList.add('hidden');
                    document.getElementById('loginscr').classList.add('hidden');
                    document.getElementById('quickview').classList.add('hidden');
                    
                    setTimeout(() => {
                        document.body.style.backgroundImage = "url('assets/bs.png')";
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
            } else {
                await saveDataReg();

                localStorage.setItem('sys_status', 'shutdown');
                hideTopBar();
                hideAppBar();
                sysComQuitTasks();
                setTimeout(() => {
                    document.body.style.backgroundImage = "url('assets/bs.png')";
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
        showAlertBox('❌ Error', 'El sistema no se pudo apagar');
    }
}

async function sysrestart(askConfirm = true) {
    try {
        hideappcenter();
        document.getElementById('quickview').classList.add('hidden');
        document.getElementById('start-dropdown').classList.add('hidden');
        document.getElementById('audio-dropdown').classList.add('hidden');
        document.getElementById('nekiri-dropdown').classList.add('hidden');
        document.getElementById('brief-dropdown').classList.add('hidden');
        document.getElementById('appbar-ctxmenu').classList.add('hidden');
        
        if (askConfirm) {
            const confirmSysRestart = await showMsgBox("⚠️ Advertencia!","Quieres reiniciar el sistema? Asegurate de guardar tus datos", "Reiniciar", "Cancelar");
            
            if (confirmSysRestart) {
                await saveDataReg();

                hideTopBar();
                hideAppBar();
                sysComQuitTasks();
                localStorage.setItem('sys_status', 'off');
                setTimeout(() => {
                    document.getElementById('loginscr').classList.add('hidden');
                    window.location.href = "index.html";
                }, 2200);   
            } else {
                document.getElementById('msg-box-checkboxdiv').classList.remove('hidden');
            }
        } else {
            await saveDataReg();

            hideTopBar();
            hideAppBar();
            sysComQuitTasks();
            localStorage.setItem('sys_status', 'off');
            setTimeout(() => {                
                window.location.href = "index.html";
            }, 2200);
        }
    } catch (error) {
        console.error('Failed to reboot system: ', error);
        showAlertBox('❌ Error', 'El sistema no se pudo reiniciar');
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
                showAlertBox('Notificacion', String(notiData.firstbtn.data), {as_win:true,icon:'ℹ️'});
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
                showAlertBox('Notificacion', String(notiData.secondbtn.data), {as_win:true,icon:'ℹ️'});
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
        showAlertBox("Advertencia!","No hay informacion de la aplicacion actual", {as_win:true,icon:'⚠️'});
        return;
    }
    const getWinInfoTitle = getWindowTitleById(getWinInfoID);
    if (getWinInfoTitle === null) {
        showAlertBox("Desconocido","Programa desconocido o inexistente", {as_win:true,icon:'⚠️'});
        return;
    }
    showAlertBox(getWinInfoTitle,`Programa: ${getWinInfoTitle}\nID: ${getWinInfoID}`, {as_win:true,icon:'ℹ️'});
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
    appCenterWindow.classList.add('hidden');
});

function hideappcenter() {
    appCenterWindow.classList.add('hidden');
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



const nekiriAnswersAccess = [
    'Claro que si {user}!',
    'Con gusto :3',
    'Por supuesto {user} :3',
    'Enseguida!',
    'oks :3'
]

function getRandomNekiriRes(type, array) {
    if (type === 'array') {
        return array[Math.floor(Math.random() * array.length)];
    } else if (type === 'access') {
        return nekiriAnswersAccess[Math.floor(Math.random() * nekiriAnswersAccess.length)];
    } else {
        return 'Invalid type given: ' + type + ' - Please use "array" or "access"';
    }
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
    nekiriDropdown.style.zIndex = topZ + 2;

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

function nekiriRunBtnFunc() {
    if (nekiriButtonAction === 'search') {
        sysExecApp('browser');
        setTimeout(() => browserSetWebTo(nekiriButtonActionArg), 90);
    }
} 

function normalizeNekiriUserInput(userRequest) {
    let userInputToReturn = userRequest.toLowerCase();
    userInputToReturn = userInputToReturn.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    userInputToReturn = userInputToReturn.replace(/[^a-zA-Z0-9 ]/g, "");
    userInputToReturn.replace(/\n+/g, "\n");
    userInputToReturn.replace(/[\u200B-\u200D\uFEFF]/g, "");
    userInputToReturn = userInputToReturn.trim();
    return userInputToReturn;
}


function nekiriShowAnswer() {
    const userInput = normalizeNekiriUserInput(nekiriInput.value);
    nekiriSmartcard.classList.add('hidden');

    if (userInput.includes('hola')) {
        nekiriAnswers = [
            "Hola "+ SysVar.currentuser.dName +"! En qué puedo ayudarte hoy? :3",
            "Nya~ ¡Hola! ¿Cómo estás? :3",
            "¡Holi! ¿Qué tal tu día? uwu",
            "¡Hey! ¿En qué te puedo ayudar "+ SysVar.currentuser.dName +"? nya~"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('estas') || userInput.includes('encuentras')) {
        nekiriAnswers = [
            "Bien uwu, gracias por preguntar! nya~",
            "Muy bien! ¿Y tú? :3",
            "Genial! Lista para ayudarte nya~",
            "De maravilla uwu ¿Cómo estás tú?"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('puedes hacer')) {
        nekiriAnswers = [
            "Puedo ayudarte a navegar por el sistema, entretenerte, contarte chistes, etc...",
            "Te puedo entretener con chistes o cosas curiosas como la toybox!",
            "Puedo ayudarte con cualquier cosa sobre NyxPaw OS, si necesitas ayuda solo dime!",
            "Puedo aumentar tu productividad ayudandote a abrir apps, dandote tips, evitando que procastines jeje, y muchas cosas mas :D"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('aburrid')) {
        nekiriAnswers = [
            "Parece que estas aburrido... Te puedo contar chistes o podemos charlar un rato si quieres :D",
            "Hmmm... podrías intentar personalizar el sistema! En la toybox hay varias opciones de personalizacion!",
            //"Puedes personalizar el sistema aun mas! Solo entra a la NyxPaw Store, ve a plugins, y activa el plugin de 'Toybox++'!",
            "Te puedo contar chistes o si quieres solo hablemos un rato :D"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('chiste') || userInput.includes('divierteme')) {
        nekiriAnswers = [
            "Toma un chiste BUENISIMO: Por qué los gatos no usan computadoras? Porque les da miedo el ratón! JAJAJAJ Por favor ríete 😭",
            "Qué le dice un gato a otro gato? Miau! ...Ok ese estuvo malo nya~ xD",
            "Cómo se dice gato en japonés? Neko! Y en español? ...Gato xD Lo siento ese fue horrible 😭",
            "Por qué el gato cruzó la calle? Para llegar al otro lad... ESPERA! Esa era la del pollo! nya~ :3"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('tiste')) {
        nekiriAnswers = [
            "Oh no, lo siento mucho "+ SysVar.currentuser.dName +"... recuerda que siempre puedes abrir la app de notas y escribir lo que sientes, a veces ayuda mucho :3",
            "Aww, "+ SysVar.currentuser.dName +"... ¿quieres hablar sobre ello? Estoy aquí para escucharte nya~",
            "Lo siento mucho uwu... Escribir en las notas puede ayudar a desahogarte :3",
            "Lamento escuchar eso... podemos hablar sobre eso si quieres..."
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('sistema') && (userInput.includes('version') || userInput.includes('info'))) {
        nekiriAnswers = [
            "Acabo de abrir mi ventana de 'Acerca de' para ti :3",
            "Revisa la ventana 'Acerca de' para ver la versión del sistema nya~ :3",
            "Puedes ver la versión del sistema en la ventana 'Acerca de' uwu"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('therian') && userInput.includes('furr')) {
        nekiriAnswers = [
            "Los therians no son furros!! Los therians sienten una conexión espiritual con los animales, los furros disfrutan de usar fursuits o mas que nada el hobby como tal, me explico?",
            "Mucha gente se confunde, pero los therians no son lo mismo que los furros... Los furros simplemente disfrutan del hobby (arte, trajes, etc...) y los therians sienten una conexión espiritual!",
            "Hay una gran diferencia entre los therians y los furros, pero mucha gente los confunde. Los therians sienten una conexión espiritual con los animales, los furros disfrutan de usar fursuits o mas que nada el hobby como tal, me explico?"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
        nekiriShowSmartCard('search','Buscar en internet', encodeURI(`https://www.google.com/search?q=¿Los therians son lo mismo que los furros?&igu=1`));
    } else if (userInput.includes('gracias') || userInput.includes('agrade')) {
        nekiriAnswers = [
            "De nada! Si necesitas otra cosa solo dime :D",
            "Con gusto :3 Si ocupas ayuda con algo dime :D",
            "De nada :3 Si necesitas que te ayude en algo mas dime."
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('jaj') || userInput.includes('jej') || userInput.includes('jij') || userInput.includes('joj') || userInput.includes('juj') || userInput.includes('jsj')) {
        nekiriAnswers = [
            "Me alegra que te hayas reido :3",
            "Me pone feliz que estes feliz! Jajaja",
            "Gracias por reir! Todos se burlan de mi... menos tu!"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('tierno') || userInput.includes('uwu') || userInput.includes('nya') || userInput.includes('arigato') || userInput.includes('goodboy') || userInput.includes('rwar')) {
        nekiriAnswers = [
            "Nya!",
            "Rwar! :3",
            "Nya! UwU!",
            "I am a good boy! UwU!",
            "Nya! Arigato!",
            "Nya, itchi ni san nya! Arigatoooo!"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('clima') || userInput.includes('temperatura') || userInput.includes('weather')) {
        sysExecApp('weather');
        nekiriAnswers = [
            "Aqui tienes el clima!",
            "Toma! El clima para ti :3",
            "Acabo de abrir la app de clima",
            "Este es el clima actual :3"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if ((userInput.includes('quiero') || userInput.includes('deseo') || userInput.includes('gustaria') || userInput.includes('podemos') || userInput.includes('que tal si')) && (userInput.includes('habla') || userInput.includes('conversa') || userInput.includes('charla'))) {
        nekiriAnswers = [
            "Claro que si! De que quieres hablar?",
            "Dale!! Hablemos un rato :D Tu empiezas",
            "Oks! Charlemos un rato si te parece bien!",
            "Okie pero tu empiezas! No tengo buenos temas de conversacion jeje :3"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('busca') && (userInput.includes('internet') || userInput.includes('google') || userInput.includes('navegador'))) {
        nekiriAnswers = [
            "Esto es lo que encontre:",
            "Encontre esto en internet, te sirve?",
            "Esto fue lo que encontre:",
            "Encontre esto, que tal?"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
        nekiriShowSmartCard('search','Buscar en internet', encodeURI(`https://www.google.com/search?q=${userInput}&igu=1`));
    } else if (userInput.includes('eres') && (userInput.includes('quien') || userInput.includes('que') || userInput.includes('esto'))) {
        nekiriAnswers = [
            "Soy Nekiri, el asistente personal de NyxPawOS! Te puedo ayudar con todo lo que quieras!",
            "Me llamo Nekiri, te puedo ayudar con lo que tu quieras! Abrir apps, documentos, buscar en internet, etc...",
            "Soy tu asistente personal! Puedo ayudarte en todo lo que quieras!",
            "Soy Nekiri, y soy tu asistente personal! Te ayudare a abrir apps, buscar documentos, etc... o solo podemos hablar :D"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    }
    
    
    
    
    
    
    
    
    //abrir apps (basico xq muy dificil hacer que las instaladas tambien xD)
    else if (userInput.includes('abr') && (userInput.includes('config') || userInput.includes('ajust'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('settings');
    } else if (userInput.includes('abr') && (userInput.includes('nota') || userInput.includes('note'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('notes');
    } else if (userInput.includes('abr') && (userInput.includes('calc') || userInput.includes('matem'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('calc');
    } else if (userInput.includes('abr') && (userInput.includes('navegador') || userInput.includes('internet'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('browser');
    } else if (userInput.includes('abr') && (userInput.includes('archivo') || userInput.includes('documento'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('files');
    } else if (userInput.includes('abr') && (userInput.includes('calendar') || userInput.includes('fecha'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('calendar');
    } else if (userInput.includes('abr') && (userInput.includes('terminal') || userInput.includes('com'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('terminal');
    } else if (userInput.includes('abr') && (userInput.includes('toybox') || userInput.includes('diver'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('toybox');
    } else if (userInput.includes('abr') && (userInput.includes('video') || userInput.includes('player'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('nyxvideoplayer');
    } else if (userInput.includes('abr') && (userInput.includes('imagen') || userInput.includes('image'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('nyximageviewer');
    } else if (userInput.includes('abr') && (userInput.includes('store') || userInput.includes('tienda'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('nyxpawstore');
    } else if (userInput.includes('abr') && (userInput.includes('ytcl') || userInput.includes('youtube'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('nytclient');
    } else if (userInput.includes('abr') && (userInput.includes('task') || userInput.includes('tareas'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('taskmanager');
    }
    
    
    
    
    
    
    else {
        nekiriAnswers = [
            "Disclulpa, pero no te entendí, puedes buscar en internet :D",
            "Hmmm... no te he entendido, puedes explicarlo mejor?",
            "No te entendí, pero encontre esto en internet:"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
        nekiriShowSmartCard('search','Buscar en internet', encodeURI(`https://www.google.com/search?q=${userInput}&igu=1`));
    }

    userInput.value = '';
    nekiriInput.value = '';
}

let audioDPOpen = false;
const audioButton = document.getElementById('topbar_audio');
const audioDropdown = document.getElementById('audio-dropdown');

audioButton.addEventListener("click", (e) => {
    e.stopPropagation();

    if (audioDPOpen) {
        audioDropdown.classList.add('hidden');
        audioDPOpen = false;
        return;
    }

    const rect = audioButton.getBoundingClientRect();

    audioDropdown.style.right = (window.innerWidth - rect.right) + "px";
    audioDropdown.style.top = rect.bottom + "px";
    audioDropdown.style.zIndex = topZ + 2;
    audioDropdown.classList.remove('hidden');

    audioDPOpen = true;
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
    briefDropdown.style.zIndex = topZ + 2;
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
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;

    if ((e.ctrlKey || e.metaKey) && e.altKey && e.shiftKey && e.key.toLowerCase() === 'm') {
        if (!sysEmgMenuTimer) {
            sysEmgMenuTimer = setTimeout(() => {
                //sysEmgMenu.classList.remove('hidden');
                const sysEmgMenu = document.createElement('div');
                sysEmgMenu.id = 'sys-emg-menu';
                sysEmgMenu.innerHTML = 
                `<p>System Emergency Menu</p>
        <button onclick="document.getElementById('sys-emg-menu').remove()">Close</button>
        <button onclick="sysclosesesion(); document.getElementById('sys-emg-menu').remove();">Sign Out</button>
        <button onclick="sysExecApp('taskmanager'); document.getElementById('sys-emg-menu').remove();">Task Manager</button>
        <button onclick="sysShowRunDialog(); document.getElementById('sys-emg-menu').remove();">Execute ID/quickCommand</button>
        <button onclick="sysshutdown(); document.getElementById('sys-emg-menu').remove();">Shutdown</button>
        <button onclick="sysrestart(); document.getElementById('sys-emg-menu').remove();">Reboot</button>
        <button >-----------</button>
        <button onclick="window.close()">EMERGENCY SHUTDOWN - WILL CAUSE DATA LOSS</button>
        <button onclick="window.location.href = 'index.html'">EMERGENCY RESTART - WILL CAUSE DATA LOSS</button>`;
                sysEmgMenu.style.zIndex = topZ + 10;
                document.body.appendChild(sysEmgMenu);
            }, 10);
        }
    }

    if (e.ctrlKey && e.shiftKey && e.key.toLocaleLowerCase() === 'e') {
        sysShowRunDialog();
    }

    if (e.key === 'Escape') {
        e.preventDefault();
        document.getElementById('quickview').classList.add('hidden');
        document.getElementById('quickview_vid').classList.add('hidden');
        document.getElementById('quickview_img').classList.add('hidden');
        document.getElementById('quickview_img').classList.add('hidden');
    }

    if (e.key === ' ' && AppManager.loadedApps.has('files')) {
        e.preventDefault();
        const selected = window.fs.getSelectedItem();
        const selectedType = window.fs.getSelectedItemType();

        if (selected && selectedType === 'file') {
            e.preventDefault();
            const content = window.fs.openFile(selected);
            const ext = selected.split('.').pop().toLowerCase();

            if (['mp4', 'webm', 'ogg'].includes(ext)) {
                showQuickViewWin('video', content);
            } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
                showQuickViewWin('img', content);
            } else {
                showQuickViewWin('text', content);
            }
        }
    }

    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (document.getElementById('win_appcenter').classList.contains('hidden')) {
            sysExecApp('appcenter');
            setTimeout(() => {
                document.getElementById('appcenter_searchbar').focus();
            },120);
        } else {
            document.getElementById('win_appcenter').classList.add('hidden');
            document.getElementById('appcenter_searchbar').value = '';
        }
    }
    if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        if (document.getElementById('win_appcenter').classList.contains('hidden')) {
            sysExecApp('appcenter');
            setTimeout(() => {
                document.getElementById('appcenter_searchbar').focus();
            },120);
        } else {
            document.getElementById('win_appcenter').classList.add('hidden');
            document.getElementById('appcenter_searchbar').value = '';
        }
    }
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (!document.getElementById('appcenter_nekiriHint').classList.contains('hidden')) {
            appcenterAskNekiri();
        }
    }
});

document.addEventListener('keyup', () => {
    clearTimeout(sysEmgMenuTimer);
    sysEmgMenuTimer = null;
})






  








/*Sonidos UI */
function sysPlaySound(soundname) {
    if (SysVar.sessionAutoStart.includes('audio')) {
        if (SysVar.systemSound[soundname]) {
            SysVar.systemSound[soundname].currentTime = 0;
            SysVar.systemSound[soundname].play().catch(e => console.log('Failed to play system sound'));
        }
    } else {
        console.error('Audio Service not found');
        showAlertBox('Error', 'System Audio Service not found!', {as_win:true,icon:'❌'});
    }
}

function sysExecApp(appName, options = {}) {
    if (typeof AppManager === 'undefined') {
        console.error('AppManager not available');
        return;
    }

    if (appName !== 'syssetup') {
        if (SysVar.lockedSession) {
            console.error('Session locked');
            showAlertBox('Error', 'The current session is locked by your administrator', {as_win:true,icon:'❌'});
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
            appCenter.classList.remove('hidden');
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
                showAlertBox('❌ Error', `Ocurrio un error al abrir ${appName}`);
            } else {
                showAlertBox('🛜 Sin internet', `Conectate a internet para abrir ${appName}`);
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
        showAlertBox('⚠️ Advertencia','Ingresa un ID o quickCommand valido!');
        return;
    }
    try {

        const fullCommand = commandRun.value.split(" ");
        const command = fullCommand[0];
        const args = fullCommand.slice(1);

        if (command === '--app') {
            sysExecApp(args[0]);
        } else if (command === '--q') {
            if (args[0] === 'runProg') {
                sysExecApp(args[1]);
            } else if (args[0] === 'shutdown') {
                if (args[1] === '--now') {
                    sysshutdown();
                } else {
                    const shutdownTime = args[1];
                    setTimeout(() => {
                        sysshutdown();
                    }, shutdownTime);
                }
            }
        } else if (command === '--terminal') {
            const consoleCom = args.join(' ');
            sysExecApp('terminal');
            setTimeout(() => runCommand(consoleCom), 90);
        } else if (command === '--devmode') {
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
                        showAlertBox('❌ Error', `${args[1]} is not supported as a NyxPawBasicScript! This error might occur if:\n- The script is too large\n- The script did not execute with enough permissions`)
                    }
                } else if (args[0] === '--as$npss') {
                    showAlertBox('❌ Error', 'npss (NyxPawSystemScripts) are no longer supported on quickCommand, please use the terminal or execute a npbs (NyxPawBasicScript).');
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
                showAlertBox('❌ Error', 'No tienes permisos para ejecutar el comando: Modo dev no activado!');
            }
        } else if (command === 'eval') {
            const jsToExec = args.join(' ');
            if (SysVar.flagAlwaysAllowEvals) {
                eval(jsToExec);
            } else if (SysVar.devMode) {
                const sureToExecEval = await showPromptMsgBox('⚠️ ADVERTENCIA', 'Esta acción ejecutará código arbitrario en tiempo real. Un uso incorrecto puede causar pérdida de datos, errores críticos o vulnerabilidades de seguridad. Si no sabes exactamente qué hace este comando, cancela ahora.', 'Cancelar', 'Continuar');
                if (sureToExecEval.confirmed) return;
                eval(jsToExec);
            } else {
                showAlertBox('❌ Error', 'No tienes permisos para ejecutar el comando: Modo dev no activado!');
            }
        } else {
            showAlertBox('❌ Error', 'Comando desconocido');
        }

    } catch(error) {
        showAlertBox('❌ Error','Error:'+error);
    }
}


if (usedBefore) {
    if (!SysVar.sessionAutoStart.includes('input')) {
        document.body.style.pointerEvents = 'none';
        document.documentElement.style.cursor = 'none';
    }
}

async function formatSystem() {
    const confirmDeleteData = await showMsgBox("⚠️ ALERTA!", "Estas a punto de borrar todos tus datos y configuraciones! Realmente quieres proceder? Tu sistema se apagara!", "Eliminar mis datos", "Cancelar");
    if (confirmDeleteData) {
        sysComQuitTasks();
        hideAppBar();
        hideTopBar();

        localStorage.clear();

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
}

const showABEnabled = SysVar.showconsoleerr;

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('error', (e) => {
        if (e.filename && e.filename.includes(window.location.origin)) {
            //const errorMsg = `${e.message}\nArchivo: ${e.filename}\nLínea: ${e.lineno}`;
            const errorMsg = `Error: ${e.message}`;
            if (showABEnabled && showABEnabled.checked) {
                showAlertBox('Error', errorMsg, {as_win:true, icon:'❌'});
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
            showAlertBox('Error', errorMsg, {as_win:true, icon:'❌'});
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
            showAlertBox('Advertencia', errorMsg, {as_win:true, icon:'⚠️'});
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
            showAlertBox('Error', errorMsg, {as_win:true, icon:'❌'});
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



function renderAppBar() {
    const appBar = document.getElementById('appbar');
    appBar.innerHTML = '';

    SysVar.appBarIcons.forEach(appObj => {
        if (!("minimized" in appObj)) appObj.minimized = false;
        if (!("permanent" in appObj)) appObj.permanent = true;
    });

    function createAppBtn(appObj) {
        const btn = document.createElement('button');
        btn.className = 'appbar-app';
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
            showAlertBox('Advertencia','No puedes eliminar el App Center.',{icon:'⚠️',as_win:true});
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
let _mainConfLastContent = null;

function watchMainConf() {
    if (!window.fs) return;
    
    try {
        if (!window.fs.fileExistInPath('main.conf', '/system/general')) return;
        
        const currentContent = openFile('main.conf', '/system/general');
        
        if (_mainConfLastContent === null) {
            _mainConfLastContent = currentContent;
            return;
        }
        
        if (currentContent !== _mainConfLastContent) {
            console.log('[NyxPawOS] main.conf changed externally, reloading config...');
            _mainConfLastContent = currentContent;
            loadDataReg();
            renderAppBar();
        }
    } catch (e) {
        if (SysVar.devMode) {
            console.error(e);
        }
    }
}

setInterval(watchMainConf, 2000);

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
    document.getElementById('quickview').classList.add('hidden');
    document.getElementById('quickview_vid').classList.add('hidden');
    document.getElementById('quickview_img').classList.add('hidden');
    document.getElementById('quickview_text').classList.add('hidden');
}

async function requestAddAppBar(apptoaddname) {
    const confirmAddAppTAB = await showMsgBox("Solicitud",`Una aplicacion quiere agregar ${apptoaddname} al AppBar\nPermitir?`, "Permitir", "Cancelar",{as_win: false,icon: '💻'});
    if (confirmAddAppTAB) {
        const apptoaddicon = await getPathAppIcon(apptoaddname);
        appBarAddApp(apptoaddicon, apptoaddname, apptoaddname);
    }
}

async function getPathAppIcon(appName) {
    const routes = [
        `assets/apps/${appName}/3.png`,
        `assets/apps/${appName}.png`,
        `assets/${appName}.png`
    ];

    for (const route of routes) {
        try {
            const res = await fetch(route, { method: 'HEAD' });
            if (res.ok) return route;
        } catch (e) {}
    }

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
    document.getElementById('topbar_network').src = topbarIconWifi.src;
    if (systemIsOffline) {
        createNotification('assets/system/wifi.png', 'Reconectado', 'Conectado a internet nuevamente.');
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


window.scriptReady('sys');