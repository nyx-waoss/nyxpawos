console.log('Current: apps/pdfviewer.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.pdfviewer = {
    displayName: 'PDF Viewer',
    icon: '../../assets/apps/pdfviewer.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

let pdfDoc         = null;   // PDFDocumentProxy
let pdfCurrentPage = 1;
let pdfTotalPages  = 0;
let pdfScale       = 1.0;
let pdfCurrentPath = null;   // ruta en el FS
let pdfCurrentName = null;   // filename

let _pdfCanvas, _pdfAnnotations, _pdfCanvasWrap, _pdfEmpty;
let _pdfPageInput, _pdfPageTotal, _pdfZoomLabel, _pdfStatusMsg, _pdfStatusSize;

function _ensurePdfJs() {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        s.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
        };
        s.onerror = () => reject(new Error('No se pudo cargar pdf.js'));
        document.head.appendChild(s);
    });
}

async function _pdfRenderPage(pageNum) {
    if (!pdfDoc) return;
    const page    = await pdfDoc.getPage(pageNum);
    const vp      = page.getViewport({ scale: pdfScale });
    const canvas  = _pdfCanvas;
    const ctx     = canvas.getContext('2d');

    canvas.width  = vp.width;
    canvas.height = vp.height;

    await page.render({ canvasContext: ctx, viewport: vp }).promise;

    pdfCurrentPage          = pageNum;
    _pdfPageInput.value     = pageNum;
    _pdfPageTotal.textContent = `/ ${pdfTotalPages}`;
    _pdfZoomLabel.textContent = Math.round(pdfScale * 100) + '%';
    _pdfStatusMsg.textContent = `Página ${pageNum} de ${pdfTotalPages}`;
}

async function _pdfLoad(arrayBuffer, fileName) {
    await _ensurePdfJs();
    _pdfSetStatus('Cargando…');

    try {
        pdfDoc         = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        pdfTotalPages  = pdfDoc.numPages;
        pdfCurrentPage = 1;
        pdfCurrentName = fileName || 'documento.pdf';

        _pdfEmpty.classList.add('hidden');
        _pdfCanvasWrap.classList.remove('hidden');
        _clearAnnotations();

        document.getElementById('pdfviewer-title').textContent = `📕  ${pdfCurrentName}`;
        _pdfStatusSize.textContent = `${pdfTotalPages} página${pdfTotalPages !== 1 ? 's' : ''}`;

        await _pdfRenderPage(1);
        _pdfSetStatus('Listo');
    } catch (e) {
        _pdfSetStatus('Error al abrir PDF');
        console.error('[PDFViewer] Load error:', e);
        showAlertBox('Error', 'No se pudo abrir el PDF: ' + e.message, { as_win: true, icon: '❌' });
    }
}

function _pdfGoTo(n) {
    const target = Math.max(1, Math.min(pdfTotalPages, n));
    if (target !== pdfCurrentPage) _pdfRenderPage(target);
}

function _pdfZoom(delta) {
    pdfScale = Math.max(0.25, Math.min(4, pdfScale + delta));
    _pdfRenderPage(pdfCurrentPage);
}

function _pdfZoomFit() {
    const wrap  = document.getElementById('pdfviewer-main');
    const wrapW = wrap.clientWidth - 40;
    if (!pdfDoc) return;
    pdfDoc.getPage(pdfCurrentPage).then(page => {
        const vp = page.getViewport({ scale: 1 });
        pdfScale = Math.min(wrapW / vp.width, 2);
        _pdfRenderPage(pdfCurrentPage);
    });
}

function _clearAnnotations() {
    _pdfAnnotations.innerHTML = '';
}

function _makeDraggable(el) {
    let ox = 0, oy = 0, mx = 0, my = 0;
    const header = el;
    header.onmousedown = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.isContentEditable) return;
        e.preventDefault();
        mx = e.clientX; my = e.clientY;
        ox = el.offsetLeft; oy = el.offsetTop;
        document.onmousemove = (ev) => {
            el.style.left = (ox + ev.clientX - mx) + 'px';
            el.style.top  = (oy + ev.clientY - my) + 'px';
        };
        document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup   = null;
        };
    };
}

function _addDeleteBtn(container) {
    const btn = document.createElement('button');
    btn.className = 'pdf-annotation-delete';
    btn.textContent = '×';
    btn.title = 'Eliminar';
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        container.remove();
    });
    container.appendChild(btn);
}

