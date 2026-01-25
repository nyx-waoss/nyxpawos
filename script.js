console.log("System startup initiated!");
let sysScriptIsOK = false;
let formato24h = false;
let appDownloaded = []
const sysUsers = {
    'user': {
        displayName: 'User',
        password: '1234',
        createdAt: Date.now()
    }
};

const monthsNM = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

let actualDate = new Date();
let StarredDates = new Set();

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
            button.textContent = item.type === 'folder' ? `📁 ${itemName}` : `📄 ${itemName}`;

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
                    console.log(`Contenido de ${itemName}:`, content);
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
    deleteBtn.addEventListener('click', () => {
        const itemName = contextMenu.dataset.targetItem;
        if (confirm(`¿Eliminar "${itemName}"?`)) {
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
            console.log('Contenido:', content);
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
            selectedItem = itemText.replace('📁 ', '').replace('📄 ', '').trim();

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
  getSelectedItemType: getSelectedItemType
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
//IMPORTANTE - DEJAR ESTO ARRIBA! NO PONER NA MAS!

function sysBsod(errorCode, errorText) {
    const errorCodeOut = document.getElementById('bsodErrorCode');
    const errorTextOut = document.getElementById('bsodErrorText');
    const bsodDiv = document.getElementById('bsod');

    errorCodeOut.textContent = errorCode;
    errorTextOut.textContent = errorText;
    bsodDiv.classList.remove('hidden');
    setTimeout(() => {
        window.location.href = "index.html";
    }, 10000);
}

//fin del sistema de bsod


function updateTime() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    let period = "";

    if (!formato24h) {
        period = hours >= 12 ? " PM" : " AM";
        hours = hours % 12 || 12;
    }

    const h = hours.toString().padStart(2, "0");
    const m = minutes.toString().padStart(2, "0");
    const s = seconds.toString().padStart(2, "0");

    timeText = document.getElementById('timetext');
    timeText.textContent = `${h}:${m}:${s}${period}`;
}

//funcion msgbox----------------------------------------------------------------------------------
function showPromptMsgBox(title, text, okbtn_text, cancelbtn_text) {4
        return new Promise((resolve) => {
        const msgBox = document.getElementById('msg-box')
        const msgTitle = document.getElementById('msg-box-title');
        const msgText = document.getElementById('msg-box-text');
        const msgInput = document.getElementById('msg-box-input');
        const msgButtonOk = document.getElementById('msg-box-okbtn');
        const msgButtonCancel = document.getElementById('msg-box-cancelbtn');
        const bgOverlay = document.getElementById('msg-box-bgoverlay');

        bgOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.445)";

        msgTitle.textContent = title;
        msgText.textContent = text;
        msgButtonOk.textContent = okbtn_text;
        msgButtonCancel.textContent = cancelbtn_text;
        msgInput.value = '';
        msgInput.setAttribute('autocomplete', 'off');

        msgBox.style.zIndex = topZ + 10;
        bgOverlay.style.zIndex = topZ + 9;

        msgBox.classList.remove('hidden');
        msgButtonOk.classList.remove('hidden');
        bgOverlay.classList.remove('hidden');
        msgInput.classList.remove('hidden');

        msgInput.focus

        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                msgButtonOk.click();
            }
        };
        msgInput.addEventListener('keydown', handleEnter);

        msgButtonOk.onclick = () => {
            const value = msgInput.value.trim();
            msgBox.classList.add('hidden');
            bgOverlay.classList.add('hidden');
            msgInput.classList.add('hidden');
            msgInput.removeEventListener('keydown', handleEnter);
            resolve({confirmed: true, value: value});
        };

        msgButtonCancel.onclick = () => {
            msgBox.classList.add('hidden');
            bgOverlay.classList.add('hidden');
            msgInput.classList.add('hidden');
            msgInput.removeEventListener('keydown', handleEnter);
            resolve({confirmed: false, value: null});
        };
    });
}

function showMsgBox(title, text, okbtn_text, cancelbtn_text) {
    return new Promise((resolve) => {
        const msgBox = document.getElementById('msg-box');
        const msgTitle = document.getElementById('msg-box-title');
        const msgText = document.getElementById('msg-box-text');
        const msgInput = document.getElementById('msg-box-input');
        const msgButtonOk = document.getElementById('msg-box-okbtn');
        const msgButtonCancel = document.getElementById('msg-box-cancelbtn');
        const bgOverlay = document.getElementById('msg-box-bgoverlay');

        bgOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.445)";

        msgTitle.textContent = title;
        msgText.textContent = text;
        msgButtonOk.textContent = okbtn_text;
        msgButtonCancel.textContent = cancelbtn_text;

        msgBox.style.zIndex = topZ + 10;
        bgOverlay.style.zIndex = topZ + 9;

        msgInput.classList.add('hidden');
        msgBox.classList.remove('hidden');
        msgButtonOk.classList.remove('hidden');
        bgOverlay.classList.remove('hidden');

        msgButtonOk.onclick = () => {
        msgBox.classList.add('hidden');
        bgOverlay.classList.add('hidden');
            resolve(true);
        };

        msgButtonCancel.onclick = () => {
            msgBox.classList.add('hidden');
            bgOverlay.classList.add('hidden');
            resolve(false);
        };
    });
}

function showAlertBox(title, text) {
    const msgBox = document.getElementById('msg-box');
    const msgTitle = document.getElementById('msg-box-title');
    const msgText = document.getElementById('msg-box-text');
    const msgInput = document.getElementById('msg-box-input');
    const msgButtonOk = document.getElementById('msg-box-okbtn');
    const msgButtonCancel = document.getElementById('msg-box-cancelbtn');
    const bgOverlay = document.getElementById('msg-box-bgoverlay');

    bgOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.445)";

    msgTitle.textContent = title;
    msgText.textContent = text;
    msgButtonOk.textContent = "Sin definir";
    msgButtonCancel.textContent = "Ok";

    msgBox.style.zIndex = topZ + 10;
    bgOverlay.style.zIndex = topZ + 9;

    msgInput.classList.add('hidden');
    msgBox.classList.remove('hidden');
    msgButtonOk.classList.add('hidden');
    bgOverlay.classList.remove('hidden');

    msgButtonCancel.addEventListener("click", () => {
        msgBox.classList.add('hidden');
        bgOverlay.classList.add('hidden');
    });
}
/*Ejemplo de uso - confirmacion
                                              ⬇ Titulo         ⬇ Pregunta                           ⬇ Texto del boton 1   ⬇ Texto del boton 2
const confirmDeleteData = await showMsgBox("⚠️ Advertencia!","Quieres borrar todos tus datos?", "Eliminar mis datos", "Cancelar");
    if (confirmDeleteData) {
        //Que hacer si se confirma y despues si quieres pon algun else o algo :D
    }

Y para las alertas
               ⬇ Titulo          ⬇ Texto de la alerta
showAlertBox("⚠️ Advertencia!","Este es un mensaje de alerta.");
-------------------------------------------------------------------------------------------*/

