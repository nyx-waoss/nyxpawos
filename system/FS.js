console.log("Current: FS.js");
//file system start --------------------------------------------------------------------------------
let currentDirectory = '/';
let selectedItem = null;
let selectedItemType = null;
//const openNotesModTextarea = document.querySelector('#win_notes textarea');
window.SysVar = window.SysVar || {};

function initFileSystem() {
    try {
        if (!localStorage.getItem('fileSystem')) {
            const initialSystem = {
                '/': {
                    type: 'folder',
                    children: []
                }
            };
            localStorage.setItem('fileSystem', JSON.stringify(initialSystem));
        }

        const savefileTest = JSON.parse(localStorage.getItem('fileSystem'));
        if (!savefileTest ||  !savefileTest['/']) {
            throw new Error('File system initialization failed!');
        }
    } catch (e) {
        sysBsod('X-FSI-FTI','Failed to initialize file system: ' + e.message);
    }
}

function getFileSystem() {
    return JSON.parse(localStorage.getItem('fileSystem'));
}

function saveFileSystem(fs) {
    localStorage.setItem('fileSystem', JSON.stringify(fs));
}

function normalizePath(path) {
    if (path === '/') return '/';
    return path.endsWith('/') ? path.slice(0, -1) : path
}

function createFolder(name, path = currentDirectory) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (fs[fullPath]) {
        console.error('La carpeta ya existe');
        return false;
    }

    fs[fullPath] = {
        type: 'folder',
        children: []
    };

    if (!fs[normalizedPath].children.includes(name)) {
        fs[normalizedPath].children.push(name);
    }

    saveFileSystem(fs);
    updateFileList();
    return true;
}

function createFile(name, content = '', path = currentDirectory) {
    if (window.fs.fileExistInPath(name, path)) {
        window.fs.modifyFile(name, content, path);
        return true;
    }
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (fs[fullPath]) {
        console.error('El archivo ya existe');
        return false;
    }

    fs[fullPath] = {
        type: 'file',
        content: content
    };

    if (!fs[normalizedPath].children.includes(name)) {
        fs[normalizedPath].children.push(name);
    }

    saveFileSystem(fs);
    updateFileList();
    return true;
}

function deleteItem(name, path = currentDirectory) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (!fs[fullPath]) {
        console.error('El item no existe');
        return false;
    }

    if (fs[fullPath].type === 'folder') {
        deleteRecursive(fullPath, fs);
    }

    delete fs[fullPath];

    const parentChildren = fs[normalizedPath].children;
    const index = parentChildren.indexOf(name);
    if (index > -1) {
        parentChildren.splice(index, 1);
    }

    saveFileSystem(fs);
    updateFileList();
    return true;
}

function deleteRecursive(path, fs) {
    const item = fs[path];
    if (item.type === 'folder' && item.children) {
        item.children.forEach(childName => {
            const childPath = `${path}/${childName}`;
            deleteRecursive(childPath, fs);
            delete fs[childPath];
        });
    }
}

function openFile(name, path = currentDirectory) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (!fs[fullPath]) {
        console.error('El item no existe');
        return null;
    }
    if (fs[fullPath].type !== 'file') {
        console.error("No es un archivo");
        return null;
    }

    return fs[fullPath].content;
}

function modifyFile(name, newContent, path = currentDirectory) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (!fs[fullPath]) {
        console.error('El item no existe');
        return false;
    }
    if (fs[fullPath].type !== 'file') {
        console.error("No es un archivo");
        return false;
    }

    fs[fullPath].content = newContent;
    saveFileSystem(fs);
    return true;
}

function changeDirectory(name) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(currentDirectory);

    if (name === '..') {
        if (currentDirectory === '/') return;
        const parts = normalizedPath.split('/');
        parts.pop();
        currentDirectory = parts.length === 1 ? '/' : parts.join('/');
        updateFileList();
        return;
    }

    const newPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (!fs[newPath]) {
        console.error('La carpeta no existe');
        return;
    }
    if (fs[newPath].type !== 'folder') {
        console.error("No es una carpeta");
        return;
    }

    currentDirectory = newPath;
    updateFileList();
}

