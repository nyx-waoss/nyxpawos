console.log("Current: apps/imgviewer.js");

const imageViewerAskBtnConfirm = document.getElementById('askForImageFile-btn_save');
const imageViewerAskBtnCancel = document.getElementById('askForImageFile-btn_cancel');
const imageViewerAskClose = document.getElementById('btn_askForImageFile');
const imageViewerFileSelector = document.getElementById('nyximageviewer_openFilePrompt');
const imageViewerPlayer = document.getElementById('nyximageviewer_player');
const imageViewerWindowSelect = document.getElementById('win_askForImageFile');

let imageViewerSelectedFile = null;
let imageViewerCurrentURL = null;

imageViewerFileSelector.addEventListener('change', function(e) {
    imageViewerSelectedFile = e.target.files[0];
});

imageViewerAskBtnConfirm.addEventListener('click', function() {
    if (imageViewerSelectedFile) {
        if (imageViewerCurrentURL) {
            URL.revokeObjectURL(imageViewerURLVid);
        }
        const imageViewerURLVid = URL.createObjectURL(imageViewerSelectedFile);
        imageViewerPlayer.src = imageViewerURLVid;

        imageViewerCurrentURL = imageViewerURLVid;

        imageViewerSelectedFile = null;
        imageViewerWindowSelect.classList.remove('window_anim_open');
        setTimeout(() => {
            imageViewerWindowSelect.classList.add('hidden');
            imageViewerWindowSelect.style.removeProperty('opacity');
        }, 200);
    }
});

imageViewerPlayer.addEventListener('ended', () => {
    if (imageViewerCurrentURL) {
        URL.revokeObjectURL(imageViewerCurrentURL);
        imageViewerCurrentURL = null;
    }
});

imageViewerAskBtnCancel.addEventListener('click', () => {
    imageViewerSelectedFile = null;
    imageViewerFileSelector.value = '';
    imageViewerWindowSelect.classList.remove('window_anim_open');
    setTimeout(() => {
        imageViewerWindowSelect.classList.add('hidden');
        imageViewerWindowSelect.style.removeProperty('opacity');
    }, 200);
});

imageViewerAskClose.addEventListener('click', () => {
    imageViewerWindowSelect.classList.remove('window_anim_open');
    setTimeout(() => {
        imageViewerWindowSelect.classList.add('hidden');
        imageViewerWindowSelect.style.removeProperty('opacity');
    }, 200);
});

window.scriptReady('imgviewer');