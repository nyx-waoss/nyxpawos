SysVar.bootFinished = false;
console.log("System startup initiated!");
console.log("Current: init.js");

/*
init.js es un archivo "limbo" entre sys.js y sysloader.js, no carga el sistema, pero tampoco lo administra por completo.
Este archivo verifica la integridad del sistema y llama a las funciones necesarias durante el boot. Sin este archivo el sistema ni siquiera mostraria la pantalla de login.

*/

const params2 = new URLSearchParams(window.location.search);
const mode2 = params2.get('mode');

let sysScriptIsOK = false;

function initializeLoginScreen() {
    const loginScreen = document.getElementById('loginscr_userlist');

    loginScreen.innerHTML = '';

    for (let username in sysUsers) {
        addUserToLoginScreen(username);
    }
}

function startLoading() {
    const loadProgressBar = document.getElementById('startupscr_progressbar');
    const loadProgressText = document.getElementById('startupscr_progresstext');
    loadProgressText.classList.add('hidden');
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
            if (loadPauseTimer > 7) { // Ajustar '30' para mas o menos tiempo de espera
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
                        sysBsod('X-SYS-CRP','System verification failed. Please reboot the computer.');
                    }
                    setTimeout(() => {
                        loginScr.classList.remove('hidden');
                        try {
                            document.documentElement.requestFullscreen();
                        } catch(e) {
                            console.log('Fullscreen not available:', e);
                        }
                        localStorage.setItem('sys_status', 'working');
                        SysVar.bootFinished = true;
                    }, 500);
                }, 200);
            } else {
                if (lastState === 'shutdown' || lastState === 'working') {
                    if (SysVar.bootFinished) {
                        return;
                    }
                    document.getElementById('syssetup_specialtext').textContent = 'Recovering, please wait...';
                    if (localStorage.getItem('sysStartupConfig') !== 'ShowBSODAlert'){
                        localStorage.setItem('sysStartupConfig', 'ShowSTAlert');
                    }
                    document.getElementById('startupscrimg').classList.add('hidden');
                    document.getElementById('startupscr_syssetup').classList.remove('hidden');
                    try {
                        document.documentElement.requestFullscreen();
                    } catch(e) {
                        console.log('Fullscreen not available:', e);
                    }
                    setTimeout(() => {
                        localStorage.setItem('sys_status', 'off');
                        window.location.reload();
                    }, 3000);
                } else {
                    document.getElementById('syssetup_specialtext').textContent = 'Welcome to NyxPawOS...';
                    saveDataReg();
                    document.getElementById('startupscrimg').classList.add('hidden');
                    document.getElementById('startupscr_syssetup').classList.remove('hidden');
                    try {
                        document.documentElement.requestFullscreen();
                    } catch(e) {
                        console.log('Fullscreen not available:', e);
                    }
                    setTimeout(() => {
                        const startupScr = document.getElementById('startupscr');
                        sysExecApp('syssetup');
                        startupScr.classList.add('hidden');
                        console.log('script is ok: ' + sysScriptIsOK);
                        if (sysScriptIsOK !== true) {
                            sysBsod('X-SYS-CRP','System verification failed. Please reboot the computer.');
                        }
                    }, 3000);
                }
            }
        }
    }, 11/*'50' es la velocidad, mayor numero = mas lento*/);
}

window.SysVar = window.SysVar || {};

function systemIntegrityCheck() {
    try {
        const criticalChecks = {
            /*'file-list': document.getElementById('file-list'),*/
            'top_bar': document.getElementById('top_bar'),
            'appbar': document.getElementById('appbar'),
            /*'bsod': document.getElementById('bsod'),*/
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
            throw new Error('LocalStorage failed');
        }
        localStorage.removeItem(testKey);

        const usedBefore = localStorage.getItem('used-before');
        if (usedBefore) {
            if (mode2 !== 'safe') {
                if (!SysVar.sessionAutoStart || !SysVar.sessionAutoStart.includes('UI')) {
                    throw new Error(`UI Service not ready.`);
                    
                }
            }
        }

        if (usedBefore) {
            if (!window.fs.isFolder('/system')) {
                throw new Error(`System not found.`);
            }
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
        sysBsod('X-DOM-CRT','Initialization failed: ' + e.message);
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

async function bootSystem() {
    initWindowManager();
    hideAppBar();
    hideTopBar();
    try {
        await AppManager.init();
    } catch(e) {
        console.error('AppManager Error:'+e);
    }
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

    //initSysTheme();
    setupCloseButtons();
    await waitUntil(() => typeof window.fs !== 'undefined');
    if (usedBefore && mode2 !== 'safe') {
        const setupLang = localStorage.getItem('sysSetupLang');
        if (setupLang) {
            SysVar.currentlang = setupLang;
            localStorage.removeItem('sysSetupLang');
        }
        loadDataReg();
    }
    renderAppBar();

    translateSystem(SysVar.currentlang || "auto");

    systemIntegrityCheck()
    setInterval(updateTime, 1000);
    updateTime();

    window.scriptReady('init');
    localStorage.removeItem('sys_boot_heartbeat');
    console.log("SYSTEM READY");
    clearInterval(window._bootHeartbeatWatcher);
    _sysFunctionWatchdog.init();
    console.log('[SysGuard] System function protection active');
}

startLoading();
bootSystem();




/*
X-DOM-CRT: Faltan elementos del DOM
X-SUI-INR: Servicio de UI no iniciado




*/
