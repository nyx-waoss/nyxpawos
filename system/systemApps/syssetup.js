console.log('Current: systemApps/syssetup.js');
//Codigo aqui:

window.SysVar = window.SysVar || {};

let currentScreen = 'welcome';

const syssetupInputDname = document.getElementById('syssetup_input_dname');
const syssetupInputPass = document.getElementById('syssetup_input_pass');
const syssetupInputReinpass = document.getElementById('syssetup_input_reinpass');
const syssetupTextReinpass = document.getElementById('syssetup_text_reinpass');

//-----------------------------------------------------------------------------------------------
function verifyEnteredUserData() {
    if (syssetupInputDname.value === '') {
        showAlertBox('⚠️ Advertencia','El nombre no puede estar vacio');
        return;
    }

    if (!(syssetupInputPass.value === syssetupInputReinpass.value)) {
        syssetupTextReinpass.textContent = 'Confirmar contraseña (Las contraseñas no coinciden)';
        showAlertBox('⚠️ Advertencia','Las contraseñas no coinciden');
        return;
    }

    if (syssetupInputPass.value === '') {
        showAlertBox('⚠️ Advertencia','La contraseña debe tener al menos 4 caracteres');
        return;
    }

    showSyssetupScr('personality');
}


//-----------------------------------------------------------------------------------------------
function createSystemFiles() {
    //Crear archivos falsos del sistema
    window.fs.createFolder('home');
    window.fs.createFolder('documents', '/home');
    window.fs.createFolder('videos', '/home');
    window.fs.createFolder('images', '/home');


    window.fs.createFolder('system');
    window.fs.createFile('README.txt', 'Warning!\nThis is a system user, if you modify this files, system could stop working.\nOnly continue if you know what are you doing!', '/system');
    window.fs.createFolder('temp', '/system');
    window.fs.createFolder('programs', '/system');
    window.fs.createFile(
        'formappdata.npss',
        `ASGETDATA-(Infrom'AppObtainer','Args*ascom*').setVar'AppArgs';
    AppArgs.reciveValueNSendToVar'askingforValue','name$prop$NAME=getname$','AppName';
    SYSTEM{repeatupperline$null$SAVEAS=rline$}-changeprop'getname'-to'getid'$null$SAVEAS=getwhat$;
    rline('getintegr');
    rline('gettype');
    rline('getperms');
    rline('getdext');
    rline('getapdat');
    rline('getapdatrut');
    declare 'var' as 'type=JSON' to = FORMSTYLE="{
        "progdata": {
            "name": "$AppName$$",
            "id": "$AppID$$",
            "internal": $AppIntegred$BINARY$,
            "ver": "1.0.0",
            "type": "$AppType$$",
            "permission": "$AppPermissions$$",
            "externaldata": $AppExternal$BINARY$,
            "appdata": $AppInData$$,
            "externallink": "system/apps/$AppName$$.js"
        }
    }"
    return 'data' as 'data' with data '$FORMSTYLE$$';
        `,
        '/system/programs'
    );
    window.fs.createFile('settings.app','{setdatato=||systemrequestto="formappdata.npss"-args="settings"||}','/system/programs');
    window.fs.createFile('notes.app','{setdatato=||systemrequestto="formappdata.npss"-args="notes"||}','/system/programs');
    window.fs.createFile('calc.app','{setdatato=||systemrequestto="formappdata.npss"-args="calc"||}','/system/programs');
    window.fs.createFile('browser.app','{setdatato=||systemrequestto="formappdata.npss"-args="browser"||}','/system/programs');
    window.fs.createFile('files.app','{setdatato=||systemrequestto="formappdata.npss"-args="files"||}','/system/programs');
    window.fs.createFile('calendar.app','{setdatato=||systemrequestto="formappdata.npss"-args="calendar"||}','/system/programs');
    window.fs.createFile('terminal.app','{setdatato=||systemrequestto="formappdata.npss"-args="terminal"||}','/system/programs');
    window.fs.createFile('appcenter.app','{setdatato=||systemrequestto="formappdata.npss"-args="appcenter"||}','/system/programs');
    window.fs.createFile('toybox.app','{setdatato=||systemrequestto="formappdata.npss"-args="toybox"||}','/system/programs');
    window.fs.createFile('nyxvideoplayer.app','{setdatato=||systemrequestto="formappdata.npss"-args="nyxvideoplayer"||}','/system/programs');
    window.fs.createFile('nyximageviewer.app','{setdatato=||systemrequestto="formappdata.npss"-args="nyximageviewer"||}','/system/programs');
    window.fs.createFile('nyxpawstore.app','{setdatato=||systemrequestto="formappdata.npss"-args="nyxpawstore"||}','/system/programs');
    window.fs.createFile('nytclient.app','{setdatato=||systemrequestto="formappdata.npss"-args="nytclient"||}','/system/programs');
    window.fs.createFile('taskmanager.app','{setdatato=||systemrequestto="formappdata.npss"-args="taskmanager"||}','/system/programs');
    


    window.fs.createFolder('services', '/system');
    window.fs.createFile('input.npss', '#--Handling keyboard and pointer events--\nINPUT_OK', '/system/services');
    window.fs.createFile('window_manager.npss', 'refToFile$winmanager.js$$', '/system/services');
    window.fs.createFile('sysLoader.npss', 'refToFile$sysLoader.js$$', '/system/services');
    window.fs.createFile('usermanager.npss', 'refToFile$usermanager.js$$', '/system/services');
    window.fs.createFile('startup.system', 'refToFile$sys.js$$', '/system/services');
    window.fs.createFolder('systemApps', '/system/services');
    window.fs.createFile('syssetup.npss', 'refToFile$syssetup.js$ADD="ASENTORN.folder-assets--"$', '/system/services/systemApps');



    window.fs.createFolder('users', '/system');
    window.fs.createFolder('user', '/system/users');
    window.fs.createFile('config.npcf', 'user{PROTECTED_INFO}', '/system/users/user');
    window.fs.createFile('data.npcf', 'user{PROTECTED_INFO}', '/system/users/user');
    window.fs.createFile('cache.npfr', 'user{PROTECTED_INFO}', '/system/users/user');
    window.fs.createFolder('root', '/system/users');
    window.fs.createFile('README.txt', 'Warning!\nThis is a system user, if you modify this files, system could stop working.\nOnly continue if you know what are you doing!', '/system/users/root');
    window.fs.createFile('config.npcf', 'root{PROTECTED_INFO}', '/system/users/root');
    window.fs.createFile('data.npcf', 'root{PROTECTED_INFO}', '/system/users/root');
    window.fs.createFile('cache.npfr', 'root{PROTECTED_INFO}', '/system/users/root');



    window.fs.createFolder('styledui', '/system');//     /system/styledui/fileshome
    window.fs.createFolder('fileshome', '/system/styledui');
    window.fs.createFile('styled.css', 'Mj6DoC{display:grid}', '/system/styledui/fileshome');
    window.fs.createFile('home.lnkh', '/', '/system/styledui/fileshome');



    window.fs.createFolder('mnt', '/system');
    window.fs.createFolder('disk0', '/system/mnt');
    //Si se conecta un USB aparece aqui, se crea una carpeta disk1
}

