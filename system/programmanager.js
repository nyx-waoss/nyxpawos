console.log('Current: programmanager.js');

window.SysVar = window.SysVar || {};

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
    
    /*appPaths: {
        syssetup: 'system/systemApps/syssetup.js',
        settings: 'system/apps/settings.js',
        notes: 'system/apps/notes.js',
        calc: 'system/apps/calc.js',
        browser: 'system/apps/browser.js',
        files: 'system/apps/files.js',
        calendar: 'system/apps/calendar.js',
        terminal: 'system/apps/terminal.js',
        toybox: 'system/apps/toybox.js',
        nyxvideoplayer: 'system/apps/videoplayer.js',
        nyximageviewer: 'system/apps/imgviewer.js',
        nyxpawstore: 'system/apps/nyxpawstore.js',
        nytclient: 'system/apps/ytclient.js',
        weather: 'system/apps/weather.js',
        arcade: 'system/apps/arcade.js',
        appcenter: 'system/apps/appcenter.js',
        taskmanager: 'system/apps/taskmanager.js',
        vengegame: 'system/apps/vengegame.js',
        eventviewer: 'system/apps/eventviewer.js',
        regedit: 'system/apps/regedit.js',
        virtualenv: 'system/apps/virtualenv.js',
        vscode: 'system/apps/vscode.js',
        nkbrief: 'system/apps/nkbrief.js',
        loginhelp: 'system/apps/loginhelp.js'
        
    },

    htmlPaths: {
        syssetup: 'system/systemApps/syssetup.js',
        settings: 'system/apps/html/settings.html',
        notes: 'system/apps/html/notes.html',
        calc: 'system/apps/html/calc.html',
        browser: 'system/apps/html/browser.html',
        files: 'system/apps/html/files.html',
        calendar: 'system/apps/html/calendar.html',
        terminal: 'system/apps/html/terminal.html',
        toybox: 'system/apps/html/toybox.html',
        nyxvideoplayer: 'system/apps/html/videoplayer.html',
        nyximageviewer: 'system/apps/html/imgviewer.html',
        nyxpawstore: 'system/apps/html/nyxpawstore.html',
        nytclient: 'system/apps/html/ytclient.html',
        weather: 'system/apps/html/weather.html',
        arcade: 'system/apps/html/arcade.html',
        appcenter: 'system/apps/html/appcenter.html',
        taskmanager: 'system/apps/html/taskmanager.html',
        vengegame: 'system/apps/html/vengegame.html',
        eventviewer: 'system/apps/html/eventviewer.html',
        regedit: 'system/apps/html/regedit.html',
        virtualenv: 'system/apps/html/virtualenv.html',
        vscode: 'system/apps/html/vscode.html',
        nkbrief: 'system/apps/html/nkbrief.html',
        loginhelp: 'system/apps/html/loginhelp.html'
    },*/

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
    
    async loadApp(appName) {
        if (this.loadedApps.has(appName)) {
            console.log(` ${appName} is already loaded!`);
            this.showWindow(appName);
            return;
        }

        if (!(navigator.onLine)) {
            showAlertBox('🛜 Sin internet', `Conectate a internet para abrir ${appName}`);
        }
        
        const appPath = this.appPaths[appName];
        if (!appPath) {
            console.error(`Unknown program: ${appName}`);
            return;
        }

        if (SysVar.disableJSload) {
            console.error('Javascript load is locked');
            showAlertBox('Error', 'Javascript load is locked by your administrator', {as_win:true,icon:'❌'});
            return;
        }

        if (!SysVar.sessionAutoStart.includes('programs')) {
            console.error('AppManager not available');
            showAlertBox('Error', 'AppManager not available', {as_win:true,icon:'❓'});
            return;
        }
        
        document.documentElement.style.cursor = "wait";
        console.log(`Loading ${appName}...`);

        try {
            await this.loadAppHTML(appName);
        } catch(error) {
            console.error(`Cannot inject HTML for ${appName}: ${error}`);
            document.documentElement.style.cursor = "default";
            return;
        }

        try {
            this.loadAppCSS(appName);
        } catch(error) {
            console.error(`Cannot load css styles for ${appName}: ${error}`);
            document.documentElement.style.cursor = "default";
            return;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = appPath;
            script.id = `script-${appName}`;
            
            script.onload = async () => {
                console.log(`${appName} has been loaded`);
                document.documentElement.style.cursor = "default";

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
                    window[initFunctionName]();
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
            settings: { width: '800px', height: '600px' },
            calc: { width: '310px', height: '480px' },
            calendar: { width: '470px', height: '610px'},
            toybox: { width: '800px', height: '480px'},
            weather: { width: '490px', height: '280px'},
            arcade: { width: '980px', height: '630px'},
            nkbrief: { width: '940px', height: '600px'}
        };
        
        const defaultSize = { width: '700px', height: '480px' };
        
        const windowId = windowExceptions[appName] || `win_${appName}`;
        const windowEl = document.getElementById(windowId);
        
        if (!windowEl) {
            console.error(`Window element not found in DOM for: ${windowId}`);
            showAlertBox('Error','No se encontro el programa solicitado.',{as_win:true,icon:'❌'})
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

        void windowEl.offsetHeight;

        setTimeout(() => {
            windowEl.classList.add('window_anim_open');
        },20);
    },
    
    unloadApp(appName) {
        if (!this.loadedApps.has(appName)) {
            console.warn(`⚠️ ${appName} is not loaded`);
            return;
        }
        
        document.documentElement.style.cursor = "wait";
        console.log(`Unloading ${appName}...`);
        
        const appData = this.loadedApps.get(appName);

        const cleanupFunctionName = `cleanup_${appName}`;

        if (typeof window[cleanupFunctionName] === 'function') {
            console.log(`Cleaning data from ${appName}...`);
            window[cleanupFunctionName]();
        }
        
        const windowExceptions = { settings: 'win_config' };
        const windowId = windowExceptions[appName] || `win_${appName}`;
        const windowEl = document.getElementById(windowId);
        
        if (windowEl) {
            windowEl.classList.remove('window_anim_open');
            setTimeout(() => {
                windowEl.style.removeProperty('opacity');
                windowEl.remove();
            },200); 
        }
        
        if (appData.script) {
            appData.script.remove();
        }

        let appcss = document.getElementById(`appcss_${appName}`);
        if (appcss) appcss.remove();
        
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
        
    },

    forceUnloadApp(appname) {
        const appData = this.loadedApps.get(appname);

        try {
            const cleanupFunctionName = `cleanup_${appname}`;

            if (typeof window[cleanupFunctionName] === 'function') {
                console.log(`Cleaning data from ${appname}...`);
                window[cleanupFunctionName]();
            }

        } catch(error) {
            console.warn('Cleanup failed for ' + appname + '. Error: ' + error);
        }

        const windowExceptions = { settings: 'win_config' };
        const windowId = windowExceptions[appname] || `win_${appname}`;
        const windowEl = document.getElementById(windowId);
        
        if (windowEl) {
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
            if (appcss) appcss.remove();
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