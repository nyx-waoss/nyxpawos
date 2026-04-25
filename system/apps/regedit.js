console.log('Current: apps/regedit.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.regedit = {
    displayName: 'RegEdit',
    icon: '../../assets/apps/regedit.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:
let currentSection = 'jsfiles';

function regeditSectionGoto(section) {
    currentSection = section;
    if (currentSection === 'jsfiles') {
        document.getElementById('regedit_list').classList.remove('hidden');
        document.getElementById('regedit_listgownusr').classList.add('hidden');
        document.getElementById('regedit_btn_jsfiles').textContent = 'JAVASCRIPT_FILES 🔘';
        document.getElementById('regedit_btn_gownusr').textContent = 'GENERAL_OWN_USER';
    } else {
        document.getElementById('regedit_list').classList.add('hidden');
        document.getElementById('regedit_listgownusr').classList.remove('hidden');
        document.getElementById('regedit_btn_jsfiles').textContent = 'JAVASCRIPT_FILES';
        document.getElementById('regedit_btn_gownusr').textContent = 'GENERAL_OWN_USER 🔘';
    }
    updateList();
}

function getGlobalVars() {
    const vars = {};

    for (let prop in window) {
        try {
            const value = window[prop];

            if (
                typeof value !== 'function' &&
                value !== window &&
                value !== document &&
                value !== navigator &&
                !prop.startsWith('webkit') &&
                !prop.startsWith('on')
            ) {
                vars[prop] = value;
            }
        } catch (e) {
            //ignorar propiedades q tiren error
        }
    }

    return vars;
}

function getVarType(value) {
    if (typeof value === 'boolean') {
        return '🔘';
    } else if (typeof value === 'string') {
        return '🔤';
    } else if (typeof value === 'number') {
        return '🔢';
    } else if (typeof value === null) {
        return '⭕';
    } else if (typeof value === undefined) {
        return '❓';
    } else if (Array.isArray(value)) {
        return '📋';
    } else if (typeof value === 'object') {
        return '📦';
    } else {
        return '📄';
    }
}

function updateList() {
    if (currentSection === 'jsfiles') {
        const listContainer = document.getElementById('regedit_list');
        const vars = getGlobalVars();

        listContainer.innerHTML = '';

        for (let varName in vars) {
            const varValue = vars[varName];
            const icon = getVarType(varValue);

            const divEl = document.createElement('div');
            divEl.className = 'regedit_el';

            divEl.innerHTML = `
                <label>${icon}</label>
                <p>${varName}</p>
                <button onclick="modVarValue('${varName}','js')">✎</button>
            `;

            listContainer.appendChild(divEl);
        }



    } else if (currentSection === 'gownusr') {
        const listContainer = document.getElementById('regedit_listgownusr');
        listContainer.innerHTML = '';

        Object.keys(SysVar).forEach(varName => {
            const varValue = SysVar[varName];
            const icon = getVarType(varValue);
            
            const divEl = document.createElement('div');
            divEl.className = 'regedit_el';

            divEl.innerHTML = `
                <label>${icon}</label>
                <p>${varName}</p>
                <button onclick="modVarValue('${varName}','sys')">✎</button>
            `;

            listContainer.appendChild(divEl);
        });
    }
}

async function modVarValue(varName, sysmod) {
    if (sysmod === 'js') {
        const currentValue = window[varName];
        const alertBox = await showMsgBox(`Valor actual de ${varName}`, JSON.stringify(currentValue), "Modificar valor", "Cancelar", {as_win:true,icon:'🎛️'});
        if (!alertBox) {
            return;
        }
    } else if (sysmod === 'sys') {
        const currentValue = SysVar[varName];
        const alertBox = await showMsgBox(`Valor actual de ${varName}`, JSON.stringify(currentValue), "Modificar valor", "Cancelar", {as_win:true,icon:'🎛️'});
        if (!alertBox) {
            return;
        }
    } else {
        showAlertBox('Error', 'sysmod not valid', {as_win:true, icon:'❌'});
        return;
    }
    

    const typePrompt = await showPromptMsgBox(
        'Tipo de dato:',
        `1: Boolean, 2: String, 3: Number, 4: Object, 5: Array, 6: Null - Ingresar opcion:`,
        'Enviar',
        'Cancelar',
        {as_win:true,icon:'🎛️'}
    );
    if (!typePrompt.confirmed) return;
    const type = typePrompt.value;

    let newValue;

    switch(type) {
        case '1':
            const ansBool = await showPromptMsgBox('Boolean', 'true / false', 'Enviar', 'Cancelar', {as_win:true,icon:'🔘'});
            if (!ansBool.confirmed) return;
            newValue = ansBool.value.toLowerCase() === 'true';
            break;
        
        case '2':
            ansStr = await showPromptMsgBox('String', 'Texto:', 'Enviar', 'Cancelar', {as_win:true,icon:'🔤'});
            if (!ansStr.confirmed) return;
            newValue = ansStr.value;
            break;

        case '3':
            const ansNum = await showPromptMsgBox('Numero', 'Numero:', 'Enviar', 'Cancelar', {as_win:true,icon:'🔢'});
            if (!ansNum.confirmed) return;
            newValue = parseFloat(ansNum.value);
            if (isNaN(newValue)) {
                showAlertBox('Error', 'No es un numero', {as_win:true, icon:'❌'});
                return;
            }
            break;

        case '4':
            const ansObj = await showPromptMsgBox('Objeto', 'Ejemplo: {"info":"hello", "info2":123}', 'Enviar', 'Cancelar', {as_win:true,icon:'📦'});
            if (!ansObj.confirmed) return;
            try {
                newValue = JSON.parse(ansObj.value);
            } catch (e) {
                showAlertBox('Error', 'JSON invalido: ' + e.message, {as_win:true, icon:'❌'});
                return;
            }
            break;

        case '5':
            const ansArr = await showPromptMsgBox('Array', 'Ejemplo: [1, 2, 3, "text"]', 'Enviar', 'Cancelar', {as_win:true,icon:'📋'});
            if (!ansArr.confirmed) return;
            try {
                newValue = JSON.parse(ansArr.value);
                if (!Array.isArray(newValue)) {
                    showAlertBox('Error', 'Array invalido', {as_win:true, icon:'❌'});
                    return;
                }
            } catch(e) {
                showAlertBox('Error', 'JSON invalido: ' + e.message, {as_win:true, icon:'❌'});
                return;
            }
            break;

        case '6':
            newValue = null;
            break;

        default:
            showAlertBox('Error', 'Opcion invalida, elige una del 1-6', {as_win:true, icon:'❌'});
            return;
    }

    if (sysmod === 'js') {
        window[varName] = newValue;
    } else if (sysmod === 'sys') {
        SysVar[varName] = newValue;
    } else {
        showAlertBox('Error', 'sysmod not valid', {as_win:true, icon:'❌'});
        return;
    }
    
    

    updateList();
}





//Codigo arriba ⬆️⬆️

function init_regedit() {
    console.log('Initiating regedit...');
    updateList();
}

function cleanup_regedit() {
    console.log('Cleaning regedit...');
}

window.scriptReady('regedit');
//template version 2.0