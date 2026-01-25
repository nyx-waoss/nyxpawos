console.log("Current: apps/ytclient.js");

nytClientURL = document.getElementById('nytclienturlin');
nytClientIframe = document.getElementById('nytclientiframe');

function nytclient_reload() {
    nytClientIframe.src = nytClientIframe.src;
}

function nytclient_goto() {
    nytClientIframe.src = 'https://www.youtube.com/embed/' + nytClientURL + '?si=M5iHYtQr5FPUWMMO';

}

window.scriptReady('ytclient');