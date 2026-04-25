console.log('Current: apps/nyxpawsheets.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.nyxpawsheets = {
    displayName: 'NyxPaw Sheets',
    icon: '../../assets/apps/nyxpawsheets.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:

const npshtData = {};
const npshtCols = 10;
const npshtRows = 20;
let npshtSelectedCell = null;
let npshtIsEditing = false;
let npshtCurrentCell = null;
let npshtCurrentFormula = null;
let npshtRangeStart = null;
const npshtInput = document.getElementById('npsht_cell_input');

function npshtUpdateCurrentCell(cellId) {
    npshtCurrentCell = cellId;
    npshtCurrentFormula = npshtData[cellId] ?? null;

    document.getElementById('npsht_span_currentcell').textContent = `[${cellId}]`;
    document.getElementById('npsht_span_currentfx').textContent = `[${npshtCurrentFormula}]`;
}

function npshtEval(formula) {
    let expression = formula.slice(1).toUpperCase();
    expression = expression.replace(/[A-Z]+\d+/g, (ref) => {
        const val = npshtData[ref];
        if (val === undefined || val === '') return 0;
        if (typeof val === 'string' && val.startsWith('=')) {
            return npshtEval(val);
        }
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    });
    try {
        const result = Function('"use strict"; return (' + expression + ')')();
        return isNaN(result) ? '#ERROR' :  result;
    } catch {
        return '#ERROR';
    }
}

function npshtStartEditing(td) {
    npshtIsEditing = true;
    const container = document.getElementById('npsht_sheet_container');

    npshtInput.style.display = 'block';
    npshtInput.style.left = (td.offsetLeft - container.scrollLeft) + 'px';
    npshtInput.style.top = (td.offsetTop - container.scrollTop) + 'px';
    npshtInput.style.width = td.offsetWidth + 'px';
    npshtInput.style.height = td.offsetHeight + 'px';

    const cellId = td.dataset.cell;
    npshtInput.value = npshtData[cellId] ?? '';
    npshtInput.focus();
    npshtInput.select();
}

function npshtStopEditing() {
    if (!npshtSelectedCell || !npshtIsEditing) return;
    npshtIsEditing = false;

    const cellId = npshtSelectedCell.dataset.cell;
    const value = npshtInput.value.trim();

    if (value === '') {
        delete npshtData[cellId];
    } else {
        npshtData[cellId] = value;
    }

    npshtRenderAll();

    //npshtSelectedCell.textContent = npshtInput.value;
    npshtInput.style.display = 'none';
    npshtInput.value = '';
}

function npshtRenderAll() {
    document.querySelectorAll('#npsht_sheet td').forEach(td => {
        npshtRenderCell(td, td.dataset.cell);
    });
}

function npshtRenderCell(td, cellId) {
    const raw = npshtData[cellId] ?? '';
    if (raw.startsWith('=')) {
        td.textContent = npshtEval(raw);
    } else {
        td.textContent = raw;
    }
    
}

const npshtTHead = document.querySelector('#npsht_sheet thead');
const npshtTBody = document.querySelector('#npsht_sheet tbody');

const npshtHeaderRow = document.createElement('tr');
npshtHeaderRow.innerHTML = '<th class="npsht_corner"></th>';

for (let c = 0; c < npshtCols; c++) {
    const th = document.createElement('th');
    th.textContent = String.fromCharCode(65 + c);
    npshtHeaderRow.appendChild(th);
}
npshtTHead.appendChild(npshtHeaderRow);

for (let r = 1; r <= npshtRows; r++) {
    const tr = document.createElement('tr');
  
    const rowHeader = document.createElement('th');
    rowHeader.textContent = r;
    tr.appendChild(rowHeader);

    for (let c = 0; c < npshtCols; c++) {
        const td = document.createElement('td');
        td.dataset.cell = `${String.fromCharCode(65 + c)}${r}`;
        tr.appendChild(td);
    }
    
    npshtTBody.appendChild(tr);
}

document.querySelector('#npsht_sheet').addEventListener('click', (e) => {
    const td = e.target.closest('td');
    if (!td) return;

    document.querySelectorAll('#npsht_sheet td.npsht_selected')
        .forEach(el => el.classList.remove('npsht_selected'));

    if (e.shiftKey && npshtRangeStart) {
        const range = npshtiGetRange(npshtRangeStart, td.dataset.cell);
        range.forEach(cellId => {
            const cell = document.querySelector(`#npsht_sheet td[data-cell="${cellId}"]`);
            if (cell) cell.classList.add('npsht_selected');
        });

        npshtSelectedCell = td;
    } else {
        npshtRangeStart = td.dataset.cell;
        npshtSelectedCell = td;
        td.classList.add('npsht_selected');
    }

    const cellId = td.dataset.cell;
    const col = cellId.match(/[A-Z]+/)[0];
    const row = cellId.match(/\d+/)[0];

    document.querySelectorAll('.npsht_header_active').forEach(el => el.classList.remove('npsht_header_active'));
    document.querySelectorAll(`#npsht_sheet thead th`).forEach(th => {
        if (th.textContent === col) th.classList.add('npsht_header_active');
    });
    document.querySelectorAll(`#npsht_sheet tbody th`).forEach(th => {
        if (th.textContent === row) th.classList.add('npsht_header_active');
    });
    npshtUpdateCurrentCell(td.dataset.cell);
});

document.querySelector('#npsht_sheet').addEventListener('dblclick', (e) => {
    const td = e.target.closest('td');
    if (!td) return;
    npshtStartEditing(td);
});

npshtInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        npshtStopEditing();
    }
    if (e.key === 'Escape') {
        npshtInput.value = '';
        npshtStopEditing();
    }
});

