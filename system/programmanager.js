console.log('Current: programmanager.js');
/*
program manager es un archivo critico de NyxPawOS. Este archivo carga y administra cada aplicacion.
Sin este archivo, el sistema carga y podrias incluso iniciar sesion, pero el sistema seria inutil, ya que no puedes abrir ninguna aplicacion xD.
*/

window.SysVar = window.SysVar || {};

const _sysFunctionWatchdog = {
    protected: {},
    watchdogInterval: null,

    init() {
        const toProtect = [
            'sysAddEvent', 'sysBsod', 'emergencyStop',
            'sysExecApp', 'sysshutdown', 'sysrestart', 'showAlertBox', 'showMsgBox'
        ];
        toProtect.forEach(name => {
            if (typeof window[name] === 'function') {
                this.protected[name] = window[name];
            }
        });

        this.watchdogInterval = setInterval(() => {
            for (const [name, fn] of Object.entries(this.protected)) {
                if (window[name] !== fn) {
                    console.warn(`[SysGuard] ${name} was overwritten — restoring`);
                    window[name] = fn;
                }
            }
        }, 2000);
    },

    restore(name) {
        if (this.protected[name]) {
            window[name] = this.protected[name];
        }
    }
};

function safeCallAppFn(fnName, appName) {
    const fn = window[fnName];
    if (typeof fn !== 'function') return false;
    try {
        fn();
        return true;
    } catch (err) {
        console.error(`[AppManager] ${fnName} threw an error in ${appName}:`, err);
        return false;
    }
}

