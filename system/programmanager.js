console.log('Current: programmanager.js');

window.SysVar = window.SysVar || {};

const AppManager = {
    loadedApps: new Map(), // { appName: { script, instance, window } }
    
    appPaths: {
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
        vscode: 'system/apps/vscode.js'
        
    },

    async checkImageExists(URL) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = URL;
        });
    },
    
    async loadApp(appName) {
        if (this.loadedApps.has(appName)) {
            console.log(` ${appName} is already loaded!`);
            this.showWindow(appName);
            return;
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

                const initFunctionName = `init_${appName}`;

                if (typeof window[initFunctionName] === 'function') {
                    console.log(`Init function ${appName}...`);
                    window[initFunctionName]();
                }
                
                this.showWindow(appName);
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
        const windowExceptions = {
            settings: 'win_config'
        };
        
        const customSizes = {
            settings: { width: '800px', height: '600px' },
            calc: { width: '310px', height: '480px' },
            calendar: { width: '470px', height: '610px'},
            toybox: { width: '800px', height: '480px'},
            weather: { width: '490px', height: '280px'},
            arcade: { width: '980px', height: '630px'}
        };
        
        const defaultSize = { width: '700px', height: '480px' };
        
        const windowId = windowExceptions[appName] || `win_${appName}`;
        const windowEl = document.getElementById(windowId);
        
        if (!windowEl) {
            console.error(`Window element not found in DOM for: ${windowId}`);
            return;
        }
        
        const size = customSizes[appName] || defaultSize;
        windowEl.style.width = size.width;
        windowEl.style.height = size.height;
        windowEl.classList.remove('window_anim_open');
        windowEl.style.removeProperty('opacity');
        windowEl.classList.remove('hidden');

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
                windowEl.classList.add('hidden');
            },200); 
        }
        
        if (appData.script) {
            appData.script.remove();
        }
        
        this.loadedApps.delete(appName);
        
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
        }topZ

        const windowExceptions = { settings: 'win_config' };
        const windowId = windowExceptions[appname] || `win_${appname}`;
        const windowEl = document.getElementById(windowId);
        
        if (windowEl) {
            windowEl.classList.add('hidden');
        }

        try {
            if (appData.script) {
                appData.script.remove();
            }
        } catch(error) {
            console.warn('Script unload failed for ' + appname + '. Error: ' + error);
        }

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

window.scriptReady('programmanager');