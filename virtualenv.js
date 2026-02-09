let db;

let machinesAdded = [];
let newOsDir = document.getElementById('dropdownOS').value;
let isFullscreen = false;

let machineInContext = null;
let machineInContextOS = null;
let machineInContextStorage = null;
let machineInContextRam = null;

let selectedMachineToMod = null;
const WINDOW_ID = 'win_virtualenv';
        
function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    window.parent.postMessage({
        action: 'fullscreen',
        windowId: WINDOW_ID,
        enable: isFullscreen
    }, '*');
}

const predefinedMachines = {
    win11: 'https://win11.blueedge.me/',
    win10: 'https://win-10.vercel.app/',
    winxp: 'https://xp.quenq.com/',
    macos: 'https://www.macos-web.app/',
    ubuntu: 'https://vivek9patel.github.io/',
    win98: 'https://98.js.org/',
    win12: 'https://tjy-gitnub.github.io/win12/desktop.html/',
    hyggshi: 'https://hyggshiosdeveloper.github.io/hyggshi-os-website/OSmain.html',
    instictos: 'index.html'
};


//Proteccion fullscreen---------------------------------------------------------------------------------------

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const fullscreenElement = document.fullscreenElement || 
                             document.webkitFullscreenElement || 
                             document.mozFullScreenElement ||
                             document.msFullscreenElement;
    
    if (fullscreenElement === mainIframe || 
        (fullscreenElement && fullscreenElement.closest('iframe') === mainIframe)) {
        
        console.log('Fullscreen blocked');
        
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
    }
}

//Proteccion end---------------------------------------------------------------------------------------

const list = document.getElementById('itemsList');

const toolbar = document.getElementById('toolbar');
const workspace = document.getElementById('workspace');
const leftsidebar = document.getElementById('leftsidebar');
const mainIframe = document.getElementById('main_iframe');

const contextMenu = document.getElementById("contextMenu");
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});
document.addEventListener("click", () => {
    contextMenu.classList.add("hidden");
});
contextMenu.addEventListener("click", (e) => {
    e.stopPropagation();
});


const configVMStorageText = document.getElementById('newStorageSizeText');
const configVMStorageRange = document.getElementById('newStorageSizeRange');
const newStorageBothConv = document.getElementById('newStorageBothConv');

const configVMRamText = document.getElementById('newRamSizeText');
const configVMRamRange = document.getElementById('newRamSizeRange');
const newRAMBothConv = document.getElementById('newRAMBothConv');

const configVMCPUText = document.getElementById('newCPUCoresText');
const configVMCPURange = document.getElementById('newCPUCoresRange');

const configVMVRAMText = document.getElementById('newVramSizeText');
const configVMVRAMRange = document.getElementById('newVramSizeRange');




configVMStorageRange.addEventListener('input', () => {
    configVMStorageText.value = configVMStorageRange.value;
    
    newStorageBothConv.textContent = `MB: ${convertValue(configVMStorageRange.value, 'GB', 'MB')}, GB: ${convertValue(configVMStorageRange.value, 'GB', 'GB')}`;
});

configVMStorageText.addEventListener('change', () => {
    let value = Number(configVMStorageText.value);

    if (isNaN(value)) {
        value = 52;
    }
    if (value > 2048) {
        value = 2048;
    }
    if (value < 2) {
        value = 2;
    }

    configVMStorageText.value = value;
    configVMStorageRange.value = value;

    newStorageBothConv.textContent = `MB: ${convertValue(configVMStorageRange.value, 'GB', 'MB')}, GB: ${convertValue(configVMStorageRange.value, 'GB', 'GB')}`;
});

configVMRamRange.addEventListener('input', () => {
    configVMRamText.value = configVMRamRange.value;
    
    newRAMBothConv.textContent = `MB: ${convertValue(configVMRamRange.value, 'GB', 'MB')}, GB: ${convertValue(configVMRamRange.value, 'GB', 'GB')}`;
});

