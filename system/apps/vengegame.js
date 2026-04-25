console.log("Current: apps/vengegame.js");
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.vengegame = {
    displayName: 'Venge',
    icon: '../../assets/apps/vengegame.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};
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