function setDirectory(name) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(name);

    if (!fs[normalizedPath]) {
        console.error('Directory not found: '+normalizedPath);
        showAlertBox('Error', `Dir ${normalizedPath} not found!`, {as_win:true, icon:'❌'});
        return;
    }

    if (fs[normalizedPath].type !== 'folder') {
        console.error('Not a directory: '+normalizedPath);
        showAlertBox('Error', `${normalizedPath} is not a folder!`, {as_win:true, icon:'❌'});
        return;
    }

    currentDirectory = normalizedPath;
    updateFileList();
}

function getQuickAccessRoute(item) {
    if (item._dynamicRoute) {
        return `/home/${SysVar.currentuser.user}/${item._dynamicRoute}`;
    }
    return item.route;
}

function createCustomElement(newObject) {
    if (newObject === 'files-homegrid') {
        const quickAccessArr = SysVar.filesQuickAccess;

        if (!quickAccessArr || quickAccessArr.length === 0) {
            console.error('SysVar.filesQuickAccess is not valid!');
            showAlertBox('Error', `Ha ocurrido un error! Revisa Event Viewer para mas informacion.`, {as_win:true, icon:'❌'});
            return;
        }

        const filesHomegrid = document.createElement('div');
        filesHomegrid.id = 'files-homegrid';

        for (const QAitem of quickAccessArr) {
            const filesHomegridBtn = document.createElement('div');
            filesHomegridBtn.className = 'files-homegrid-btn';

            const filesHomegridBtnIco = document.createElement('div');
            filesHomegridBtnIco.className = 'files-homegrid-btn-ico';
            filesHomegridBtnIco.textContent = QAitem.emoji;

            const filesHomegridBtnTxt = document.createElement('div');
            filesHomegridBtnTxt.className = 'files-homegrid-btn-txt';
            filesHomegridBtnTxt.textContent = QAitem.text;

            filesHomegridBtn.addEventListener('dblclick', (e) => {
                e.preventDefault();
                const resolvedRoute = getQuickAccessRoute(QAitem);
                if (QAitem.eltype === 'folder') {
                    setDirectory(resolvedRoute);
                } else if (QAitem.eltype === 'file') {
                    setDirectory(resolvedRoute);
                    const fileContToOpen = openFile(QAitem.text, resolvedRoute);
                    if (fileContToOpen) {
                        sysExecApp('notes');
                        setTimeout(() => notesSetTXArea(fileContToOpen), 90);
                    } else {
                        console.error('fileContToOpen is not valid:',fileContToOpen);
                        showAlertBox('Error', `Ha ocurrido un error! Revisa Event Viewer para mas informacion.`, {as_win:true, icon:'❌'});
                    }
                }
            });

            filesHomegridBtn.appendChild(filesHomegridBtnIco);
            filesHomegridBtn.appendChild(filesHomegridBtnTxt);

            filesHomegrid.appendChild(filesHomegridBtn);
        }

        document.getElementById('file-list').appendChild(filesHomegrid);
    }
}