const AppManager = {
    loadedApps: new Map(), // { appName: { script, instance, window } }
    appPaths: {},
    htmlPaths: {},

    async init() {
        try {
            const res = await fetch('system/apps.json');
            const { apps } = await res.json();

            this.appPaths['syssetup'] = 'system/systemApps/syssetup.js';
            this.htmlPaths['syssetup'] = 'system/systemApps/syssetup.html';

            apps.forEach(app => {
                const jsFile = app.jsFile || app.id;
                const htmlFile = app.htmlFile || app.id;
                this.appPaths[app.id] = `system/apps/${jsFile}.js`;
                this.htmlPaths[app.id] = `system/apps/html/${htmlFile}.html`;
            });

            console.log('Apps loaded from manifest succesfully.');
        } catch(error) {
            console.error('Cannot init App Manager. Please check that apps.json exist. Error:'+error);
        }
    },

    async checkImageExists(URL) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = URL;
        });
    },

    loadAppCSS(appName) {
        if (appName == "syssetup" || appName == "appcenter") return;
        if (document.getElementById(`appcss_${appName}`)) return;
        let cssLink = document.createElement('link');
        cssLink.id = `appcss_${appName}`;
        cssLink.rel = 'stylesheet';
        cssLink.href = `system/apps/css/${appName}.css`;
        document.head.appendChild(cssLink);
    },

    async loadAppHTML(appName) {
        const htmlPath = this.htmlPaths[appName];
        if (!htmlPath) return;

        const windowId = appName === 'settings' ? 'win_config' : `win_${appName}`;
        if (document.getElementById(windowId)) return;

        const res = await fetch(htmlPath);
        if (!res.ok) throw new Error(`HTML Not found for ${appName} at directory ${htmlPath}`);
        const html = await res.text();
        document.body.insertAdjacentHTML('beforeend', html);
    },

    hideWindow(appName) {
        const windowExceptions = { settings: 'win_config' };
        const windowId = windowExceptions[appName] || `win_${appName}`;
        const windowEl = document.getElementById(windowId);

        if (!windowEl) return;

        windowEl.classList.remove('window_anim_open');
        windowEl.classList.remove('win-focused');
        setTimeout(() => {
            windowEl.classList.add('hidden');
            windowEl.style.removeProperty('opacity');
        }, 200);
    },

    async preloadApp(appName) {
        if (this.loadedApps.has(appName)) return;

        const appPath = this.appPaths[appName];
        if (!appPath) return;

        try { await this.loadAppHTML(appName); } catch(e) { console.error(e); return; }
        try { this.loadAppCSS(appName); } catch(e) { console.error(e); }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = appPath;
            script.id = `script-${appName}`;

            script.onload = async () => {
                const customMetadata = window.AppMetadata?.[appName];
                const displayName = customMetadata?.displayName || `${appName}.app`;
                let icon = customMetadata?.icon || 'assets/apps/unknown.png';

                this.loadedApps.set(appName, {
                    script, loadedAt: Date.now(), displayName, icon
                });

                safeCallAppFn(`init_${appName}`, appName);

                const windowId = appName === 'settings' ? 'win_config' : `win_${appName}`;
                const windowEl = document.getElementById(windowId);
                if (windowEl) windowEl.classList.add('hidden');

                startUsageTimer(appName);
                resolve();
            };

            script.onerror = () => reject();
            document.body.appendChild(script);
        });
    },
    
    async loadApp(appName) {
        if (this.loadedApps.has(appName)) {
            console.log(` ${appName} is already loaded!`);
            this.showWindow(appName);
            return;
        }

        if (!(navigator.onLine)) {
            showAlertBox('msgbox_nonetwork', `Conectate a internet para abrir ${appName}`);
        }
        
        const appPath = this.appPaths[appName];
        if (!appPath) {
            console.error(`Unknown program: ${appName}`);
            showAlertBox('msgbox_err', 'No se encontro la aplicacion.', {as_win:true,icon:'❓'});
            return;
        }

        if (SysVar.disableJSload) {
            console.error('Javascript load is locked');
            showAlertBox('msgbox_err', 'Javascript load is locked by your administrator', {as_win:true,icon:'❌'});
            return;
        }

        if (!SysVar.sessionAutoStart.includes('programs')) {
            console.error('AppManager not available');
            showAlertBox('msgbox_err', 'AppManager not available', {as_win:true,icon:'❓'});
            return;
        }
        
        document.documentElement.style.cursor = "wait";
        document.getElementById('topbar_loadingsys').classList.remove('hidden');
        console.log(`Loading ${appName}...`);

        try {
            await this.loadAppHTML(appName);
        } catch(error) {
            console.error(`Cannot inject HTML for ${appName}: ${error}`);
            document.documentElement.style.cursor = "default";
            document.getElementById('topbar_loadingsys').classList.add('hidden');
            return;
        }

        try {
            this.loadAppCSS(appName);
        } catch(error) {
            console.error(`Cannot load css styles for ${appName}: ${error}`);
            document.documentElement.style.cursor = "default";
            document.getElementById('topbar_loadingsys').classList.add('hidden');
            return;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = appPath;
            script.id = `script-${appName}`;
            
            script.onload = async () => {
                console.log(`${appName} has been loaded`);
                document.documentElement.style.cursor = "default";
                document.getElementById('topbar_loadingsys').classList.add('hidden');

                const customMetadata = window.AppMetadata?.[appName];
                
                const displayName = customMetadata?.displayName || `${appName}.app`;

                let icon;// = customMetadata?.icon || `assets/apps/${appName}/2.png` || `assets/apps/${appName}.png`;

                if (customMetadata?.icon) {
                    icon = customMetadata.icon;
                } else {
                    const iconPathFirst = `assets/apps/${appName}/2.png`;
                    const iconExistsFirst = await this.checkImageExists(iconPathFirst);

                    if (iconExistsFirst) {
                        icon = `assets/apps/${appName}/2.png`;
                    } else {
                        const iconPathSecond = `assets/apps/${appName}.png`;
                        const iconExistsSecond = await this.checkImageExists(iconPathSecond);

                        if (iconExistsSecond) {
                            icon = `assets/apps/${appName}.png`;
                        } else {
                            console.warn(`icon for ${appName} not found!`);
                            icon = 'assets/apps/unknown.png'
                        }
                    }
                }

                this.loadedApps.set(appName, {
                    script: script,
                    loadedAt: Date.now(),
                    displayName: displayName,
                    icon: icon
                });

                const existingUsage = SysVar.appsUsage.find(u => u.app === appName);
                if (!existingUsage) {
                    SysVar.appsUsage.push({app: appName, hours:'0', minutes:'0',secs:'0'});
                }

                const initFunctionName = `init_${appName}`;
                if (typeof window[initFunctionName] === 'function') {
                    console.log(`Init function ${appName}...`);
                    const initOk = safeCallAppFn(initFunctionName, appName);
                    if (!initOk) {
                        console.error(`[AppManager] Init failed for ${appName}, aborting load`);
                        document.documentElement.style.cursor = "default";
                        document.getElementById('topbar_loadingsys').classList.add('hidden');
                        this.unloadApp(appName);
                        showAlertBox('msgbox_err', `${appName} no se pudo iniciar correctamente.`, {as_win:true, icon:'❌'});
                        reject();
                        return;
                    }
                }
                
                this.showWindow(appName);
                startUsageTimer(appName);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`Failed to load ${appName}`);
                reject();
            };
            
            document.body.appendChild(script);
        });
    },

    showWindow(appName) {
        translateSystem(SysVar.currentlang);

        const windowExceptions = {
            settings: 'win_config'
        };
        
        const customSizes = {
            settings: { width: '970px', height: '750px' },
            calc: { width: '310px', height: '480px' },
            calendar: { width: '470px', height: '610px'},
            toybox: { width: '800px', height: '480px'},
            weather: { width: '490px', height: '280px'},
            arcade: { width: '980px', height: '630px'},
            nkbrief: { width: '940px', height: '600px'},
            nyxpawdocs: { width: '940px', height: '600px'},
            nytclient: { width: '1015px', height: '650px'},
            nyxpawworkspace: { width: '800px', height: '530px'},
            nyxpawslides: { width: '940px', height: '600px'},
            sysshutdown: { width: '360px', height: '540px'},
            safefilesmanager: { width: '435px', height: '390px'},
            startupapps: { width: '435px', height: '390px'}
        };
        
        const defaultSize = { width: '700px', height: '480px' };
        
        const windowId = windowExceptions[appName] || `win_${appName}`;
        const windowEl = document.getElementById(windowId);
        
        if (!windowEl) {
            console.error(`Window element not found in DOM for: ${windowId}`);
            showAlertBox('msgbox_err','No se encontro el programa solicitado.',{as_win:true,icon:'❌'});
            return;
        }

        if (windowEl.dataset.minimized === 'true') {
            restoreWindow(windowEl);
            return;
        }
        
        const size = customSizes[appName] || defaultSize;
        windowEl.style.width = size.width;
        windowEl.style.height = size.height;
        windowEl.classList.remove('window_anim_open');
        windowEl.style.removeProperty('opacity');
        windowEl.classList.remove('hidden');
        windowEl.style.zIndex = ++topZ;
        windowEl.classList.add('win-focused');

        void windowEl.offsetHeight;

        setTimeout(() => {
            windowEl.classList.add('window_anim_open');
        },20);
    },
    
    unloadApp(appName) {
        
        if (appName === 'sysshutdown') {
            this.hideWindow(appName);
            return;
        }
        if (!this.loadedApps.has(appName)) {
            console.warn(`⚠️ ${appName} is not loaded`);
            return;
        }
        
        document.documentElement.style.cursor = "wait";
        document.getElementById('topbar_loadingsys').classList.remove('hidden');
        console.log(`Unloading ${appName}...`);
        
        const appData = this.loadedApps.get(appName);

        console.log(`Cleaning data from ${appName}...`);
        safeCallAppFn(`cleanup_${appName}`, appName);

        for (const [name, fn] of Object.entries(_sysFunctionWatchdog.protected)) {
            if (window[name] !== fn) {
                console.warn(`[AppManager] ${appName} left "${name}" overwritten — restoring`);
                window[name] = fn;
            }
        }
        
        const windowExceptions = { settings: 'win_config' };
        const windowId = windowExceptions[appName] || `win_${appName}`;
        const windowEl = document.getElementById(windowId);
        if (windowEl) {
            console.log('_cleanup exists?', !!windowEl._cleanup);
            if (windowEl._cleanup) windowEl._cleanup();
        }
        
        if (windowEl) {
            if (windowEl._cleanup) windowEl._cleanup();
            windowEl.classList.remove('window_anim_open');
            windowEl.classList.remove('win-focused');
            setTimeout(() => {
                windowEl.style.removeProperty('opacity');
                windowEl.remove();
            },200); 
        }
        
        if (appData.script) {
            appData.script.remove();
        }

        let appcss = document.getElementById(`appcss_${appName}`);
        setTimeout(() => {
            if (appcss) appcss.remove();
        },400);
        
        stopUsageTimer(appName);
        this.loadedApps.delete(appName);

        const appBarObj = SysVar.appBarIcons.find(a => a.app === appName);
        if (appBarObj) {
            if (!appBarObj.permanent) {
                appBarRemoveApp(appName);
            } else {
                appBarObj.minimized = false;
                renderAppBar();
            }
        }
        
        console.log(`${appName} unloaded from RAM`);
        document.documentElement.style.cursor = "default";
        document.getElementById('topbar_loadingsys').classList.add('hidden');        
    },

    forceUnloadApp(appname) {
        const appData = this.loadedApps.get(appname);

        safeCallAppFn(`cleanup_${appname}`, appname);
        for (const [name, fn] of Object.entries(_sysFunctionWatchdog.protected)) {
            if (window[name] !== fn) window[name] = fn;
        }

        const windowExceptions = { settings: 'win_config' };
        const windowId = windowExceptions[appname] || `win_${appname}`;
        const windowEl = document.getElementById(windowId);
        windowEl.classList.remove('win-focused');
        
        if (windowEl) {
            if (windowEl._cleanup) windowEl._cleanup();
            windowEl.remove();
        }

        try {
            if (appData.script) {
                appData.script.remove();
            }
        } catch(error) {
            console.warn('Script unload failed for ' + appname + '. Error: ' + error);
        }

        
        try {
            let appcss = document.getElementById(`appcss_${appname}`);
            setTimeout(() => {
                if (appcss) appcss.remove();
            },400);
        } catch(error) {
            console.warn('CSS unload failed for ' + appname + '. Error: ' + error);
        }

        stopUsageTimer(appname);
        this.loadedApps.delete(appname);

        console.log(appname+' force closed succesfully')
    },
    
    getLoadedApps() {
        return Array.from(this.loadedApps.keys());
    },
    
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                tocloseBtntal: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB'
            };
        }
        return null;
    },

    getLoadedAppsInfo() {
        const apps = [];

        this.loadedApps.forEach((data, appName) => {
            apps.push({
                name: appName,
                displayName: data.displayName || appName,
                icon: data.icon || 'assets/apps/program/2.png',
                loadedAt: data.loadedAt,
                uptime: Date.now() - data.loadedAt
            });
        });

        return apps;
    }

    

};