//-----------------------------------------------------------------------------------------------
function createSystemUser() {
    changeDisplayName('user', syssetupInputDname.value);
    changePassword('user','',syssetupInputPass.value);
}






















function startSystemConfig() {
    createSystemUser();
    createSystemFiles();
    setTimeout(() => {
        localStorage.setItem('used-before', true);
        localStorage.setItem('sys_status', 'off');
        localStorage.setItem('sysStartupConfig', 'NewSystem');
        localStorage.setItem('sessionAutoStart', JSON.stringify(SysVar.sessionAutoStart));
        showSyssetupScr('restart');
    }, 7000);
}

function showSyssetupScr(screen) {

    if (currentScreen === screen) return;

    const screenEl = document.getElementById('syssetup_' + screen);
    const oldScreenEl = document.getElementById('syssetup_' + currentScreen);
    const allScreenDivs = document.querySelectorAll('.syssetup_screen');


    oldScreenEl.classList.remove('active');
    oldScreenEl.classList.add('exit-left');
    screenEl.classList.add('active');

    currentScreen = screen;

    if (currentScreen === 'prepare') {
        startSystemConfig();
    }
}





//Codigo arriba ⬆️⬆️

function init_syssetup() {
    console.log('Initiating syssetup...');
}

function cleanup_syssetup() {
    console.log('Cleaning syssetup...');
}

window.scriptReady('syssetup');

/*
npfr: nyxpaw fast-read
npcf: nyxpaw config-file
npss: nyxpaw system-script
npus: nyxpaw user-script
*/