function initializeLoginScreen() {
    const loginScreen = document.getElementById('loginscr');

    loginScreen.innerHTML = '';

    for (let username in sysUsers) {
        addUserToLoginScreen(username);
    }
}

function startLoading() {
    const loadProgressBar = document.getElementById('startupscr_progressbar');
    const loadProgressText = document.getElementById('startupscr_progresstext');
    const loginScr = document.getElementById('loginscr');
    let loadProgress = 0;
    let loadIsPaused = false;
    let loadPauseTimer = 0;

    const loadInterval = setInterval(() => {
        if (loadProgress < 30) {
            loadProgress += Math.random() * 3 + 1;
        } else if (loadProgress < 50) {
            loadProgress += Math.random() * 2 + 0.5;
        } else if (loadProgress >= 50 && loadProgress < 55 && !loadIsPaused) {
            loadIsPaused = true;
            loadPauseTimer = 0;
        } else if (loadIsPaused) {
            loadPauseTimer++;
            if (loadPauseTimer > 10) { // Ajustar '30' para mas o menos tiempo de espera
                loadIsPaused = false;
                loadProgress += 0.5;
            }
        } else if (loadProgress < 95) {
            loadProgress += Math.random() * 1 + 0.3;
        } else {
            loadProgress += 0.5;
        }

        loadProgress = Math.min(loadProgress, 100);

        loadProgressBar.style.width = loadProgress + '%';
        if (loadProgressText) {
            loadProgressText.textContent = Math.floor(loadProgress) + '%';
        }

        if (loadProgress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                const startupScr = document.getElementById('startupscr');
                startupScr.classList.add('hidden');
                console.log('script is ok: ' + sysScriptIsOK);
                if (sysScriptIsOK !== true) {
                    sysBsod('X-SYS-CRP','The system files are corrupted. Please contact technical support');
                }
                setTimeout(() => {
                    loginScr.classList.remove('hidden');
                    document.documentElement.requestFullscreen();
                }, 500);
            }, 200);
        }
    }, 20/*'50' es la velocidad, mayor numero = mas lento*/);
}

function checkLoadingTimeout() {
    setTimeout(() => {
        const startupScr = document.getElementById('startupscr');
        if (!startupScr.classList.contains('hidden')) {
            console.warn('An unknown error has occurred! Bootscreen is taking too long.');

            const loadProgressText = document.getElementById('startupscr_progresstext');
            if (loadProgressText) {
                loadProgressText.textContent = 'Ha ocurrido un error desconocido!';
                loadProgressText.style.color = '#ff9800';
            }
        }
    }, 15000); // espera 15 segundos a ver si ya se quito la pinchi pantalla de carga o no
}


//inicializar todo:
startLoading(); 


setInterval(updateTime, 1000);
updateTime();
initWindowManager();
hideAppBar();
hideTopBar();
initFileSystem();
if (document.getElementById('file-list')) {
  updateFileList();
  setupFileSelection();
  setupContextMenu();
  setupContextMenuActions();
}
renderCalendar();
initializeLoginScreen();
refreshUserCards();
document.getElementById('startupscr').classList.remove('hidden');
document.getElementById('startupscrimg').classList.remove('hidden');
document.getElementById('startupscrtext').classList.add('hidden');

/*setTimeout(() => {
    const startupScr = document.getElementById('startupscr');
    startupScr.classList.add('hidden');
    setTimeout(() => {
        showTopBar();
        showAppBar();
    }, 600);
}, 5100);
se cambio por:*/
checkLoadingTimeout();

//principal ^^^^^^
//otros------------------------------------
const startButton = document.getElementById('topbar_button');
const startDropdown = document.getElementById('start-dropdown');

let abierto = false;

startButton.addEventListener("click", (e) => {
    e.stopPropagation();

    if (abierto) {
        startDropdown.classList.add('hidden');
        abierto = false;
        return;
    }

    const rect = startButton.getBoundingClientRect();

    startDropdown.style.left = rect.left + "px";
    startDropdown.style.top = rect.bottom + "px";
    startDropdown.classList.remove('hidden');

    abierto = true;
});

startDropdown.addEventListener("click", () => {
    startDropdown.classList.add('hidden');
    abierto = false;
});

document.addEventListener("click", () => {
    if (!abierto) return;

    startDropdown.classList.add('hidden');
    abierto = false;
});

//ventanas
//Codigo general pa todo xd:
let topZ = 9992;

document.querySelectorAll(".window").forEach(win => {
    const grab = win.querySelector(".grab");
    const resizeHandle = win.querySelector(".resize-handle");

    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    let resizing = false;
    let startX, startY, startWidth, startHeight;

    let savedWidth = null;
    let savedHeight = null;
    let savedLeft = null;
    let savedTop = null;

    const closeBtn = grab.querySelector('.grab-btn');
    if (!win.classList.contains('no-noresize')) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '4px';

        const maximizeBtn = document.createElement('button');
        maximizeBtn.className = 'grab-btn';
        maximizeBtn.textContent = '□';

        maximizeBtn.addEventListener('click', () => {
            if (win.classList.contains('win-max')) {
                win.classList.remove('win-max');
                maximizeBtn.textContent = '□';

                if (savedWidth) win.style.width = savedWidth;
                if (savedHeight) win.style.height = savedHeight;
                if (savedLeft) win.style.left = savedLeft;
                if (savedTop) win.style.top = savedTop;
                showTopBar();   
            } else {
                savedWidth = win.style.width || window.getComputedStyle(win).width;
                savedHeight = win.style.height || window.getComputedStyle(win).height;
                savedLeft = win.style.left || window.getComputedStyle(win).left;
                savedTop = win.style.top || window.getComputedStyle(win).top;

                win.classList.add('win-max');
                win.style.width = '';
                win.style.height = '';
                win.style.left = '';
                win.style.top = '';
                maximizeBtn.textContent = '❐';
                hideTopBar();
            }
        });

        closeBtn.remove();
        buttonsContainer.appendChild(maximizeBtn);
        buttonsContainer.appendChild(closeBtn);

        grab.appendChild(buttonsContainer);
    } 

    grab.addEventListener("mousedown", (e) => {
        if (e.target.closest("button")) return;
        if (win.classList.contains('win-max')) return;

        dragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        win.style.zIndex = ++topZ;
    });

    if (resizeHandle && !win.classList.contains('no-resize')) {
        resizeHandle.addEventListener("mousedown", (e) => {
            resizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = win.offsetWidth;
            startHeight = win.offsetHeight;
            win.style.zIndex = ++topZ;
            e.preventDefault();
        });
    }

    document.addEventListener("mousemove", (e) => {
        if (dragging) {
            win.style.left = `${e.clientX - offsetX}px`;
            win.style.top = `${e.clientY - offsetY}px`;
        }

        if (resizing) {
            win.style.width =
                Math.max(startWidth + (e.clientX - startX), 200) + "px";
            win.style.height =
                Math.max(startHeight + (e.clientY - startY), 120) + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        dragging = false;
        resizing = false;
    });
});

