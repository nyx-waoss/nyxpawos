console.log("Current: apps/settings.js");
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.settings = {
    displayName: 'Configuracion',
    icon: '../../assets/apps/settings.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//config
window.SysVar = window.SysVar || {};

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

async function promptcustomwallpaper() {
    const customwallpaper = await showPromptMsgBox('Agregar', 'Ingresa URL de la imagen', 'Agregar', 'Cancelar',{as_win:true,icon:'🏞️'});
    if (!customwallpaper.confirmed) return;
    if (!customwallpaper.value) return;
    if (isValidUrl(customwallpaper.value)) {
        syssetwallpaperto(customwallpaper.value);
    } else {
        showAlertBox("Invalido!","Ingresa una URL valida.",{as_win:true,icon:'⚠️'});
    }
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
        if (navigator.onLine) {
            translateSystem(String(langSelect.value));
        } else {
            showAlertBox('msgbox_err','No se puede cambiar el idioma sin conexión a internet',{as_win:true,icon:'🛜'});
        }
    });

    langSelect.value = String(SysVar.currentlang);
    devModeCheckbox.checked = !!SysVar.devMode;

    userPermlevelSel.value = SysVar.currentuser.permissions;
    updateProfileInfo();
    refreshUserCards();

    document.getElementById('settings_systemversion').textContent = `Version del sistema: ${SysVar.userversion}`;

    const usersContainer = document.getElementById('settings-users-container');
    if (usersContainer) {
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
    }

    if (navigator.onLine) {
        document.getElementById('settings_connectednetwork').textContent =`🛜 ${SysVar.userDataCollection.internetProvider}`;
    } else {
        document.getElementById('settings_connectednetwork').textContent =`🚫 No internet`;
    }
    document.getElementById('settings_ipaddress').value = SysVar.userDataCollection.ip;
}

function cleanup_settings() {
    console.log('Cleaning settings...');
    updateProfileInfo();
}
window.scriptReady('settings');