console.log('Current: apps/safefilesmanager.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.safefilesmanager = {
    displayName: 'Safe Files Manager',
    icon: 'assets/apps/safefilesmanager.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:

window.SysVar = window.SysVar || {};

function render_safefilesmanager_list() {
    const sfmgr_list = document.getElementById('content_safefilesmanager');
    sfmgr_list.innerHTML = '';

    SysVar.safeFiles.forEach(arr_item => {
        const span_item = document.createElement('span');
        span_item.textContent = arr_item;
        sfmgr_list.appendChild(span_item);
    });
}

async function safefilesmanager_addNewPrompt() {
    const newSafeFile_prompt = await showPromptMsgBox('Ruta', 'Ingrese la ruta completa del archivo', 'Aceptar', 'Cancelar',{as_win:true,icon:'➕'});
    if (!newSafeFile_prompt.confirmed) return;
    if (!newSafeFile_prompt.value) return;
    if (SysVar.safeFiles.includes(newSafeFile_prompt.value)) return;

    SysVar.safeFiles.push(newSafeFile_prompt.value);
    render_safefilesmanager_list();
}
async function safefilesmanager_delSafeFile() {
    const newSafeFile_prompt = await showPromptMsgBox('Ruta', 'Ingrese la ruta completa del archivo', 'Aceptar', 'Cancelar',{as_win:true,icon:'➖️'});
    if (!newSafeFile_prompt.confirmed) return;
    if (!newSafeFile_prompt.value) return;
    if (!SysVar.safeFiles.includes(newSafeFile_prompt.value)) return;

    SysVar.safeFiles = SysVar.safeFiles.filter(x=>x!== newSafeFile_prompt.value);
    render_safefilesmanager_list();
}

//Codigo arriba ⬆️⬆️

function init_safefilesmanager() {
    console.log('Initiating safefilesmanager...');
    render_safefilesmanager_list();
}

function cleanup_safefilesmanager() {
    console.log('Cleaning safefilesmanager...');
    render_safefilesmanager_list();
}

window.scriptReady('safefilesmanager');
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