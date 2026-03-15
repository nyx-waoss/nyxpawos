console.log("Current: FS.js");
//file system start --------------------------------------------------------------------------------
/*
⚠️ DISCLAMER:
Este sistema de archivos antes funcionaba con local storage, esa version fue creada 100% por Nyx. Esta nueva version de indexed DB
ha sido creada con inteligencia artificial, por lo que podrian haber inconsistencias y quiero aclarar que Nyx no sabe NADA de indexed DB, por eso
se lo pidio a la IA. Sin embargo, hay algunas cosas que el mismo Nyx a modificado y agregado a este archivo, no todo esta creado por pura IA,
eso si, lo que ha cambiado nyx son cositas pequeñas que solo mejoran un poco la UX como el quick view o nombres de variables, pero nada mas.

TL;DR
Algunas partes las hizo la IA, otras yo, mas o menos asi:
80% IA
15% Yo
5% Stack Overflow

Muchas gracias, ahora si, puedes continuar leyendo el codigo xD
*/
let currentDirectory = '/';
let selectedItem = null;
let selectedItemType = null;
window.SysVar = window.SysVar || {};


const DB_NAME    = 'NeptuneFS';
const DB_VERSION = 2;
const STORE_NAME = 'filesystem';
const FS_KEY     = 'root';

let __fsCache = null;
let __db      = null;

function _openDB() {
    return new Promise((resolve, reject) => {
        if (__db) { resolve(__db); return; }

        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
            if (!db.objectStoreNames.contains('media')) {
                db.createObjectStore('media');
            }
        };

        req.onsuccess = (e) => {
            __db = e.target.result;
            resolve(__db);
        };

        req.onerror = (e) => {
            reject(e.target.error);
        };
    });
}

function _dbGet(key) {
    return _openDB().then(db => new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror   = (e) => reject(e.target.error);
    }));
}

function _dbPut(key, value) {
    _openDB().then(db => {
        const tx  = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(value, key);
        tx.onerror = (e) => console.error('[FS] IndexedDB write error:', e.target.error);
    }).catch(e => console.error('[FS] IndexedDB open error:', e));
}

function _persistCache() {
    _dbPut(FS_KEY, __fsCache);
}

async function initFileSystem() {
    try {
        const saved = await _dbGet(FS_KEY);

        if (saved && saved['/']) {
            __fsCache = saved;
            console.log('[FS] Loaded from IndexedDB.');
        } else {
            __fsCache = {
                '/': { type: 'folder', children: [] }
            };
            _persistCache();
            console.log('[FS] Created fresh filesystem.');
        }
    } catch (e) {
        sysBsod('X-FSI-FTI', 'Failed to initialize file system: ' + e.message);
    }
}


function getFileSystem() {
    return JSON.parse(JSON.stringify(__fsCache));
}

function saveFileSystem(fs) {
    __fsCache = fs;
    _persistCache();
}


function normalizePath(path) {
    if (path === '/') return '/';
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function createFolder(name, path = currentDirectory) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (fs[fullPath]) {
        console.error('La carpeta ya existe');
        return false;
    }

    fs[fullPath] = { type: 'folder', children: [] };

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

    fs[fullPath] = { type: 'file', content: content };

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
    if (index > -1) parentChildren.splice(index, 1);

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

    if (!fs[fullPath]) { console.error('El item no existe'); return null; }
    if (fs[fullPath].type !== 'file') { console.error('No es un archivo'); return null; }

    return fs[fullPath].content;
}

function modifyFile(name, newContent, path = currentDirectory) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (!fs[fullPath]) { console.error('El item no existe'); return false; }
    if (fs[fullPath].type !== 'file') { console.error('No es un archivo'); return false; }

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

    if (!fs[newPath]) { console.error('La carpeta no existe'); return; }
    if (fs[newPath].type !== 'folder') { console.error('No es una carpeta'); return; }

    currentDirectory = newPath;
    updateFileList();
}

