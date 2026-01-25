console.log("[NyxPawOS] Current: sys.js");
const startupErrorText = document.getElementById('startupscrtext');
const startupLoading = document.getElementById('startupscrimg');

if (startupErrorText) {
    startupErrorText.classList.add('hidden');
}
if (startupLoading) {
    startupLoading.classList.remove('hidden');
}

const sysConsoleLog = {
    log: (args) => {
        console.log('[NyxPawOS] ', args)
    },
    error: (args) => {
        console.error('[NyxPawOS] ', args)
    },
    warn: (args) => {
        console.warn('[NyxPawOS] ', args)
    }
};

/*BSOD */
function sysBsod(errorCode, errorText) {
    sysComQuitTasks();
    const errorCodeOut = document.getElementById('bsodErrorCode');
    const errorTextOut = document.getElementById('bsodErrorText');
    const bsodDiv = document.getElementById('bsod');

    errorCodeOut.textContent = errorCode;
    errorTextOut.textContent = errorText;
    bsodDiv.classList.remove('hidden');
    setTimeout(() => {
        window.location.href = "index.html";
    }, 10000);
}
//fin del sistema de bsod

//check
function checkLoadingTimeout() {
    setTimeout(() => {
        const startupScr = document.getElementById('startupscr');
        if (!startupScr.classList.contains('hidden')) {
            console.warn('An unknown error has occurred! Bootscreen is taking too long.');

            const loadProgressText = document.getElementById('startupscr_progresstext');
            if (loadProgressText) {
                loadProgressText.textContent = 'Unexpected error, please check console!';
                loadProgressText.style.color = '#ff9800';
            }
        }
    }, 15000); // espera 15 segundos a ver si ya se quito la pinchi pantalla de carga o no
}
checkLoadingTimeout();

//vars
/*const systemSound = {
    error: new Audio('../assets/error.mp3'),
    info: new Audio('../assets/error2.mp3'),
    noti: new Audio('../assets/noti.mp3')
};*/

//let formato24h = false;
//let appDownloaded = []
let sysEmgMenuTimer = null;
let sysUsers = localStorage.getItem('sysUsers');
if (sysUsers) {
    sysUsers = JSON.parse(sysUsers);
} else {
    sysUsers = {
        'user': {
            displayName: 'User',
            password: '',
            createdAt: Date.now()
        }
    };
}

const monthsNM = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

let actualDate = new Date();
let StarredDates = new Set();



/*VARIABLES GLOBALES */
window.SysVar = window.SysVar || {};
SysVar.devMode = false;
SysVar.sysEvents = [];
SysVar.format24h = false;
SysVar.appDownloaded = [];
SysVar.systemSound = {
    error: new Audio('../assets/error.mp3'),
    info: new Audio('../assets/error2.mp3'),
    noti: new Audio('../assets/noti.mp3')
};
SysVar.showconsoleerr = document.getElementById('showerrorscheckbox');
SysVar.blockShutdown = false;
SysVar.lockedSession = false;
SysVar.disableJSload = false;
SysVar.windowManager0 = true;
SysVar.sessionAutoStart = [
    "input",
    "UI",
    "audio",
    "programs",
    "session"
];




/*VARIABLES GLOBALES END */
//reestablecer variables desde localstorage:
const usedBefore = localStorage.getItem('used-before');
if (usedBefore) {
    loadDataReg();
}

//---------------------------------------------------------------------------------------------------------------------
function saveDataReg() {
    localStorage.setItem('sessionAutoStart', JSON.stringify(SysVar.sessionAutoStart));
    const data = {
        format24h: SysVar.format24h,
        lockedSession: SysVar.lockedSession,
        windowManager0: SysVar.windowManager0,
        disableJSload: SysVar.disableJSload,
        devMode: SysVar.devMode,
    };
    localStorage.setItem('SysRegConfig', JSON.stringify(data));
}

function loadDataReg() {
    SysVar.sessionAutoStart = JSON.parse(localStorage.getItem('sessionAutoStart'));
    const saved = localStorage.getItem('SysRegConfig');
    if (saved) {
        const data = JSON.parse(saved);

        SysVar.format24h = data.format24h;
        SysVar.lockedSession = data.lockedSession;
        SysVar.windowManager0 = data.windowManager0;
        SysVar.disableJSload = data.disableJSload;
        SysVar.devMode = data.devMode;
    }
}

