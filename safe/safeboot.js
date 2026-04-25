let currentIdx = 0;
let currentMenu = 'main';
let askForDeleteData = false;
let filesDel = null;
const info = document.getElementById('description');

const mainMenu = document.getElementById('mainMenu');
const advancedMenu = document.getElementById('advancedMenu');

const descriptions = {
    boot: 'Try to boot normally',
    safe: 'Boot with safe mode enabled',
    format: 'Format ALL your data and files',
    advanced: 'Advanced options',

    //advanced:
    back: 'Go back to the previous menu',
    formatbutfiles: 'Format all system data but keep your files and programs',
    diag: 'Run a diagnostic and check what files and configurations are broken',
    off: 'Turn off the computer'
}



/*Sys */
function makeDiag() {
    document.getElementById('title').textContent = 'Diagnostic';
    document.getElementById('toptext').textContent = 'Checking system...\n░░░░░░░░░░░░░';

    const errored = [];

    errored.push('System Diagnostic is running:');
    errored.push('-----------------------------------');

    const sessionAutoStart = localStorage.getItem('sessionAutoStart');
    if (sessionAutoStart) {
        try {
            const SASArray = JSON.parse(sessionAutoStart);
            if (!SASArray.includes('input')) {
                errored.push('sessionAutoStart is invalid: input not found');
            }
            if (!SASArray.includes('UI')) {
                errored.push('sessionAutoStart is invalid: UI not found');
            }
            if (!SASArray.includes('audio')) {
                errored.push('sessionAutoStart is invalid: AUDIO not found');
            }
            if (!SASArray.includes('programs')) {
                errored.push('sessionAutoStart is invalid: programs not found');
            }
            if (!SASArray.includes('session')) {
                errored.push('sessionAutoStart is invalid: session not found');
            }
        } catch(error) {
            errored.push('sessionAutoStart is invalid: '+error.message);
        }
    } else {
        errored.push('[ERROR] sessionAutoStart does not exist');
    }

    errored.push('-----------------------------------');

    const SysRegConfig = localStorage.getItem('SysRegConfig');
    if (SysRegConfig) {
        errored.push('[INFO] SysRegConfig: '+SysRegConfig);
    } else {
        errored.push('[ERROR] SysRegConfig does not exist');
    }

    errored.push('-----------------------------------');
    errored.push('Report Finished');

    document.getElementById('toptext').textContent = errored.join('\n');
}


function confirmDelete() {
    if (askForDeleteData) {
        askForDeleteData = false;
        if (filesDel === 'all') {
            document.getElementById('toptext').textContent = 'Preparing...\n░░░░░░░░░░░░░';
            setTimeout(() => {
                document.getElementById('toptext').textContent = 'Deleting files...\n█████░░░░░░░░';
                localStorage.clear();
                indexedDB.deleteDatabase("NeptuneFS");
                setTimeout(() => {
                    document.getElementById('toptext').textContent = 'Reinstalling files...\n██████████░░░';
                    setTimeout(() => {
                        document.getElementById('toptext').textContent = 'Restarting...\n█████████████';
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000)
                    }, 1000)
                }, 2000)
            }, 1000)
        } else {
            document.getElementById('toptext').textContent = 'Preparing...\n░░░░░░░░░░░░░';
            setTimeout(() => {
                document.getElementById('toptext').textContent = 'Deleting files...\n█████░░░░░░░░';
                /*localStorage.removeItem('SysRegConfig');
                localStorage.removeItem('sessionAutoStart');*/
                setTimeout(() => {
                    document.getElementById('toptext').textContent = 'Reinstalling files...\n██████████░░░';

                    /*localStorage.setItem('SysRegConfig', '{"format24h":false,"lockedSession":false,"windowManager0":true,"disableJSload":false,"devMode":false,"currenttheme":"dark"}');
                    localStorage.setItem('sessionAutoStart', '["input","UI","audio","programs","session"]');*/

                    setTimeout(() => {
                        document.getElementById('toptext').textContent = 'Restarting...\n█████████████';
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000)
                    }, 1000)
                }, 2000)
            }, 1000)
        }
    }
}

function formatSystem(wftf) {
    if (wftf === 'all') {
        askForDeleteData = true;
        filesDel = 'all';
        document.getElementById('title').textContent = 'Format all files';
        document.getElementById('toptext').textContent = 'WARNING! All your files will be permanently deleted. Press ESC to go back.\nPress "Supr" or "DEL" key on your keyboard to confirm formatting';
    } else {
        askForDeleteData = true;
        filesDel = 'sys';
        document.getElementById('title').textContent = 'Format system files';
        document.getElementById('toptext').textContent = 'WARNING! All your configurations will be permanently deleted, but your files and programs will remain intact. Press ESC to go back.\nPress "Supr" or "DEL" key on your keyboard to confirm formatting';
    }
}



