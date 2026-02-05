console.log("Current: FS.js");
//file system start --------------------------------------------------------------------------------
let currentDirectory = '/';
let selectedItem = null;
let selectedItemType = null;
const openNotesModTextarea = document.querySelector('#win_notes textarea');

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

function updateFileList() {
    const fs = getFileSystem();
    const fileListDiv = document.getElementById('file-list');
    fileListDiv.innerHTML = '';

    const normalizedPath = normalizePath(currentDirectory);
    const currentDir = fs[normalizedPath];

    if (!currentDir) {
        fileListDiv.innerHTML = '<p>Directorio no encontrado</p>';
        return;
    }

    const pathDisplay = document.createElement('div');
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
    }
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
                button.addEventListener('click', () => {
                    const content = openFile(itemName);
                    console.log(`Get content of ${itemName}:`, content);
                    openNotesModTextarea.value = content;
                    document.getElementById('win_notes').classList.remove('hidden');
                    document.getElementById('win_files').classList.add('hidden');
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
    
    //Eliminar
    const deleteBtn = document.getElementById('ctx-delete');
    deleteBtn.addEventListener('click', async () => {
        const itemName = contextMenu.dataset.targetItem;
        const delFile = await showMsgBox("ℹ️ Informacion",`Eliminar "${itemName}"?`,'Eliminar', 'Cancelar');
        if (delFile) {
            window.fs.deleteItem(itemName);
            contextMenu.classList.add('hidden');
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
            openNotesModTextarea.value = content;
            document.getElementById('win_notes').classList.remove('hidden');
            document.getElementById('win_files').classList.add('hidden');
        } else {
            window.fs.changeDirectory(itemName);
        }
        contextMenu.classList.add('hidden');
    });
}

function setupFileSelection() {
    const fileListDiv = document.getElementById('file-list');

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
  isFolder: isFolder
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