console.log('Current: apps/appname.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.appname = {
    displayName: 'App Name',
    icon: 'assets/apps/custom-icon.png',
    version: '1.0.0',
    author: 'Author'
};

//Codigo aqui:

console.log("INFO: apps/appname.js has no .js code to provide"); // Quitar linea si hay codigo





//Codigo arriba ⬆️⬆️

function init_appname() {
    console.log('Initiating appname...');
}

function cleanup_appname() {
    console.log('Cleaning appname...');
}

window.scriptReady('appname');
//template version 3.1

//=========================================================
//Uso de requests:

/*const APPNAME_WINDOW_ID = 'win_appname'; //CAMBIAR NOMBRE DE VARIABLE!!
function solicitarFullscreen() {
    isFullscreen = !isFullscreen;
    window.parent.postMessage({
        action: 'fullscreen', //<-- puede cambairse
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

/*
CLEANUP OBLIGATORIO: todo lo que se crea, se destruye :D
*/