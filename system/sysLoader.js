console.log('Current: sysLoader.js');

const ScriptLoader = {
    scripts: [],
    loadedScripts: new Set(),
    failedScripts: new Set(),
    timeout: 5000,
    
    config: [
        // Core
        { path: 'system/sys.js', critical: true, timeout: 3000 },
        { path: 'system/FS.js', critical: true, timeout: 3000 },
        { path: 'system/usermanager.js', critical: true, timeout: 3000 },
        { path: 'system/winmanager.js', critical: true, timeout: 3000 },
        
        // Apps YA NO SE CARGAN DESDE AQUI!! AHORA ES DINAMICOOOOOO
        //Ahora se usa esto:
        { path: 'system/programmanager.js', critical: true, timeout: 3000 },
        //Pero soy un obsesionado con dejar codigo que ya no ocupo, asi que solo lo comentare jeje
        /*
        { path: 'system/apps/settings.js', critical: false },
        { path: 'system/apps/notes.js', critical: false },
        { path: 'system/apps/calc.js', critical: false },
        { path: 'system/apps/browser.js', critical: false },
        { path: 'system/apps/files.js', critical: false },
        { path: 'system/apps/calendar.js', critical: false },
        { path: 'system/apps/terminal.js', critical: false },
        { path: 'system/apps/toybox.js', critical: false },
        { path: 'system/apps/videoplayer.js', critical: false },
        { path: 'system/apps/imgviewer.js', critical: false },
        { path: 'system/apps/nyxpawstore.js', critical: false },
        { path: 'system/apps/ytclient.js', critical: false },
        { path: 'system/apps/weather.js', critical: false },
        { path: 'system/apps/arcade.js', critical: false },
         */
        
        // Init
        { path: 'system/init.js', critical: true, timeout: 5000 }
    ],
    
    loadScript(scriptConfig) {
        return new Promise((resolve, reject) => {
            const { path, critical, timeout = this.timeout } = scriptConfig;
            const scriptName = path.split('/').pop().replace('.js', '');
            
            console.log(`Current script to load: ${path}`);
            
            const script = document.createElement('script');
            script.src = path;
            script.dataset.scriptName = scriptName;
            
            let timeoutId;
            let readyCheckInterval;
            
            timeoutId = setTimeout(() => {
                if (!this.loadedScripts.has(scriptName)) {
                    clearInterval(readyCheckInterval);
                    
                    const error = `Script timeout: ${path} did not respond in ${timeout}ms`;
                    console.error('TIMEOUT ', error);
                    
                    this.failedScripts.add(scriptName);
                    
                    if (critical) {
                        reject(new Error(error));
                    } else {
                        console.warn(`⚠️ ${scriptName} failed and is not critical but could break the system or UX`);
                        resolve({ loaded: false, error });
                    }
                }
            }, timeout);
            
            readyCheckInterval = setInterval(() => {
                if (this.loadedScripts.has(scriptName)) {
                    clearTimeout(timeoutId);
                    clearInterval(readyCheckInterval);
                    console.log(`READY: ${scriptName} loaded`);
                    resolve({ loaded: true });
                }
            }, 100);
            
            script.onerror = (event) => {
                clearTimeout(timeoutId);
                clearInterval(readyCheckInterval);
                
                const error = `Failed to load: ${path}`;
                console.error('❌', error);
                
                this.failedScripts.add(scriptName);
                
                if (critical) {
                    reject(new Error(error));
                } else {
                    console.warn(`⚠️ ${scriptName} failed and is not critical but could break the system or UX`);
                    resolve({ loaded: false, error });
                }
            };
            
            document.body.appendChild(script);
        });
    },
    
    markReady(scriptName) {
        this.loadedScripts.add(scriptName);
        console.log(`Ready: ${scriptName}`);
    },
    
    async loadAll() {
        console.log('Starting all scripts...\n');
        
        const results = {
            total: this.config.length,
            loaded: 0,
            failed: 0,
            errors: []
        };
        
        for (const scriptConfig of this.config) {
            try {
                const result = await this.loadScript(scriptConfig);
                
                if (result.loaded) {
                    results.loaded++;
                } else {
                    results.failed++;
                    results.errors.push({
                        script: scriptConfig.path,
                        error: result.error,
                        critical: scriptConfig.critical
                    });
                }
                
            } catch (error) {
                console.error('CRITICAL ERROR:', error.message);
                
                this.showCriticalError({
                    script: scriptConfig.path,
                    error: error.message,
                    failedScripts: Array.from(this.failedScripts),
                    loadedScripts: Array.from(this.loadedScripts)
                });
                
                return;
            }
        }
        
        console.log('\nLoaded:');
        console.log(`  Loaded scripts: ${results.loaded}/${results.total}`);
        console.log(`  Failed scripts: ${results.failed}/${results.total}`);
        
        if (results.errors.length > 0) {
            console.log('\n⚠️ Corrupted scripts:');
            results.errors.forEach(err => {
                console.log(`  - ${err.script}: ${err.error}`);
            });
        }
        
        const criticalErrors = results.errors.filter(e => e.critical);
        if (criticalErrors.length > 0) {
            this.showCriticalError({
                script: 'multiple',
                error: 'multiple critical system components have failed',
                failedScripts: Array.from(this.failedScripts),
                loadedScripts: Array.from(this.loadedScripts)
            });
        } else {
            console.log('\nSYSTEM READY\n');
        }
    },
    
    showCriticalError(errorInfo) {
        if (typeof sysBsod === 'function') {
            const errorCode = 'X-SLF-CRT';
            const errorText = `
Script Loading Failed ━━━ Failed Script: ${errorInfo.script} Reason: ${errorInfo.error} Loaded Scripts (${errorInfo.loadedScripts.length}): ${errorInfo.loadedScripts.map(s => `  ✅ ${s}`).join('\n')} Failed Scripts (${errorInfo.failedScripts.length}): ${errorInfo.failedScripts.map(s => `  ❌ ${s}`).join('\n')}

━━━

The system cannot continue due to missing critical components.
Please check the browser console for more details.

Press F12 to open Developer Tools.
            `.trim();
            
            sysBsod(errorCode, errorText);
        } else {
            document.body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: #000;
                    color: #fff;
                    font-family: 'Courier New', monospace;
                    padding: 40px;
                    overflow: auto;
                ">
                    <h1 style="color: #f44336;">CRITICAL SYSTEM ERROR - FILES ARE CORRUPTED</h1>
                    <h2>Script Loading Failed</h2>
                    <p><strong>Failed Script:</strong> ${errorInfo.script}</p>
                    <p><strong>Reason:</strong> ${errorInfo.error}</p>
                    
                    <h3>Loaded Scripts (${errorInfo.loadedScripts.length}):</h3>
                    <ul>
                        ${errorInfo.loadedScripts.map(s => `<li style="color: #4caf50;">G: ${s}</li>`).join('')}
                    </ul>
                    
                    <h3>Failed Scripts (${errorInfo.failedScripts.length}):</h3>
                    <ul>
                        ${errorInfo.failedScripts.map(s => `<li style="color: #f44336;">B: ${s}</li>`).join('')}
                    </ul>
                    
                    <p style="margin-top: 40px; color: #ff9800;">
                        The system cannot continue due to missing critical components.<br>
                        Press F12 to open Developer Tools and check the console.
                    </p>
                    
                    <button onclick="location.reload()" style="
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #2196f3;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Retry system load</button>
                </div>
            `;
        }
    }
};

window.scriptReady = function(scriptName) {
    ScriptLoader.markReady(scriptName);
};

console.log('Ready: sysLoader.js');