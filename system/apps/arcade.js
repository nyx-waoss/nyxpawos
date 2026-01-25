console.log("Current: apps/arcade.js");

const iframe = document.getElementById('arcadeiframe');

function cleanup_arcade() {
    console.log('Cleaning arcade...');
    
    iframe.src = 'arcade.html';
}

window.scriptReady('arcade');