function updateFileList() {
    const fs = getFileSystem();
    const fileListDiv = document.getElementById('file-list');
    if (!fileListDiv) return;
    fileListDiv.innerHTML = '';

    const normalizedPath = normalizePath(currentDirectory);
    const currentDir = fs[normalizedPath];

    document.getElementById('files_toolbar_dirinput').value = currentDirectory;

    if (!currentDir) {
        fileListDiv.innerHTML = '<p>Directorio no encontrado</p>';
        return;
    }

    if (currentDirectory === '/system/styledui/fileshome') {
        createCustomElement('files-homegrid');
        return;
    }

    /*const pathDisplay = document.createElement('div');
    pathDisplay.textContent = `Directorio actual: ${currentDirectory}`;
    pathDisplay.style.marginBottom = '10px';
    pathDisplay.style.fontWeight = 'bold';
    fileListDiv.appendChild(pathDisplay);

    if (currentDirectory !== '/') {
        const upButton = document.createElement('button');
        upButton.textContent = '.. (Subir)';
        upButton.classList.add('file-btn-up');
        upButton.style.display = 'block';
        upButton.style.marginBottom = '5px';
        upButton.addEventListener('dblclick', () => changeDirectory('..'));
        fileListDiv.appendChild(upButton);
    }*/
    if (currentDir.children && currentDir.children.length > 0) {
        currentDir.children.forEach(itemName => {
            const itemPath = normalizedPath === '/' ? `/${itemName}` : `${normalizedPath}/${itemName}`;
            const item = fs[itemPath];

            const button = document.createElement('button');
            if (item.type === 'folder') {
                button.textContent = `📁 ${itemName}`;
            } else {
                const icon = getFileIcon(itemName);
                button.textContent = `${icon} ${itemName}`;
            }

            button.dataset.itemName = itemName;
            button.dataset.itemType = item.type;
            button.dataset.itemPath = itemPath;

            if (item.type === 'folder') {
                button.classList.add('file-btn', 'file-btn-folder'); //clase carpetas
            } else {
                button.classList.add('file-btn', 'file-btn-file'); //clase archivos
            }

            button.style.display = 'block';
            button.style.marginBottom = '5px';

            if (item.type === 'folder') {
                button.addEventListener('dblclick', () => changeDirectory(itemName));
            } else {
                button.addEventListener('dblclick', () => {
                    const content = openFile(itemName);
                    console.log(`Get content of ${itemName}...`);
                    sysExecApp('notes');
                    setTimeout(() => notesSetTXArea(content), 90);
                });
            }
            fileListDiv.appendChild(button);
        });
    } else {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'Directorio Vacio';
        fileListDiv.appendChild(emptyMsg);
    }
}

function setupContextMenu() {
    const fileListDiv = document.getElementById('file-list');
    if (!fileListDiv) return;
    const contextMenu = document.getElementById("filesaltmenu");

    fileListDiv.addEventListener("contextmenu", (e) => {
        const clickedBtn = e.target.closest('.file-btn, .file-btn-folder, .file-btn-file');
        if (clickedBtn) {
            e.preventDefault();

            const itemName = clickedBtn.dataset.itemName;
            const itemType = clickedBtn.dataset.itemType;
            const itemPath = clickedBtn.dataset.itemPath;

            document.querySelectorAll('.file-btn, .file-btn-folder, .file-btn-file').forEach(btn => {
                btn.classList.remove('selected');
            });

            clickedBtn.classList.add('selected');
            selectedItem = itemName;

            contextMenu.dataset.targetItem = itemName;
            contextMenu.dataset.targetType = itemType;
            contextMenu.dataset.targetPath = itemPath;
            
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top  = e.pageY + 'px';

            contextMenu.style.zIndex = topZ + 2;

            contextMenu.classList.remove("hidden");
        }
    });

    document.addEventListener("click", () => {
        contextMenu.classList.add('hidden');
    });

    contextMenu.addEventListener("click", (e) => {
        e.stopPropagation();
    });
}