//funcion msgbox
function showPromptMsgBox(title, text, okbtn_text, cancelbtn_text, options={}) {
    return new Promise((resolve) => {
        const {
            as_win = false,
            icon = '⚠️'
        } = options;
        if (!as_win) {
            const msgBox = document.getElementById('msg-box')
            const msgTitle = document.getElementById('msg-box-title');
            const msgText = document.getElementById('msg-box-text');
            const msgInput = document.getElementById('msg-box-input');
            const msgButtonOk = document.getElementById('msg-box-okbtn');
            const msgButtonCancel = document.getElementById('msg-box-cancelbtn');
            const bgOverlay = document.getElementById('msg-box-bgoverlay');

            bgOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.445)";

            msgTitle.textContent = title;
            msgText.textContent = text;
            msgButtonOk.textContent = okbtn_text;
            msgButtonCancel.textContent = cancelbtn_text;
            msgInput.value = '';
            msgInput.setAttribute('autocomplete', 'off');

            msgBox.style.zIndex = topZ + 10;
            bgOverlay.style.zIndex = topZ + 9;

            msgBox.classList.remove('hidden');
            msgButtonOk.classList.remove('hidden');
            bgOverlay.classList.remove('hidden');
            msgInput.classList.remove('hidden');

            msgInput.focus();

            const handleEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    msgButtonOk.click();
                }
            };
            msgInput.addEventListener('keydown', handleEnter);

            msgButtonOk.onclick = () => {
                const value = msgInput.value.trim();
                msgBox.classList.add('hidden');
                bgOverlay.classList.add('hidden');
                msgInput.classList.add('hidden');
                msgInput.removeEventListener('keydown', handleEnter);
                resolve({confirmed: true, value: value});
            };

            msgButtonCancel.onclick = () => {
                msgBox.classList.add('hidden');
                bgOverlay.classList.add('hidden');
                msgInput.classList.add('hidden');
                msgInput.removeEventListener('keydown', handleEnter);
                resolve({confirmed: false, value: null});
            };
        } else {
            const msgBox = document.getElementById('msg-box-win')
            const msgTitle = document.getElementById('msg-box-win-title');
            const msgText = document.getElementById('msg-box-win-text');
            const msgInput = document.getElementById('msg-box-win-input');
            const msgButtonOk = document.getElementById('msg-box-win-okbtn');
            const msgButtonCancel = document.getElementById('msg-box-win-cancelbtn');
            const msgIcon = document.getElementById('msg-box-win-icon');

            msgTitle.textContent = title;
            msgText.textContent = text;
            msgButtonOk.textContent = okbtn_text;
            msgButtonCancel.textContent = cancelbtn_text;
            msgIcon.textContent = icon;
            msgInput.value = '';
            msgInput.setAttribute('autocomplete', 'off');

            msgBox.style.zIndex = topZ + 10;

            msgBox.classList.remove('hidden');
            msgButtonOk.classList.remove('hidden');
            msgInput.classList.remove('hidden');

            msgInput.focus();

            const handleEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    msgButtonOk.click();
                }
            };
            msgInput.addEventListener('keydown', handleEnter);

            msgButtonOk.onclick = () => {
                const value = msgInput.value.trim();
                msgBox.classList.add('hidden');
                msgInput.classList.add('hidden');
                msgInput.removeEventListener('keydown', handleEnter);
                resolve({confirmed: true, value: value});
            };

            msgButtonCancel.onclick = () => {
                msgBox.classList.add('hidden');
                msgInput.classList.add('hidden');
                msgInput.removeEventListener('keydown', handleEnter);
                resolve({confirmed: false, value: null});
            };
        }
    });
}

