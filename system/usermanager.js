console.log("Current: usermanager.js");

window.SysVar = window.SysVar || {};

function sysAskLoginPassword(user) {
    loginin_user = user;
    const userData = sysUsers[loginin_user];
    if (!sysUsers[loginin_user]) {
        sysBsod('X-USR-NUL', 'Attempted access to a non-existent user! This error should not occur unless system files have been modified.')
    }

    const userDiv = document.querySelector(`[data-username="${user}"]`);
    const loginText = userDiv.querySelector('.loginscr_logintext');
    loginText.textContent = 'Iniciando sesion...';
    document.documentElement.requestFullscreen();

    if (userData.password === '') {
        setTimeout(() => {
            loginscr.classList.add('hidden');
            showAppBar();
            showTopBar();
        }, 700);
    } else {
        askForPasswordWin.classList.remove('hidden');
        askForPasswordWin.style.zIndex = 9005;
        loginscrPassInput.focus();
    }
}

function sysclosesesion() {
    hideAppBar();
    hideTopBar();
    sysComQuitTasks();
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

function tryLoginToUser() {
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

    if (loginscrPassInput.value === userData.password) {
        askForPasswordWin.classList.add('hidden');
        setTimeout(() => {
            loginscr.classList.add('hidden');
            showAppBar();
            showTopBar();
            loginText.textContent = 'Iniciar sesion';
            loginscrPassInput.value = '';

            if (localStorage.getItem('sysStartupConfig') === 'ShowSTAlert') {
                showAlertBox('⚠️ Advertencia', 'El sistema no se apago correctamente. Esto puede dañar el sistema o la computadora, si lees este mensaje entonces probablemente tu computadora esta bien, pero si esto sucede muy seguido si puede tener consecuencias graves.');
                localStorage.setItem('sysStartupConfig', 'none');
            }

            if (localStorage.getItem('sysStartupConfig') === 'NewSystem') {
                showAlertBox('Bienvenido :3', 'Bienvenido a NyxPaw OS Therian edition, el sistema operativo para therians!');
                localStorage.setItem('sysStartupConfig', 'none');
            }
        }, 700);
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

    localStorage.setItem('sysUsers', JSON.stringify(sysUsers));

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

    localStorage.setItem('sysUsers', JSON.stringify(sysUsers));

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

    localStorage.setItem('sysUsers', JSON.stringify(sysUsers));

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

    localStorage.setItem('sysUsers', JSON.stringify(sysUsers));

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
        showAlertBox('ℹ️ Informacion',result.message);
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
                showAlertBox('ℹ️ Informacion',result.message);
        } else {
            showAlertBox('ℹ️ Informacion',result.message);
        }
    } catch (error) {
        console.error('Failed to change name: ', error);
        showAlertBox('❌ Error', 'No se pudo cambiar el nombre');
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

window.scriptReady('usermanager');