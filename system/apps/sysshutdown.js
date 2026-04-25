console.log('Current: apps/sysshutdown.js');
//METADATA (opcional)
/*window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.appname = {
    displayName: 'App Name',
    icon: 'assets/apps/custom-icon.png',
    version: '1.0.0',
    author: 'Author'
};*/

//Codigo aqui:

const sysshutdownIconOff = new Image();
sysshutdownIconOff.src = 'assets/system/shutdown.png';
const sysshutdownIconRes = new Image();
sysshutdownIconRes.src = 'assets/system/reboot.png';

function _sysshutdownModeInternal(mode, custommsg="Sistema") {
    if (mode == 'shutdown') {
        document.getElementById('sysshutdown_icon').src = sysshutdownIconOff.src;
        document.getElementById('sysshutdown_title').textContent = 'Apagar';
        if (custommsg) {
            document.getElementById('sysshutdown_shutdowntext').textContent = 'Quieres apagar el sistema? Asegurate de guardar tus datos.';
        } else {
            document.getElementById('sysshutdown_shutdowntext').textContent = custommsg;
        }
        document.getElementById('sysshutdown_mainbtn').textContent = 'Apagar';
        document.getElementById('sysshutdown_mainbtn').onclick = () => {sysshutdown(false, 'normal', undefined)};
    } else if (mode == 'restart') {
        document.getElementById('sysshutdown_icon').src = sysshutdownIconRes.src;
        document.getElementById('sysshutdown_title').textContent = 'Reiniciar';
        if (custommsg) {
            document.getElementById('sysshutdown_shutdowntext').textContent = 'Quieres reiniciar el sistema? Asegurate de guardar tus datos.';
        } else {
            document.getElementById('sysshutdown_shutdowntext').textContent = custommsg;
        }
        document.getElementById('sysshutdown_mainbtn').textContent = 'Reiniciar';
        document.getElementById('sysshutdown_mainbtn').onclick = () => {sysrestart(false)};
    } else {
        document.getElementById('sysshutdown_icon').src = sysshutdownIconOff.src;
        document.getElementById('sysshutdown_title').textContent = 'Sistema';
        document.getElementById('sysshutdown_shutdowntext').textContent = 'Sistema';
        document.getElementById('sysshutdown_mainbtn').textContent = 'Ok';
        document.getElementById('sysshutdown_mainbtn').onclick = () => {sysshutdown(false, 'normal', undefined)};
    }
}

window.sysshutdownMode = function(mode, custommsg) {
    if (!AppManager.loadedApps.has('sysshutdown')) {
        AppManager.loadApp('sysshutdown').then(() => {
            setTimeout(() => {
                _sysshutdownModeInternal(mode, custommsg);
            }, 70);
        });
        return;
    }

    _sysshutdownModeInternal(mode);
};

//Codigo arriba ⬆️⬆️

function init_sysshutdown() {
    console.log('Initiating sysshutdown...');
}

function cleanup_sysshutdown() {
    console.log('Cleaning sysshutdown...');
}

window.scriptReady('sysshutdown');
//template version 3.1

//=========================================================
//Uso de requests:

/*const APPNAME_WINDOW_ID = 'win_appname'; //CAMBIAR NOMBRE DE VARIABLE!!
function solicitarFullscreen() {
    isFullscreen = !isFullscreen;
    window.parent.postMessage({
        action: 'fullscreen', <-- puede cambairse
        windowId: WINDOW_ID,
        enable: isFullscreen
    }, '*');
}*/

//puede ser:
// 'fullscreen'
// 'maximize'/'restore'
// launch 
// logout
// kill
// addtoappbar

//Cambiar todas las referencias de appname por el nombre de la app