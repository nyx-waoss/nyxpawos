console.log("Current: apps/calc.js");
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.calc = {
    displayName: 'Calculadora',
    icon: '../../assets/apps/calc/2.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

// Evitar redeclaración al reabrir la app
if (typeof window._calc_vars === 'undefined') {
    window._calc_vars = { currentInput: '', previousInput: '', operation: null };
}

function calcinnum(value) {
    const vars = window._calc_vars;
    const display = document.getElementById('calcdisplay');
    if (value >= '0' && value <= '9' || value === '00' || value === '.') {
        if (value === '.' && vars.currentInput.includes('.')) return;
        vars.currentInput += value;
        display.value = vars.currentInput;
        adjustRSize();
    } else if (value === '+' || value === '-' || value === '*' || value === '/') {
        if (vars.currentInput === '') return;
        if (vars.previousInput !== '') calculate();
        vars.operation = value;
        vars.previousInput = vars.currentInput;
        vars.currentInput = '';
    } else if (value === '=') {
        if (vars.currentInput === '' || vars.previousInput === '' || vars.operation === null) return;
        calculate();
        vars.operation = null;
        vars.previousInput = '';
    } else if (value === 'Clear') {
        vars.currentInput = '';
        vars.previousInput = '';
        vars.operation = null;
        display.value = '';
        adjustRSize();
    } else if (value === 'Del') {
        vars.currentInput = vars.currentInput.slice(0, -1);
        display.value = vars.currentInput;
        adjustRSize();
    } else if (value === 'Percent') {
        if (vars.currentInput === '') return;
        vars.currentInput = (parseFloat(vars.currentInput) / 100).toString();
        display.value = vars.currentInput;
        adjustRSize();
    }
}

function calculate() {
    const vars = window._calc_vars;
    const display = document.getElementById('calcdisplay');
    const prev = parseFloat(vars.previousInput);
    const current = parseFloat(vars.currentInput);
    let result = 0;

    switch(vars.operation) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': result = current !== 0 ? prev / current : "Cannot divide!"; break;
    }

    vars.currentInput = result.toString();
    display.value = vars.currentInput;
    adjustRSize();
}

function adjustRSize() {
    const display = document.getElementById('calcdisplay');
    let fontSize = 34;
    display.style.fontSize = fontSize + 'px';
    while (display.scrollWidth > display.clientWidth && fontSize > 10) {
        fontSize--;
        display.style.fontSize = fontSize + 'px';
    }
}

function cleanup_calc() {
    console.log('Cleaning calc...');
    window._calc_vars = { currentInput: '', previousInput: '', operation: null };
    const display = document.getElementById('calcdisplay');
    if (display) display.value = '';
    adjustRSize();
}

window.scriptReady('calc');