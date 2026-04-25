console.log("Current: apps/nyxpawstore.js");
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.nyxpawstore = {
    displayName: 'NyxPaw Store',
    icon: '../../assets/apps/nyxpawstore.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//nyxpawstore
/*function nyxPawStoreOpenTab(tabid) {
    const nyxpawstoreTabs = document.getElementsByClassName('nyxpawstoreTab');
    for (let i = 0; i < toyboxTabs.length; i++) {
        toyboxTabs[i].classList.add('hidden');
    }
    document.getElementById(tabid).classList.remove('hidden');
} FUNCION NO USADA*/
window.SysVar = window.SysVar || {};
let nyxpawstoreCurrentApp = "";
let nyxpawstoreAppID = "appcenter-";
let nyxpawstoreTranslatedApp = nyxpawstoreCurrentApp;

const nyxpawstoreAppTranslation = {
    "clima":"weather",
    "arcade":"arcade",
    "venge":"vengegame",
    "virtualenvs":"virtualenv",
    "vscode":"vscode"
}

const nyxpawstoreAppsInfo = {
    Arcade: "Estas aburrido? Pues esto ya no sera un problema, porque con NyxPaw Arcade podras difrutar de juegos HTML compatibles con NyxPawOS!! NyxPaw Arcade utiliza servicios externos, pero los juegos disponibles son verificados para asegurar una buena experiencia de usuario, con una interfaz simple y amigable",
    Clima: "Mira el clima y la temperatura local :D",
    Venge: "Venge is an objective-based first-person shooter. Every match is an intense unique experience with the ability cards that you can get in the game.",
    VirtualEnvs: "Editor de código moderno, rápido y personalizable. Compatible con múltiples lenguajes, extensiones, terminal y Git integrado."
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

    if (SysVar.appDownloaded.includes(appname)) {
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
    nyxpawstoreGetBtn.textContent = "Verificando...";
    nyxpawstoreTranslatedApp = nyxpawstoreAppTranslation[nyxpawstoreCurrentApp.toLowerCase()] || nyxpawstoreCurrentApp.toLowerCase();
    nyxpawstoreAppID = "appcenter-" + nyxpawstoreTranslatedApp;
    console.log(nyxpawstoreAppID);

    const appElement = document.getElementById(nyxpawstoreAppID);
    
    if (!appElement) {
        console.error('Program to download not found: '+nyxpawstoreAppID);
        showAlertBox('❌ Error', 'App no encontrada');
        nyxpawstoreGetBtn.textContent = "Error [X]";
        return;
    }

    if (SysVar.appDownloaded.includes(nyxpawstoreCurrentApp)) {
        console.log('Delete');
        SysVar.appDownloaded = SysVar.appDownloaded.filter(x => x !== nyxpawstoreCurrentApp);
        document.getElementById(nyxpawstoreAppID).classList.add('hidden');
        
    } else {
        console.log('Get App');
        SysVar.appDownloaded.push(nyxpawstoreCurrentApp);
        document.getElementById(nyxpawstoreAppID).classList.remove('hidden');
        createNotification('assets/apps/nyxpawstore.png', 'App instalada', `${nyxpawstoreCurrentApp} esta lista para usarse`, { show:true, text:"Abrir", action:"exec", data:nyxpawstoreCurrentApp });

    }

    

    setTimeout(() => {
        if (SysVar.appDownloaded.includes(nyxpawstoreCurrentApp)) {
            nyxpawstoreGetBtn.textContent = "Delete";
        } else {
            nyxpawstoreGetBtn.textContent = "Descargar";
        }
    }, 700);
}

window.scriptReady('nyxpawstore');