function _addTextAnnotation(x, y) {
    const wrap = document.createElement('div');
    wrap.className = 'pdf-annotation-text';
    wrap.style.left = x + 'px';
    wrap.style.top  = y + 'px';
    wrap.contentEditable = 'true';
    wrap.textContent = 'Nota…';

    _pdfAnnotations.appendChild(wrap);
    _makeDraggable(wrap);
    _addDeleteBtn(wrap);

    setTimeout(() => {
        wrap.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(wrap);
        sel.removeAllRanges();
        sel.addRange(range);
    }, 30);
}

function _addImageAnnotation(dataUrl, x, y) {
    const wrap = document.createElement('div');
    wrap.className = 'pdf-annotation-img';
    wrap.style.left   = x + 'px';
    wrap.style.top    = y + 'px';
    wrap.style.width  = '200px';
    wrap.style.height = '200px';

    const img = document.createElement('img');
    img.src = dataUrl;
    wrap.appendChild(img);

    _pdfAnnotations.appendChild(wrap);
    _makeDraggable(wrap);
    _addDeleteBtn(wrap);
}

function _pdfHandlePaste(e) {
    const win = document.getElementById('win_pdfviewer');
    if (!win || win.classList.contains('hidden')) return;
    if (!pdfDoc) return;

    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (!items) return;

    for (const item of items) {
        if (item.type.startsWith('image/')) {
            e.preventDefault();
            const blob   = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (ev) => {
                const wrap  = _pdfCanvasWrap;
                const rect  = wrap.getBoundingClientRect();
                const cx    = Math.max(0, (_pdfCanvas.width  / 2) - 100);
                const cy    = Math.max(0, (_pdfCanvas.height / 2) - 100);
                _addImageAnnotation(ev.target.result, cx, cy);
                _pdfSetStatus('Imagen pegada como anotación');
            };
            reader.readAsDataURL(blob);
            break;
        }
    }
}

function _pdfSave() {
    if (!pdfDoc) {
        showAlertBox('Advertencia', 'No hay ningún PDF abierto.', { as_win: true, icon: '⚠️' });
        return;
    }

    sysExecApp('files');

    (async () => {
        await waitUntil(() => typeof filesOpenSaveDialog === 'function');
        filesOpenSaveDialog();

        await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === true);
        await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === false);

        if (SysVar.pointerFilesSaveDialogSaveYN) {
            const filename = SysVar.pointerFilesSaveDialogFilename?.trim();
            if (!filename) {
                showAlertBox('Advertencia', 'Ingresa un nombre para el archivo!', { as_win: true, icon: '⚠️' });
                return;
            }

            const finalName = filename.toLowerCase().endsWith('.pdf') ? filename : filename + '.pdf';
            const dir       = window.fs.getCurrentDirectory();

            pdfDoc.getData().then(async (data) => {
                const blob = new Blob([data], { type: 'application/pdf' });
                try {
                    await window.saveImage(finalName, dir, blob);

                    const fs   = window.getFileSystem ? window.getFileSystem() : null;
                    if (!window.fs.fileExistInPath(finalName, dir)) {
                        window.fs.createFile(finalName, '[pdf]', dir);
                    }

                    pdfCurrentName = finalName;
                    document.getElementById('pdfviewer-title').textContent = `📕  ${finalName}`;
                    _pdfSetStatus(`Guardado: ${finalName}`);
                    console.log('[PDFViewer] Saved:', finalName);
                } catch (err) {
                    console.error('[PDFViewer] Save error:', err);
                    showAlertBox('Error', 'No se pudo guardar el PDF.', { as_win: true, icon: '❌' });
                }
            });
        }

        SysVar.pointerFilesSaveDialogSaveYN    = false;
        SysVar.pointerFilesSaveDialogFilename  = 'documento.pdf';
    })();
}

function _pdfOpenUrlPopup() {
    const popup = document.getElementById('pdfviewer-url-popup');
    popup.classList.remove('hidden');
    document.getElementById('pdfviewer-url-input').focus();
}

async function _pdfLoadFromUrl(url, name) {
    _pdfSetStatus('Descargando…');
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const buf  = await resp.arrayBuffer();
        pdfCurrentPath = null;
        await _pdfLoad(buf, name || url.split('/').pop() || 'documento.pdf');
    } catch (e) {
        _pdfSetStatus('Error al descargar');
        showAlertBox('Error', 'No se pudo descargar el PDF:\n' + e.message, { as_win: true, icon: '❌' });
    }
}

window.pdfViewerOpenFromFS = async function(filePath) {
    await _ensurePdfJs();
    return _openDB().then(db => new Promise((resolve, reject) => {
        const tx  = db.transaction('media', 'readonly');
        const req = tx.objectStore('media').get(filePath);
        req.onsuccess = async () => {
            if (!req.result) {
                showAlertBox('Error', `No se encontró el PDF en storage: ${filePath}`, { as_win: true, icon: '❌' });
                reject(new Error('not found'));
                return;
            }
            const buf = await req.result.arrayBuffer();
            pdfCurrentPath = filePath;
            const name = filePath.split('/').pop();
            await _pdfLoad(buf, name);
            resolve();
        };
        req.onerror = (e) => reject(e.target.error);
    }));
};

