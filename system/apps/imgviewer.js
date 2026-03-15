console.log("Current: apps/imgviewer.js");

const imageViewerAskBtnConfirm      = document.getElementById('askForImageFile-btn_save');
const imageViewerAskBtnCancel       = document.getElementById('askForImageFile-btn_cancel');
const imageViewerAskBtnFromFS       = document.getElementById('askForImageFile-btn_fromfs');
const imageViewerAskClose           = document.getElementById('btn_askForImageFile');
const imageViewerFileSelector       = document.getElementById('nyximageviewer_openFilePrompt');
const imageViewerPlayer             = document.getElementById('nyximageviewer_player');
const imageViewerWindowSelect       = document.getElementById('win_askForImageFile');
const imageViewerStatusText         = document.getElementById('nyximageviewer_status');

let imageViewerSelectedFile = null;
let imageViewerCurrentURL   = null;
let imageViewerCurrentBlob = null;

// ── Helpers ────────────────────────────────────────────────────────────────

function _imgViewerCloseDialog() {
    imageViewerWindowSelect.classList.remove('window_anim_open');
    setTimeout(() => {
        imageViewerWindowSelect.classList.add('hidden');
        imageViewerWindowSelect.style.removeProperty('opacity');
    }, 200);
}

function _imgViewerSetStatus(text) {
    if (imageViewerStatusText) imageViewerStatusText.textContent = text;
}

function _imgViewerRevokeCurrent() {
    if (imageViewerCurrentURL) {
        URL.revokeObjectURL(imageViewerCurrentURL);
        imageViewerCurrentURL = null;
        imageViewerPlayer.src = '';
    }
}

function _imgViewerDisplay(blob, fromDevice = false) {
    _imgViewerRevokeCurrent();
    const url = URL.createObjectURL(blob);
    imageViewerPlayer.src = url;
    imageViewerCurrentURL = url;

    imageViewerCurrentBlob = fromDevice ? blob : null;
    const saveBtn = document.getElementById('nyximageviewer_saveBtn');
    if (saveBtn) saveBtn.classList.toggle('hidden', !fromDevice);
}

// ── Abrir desde IndexedDB (llamado desde el explorador de archivos) ────────
// Uso: imageViewerOpenFromFS('/home/user/imagenes/foto.png')
// El explorador debe llamar esta funcion en el dblclick de archivos de imagen.

async function imageViewerOpenFromFS(fullPath) {
    try {
        _imgViewerSetStatus('Cargando...');
        sysExecApp('nyximageviewer');

        const db  = await _openDB();
        const blob = await new Promise((resolve, reject) => {
            const tx  = db.transaction('media', 'readonly');
            const req = tx.objectStore('media').get(fullPath);
            req.onsuccess = () => resolve(req.result);
            req.onerror   = (e) => reject(e.target.error);
        });

        if (!blob) {
            _imgViewerSetStatus('Error: imagen no encontrada en NyxPaw FS.');
            showAlertBox('Error', `No se encontró la imagen en el sistema de archivos.`, { as_win: true, icon: '❌' });
            return;
        }

        _imgViewerDisplay(blob);
        _imgViewerSetStatus(fullPath.split('/').pop()); // muestra solo el nombre

    } catch (e) {
        console.error('[imgviewer] Error loading from FS:', e);
        _imgViewerSetStatus('Error al cargar la imagen.');
        showAlertBox('Error', `No se pudo cargar la imagen: ${e.message}`, { as_win: true, icon: '❌' });
    }
}

// ── Desde dispositivo (flujo original) ────────────────────────────────────

imageViewerFileSelector.addEventListener('change', function(e) {
    imageViewerSelectedFile = e.target.files[0] || null;
});

imageViewerAskBtnConfirm.addEventListener('click', function() {
    if (!imageViewerSelectedFile) return;

    _imgViewerDisplay(imageViewerSelectedFile, true);
    _imgViewerSetStatus(imageViewerSelectedFile.name);

    imageViewerSelectedFile = null;
    imageViewerFileSelector.value = '';
    _imgViewerCloseDialog();
});

if (imageViewerAskBtnFromFS) {
    imageViewerAskBtnFromFS.addEventListener('click', () => {
        _imgViewerCloseDialog();
        sysExecApp('files');
    });
}


imageViewerAskBtnCancel.addEventListener('click', () => {
    imageViewerSelectedFile = null;
    imageViewerFileSelector.value = '';
    _imgViewerCloseDialog();
});

imageViewerAskClose.addEventListener('click', () => {
    _imgViewerCloseDialog();
});

const imageViewerSaveBtn = document.getElementById('nyximageviewer_saveBtn');
if (imageViewerSaveBtn) {
    imageViewerSaveBtn.addEventListener('click', () => {
        if (!imageViewerCurrentBlob) return;

        const blobSnap = imageViewerCurrentBlob;

        sysExecApp('files');

        (async () => {
            await waitUntil(() => typeof filesOpenSaveDialog === 'function');
            filesOpenSaveDialog();

            await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === true);
            await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === false);

            if (SysVar.pointerFilesSaveDialogSaveYN) {
                const filename = SysVar.pointerFilesSaveDialogFilename.trim();
                if (!filename) {
                    showAlertBox('⚠️ Advertencia!', 'Ingresa un nombre para el archivo!');
                    return;
                }

                const imageExts = ['png','jpg','jpeg','gif','webp','bmp'];
                const ext = filename.split('.').pop().toLowerCase();
                const finalFilename = imageExts.includes(ext) ? filename : filename + '.png';

                try {
                    await window.fs.saveImage(finalFilename, window.fs.getCurrentDirectory(), blobSnap);
                    window.fs.createFile(finalFilename, '', window.fs.getCurrentDirectory());
                    _imgViewerSetStatus(`Guardado: ${finalFilename}`);
                    console.log(`[imgviewer] Image saved as: ${finalFilename}`);
                } catch (e) {
                    console.error('[imgviewer] Error saving image:', e);
                    showAlertBox('❌ Error', `No se pudo guardar la imagen: ${e.message}`, { as_win: true, icon: '❌' });
                }

                SysVar.pointerFilesSaveDialogFilename = 'mi-foto.png';
            }

            SysVar.pointerFilesSaveDialogSaveYN = false;
        })();
    });
}

window.imageViewerOpenFromFS = imageViewerOpenFromFS;

window.scriptReady('imgviewer');