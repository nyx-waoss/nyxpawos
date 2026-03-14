console.log("Current: apps/settings.js");

//config
window.SysVar = window.SysVar || {}; //inicializar variables globales

let devModeCheckbox = null;
let userPermlevelSel = null;
let langSelect = null;


/*devModeCheckbox.addEventListener('change', () => {
    SysVar.devMode = devModeCheckbox.checked;
});*/




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
    console.log('Initiating settings...');

    document.querySelectorAll(".settings-sidebar .tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const id = tab.dataset.tab;
            document.querySelectorAll(".tab, .tab-content")
                .forEach(el => el.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(id).classList.add("active");
        });
    });

    devModeCheckbox = document.getElementById('devmodecheckbox');
    userPermlevelSel = document.getElementById('settings_permlevel_select');
    langSelect = document.getElementById('languageSelectionSel');

    userPermlevelSel.addEventListener('change', () => {
        if (SysVar.currentuser.user === 'user') {
            if (userPermlevelSel.value === 'user') {
                showAlertBox('Advertencia','El usuario original no puede cambiar a permisos de user\nEliga admin o superior.',{as_win:true,icon:'⚠️'});
                userPermlevelSel.value = SysVar.currentuser.permissions;
                return;
            }
        }
        if (userPermlevelSel.value === 'dev') {
            SysVar.devMode = true;
        } else {
            SysVar.devMode = false;
        }
        sysUserModifyPerm(SysVar.currentuser.user, userPermlevelSel.value);
        SysVar.currentuser.permissions = userPermlevelSel.value;
    });
    langSelect.addEventListener('change', () => {
        translateSystem(String(langSelect.value));
    });

    langSelect.value = String(SysVar.currentlang);
    devModeCheckbox.checked = !!SysVar.devMode;

    userPermlevelSel.value = SysVar.currentuser.permissions;
    updateProfileInfo();
    refreshUserCards();
}

function cleanup_settings() {
    console.log('Cleaning settings...');
    updateProfileInfo();
}
window.scriptReady('settings');