function showMsgBox(title, text, okbtn_text, cancelbtn_text, options={}) {
    return new Promise((resolve) => {
        const {
            as_win = false,
            icon = '⚠️'
        } = options;
        if (!as_win) {
            const msgBox = document.getElementById('msg-box');
            const msgTitle = document.getElementById('msg-box-title');
            const msgText = document.getElementById('msg-box-text');
            const msgInput = document.getElementById('msg-box-input');
            const msgButtonOk = document.getElementById('msg-box-okbtn');
            const msgButtonCancel = document.getElementById('msg-box-cancelbtn');
            const bgOverlay = document.getElementById('msg-box-bgoverlay');

            bgOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.445)";

            msgTitle.textContent = title;
            msgText.textContent = text;
            msgButtonOk.textContent = okbtn_text;
            msgButtonCancel.textContent = cancelbtn_text;
            

            msgBox.style.zIndex = topZ + 10;
            bgOverlay.style.zIndex = topZ + 9;

            msgInput.classList.add('hidden');
            msgBox.classList.remove('hidden');
            msgButtonOk.classList.remove('hidden');
            bgOverlay.classList.remove('hidden');

            msgButtonOk.onclick = () => {
            msgBox.classList.add('hidden');
            bgOverlay.classList.add('hidden');
                resolve(true);
            };

            msgButtonCancel.onclick = () => {
                msgBox.classList.add('hidden');
                bgOverlay.classList.add('hidden');
                resolve(false);
            };
        } else {
            const msgBox = document.getElementById('msg-box-win');
            const msgTitle = document.getElementById('msg-box-win-title');
            const msgText = document.getElementById('msg-box-win-text');
            const msgInput = document.getElementById('msg-box-win-input');
            const msgButtonOk = document.getElementById('msg-box-win-okbtn');
            const msgButtonCancel = document.getElementById('msg-box-win-cancelbtn');
            const msgIcon = document.getElementById('msg-box-win-icon');

            msgTitle.textContent = title;
            msgText.textContent = text;
            msgButtonOk.textContent = okbtn_text;
            msgButtonCancel.textContent = cancelbtn_text;
            msgIcon.textContent = icon;

            msgBox.style.zIndex = topZ + 10;

            msgInput.classList.add('hidden');
            msgBox.classList.remove('hidden');
            msgButtonOk.classList.remove('hidden');

            msgButtonOk.onclick = () => {
                msgBox.classList.add('hidden');
                resolve(true);
            };

            msgButtonCancel.onclick = () => {
                msgBox.classList.add('hidden');
                resolve(false);
            };
        }
    });
}

function showAlertBox(title, text, options={}) {
    const {
        as_win = false,
        icon = '⚠️'
    } = options;
    if (!as_win) {
        const msgBox = document.getElementById('msg-box');
        const msgTitle = document.getElementById('msg-box-title');
        const msgText = document.getElementById('msg-box-text');
        const msgInput = document.getElementById('msg-box-input');
        const msgButtonOk = document.getElementById('msg-box-okbtn');
        const msgButtonCancel = document.getElementById('msg-box-cancelbtn');
        const bgOverlay = document.getElementById('msg-box-bgoverlay');

        sysPlaySound('error');

        bgOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.445)";

        msgTitle.textContent = title;
        msgText.textContent = text;
        msgButtonOk.textContent = "Sin definir";
        msgButtonCancel.textContent = "Ok";

        msgBox.style.zIndex = topZ + 10;
        bgOverlay.style.zIndex = topZ + 9;

        msgInput.classList.add('hidden');
        msgBox.classList.remove('hidden');
        msgButtonOk.classList.add('hidden');
        bgOverlay.classList.remove('hidden');

        msgButtonCancel.addEventListener("click", () => {
            msgBox.classList.add('hidden');
            bgOverlay.classList.add('hidden');
        });
    } else {
        const msgBox = document.getElementById('msg-box-win');
        const msgTitle = document.getElementById('msg-box-win-title');
        const msgText = document.getElementById('msg-box-win-text');
        const msgInput = document.getElementById('msg-box-win-input');
        const msgButtonOk = document.getElementById('msg-box-win-okbtn');
        const msgButtonCancel = document.getElementById('msg-box-win-cancelbtn');
        const msgIcon = document.getElementById('msg-box-win-icon');

        sysPlaySound('error');


        msgTitle.textContent = title;
        msgText.textContent = text;
        msgButtonOk.textContent = "Sin definir";
        msgButtonCancel.textContent = "Ok";
        msgIcon.textContent = icon;

        msgBox.style.zIndex = topZ + 10;

        msgInput.classList.add('hidden');
        msgBox.classList.remove('hidden');
        msgButtonOk.classList.add('hidden');

        msgButtonCancel.addEventListener("click", () => {
            msgBox.classList.add('hidden');
        });
    }
}
/*Ejemplo de uso - confirmacion
                                              ⬇ Titulo         ⬇ Pregunta                           ⬇ Texto del boton 1   ⬇ Texto del boton 2
const confirmDeleteData = await showMsgBox("⚠️ Advertencia!","Quieres borrar todos tus datos?", "Eliminar mis datos", "Cancelar");
    if (confirmDeleteData) {
        //Que hacer si se confirma y despues si quieres pon algun else o algo :D
    }

Y para las alertas
               ⬇ Titulo          ⬇ Texto de la alerta
showAlertBox("⚠️ Advertencia!","Este es un mensaje de alerta.");



Y para los prompts:
async function preguntarNombre() {//        ⬇ Titulo       ⬇ Pregunta       ⬇ Boton 1   ⬇ Texto del boton 2
    const nombre = await showPromptMsgBox('Nombre', 'Cual es tu nombre?', 'Enviar', 'Cancelar');
    if (!nombre.confirmed) return; //cerrar si se cancela
    if (!nombre.value) { //mostrar error si no se ingresa nada
        showAlertBox('Error','Ingresa un nombre');
        return;
    }

    //codigo
}










*/