function setDirectory(name) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(name);

    if (!fs[normalizedPath]) {
        console.error('Directory not found: ' + normalizedPath);
        showAlertBox('Error', `Dir ${normalizedPath} not found!`, { as_win: true, icon: '❌' });
        return;
    }

    if (fs[normalizedPath].type !== 'folder') {
        console.error('Not a directory: ' + normalizedPath);
        showAlertBox('Error', `${normalizedPath} is not a folder!`, { as_win: true, icon: '❌' });
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
            showAlertBox('Error', `Ha ocurrido un error! Revisa Event Viewer para mas informacion.`, { as_win: true, icon: '❌' });
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
                        console.error('fileContToOpen is not valid:', fileContToOpen);
                        showAlertBox('Error', `Ha ocurrido un error! Revisa Event Viewer para mas informacion.`, { as_win: true, icon: '❌' });
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
                button.classList.add('file-btn', 'file-btn-folder');
            } else {
                button.classList.add('file-btn', 'file-btn-file');
            }

            button.style.display = 'block';
            button.style.marginBottom = '5px';

            if (item.type === 'folder') {
                button.addEventListener('dblclick', () => changeDirectory(itemName));
            } else {
                button.addEventListener('dblclick', () => {
                    const imageExts = ['png','jpg','jpeg','gif','webp','bmp'];
                    const ext = itemName.split('.').pop().toLowerCase();

                    if (imageExts.includes(ext)) {
                        sysExecApp('nyximageviewer');
                        setTimeout(() => {
                            imageViewerOpenFromFS(itemPath);
                        },80);
                        return;
                    }

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
            console.error('Cannot get current directory: ' + currentDirTCPDel);
            showAlertBox('Error', `No se pudo obtener el directorio actual.`, { as_win: true, icon: '❌' });
            contextMenu.classList.add('hidden');
            return;
        }

        if (currentDirTCPDel === '/system/trash') {
            const delFile = await showMsgBox("ℹ️ Informacion", `Eliminar "${itemName}" permanentemente?\nEsta accion no se puede deshacer.`, 'Eliminar', 'Cancelar');
            if (delFile) {
                window.fs.deleteItem(itemName);
                contextMenu.classList.add('hidden');
            }
        } else {
            const delFile = await showMsgBox("ℹ️ Informacion", `Eliminar "${itemName}"?`, 'Eliminar', 'Cancelar');
            if (delFile) {
                if (itemType === 'folder') {
                    window.fs.deleteItem(itemName);
                } else {
                    const currentDirWFTDel = getCurrentDirectory();
                    if (currentDirWFTDel === null || currentDirWFTDel === undefined) {
                        console.error('Cannot get current directory: ' + currentDirWFTDel);
                        showAlertBox('Error', `No se pudo obtener el directorio actual.`, { as_win: true, icon: '❌' });
                        contextMenu.classList.add('hidden');
                        return;
                    }
                    try {
                        window.fs.moveItem(itemName, currentDirWFTDel, '/system/trash');
                    } catch (error) {
                        console.error('Cannot move to trash: ' + error);
                        const moveFileToTrash = await showMsgBox("ℹ️ Informacion", `No se pudo mover "${itemName}" a la papelera.\nDesea eliminarlo permanentemente?`, 'Eliminar', 'Cancelar');
                        if (moveFileToTrash) {
                            window.fs.deleteItem(itemName);
                        }
                    }
                }
                contextMenu.classList.add('hidden');
            }
        }
    });

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
                emoji: '📄',
                text: itemName,
                route: currentDirectory,
                eltype: 'file'
            });
        } else {
            SysVar.filesQuickAccess.push({
                emoji: '🗂️',
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
                .replace('🖼️ ', '')
                .replace(/[\uFE0F\uFE0E\u200D]/g, '')
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

function getSelectedItem()      { return selectedItem; }
function getSelectedItemType()  { return selectedItemType; }
function getCurrentDirectory()  { return currentDirectory; }

function getFileIcon(fileName) {
    const extenc = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        'npss':   '📦',
        'app':    '📱',
        'system': '🧱',
        'npcf':   '⚙️',
        'npfr':   '⚡',
        'txt':    '📄',
        'png':    '🖼️',
        'jpg':    '🖼️',
        'jpeg':   '🖼️',
        'gif':    '🖼️',
        'webp':   '🖼️'
    };
    return iconMap[extenc] || '📄';
}

function fileExist(path) {
    const normalizedPath = normalizePath(path);
    return __fsCache[normalizedPath] !== undefined;
}

function fileExistInPath(name, path = currentDirectory) {
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;
    return __fsCache[fullPath] !== undefined;
}

function isFile(path) {
    const normalizedPath = normalizePath(path);
    return __fsCache[normalizedPath] && __fsCache[normalizedPath].type === 'file';
}

function isFolder(path) {
    const normalizedPath = normalizePath(path);
    return __fsCache[normalizedPath] && __fsCache[normalizedPath].type === 'folder';
}

function moveItem(name, sourceDir, destinationDir) {
    if (!fileExistInPath(name, sourceDir)) {
        console.error('Source file not found.');
        showAlertBox('Error', `El archivo especificado no existe.`, { as_win: true, icon: '❌' });
        return false;
    }
    if (!isFolder(destinationDir)) {
        console.error('Source directory not found/not a folder.');
        showAlertBox('Error', `El directorio especificado no existe o no es una carpeta.`, { as_win: true, icon: '❌' });
        return false;
    }
    if (fileExistInPath(name, destinationDir)) {
        console.error('File already exists in destination directory.');
        showAlertBox('Error', `El archivo ya existe en el directorio de destino.`, { as_win: true, icon: '❌' });
        return false;
    }

    const fs = getFileSystem();
    const normalizedSource = normalizePath(sourceDir);
    const fullSourcePath = normalizedSource === '/' ? `/${name}` : `${normalizedSource}/${name}`;
    const itemData = fs[fullSourcePath];

    if (itemData.type === 'folder') {
        console.error('Cannot move folders.');
        showAlertBox('Error', `No se pueden mover carpetas, vuelva a intentarlo con un archivo.`, { as_win: true, icon: '❌' });
        return false;
    }

    const content = openFile(name, sourceDir);
    createFile(name, content, destinationDir);
    deleteItem(name, sourceDir);
    updateFileList();
    return true;
}


async function _migrateFromLocalStorage() {
    const old = localStorage.getItem('fileSystem');
    if (!old) return;

    try {
        const parsed = JSON.parse(old);
        if (parsed && parsed['/']) {
            const existing = await _dbGet(FS_KEY);
            if (!existing) {
                await _openDB();
                _dbPut(FS_KEY, parsed);
                console.log('[FS] Migrated data from localStorage to IndexedDB.');
            }
            localStorage.removeItem('fileSystem');
            console.log('[FS] Removed old localStorage entry.');
        }
    } catch (e) {
        console.warn('[FS] Migration from localStorage failed:', e);
    }
}

function saveImage(name, path, blob) {
    return _openDB().then(db => new Promise((resolve, reject) => {
        const key = path === '/' ? `/${name}` : `${path}/${name}`;
        const tx  = db.transaction('media', 'readwrite');
        tx.objectStore('media').put(blob, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror    = (e) => reject(e.target.error);
    }));
}




window.saveImage           = saveImage;
window.createFolder        = createFolder;
window.createFile          = createFile;
window.deleteItem          = deleteItem;
window.openFile            = openFile;
window.modifyFile          = modifyFile;
window.changeDirectory     = changeDirectory;
window.updateFileList      = updateFileList;
window.getCurrentDirectory = getCurrentDirectory;
window.getSelectedItem     = getSelectedItem;
window.getSelectedItemType = getSelectedItemType;
window.fileExist           = fileExist;
window.fileExistInPath     = fileExistInPath;
window.isFile              = isFile;
window.isFolder            = isFolder;
window.setDirectory        = setDirectory;
window.moveItem            = moveItem;

window.fs = {
    createFolder,
    createFile,
    deleteItem,
    openFile,
    modifyFile,
    changeDirectory,
    updateFileList,
    getCurrentDirectory,
    getSelectedItem,
    getSelectedItemType,
    fileExist,
    fileExistInPath,
    isFile,
    isFolder,
    setDirectory,
    moveItem,
    saveImage
};

window.initFileSystem = initFileSystem;
window._openDB = _openDB;


console.log("window.fs working:", window.fs);

_migrateFromLocalStorage()
    .then(() => initFileSystem())
    .then(() => {
        console.log('[FS] Ready. Cache loaded:', Object.keys(__fsCache).length, 'entries.');
        window.scriptReady('FS');
    })
    .catch(e => {
        sysBsod('X-FSI-BOOT', 'FS boot failed: ' + e.message);
    });

//file system ends --------------------------------------------------------------------------------
/*

NeptuneFS: Created by Claude AI
Idea by Nyx_waoss
Old version by nyx :D

*/