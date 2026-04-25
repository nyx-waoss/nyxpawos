console.log("Current: apps/imgviewer.js");
window.AppMetadata = window.AppMetadata || {};

window.AppMetadata.imgviewer = {
    displayName: 'Image Viewer',
    icon: '../../assets/apps/imageview.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

if (!window._imgViewerInitialized) {
    window._imgViewerInitialized = true;
    window._imgViewerCurrentURL  = null;   // ← aquí
    window._imgViewerCurrentBlob = null;   // ← aquí
    window._imgViewerSelectedFile = null;  // ← aquí

    const imageViewerAskBtnConfirm      = document.getElementById('askForImageFile-btn_save');
    const imageViewerAskBtnCancel       = document.getElementById('askForImageFile-btn_cancel');
    const imageViewerAskBtnFromFS       = document.getElementById('askForImageFile-btn_fromfs');
    const imageViewerAskClose           = document.getElementById('btn_askForImageFile');
    const imageViewerFileSelector       = document.getElementById('nyximageviewer_openFilePrompt');
    const imageViewerPlayer             = document.getElementById('nyximageviewer_player');
    const imageViewerWindowSelect       = document.getElementById('win_askForImageFile');
    const imageViewerStatusText         = document.getElementById('nyximageviewer_status');


    // ── Helpers ────────────────────────────────────────────────────────────────

    function _imgViewerCloseDialog() {
        imageViewerWindowSelect.classList.remove('window_anim_open');
        setTimeout(() => {
            imageViewerWindowSelect.classList.add('hidden');
            imageViewerWindowSelect.style.removeProperty('opacity');
        }, 200);
    }

    function _imgViewerSetStatus(text) {
        const el = document.getElementById('nyximageviewer_status');
        if (el) el.textContent = text;
    }

    function _imgViewerRevokeCurrent() {
        if (window._imgViewerCurrentURL) {
            const oldURL = window._imgViewerCurrentURL;
            window._imgViewerCurrentURL = null;
            const player = document.getElementById('nyximageviewer_player');
            if (player) player.src = '';
            setTimeout(() => URL.revokeObjectURL(oldURL), 100);
        }
    }

    function _imgViewerDisplay(blob, fromDevice = false) {
        _imgViewerRevokeCurrent();
        const url = URL.createObjectURL(blob);
        
        const player = document.getElementById('nyximageviewer_player');
        player.src = url;
        window._imgViewerCurrentURL = url;

        window._imgViewerCurrentBlob = fromDevice ? blob : null;
        const saveBtn = document.getElementById('nyximageviewer_saveBtn');
        if (saveBtn) saveBtn.classList.toggle('hidden', !fromDevice);
    }


    async function imageViewerOpenFromFS(fullPath) {
        try {
            _imgViewerSetStatus('Cargando...');
            

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

            sysExecApp('nyximageviewer');

            await new Promise(r => setTimeout(r, 50));

            _imgViewerDisplay(blob);
            _imgViewerSetStatus(fullPath.split('/').pop());

        } catch (e) {
            console.error('[imgviewer] Error loading from FS:', e);
            _imgViewerSetStatus('Error al cargar la imagen.');
            showAlertBox('Error', `No se pudo cargar la imagen: ${e.message}`, { as_win: true, icon: '❌' });
        }
    }


    imageViewerFileSelector.addEventListener('change', function(e) {
        window._imgViewerSelectedFile = e.target.files[0] || null;
    });

    imageViewerAskBtnConfirm.addEventListener('click', function() {
        if (!window._imgViewerSelectedFile) return;

        _imgViewerDisplay(window._imgViewerSelectedFile, true);
        _imgViewerSetStatus(window._imgViewerSelectedFile.name);

        window._imgViewerSelectedFile = null;
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
        window._imgViewerSelectedFile = null;
        imageViewerFileSelector.value = '';
        _imgViewerCloseDialog();
    });

    imageViewerAskClose.addEventListener('click', () => {
        _imgViewerCloseDialog();
    });

    const imageViewerSaveBtn = document.getElementById('nyximageviewer_saveBtn');
    if (imageViewerSaveBtn) {
        imageViewerSaveBtn.addEventListener('click', () => {
            if (!window._imgViewerCurrentBlob) return;

            const blobSnap = window._imgViewerCurrentBlob;

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
}

window.scriptReady('imgviewer');