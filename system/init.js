console.log("System startup initiated!");
console.log("Current: init.js");

const params2 = new URLSearchParams(window.location.search);
const mode2 = params2.get('mode');

let sysScriptIsOK = false;

function initializeLoginScreen() {
    const loginScreen = document.getElementById('loginscr');

    loginScreen.innerHTML = '';

    for (let username in sysUsers) {
        addUserToLoginScreen(username);
    }
}

function startLoading() {
    const loadProgressBar = document.getElementById('startupscr_progressbar');
    const loadProgressText = document.getElementById('startupscr_progresstext');
    const loginScr = document.getElementById('loginscr');
    let loadProgress = 0;
    let loadIsPaused = false;
    let loadPauseTimer = 0;

    const loadInterval = setInterval(() => {
        if (loadProgress < 30) {
            loadProgress += Math.random() * 3 + 1;
        } else if (loadProgress < 50) {
            loadProgress += Math.random() * 2 + 0.5;
        } else if (loadProgress >= 50 && loadProgress < 55 && !loadIsPaused) {
            loadIsPaused = true;
            loadPauseTimer = 0;
        } else if (loadIsPaused) {
            loadPauseTimer++;
            if (loadPauseTimer > 8) { // Ajustar '30' para mas o menos tiempo de espera
                loadIsPaused = false;
                loadProgress += 0.5;
            }
        } else if (loadProgress < 95) {
            loadProgress += Math.random() * 1 + 0.3;
        } else {
            loadProgress += 0.6;
        }

        loadProgress = Math.min(loadProgress, 100);

        loadProgressBar.style.width = loadProgress + '%';
        if (loadProgressText) {
            loadProgressText.textContent = Math.floor(loadProgress) + '%';
        }

        if (loadProgress >= 100) {
            clearInterval(loadInterval);
            const usedBefore = localStorage.getItem('used-before');
            const lastState = localStorage.getItem('sys_status');
            if (usedBefore && lastState === 'off') {
                setTimeout(() => {
                    const startupScr = document.getElementById('startupscr');
                    startupScr.classList.add('hidden');
                    console.log('script is ok: ' + sysScriptIsOK);
                    if (sysScriptIsOK !== true) {
                        sysBsod('X-SYS-CRP','The system files are corrupted. Please contact technical support');
                    }
                    setTimeout(() => {
                        loginScr.classList.remove('hidden');
                        document.documentElement.requestFullscreen();
                        localStorage.setItem('sys_status', 'working');
                    }, 500);
                }, 200);
            } else {
                if (lastState === 'shutdown' || lastState === 'working') {
                    document.getElementById('syssetup_specialtext').textContent = 'Recuperando sistema...';
                    localStorage.setItem('sysStartupConfig', 'ShowSTAlert');
                    document.getElementById('startupscrimg').classList.add('hidden');
                    document.getElementById('startupscr_syssetup').classList.remove('hidden');
                    document.documentElement.requestFullscreen();
                    setTimeout(() => {
                        localStorage.setItem('sys_status', 'off');
                        window.location.reload();
                    }, 3000);
                } else {
                    document.getElementById('syssetup_specialtext').textContent = 'Preparando sistema...';
                    saveDataReg();
                    document.getElementById('startupscrimg').classList.add('hidden');
                    document.getElementById('startupscr_syssetup').classList.remove('hidden');
                    document.documentElement.requestFullscreen();
                    setTimeout(() => {
                        const startupScr = document.getElementById('startupscr');
                        sysExecApp('syssetup');
                        startupScr.classList.add('hidden');
                        console.log('script is ok: ' + sysScriptIsOK);
                        if (sysScriptIsOK !== true) {
                            sysBsod('X-SYS-CRP','The system files are corrupted. Please contact technical support');
                        }
                    }, 3000);
                }
            }
        }
    }, 15/*'50' es la velocidad, mayor numero = mas lento*/);
}

window.SysVar = window.SysVar || {};

function systemIntegrityCheck() {
    try {
        const criticalChecks = {
            'file-list': document.getElementById('file-list'),
            'top_bar': document.getElementById('top_bar'),
            'appbar': document.getElementById('appbar'),
            'bsod': document.getElementById('bsod'),
            'msg-box': document.getElementById('msg-box')
        };
        
        for (const [name, element] of Object.entries(criticalChecks)) {
            if (!element) {
                throw new Error(`Critical element missing: ${name}`);
            }
        }
        
        const testKey = '__system_test__';
        localStorage.setItem(testKey, 'test');
        if (localStorage.getItem(testKey) !== 'test') {
            throw new Error('localStorage is not functioning correctly');
        }
        localStorage.removeItem(testKey);

        const usedBefore = localStorage.getItem('used-before');
        if (usedBefore) {
            if (mode2 !== 'safe') {
                loadDataReg();
                if (!SysVar.sessionAutoStart.includes('UI')) {
                    throw new Error(`System check failed! SystemUI initialization failed, UI Service not ready.`);
                    
                }
            }
        }

        if (usedBefore) {
            if (!window.fs.isFolder('/system/users/root')) {
                throw new Error(`System user not found`);
            }
            if (!window.fs.isFolder('/system/temp')) {
                throw new Error(`Could not extract temporal files: 'system/temp' not found`);
            }
        }

        //esta variable se establece hasta el final, de esta forma en caso de que algo en el script falle, la variable no se inicializa y eso significa que hay algun error:
        sysScriptIsOK = true;
        
    } catch (e) {
        sysBsod('X-DOM-CRT','System check failed! SystemUI initialization failed, DOM elements missing: ' + e.message + ' System cannot continue.');
    }
}

function initSysTheme() {
    const theme = SysVar.themes[SysVar.currenttheme];

    if (!theme) {
        console.error('Theme not found!');
        SysVar.currenttheme = 'dark';
        return;
    }

    Object.entries(theme).forEach(([variable, value]) => {
        document.documentElement.style.setProperty(variable, value);
    });

    console.log('Theme set succesfully');
}


//inicializar todo:
startLoading(); 

setInterval(updateTime, 1000);
updateTime();
initWindowManager();
hideAppBar();
hideTopBar();
initFileSystem();
if (document.getElementById('file-list')) {
  updateFileList();
  setupFileSelection();
  setupContextMenu();
  setupContextMenuActions();
}

initializeLoginScreen();
refreshUserCards();
document.getElementById('startupscr').classList.remove('hidden');
document.getElementById('startupscrimg').classList.remove('hidden');
document.getElementById('startupscrtext').classList.add('hidden');

initSysTheme();
setupCloseButtons();
systemIntegrityCheck()



window.scriptReady('init');
console.log("SYSTEM READY");

/*
X-DOM-CRT: Faltan elementos del DOM
X-SUI-INR: Servicio de UI no iniciado




*/