/*Base: */

function getCurrentItems() {
    if (currentMenu === 'main') {
        return mainMenu.querySelectorAll('.item');
    } else if (currentMenu === 'advanced') {
        return advancedMenu.querySelectorAll('.item');
    } else {
        document.getElementById('toptext').textContent = 'Recovery menu ran into a problem, please restart the computer.';
    }
}

function selectItem(idx) {
    currentIdx = idx;
    updateSel();
}

function activateItem(idx) {
    currentIdx = idx;
    updateSel();
    
    const items = getCurrentItems();
    const value = items[idx].getAttribute('data-value');
    handleAction(value);
}

function updateSel() {
    const items = getCurrentItems();
    const selectedItem = items[currentIdx];
    const value = selectedItem.getAttribute('data-value');

    items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === currentIdx);

        item.onclick = () => activateItem(idx);
        item.onmouseenter = () => selectItem(idx);
    });

    info.textContent = 'Description: ' + descriptions[value];
}

function switchMenu(menuSw) {
    currentMenu = menuSw;
    currentIdx = 0;

    if (currentMenu === 'main') {
        mainMenu.classList.remove('hidden');
        advancedMenu.classList.add('hidden');
    } else if (currentMenu === 'advanced') {
        mainMenu.classList.add('hidden');
        advancedMenu.classList.remove('hidden');
    } else {
        document.getElementById('toptext').textContent = 'Recovery menu ran into a problem, please restart the computer.';
    }
    updateSel();
}

populateSysInfo();
updateSel();

function populateSysInfo() {
    const sysinfo = document.getElementById('sysinfo');
    const lsSize = JSON.stringify(localStorage).length;
    const hasFS = localStorage.getItem('sessionAutoStart') ? 'intact' : 'missing';
    const hasReg = localStorage.getItem('SysRegConfig') ? 'intact' : 'missing';

    let dbStatus = 'checking...';
    const req = indexedDB.open('NeptuneFS');
    req.onsuccess = () => {
        dbStatus = 'intact';
        req.result.close();
        renderSysInfo(hasFS, hasReg, dbStatus, lsSize);
    };
    req.onerror = () => {
        dbStatus = 'error';
        renderSysInfo(hasFS, hasReg, dbStatus, lsSize);
    };

    renderSysInfo(hasFS, hasReg, 'checking...', lsSize);
}

function renderSysInfo(hasFS, hasReg, dbStatus, lsSize) {
    document.getElementById('sysinfo').textContent =
        `sessionAutoStart: ${hasFS}       |       SysRegConfig: ${hasReg}       |       IndexedDB (NeptuneFS): ${dbStatus}       |       localStorage: ${lsSize}b`;
}

document.addEventListener('keydown', (e) => {

    if (e.key === 'Delete') {
        e.preventDefault();
        
        if (askForDeleteData) {
            confirmDelete();
            updateBottomBar('menu');
        }
    }

    if (e.key === 'Escape') {
        e.preventDefault();
        
        if (askForDeleteData) {
            window.location.reload();
        }
    }

    const items = getCurrentItems();

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        
        currentIdx = (currentIdx + 1) % items.length;
        updateSel();
    }

    if (e.key === 'ArrowUp') {
        e.preventDefault();
        
        currentIdx = (currentIdx - 1 + items.length) % items.length;
        updateSel();
    }

    if (e.key === 'Enter') {
        e.preventDefault();
        const items = getCurrentItems();
        const value = items[currentIdx].getAttribute('data-value');
        handleAction(value);
    }
});

function handleAction(value) {
    if (value === 'advanced') {
        switchMenu('advanced');
    } else if (value === 'back') {
        switchMenu('main');
        updateBottomBar('menu');
    } else if (value === 'boot') {
        window.location.href = '../index.html';
    } else if (value === 'safe') {
        window.location.href = '../index.html?mode=safe';
    } else if (value === 'format') {
        mainMenu.classList.add('hidden');
        formatSystem('all');
        updateBottomBar('confirm');
    } else if (value === 'formatbutfiles') {
        mainMenu.classList.add('hidden');
        formatSystem('sys');
        updateBottomBar('confirm');
    } else if (value === 'diag') {
        advancedMenu.classList.add('hidden');
        makeDiag();
    } else if (value === 'off') {
        window.close();
    } else {
        document.getElementById('toptext').textContent = 'Recovery menu ran into a problem, please restart the computer.';
        console.error('Value of unknown: ' + value);
    }
}

function updateBottomBar(context = 'menu') {
    const bar = document.getElementById('bottomBar');
    const hints = {
        menu:    'ENTER = Choose            ||            ↑ ↓ Move',
        confirm: 'DEL = Confirm format      ||            ESC = Cancel',
        diag:    'ESC = Restart computer',
    };
    bar.textContent = hints[context] ?? hints.menu;
}