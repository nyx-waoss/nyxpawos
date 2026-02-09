console.log('Current: apps/vscode.js');

//Codigo aqui:

const vsciframe = document.getElementById('vscodeiframe');





//Codigo arriba ⬆️⬆️

function init_vscode() {
    console.log('Initiating vscode...');
    vsciframe.src = "https://www.vscode.dev";
}

function cleanup_vscode() {
    console.log('Cleaning vscode...');
    vsciframe.src = "system_appload.html?img=assets/apps/vscode.png&avl=0";
}

window.scriptReady('vscode');
//template version 2.0