npshtInput.addEventListener('blur', () => {
    npshtStopEditing();
});
function npshtSetCellColor(cellId='A1', color='#ffffff', type='background') {
    const td = document.querySelector(`#npsht_sheet td[data-cell="${cellId}"]`);
    if (!td) return;
    if (type == 'background') {
        td.style.backgroundColor = color;
    } else {
        td.style.color = color;
    }
}
function npshtiGetRange(startId, endId) {
    const colStart = startId.match(/[A-Z]+/)[0];
    const rowStart = parseInt(startId.match(/\d+/)[0]);
    const colEnd   = endId.match(/[A-Z]+/)[0];
    const rowEnd   = parseInt(endId.match(/\d+/)[0]);

    const c1 = Math.min(colStart.charCodeAt(0), colEnd.charCodeAt(0));
    const c2 = Math.max(colStart.charCodeAt(0), colEnd.charCodeAt(0));
    const r1 = Math.min(rowStart, rowEnd);
    const r2 = Math.max(rowStart, rowEnd);

    const cells = [];
    for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
            cells.push(`${String.fromCharCode(c)}${r}`);
        }
    }
    return cells;
}

function npshtOpenColorDP(type) {
    const colorPicker = document.getElementById('npsht_colorpicker');
    const button = document.querySelector(`button[onclick="npshtOpenColorDP('${type}')"]`);
    const btnRect = button.getBoundingClientRect();
    const workspaceRect = document.getElementById('npsht_workspace').getBoundingClientRect();

    colorPicker.style.position = 'absolute';
    colorPicker.style.left = (btnRect.left - workspaceRect.left) + 'px';
    colorPicker.style.top = (btnRect.bottom - workspaceRect.top) + 'px';
    colorPicker.dataset.type = type;
    colorPicker.click();
}

document.getElementById('npsht_colorpicker').addEventListener('input', (e) => {
    if (!npshtSelectedCell) return;
    const type = e.target.dataset.type === 'bg' ? 'background' : 'text';
    npshtSetCellColor(npshtCurrentCell, e.target.value, type);
});

function npshtSaveCurrent() {
    sysExecApp('files');

    (async () => {
        await waitUntil(() => typeof filesOpenSaveDialog === 'function');
        filesOpenSaveDialog();

        await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === true);
        await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === false);
                
        if (SysVar.pointerFilesSaveDialogSaveYN) {
            const filename = SysVar.pointerFilesSaveDialogFilename.trim();

            if (!filename) {
                showAlertBox('⚠️ Advertencia!', 'Ingresa un nombre para el archivo!');
                return;
            }

            const finalFilename = filename.includes('.qsht') ? filename : filename + '.qsht';
            const content = JSON.stringify(npshtData);
            let success = false;
            if (window.fs.fileExistInPath(finalFilename, window.fs.getCurrentDirectory())) {
                success = window.fs.modifyFile(finalFilename, content);
            } else {
                success = window.fs.createFile(finalFilename, content);
            }
                    

            if (success) {
                console.log(`Document saved as: ${finalFilename}`);
                        
            } else {
                console.error('Cannot save document');
                showAlertBox('❌ Error', 'Error al guardar el documento: Ya existe un archivo con el mismo nombre o no se pudo generar');
            }
                    
            SysVar.pointerFilesSaveDialogFilename = 'documento.qsht';
        }
        
        SysVar.pointerFilesSaveDialogSaveYN = false;
    })();
}

window.nyxpawsheetsSetContent = function(jsonString) {
    if (!AppManager.loadedApps.has('nyxpawsheets')) {
        AppManager.loadApp('nyxpawssheets').then(() => {
            setTimeout(() => {
                Object.assign(npshtData, JSON.parse(jsonString));
                npshtRenderAll();
            }, 70);
            
        });
        return;
    }
    Object.assign(npshtData, JSON.parse(jsonString));
    npshtRenderAll();
}




//Codigo arriba ⬆️⬆️

function init_nyxpawsheets() {
    console.log('Initiating nyxpawsheets...');
}

function cleanup_nyxpawsheets() {
    console.log('Cleaning nyxpawsheets...');
}

window.scriptReady('nyxpawsheets');
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