function _pdfSetStatus(msg) {
    if (_pdfStatusMsg) _pdfStatusMsg.textContent = msg;
}

function init_pdfviewer() {
    console.log('Initiating pdfviewer...');

    _pdfCanvas      = document.getElementById('pdfviewer-canvas');
    _pdfAnnotations = document.getElementById('pdfviewer-annotations');
    _pdfCanvasWrap  = document.getElementById('pdfviewer-canvas-wrap');
    _pdfEmpty       = document.getElementById('pdfviewer-empty');
    _pdfPageInput   = document.getElementById('pdfviewer-page-input');
    _pdfPageTotal   = document.getElementById('pdfviewer-page-total');
    _pdfZoomLabel   = document.getElementById('pdfviewer-zoom-label');
    _pdfStatusMsg   = document.getElementById('pdfviewer-status-msg');
    _pdfStatusSize  = document.getElementById('pdfviewer-status-size');

    document.getElementById('pdfviewer-btn-prev').addEventListener('click', () => _pdfGoTo(pdfCurrentPage - 1));
    document.getElementById('pdfviewer-btn-next').addEventListener('click', () => _pdfGoTo(pdfCurrentPage + 1));
    _pdfPageInput.addEventListener('change', () => _pdfGoTo(parseInt(_pdfPageInput.value) || 1));
    _pdfPageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') _pdfGoTo(parseInt(_pdfPageInput.value) || 1); });

    document.getElementById('pdfviewer-btn-zoomin' ).addEventListener('click', () => _pdfZoom(+0.15));
    document.getElementById('pdfviewer-btn-zoomout').addEventListener('click', () => _pdfZoom(-0.15));
    document.getElementById('pdfviewer-btn-zoomfit').addEventListener('click', () => _pdfZoomFit());

    document.getElementById('pdfviewer-btn-annotate').addEventListener('click', () => {
        if (!pdfDoc) return;
        const cx = Math.max(0, (_pdfCanvas.width  / 2) - 40);
        const cy = Math.max(0, (_pdfCanvas.height / 2) - 12);
        _addTextAnnotation(cx, cy);
        _pdfSetStatus('Nota añadida — arrástrala donde quieras');
    });

    document.getElementById('pdfviewer-btn-paste-hint').addEventListener('click', () => {
        showAlertBox('Info', 'Copia una imagen al portapapeles y presiona Ctrl+V para pegarla sobre el PDF.', { as_win: true });
    });

    document.getElementById('pdfviewer-btn-save').addEventListener('click', () => _pdfSave());

    document.getElementById('pdfviewer-btn-open').addEventListener('click', () => {
        sysExecApp('files');
    });

    document.getElementById('pdfviewer-btn-url').addEventListener('click', () => _pdfOpenUrlPopup());
    document.getElementById('pdfviewer-url-cancel').addEventListener('click', () => {
        document.getElementById('pdfviewer-url-popup').classList.add('hidden');
    });
    document.getElementById('pdfviewer-url-confirm').addEventListener('click', async () => {
        const url  = document.getElementById('pdfviewer-url-input').value.trim();
        const name = document.getElementById('pdfviewer-url-name').value.trim();
        if (!url) return;
        document.getElementById('pdfviewer-url-popup').classList.add('hidden');
        await _pdfLoadFromUrl(url, name);
    });
    document.getElementById('pdfviewer-url-input').addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') document.getElementById('pdfviewer-url-confirm').click();
    });

    document.getElementById('pdfviewer-main').addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            _pdfZoom(e.deltaY < 0 ? 0.1 : -0.1);
        }
    }, { passive: false });

    document.addEventListener('paste', _pdfHandlePaste);
}

function cleanup_pdfviewer() {
    console.log('Cleaning pdfviewer...');
    document.removeEventListener('paste', _pdfHandlePaste);
    pdfDoc         = null;
    pdfCurrentPage = 1;
    pdfTotalPages  = 0;
    pdfCurrentPath = null;
    pdfCurrentName = null;
    if (_pdfCanvasWrap)  _pdfCanvasWrap.classList.add('hidden');
    if (_pdfEmpty)       _pdfEmpty.classList.remove('hidden');
    if (_pdfAnnotations) _pdfAnnotations.innerHTML = '';
    const title = document.getElementById('pdfviewer-title');
    if (title) title.textContent = '📕  PDF Viewer';
}

window.scriptReady('pdfviewer');
// template version 3.1