function setupContextMenuActions() {
    const contextMenu = document.getElementById('filesaltmenu');
    
    const deleteBtn = document.getElementById('ctx-delete');
    deleteBtn.addEventListener('click', async () => {
        const itemName = contextMenu.dataset.targetItem;
        const itemType = contextMenu.dataset.targetType;

        const currentDirTCPDel = getCurrentDirectory();
        if (currentDirTCPDel === null || currentDirTCPDel === undefined) {
            console.error('Cannot get current directory: '+currentDirTCPDel);
            showAlertBox('Error', `No se pudo obtener el directorio actual.`, {as_win:true, icon:'❌'});
            contextMenu.classList.add('hidden');
            return;
        }
        if (currentDirTCPDel === '/system/trash') {
            const delFile = await showMsgBox("ℹ️ Informacion",`Eliminar "${itemName}" permanentemente?\nEsta accion no se puede deshacer.`,'Eliminar', 'Cancelar');
            if (delFile) {
                window.fs.deleteItem(itemName);
                contextMenu.classList.add('hidden');
            }
        } else {
            const delFile = await showMsgBox("ℹ️ Informacion",`Eliminar "${itemName}"?`,'Eliminar', 'Cancelar');
            if (delFile) {
                if (itemType === 'folder') {
                    window.fs.deleteItem(itemName);
                } else {
                    const currentDirWFTDel = getCurrentDirectory();
                    if (currentDirWFTDel === null || currentDirWFTDel === undefined) {
                        console.error('Cannot get current directory: '+currentDirWFTDel);
                        showAlertBox('Error', `No se pudo obtener el directorio actual.`, {as_win:true, icon:'❌'});
                        contextMenu.classList.add('hidden');
                        return;
                    }
                    try {
                        window.fs.moveItem(itemName, currentDirWFTDel, '/system/trash');
                    } catch (error) {
                        console.error('Cannot move to trash: '+error);
                        const moveFileToTrash = await showMsgBox("ℹ️ Informacion",`No se pudo mover "${itemName}" a la papelera.\nDesea eliminarlo permanentemente?`,'Eliminar', 'Cancelar');
                        if (moveFileToTrash) {
                            window.fs.deleteItem(itemName);
                        }
                    }
                }
                contextMenu.classList.add('hidden');
            }
        }
    });
    
    //Abrir archivo
    const openBtn = document.getElementById('ctx-open');
    openBtn.addEventListener('click', () => {
        const itemName = contextMenu.dataset.targetItem;
        const itemType = contextMenu.dataset.targetType;
        
        if (itemType === 'file') {
            const content = window.fs.openFile(itemName);
            console.log('Content:', content);
            console.log(`Get content of ${itemName}...`);
            sysExecApp('notes');
            setTimeout(() => notesSetTXArea(content), 90);
        } else {
            window.fs.changeDirectory(itemName);
        }
        contextMenu.classList.add('hidden');
    });

    const addhomeBtn = document.getElementById('ctx-addhome');
    addhomeBtn.addEventListener('click', () => {
        const itemName = contextMenu.dataset.targetItem;
        const itemType = contextMenu.dataset.targetType;
        
        if (itemType === 'file') {
            SysVar.filesQuickAccess.push({
                emoji:'📄',
                text: itemName,
                route: currentDirectory,
                eltype: 'file'
            });
        } else {
            SysVar.filesQuickAccess.push({
                emoji:'🗂️',
                text: itemName,
                route: `${currentDirectory}/${itemName}`,
                eltype: 'folder'
            });
        }
        contextMenu.classList.add('hidden');
    });
}

function setupFileSelection() {
    const fileListDiv = document.getElementById('file-list');
    if (!fileListDiv) return;

    fileListDiv.addEventListener('click', (e) => {
        const clickedBtn = e.target.closest('.file-btn, .file-btn-folder, .file-btn-file');

        if (clickedBtn) {
            document.querySelectorAll('.file-btn, .file-btn-folder, .file-btn-file').forEach(btn => {
                btn.classList.remove('selected');
            });
            clickedBtn.classList.add('selected');

            const itemText = clickedBtn.textContent;
            selectedItem = itemText
            .replace('📁 ', '')
            .replace('📄 ', '')
            .replace('📦 ', '')
            .replace('⚙️ ', '')
            .replace('🧱 ', '')
            .replace('📱 ', '')
            .replace('⚡ ', '')
            .trim();
            
            if (SysVar.pointerFilesSaveDialogOpen) {
                document.getElementById('files_savefilebar_filename').value = selectedItem; 
            }

            if (clickedBtn.classList.contains('file-btn-folder')) {
                selectedItemType = 'folder';
            } else if (clickedBtn.classList.contains('file-btn-file')) {
                selectedItemType = 'file';
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.file-btn, .file-btn-folder, .file-btn-file') &&
            !e.target.closest('#file-list')) {
            document.querySelectorAll('.file-btn, .file-btn-folder, .file-btn-file').forEach(btn => {
                btn.classList.remove('selected');
            });
            selectedItem = null;
            selectedItemType = null;
        }
    });
}

function getSelectedItem() {
    return selectedItem;
}

function getSelectedItemType() {
    return selectedItemType;
}

function getCurrentDirectory() {
    return currentDirectory;
}

function getFileIcon(fileName) {
    const extenc = fileName.split('.').pop().toLowerCase();

    const iconMap = {
        'npss': '📦',
        'app': '📱',
        'system': '🧱',
        'npcf': '⚙️',
        'npfr': '⚡',
        'txt': '📄'
    };

    return iconMap[extenc] || '📄';
}
    
function fileExist(path) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    return fs[normalizedPath] !== undefined;
}

