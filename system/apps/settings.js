console.log("Current: apps/settings.js");

//config
window.SysVar = window.SysVar || {}; //inicializar variables globales

const devModeCheckbox = document.getElementById('devmodecheckbox');
devModeCheckbox.checked = !!SysVar.devMode;

devModeCheckbox.addEventListener('change', () => {
    SysVar.devMode = devModeCheckbox.checked;
});


document.querySelectorAll(".settings-sidebar .tab").forEach(tab => {
    tab.addEventListener("click", () => {
        const id = tab.dataset.tab;
        document.querySelectorAll(".tab, .tab-content")
            .forEach(el => el.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(id).classList.add("active");
    });
});

window.openSettingsTab = function(tabId) {
    if (!AppManager.loadedApps.has('settings')) {
        AppManager.loadApp('settings').then(() => {
            setTimeout(() => {
                _openSettingsTabInternal(tabId);
            }, 70);
        });
        return;
    }

    _openSettingsTabInternal(tabId);
};

function _openSettingsTabInternal(tabId) {
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

function updateProfileInfo() {
    const tabname = document.getElementById('dnametab');

    const title = document.getElementById('profiletitle');

    const username = document.getElementById('userinfouserp');
    const dname = document.getElementById('userinfodnamep');

    title.textContent = 'Hola '+SysVar.currentuser.dName+'!';
    username.textContent = SysVar.currentuser.user;
    dname.textContent = SysVar.currentuser.dName;
    tabname.textContent = SysVar.currentuser.dName;
}







function init_settings() {
    updateProfileInfo();
    console.log('Initiating settings...');
}

function cleanup_settings() {
    updateProfileInfo();
    console.log('Cleaning settings...');
}
window.scriptReady('settings');