const appUsageTimers = {};
function startUsageTimer(appName) {
    if (appUsageTimers[appName]) return;

    appUsageTimers[appName] = setInterval(() => {
        const windowExceptions = {settings:'win_config'};
        const windowId = windowExceptions[appName] || `win_${appName}`;
        const windowEl = document.getElementById(windowId);

        if (!windowEl || windowEl.classList.contains('hidden')) {
            stopUsageTimer(appName);
            return;
        }

        if (!windowEl.classList.contains('win-focused')) return;

        const usageEntry = SysVar.appsUsage.find(u => u.app === appName);
        if (!usageEntry) return;

        let secs = parseInt(usageEntry.secs);
        let minutes = parseInt(usageEntry.minutes);
        let hours = parseInt(usageEntry.hours);

        secs ++;

        if (secs >= 60) {
            secs = 0;
            minutes ++;
        }
        if (minutes >= 60) {
            minutes = 0;
            hours ++;
        }
        
        usageEntry.secs = String(secs);
        usageEntry.minutes = String(minutes);
        usageEntry.hours = String(hours);
    },1000);
}

function stopUsageTimer(appName) {
    if (appUsageTimers[appName]) {
        clearInterval(appUsageTimers[appName]);
        delete appUsageTimers[appName];
    }
}


window.scriptReady('programmanager');