configVMRamText.addEventListener('change', () => {
    let value = Number(configVMRamText.value);

    if (isNaN(value)) {
        value = 8;
    }
    if (value > 64) {
        value = 64;
    }
    if (value < 0.016) {
        value = 0.016;
    }

    configVMRamText.value = value;
    configVMRamRange.value = value;

    newRAMBothConv.textContent = `MB: ${convertValue(configVMRamRange.value, 'GB', 'MB')}, GB: ${convertValue(configVMRamRange.value, 'GB', 'GB')}`;
});


configVMCPURange.addEventListener('input', () => {
    configVMCPUText.value = configVMCPURange.value;
});

configVMCPUText.addEventListener('change', () => {
    let value = Number(configVMCPUText.value);

    if (isNaN(value)) {
        value = 2;
    }
    if (value > 16) {
        value = 16;
    }
    if (value < 1) {
        value = 1;
    }

    configVMCPUText.value = value;
    configVMCPURange.value = value;
});


configVMVRAMRange.addEventListener('input', () => {
    configVMVRAMText.value = configVMVRAMRange.value;
});

configVMVRAMText.addEventListener('change', () => {
    let value = Number(configVMVRAMText.value);

    if (isNaN(value)) {
        value = 128;
    }
    if (value > 1024) {
        value = 1024;
    }
    if (value < 16) {
        value = 16;
    }

    configVMVRAMText.value = value;
    configVMVRAMRange.value = value;
});




initDB();
updateList();

console.log('Loading indexedDB and machines...')
document.getElementById('loadingText').classList.remove('hidden');
initDB().then(() => {
    document.getElementById('loadingText').classList.add('hidden');
    console.log('IndexedDB is ready!');

    idbGet('machines').then(savedMachines => {
        if (savedMachines) {
            machinesAdded = savedMachines;
        }
        updateList();
    })
});

//------------------------------------------------------------------------//
function btnConfig() {
    goToMainScrWS();
    document.getElementById('ProgramConfig').classList.remove('hidden');
    document.getElementById('selectText').classList.add('hidden');
}

function convertValue(value, from, to) {
    value = parseFloat(value);

    const units = {
        MB: 1,
        GB: 1024
    };

    const valueInMB = value * units[from];
    const result = valueInMB / units[to];
    return result;
}

function goToMainScrWS() {
    document.getElementById('selectText').classList.remove('hidden');
    document.getElementById('VMmodName').classList.add('hidden');
    document.getElementById('VMInfo').classList.add('hidden');
    document.getElementById('newVMOptions').classList.add('hidden');
    document.getElementById('VMsysConfig').classList.add('hidden');
    document.getElementById('ProgramConfig').classList.add('hidden');
}

function modifyConfigMachine(oldName, newStorage, newRam) {
    const machine = machinesAdded.find(m => m.name === oldName);
    if (machine) {
        machine.storage = newStorage;
        machine.ram = newRam;
        updateList();
    }
}

function renameMachine(oldName, newName) {
    const machine = machinesAdded.find(m => m.name === oldName);
    if (machine) {
        machine.name = newName;
        updateList();
    }
}

function configMachineFromContext() {
    selectedMachineToMod = machineInContext;
    goToMainScrWS();
    document.getElementById('VMsysConfig').classList.remove('hidden');
    document.getElementById('selectText').classList.add('hidden');

    configVMStorageRange.value = machineInContextStorage;
    configVMRamRange.value = machineInContextRam;

    newStorageBothConv.textContent = `MB: ${convertValue(configVMStorageRange.value, 'GB', 'MB')}, GB: ${convertValue(configVMStorageRange.value, 'GB', 'GB')}`;
    newRAMBothConv.textContent = `MB: ${convertValue(configVMRamRange.value, 'GB', 'MB')}, GB: ${convertValue(configVMRamRange.value, 'GB', 'GB')}`;
    configVMStorageText.value = configVMStorageRange.value;
    configVMRamText.value = configVMRamRange.value;
    configVMVRAMText.value = configVMVRAMRange.value;
    configVMCPUText.value = configVMCPURange.value;
}

