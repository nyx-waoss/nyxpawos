console.log("Current: apps/browser.js");

const briframe = document.getElementById('browseriframe');
const brinput = document.getElementById('browserinput');

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

briframe.addEventListener("load", () => {
    if (historyIndex >= 0) {
        brinput.value = historyStack[historyIndex];
    }
});

brinput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        browser_goto();
    }
});

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
    briframe.src = 'https://www.google.com/search?igu=1';
}

function cleanup_browser() {
    console.log('Cleaning browser...');
    briframe.src = '../../connecting.html';
}

window.scriptReady('browser');