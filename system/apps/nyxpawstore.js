console.log("Current: apps/nyxpawstore.js");

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
    "venge":"vengegame"
}

const nyxpawstoreAppsInfo = {
    Arcade: "Estas aburrido? Pues esto ya no sera un problema, porque con NyxPaw Arcade podras difrutar de juegos HTML compatibles con NyxPawOS!! NyxPaw Arcade utiliza servicios externos, pero los juegos disponibles son verificados para asegurar una buena experiencia de usuario, con una interfaz simple y amigable",
    Clima: "Mira el clima y la temperatura local :D",
    Venge: "Venge is an objective-based first-person shooter. Every match is an intense unique experience with the ability cards that you can get in the game."
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
    nyxpawstoreTranslatedApp = nyxpawstoreAppTranslation[nyxpawstoreCurrentApp.toLowerCase()] || nyxpawstoreCurrentApp.toLowerCase();
    nyxpawstoreAppID = "appcenter-" + nyxpawstoreTranslatedApp;
    console.log(nyxpawstoreAppID);

    if (SysVar.appDownloaded.includes(nyxpawstoreCurrentApp)) {
        console.log('Delete');
        SysVar.appDownloaded = SysVar.appDownloaded.filter(x => x !== nyxpawstoreCurrentApp);
        document.getElementById(nyxpawstoreAppID).classList.add('hidden');
    } else {
        console.log('Get App');
        SysVar.appDownloaded.push(nyxpawstoreCurrentApp);
        document.getElementById(nyxpawstoreAppID).classList.remove('hidden');
    }

    nyxpawstoreGetBtn.textContent = "Verificando...";

    setTimeout(() => {
        if (SysVar.appDownloaded.includes(nyxpawstoreCurrentApp)) {
            nyxpawstoreGetBtn.textContent = "Delete";
        } else {
            nyxpawstoreGetBtn.textContent = "Descargar";
        }
    }, 700);
}

window.scriptReady('nyxpawstore');