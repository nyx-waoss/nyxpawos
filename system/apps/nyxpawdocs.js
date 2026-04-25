console.log('Current: apps/nyxpawdocs.js');
window.AppMetadata = window.AppMetadata || {};

window.AppMetadata.nyxpawdocs = {
    displayName: 'NyxPaw Docs',
    icon: '../../assets/apps/nyxpawdocs/2.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:

let npdocsQuill = null;

window.nyxpawdocsSetContent = function(jsonString) {
    if (!AppManager.loadedApps.has('nyxpawdocs')) {
        AppManager.loadApp('nyxpawdocs').then(() => {
            setTimeout(() => editorSetContent(jsonString), 70);
        });
        return;
    }
    editorSetContent(jsonString);
}

function getSelectedText() {
    const range = npdocsQuill.getSelection();
    if (!range || range.length === 0) return '';
    return npdocsQuill.getText(range.index, range.length);
}

function showAiTooltip() {
    const aitooltip = document.getElementById('nyxpawdocs_aitooltip');
    const range = npdocsQuill.getSelection();
    if (!range || range.length === 0) {
        aitooltip.style.display = 'none';
        return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const nativeRange = selection.getRangeAt(0);
    const rect = nativeRange.getBoundingClientRect();
    if (!rect || rect.width === 0) return;

    const nyxpawdocs_winEl = document.getElementById('win_nyxpawdocs');
    const nyxpawdocs_winRect = nyxpawdocs_winEl.getBoundingClientRect();

    aitooltip.style.display = 'block';
    const tooltipRect = aitooltip.getBoundingClientRect();

    let left = (rect.left - nyxpawdocs_winRect.left) + (rect.width / 2) - (tooltipRect.width / 2);
    let top  = (rect.top  - nyxpawdocs_winRect.top)  - tooltipRect.height - 8;

    left = Math.max(0, Math.min(left, nyxpawdocs_winRect.width - tooltipRect.width));
    if (top < 0) top = (rect.bottom - nyxpawdocs_winRect.top) + 8;

    aitooltip.style.left = left + 'px';
    aitooltip.style.top  = top  + 'px';
}


function nyxpawdocs_resume() {
    document.getElementById('nyxpawdocs_aianswer').textContent = 'Pensando...';
    document.getElementById('nyxpawdocs_aitooltip').style.display = 'none';
    document.getElementById('nyxpawdocs_airecivedinfo').style.display = 'block';
    document.getElementById('nyxpawdocs_airecivedinfo').style.left = document.getElementById('nyxpawdocs_aitooltip').style.left;
    document.getElementById('nyxpawdocs_airecivedinfo').style.top = document.getElementById('nyxpawdocs_aitooltip').style.top;

    const npdocs_userselection = getSelectedText();
    if (!npdocs_userselection) return;
    let npdocs_nkres;
    try {
        npdocs_nkres = sysNekiriAsk('Resume el texto', [], 'notebookai', {notebookai_bookcontent:npdocs_userselection});
    } catch (e) {
        console.error('Cannot get AI response:'+e);
        document.getElementById('nyxpawdocs_aianswer').textContent = 'Ocurrio un error, vuelve a intentarlo mas tarde.';
    }
    if ((npdocs_nkres.code).startsWith('2') && npdocs_nkres.code !== '202') {
        document.getElementById('nyxpawdocs_aianswer').textContent = npdocs_nkres.ans;
    } else if (npdocs_nkres.code === '403') {
        document.getElementById('nyxpawdocs_aianswer').textContent = 'Lo siento, parece que no tengo permiso para hacer eso :(';
    } else if (npdocs_nkres.code === '422') {
        document.getElementById('nyxpawdocs_aianswer').textContent = npdocs_nkres.ans;
    } else {
        document.getElementById('nyxpawdocs_aianswer').textContent = 'Lo siento, ha ocurrido un error: ' + npdocs_nkres.ans;
    }
    
}

function nyxpawdocs_rewrite() {
    document.getElementById('nyxpawdocs_aianswer').textContent = 'Pensando...';
    document.getElementById('nyxpawdocs_aitooltip').style.display = 'none';
    document.getElementById('nyxpawdocs_airecivedinfo').style.display = 'block';
    document.getElementById('nyxpawdocs_airecivedinfo').style.left = document.getElementById('nyxpawdocs_aitooltip').style.left;
    document.getElementById('nyxpawdocs_airecivedinfo').style.top = document.getElementById('nyxpawdocs_aitooltip').style.top;

    const npdocs_userselection = getSelectedText();
    if (!npdocs_userselection) return;
    let npdocs_nkres;
    try {
        npdocs_nkres = sysNekiriAsk('Reescribe el texto', [], 'notebookai', {notebookai_bookcontent:npdocs_userselection});
    } catch (e) {
        console.error('Cannot get AI response:'+e);
        document.getElementById('nyxpawdocs_aianswer').textContent = 'Ocurrio un error, vuelve a intentarlo mas tarde.';
    }
    if ((npdocs_nkres.code).startsWith('2') && npdocs_nkres.code !== '202') {
        document.getElementById('nyxpawdocs_aianswer').textContent = npdocs_nkres.ans;
    } else if (npdocs_nkres.code === '403') {
        document.getElementById('nyxpawdocs_aianswer').textContent = 'Lo siento, parece que no tengo permiso para hacer eso :(';
    } else if (npdocs_nkres.code === '422') {
        document.getElementById('nyxpawdocs_aianswer').textContent = npdocs_nkres.ans;
    } else {
        document.getElementById('nyxpawdocs_aianswer').textContent = 'Lo siento, ha ocurrido un error: ' + npdocs_nkres.ans;
    }
    
}

function nyxpawdocs_expand() {
    const npdocs_userselection = getSelectedText();
    if (!npdocs_userselection) return;

    const airecivedinfo = document.getElementById('nyxpawdocs_airecivedinfo');
    const aianswer = document.getElementById('nyxpawdocs_aianswer');

    document.getElementById('nyxpawdocs_aitooltip').style.display = 'none';
    airecivedinfo.style.display = 'block';
    airecivedinfo.style.left = document.getElementById('nyxpawdocs_aitooltip').style.left;
    airecivedinfo.style.top = document.getElementById('nyxpawdocs_aitooltip').style.top;
    aianswer.textContent = 'Buscando información...';

    nekiriExpandText(npdocs_userselection).then((result) => {
        if (result.ok) {
            aianswer.textContent = result.result;
        } else {
            const mensajesError = {
                'no_keywords':    'No encontré palabras clave suficientes para buscar :c',
                'fetch_error':    'No pude conectarme a internet para buscar :c',
                'no_results':     'No encontré información sobre ese tema :c',
                'empty_extract':  'Encontré algo pero estaba vacío :c',
                'no_sentences':   'No pude extraer información útil :c',
                'no_good_sentence': 'La información encontrada no fue suficiente :c',
            };
            aianswer.textContent = mensajesError[result.reason] || 'No pude expandir el texto :c';
        }
    });
}
function editorGetContent() {
    return JSON.stringify(npdocsQuill.getContents());
}

function editorSetContent(jsonString) {
    if (!jsonString) return;
    npdocsQuill.setContents(JSON.parse(jsonString));
}

async function nyxpawdocs_newdoc() {
    const confirmNewNPDocument = await showMsgBox("Advertencia!","Quieres borrar tu documento actual? Asegurate de guardarlo antes.", "Nuevo", "Cancelar",{as_win:false,icon:'⚠️'});
    if (confirmNewNPDocument) {
        npdocsQuill.setContents([]);
    }
}

function nyxpawdocs_savedoc() {
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

            const finalFilename = filename.includes('.qdoc') ? filename : filename + '.qdoc';
            const content = editorGetContent();
            let success = false;
            if (window.fs.fileExistInPath(finalFilename, window.fs.getCurrentDirectory())) {
                success = window.fs.modifyFile(finalFilename, content);
            } else {
                success = window.fs.createFile(finalFilename, content);
            }
                    

            if (success) {
                console.log(`Document saved as: ${finalFilename}`);
                        
            } else {
                console.error('Cannot save document');
                showAlertBox('❌ Error', 'Error al guardar el documento: Ya existe un archivo con el mismo nombre o no se pudo generar');
            }
                    
            SysVar.pointerFilesSaveDialogFilename = 'documento.qdoc';
        }
        
        SysVar.pointerFilesSaveDialogSaveYN = false;
    })();
}



//Codigo arriba ⬆️⬆️

function init_nyxpawdocs() {
    npdocsQuill = new Quill('#nyxpawdocs-editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ header: [1, 2, 3, false] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
    npdocsQuill.on('selection-change', function(range, oldRange, source) {
        console.log('selection-change', range);
        if (range && range.length > 0) {
            showAiTooltip();
        } else {
            document.getElementById('nyxpawdocs_aitooltip').style.display = 'none';
        }
    });
    document.getElementById('nyxpawdocs_aitooltip').style.display = 'none';
    document.getElementById('nyxpawdocs_airecivedinfo').style.display = 'none';
    document.getElementById('nyxpawdocs_aianswer').textContent = 'Pensando...';
}

function cleanup_nyxpawdocs() {
    console.log('Cleaning nyxpawdocs...');
    npdocsQuill = null;
    document.getElementById('nyxpawdocs-editor').innerHTML = '';
    document.getElementById('nyxpawdocs_aitooltip').style.display = 'none';
    document.getElementById('nyxpawdocs_airecivedinfo').style.display = 'none';
    document.getElementById('nyxpawdocs_aianswer').textContent = 'Pensando...';
}

window.scriptReady('nyxpawdocs');
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