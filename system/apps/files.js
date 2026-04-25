console.log("Current: apps/files.js");
window.AppMetadata = window.AppMetadata || {};

window.AppMetadata.files = {
    displayName: 'Archivos',
    icon: '../../assets/apps/files/2.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

window.SysVar = window.SysVar || {};

let topDirInput = null;
let winAskfile = null;
let closeAskfile = null;
let newFileTypeObj = null;
let getNFValue = null;
let filesBtnOk = null;
let filesBtnCancel = null;
let newFileNameInput = null;
let saveFileBar = null;

function files_goup() {
    window.fs.changeDirectory("..");
}

function files_reload() {
    window.fs.updateFileList();
}



function files_newobj() {
    return new Promise((resolve) => {

        newFileNameInput.value = '';

        winAskfile.style.width = '400px';
        winAskfile.style.height = '240px'; 

        winAskfile.style.removeProperty('opacity');
        winAskfile.classList.remove('hidden');
        setTimeout(() => {
            winAskfile.classList.add('window_anim_open');
        }, 10);

        winAskfile.style.zIndex = ++topZ;
        newFileNameInput.focus();

        const handleOk = () => {
            const fileName = newFileNameInput.value.trim();
            const fileType = newFileTypeObj.value;

            if (!fileName) {
                showAlertBox("⚠️ Advertencia!","Ingresa un nombre para el archivo!")
                return;
            }

            winAskfile.classList.remove('window_anim_open');
            setTimeout(() => {
                winAskfile.classList.add('hidden');
                winAskfile.style.removeProperty('opacity');
            }, 200);

            filesBtnOk.removeEventListener('click', handleOk);
            filesBtnCancel.removeEventListener('click', handleCancel);

            resolve({confirmed: true, type: fileType, name: fileName});
        }

        const handleCancel = () => {
            winAskfile.classList.remove('window_anim_open');
            setTimeout(() => {
                winAskfile.classList.add('hidden');
                winAskfile.style.removeProperty('opacity');
            }, 200);

            filesBtnOk.removeEventListener('click', handleOk);
            filesBtnCancel.removeEventListener('click', handleCancel);

            resolve({confirmed: false, type: null, name:null});
        };

        filesBtnOk.addEventListener('click', handleOk);
        filesBtnCancel.addEventListener('click', handleCancel);
    });
}

async function files_delobj() {
    const selectedItemDel = window.fs.getSelectedItem();
    const selectedTypeDel = window.fs.getSelectedItemType();

    const currentDirTCPDel = getCurrentDirectory();
    if (currentDirTCPDel === null || currentDirTCPDel === undefined) {
        console.error('Cannot get current directory: '+currentDirTCPDel);
        showAlertBox('Error', `No se pudo obtener el directorio actual.`, {as_win:true, icon:'❌'});
        return;
    }
    if (currentDirTCPDel === '/system/trash') {
        const delFile = await showMsgBox("msgbox_info_icon",`Eliminar "${selectedItemDel}" permanentemente?\nEsta accion no se puede deshacer.`,'Eliminar', 'Cancelar');
        if (delFile) {
            window.fs.deleteItem(selectedItemDel);
        }
    } else {
        if (selectedItemDel) {
            const currentDirWFTDel = getCurrentDirectory();
            if (currentDirWFTDel === null || currentDirWFTDel === undefined) {
                console.error('Cannot get current directory: '+currentDirWFTDel);
                showAlertBox('Error', `No se pudo obtener el directorio actual.`, {as_win:true, icon:'❌'});
                return;
            }
            try {
                window.fs.moveItem(selectedItemDel, currentDirWFTDel, '/system/trash');
            } catch (error) {
                console.error('Cannot move to trash: '+error);
                const moveFileToTrash = await showMsgBox("msgbox_info_icon",`No se pudo mover "${selectedItemDel}" a la papelera.\nDesea eliminarlo permanentemente?`,'Eliminar', 'Cancelar');
                if (moveFileToTrash) {
                    window.fs.deleteItem(selectedItemDel);
                }
            }
        }
    }
}

async function files_modobj() {
    const selectedItemDel = window.fs.getSelectedItem();
    const newFileName = await showPromptMsgBox('Nuevo nombre', 'Ingresa el nuevo nombre', 'Renombrar', 'Cancelar',{as_win:true,icon:'⚠️'});
    if (!newFileName.confirmed) return;
    if (!newFileName.value) {
        showAlertBox('msgbox_err','Ingresa un nombre',{as_win:true,icon:'⚠️'});
        return;
    }
    if (/\.[a-zA-Z0-9]+$/.test(newFileName.value)) {
        const confirmModExtns = await showMsgBox("msgbox_warning",`Se cambiara la extencion original del archivo (${getFileExtension(selectedItemDel)}) por ${getFileExtension(newFileName.value)} . Continuar?`, "Renombrar", "Cancelar",{as_win:false,icon:'⚠️'});
        if (confirmModExtns) {
            window.fs.renameItem(selectedItemDel, newFileName.value);
        }
        return;
    }
    window.fs.renameItem(selectedItemDel, `${newFileName.value}${getFileExtension(selectedItemDel)}`);
}

function getFileExtension(filename) {
    const i = filename.lastIndexOf('.');
    return i !== -1 ? filename.slice(i) : '';
}

async function filesCreateNewFileType() {
    try {
        const waitresult = await files_newobj()
        if (waitresult.confirmed) {
            /*const fileName = prompt("Nombre archivo");

            if (!fileName) return;*/

            if (waitresult.type === "dir") {
                //se crea folder
                window.fs.createFolder(waitresult.name);
            } else if (waitresult.type === "txt") {
                //y aca un archivo
                window.fs.createFile(waitresult.name + ".txt", "");
            }
        } else {
            console.log("cancel");
        }
    } catch (error) {
        console.error('Failed to create file: ', error);
        showAlertBox('❌ Error', 'No se pudo crear el archivo');
    }
}


function files_cancelsave() {
    SysVar.pointerFilesSaveDialogSaveYN = false;
    SysVar.pointerFilesSaveDialogOpen = false;
    AppManager.unloadApp('files');
}

function files_execsave() {
    const filename = document.getElementById('files_savefilebar_filename').value;
    console.log('Saving with filename:', filename);
    SysVar.pointerFilesSaveDialogFilename = filename;
    SysVar.pointerFilesSaveDialogSaveYN = true;
    SysVar.pointerFilesSaveDialogOpen = false;
    AppManager.unloadApp('files');
}

function _filesOpenSaveDialogInternal() {
    saveFileBar.classList.remove('hidden');
    SysVar.pointerFilesSaveDialogOpen = true;
    document.getElementById('files_savefilebar_filename').value = SysVar.pointerFilesSaveDialogFilename;
}

window.filesOpenSaveDialog = function() {
    if (!AppManager.loadedApps.has('files')) {
        AppManager.loadApp('files').then(() => {
            setTimeout(() => {
                _filesOpenSaveDialogInternal();
            }, 70);
        });
        return;
    }

    _filesOpenSaveDialogInternal();
};

function init_files() {
    console.log('Initiating files...');
    window.fs.setDirectory('/system/styledui/fileshome');

    topDirInput = document.getElementById('files_toolbar_dirinput');
    winAskfile = document.getElementById("win_askforfilecreation");
    closeAskfile = document.getElementById("btn_askforfilecreation");
    newFileTypeObj = document.getElementById("files-newfiletype");
    getNFValue = newFileTypeObj.value;
    filesBtnOk = document.getElementById('files-btn_newfile');
    filesBtnCancel = document.getElementById('files-btn_cancel');
    newFileNameInput = document.getElementById('files-newfilename');
    saveFileBar = document.getElementById('savefilebar');

    topDirInput.addEventListener('change', () => {
        window.fs.setDirectory(topDirInput.value);
    });

    closeAskfile.addEventListener("click", () => {
        winAskfile.classList.remove('window_anim_open');
        setTimeout(() => {
            winAskfile.classList.add('hidden');
            winAskfile.style.removeProperty('opacity');
        }, 200);
    });

    topDirInput.value = getCurrentDirectory();
    saveFileBar.classList.add('hidden');
    SysVar.pointerFilesSaveDialogOpen = false;
    SysVar.pointerFilesSaveDialogFilename = 'file';

    setupFileSelection();
    setupContextMenu();
    setupContextMenuActions();
}

function cleanup_files() {
    console.log('Cleaning files...');
    topDirInput.value = '';
    saveFileBar.classList.add('hidden');
    SysVar.pointerFilesSaveDialogOpen = false;
}

window.scriptReady('files');