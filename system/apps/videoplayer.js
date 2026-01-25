console.log("Current: apps/videoplayer.js");

const videoPlayerAskBtnConfirm = document.getElementById('askForVideoFile-btn_save');
const videoPlayerAskBtnCancel = document.getElementById('askForVideoFile-btn_cancel');
const videoPlayerAskClose = document.getElementById('btn_askForVideoFile');
const videoPlayerFileSelector = document.getElementById('nyxvideoplayer_openFilePrompt');
const videoPlayerPlayer = document.getElementById('nyxvideoplayer_player');
const videoPlayerWindowSelect = document.getElementById('win_askForVideoFile');

let videoPlayerSelectedFile = null;
let videoPlayerCurrentURL = null;

videoPlayerFileSelector.addEventListener('change', function(e) {
    videoPlayerSelectedFile = e.target.files[0];
});

videoPlayerAskBtnConfirm.addEventListener('click', function() {
    if (videoPlayerSelectedFile) {
        if (videoPlayerCurrentURL) {
            URL.revokeObjectURL(videoPlayerURLVid);
        }
        const videoPlayerURLVid = URL.createObjectURL(videoPlayerSelectedFile);
        videoPlayerPlayer.src = videoPlayerURLVid;

        videoPlayerCurrentURL = videoPlayerURLVid;

        videoPlayerSelectedFile = null;
        videoPlayerWindowSelect.classList.add('hidden');
    }
});

videoPlayerPlayer.addEventListener('ended', () => {
    if (videoPlayerCurrentURL) {
        URL.revokeObjectURL(videoPlayerCurrentURL);
        videoPlayerCurrentURL = null;
    }
});

videoPlayerAskBtnCancel.addEventListener('click', () => {
    videoPlayerSelectedFile = null;
    videoPlayerFileSelector.value = '';
    videoPlayerWindowSelect.classList.add('hidden');
});

videoPlayerAskClose.addEventListener('click', () => {
    videoPlayerWindowSelect.classList.add('hidden');
});

window.scriptReady('videoplayer');