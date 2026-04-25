console.log('Current: apps/vscode.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.vscode = {
    displayName: 'VSCode',
    icon: '../../assets/apps/vscode.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:

const vsciframe = document.getElementById('vscodeiframe');





//Codigo arriba ⬆️⬆️

function init_vscode() {
    console.log('Initiating vscode...');
    //vsciframe.src = "https://www.vscode.dev";
    vsciframe.src = "system_appload.html?img=assets/apps/vscode.png&avl=0";
}

function cleanup_vscode() {
    console.log('Cleaning vscode...');
    vsciframe.src = "system_appload.html?img=assets/apps/vscode.png&avl=0";
}

window.scriptReady('vscode');
//template version 2.0