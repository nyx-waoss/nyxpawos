console.log("Current: usermanager.js");

window.SysVar = window.SysVar || {};
SysVar.lockedSession = true;
console.log('session locked')

// Codigo de cifrado sacado de IA porque ni idea de como se hace:

async function hashPassword(password, salt = null) {
    // Si no se provee salt, generar uno nuevo
    if (!salt) {
        const saltArray = crypto.getRandomValues(new Uint8Array(16));
        salt = Array.from(saltArray)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return {
        hash: hashHex,
        salt: salt
    };
}

async function verifyPassword(inputPassword, storedHash, storedSalt) {
    const result = await hashPassword(inputPassword, storedSalt);
    return result.hash === storedHash;
}
//==================================================================

async function sysAskLoginPassword(user) {
    loginin_user = user;
    const userData = sysUsers[loginin_user];
    if (!sysUsers[loginin_user]) {
        sysBsod('X-USR-NUL', 'Attempted access to a non-existent user! This error should not occur unless system files have been modified.')
    }

    const userDiv = document.querySelector(`[data-username="${user}"]`);
    const loginText = userDiv.querySelector('.loginscr_logintext');
    loginText.textContent = 'Iniciando sesion...';
    document.documentElement.requestFullscreen();

    const hasNoPassword = (userData.passwordHash === undefined && 
                          (userData.password === undefined || userData.password === ''))
                       || (userData.passwordHash !== undefined && 
                          userData.passwordSalt !== undefined &&
                          await verifyPassword('', userData.passwordHash, userData.passwordSalt));

    if (hasNoPassword) {
        if (userData.permlevel === undefined) {
            userData.permlevel = 'user';
            if (loginin_user === 'user') {
                userData.permlevel = 'admin';
            }
            localStorage.setItem('sysUsers', JSON.stringify(sysUsers));
        }
        SysVar.currentuser.user = loginin_user;
        SysVar.currentuser.dName = userData.displayName;
        SysVar.currentuser.permissions = userData.permlevel;
        if (SysVar.currentuser.permissions === 'dev' || SysVar.currentuser.permissions === 'unsafe' || SysVar.currentuser.permissions === 'system') {
            SysVar.devMode = true;
        } else {
            SysVar.devMode = false;
        }
        SysVar.lockedSession = false;
        setTimeout(() => {
            loginscr.classList.add('hidden');
            showAppBar();
            showTopBar();
        }, 700);
    } else {
        askForPasswordWin.style.zIndex = 9005;
        askForPasswordWin.style.removeProperty('opacity');
        askForPasswordWin.classList.remove('hidden');
        setTimeout(() => {
            askForPasswordWin.classList.add('window_anim_open');
        }, 10);
        loginscrPassInput.focus();
    }
}

function sysclosesesion() {
    hideAppBar();
    hideTopBar();
    sysComQuitTasks();
    SysVar.lockedSession = true;
    SysVar.currentuser.user = 'system';
    SysVar.currentuser.dName = 'System';
    SysVar.currentuser.permissions = 'system';
    SysVar.devMode = false;
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

    askForPasswordWin.classList.remove('window_anim_open');
    setTimeout(() => {
        askForPasswordWin.classList.add('hidden');
        askForPasswordWin.style.removeProperty('opacity');
    }, 200);
    
    loginText.textContent = 'Iniciar sesion';
});

