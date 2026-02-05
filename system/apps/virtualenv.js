console.log('Current: apps/virtualenv.js');
//Codigo aqui:

const iframe = document.getElementById('virtualenviframe');

//Codigo arriba ⬆️⬆️

function init_virtualenv() {
    console.log('Initiating virtualenv...');
    iframe.src = 'virtualenv.html';
}

function cleanup_virtualenv() {
    console.log('Cleaning virtualenv...');
    iframe.src = 'virtualenv.html';
}

window.scriptReady('virtualenv');
//template version 2.0