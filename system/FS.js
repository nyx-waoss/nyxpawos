console.log("Current: FS.js");
/*
FS.js es el archivo mas avanzado de todo el sistema, es un sistema de archivos basico que usa indexed db para guardar carpetas, documentos, e imagenes de forma nativa.
Sin este archivo el sistema no cargaria porque no podria encontrar los archivos necesarios para iniciarlo ni encontraria la configuracion de los usuarios.
*/
//file system start --------------------------------------------------------------------------------
/*
⚠️ DISCLAMER:
Este sistema de archivos antes funcionaba con local storage, esa version fue creada 95% por Nyx. Esta nueva version de indexed DB
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


/*function getFileSystem() {
    return JSON.parse(JSON.stringify(__fsCache));
}*/
function getFileSystem() {
    return __fsCache; // ref directa
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
    if (!SysVar.sysRunningServices.some(item => item.id === 'filesystemNFS.srv')) {
        console.error('File System did not respond');
        return false;
    }

    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (fs[fullPath]) {
        console.error('Folder already exists');
        return false;
    }

    if (!fs[normalizedPath]) {
        console.error(`createFolder: parent path "${normalizedPath}" does not exist`);
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
    if (!SysVar.sysRunningServices.some(item => item.id === 'filesystemNFS.srv')) {
        console.error('File System did not respond');
        return false;
    }
    if (window.fs.fileExistInPath(name, path)) {
        window.fs.modifyFile(name, content, path);
        return true;
    }

    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (fs[fullPath]) {
        console.error('File already exists');
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
    if (!SysVar.sysRunningServices.some(item => item.id === 'filesystemNFS.srv')) {
        console.error('File System did not respond');
        return false;
    }
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (!fs[fullPath]) {
        console.error('Item does not exist');
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
    if (!SysVar.sysRunningServices.some(item => item.id === 'filesystemNFS.srv')) {
        console.error('File System did not respond');
        return false;
    }
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
    if (!SysVar.sysRunningServices.some(item => item.id === 'filesystemNFS.srv')) {
        console.error('File System did not respond');
        return false;
    }
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);
    const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

    if (!fs[fullPath]) { console.error('Item does not exist'); return null; }
    if (fs[fullPath].type !== 'file') { console.error('Item is not a file'); return null; }

    return fs[fullPath].content;
}

function modifyFile(name, newContent, path = currentDirectory) {
    if (!SysVar.sysRunningServices.some(item => item.id === 'filesystemNFS.srv')) {
        console.error('File System did not respond');
        return false;
    }
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

            filesHomegridBtn.addEventListener('dblclick', async (e) => {
                e.preventDefault();
                const resolvedRoute = getQuickAccessRoute(QAitem);
                if (QAitem.eltype === 'folder') {
                    setDirectory(resolvedRoute);
                } else if (QAitem.eltype === 'file') {
                    setDirectory(resolvedRoute);
                    const fileContToOpen = openFile(QAitem.text, resolvedRoute);
                    if (fileContToOpen) {
                        sysExecApp('notes');
                        await waitUntil(() => typeof notesSetTXArea === 'function');
                        notesSetTXArea(fileContToOpen);
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
    if (!fileListDiv || !AppManager.loadedApps.has('files')) return;
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
                button.addEventListener('dblclick', () => execFile(itemName));
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
                
                contextMenu.classList.add('hidden');
            }
        }
    });

    const openBtn = document.getElementById('ctx-open');
    openBtn.addEventListener('click', async () => {
        const itemName = contextMenu.dataset.targetItem;
        const itemType = contextMenu.dataset.targetType;

        if (itemType === 'file') {
            const content = window.fs.openFile(itemName);
            console.log('Content:', content);
            console.log(`Get content of ${itemName}...`);
            sysExecApp('notes');
            await waitUntil(() => typeof notesSetTXArea === 'function');
            notesSetTXArea(content);
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

    const renameItemBtn = document.getElementById('ctx-rename');
    renameItemBtn.addEventListener('click', async ()=>{
        const itemName = contextMenu.dataset.targetItem;

        const newFileName = await showPromptMsgBox('Nuevo nombre', 'Ingresa el nuevo nombre', 'Renombrar', 'Cancelar',{as_win:true,icon:'⚠️'});
        if (!newFileName.confirmed) return;
        if (!newFileName.value) {
            showAlertBox('msgbox_err','Ingresa un nombre',{as_win:true,icon:'⚠️'});
            return;
        }
        if (/\.[a-zA-Z0-9]+$/.test(newFileName.value)) {
            const confirmModExtns = await showMsgBox("msgbox_warning",`Se cambiara la extencion original del archivo (${FSgetFileExtension(itemName)}) por ${FSgetFileExtension(newFileName.value)} . Continuar?`, "Renombrar", "Cancelar",{as_win:false,icon:'⚠️'});
            if (confirmModExtns) {
                window.fs.renameItem(itemName, newFileName.value);
            }
            return;
        }
        window.fs.renameItem(itemName, `${newFileName.value}${FSgetFileExtension(itemName)}`);

        contextMenu.classList.add('hidden');
    });
}

function FSgetFileExtension(filename) {
    const i = filename.lastIndexOf('.');
    return i !== -1 ? filename.slice(i) : '';
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
                .replace('📕 ', '')
                .replace('📝 ', '')
                .replace('📈 ', '')
                .replace('💾 ', '')
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
        'webp':   '🖼️',
        'pdf':    '📕',
        'qdoc':   '📝',
        'qsld':   '📈',
        'qsht':   '📊',
        'data':   '💾'
    };
    return iconMap[extenc] || '❓';
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
    if (!fileExistInPath(name, sourceDir))     return false;
    if (!isFolder(destinationDir))             return false;
    if (fileExistInPath(name, destinationDir)) return false;

    const fs = getFileSystem();
    const normSrc  = normalizePath(sourceDir);
    const normDest = normalizePath(destinationDir);
    const fullSrc  = normSrc  === '/' ? `/${name}` : `${normSrc}/${name}`;
    const fullDest = normDest === '/' ? `/${name}` : `${normDest}/${name}`;

    if (fs[fullSrc].type === 'folder') {
        
        moveFolderRecursive(fullSrc, fullDest, fs);
        
        if (!fs[normDest].children.includes(name))
            fs[normDest].children.push(name);
        
        deleteRecursive(fullSrc, fs);
        delete fs[fullSrc];
        const srcChildren = fs[normSrc].children;
        srcChildren.splice(srcChildren.indexOf(name), 1);

        saveFileSystem(fs);
        updateFileList();
        return true;
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
    if (!SysVar.sysRunningServices.some(item => item.id === 'filesystemNFS.srv')) {
        console.error('File System did not respond');
        return false;
    }
    return _openDB().then(db => new Promise((resolve, reject) => {
        const key = path === '/' ? `/${name}` : `${path}/${name}`;
        const tx  = db.transaction('media', 'readwrite');
        tx.objectStore('media').put(blob, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror    = (e) => reject(e.target.error);
    }));
}

async function downloadImageToFS(url, name, path = currentDirectory) {
    if (!SysVar.sysRunningServices.some(item => item.id === 'filesystemNFS.srv')) {
        console.error('File System did not respond');
        return false;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const blob = await response.blob();
        await saveImage(name, path, blob);

        const fs = getFileSystem();
        const normalizedPath = normalizePath(path);
        const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

        fs[fullPath] = { type: 'file', content: '[media]' };
        if (!fs[normalizedPath].children.includes(name)) {
            fs[normalizedPath].children.push(name);
        }
        saveFileSystem(fs);
        updateFileList();

        console.log(`Saving image...: ${fullPath}`);
        return true;
    } catch (e) {
        console.error('Cannot save image:', e);
        showAlertBox('Error', `No se pudo descargar la imagen.`, { as_win: true, icon: '❌' });
        return false;
    }
}

async function downloadPdfToFS(url, name, path = currentDirectory) {
    if (!SysVar.sysRunningServices.some(item => item.id === 'filesystemNFS.srv')) {
        console.error('File System did not respond');
        return false;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();

        await saveImage(name, path, blob); //Reusar xq no importa el tipo xD

        const fs = getFileSystem();
        const normalizedPath = normalizePath(path);
        const fullPath = normalizedPath === '/' ? `/${name}` : `${normalizedPath}/${name}`;

        fs[fullPath] = { type: 'file', content: '[pdf]' };
        if (!fs[normalizedPath].children.includes(name)) {
            fs[normalizedPath].children.push(name);
        }
        saveFileSystem(fs);
        updateFileList();

        console.log(`PDF guardado: ${fullPath}`);
        return true;
    } catch (e) {
        console.error('Cannot save PDF:', e);
        showAlertBox('Error', `No se pudo descargar el PDF.`, { as_win: true, icon: '❌' });
        return false;
    }
}

function returnFSArray(directory = currentDirectory) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(directory);
    const dir = fs[normalizedPath];

    if (!dir || dir.type !== 'folder') {
        console.error(`"${normalizedPath}" is not a valid dir`);
        return [];
    }

    return (dir.children || []).map(name => ({
        filename: name,
        size: '0',
        owner: 'user'
    }));
}

function deleteFolderContents(path) {
    const fs = getFileSystem();
    const normalizedPath = normalizePath(path);

    if (!fs[normalizedPath] || fs[normalizedPath].type !== 'folder') {
        console.error('deleteFolderContents: no es una carpeta válida');
        return false;
    }

    deleteRecursive(normalizedPath, fs);
    fs[normalizedPath].children = []; // limpia la lista de hijos
    saveFileSystem(fs);
    updateFileList();
    return true;
}

function copyFolderRecursive(sourcePath, destPath, fs) {
    fs[destPath] = { type: 'folder', children: [] };

    for (const child of fs[sourcePath].children) {
        const childSrc  = `${sourcePath}/${child}`;
        const childDest = `${destPath}/${child}`;

        if (fs[childSrc].type === 'folder') {
            copyFolderRecursive(childSrc, childDest, fs);
        } else {
            fs[childDest] = { ...fs[childSrc] };
        }
        fs[destPath].children.push(child);
    }
}

function copyItem(name, sourceDir, destinationDir) {
    if (!fileExistInPath(name, sourceDir))      return false;
    if (!isFolder(destinationDir))              return false;
    if (fileExistInPath(name, destinationDir))  return false;

    const fs = getFileSystem();
    const normSrc  = normalizePath(sourceDir);
    const normDest = normalizePath(destinationDir);
    const fullSrc  = normSrc  === '/' ? `/${name}` : `${normSrc}/${name}`;
    const fullDest = normDest === '/' ? `/${name}` : `${normDest}/${name}`;

    if (fs[fullSrc].type === 'folder') {
        copyFolderRecursive(fullSrc, fullDest, fs);

        if (!fs[normDest].children.includes(name))
            fs[normDest].children.push(name);

        saveFileSystem(fs);
        updateFileList();
        return true;
    }

    const content = openFile(name, sourceDir);
    return createFile(name, content, destinationDir);
}

function moveFolderRecursive(sourcePath, destPath, fs) {
    fs[destPath] = { type: 'folder', children: [] };

    for (const child of fs[sourcePath].children) {
        const childSrc  = `${sourcePath}/${child}`;
        const childDest = `${destPath}/${child}`;

        if (fs[childSrc].type === 'folder') {
            moveFolderRecursive(childSrc, childDest, fs);
        } else {
            fs[childDest] = { ...fs[childSrc] };
        }
        fs[destPath].children.push(child);
    }
}

function getFolderSize(path) {
    const fs = getFileSystem();
    let count = 0;
    function walk(p) {
        const node = fs[normalizePath(p)];
        if (!node) return;
        if (node.type === 'file') { count++; return; }
        for (const child of node.children) walk(`${p}/${child}`);
    }
    walk(path);
    return count;
}

function renameItem(oldName, newName, path = currentDirectory) {
    const fs = getFileSystem();
    const norm    = normalizePath(path);
    const oldPath = norm === '/' ? `/${oldName}` : `${norm}/${oldName}`;
    const newPath = norm === '/' ? `/${newName}` : `${norm}/${newName}`;

    if (!fs[oldPath]) return false;
    if (fs[newPath])  return false;

    if (fs[oldPath].type === 'folder') {
        const allKeys = Object.keys(fs);
        for (const key of allKeys) {
            if (key === oldPath || key.startsWith(oldPath + '/')) {
                const updatedKey  = newPath + key.slice(oldPath.length);
                fs[updatedKey]    = fs[key];
                delete fs[key];
            }
        }
    } else {
        fs[newPath] = fs[oldPath];
        delete fs[oldPath];
    }

    const children = fs[norm].children;
    const i = children.indexOf(oldName);
    if (i > -1) children[i] = newName;

    saveFileSystem(fs);
    updateFileList();
    return true;
}


async function execFile(name, path = currentDirectory) {
    const ext = name.split('.').pop().toLowerCase();
    const imageExts = ['png','jpg','jpeg','gif','webp','bmp'];

    const normPath = normalizePath(path);
    const itemPath = normPath === '/' ? `/${name}` : `${normPath}/${name}`;

    if (imageExts.includes(ext)) {
        sysExecApp('nyximageviewer');
        await waitUntil(() => typeof imageViewerOpenFromFS === 'function');
        setTimeout(() => imageViewerOpenFromFS(itemPath), 80);
        return;
    }

    if (ext === 'pdf') {
        sysExecApp('pdfviewer');
        await waitUntil(() => typeof pdfViewerOpenFromFS === 'function');
        setTimeout(() => pdfViewerOpenFromFS(itemPath), 80);
        return;
    }

    if (ext === 'qdoc') {
        sysExecApp('nyxpawdocs');
        await waitUntil(() => typeof nyxpawdocsSetContent === 'function');
        setTimeout(() => {
            const content = openFile(name, path);
            window.nyxpawdocsSetContent(content);
        }, 90);
        return;
    }

    if (ext === 'qsld') {
        sysExecApp('nyxpawslides');
        await waitUntil(() => typeof nyxpawslidesSetContent === 'function');
        setTimeout(() => {
            const content = openFile(name, path);
            window.nyxpawslidesSetContent(content);
        }, 90);
        return;
    }

    if (ext === 'qsht') {
        sysExecApp('nyxpawsheets');
        await waitUntil(() => typeof nyxpawsheetsSetContent === 'function');
        setTimeout(() => {
            const content = openFile(name, path);
            window.nyxpawsheetsSetContent(content);
        }, 90);
        return;
    }

    if (ext === 'npfr') {
        const fullPath = itemPath;
        if (!Array.isArray(SysVar.safeFiles) || !SysVar.safeFiles.includes(fullPath)) {
            showAlertBox('Acceso denegado', `"${name}" no está en la lista de archivos seguros.`, { as_win: true, icon: '🛡️' });
            try {
                sysAddEvent('warning', 'Security', `Blocked execution of unsafe file: ${fullPath}`);
            } catch(e) {
                tempSysAddEvent('warning', 'Security', `Blocked execution of unsafe file: ${fullPath}`);
            }
            return;
        }

        const content = openFile(name, path);
        try {
            eval(content);
        } catch(e) {
            createNotification('assets/apps/launchpad/3.png', 'Un script falló', `Ocurrio un error al ejecutar "${name}"`);
            try {
                sysAddEvent('error', 'Error', `Failed to run ${name}: ${e}`);
            } catch(error) {
                tempSysAddEvent('error', 'Error', `Failed to run ${name}: ${e}`);
            }
        }
        return;
    }

    const content = openFile(name, path);
    sysExecApp('notes');
    await waitUntil(() => typeof notesSetTXArea === 'function');
    setTimeout(() => notesSetTXArea(content), 90);
}


window.downloadPdfToFS = downloadPdfToFS;
window.downloadImageToFS   = downloadImageToFS;
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
window.returnFSArray       = returnFSArray;
window.deleteFolderContents= deleteFolderContents;
window.renameItem    = renameItem;
window.copyItem      = copyItem;
window.getFolderSize = getFolderSize;
window.execFile = execFile;

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
    saveImage,
    downloadImageToFS,
    downloadPdfToFS,
    returnFSArray,
    deleteFolderContents,
    renameItem,
    copyItem,
    getFolderSize,
    execFile
};

window.initFileSystem = initFileSystem;
window._openDB = _openDB;


console.log("window.fs working:", window.fs);

_migrateFromLocalStorage()
    .then(() => initFileSystem())
    .then(() => {
        console.log('[FS] Ready. Cache loaded:', Object.keys(__fsCache).length, 'entries.');
        window.fsReady = true;
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