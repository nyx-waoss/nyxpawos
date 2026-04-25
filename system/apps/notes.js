console.log("Current: apps/notes.js");
window.AppMetadata = window.AppMetadata || {};

window.AppMetadata.notes = {
    displayName: 'Notas',
    icon: '../../assets/apps/notes/2.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

let notesTextarea = null;
let notesSaveBtn = null;
let notesNewBtn = null;
let notesOpenBtn = null;

/*const saveNoteWindow = document.getElementById('win_savenote');
const saveNoteInput = document.getElementById('notes-savefilename');
const saveNoteBtnConfirm = document.getElementById('notes-btn_save');
const saveNoteBtnCancel = document.getElementById('notes-btn_cancel');
const saveNoteClose = document.getElementById('btn_savenote');*/



/*
saveNoteBtnConfirm.addEventListener('click', () => {
    const filename = saveNoteInput.value.trim();
    
    if (!filename) {
        showAlertBox('⚠️ Advertencia!','Ingresa un nombre para el archivo!');
        return;
    }
    
    const finalFilename = filename.includes('.') ? filename : filename + '.txt';
    const content = notesTextarea.value;
    const success = window.fs.createFile(finalFilename, content);
    
    if (success) {
        console.log(`Nota saved as: ${finalFilename}`);
        saveNoteWindow.classList.remove('window_anim_open');
        setTimeout(() => {
            saveNoteWindow.classList.add('hidden');
            saveNoteWindow.style.removeProperty('opacity');
        }, 200);
    } else {
        showAlertBox('❌ Error','Error al guardar la nota: Ya existe un archivo con el mismo nombre o no se pudo generar');
    }
});

saveNoteBtnCancel.addEventListener('click', () => {
    saveNoteWindow.classList.remove('window_anim_open');
    setTimeout(() => {
        saveNoteWindow.classList.add('hidden');
        saveNoteWindow.style.removeProperty('opacity');
    }, 200);
});

saveNoteClose.addEventListener('click', () => {
    saveNoteWindow.classList.remove('window_anim_open');
    setTimeout(() => {
        saveNoteWindow.classList.add('hidden');
        saveNoteWindow.style.removeProperty('opacity');
    }, 200);
});

// Presionar Enter en el input para guardar rapido jsjsj
saveNoteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveNoteBtnConfirm.click();
    }
});*/



window.notesSetTXArea = function(content) {
    if (!AppManager.loadedApps.has('notes')) {
        AppManager.loadApp('notes').then(() => {
            setTimeout(() => {
                notesTextarea.value = content;
            }, 70);
        });
        return;
    }

    notesTextarea.value = content;
}

function init_notes() {
    notesTextarea = document.querySelector('#win_notes textarea');
    notesSaveBtn = document.querySelector('#win_notes .program_topbar button:nth-child(1)');
    notesNewBtn = document.querySelector('#win_notes .program_topbar button:nth-child(2)');
    notesOpenBtn = document.querySelector('#win_notes .program_topbar button:nth-child(3)');

    notesSaveBtn.addEventListener('click', () => {
        /*
        El codigo siguiente ya no se ocupa, pero amo dejar codigo viejo asi que aqui esta:
        saveNoteWindow.style.width = '400px';
        saveNoteWindow.style.height = '210px';
        saveNoteWindow.style.removeProperty('opacity');
        saveNoteWindow.classList.remove('hidden');
        setTimeout(() => {
            saveNoteWindow.classList.add('window_anim_open');
        }, 10);
        saveNoteWindow.style.zIndex = ++topZ;
        saveNoteInput.value = '';
        saveNoteInput.focus();
        */
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

                    const finalFilename = filename.includes('.') ? filename : filename + '.txt';
                    const content = notesTextarea.value;
                    let success = false;
                    if (window.fs.fileExistInPath(finalFilename, window.fs.getCurrentDirectory())) {
                         success = window.fs.modifyFile(finalFilename, content);
                    } else {
                         success = window.fs.createFile(finalFilename, content);
                    }
                    

                    if (success) {
                        console.log(`Note saved as: ${finalFilename}`);
                        
                    } else {
                        console.error('Cannot save note');
                        showAlertBox('❌ Error', 'Error al guardar la nota: Ya existe un archivo con el mismo nombre o no se pudo generar');
                    }
                    
                    SysVar.pointerFilesSaveDialogFilename = 'mi-nota.txt';
                }
                
                SysVar.pointerFilesSaveDialogSaveYN = false;
            })();
    });

    notesNewBtn.addEventListener('click', () => {
        notesTextarea.value = '';
    });

    notesOpenBtn.addEventListener('click', () => {
        sysExecApp('files');
    });
}

function cleanup_notes() {
    console.log('Cleaning notes...');
    
    notesTextarea.value = '';
}

window.scriptReady('notes');