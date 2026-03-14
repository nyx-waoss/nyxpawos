console.log('Current: apps/loginhelp.js');
//METADATA (opcional)
/*window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.appname = {
    displayName: 'App Name',
    icon: 'assets/apps/custom-icon.png',
    version: '1.0.0',
    author: 'Author'
};*/

//Codigo aqui:

console.log("INFO: apps/loginhelp.js has no .js code to provide"); // Quitar linea si hay codigo





//Codigo arriba ⬆️⬆️

function init_loginhelp() {
    console.log('Initiating loginhelp...');
}

function cleanup_loginhelp() {
    console.log('Cleaning loginhelp...');
}

window.scriptReady('loginhelp');
//template version 3.0

//=========================================================
//Uso de requests:

/*const WINDOW_ID = 'win_appname'; //CAMBIAR NOMBRE DE VARIABLE!!
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