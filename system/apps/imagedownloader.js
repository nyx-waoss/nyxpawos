console.log('Current: apps/imagedownloader.js');
//Codigo aqui:

let imgdownloaderBtn = null;
let imgdownloaderImg = null;
let imgdownloaderInput = null;

let _imgdown_onchange = null;
let _imgdown_onclick  = null;

window.SysVar = window.SysVar || {};


function normalizeIMGDOWNURL(inurl) {
    try {
        return new URL(inurl).href
    } catch {
        return new URL("https://" + inurl).href
    }
}

//Codigo arriba ⬆️⬆️

function init_imagedownloader() {
    console.log('Initiating imagedownloader...');

    imgdownloaderBtn = document.getElementById('imagedownloader_btn');
    imgdownloaderImg = document.getElementById('imagedownloader_img');
    imgdownloaderInput = document.getElementById('imagedownloader_input');

    imgdownloaderInput.value = '';
    imgdownloaderImg.src = '';

    _imgdown_onchange = () => {
        imgdownloaderImg.src = normalizeIMGDOWNURL(imgdownloaderInput.value);
    };


    _imgdown_onclick = () => {
        sysExecApp('files');
        (async () => {
            await waitUntil(() => typeof filesOpenSaveDialog === 'function');
            filesOpenSaveDialog();

            await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === true);
            await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === false);

            if (!SysVar.pointerFilesSaveDialogSaveYN) {
                SysVar.pointerFilesSaveDialogSaveYN = false;
                return;
            }

            const filename = SysVar.pointerFilesSaveDialogFilename.trim();
            if (!filename) {
                showAlertBox('⚠️ Advertencia!', 'Ingresa un nombre para el archivo!');
                return;
            }

            const finalFilename = filename.includes('.') ? filename : filename + '.png';
            const targetDir     = window.fs.getCurrentDirectory();
            const url           = normalizeIMGDOWNURL(imgdownloaderInput.value);

            if (window.fs.fileExistInPath(finalFilename, targetDir)) {
                showAlertBox('❌ Error', 'Ya existe un archivo con ese nombre.');
                SysVar.pointerFilesSaveDialogSaveYN = false;
                return;
            }

            const success = await window.fs.downloadImageToFS(url, finalFilename, targetDir);

            if (success) {
                console.log(`Imagen guardada como: ${finalFilename}`);
            } else {
                console.error('Cannot save image');
            }

            SysVar.pointerFilesSaveDialogFilename = 'mi-imagen.png';
            SysVar.pointerFilesSaveDialogSaveYN   = false;
        })();
    };

    imgdownloaderInput.addEventListener('change', _imgdown_onchange);
    imgdownloaderBtn.addEventListener('click',    _imgdown_onclick);
}

function cleanup_imagedownloader() {
    console.log('Cleaning imagedownloader...');

    if (imgdownloaderInput && _imgdown_onchange) {
        imgdownloaderInput.removeEventListener('change', _imgdown_onchange);
        _imgdown_onchange = null;
    }

    if (imgdownloaderBtn && _imgdown_onclick) {
        imgdownloaderBtn.removeEventListener('click', _imgdown_onclick);
        _imgdown_onclick = null;
    }

    imgdownloaderInput.value = '';
    imgdownloaderImg.src = '';

    imgdownloaderBtn = null;
    imgdownloaderImg = null;
    imgdownloaderInput = null;
}

window.scriptReady('imagedownloader');
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