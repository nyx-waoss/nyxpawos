console.log("Current: apps/calc.js");

let currentInput = '';
let previousInput = '';
let operation = null;

function calcinnum(value) {
    const display = document.getElementById('calcdisplay');
    if (value >= '0' && value <= '9' || value === '00' || value === '.') {
        if (value === '.' && currentInput.includes('.')) return;
        currentInput += value;
        display.value = currentInput;
        adjustRSize();
    } else if (value === '+' || value === '-' || value === '*' || value === '/') {
        if (currentInput === '') return;
        if (previousInput !== '') {
            calculate();
        }
        operation = value;
        previousInput = currentInput;
        currentInput = '';
    } else if (value === '=') {
        if (currentInput === '' || previousInput === '' || operation === null) return;
        calculate();
        operation = null
        previousInput = '';
    } else if (value === 'Clear') {
        currentInput = '';
        previousInput = '';
        operation = null;
        display.value = '';
        adjustRSize();
    } else if (value === 'Del') {
        currentInput = currentInput.slice(0, -1);
        display.value = currentInput;
        adjustRSize();
    } else if (value === 'Percent') {
        if (currentInput === '') return;
        currentInput = (parseFloat(currentInput) / 100).toString();
        display.value = currentInput;
        adjustRSize();
    }
}

function calculate() {
    const display = document.getElementById('calcdisplay');
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result = 0;

    switch(operation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = current !== 0 ? prev / current : "Cannot divide!";
            break;
    }

    currentInput = result.toString();
    display.value = currentInput;
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
    
    const display = document.getElementById('calcdisplay');

    display.value = '';
    currentInput = '';
    previousInput = '';
    operation = null;
    adjustRSize();
}

window.scriptReady('calc');