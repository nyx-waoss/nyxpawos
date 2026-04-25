console.log("Current: apps/browser.js");
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.browser = {
    displayName: 'PawNet',
    icon: '../../assets/apps/browser/2.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

let briframe = null;
let brinput = null;

let _br_onload   = null;
let _br_onkeydown = null;

let historyStack = [];
let historyIndex = -1;

function normalizeURL(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
    }
    return url;
}

let browser_websitesList = {
    youtube: {
        list: ['www.youtube.com','youtu.be','m.youtube.com','music.youtube.com','studio.youtube.com','accounts.youtube.com','tv.youtube.com','kids.youtube.com','gaming.youtube.com','youtube.com'],
        hasOwnClient: true,
        redirect:''
    },
    
    gsuite: {
        list: ['mail.google.com','drive.google.com','docs.google.com',
            'sheets.google.com','slides.google.com','photos.google.com',
            'maps.google.com','calendar.google.com','forms.google.com',
            'sites.google.com','keep.google.com','chat.google.com',
            'meet.google.com','classroom.google.com',],
        hasOwnClient: true,
        redirect:''
    },

    google: {
        list: ['google.com','googleusercontent.com','gstatic.com',
            'accounts.google.com','myaccount.google.com','security.google.com',
            'firebase.google.com','console.cloud.google.com','colab.research.google.com',
            'gemini.google.com','aistudio.google.com','play.google.com',
            'store.google.com','news.google.com','podcasts.google.com'],
        hasOwnClient: false,
        redirect:'https://www.google.com/?igu=1'
    },
    office365: {
        list: [
            'outlook.live.com','outlook.office.com','outlook.office365.com',
            'onedrive.live.com','office.com','word.office.com',
            'excel.office.com','powerpoint.office.com','onenote.com',
            'teams.microsoft.com','to-do.microsoft.com','forms.office.com','m365.cloud',
        ],
        hasOwnClient: true,
        redirect: ''
    }
};

function browser_isUrlUnavailable(urlToCheck, platformToCheck) {
    const platformsToSearch = platformToCheck
        ? { [platformToCheck]: browser_websitesList[platformToCheck] }
        : browser_websitesList;

    for (const [platformName, platform] of Object.entries(platformsToSearch)) {
        if (!platform) continue;

        const isInList = platform.list.some(domain => urlToCheck.includes(domain));
        if (!isInList) continue;

        return platform.hasOwnClient
            ? { ownClient: true,  redirect: platformName }
            : { ownClient: false, redirect: platform.redirect };
    }

    return null;
}

function _browser_setwebtoInternal(inurl) {
    let url = inurl.trim();
    if (!url) return;

    url = normalizeURL(url);

    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex++;

    let isUrlAvailable = browser_isUrlUnavailable(url);

    if (!isUrlAvailable) {
        briframe.src = url;
        return;
    }

    if (isUrlAvailable.ownClient) {
        if (isUrlAvailable.redirect == 'youtube') {
            url = 'system_appload.html?img=assets/apps/nytclient.png&extras=La%20pagina%20web%20no%20esta%20disponible,%20pero%20puedes%20utilizar%20la%20version%20dise%C3%B1ada%20para%20NyxPawOS&textsize=28&btn=Abrir%20Nyt%20Client&btnAct=launch&btnInfo=nytclient';
        } else if (isUrlAvailable.redirect == 'gsuite') {
            url = 'system_appload.html?img=assets/apps/nyxpawworkspace.png&extras=La%20pagina%20web%20no%20esta%20disponible,%20pero%20puedes%20utilizar%20la%20version%20diseñada%20para%20NyxPawOS&textsize=28&btn=Abrir%20NyxPaw%20Workspace&btnAct=launch&btnInfo=nyxpawworkspace';
        } else if (isUrlAvailable.redirect == 'office365') {
            url = 'system_appload.html?img=assets/apps/nyxpawworkspace.png&extras=La%20pagina%20web%20no%20esta%20disponible,%20pero%20puedes%20utilizar%20la%20version%20diseñada%20para%20NyxPawOS&textsize=28&btn=Abrir%20NyxPaw%20Workspace&btnAct=launch&btnInfo=nyxpawworkspace';
        } else {
            url = 'system_appload.html?img=assets/apps/unknown.png&extras=La%20pagina%20web%20no%20esta%20disponible,%20lo%20sentimos%20mucho,%20por%20favor,%20reporta%20este%20error&textsize=28';
        }
    } else {
        url = isUrlAvailable.redirect;
    }

    briframe.src = url;
}

