console.log("Current: apps/arcade.js");
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.arcade = {
    displayName: 'Arcade',
    icon: '../../assets/apps/arcade.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

const iframe = document.getElementById('arcadeiframe');

function cleanup_arcade() {
    console.log('Cleaning arcade...');
    
    iframe.src = 'arcade.html';
}

window.scriptReady('arcade');