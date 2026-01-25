console.log("Current: apps/notes.js");

const notesTextarea = document.querySelector('#win_notes textarea');
const notesSaveBtn = document.querySelector('#win_notes .program_topbar button:nth-child(1)');
const notesNewBtn = document.querySelector('#win_notes .program_topbar button:nth-child(2)');
const notesOpenBtn = document.querySelector('#win_notes .program_topbar button:nth-child(3)');

const saveNoteWindow = document.getElementById('win_savenote');
const saveNoteInput = document.getElementById('notes-savefilename');
const saveNoteBtnConfirm = document.getElementById('notes-btn_save');
const saveNoteBtnCancel = document.getElementById('notes-btn_cancel');
const saveNoteClose = document.getElementById('btn_savenote');

notesSaveBtn.addEventListener('click', () => {
    saveNoteWindow.style.width = '400px';
    saveNoteWindow.style.height = '210px';
    saveNoteWindow.classList.remove('hidden');
    saveNoteWindow.style.zIndex = ++topZ;
    saveNoteInput.value = '';
    saveNoteInput.focus();
});

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
        saveNoteWindow.classList.add('hidden');
    } else {
        showAlertBox('❌ Error','Error al guardar la nota: Ya existe un archivo con el mismo nombre o no se pudo generar');
    }
});

saveNoteBtnCancel.addEventListener('click', () => {
    saveNoteWindow.classList.add('hidden');
});

saveNoteClose.addEventListener('click', () => {
    saveNoteWindow.classList.add('hidden');
});

// Presionar Enter en el input para guardar rapido jsjsj
saveNoteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveNoteBtnConfirm.click();
    }
});

notesNewBtn.addEventListener('click', () => {
    notesTextarea.value = '';
});

/*notesOpenBtn.addEventListener('click', () => {
    //accion del boton de abrir ya abre files, no hay necesidad de esta funcion xD
});*/

function cleanup_notes() {
    console.log('Cleaning notes...');
    
    notesTextarea.value = '';
}

window.scriptReady('notes');