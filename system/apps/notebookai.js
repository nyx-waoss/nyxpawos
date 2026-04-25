console.log('Current: apps/notebookai.js');
window.AppMetadata = window.AppMetadata || {};

window.AppMetadata.notebookai = {
    displayName: 'Notebook AI',
    icon: '../../assets/apps/nyxpawnotebook.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:

window.SysVar = window.SysVar || {};

let noboai_currentnotebook = '';
let noboai_currentcontent = '';
let noboai_currentchat = '';

let noboai_sidebar = null;
let noboai_conversation = null;
let noboai_nbtitle = null;
let noboai_nbtextarea = null;

function NBAISendMessage() {
    const noboai_inputEl = document.getElementById('noboai_userinput');
    const noboai_userMsg = noboai_inputEl.value.trim();
    if (!noboai_userMsg) return;

    let noboai_nkres = '';

    try {
        noboai_nkres = sysNekiriAsk(noboai_userMsg, [], 'notebookai', {notebookai_bookcontent:noboai_nbtextarea.value});
    } catch {
        console.error('Cannot get AI response:'+e);
        const noboai_currentNotebook = SysVar.notebookai_notebooks.find(nb => nb.title === noboai_currentnotebook);
        if (noboai_currentNotebook) {
            noboai_currentNotebook.chat.push({ from: 'user', msg: noboai_userMsg });
            noboai_currentNotebook.chat.push({ from: 'ai', msg: 'Lo siento, ocurrio un error. Vuelve a intentarlo mas tarde.' });
            NBAIRenderChat(noboai_currentNotebook.chat);
        }
        noboai_inputEl.value = '';
        return;
    }
    if ((noboai_nkres.code).startsWith('2') && noboai_nkres.code !== '202') {
        const noboai_currentNotebook = SysVar.notebookai_notebooks.find(nb => nb.title === noboai_currentnotebook);
        if (noboai_currentNotebook) {
            noboai_currentNotebook.chat.push({ from: 'user', msg: noboai_userMsg });
            noboai_currentNotebook.chat.push({ from: 'ai', msg: noboai_nkres.ans });
            NBAIRenderChat(noboai_currentNotebook.chat);
        }
    } else if (noboai_nkres.code === '202' && noboai_nkres.ans === 'expandir') {
        const nb = SysVar.notebookai_notebooks.find(nb => nb.title === noboai_currentnotebook);
        if (!nb) return;
        nb.chat.push({ from: 'user', msg: noboai_userMsg });
        nb.chat.push({ from: 'ai', msg: 'Oks! Por favor espera mientras busco informacion...' });
        document.getElementById('noboai_sendbtn').disabled = true;
        document.getElementById('noboai_sendbtn').innerHTML = '<img src="assets/loading.gif">';
        NBAIRenderChat(nb.chat);
        noboai_inputEl.value = '';
        nekiriExpandText(noboai_nbtextarea.value).then(expandResult => {
            nb.chat.pop();
            document.getElementById('noboai_sendbtn').disabled = false;
            document.getElementById('noboai_sendbtn').innerHTML = '↑';
            if (expandResult.ok) {
                nb.chat.push({ from: 'ai', msg: `Listo! Agregué info de "${expandResult.source}": ${expandResult.result}` });
            } else {
                const errores = {
                    'no_keywords': 'El texto es muy corto para buscar... :(',
                    'fetch_error': 'No pude conectarme a internet, intenta de nuevo uwu',
                    'no_results': 'No encontré info relevante sobre eso en internet :(',
                    'empty_extract': 'Encontré algo pero no pude leer el contenido...',
                    'no_good_sentence': 'No encontré oraciones útiles para agregar :('
                };
                nb.chat.push({ from: 'ai', msg: errores[expandResult.reason] || 'Oh, parece que algo salio mal. Vuelve a intentarlo dentro de un rato.' });
            }
            NBAIRenderChat(nb.chat);
        });
        return;
    } else if (noboai_nkres.code == '403') {
        const noboai_currentNotebook = SysVar.notebookai_notebooks.find(nb => nb.title === noboai_currentnotebook);
        if (noboai_currentNotebook) {
            noboai_currentNotebook.chat.push({ from: 'user', msg: noboai_userMsg });
            noboai_currentNotebook.chat.push({ from: 'ai', msg: 'Hmmm... Parece que no tengo permiso para ayudarte en eso, tienes alguna otra pregunta?' });
            NBAIRenderChat(noboai_currentNotebook.chat);
        }
    } else if (noboai_nkres.code == '422') {
        const noboai_currentNotebook = SysVar.notebookai_notebooks.find(nb => nb.title === noboai_currentnotebook);
        if (noboai_currentNotebook) {
            noboai_currentNotebook.chat.push({ from: 'user', msg: noboai_userMsg });
            noboai_currentNotebook.chat.push({ from: 'ai', msg: noboai_nkres.ans });
            NBAIRenderChat(noboai_currentNotebook.chat);
        }
    } else {
        const noboai_currentNotebook = SysVar.notebookai_notebooks.find(nb => nb.title === noboai_currentnotebook);
        if (noboai_currentNotebook) {
            noboai_currentNotebook.chat.push({ from: 'user', msg: noboai_userMsg });
            noboai_currentNotebook.chat.push({ from: 'ai', msg: `Lo siento, ha ocurrido un error: ${noboai_nkres.ans}` });
            NBAIRenderChat(noboai_currentNotebook.chat);
        }
    }

    noboai_inputEl.value = '';  
}

function NBAIRenderChat(chat) {
    noboai_conversation.innerHTML = '';
    if (chat.length === 0) {
        noboai_conversation.innerHTML = '<div class="msg-ai"><span>Hola! Si necesitas ayuda con algo solo dime! Estoy para ayudarte :D</span></div>'
    } else {
        chat.forEach((chatObj) => {
            //chatObj = {from:"user",msg:"Hola!"}
            const noboai_msgdiv = document.createElement('div');
            if (chatObj.from === 'user') {
                noboai_msgdiv.className = 'msg-user';
            } else if (chatObj.from === 'ai') {
                noboai_msgdiv.className = 'msg-ai';
            }

            const noboai_msgspan = document.createElement('span');
            noboai_msgspan.textContent = chatObj.msg;

            noboai_msgdiv.appendChild(noboai_msgspan);

            noboai_conversation.appendChild(noboai_msgdiv);
        });
    }

    noboai_conversation.scrollTo({
        top: noboai_conversation.scrollHeight,
        behavior: 'smooth'
    });
}

async function NBAIRenameNotebook(notebookObj) {
    if (notebookObj) {
        const newNotebookName = await showPromptMsgBox('Nuevo nombre', 'Nuevo nombre para '+notebookObj.title, 'Confirmar', 'Cancelar',{as_win:true,icon:'✏️'});
        if (!newNotebookName.confirmed) return;
        if (!newNotebookName.value) {
            showAlertBox('Error','Ingresa un nombre');
            return;
        }
        notebookObj.title = newNotebookName.value.trim();
        noboai_nbtitle.textContent = notebookObj.title;
        NBAIRenderSidebar();
    }
}

async function NBAIDelNotebook(notebookObj) {
    const noboai_confirmDeleteNB = await showMsgBox("Advertencia!",`Quieres borrar ${notebookObj.title}?\nEsta accion no se puede deshacer.`, "Eliminar", "Cancelar",{as_win:true,icon:'⚠️'});
    if (noboai_confirmDeleteNB) {
        const index = SysVar.notebookai_notebooks.indexOf(notebookObj);
        if (index !== -1) {
            SysVar.notebookai_notebooks.splice(index, 1);
        }

        if (noboai_currentnotebook === notebookObj.title) {
            noboai_currentnotebook = '';
            noboai_nbtitle.textContent = '';
            noboai_nbtextarea.value = '';
            document.getElementById('noboai_textarea').classList.add('hidden');
            NBAIRenderChat([]);
        }

        NBAIRenderSidebar();
    }
}

function NBAIGotoNBook(notebookToGo) {
    if (document.getElementById('noboai_textarea').classList.contains('hidden')) {
        document.getElementById('noboai_textarea').classList.remove('hidden');
    }

    noboai_currentnotebook = notebookToGo.title;
    noboai_nbtitle.textContent = notebookToGo.title;
    noboai_nbtextarea.value = notebookToGo.content;
    NBAIRenderChat(notebookToGo.chat);

    const noboai_editBtn = document.querySelector('.modifyname');
    noboai_editBtn.onclick = () => NBAIRenameNotebook(notebookToGo);

    const noboai_deleteBtn = document.querySelector('.deletenb');
    noboai_deleteBtn.onclick = () => NBAIDelNotebook(notebookToGo);
}

function NBAINewNotebook() {
    const noboai_newnbobj = {title:"Nuevo Cuaderno",content:"",chat:[]};
    SysVar.notebookai_notebooks.push(noboai_newnbobj);
    NBAIRenderSidebar();
    NBAIGotoNBook(noboai_newnbobj)
}

function NBAIRenderSidebar() {
    noboai_sidebar.innerHTML = '';
    if (SysVar.notebookai_notebooks.length === 0) {
        const noboai_nonotebooksp = document.createElement('p');
        noboai_nonotebooksp.textContent = 'No tienes cuadernos.';
        noboai_sidebar.appendChild(noboai_nonotebooksp);
    } else {
        SysVar.notebookai_notebooks.forEach((notebookObj) => {
            const noboai_notebookbtn = document.createElement('button');
            noboai_notebookbtn.textContent = `📕 ${notebookObj.title}`;
            noboai_notebookbtn.onclick = () => NBAIGotoNBook(notebookObj);

            noboai_currentnotebook = notebookObj.title;
            noboai_currentcontent = notebookObj.content;
            noboai_currentchat = notebookObj.chat;

            noboai_sidebar.appendChild(noboai_notebookbtn);
        });
    }

    const noboai_sidebardiv = document.createElement('div');
    noboai_sidebardiv.className = 'divider';
    noboai_sidebar.appendChild(noboai_sidebardiv);

    const noboai_newnbbtn = document.createElement('button');
    noboai_newnbbtn.textContent = `+ Nuevo Cuaderno`;
    noboai_newnbbtn.onclick = NBAINewNotebook;
    noboai_sidebar.appendChild(noboai_newnbbtn);
}

//Codigo arriba ⬆️⬆️

function init_notebookai() {
    console.log('Initiating notebookai...');
    noboai_sidebar = document.getElementById('noboai_sidebar');
    noboai_conversation = document.getElementById('noboai_conversation');
    noboai_nbtitle = document.getElementById('noboai_notebooktitle');
    noboai_nbtextarea = document.getElementById('noboai_textarea');

    document.getElementById('noboai_sendbtn').innerHTML = '↑';

    noboai_nbtextarea.addEventListener('input', () => {
        const currentNB = SysVar.notebookai_notebooks.find(nb => nb.title === noboai_currentnotebook);
        if (currentNB) {
            currentNB.content = noboai_nbtextarea.value;
        }
    });

    NBAIRenderSidebar();
}

function cleanup_notebookai() {
    console.log('Cleaning notebookai...');
    noboai_sidebar = null;
    noboai_conversation = null;
    noboai_nbtitle = null;
    noboai_nbtextarea = null;
}

window.scriptReady('notebookai');
//template version 3.1

//=========================================================
//Uso de requests:

/*const APPNAME_WINDOW_ID = 'win_appname'; //CAMBIAR NOMBRE DE VARIABLE!!
function solicitarFullscreen() {
    isFullscreen = !isFullscreen;
    window.parent.postMessage({
        action: 'fullscreen', <-- puede cambairse
        windowId: WINDOW_ID,
        enable: isFullscreen
    }, '*');
}*/

//puede ser:
// 'fullscreen'
// 'maximize'/'restore'
// launch 
// logout
// kill
// addtoappbar

//Cambiar todas las referencias de appname por el nombre de la app