console.log('Current: apps/appcenter.js');
//Codigo aqui:







//Codigo arriba ⬆️⬆️

function init_appcenter() {
    console.log('Initiating appcenter...');
    const appcenter = document.getElementById('win_appcenter');
    appcenter.style.zIndex = topZ + 10;
}

function cleanup_appcenter() {
    console.log('Cleaning appcenter...');
    //nada q limpiar
}

window.scriptReady('appcenter');