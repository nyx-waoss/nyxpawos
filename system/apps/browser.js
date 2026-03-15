console.log("Current: apps/browser.js");

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

function _browser_setwebtoInternal(inurl) {
    let url = inurl.trim();
    if (!url) return;

    url = normalizeURL(url);

    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex++;

    briframe.src = url;
}

function browser_goto() {
    let url = brinput.value.trim();
    if (!url) return;

    url = normalizeURL(url);

    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex++;

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