//ventanas logica
//Config
/*Se dejo de usar:
dropdownConfigButton = document.getElementById("sysbtn-settings");

barConfigButton = document.getElementById("appbar-settings");
winConfig = document.getElementById("win_config");
closeConfig = document.getElementById("btn_config");

barConfigButton.addEventListener("click", () => {
    winConfig.style.height = "480px";
    winConfig.style.width = "700px";
    winConfig.classList.remove("hidden");
});

dropdownConfigButton.addEventListener("click", () => {
    winConfig.style.height = "480px";
    winConfig.style.width = "700px";
    winConfig.classList.remove("hidden");
});

closeConfig.addEventListener("click", () => {
    winConfig.classList.add("hidden");
});

//Notas
barNotesButton = document.getElementById("appbar-notes");
winNotes = document.getElementById("win_notes");
closeNotes = document.getElementById("btn_notes");

barNotesButton.addEventListener("click", () => {
    winNotes.style.height = "480px";
    winNotes.style.width = "700px";
    winNotes.classList.remove("hidden");
});

closeNotes.addEventListener("click", () => {
    winNotes.classList.add("hidden");
});

//Calc
barCalcButton = document.getElementById("appbar-calc");
winCalc = document.getElementById("win_calc");
closeCalc = document.getElementById("btn_calc");

barCalcButton.addEventListener("click", () => {
    winCalc.style.height = "480px";
    winCalc.style.width = "700px";
    winCalc.classList.remove("hidden");
});

closeCalc.addEventListener("click", () => {
    winCalc.classList.add("hidden");
});

Ahora se usa esto:*/
const customSizes = {
    settings: { width: '800px', height: '600px' },
    calc: { width: '310px', height: '480px' },
    calendar: { width: '470px', height: '610px'},
    toybox: { width: '800px', height: '480px'},
    weather: { width: '490px', height: '280px'},
    arcade: { width: '980px', height: '630px'}
};

// Estas son las excepciones para apps que no siguen el patron (mas o menos xD)
const windowExceptions = {
    settings: 'win_config'
};
const closeExceptions = { //esto es lo mismo q lo de arriba pero pal boton de cerrar
    settings: 'btn_config'
};

const defaultSize = { width: '700px', height: '480px' };

function initWindowManager() {
    const triggers = document.querySelectorAll('[id^="appbar-"], [id^="sysbtn-"], [id^="appcenter-"]');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const appName = trigger.id.replace('appbar-', '').replace('sysbtn-', '').replace('appcenter-', '');
            const windowId = windowExceptions[appName] || `win_${appName}`;
            const closeId = closeExceptions[appName] || `btn_${appName}`;
            const windowEl = document.getElementById(windowId);
            
            if (!windowEl) {
                showAlertBox("❌ Error",`No se ha encontrado la aplicacion: ${windowId}`);
                return;
            }
            
            const size = customSizes[appName] || defaultSize;
            
            windowEl.style.width = size.width;
            windowEl.style.height = size.height;
            windowEl.classList.remove('hidden');
            
            const closeBtn = document.getElementById(closeId);
            if (closeBtn && !closeBtn.dataset.listenerAdded) {
                closeBtn.addEventListener('click', () => {
                    windowEl.classList.add('hidden');
                });
                closeBtn.dataset.listenerAdded = 'true';
            }
        });
    });
}
//programas logica
//config
document.querySelectorAll(".settings-sidebar .tab").forEach(tab => {
    tab.addEventListener("click", () => {
        const id = tab.dataset.tab;
        document.querySelectorAll(".tab, .tab-content")
            .forEach(el => el.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(id).classList.add("active");
    });
});

function openSettingsTab(tabId) {
    const win = document.getElementById("win_config");
    win.style.height = "480px";
    win.style.width = "700px";
    win.classList.remove("hidden");
    win.style.zIndex = ++topZ;

    win.querySelectorAll(".tab, .tab-content")
        .forEach(el => el.classList.remove("active"));

    win.querySelector(`.tab[data-tab="${tabId}"]`)?.classList.add("active");
    win.querySelector(`#${tabId}`)?.classList.add("active");
}

//notes
//notes
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
        console.log(`Nota guardada como: ${finalFilename}`);
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
    console.log('Nueva nota creada');
});

/*notesOpenBtn.addEventListener('click', () => {
    //accion del boton de abrir ya abre files, no hay necesidad de esta funcion xD
});*/

//calc
let currentInput = '';
let previousInput = '';
let operation = null;

function calcinnum(value) {
    const display = document.getElementById('calcdisplay');
    if (value >= '0' && value <= '9' || value === '00' || value === '.') {
        if (value === '.' && currentInput.includes('.')) return;
        currentInput += value;
        display.value = currentInput;
        adjustRSize();
    } else if (value === '+' || value === '-' || value === '*' || value === '/') {
        if (currentInput === '') return;
        if (previousInput !== '') {
            calculate();
        }
        operation = value;
        previousInput = currentInput;
        currentInput = '';
    } else if (value === '=') {
        if (currentInput === '' || previousInput === '' || operation === null) return;
        calculate();
        operation = null
        previousInput = '';
    } else if (value === 'Clear') {
        currentInput = '';
        previousInput = '';
        operation = null;
        display.value = '';
        adjustRSize();
    } else if (value === 'Del') {
        currentInput = currentInput.slice(0, -1);
        display.value = currentInput;
        adjustRSize();
    } else if (value === 'Percent') {
        if (currentInput === '') return;
        currentInput = (parseFloat(currentInput) / 100).toString();
        display.value = currentInput;
        adjustRSize();
    }
}

function calculate() {
    const display = document.getElementById('calcdisplay');
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result = 0;

    switch(operation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = current !== 0 ? prev / current : "Cannot divide!";
            break;
    }

    currentInput = result.toString();
    display.value = currentInput;
    adjustRSize();

}

function adjustRSize() {
    const display = document.getElementById('calcdisplay');
    let fontSize = 34;

    display.style.fontSize = fontSize + 'px';

    while (display.scrollWidth > display.clientWidth && fontSize > 10) {
        fontSize--;
        display.style.fontSize = fontSize + 'px';
    }
}

//browser
const briframe = document.getElementById('browseriframe');
const brinput = document.getElementById('browserinput');

let historyStack = [];
let historyIndex = -1;

function normalizeURL(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
    }
    return url;
}

function browser_goto() {
    let url = brinput.value.trim();
    if (!url) return;

    url = normalizeURL(url);

    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex++;

    briframe.src = url;
}

