console.log("Current: apps/vengegame.js");
//Codigo aqui:

console.log("INFO: apps/vengegame.js has no .js code to provide"); // quita esta linea si pones codigo





//Codigo arriba ⬆️⬆️
const iframe = document.getElementById('iframevenge');

function init_vengegame() {
    console.log('Initiating vengegame...');
    iframe.src = 'https://venge.io/';
}

function cleanup_vengegame() {
    console.log('Cleaning vengegame...');
    iframe.src = '../../connecting.html';
}

window.scriptReady('vengegame');