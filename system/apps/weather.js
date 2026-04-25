console.log("Current: apps/weather.js");
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.weather = {
    displayName: 'Weather',
    icon: '../../assets/apps/weather.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

console.log("INFO: apps/weather.js has no .js code to provide");

window.scriptReady('weather');