//---------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------------
/*Sistema */
/*funciones del sistema*/
const askForPasswordWin = document.getElementById('win_askforuserspassword');
const loginscrLoginText = document.getElementById('loginscr_logintext');
const loginscr = document.getElementById('loginscr');
let loginin_user = '';

async function sysshutdown() {
    try {
        if (SysVar.blockShutdown) {
            showAlertBox('❌ Error', 'function sysshutdown() is blocked by your administrator');
        } else {
            const confirmSysShutdown = await showMsgBox("⚠️ Advertencia!","Quieres apagar el sistema? Asegurate de guardar tus datos", "Apagar", "Cancelar");
            if (confirmSysShutdown) {
                localStorage.setItem('sys_status', 'shutdown');
                hideTopBar();
                hideAppBar();
                sysComQuitTasks();
                setTimeout(() => {
                    document.body.style.backgroundImage = "url('assets/bs.png')";
                    setTimeout(() => {
                        document.body.classList.add("hidden");
                        const sysScripts = document.querySelectorAll('script');
                        sysScripts.forEach(script => script.parentNode.removeChild(script));
                        localStorage.setItem('sys_status', 'off');
                        saveDataReg();
                        window.close();
                    }, 1100);
                }, 900);
                
            }
        }
    }  catch (error) {
        console.error('Failed to shutdown system: ', error);
        showAlertBox('❌ Error', 'El sistema no se pudo apagar');
    }
}

async function sysrestart() {
    try {
        const confirmSysRestart = await showMsgBox("⚠️ Advertencia!","Quieres reiniciar el sistema? Asegurate de guardar tus datos", "Reiniciar", "Cancelar");
        if (confirmSysRestart) {
            hideTopBar();
            hideAppBar();
            sysComQuitTasks();
            localStorage.setItem('sys_status', 'off');
            setTimeout(() => {
                saveDataReg();
                window.location.href = "index.html";
            }, 2200);   
        }
    } catch (error) {
        console.error('Failed to reboot system: ', error);
        showAlertBox('❌ Error', 'El sistema no se pudo reiniciar');
    }
}
/*
function showSysinfo(inTabId) {
    showSysinfo(inTabId)

}*/

function showappinfo() {
    showAlertBox("⚠️ Advertencia!","No hay informacion de la aplicacion actual");
}

function hideTopBar() {
    const topBar = document.getElementById('top_bar');
    topBar.style.transform = 'translateY(-100%)';
}

function showTopBar() {
    const topBar = document.getElementById('top_bar');
    topBar.style.transform = 'translateY(0)';
}

function hideAppBar() {
    const appBar = document.getElementById('appbar');
    appBar.style.transform = 'translateX(-100vw)';
}

function showAppBar() {
    const appBar = document.getElementById('appbar');
    appBar.style.transform = 'translateX(0)';
}
appsLabel = document.getElementById('app-labels');
document.querySelectorAll(".appbar-app").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
        const rect = btn.getBoundingClientRect();
        appsLabel.textContent = btn.querySelector("img").alt;
        appsLabel.style.left = rect.right + 8 + "px";
        appsLabel.style.top = rect.top + rect.height / 2 + "px";
        appsLabel.style.opacity = "1";
        appsLabel.style.transform = "translateY(-50%)";
    });
    btn.addEventListener("mouseleave", () => {
        appsLabel.style.opacity = "0";
    });
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

//appcenter
const appCenterClsBtn = document.getElementById('appcenterclose');
const appCenterWindow = document.getElementById('win_appcenter');
appCenterClsBtn.addEventListener('click', () => {
    appCenterWindow.classList.add('hidden');
});

function hideappcenter() {
    appCenterWindow.classList.add('hidden');
}

function sysBlurSetto(blurlevel) {
    document.documentElement.style.setProperty('--blur-multiplier', blurlevel);
}
//---------------------------------------------------------------------------------------------------------------------
/*reloj */
function updateTime() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    let period = "";

    if (!SysVar.format24h) {
        period = hours >= 12 ? " PM" : " AM";
        hours = hours % 12 || 12;
    }

    const h = hours.toString().padStart(2, "0");
    const m = minutes.toString().padStart(2, "0");
    const s = seconds.toString().padStart(2, "0");

    timeText = document.getElementById('timetext');
    timeText.textContent = `${h}:${m}:${s}${period}`;
}


const startButton = document.getElementById('topbar_button');
const startDropdown = document.getElementById('start-dropdown');