function modMachineFromContext() {
    selectedMachineToMod = machineInContext;

    goToMainScrWS();
    document.getElementById('VMmodName').classList.remove('hidden');
    document.getElementById('selectText').classList.add('hidden');

    document.getElementById('readyVMNewName').value = machineInContext;
}

function getinfMachineFromContext(name = machineInContext, os = machineInContextOS, storage = machineInContextStorage, ram = machineInContextRam) {

    goToMainScrWS();
    document.getElementById('VMInfo').classList.remove('hidden');
    document.getElementById('selectText').classList.add('hidden');

    document.getElementById('InfoDiv_name_text').textContent = name;
    document.getElementById('InfoDiv_OS_text').textContent = os;

    document.getElementById('InfoDiv_storage_gb').textContent = convertValue(storage, 'GB', 'GB');
    document.getElementById('InfoDiv_storage_mb').textContent = convertValue(storage, 'GB', 'MB');

    document.getElementById('InfoDiv_ram_gb').textContent = convertValue(ram, 'GB', 'GB');
    document.getElementById('InfoDiv_ram_mb').textContent = convertValue(ram, 'GB', 'MB');
}

function addNewVM() {
    newOsDir = document.getElementById('dropdownOS').value;
    if (newOsDir === 'stylesel') {
        console.error('Invalid OS');
        return;
    } else if (newOsDir === 'other') {
        osDir = document.getElementById('newVMRoute').value;
    }

    machinesAdded.push({name: document.getElementById('newVMName').value, os: newOsDir, storage:52, ram:8});
    document.getElementById('newVMName').value = '';

    goToMainScrWS();

    updateList();
}

function delVM(name) {
    machinesAdded = machinesAdded.filter(machine => machine.name !== name);
    updateList();
}

function btnNewVM() {
    document.getElementById('selectText').classList.add('hidden');
    document.getElementById('newVMOptions').classList.remove('hidden');
}

function closeMachine() {
    console.log(`Stopping current...`);
    toolbar.classList.add('hidden');

    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

    window.parent.postMessage({
        action: 'fullscreen',
        windowId: WINDOW_ID,
        enable: false
    }, '*');

    setTimeout(() => {
        workspace.classList.remove('hidden');
        leftsidebar.classList.remove('hidden');
        mainIframe.classList.add('hidden');
    },1000);
}

function runMachine(name, os) {
    mainIframe.src = 'virtualenv_loading.html';
    console.log(`Running ${name} with OS ${os}`);
    workspace.classList.add('hidden');
    leftsidebar.classList.add('hidden');
    mainIframe.classList.remove('hidden');
    toolbar.classList.remove('hidden');

    setTimeout(() => {
        osDir = predefinedMachines[os] || os;
        mainIframe.src = osDir;
    },1400);
}

