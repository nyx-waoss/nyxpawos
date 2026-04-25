console.log('Current: apps/nyxpawworkspace.js');
//METADATA (opcional)
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.nyxpawworkspace = {
    displayName: 'NyxPaw Workspace',
    icon: '../../assets/apps/nyxpawworkspace.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:

window.SysVar = window.SysVar || {};
let npwosp_pages = null;

function NPWHideAllPages() {
    npwosp_pages.forEach((page) => {
        page.classList.add('hidden');
    });
}

function NPWGotoPage(page) {
    NPWHideAllPages();
    try {
        document.getElementById(`npwosp_${page}`).classList.remove('hidden');
    } catch(error) {
        console.error('NPWorkspace: page not found.');
        showAlertBox('Error','Pagina no encontrada',{as_win:true,icon:'❓'});
    }
}




//Codigo arriba ⬆️⬆️

function init_nyxpawworkspace() {
    console.log('Initiating nyxpawworkspace...');
    npwosp_pages = document.querySelectorAll(".npwosp_page");

    NPWGotoPage('appsgrid');
    document.getElementById('npwosp_welcomep').textContent = `Bienvenido ${SysVar.currentuser.dName}!`;
}

function cleanup_nyxpawworkspace() {
    console.log('Cleaning nyxpawworkspace...');
}

window.scriptReady('nyxpawworkspace');
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