async function tryLoginToUser() {
    if (!sysUsers[loginin_user]) {
        sysBsod('X-USR-NUL', 'Attempted access to a non-existent user! This error should not occur unless system files have been modified.')
    }

    if (!SysVar.sessionAutoStart.includes('session')) {
        console.error('Session not found');
        showAlertBox('Error', 'Session not found!', {as_win:true,icon:'❌'});
        return;
    }

    const userData = sysUsers[loginin_user];
    const userDiv = document.querySelector(`[data-username="${loginin_user}"]`);
    const loginText = userDiv.querySelector('.loginscr_logintext');

    const isLegacyUser = userData.password !== undefined && 
                         userData.passwordHash === undefined;

    let loginSuccess = false;

    if (isLegacyUser) {
        loginSuccess = (loginscrPassInput.value === userData.password);

        if (loginSuccess) {
            console.log(`[Security Warning] ${loginin_user} has old password system! Auto-migrating to hash...`);
            const { hash, salt } = await hashPassword(loginscrPassInput.value);
            userData.passwordHash = hash;
            userData.passwordSalt = salt;
            delete userData.password;
            localStorage.setItem('sysUsers', JSON.stringify(sysUsers));
            console.log(`${loginin_user}'s password successfully migrated to hash.`);
        }
    } else {
        loginSuccess = await verifyPassword(
            loginscrPassInput.value,
            userData.passwordHash,
            userData.passwordSalt
        );
    }

    if (loginSuccess) {
        if (userData.permlevel === undefined) {
            userData.permlevel = 'user';
            if (loginin_user === 'user') {
                userData.permlevel = 'admin';
            }
            localStorage.setItem('sysUsers', JSON.stringify(sysUsers));
        }
        askForPasswordWin.classList.remove('window_anim_open');
        setTimeout(() => {
            askForPasswordWin.classList.add('hidden');
            askForPasswordWin.style.removeProperty('opacity');
        }, 200);

        SysVar.currentuser.user = loginin_user;
        SysVar.currentuser.dName = userData.displayName;
        SysVar.currentuser.permissions = userData.permlevel;
        if (SysVar.currentuser.permissions === 'dev' || SysVar.currentuser.permissions === 'unsafe' || SysVar.currentuser.permissions === 'system') {
            SysVar.devMode = true;
        } else {
            SysVar.devMode = false;
        }
        SysVar.lockedSession = false;

        setTimeout(() => {
            loginscr.classList.add('hidden');
            showAppBar();
            showTopBar();
            loginText.textContent = 'Iniciar sesion';
            loginscrPassInput.value = '';
            document.getElementById('loginscr_options_dp').classList.add('hidden');

            if (localStorage.getItem('sysStartupConfig') === 'ShowSTAlert') {
                showAlertBox('⚠️ Advertencia', 'El sistema no se apago correctamente. Esto puede dañar el sistema o la computadora, si lees este mensaje entonces probablemente tu computadora esta bien, pero si esto sucede muy seguido si puede tener consecuencias graves.');
                setTimeout(() => {
                    createNotification('assets/warn.webp','Advertencia','El sistema no se apago correctamente.');
                },400);
                localStorage.setItem('sysStartupConfig', 'none');
            }

            if (localStorage.getItem('sysStartupConfig') === 'NewSystem') {
                localStorage.setItem('sysStartupConfig', 'none');
                setTimeout(() => {
                    createNotification('assets/nekiri.png','Bienvenido!','Bienvenido a NyxPawOS ✨');
                },400);
            }

            if (Number(SysVar.userversion) < Number(SysVar.maxversion)) {
                SysVar.userversion = SysVar.maxversion;
                setTimeout(() => {
                    createNotification('assets/update.png','Actualizacion',`Sistema actualizado automaticamente a NyxPawOS ${SysVar.userversion}`);
                },400);
            }
        }, 600);

    } else {
        askForPasswordWin.classList.add('hidden');
        loginText.textContent = 'Contraseña incorrecta!';
        loginscrPassInput.value = '';
    }
}

loginscrBtnLogin.addEventListener('click', () => {
    tryLoginToUser();
});

loginscrPassInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        tryLoginToUser();
    }
});



async function sysCreateUser(username, displayName, password) {
    if (sysUsers[username]) {
        return {success: false, message: 'El usuario ya existe'};
    }

    if (!username || !password) {
        return {success: false, message: 'Ingrese la contraseña y el usuario!'};
    }

    const { hash, salt } = await hashPassword(password);

    sysUsers[username] = {
        displayName: displayName || username,
        passwordHash: hash,
        passwordSalt: salt,
        password: undefined,
        createdAt: Date.now(),
        permlevel: 'user'
    };

    window.fs.createFolder(username, '/home');
    window.fs.createFolder('documents', `/home/${username}`);
    window.fs.createFolder('videos', `/home/${username}`);
    window.fs.createFolder('images', `/home/${username}`);

    addUserToLoginScreen(username);

    localStorage.setItem('sysUsers', JSON.stringify(sysUsers));
    refreshUserCards();

    return {success: true, message: 'Usuario creado'};
}

function sysUserModifyPerm(username, newpermlevel) {
    sysUsers[username].permlevel = newpermlevel;
    localStorage.setItem('sysUsers', JSON.stringify(sysUsers));
}

function addUserToLoginScreen(username) {
    const user = sysUsers[username];
    const loginScreen = document.getElementById('loginscr');
    const loginDiv = document.getElementById('loginscr_userlist');

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

    loginDiv.appendChild(userDiv);
}

function deleteUser(username) {
    if (Object.keys(sysUsers).length === 1) {
        return {success: false, message: 'No puedes eliminar el ultimo usuario'};
    }
    
    if (username === loginin_user && !loginscr.classList.contains('hidden')) {
        return {success: false, message: 'No puedes eliminar el usuario logueado!'};
    }

    delete sysUsers[username];
    window.fs.deleteItem(username, '/home');

    const userDiv = document.querySelector(`[data-username="${username}"]`);
    if (userDiv) {
        userDiv.remove();
    }

    localStorage.setItem('sysUsers', JSON.stringify(sysUsers));

    return {success: true, message: 'Usuario borrado'};
}

async function changePassword(username, oldPassword, newPassword) {
    const user = sysUsers[username];

    if (!user) {
        return {success: false, message: 'Usuario no encontrado!'};
    }

    let oldPassCorrect = false;

    if (user.password !== undefined) {
        oldPassCorrect = (user.password === oldPassword);
    } else {
        oldPassCorrect = await verifyPassword(oldPassword, user.passwordHash, user.passwordSalt);
    }

    if (!oldPassCorrect) {
        return {success: false, message: 'Contraseña actual incorrecta!'};
    }

    if (!newPassword || newPassword.length < 4) {
        return {success: false, message: 'La contraseña debe tener minimo 4 caracteres!'};
    }

    const { hash, salt } = await hashPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    delete user.password;

    localStorage.setItem('sysUsers', JSON.stringify(sysUsers));

    return {success: true, message: 'Contraseña cambiada'};
}

