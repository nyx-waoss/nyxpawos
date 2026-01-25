console.log("Current: apps/files.js");

const winAskfile = document.getElementById("win_askforfilecreation");
const closeAskfile = document.getElementById("btn_askforfilecreation");
const newFileTypeObj = document.getElementById("files-newfiletype");
const getNFValue = newFileTypeObj.value;
const filesBtnOk = document.getElementById('files-btn_newfile');
const filesBtnCancel = document.getElementById('files-btn_cancel');
const newFileNameInput = document.getElementById('files-newfilename');

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

        winAskfile.classList.remove("hidden");
        winAskfile.style.zIndex = ++topZ;
        newFileNameInput.focus();

        const handleOk = () => {
            const fileName = newFileNameInput.value.trim();
            const fileType = newFileTypeObj.value;

            if (!fileName) {
                showAlertBox("⚠️ Advertencia!","Ingresa un nombre para el archivo!")
                return;
            }

            winAskfile.classList.add("hidden");

            filesBtnOk.removeEventListener('click', handleOk);
            filesBtnCancel.removeEventListener('click', handleCancel);

            resolve({confirmed: true, type: fileType, name: fileName});
        }

        const handleCancel = () => {
            winAskfile.classList.add("hidden");

            filesBtnOk.removeEventListener('click', handleOk);
            filesBtnCancel.removeEventListener('click', handleCancel);

            resolve({confirmed: false, type: null, name:null});
        };

        filesBtnOk.addEventListener('click', handleOk);
        filesBtnCancel.addEventListener('click', handleCancel);
    });
}

function files_delobj() {
    const selectedItemDel = window.fs.getSelectedItem();
    if (selectedItemDel) {
        window.fs.deleteItem(selectedItemDel);
    }
}

function files_modobj() {
    //preguntar nombre
}

closeAskfile.addEventListener("click", () => {
    winAskfile.classList.add("hidden");
});

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

window.scriptReady('files');