let startDPOpen = false;

startButton.addEventListener("click", (e) => {
    e.stopPropagation();

    if (startDPOpen) {
        startDropdown.classList.add('hidden');
        startDPOpen = false;
        return;
    }

    const rect = startButton.getBoundingClientRect();

    startDropdown.style.left = rect.left + "px";
    startDropdown.style.top = rect.bottom + "px";
    startDropdown.classList.remove('hidden');

    startDPOpen = true;
});

startDropdown.addEventListener("click", () => {
    startDropdown.classList.add('hidden');
    startDPOpen = false;
});

document.addEventListener("click", () => {
    if (!startDPOpen) return;

    startDropdown.classList.add('hidden');
    startDPOpen = false;
});



const nekiriAnswersAccess = [
    'Claro que si {user}!',
    'Con gusto :3',
    'Por supuesto {user} :3',
    'Enseguida!',
    'oks :3'
]

function getRandomNekiriRes(type, array) {
    if (type === 'array') {
        return array[Math.floor(Math.random() * array.length)];
    } else if (type === 'access') {
        return nekiriAnswersAccess[Math.floor(Math.random() * nekiriAnswersAccess.length)];
    } else {
        return 'Invalid type given: ' + type + ' - Please use "array" or "access"';
    }
}

const nekiriInput = document.getElementById('nekiri_input');
const nekiriRes = document.getElementById('nekiri_response');
const nekiriSend = document.getElementById('nekiri_send');

let nekiriDPOpen = false;
const nekiriButton = document.getElementById('topbar_nekiri');
const nekiriDropdown = document.getElementById('nekiri-dropdown');

nekiriButton.addEventListener('click', (e) => {
    e.stopPropagation();

    if (nekiriDPOpen) {
        nekiriDropdown.classList.add('hidden');
        nekiriDPOpen = false;
        return;
    }

    const rect = nekiriButton.getBoundingClientRect();

    nekiriDropdown.style.right = (window.innerWidth - rect.right) + "px";
    nekiriDropdown.style.top = rect.bottom + "px";

    nekiriDropdown.classList.remove('hidden');

    nekiriDPOpen = true;
});

nekiriSend.addEventListener('click', () => {
    nekiriShowAnswer();
});

nekiriInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        nekiriShowAnswer();
    }
});

let nekiriAnswers = [];