function fileExistInPath(name, path = currentDirectory) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;
    return fs[fullPath] !== undefined;
}

function isFile(path) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    return fs[normalizedPath] && fs[normalizedPath].type === 'file';
}

function isFolder(path) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    return fs[normalizedPath] && fs[normalizedPath].type === 'folder';
}

function moveItem(name, sourceDir, destinationDir) {
    if (!fileExistInPath(name, sourceDir)) {
        console.error('Source file not found.');
        showAlertBox('Error', `El archivo especificado no existe.`, {as_win:true, icon:'❌'});
        return false;
    }
    if (!isFolder(destinationDir)) {
        console.error('Source directory not found/not a folder.');
        showAlertBox('Error', `El directorio especificado no existe o no es una carpeta.`, {as_win:true, icon:'❌'});
        return false;
    }

    if (fileExistInPath(name, destinationDir)) {
        console.error('File already exists in detination directory.');
        showAlertBox('Error', `El archivo ya existe en el directorio de destino.`, {as_win:true, icon:'❌'});
        return false;
    }

    const fs = getFileSystem();
    const normalizedSource = normalizePath(sourceDir);
    const fullSourcePath = normalizedSource === '/' ? `/${name}` : `${normalizedSource}/${name}`;
    const itemData = fs[fullSourcePath];

    if (itemData.type === 'folder') {
        console.error('Cannot move folders.');
        showAlertBox('Error', `No se pueden mover carpetas, vuelva a intentarlo con un archivo.`, {as_win:true, icon:'❌'});
        return false;
    }

    const content = openFile(name, sourceDir);
    createFile(name, content, destinationDir);
    deleteItem(name, sourceDir);
    updateFileList();
    return true;
}


window.createFolder = createFolder;
window.createFile = createFile;
window.deleteItem = deleteItem;
window.openFile = openFile;
window.modifyFile = modifyFile;
window.changeDirectory = changeDirectory;
window.updateFileList = updateFileList;
window.getCurrentDirectory = getCurrentDirectory;
window.getSelectedItem = getSelectedItem;
window.getSelectedItemType = getSelectedItemType;
window.fileExist = fileExist;
window.fileExistInPath = fileExistInPath;
window.isFile = isFile;
window.isFolder = isFolder;
window.setDirectory = setDirectory;
window.moveItem = moveItem;

window.fs = {
  createFolder: createFolder,
  createFile: createFile,
  deleteItem: deleteItem,
  openFile: openFile,
  modifyFile: modifyFile,
  changeDirectory: changeDirectory,
  updateFileList: updateFileList,
  getCurrentDirectory: getCurrentDirectory,
  getSelectedItem: getSelectedItem,
  getSelectedItemType: getSelectedItemType,
  fileExist: fileExist,
  fileExistInPath: fileExistInPath,
  isFile: isFile,
  isFolder: isFolder,
  setDirectory: setDirectory,
  moveItem: moveItem
};

console.log("window.fs working:", window.fs);
/*window.fs = {
  createFolder,
  createFile,
  deleteItem,
  openFile,
  modifyFile,
  changeDirectory,
  updateFileList,
  getCurrentDirectory
};*/
//file system ends --------------------------------------------------------------------------------
window.scriptReady('FS');