function changeDisplayName(username, newDisplayName) {
    const user = sysUsers[username];

    if (!user) {
        return Promise.resolve({success: false, message: 'Usuario no encontrado!'});
    }

    if (!newDisplayName || newDisplayName.trim() === '') {
        return Promise.resolve({success: false, message: 'El nombre no puede estar vacio!'});v
    }

    user.displayName = newDisplayName;

    const userDiv = document.querySelector(`[data-username="${username}"]`);
    if (userDiv) {  
        const nameElement = userDiv.querySelector('p:first-child');
        nameElement.textContent = newDisplayName;
    }

    localStorage.setItem('sysUsers', JSON.stringify(sysUsers));

    return Promise.resolve({success: true, message: 'Nombre cambiado!'});
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
    if (!container) return;
    container.innerHTML = '';

    for (let username in sysUsers) {
        addUserCardToSettings(username);
    }
}

async function settingsDeleteUser(username) {
    try {
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
    } catch (error) {
        console.error('Failed to delete user: ', error);
        showAlertBox('❌ Error', 'No se pudo borrar el usuario');
    }
}

async function settingsChangePassword(username) {
    try {
        const user = sysUsers[username];

        const oldPass = await showPromptMsgBox('Cambiar contraseña ● ○ ○', `Contraseña actual de ${user.displayName}`, 'Siguiente', 'Cancelar');
        if (!oldPass.confirmed) return;

        const newPass = await showPromptMsgBox('Cambiar contraseña ○ ● ○', 'Contraseña nueva', 'Siguiente', 'Cancelar');
        if (!newPass.confirmed || !newPass.value) return;

        const confirmPass = await showPromptMsgBox('Cambiar contraseña ○ ○ ●', 'Confirmar contraseña', 'Confirmar', 'Cancelar');
        if (!confirmPass.confirmed || !confirmPass.value) return;
        if (confirmPass.value !== newPass.value) {
            showAlertBox('❌ Error','Las contraseñas no coinciden');
            return;
        }

        const result = changePassword(username, oldPass.value, newPass.value);
        showAlertBox('✅ Tarea completada',`Contraseña cambiada.`);
    } catch (error) {
        console.error('Failed to change password: ', error);
        showAlertBox('❌ Error', 'No se pudo cambiar la contraseña');
    }
}

async function settingsChangeDisplayName(username, newName) {
    try {
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
                showAlertBox('✅ Tarea completada',`Nombre cambiado.`);
        } else {
            showAlertBox('✅ Tarea completada',`Nombre cambiado.`);
        }
        refreshUserCards();
    } catch (error) {
        console.error('Failed to change name: ', error);
        showAlertBox('❌ Error', 'No se pudo cambiar el nombre');
    }
}



const sysaskfornewuserdataBtnLogin = document.getElementById('sysaskfornewuserdata-btn_login');
const sysaskfornewuserdataBtnCancel = document.getElementById('sysaskfornewuserdata-btn_cancel');
const winSysAskForNewUserData = document.getElementById('win_sysaskfornewuserdata');

const settingsNewuserUsernameinput = document.getElementById('settings_newuser_usernameinput');
const settingsNewuserDisplaynameinput = document.getElementById('settings_newuser_displaynameinput');
const settingsNewuserPasswordinput = document.getElementById('settings_newuser_passwordinput');

function sysAskForNewUserData() {
    winSysAskForNewUserData.style.removeProperty('opacity');
    winSysAskForNewUserData.classList.remove('hidden');
    setTimeout(() => { 
        winSysAskForNewUserData.classList.add('window_anim_open');
    }, 10);
    winSysAskForNewUserData.style.height = '460px';
    winSysAskForNewUserData.style.width = '440px';
}

sysaskfornewuserdataBtnCancel.addEventListener('click', () => {
    winSysAskForNewUserData.classList.remove('window_anim_open');
    setTimeout(() => {
        winSysAskForNewUserData.classList.add('hidden');
        winSysAskForNewUserData.style.removeProperty('opacity');
    }, 200);
});

sysaskfornewuserdataBtnLogin.addEventListener('click', () => {
    sysCreateUser(settingsNewuserUsernameinput.value, settingsNewuserDisplaynameinput.value, settingsNewuserPasswordinput.value);
    refreshUserCards();
    winSysAskForNewUserData.classList.remove('window_anim_open');
    setTimeout(() => {
        winSysAskForNewUserData.classList.add('hidden');
        winSysAskForNewUserData.style.removeProperty('opacity');
    }, 200);
});

window.scriptReady('usermanager');

/*

ABRIR:
askForPasswordWin.style.removeProperty('opacity');
askForPasswordWin.classList.remove('hidden');
setTimeout(() => {
    askForPasswordWin.classList.add('window_anim_open');
}, 10);



CERRAR:
winAskfile.classList.remove('window_anim_open');
setTimeout(() => {
    winAskfile.classList.add('hidden');
    winAskfile.style.removeProperty('opacity');
}, 200);

*/