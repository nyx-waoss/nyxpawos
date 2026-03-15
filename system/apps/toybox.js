console.log("Current: apps/toybox.js");

const params3 = new URLSearchParams(window.location.search);
const mode3 = params.get('mode');

if (mode3 === 'safe') {
    sysBlurSetto(0);
}

let toyboxBlurLevelSelect = document.getElementById('toyboxBlurLevelSelect').value;
toyboxBlurLevelSelect = '100';
let toyboxCursorTail = document.getElementById('toyboxCursorTail').checked;
let toyboxCursorTailIcon = document.getElementById('toyboxCursorTailIcon').value;
let toyboxCursorTailSize = 30;
let cursorTailFX;
let toyboxSecretWallpaper = document.getElementById('toyboxSecretWallpaper').checked;

function toyboxGotoTab(tabid) {
    const toyboxTabs = document.getElementsByClassName('toyboxTab');
    for (let i = 0; i < toyboxTabs.length; i++) {
        toyboxTabs[i].classList.add('hidden');
    }
    document.getElementById(tabid).classList.remove('hidden');
}

function toyboxFXSet() {
    if (mode3 === 'safe') {
        sysBlurSetto(0);
        showAlertBox('❌ Error', 'Modo seguro activado');
    } else {
        toyboxBlurLevelSelect = document.getElementById('toyboxBlurLevelSelect').value;
        toyboxCursorTail = document.getElementById('toyboxCursorTail').checked;
        toyboxCursorTailIcon = document.getElementById('toyboxCursorTailIcon').value;
        toyboxCursorTailSize = document.getElementById('toyboxCursorTailSize').value;
        toyboxSecretWallpaper = document.getElementById('toyboxSecretWallpaper').checked;

        console.log('toyboxCursorTail:', toyboxCursorTail);
        console.log('toyboxCursorTailIcon:', toyboxCursorTailIcon);
        console.log('toyboxCursorTailSize:', toyboxCursorTailSize)

        if (toyboxBlurLevelSelect === '0') {
            sysBlurSetto(0);
        } else if (toyboxBlurLevelSelect === '50') {
            sysBlurSetto(0.5);
        } else if (toyboxBlurLevelSelect === '100') {
            sysBlurSetto(1);
        } else if (toyboxBlurLevelSelect === '150') {
            sysBlurSetto(1.5);
        } else if (toyboxBlurLevelSelect === '200') {
            sysBlurSetto(2);
        } else {
            showAlertBox('❌ Error','Error al establecer! Valor recibido: ' + toyboxBlurLevelSelect);
        }

        if (cursorTailFX) {
            console.log('Removing previous cursor queue listener');
            document.removeEventListener('mousemove', cursorTailFX);
        }

        cursorTailFX = (e) => {
            const cursorTailElement = document.createElement('div');
            cursorTailElement.textContent = toyboxCursorTailIcon;
            cursorTailElement.style.position = 'fixed';
            cursorTailElement.style.left = e.clientX + 'px';
            cursorTailElement.style.top = e.clientY + 'px';
            cursorTailElement.style.fontSize = toyboxCursorTailSize + 'px';
            cursorTailElement.style.pointerEvents = 'none';
            cursorTailElement.style.zIndex = '999999';
            document.body.appendChild(cursorTailElement);
            setTimeout(() => cursorTailElement.remove(), 1000);
        };

        if (toyboxCursorTail) {
            console.log('Adding cursor queue listener');
            document.addEventListener('mousemove', cursorTailFX);
        } else {
            console.log('Cursor queue checkbox is not checked');
        }

        if (toyboxSecretWallpaper) {
            document.body.style.backgroundImage = "url('https://i.pinimg.com/originals/42/73/e5/4273e565fa7ad19b4e3ba170bb9a85b2.jpg')";
        } else {
            document.body.style.backgroundImage = "url('assets/wallpaper.jpg')";
        }
    }
}

async function toyboxFXReset() {
    try {
        const confirmResetFX = await showMsgBox("ℹ️ Informacion","Quieres restablecer los efectos visuales a los valores predeterminados?", "Confirmar", "Cancelar");
        if (confirmResetFX) {
            sysBlurSetto(1);
            document.removeEventListener('mousemove', cursorTailFX);
            toyboxCursorTail.checked = false;
        }  
    } catch (error) {
        console.error('Failed to reset effects: ', error);
        showAlertBox('❌ Error', 'No se pudieron restablecer los efectos visuales.');
    }
}

function init_toybox() {
    document.getElementById('toybox_fireplace_iframe').src = 'https://www.youtube.com/embed/iaQBQp5tgcw?autoplay=1&loop=1&playlist=iaQBQp5tgcw&controls=0&mute=1&modestbranding=1&showinfo=0';
}

function cleanup_toybox() {
    document.getElementById('toybox_fireplace_iframe').src = '../../../connecting.html';
}

window.scriptReady('toybox');