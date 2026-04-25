console.log('Current: apps/startupapps.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.startupapps = {
    displayName: 'Startup Apps',
    icon: 'assets/apps/startupapps.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:

window.SysVar = window.SysVar || {};

function render_startupapps_list() {
    const sfmgr_list = document.getElementById('content_startupapps');
    sfmgr_list.innerHTML = '';

    SysVar.logonAutoStart.forEach(arr_item => {
        const span_item = document.createElement('span');
        span_item.textContent = arr_item;
        sfmgr_list.appendChild(span_item);
    });
}

async function startupapps_addNewPrompt() {
    const newSafeFile_prompt = await showPromptMsgBox('Ruta', 'Ingrese la ruta completa del archivo', 'Aceptar', 'Cancelar',{as_win:true,icon:'➕'});
    if (!newSafeFile_prompt.confirmed) return;
    if (!newSafeFile_prompt.value) return;
    if (SysVar.logonAutoStart.includes(newSafeFile_prompt.value)) return;

    SysVar.logonAutoStart.push(newSafeFile_prompt.value);
    render_startupapps_list();
}
async function startupapps_delSafeFile() {
    const newSafeFile_prompt = await showPromptMsgBox('Ruta', 'Ingrese la ruta completa del archivo', 'Aceptar', 'Cancelar',{as_win:true,icon:'➖️'});
    if (!newSafeFile_prompt.confirmed) return;
    if (!newSafeFile_prompt.value) return;
    if (!SysVar.logonAutoStart.includes(newSafeFile_prompt.value)) return;

    SysVar.logonAutoStart = SysVar.logonAutoStart.filter(x=>x!== newSafeFile_prompt.value);
    render_startupapps_list();
}

//Codigo arriba ⬆️⬆️

function init_startupapps() {
    console.log('Initiating startupapps...');
    render_startupapps_list();
}

function cleanup_startupapps() {
    console.log('Cleaning startupapps...');
    render_startupapps_list();
}

window.scriptReady('startupapps');
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