function browser_goto() {
    let url = brinput.value.trim();
    if (!url) return;

    url = normalizeURL(url);

    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex++;

    let isUrlAvailable = browser_isUrlUnavailable(url);

    if (!isUrlAvailable) {
        briframe.src = url;
        return;
    }

    if (isUrlAvailable.ownClient) {
        if (isUrlAvailable.redirect == 'youtube') {
            url = 'system_appload.html?img=assets/apps/nytclient.png&extras=La%20pagina%20web%20no%20esta%20disponible,%20pero%20puedes%20utilizar%20la%20version%20dise%C3%B1ada%20para%20NyxPawOS&textsize=28&btn=Abrir%20Nyt%20Client&btnAct=launch&btnInfo=nytclient';
        } else if (isUrlAvailable.redirect == 'gsuite') {
            url = 'system_appload.html?img=assets/apps/nyxpawworkspace.png&extras=La%20pagina%20web%20no%20esta%20disponible,%20pero%20puedes%20utilizar%20la%20version%20diseñada%20para%20NyxPawOS&textsize=28&btn=Abrir%20NyxPaw%20Workspace&btnAct=launch&btnInfo=nyxpawworkspace';
        } else if (isUrlAvailable.redirect == 'office365') {
            url = 'system_appload.html?img=assets/apps/nyxpawworkspace.png&extras=La%20pagina%20web%20no%20esta%20disponible,%20pero%20puedes%20utilizar%20la%20version%20diseñada%20para%20NyxPawOS&textsize=28&btn=Abrir%20NyxPaw%20Workspace&btnAct=launch&btnInfo=nyxpawworkspace';
        } else {
            url = 'system_appload.html?img=assets/apps/unknown.png&extras=La%20pagina%20web%20no%20esta%20disponible,%20lo%20sentimos%20mucho,%20por%20favor,%20reporta%20este%20error&textsize=28';
        }
    } else {
        url = isUrlAvailable.redirect;
    }

    briframe.src = url;
}

function browser_prev() {
    if (historyIndex > 0) {
        historyIndex--;
        briframe.src = historyStack[historyIndex];
        brinput.value = historyStack[historyIndex];
    }
}

function browser_next() {
    if (historyIndex < historyStack.length -1) {
        historyIndex++;
        briframe.src = historyStack[historyIndex];
        brinput.value = historyStack[historyIndex];
    }
}

function browser_reload() {
    briframe.src = briframe.src;
}



window.browserSetWebTo = function(inurl) {
    if (!AppManager.loadedApps.has('browser')) {
        AppManager.loadApp('browser').then(() => {
            setTimeout(() => {
                _browser_setwebtoInternal(inurl);
            }, 70);
        });
        return;
    }

    _browser_setwebtoInternal(inurl);
};

function init_browser() {
    console.log('Initiating browser...');

    briframe = document.getElementById('browseriframe');
    brinput = document.getElementById('browserinput');

    briframe.src = 'https://www.google.com/search?igu=1';

    _br_onload = () => {
        if (historyIndex >= 0) {
            brinput.value = historyStack[historyIndex];
        }
    };

    _br_onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            browser_goto();
        }
    };

    briframe.addEventListener("load",    _br_onload);
    brinput.addEventListener("keydown",  _br_onkeydown);
}

function cleanup_browser() {
    console.log('Cleaning browser...');

    if (briframe && _br_onload) {
        briframe.removeEventListener("load", _br_onload);
        _br_onload = null;
    }

    if (brinput && _br_onkeydown) {
        brinput.removeEventListener("keydown", _br_onkeydown);
        _br_onkeydown = null;
    }

    briframe.src = 'connecting.html';

    briframe     = null;
    brinput      = null;
    historyStack = [];
    historyIndex = -1;
}

window.scriptReady('browser');