function browser_prev() {
    if (historyIndex > 0) {
        historyIndex--;
        briframe.src = historyStack[historyIndex];
        brinput.value = historyStack[historyIndex];
    }
}

function browser_next() {
    if (historyIndex < historyStack.length -1) {
        historyIndex++;
        briframe.src = historyStack[historyIndex];
        brinput.value = historyStack[historyIndex];
    }
}

function browser_reload() {
    briframe.src = briframe.src;
}

briframe.addEventListener("load", () => {
    if (historyIndex >= 0) {
        brinput.value = historyStack[historyIndex];
    }
});

brinput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        browser_goto();
    }
});

//archivos
//La logica y funciones como tal para crear archivos y directorios y todo eso no estan aqui!! Aqui solo manejare cosas basicas de files, pero el sistema de archivos como tal sera parte del sistema y no una aplicacion por lo q aqui no estara:
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
}










//Calendar

function renderCalendar() {
    const monthYear = document.getElementById('calendar_monthYear');
    const days = document.getElementById('calendar_daysid');

    const month = actualDate.getMonth();
    const year = actualDate.getFullYear();

    monthYear.textContent = `${monthsNM[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const dayFormattedMonth = new Date(year, month + 1, 0).getDate();

    const dateToday = new Date();
    const sameMonth = dateToday.getMonth() === month && dateToday.getFullYear() === year;

    days.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const dayEmpty = document.createElement('div');
        dayEmpty.className = 'calendar_day empty';
        days.appendChild(dayEmpty);
    }

    for (let day = 1; day <= dayFormattedMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar_day';

        if (sameMonth && day === dateToday.getDate()) {
            dayElement.classList.add('today');
        }

        const keyStarred = `${year}-${month}-${day}`;

        dayElement.innerHTML = `
            <span class="calendar_day-number">${day}</span>
            ${StarredDates.has(keyStarred) ? '<span class="calendar_star">⭐</span>' : ''}
        `;

        dayElement.onclick = () => toggleStar(year, month, day);

        days.appendChild(dayElement);
    }
}

function toggleStar(year, month, day) {
    const key = `${year}-${month}-${day}`;

    if (StarredDates.has(key)) {
        StarredDates.delete(key);
    } else {
        StarredDates.add(key);
    }

    renderCalendar();
}

function changeMonth(direction) {
    actualDate.setMonth(actualDate.getMonth() + direction);
    renderCalendar();
}



//terminal
const terminalInput = document.getElementById('terminalin');
const terminalPrint = document.getElementById('terminalprint');

terminalInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const userCommand = terminalInput.value;
        terminalPrint.innerHTML += `<p>> ${userCommand}</p>`;
        
        if (userCommand === 'help') {
            terminalPrint.innerHTML += `
            <p>Comandos disponibles:</p>
            <p>help: muestra esta ayuda</p>
            <p>clear: limpia la terminal</p>
            <p>neofetch: muestra informacion del sistema</p>
            <p>whoami: muestra el username y hostname</p>
            <p>crashtest: inicia un crasheo de prueba</p>
            `;
        } else if (userCommand === 'clear') {
            terminalPrint.innerHTML = '';
        } else if (userCommand === 'neofetch') {
            terminalPrint.innerHTML += `
            <p>⠀⢸⠂⠀⠀⠀⠘⣧⠀⠀⣟⠛⠲⢤⡀⠀⠀⣰⠏⠀⠀⠀⠀⠀⢹⡀    </p>
            <p>⠀⡿⠀⠀⠀⠀⠀⠈⢷⡀⢻⡀⠀⠀⠙⢦⣰⠏⠀⠀⠀⠀⠀⠀⢸⠀    </p>
            <p>⠀⡇⠀⠀⠀⠀⠀⠀⢀⣻⠞⠛⠀⠀⠀⠀⠻⠀⠀⠀⠀⠀⠀⠀⢸⠀     NyxPaw OS</p>
            <p>⠀⡇⠀⠀⠀⠀⠀⠀⠛⠓⠒⠓⠓⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀     Therian Edition</p>
            <p>⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠀      1.0.0</p>
            <p>⠀⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⠀⠀⢀⡟⠀     </p>
            <p>⠀⠘⣇⠀⠘⣿⠋⢹⠛⣿⡇⠀⠀⠀⠀⣿⣿⡇⠀⢳⠉⠀⣠⡾⠁⠀   OS-Type = 64Bits</p>
            <p>⣦⣤⣽⣆⢀⡇⠀⢸⡇⣾⡇⠀⠀⠀⠀⣿⣿⡷⠀⢸⡇⠐⠛⠛⣿⠀   Kernel: NekoKS 1.0 (Linux Based)</p>
            <p>⠹⣦⠀⠀⠸⡇⠀⠸⣿⡿⠁⢀⡀⠀⠀⠿⠿⠃⠀⢸⠇⠀⢀⡾⠁    CPU: Intel Core i7-11800H</p>
            <p>⠀⠈⡿⢠⢶⣡⡄⠀⠀⠀⠀⠉⠁⠀⠀⠀⠀⠀⣴⣧⠆⠀⢻⡄⠀⠀    RAM: 16GB</p>
            <p>⠀⢸⠃⠀⠘⠉⠀⠀⠀⠠⣄⡴⠲⠶⠴⠃⠀⠀⠀⠉⡀⠀⠀⢻⡄⠀   Storage: 1TB</p>
            <p>⠀⠘⠒⠒⠻⢦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⠞⠛⠒⠛⠋⠁   ⠀</p>
            <p>⠀⠀⠀⠀⠀⠀⠸⣟⠓⠒⠂⠀⠀⠀⠀⠀⠈⢷⡀⠀⠀⠀⠀⠀⠀     ⠀Based on NyxPaw OS</p>
            <p>⠀⠀⠀⠀⠀⠀⠀⠙⣦⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⠀⠀⠀⠀⠀⠀      ⠀Made by Nyx_waoss</p>
            <p>⠀⠀⠀⠀⠀⠀⠀⣼⣃⡀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣆⠀⠀⠀⠀⠀      ⠀</p>
            <p>⠀⠀⠀⠀⠀⠀⠀⠉⣹⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⠀⠀⠀⠀⠀      ⠀Hostname: device</p>
            <p>⠀⠀⠀⠀⠀⠀⠀⠀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡆⠀⠀⠀      ⠀⠀Username: user</p>
            <p>-----------------------------------------------------------------------</p>
            `;
        } else if (userCommand === 'whoami') {
            terminalPrint.innerHTML += `
            <p>user@device</p>
            `;
        } else if (userCommand === 'shutdown') {
            terminalPrint.innerHTML += '<p>Apagando NyxPaw...</p>';
            sysshutdown();
        } else if (userCommand === 'crashtest') {
            sysBsod('U-UCS-TCM', 'Crash test initiated by user');
        } else {
            terminalPrint.innerHTML += '<p>El comando "' + userCommand + '" no existe como comando valido!</p>';
        }
        terminalInput.value = '';
        /*terminalPrint.innerHTML += '   <br>';*/
    }
});

//Toybox
let toyboxBlurLevelSelect = document.getElementById('toyboxBlurLevelSelect').value;
toyboxBlurLevelSelect = '100';
let toyboxCursorTail = document.getElementById('toyboxCursorTail').checked;
let toyboxCursorTailIcon = document.getElementById('toyboxCursorTailIcon').value;
let toyboxCursorTailSize = 30;
let cursorTailFX;
let toyboxSecretWallpaper = document.getElementById('toyboxSecretWallpaper').checked;

function toyboxGotoTab(tabid) {
    const toyboxTabs = document.getElementsByClassName('toyboxTab');
    for (let i = 0; i < toyboxTabs.length; i++) {
        toyboxTabs[i].classList.add('hidden');
    }
    document.getElementById(tabid).classList.remove('hidden');
}

function toyboxFXSet() {
    toyboxBlurLevelSelect = document.getElementById('toyboxBlurLevelSelect').value;
    toyboxCursorTail = document.getElementById('toyboxCursorTail').checked;
    toyboxCursorTailIcon = document.getElementById('toyboxCursorTailIcon').value;
    toyboxCursorTailSize = document.getElementById('toyboxCursorTailSize').value;
    toyboxSecretWallpaper = document.getElementById('toyboxSecretWallpaper').checked;

    console.log('toyboxCursorTail:', toyboxCursorTail);
    console.log('toyboxCursorTailIcon:', toyboxCursorTailIcon);
    console.log('toyboxCursorTailSize:', toyboxCursorTailSize)

    if (toyboxBlurLevelSelect === '0') {
        sysBlurSetto(0);
    } else if (toyboxBlurLevelSelect === '50') {
        sysBlurSetto(0.5);
    } else if (toyboxBlurLevelSelect === '100') {
        sysBlurSetto(1);
    } else if (toyboxBlurLevelSelect === '150') {
        sysBlurSetto(1.5);
    } else if (toyboxBlurLevelSelect === '200') {
        sysBlurSetto(2);
    } else {
        showAlertBox('❌ Error','Error al establecer! Valor recibido: ' + toyboxBlurLevelSelect);
    }

    if (cursorTailFX) {
        console.log('Removing previous cursor queue listener');
        document.removeEventListener('mousemove', cursorTailFX);
    }

    cursorTailFX = (e) => {
        const cursorTailElement = document.createElement('div');
        cursorTailElement.textContent = toyboxCursorTailIcon;
        cursorTailElement.style.position = 'fixed';
        cursorTailElement.style.left = e.clientX + 'px';
        cursorTailElement.style.top = e.clientY + 'px';
        cursorTailElement.style.fontSize = toyboxCursorTailSize + 'px';
        cursorTailElement.style.pointerEvents = 'none';
        cursorTailElement.style.zIndex = '999999';
        document.body.appendChild(cursorTailElement);
        setTimeout(() => cursorTailElement.remove(), 1000);
    };

    if (toyboxCursorTail) {
        console.log('Adding cursor queue listener');
        document.addEventListener('mousemove', cursorTailFX);
    } else {
        console.log('Cursor queue checkbox is not checked');
    }

    if (toyboxSecretWallpaper) {
        document.body.style.backgroundImage = "url('https://i.pinimg.com/originals/42/73/e5/4273e565fa7ad19b4e3ba170bb9a85b2.jpg')";
    } else {
        document.body.style.backgroundImage = "url('assets/wallpaper.jpg')";
    }
}

async function toyboxFXReset() {
    const confirmResetFX = await showMsgBox("ℹ️ Informacion","Quieres restablecer los efectos visuales a los valores predeterminados?", "Confirmar", "Cancelar");
    if (confirmResetFX) {
        sysBlurSetto(1);
        document.removeEventListener('mousemove', cursorTailFX);
        toyboxCursorTail.checked = false;
    }  
}
//document.body.style.backgroundImage = "url('https://i.pinimg.com/originals/42/73/e5/4273e565fa7ad19b4e3ba170bb9a85b2.jpg')";
/*Video Player*/
const videoPlayerAskBtnConfirm = document.getElementById('askForVideoFile-btn_save');
const videoPlayerAskBtnCancel = document.getElementById('askForVideoFile-btn_cancel');
const videoPlayerAskClose = document.getElementById('btn_askForVideoFile');
const videoPlayerFileSelector = document.getElementById('nyxvideoplayer_openFilePrompt');
const videoPlayerPlayer = document.getElementById('nyxvideoplayer_player');
const videoPlayerWindowSelect = document.getElementById('win_askForVideoFile');

let videoPlayerSelectedFile = null;
let videoPlayerCurrentURL = null;

videoPlayerFileSelector.addEventListener('change', function(e) {
    videoPlayerSelectedFile = e.target.files[0];
});

videoPlayerAskBtnConfirm.addEventListener('click', function() {
    if (videoPlayerSelectedFile) {
        if (videoPlayerCurrentURL) {
            URL.revokeObjectURL(videoPlayerURLVid);
        }
        const videoPlayerURLVid = URL.createObjectURL(videoPlayerSelectedFile);
        videoPlayerPlayer.src = videoPlayerURLVid;

        videoPlayerCurrentURL = videoPlayerURLVid;

        videoPlayerSelectedFile = null;
        videoPlayerWindowSelect.classList.add('hidden');
    }
});

videoPlayerPlayer.addEventListener('ended', () => {
    if (videoPlayerCurrentURL) {
        URL.revokeObjectURL(videoPlayerCurrentURL);
        videoPlayerCurrentURL = null;
    }
});

videoPlayerAskBtnCancel.addEventListener('click', () => {
    videoPlayerSelectedFile = null;
    videoPlayerFileSelector.value = '';
    videoPlayerWindowSelect.classList.add('hidden');
});

videoPlayerAskClose.addEventListener('click', () => {
    videoPlayerWindowSelect.classList.add('hidden');
});

/*IMG Viewer*/
const imageViewerAskBtnConfirm = document.getElementById('askForImageFile-btn_save');
const imageViewerAskBtnCancel = document.getElementById('askForImageFile-btn_cancel');
const imageViewerAskClose = document.getElementById('btn_askForImageFile');
const imageViewerFileSelector = document.getElementById('nyximageviewer_openFilePrompt');
const imageViewerPlayer = document.getElementById('nyximageviewer_player');
const imageViewerWindowSelect = document.getElementById('win_askForImageFile');

let imageViewerSelectedFile = null;
let imageViewerCurrentURL = null;

imageViewerFileSelector.addEventListener('change', function(e) {
    imageViewerSelectedFile = e.target.files[0];
});

imageViewerAskBtnConfirm.addEventListener('click', function() {
    if (imageViewerSelectedFile) {
        if (imageViewerCurrentURL) {
            URL.revokeObjectURL(imageViewerURLVid);
        }
        const imageViewerURLVid = URL.createObjectURL(imageViewerSelectedFile);
        imageViewerPlayer.src = imageViewerURLVid;

        imageViewerCurrentURL = imageViewerURLVid;

        imageViewerSelectedFile = null;
        imageViewerWindowSelect.classList.add('hidden');
    }
});

imageViewerPlayer.addEventListener('ended', () => {
    if (imageViewerCurrentURL) {
        URL.revokeObjectURL(imageViewerCurrentURL);
        imageViewerCurrentURL = null;
    }
});

imageViewerAskBtnCancel.addEventListener('click', () => {
    imageViewerSelectedFile = null;
    imageViewerFileSelector.value = '';
    imageViewerWindowSelect.classList.add('hidden');
});

imageViewerAskClose.addEventListener('click', () => {
    imageViewerWindowSelect.classList.add('hidden');
});

//nytclient
nytClientURL = document.getElementById('nytclienturlin');
nytClientIframe = document.getElementById('nytclientiframe');

function nytclient_reload() {
    nytClientIframe.src = nytClientIframe.src;
}

function nytclient_goto() {
    nytClientIframe.src = 'https://www.youtube.com/embed/' + nytClientURL + '?si=M5iHYtQr5FPUWMMO';

}

//nyxpawstore
/*function nyxPawStoreOpenTab(tabid) {
    const nyxpawstoreTabs = document.getElementsByClassName('nyxpawstoreTab');
    for (let i = 0; i < toyboxTabs.length; i++) {
        toyboxTabs[i].classList.add('hidden');
    }
    document.getElementById(tabid).classList.remove('hidden');
} FUNCION NO USADA*/
let nyxpawstoreCurrentApp = "";
let nyxpawstoreAppID = "appcenter-";
let nyxpawstoreTranslatedApp = nyxpawstoreCurrentApp;

const nyxpawstoreAppTranslation = {
    "clima":"weather",
    "arcade":"arcade"
}

const nyxpawstoreAppsInfo = {
    Arcade: "Estas aburrido? Pues esto ya no sera un problema, porque con NyxPaw Arcade podras difrutar de juegos HTML compatibles con NyxPawOS!! NyxPaw Arcade utiliza servicios externos, pero los juegos disponibles son verificados para asegurar una buena experiencia de usuario, con una interfaz simple y amigable",
    Clima: "Mira el clima y la temperatura local :D"
};

const nyxpawstoreMainMenu = document.getElementById('nyxpawstore_mainmenu');
const nyxpawstoreAppMenu = document.getElementById('nyxpawstore_apptab');

const nyxpawstoreAppMenuIcon = document.getElementById('nyxpawstore_appicon');
const nyxpawstoreAppMenuTitle = document.getElementById('nyxpawstore_appname');
const nyxpawstoreAppMenuInfo = document.getElementById('nyxpawstore_appinfo');

const nyxpawstoreGetBtn = document.getElementById('nyxpawstore_getbtn');

function nyxPawStoreOpenTab(appname, icon) {
    nyxpawstoreGetBtn.textContent = "Descargar";

    nyxpawstoreCurrentApp = appname;
    nyxpawstoreAppMenu.classList.remove('hidden');
    nyxpawstoreMainMenu.classList.add('hidden');

    nyxpawstoreAppMenuIcon.src = icon;
    nyxpawstoreAppMenuTitle.textContent = appname;
    nyxpawstoreAppMenuInfo.textContent = nyxpawstoreAppsInfo[appname];

    if (appDownloaded.includes(appname)) {
        nyxpawstoreGetBtn.textContent = "Delete";
    } else {
        nyxpawstoreGetBtn.textContent = "Descargar";
    }
}

function nyxPawStoreBackToMenu() {
    nyxpawstoreCurrentApp = "";
    nyxpawstoreAppMenu.classList.add('hidden');
    nyxpawstoreMainMenu.classList.remove('hidden');
}

function nyxPawStoreGetApp() {
    nyxpawstoreTranslatedApp = nyxpawstoreAppTranslation[nyxpawstoreCurrentApp.toLowerCase()] || nyxpawstoreCurrentApp.toLowerCase();
    nyxpawstoreAppID = "appcenter-" + nyxpawstoreTranslatedApp;
    console.log(nyxpawstoreAppID);

    if (appDownloaded.includes(nyxpawstoreCurrentApp)) {
        console.log('Delete');
        appDownloaded = appDownloaded.filter(x => x !== nyxpawstoreCurrentApp);
        document.getElementById(nyxpawstoreAppID).classList.add('hidden');
    } else {
        console.log('Get App');
        appDownloaded.push(nyxpawstoreCurrentApp);
        document.getElementById(nyxpawstoreAppID).classList.remove('hidden');
    }

    nyxpawstoreGetBtn.textContent = "Verificando...";

    setTimeout(() => {
        if (appDownloaded.includes(nyxpawstoreCurrentApp)) {
            nyxpawstoreGetBtn.textContent = "Delete";
        } else {
            nyxpawstoreGetBtn.textContent = "Descargar";
        }
    }, 700);
}
























/*funciones del sistema*/
const askForPasswordWin = document.getElementById('win_askforuserspassword');
const loginscrLoginText = document.getElementById('loginscr_logintext');
const loginscr = document.getElementById('loginscr');
let loginin_user = '';

async function sysshutdown() {
    const confirmSysShutdown = await showMsgBox("⚠️ Advertencia!","Quieres apagar el sistema? Asegurate de guardar tus datos", "Apagar", "Cancelar");
    if (confirmSysShutdown) {
        hideTopBar();
        hideAppBar();
        setTimeout(() => {
            document.body.classList.add("hidden");
            const sysScripts = document.querySelectorAll('script');
            sysScripts.forEach(script => script.parentNode.removeChild(script));
        }, 2500);
        
    }
}

async function sysrestart() {
    const confirmSysRestart = await showMsgBox("⚠️ Advertencia!","Quieres reiniciar el sistema? Asegurate de guardar tus datos", "Reiniciar", "Cancelar");
    if (confirmSysRestart) {
        hideTopBar();
        hideAppBar();
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2700);   
    }
}
/*
function showSysinfo(inTabId) {
    showSysinfo(inTabId)

}*/

function showappinfo() {
    showAlertBox("⚠️ Advertencia!","No hay informacion de la aplicacion actual");
}

function hideTopBar() {
    const topBar = document.getElementById('top_bar');
    topBar.style.transform = 'translateY(-100%)';
}

function showTopBar() {
    const topBar = document.getElementById('top_bar');
    topBar.style.transform = 'translateY(0)';
}

function hideAppBar() {
    const appBar = document.getElementById('appbar');
    appBar.style.transform = 'translateX(-100vw)';
}

function showAppBar() {
    const appBar = document.getElementById('appbar');
    appBar.style.transform = 'translateX(0)';
}

function sysAskLoginPassword(user) {
    loginin_user = user;
    const userData = sysUsers[loginin_user];
    if (!sysUsers[loginin_user]) {
        sysBsod('X-USR-NUL', 'Attempted access to a non-existent user! This error should not occur unless system files have been modified... you hacker!')
    }

    const userDiv = document.querySelector(`[data-username="${user}"]`);
    const loginText = userDiv.querySelector('.loginscr_logintext');
    loginText.textContent = 'Iniciando sesion...';

    if (userData.password === '') {
        setTimeout(() => {
            loginscr.classList.add('hidden');
            showAppBar();
            showTopBar();
        }, 700);
    } else {
        askForPasswordWin.classList.remove('hidden');
        askForPasswordWin.style.zIndex = 9005;
    }
}

function sysclosesesion() {
    hideAppBar();
    hideTopBar();
    setTimeout(() => {
        const allLoginTexts = document.querySelectorAll('.loginscr_logintext');
        allLoginTexts.forEach(text => {
            text.textContent = 'Iniciar sesion';
        });
        
        loginscr.classList.remove('hidden');
        loginscrPassInput.value = '';
    }, 400);
}

const loginscrBtnLogin = document.getElementById('loginscr-btn_login');
const loginscrBtnCancel = document.getElementById('loginscr-btn_cancel');
const loginscrPassInput = document.getElementById('loginscr_passwordinput');

loginscrBtnCancel.addEventListener('click', () => {
    const userDiv = document.querySelector(`[data-username="${loginin_user}"]`);
    const loginText = userDiv.querySelector('.loginscr_logintext');

    askForPasswordWin.classList.add('hidden');
    loginText.textContent = 'Iniciar sesion';
});

loginscrBtnLogin.addEventListener('click', () => {
    if (!sysUsers[loginin_user]) {
        sysBsod('X-USR-NUL', 'Attempted access to a non-existent user! This error should not occur unless system files have been modified... you hacker!')
    }

    const userData = sysUsers[loginin_user];

    const userDiv = document.querySelector(`[data-username="${loginin_user}"]`);
    const loginText = userDiv.querySelector('.loginscr_logintext');

    if (loginscrPassInput.value === userData.password) {
        askForPasswordWin.classList.add('hidden');
        setTimeout(() => {
            loginscr.classList.add('hidden');
            showAppBar();
            showTopBar();
            loginText.textContent = 'Iniciar sesion';
            loginscrPassInput.value = '';
        }, 700);
    } else {
        askForPasswordWin.classList.add('hidden');
        loginText.textContent = 'Contraseña incorrecta!';
    }

    
    
});

function sysCreateUser(username, displayName, password) {
    if (sysUsers[username]) {
        return {success: false, message: 'El usuario ya existe'};
    }

    if (!username || !password) {
        return {success: false, message: 'Ingrese la contraseña y el usuario!'};
    }

    sysUsers[username] = {
        displayName: displayName || username,
        password: password,
        createdAt: Date.now()
    };

    addUserToLoginScreen(username);

    return {success: true, message: 'Usuario creado'};
}

function addUserToLoginScreen(username) {
    const user = sysUsers[username];
    const loginScreen = document.getElementById('loginscr');

    const userDiv = document.createElement('div');
    userDiv.className = 'loginscr_account';
    userDiv.setAttribute('data-username', username);
    userDiv.onclick = () => sysAskLoginPassword(username);

    userDiv.innerHTML = `
        <i class="fi fi-ss-user"></i>
        <div class="loginscr_texts">
            <p>${user.displayName}</p>
            <p class="loginscr_logintext">Iniciar sesion</p>
        </div>
    `;

    loginScreen.appendChild(userDiv);
}

function deleteUser(username) {
    if (Object.keys(sysUsers).length === 1) {
        return {success: false, message: 'No puedes eliminar el ultimo usuario'};
    }
    
    if (username === loginin_user && !loginscr.classList.contains('hidden')) {
        return {success: false, message: 'No puedes eliminar el usuario logueado!'};
    }

    delete sysUsers[username];

    const userDiv = document.querySelector(`[data-username="${username}"]`);
    if (userDiv) {
        userDiv.remove();
    }

    return {success: true, message: 'Usuario borrado'};
}

function changePassword(username, oldPassword, newPassword) {
    const user = sysUsers[username];

    if (!user) {
        return {success: false, message: 'Usuario no encontrado!'};
    }

    if (user.password !== oldPassword) {
        return {success: false, message: 'Contraseña actual incorrecta!'};
    }

    if (!newPassword || newPassword.length < 4) {
        return {success: false, message: 'La contraseña debe tener minimo 4 caracteres!'};
    }

    user.password = newPassword;

    return {success: true, message: 'Contraseña cambiada'};
}

function changeDisplayName(username, newDisplayName) {
    const user = sysUsers[username];

    if (!user) {
        return {success: false, message: 'Usuario no encontrado!'};
    }

    if (!newDisplayName || newDisplayName.trim() === '') {
        return {success: false, message: 'El nombre no puede estar vacio!'};
    }

    user.displayName = newDisplayName;

    const userDiv = document.querySelector(`[data-username="${username}"]`);
    if (userDiv) {
        const nameElement = userDiv.querySelector('p:first-child');
        nameElement.textContent = newDisplayName;
    }

    return {success: true, message: 'Nombre cambiado!'};
}

function addUserCardToSettings(username) {
    const user = sysUsers[username];
    const container = document.getElementById('settings-users-container');

    const userCard = document.createElement('div');
    userCard.className = 'settings_usercard uisetting';
    userCard.setAttribute('data-username', username);

    userCard.innerHTML = `
        <i class="fi fi-ss-user"></i>
        <p>${user.displayName}</p>
        <div style="display: flex; flex-direction: row; gap: 6px;">
            <button class="btn settings-btn-deleteuser" data-username="${username}">✖</button>
            <button class="btn settings-btn-changepass" data-username="${username}">✐ Contraseña</button>
            <button class="btn settings-btn-changename" data-username="${username}">✐ Nombre</button>
        </div>
    `;

    container.appendChild(userCard);
}

function refreshUserCards() {
    const container = document.getElementById('settings-users-container');
    container.innerHTML = '';

    for (let username in sysUsers) {
        addUserCardToSettings(username);
    }
}

async function settingsDeleteUser(username) {
    const confirmDelete = await showMsgBox("ℹ️ Informacion",`¿Eliminar el usuario "${username}"?`,'Eliminar', 'Cancelar');
    if (confirmDelete) {
        const result = deleteUser(username)
        if (result.success) {
            const userCard = document.querySelector(`.settings_usercard[data-username="${username}"]`);
            if (userCard) {
                userCard.remove();
            }
            showAlertBox('✅ Tarea completada','Usuario eliminado');
        } else {
            showAlertBox('❌ Error','Error al eliminar usuario: ' + result.message);
        }
    }
}

async function settingsChangePassword(username) {
    const user = sysUsers[username];

    const oldPass = await showPromptMsgBox('Cambiar contraseña ● ○ ○', `Contraseña actual de ${user.displayName}`, 'Siguiente', 'Cancelar');
    if (!oldPass.confirmed || !oldPass.value) return;

    const newPass = await showPromptMsgBox('Cambiar contraseña ○ ● ○', 'Contraseña nueva', 'Siguiente', 'Cancelar');
    if (!newPass.confirmed || !newPass.value) return;

    const confirmPass = await showPromptMsgBox('Cambiar contraseña ○ ○ ●', 'Confirmar contraseña', 'Confirmar', 'Cancelar');
    if (!confirmPass.confirmed || !confirmPass.value) return;
    if (confirmPass.value !== newPass.value) {
        showAlertBox('❌ Error','Las contraseñas no coinciden');
        return;
    }

    const result = changePassword(username, oldPass.value, newPass.value);
    showAlertBox('ℹ️ Informacion',result.message);
}

async function settingsChangeDisplayName(username, newName) {
    const user = sysUsers[username];

    const newDSName = await showPromptMsgBox('Cambiar nombre', `Nuevo nombre para ${user.displayName}`, 'Confirmar', 'Cancelar');
    if (!newDSName.confirmed || !newDSName.value) return;

    const result = changeDisplayName(username, newDSName.value);

    if (result.success) {
        const userCard = document.querySelector(`.settings_usercard[data-username="${username}"]`);
            if (userCard) {
                const nameElement = userCard.querySelector('p');
                nameElement.textContent = newDSName.value;
            }
            showAlertBox('ℹ️ Informacion',result.message);
    } else {
        showAlertBox('ℹ️ Informacion',result.message);
    }
}

const usersContainer = document.getElementById('settings-users-container');
usersContainer.addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('settings-btn-deleteuser')) {
        const username = target.getAttribute('data-username');
        settingsDeleteUser(username);
    }
    if (target.classList.contains('settings-btn-changepass')) {
        const username = target.getAttribute('data-username');
        settingsChangePassword(username);
    }
    if (target.classList.contains('settings-btn-changename')) {
        const username = target.getAttribute('data-username');
        settingsChangeDisplayName(username);
    }

});

const sysaskfornewuserdataBtnLogin = document.getElementById('sysaskfornewuserdata-btn_login');
const sysaskfornewuserdataBtnCancel = document.getElementById('sysaskfornewuserdata-btn_cancel');
const winSysAskForNewUserData = document.getElementById('win_sysaskfornewuserdata');

const settingsNewuserUsernameinput = document.getElementById('settings_newuser_usernameinput');
const settingsNewuserDisplaynameinput = document.getElementById('settings_newuser_displaynameinput');
const settingsNewuserPasswordinput = document.getElementById('settings_newuser_passwordinput');

function sysAskForNewUserData() {
    winSysAskForNewUserData.classList.remove('hidden');
    winSysAskForNewUserData.style.height = '460px';
    winSysAskForNewUserData.style.width = '440px';
}

sysaskfornewuserdataBtnCancel.addEventListener('click', () => {
    winSysAskForNewUserData.classList.add('hidden');
});

sysaskfornewuserdataBtnLogin.addEventListener('click', () => {
    sysCreateUser(settingsNewuserUsernameinput.value, settingsNewuserDisplaynameinput.value, settingsNewuserPasswordinput.value);
    refreshUserCards();
    winSysAskForNewUserData.classList.add('hidden');
});






 

/*
<div class="window hidden no-resize" id="win_askforuserspassword">
        <div class="grab">
            <span class="grab-title">Iniciar sesion</span>
            <button class="grab-btn" id="btn_askforuserspassword">X</button>
        </div>

        <div class="win_content content_askforuserspassword">
            <p>Ingrese la contraseña para user</p>
            <input type="text" id="loginscr_passwordinput" placeholder="Contraseña...">
            <div id="loginscr-btnsdiv">
                <button id="loginscr-btn_login" class="files-btnstyled">Ingresar</button>
                <button id="loginscr-btn_cancel" class="files-btnstyled">Cancelar</button>
            </div>
        </div>
        <div class="resize-handle"></div>
    </div>
*/

appsLabel = document.getElementById('app-labels');
document.querySelectorAll(".appbar-app").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
        const rect = btn.getBoundingClientRect();
        appsLabel.textContent = btn.querySelector("img").alt;
        appsLabel.style.left = rect.right + 8 + "px";
        appsLabel.style.top = rect.top + rect.height / 2 + "px";
        appsLabel.style.opacity = "1";
        appsLabel.style.transform = "translateY(-50%)";
    });
    btn.addEventListener("mouseleave", () => {
        appsLabel.style.opacity = "0";
    });
});

//appcenter
const appCenterClsBtn = document.getElementById('appcenterclose');
const appCenterWindow = document.getElementById('win_appcenter');
appCenterClsBtn.addEventListener('click', () => {
    appCenterWindow.classList.add('hidden');
});

function hideappcenter() {
    appCenterWindow.classList.add('hidden');
}

function sysBlurSetto(blurlevel) {
    document.documentElement.style.setProperty('--blur-multiplier', blurlevel);
}





try {
    const criticalChecks = {
        'file-list': document.getElementById('file-list'),
        'top_bar': document.getElementById('top_bar'),
        'appbar': document.getElementById('appbar'),
        'bsod': document.getElementById('bsod'),
        'msg-box': document.getElementById('msg-box')
    };
    
    for (const [name, element] of Object.entries(criticalChecks)) {
        if (!element) {
            throw new Error(`Critical element missing: ${name}`);
        }
    }
    
    const testKey = '__system_test__';
    localStorage.setItem(testKey, 'test');
    if (localStorage.getItem(testKey) !== 'test') {
        throw new Error('localStorage is not functioning correctly');
    }
    localStorage.removeItem(testKey);
    
    //esta variable se establece hasta el final, de esta forma en caso de que algo en el script falle, la variable no se inicializa y eso significa que hay algun error:
    sysScriptIsOK = true;
    
} catch (e) {
    sysBsod('X-DOM-CRT','System check failed! SystemUI initialization failed, DOM elements missing: ' + e.message + ' System cannot continue.');
}

/*
Errores de bsod:
X-SYS-CRP: Archivos corruptos
X-DOM-CRT: Elementos criticos no inicializados
X-FSI-FTI: Fallo al inicializar el fs
X-USR-NUL: Se intento acceder a un usuario inexistente

*/