function updateList() {
    list.innerHTML = '';
    document.getElementById('loadingText').classList.remove('hidden');
    saveAllMachines();
    machinesAdded.forEach((machine, idx) => {
        const divItem = document.createElement('div');
        divItem.className = 'item';

        const btnsDiv = document.createElement('div');
        btnsDiv.className = 'item_btns_div';

        const runBtn = document.createElement('button');
        runBtn.className = 'itemBtn';

        const runBtnText = document.createElement('p');
        runBtnText.textContent = machine.name;

        const runBtnImg = document.createElement('img');
        runBtnImg.src = 'assets/virtualenv/go.png';
        runBtnImg.className = 'itemBtnImg';


        const contextBtn = document.createElement('button');
        contextBtn.className = 'itemBtn';

        const contextBtnImg = document.createElement('img');
        contextBtnImg.src = 'assets/virtualenv/more.png';
        contextBtnImg.className = 'itemBtnImg contextImg';

        runBtn.onclick = () => {
            console.log(`= ${machine.name} info ======`);
            console.log(`Name: ${machine.name}`);
            console.log(`OS: ${machine.os}`);
            console.log(`IDX: ${idx}`);
            runMachine(machine.name, machine.os);
            console.log(`==${ '='.repeat(machine.name.length) }============`);
            console.log(' ');
        };

        contextBtn.onclick = (e) => {
            e.stopPropagation();
            console.log(`= Show context for ${machine.name} ======`);
            console.log(' ');

            e.preventDefault();

            contextMenu.style.left = e.clientX + "px";
            contextMenu.style.top = e.clientY + "px";

            machineInContext = machine.name;
            machineInContextOS = machine.os;
            machineInContextStorage = machine.storage;
            machineInContextRam = machine.ram;

            contextMenu.classList.remove("hidden");
        };

        divItem.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();

            contextMenu.style.left = e.clientX + "px";
            contextMenu.style.top = e.clientY + "px";

            machineInContext = machine.name;
            machineInContextOS = machine.os;
            machineInContextStorage = machine.storage;
            machineInContextRam = machine.ram;

            contextMenu.classList.remove("hidden");
        });
        
        runBtn.appendChild(runBtnImg);
        contextBtn.appendChild(contextBtnImg);

        btnsDiv.appendChild(contextBtn);
        btnsDiv.appendChild(runBtn);

        divItem.appendChild(runBtnText);
        divItem.appendChild(btnsDiv);

        list.appendChild(divItem);
    });
    document.getElementById('loadingText').classList.add('hidden');
}

document.getElementById('dropdownOS').addEventListener('change', e => {
    console.log(e.target.value);
    if (e.target.value === 'other') {
        document.getElementById('otherOSInput').classList.remove('hidden');
    } else {
        document.getElementById('otherOSInput').classList.add('hidden');
    }

    if (e.target.value === 'stylesel') {
        document.getElementById('createVMbtn').textContent = 'OS Invalido';
    } else {
        document.getElementById('createVMbtn').textContent = 'Crear';
    }
});


/*
OSs:

win 11 in react
win 10
win xp
mac OS
ubuntu
windows 98 sim
windows 96
windows 12 copncept
reborn xp
hyggshi OS
prozzila
PCjs Machines


*/
//FUNCIONES DEL SISTEMA:
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("Virtualenv", 1);

        request.onupgradeneeded = () => {
            db = request.result;
            if (!db.objectStoreNames.contains('machines')) {
                db.createObjectStore('machines');
            }
        };
        request.onsuccess = () => {
            db = request.result;
            dbReady = true;
            console.log('Success when loading database');
            resolve(db);
        };
        request.onerror = () => {
            console.error('Error when loading database');
            reject(request.error);
        };
    });
}

function idbSet(key, value) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('IndexedDB not ready!'));
            return;
        }

        const tx = db.transaction("machines", "readwrite");
        const store = tx.objectStore("machines");
        const req = store.put(value, key);

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    
}

function idbGet(key) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('IndexedDB not ready!'));
            return;
        }

        const tx = db.transaction("machines", "readonly");
        const store = tx.objectStore("machines");
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function idbDel(key) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('IndexedDB not ready!'));
            return;
        }

        const tx = db.transaction("machines", "readwrite");
        const store = tx.objectStore("machines");
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

function idbClear() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('IndexedDB not ready!'));
            return;
        }

        const tx = db.transaction("machines", "readwrite");
        const store = tx.objectStore("machines");
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

function idbGetMachines() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('IndexedDB not ready!'));
            return;
        }

        const tx = db.transaction("machines", "readonly");
        const store = tx.objectStore("machines");
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function saveAllMachines() {
    idbSet('machines', machinesAdded);
}
function loadAllMachines(callback) {
    idbGet('machines').then(data => {
        callback(data);
    });
}
function deleteAllMachines() {
    idbClear();
}