function nekiriShowAnswer() {
    const userInput = nekiriInput.value.toLowerCase();

    if (userInput.includes('hola')) {
        nekiriAnswers = [
            "Hola "+ 'userName' +"! En qué puedo ayudarte hoy? :3",
            "Nya~ ¡Hola! ¿Cómo estás? :3",
            "¡Holi! ¿Qué tal tu día? uwu",
            "¡Hey! ¿En qué te puedo ayudar "+ 'userName' +"? nya~"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('estas?') || userInput.includes('estás?')) {
        nekiriAnswers = [
            "Bien uwu, gracias por preguntar! nya~",
            "Muy bien! ¿Y tú? :3",
            "Genial! Lista para ayudarte nya~",
            "De maravilla uwu ¿Cómo estás tú?"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('puedes hacer?')) {
        nekiriAnswers = [
            "Puedo ayudarte a navegar por el sistema, entretenerte, contarte chistes, etc...",
            "Te puedo entretener con chistes o cosas curiosas como la toybox!",
            "Puedo ayudarte con cualquier cosa sobre NyxPaw OS, si necesitas ayuda solo dime!",
            "Puedo aumentar tu productividad ayudandote a abrir apps, dandote tips, evitando que procastines jeje, y muchas cosas mas :D"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('aburrid')) {
        nekiriAnswers = [
            "Parece que estas aburrido... Te puedo contar chistes o podemos charlar un rato si quieres :D",
            "Hmmm... podrías intentar personalizar el sistema! En la toybox hay varias opciones de personalizacion!",
            //"Puedes personalizar el sistema aun mas! Solo entra a la NyxPaw Store, ve a plugins, y activa el plugin de 'Toybox++'!",
            "Te puedo contar chistes o si quieres solo hablemos un rato :D"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('chiste') || userInput.includes('divierteme')) {
        nekiriAnswers = [
            "Toma un chiste BUENISIMO: Por qué los gatos no usan computadoras? Porque les da miedo el ratón! JAJAJAJ Por favor ríete 😭",
            "Qué le dice un gato a otro gato? Miau! ...Ok ese estuvo malo nya~ xD",
            "Cómo se dice gato en japonés? Neko! Y en español? ...Gato xD Lo siento ese fue horrible 😭",
            "Por qué el gato cruzó la calle? Para llegar al otro lad... ESPERA! Esa era la del pollo! nya~ :3"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('tiste')) {
        nekiriAnswers = [
            "Oh no, lo siento mucho "+ 'userName' +"... recuerda que siempre puedes abrir la app de notas y escribir lo que sientes, a veces ayuda mucho :3",
            "Aww, "+ 'userName' +"... ¿quieres hablar sobre ello? Estoy aquí para escucharte nya~",
            "Lo siento mucho uwu... Escribir en las notas puede ayudar a desahogarte :3",
            "Lamento escuchar eso... podemos hablar sobre eso si quieres..."
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('sistema') && (userInput.includes('version') || userInput.includes('versión'))) {
        nekiriAnswers = [
            "Acabo de abrir mi ventana de 'Acerca de' para ti :3",
            "Revisa la ventana 'Acerca de' para ver la versión del sistema nya~ :3",
            "Puedes ver la versión del sistema en la ventana 'Acerca de' uwu"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('therian') || userInput.includes('furr')) {
        nekiriAnswers = [
            "Los therians no son furros!! Los therians sienten una conexión espiritual con los animales, los furros disfrutan de usar fursuits o mas que nada el hobby como tal, me explico?",
            "Mucha gente se confunde, pero los therians no son lo mismo que los furros... Los furros simplemente disfrutan del hobby (arte, trajes, etc...) y los therians sienten una conexión espiritual!",
            "Hay una gran diferencia entre los therians y los furros, pero mucha gente los confunde. Los therians sienten una conexión espiritual con los animales, los furros disfrutan de usar fursuits o mas que nada el hobby como tal, me explico?"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
        //aqui mostrar tarjetita con info
    } else if (userInput.includes('gracias') || userInput.includes('agrade')) {
        nekiriAnswers = [
            "De nada! Si necesitas otra cosa solo dime :D",
            "Con gusto :3 Si ocupas ayuda con algo dime :D",
            "De nada :3 Si necesitas que te ayude en algo mas dime."
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    } else if (userInput.includes('ja') || userInput.includes('je') || userInput.includes('ji') || userInput.includes('jo') || userInput.includes('ju') || userInput.includes('jsj')) {
        nekiriAnswers = [
            "Me alegra que te hayas reido :3",
            "Me pone feliz que estes feliz! Jajaja",
            "Gracias por reir! Todos se burlan de mi... menos tu!"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
    }
    
    
    
    
    
    
    
    //abrir apps (basico xq muy dificil hacer que las instaladas tambien xD)
    else if (userInput.includes('abr') && (userInput.includes('config') || userInput.includes('ajust'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('settings');
    } else if (userInput.includes('abr') && (userInput.includes('nota') || userInput.includes('note'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('notes');
    } else if (userInput.includes('abr') && (userInput.includes('calc') || userInput.includes('matem'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('calc');
    } else if (userInput.includes('abr') && (userInput.includes('navegador') || userInput.includes('internet'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('browser');
    } else if (userInput.includes('abr') && (userInput.includes('archivo') || userInput.includes('documento'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('files');
    } else if (userInput.includes('abr') && (userInput.includes('calendar') || userInput.includes('fecha'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('calendar');
    } else if (userInput.includes('abr') && (userInput.includes('terminal') || userInput.includes('com'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('terminal');
    } else if (userInput.includes('abr') && (userInput.includes('toybox') || userInput.includes('diver'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('toybox');
    } else if (userInput.includes('abr') && (userInput.includes('video') || userInput.includes('player'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('nyxvideoplayer');
    } else if (userInput.includes('abr') && (userInput.includes('imagen') || userInput.includes('image'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('nyximageviewer');
    } else if (userInput.includes('abr') && (userInput.includes('store') || userInput.includes('tienda'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('nyxpawstore');
    } else if (userInput.includes('abr') && (userInput.includes('ytcl') || userInput.includes('youtube'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('nytclient');
    } else if (userInput.includes('abr') && (userInput.includes('task') || userInput.includes('tareas'))) {
        nekiriRes.textContent = getRandomNekiriRes('access', null);
        sysExecApp('taskmanager');
    }
    
    
    
    
    
    
    else {
        nekiriAnswers = [
            "Disclulpa, pero no te entendí, puedes buscar en internet :D",
            "Hmmm... no te he entendido, puedes explicarlo mejor?",
            "No te entendí, pero encontre esto en internet:"
        ]
        nekiriRes.textContent = getRandomNekiriRes('array', nekiriAnswers);
        //mostrar tarjetita con boton para buscar en google
    }

    userInput.value = '';
}




//sys shortcuts
const sysEmgMenu = document.getElementById('sys-emg-menu');

document.addEventListener('keydown', e => {
    if (e.repeat) return;

    if (e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === 'm') {
        if (!sysEmgMenuTimer) {
            sysEmgMenuTimer = setTimeout(() => {
                sysEmgMenu.classList.remove('hidden');
                sysEmgMenu.style.zIndex = topZ + 10;
            }, 1000);
        }
    }

    if (e.ctrlKey && e.shiftKey && e.key.toLocaleLowerCase() === 'e') {
        sysShowRunDialog();
    }
});

document.addEventListener('keyup', () => {
    clearTimeout(sysEmgMenuTimer);
    sysEmgMenuTimer = null;
})






  








/*Sonidos UI */
function sysPlaySound(soundname) {
    if (SysVar.sessionAutoStart.includes('audio')) {
        if (SysVar.systemSound[soundname]) {
            SysVar.systemSound[soundname].currentTime = 0;
            SysVar.systemSound[soundname].play().catch(e => console.log('Failed to play system sound'));
        }
    } else {
        console.error('Audio Service not found');
        showAlertBox('Error', 'System Audio Service not found!', {as_win:true,icon:'❌'});
    }
}

function sysExecApp(appName, options = {}) {
    if (typeof AppManager === 'undefined') {
        console.error('AppManager not avilable');
        return;
    }

    if (SysVar.lockedSession) {
        console.error('Session locked');
        showAlertBox('Error', 'The current session is locked by your administrator', {as_win:true,icon:'❌'});
        return;
    }

    if (appName === 'appcenter') {
        const appCenter = document.getElementById('win_appcenter');
        if (appCenter) {
            appCenter.classList.remove('hidden');
            return;
        }
    }

    AppManager.loadApp(appName)
        .then(() => {
            const windowExceptions = {settings: 'win_config'};
            const windowID = windowExceptions[appName] || `win_${appName}`;
            const windowEL = document.getElementById(windowID);

            if (windowEL && windowEL.classList.contains('fullscreen')) {
                sysFullscreenApp(appName, true);
            }

            if (options.tab && typeof window[`openSettingsTab`] === 'function') {
                window[`openSettingsTab`](options.tab);
            }
        })
        .catch(err => {
            console.error(`Failed to execute '${appName}': `, err);
            showAlertBox('❌ Error', `Hubo un error al abrir ${appName}`);
        });
}

function sysComQuitTasks() {
    const loadedApps = AppManager.getLoadedApps();
    for (const appName of loadedApps) {
        AppManager.unloadApp(appName);
    }
}

function sysFullscreenApp(appName, enable = true) {
    const windowExceptions = {
        settings: 'win_config'
    };

    const windowID = windowExceptions[appName] || `win_${appName}`;
    const windowEL = document.getElementById(windowID);

    if (!windowEL) {
        console.error(`Window not found: ${windowID}`);
        return false;
    }

    if (enable) {
        windowEL.classList.add('win-fullscreen');
        windowEL.classList.remove('win-max');
        hideTopBar();
        hideAppBar();
    } else {
        windowEL.classList.remove('win-fullscreen');
        showTopBar();
        showAppBar();
    }

    return true;
}

window.sysFullscreenApp = sysFullscreenApp;
window.sysExecApp = sysExecApp;
window.sysComQuitTasks = sysComQuitTasks;

async function sysShowRunDialog() {
    const commandRun = await showPromptMsgBox('⬆️ Ejecutar', 'Ingresa el ID o quickCommand para ejecutar', 'Ejecutar', 'Cancelar');
    if (!commandRun.confirmed) return;
    if (!commandRun.value) {
        showAlertBox('⚠️ Advertencia','Ingresa un ID o quickCommand valido!');
        return;
    }
    try {

        const fullCommand = commandRun.value.split(" ");
        const command = fullCommand[0];
        const args = fullCommand.slice(1);

        if (command === '--app') {
            sysExecApp(args[0]);
        } else if (command === '--q') {
            if (args[0] === 'runProg') {
                sysExecApp(args[1]);
            } else if (args[0] === 'shutdown') {
                if (args[1] === '--now') {
                    sysshutdown();
                } else {
                    const shutdownTime = args[1];
                    setTimeout(() => {
                        sysshutdown();
                    }, shutdownTime);
                }
            }
        } else if (command === '--terminal') {
            sysExecApp('terminal');
            setTimeout(() => runCommand(args[0]), 90)
        } else if (command === '--devmode') {
            if (SysVar.devMode) {
                if (args[0] === '--as$npss') {
                    if (args[1] === 'system.appBar.show()') {
                        showAppBar();
                    } else if (args[1] === 'system.appBar.hide()') {
                        hideAppBar();
                    } else if (args[1] === 'system.topBar.show()') {
                        showTopBar();
                    } else if (args[1] === 'system.topBar.hide()') {
                        hideTopBar();
                    } else if (args[1] === 'system.bypass.loginscr()') {
                        loginscr.classList.add('hidden');
                    } else if (args[1] === 'mod.desktopBG()') {
                        document.body.style.backgroundImage = `url(${args[2]})`;
                    } else {
                        showAlertBox('❌ Error', `${args[1]} is not supported as a NyxPawBasicScript! This error might occur if:\n- The script is too large\n- The script did not execute with enough permissions`)
                    }
                } else if (args[0] === '--as$npss') {
                    showAlertBox('❌ Error', 'npss (NyxPawSystemScripts) are no longer supported on quickCommand, please use the terminal or execute a npbs (NyxPawBasicScript).');
                } else if (args[0] === '--as$jsgs') {
                    const FNStr = args[1];
                    const FNMatch = FNStr.match(/^(\w+)\((.*)\)$/);

                    if (FNMatch) {
                        const jscomFN = FNMatch[1];
                        const jscomArgs = FNMatch[2].split(',').map(a => a.trim());

                        if (typeof window[jscomFN] === 'function') {
                            window[jscomFN](...jscomArgs);
                        }
                    }
                }
            } else {
                showAlertBox('❌ Error', 'No tienes permisos para ejecutar el comando: Modo dev no activado!')
            }
        }

    } catch(error) {
        showAlertBox('❌ Error','Error:'+error);
    }
}


if (usedBefore) {
    if (!SysVar.sessionAutoStart.includes('input')) {
        document.body.style.pointerEvents = 'none';
        document.documentElement.style.cursor = 'none';
    }
}

async function formatSystem() {
    const confirmDeleteData = await showMsgBox("⚠️ ALERTA!", "Estas a punto de borrar todos tus datos y configuraciones! Realmente quieres proceder? Tu sistema se apagara!", "Eliminar mis datos", "Cancelar");
    if (confirmDeleteData) {
        sysComQuitTasks();
        hideAppBar();
        hideTopBar();

        localStorage.clear();

        setTimeout(() => {
            window.close();
        }, 2000);
    }
}

function tempSysAddEvent(type, title, info) {
    const newEvent = {
        type: type,
        title: title,
        info: info,
        date: new Date()
    };

    SysVar.sysEvents.unshift(newEvent);
}

const showABEnabled = SysVar.showconsoleerr;

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('error', (e) => {
        if (e.filename && e.filename.includes(window.location.origin)) {
            //const errorMsg = `${e.message}\nArchivo: ${e.filename}\nLínea: ${e.lineno}`;
            const errorMsg = `Error: ${e.message}`;
            if (showABEnabled.checked) {
                showAlertBox('Error', errorMsg, {as_win:true, icon:'❌'});
            }
            try {
                sysAddEvent('error', 'Error', errorMsg);
            } catch(error) {
                tempSysAddEvent('error', 'Error', errorMsg);
            }
        }
    });

    window.addEventListener('unhandledrejection', (e) => {
        const errorMsg = `Error: ${e.reason}`;
        if (showABEnabled.checked) {
            showAlertBox('Error', errorMsg, {as_win:true, icon:'❌'});
        }
        try {
            sysAddEvent('error', 'Error', errorMsg);
        } catch(error) {
            tempSysAddEvent('error', 'Error', errorMsg);
        }
    })
});

const originalWarn = console.warn;
const originalError = console.error;

const isMainWindow = window === window.top;

console.warn = function(...args) {
    originalWarn.apply(console, args);

    if (isMainWindow) {
        const errorMsg = args.join(' ');
        if (showABEnabled.checked) {
            showAlertBox('Advertencia', errorMsg, {as_win:true, icon:'⚠️'});
        }
        try {
            sysAddEvent('warn', 'Warning', errorMsg);
        } catch(error) {
            tempSysAddEvent('warn', 'Warning', errorMsg);
        }
    }
}

console.error = function(...args) {
    originalError.apply(console, args);

    if (isMainWindow) {
        const errorMsg = args.join(' ');
        if (showABEnabled.checked) {
            showAlertBox('Error', errorMsg, {as_win:true, icon:'❌'});
        }
        try {
            sysAddEvent('error', 'Error', errorMsg);
        } catch(error) {
            tempSysAddEvent('error', 'Error', errorMsg);
        }
    }
}


window.scriptReady('sys');