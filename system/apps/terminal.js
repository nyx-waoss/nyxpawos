console.log("Current: apps/terminal.js");

let terminalInput = null;
let terminalPrint = null;

window.SysVar = window.SysVar || {};

function addLine(line) {
    const newLine = document.createElement('p');
    newLine.textContent = line;
    terminalPrint.appendChild(newLine);
}

function addMLines(linesArray) {
    const fragment = document.createDocumentFragment();
    linesArray.forEach(line => {
        const newLine = document.createElement('p');
        newLine.textContent = line;
        fragment.appendChild(newLine);
    });
    terminalPrint.appendChild(fragment);
}

let printLines = [];
let askingToExec = false;
let evalToExec = '';

function _runCommandInternal(incommand) {
    if (!incommand.includes('jscom')) {
        if (incommand.includes('<') && incommand.includes('>')) {
            if (!SysVar.devMode) {
                addLine('Comando bloqueado: El comando contiene una etiqueta HTML, activa el modo desarrollador para permitir!');
                terminalInput.value = '';
                return;
            } else {
                if (!incommand.includes('runxss')) {
                    addLine('Usa el comando runxss para inyectar HTML');
                    terminalInput.value = '';
                    return;
                }
            }
        }
    }

    const fullCommand = incommand.split(" ");
    const command = fullCommand[0];
    const args = fullCommand.slice(1);
    addLine(`> ${incommand}`);
    
    if (command === 'EXECUTE') {
        if (askingToExec) {
            eval(evalToExec);
            evalToExec = '';
            askingToExec = false;
        } else {
            addLine('No command to execute.');
        }
        terminalInput.value = '';
        return;
    }
    askingToExec = false;
    evalToExec = '';
    if (command === 'runxss') {
        if (SysVar.devMode) {
            const htmlCode = args.slice(1).join(' ');

            if (htmlCode.includes('<') && htmlCode.includes('>')) {
                if (args[0] === '--add') {
                    terminalPrint.innerHTML += htmlCode;
                } else if (args[0] === '--set') {
                    terminalPrint.innerHTML = htmlCode;
                }
                terminalInput.value = '';
                return;
            } else {
                addLine('Ingresa codigo HTML valido para ejecutarlo');
            }
        } else {
            addLine('Activa el modo desarrollador para inyectar HTML');
        }
        terminalInput.value = '';

    } else if (command === 'help') {
        printLines = [
            'Comandos disponibles:',
            'help: muestra esta ayuda',
            'comhelp "comando": muestra ayuda detallada sobre un comando en especifico',
            'clear: limpia la terminal',
            'neofetch: muestra informacion del sistema',
            'whoami: muestra el username y hostname',
            'crashtest: inicia un crasheo de prueba',
            'exec "appname": abre la aplicacion con el ID ingresado',
            'modEl "element": modifica las propiedades del elemento ingresado',
            'taskmgr "args": abre o cierra aplicaciones con el administrador de tareas',
            'devMode --set 1: Activa el modo desarrollador/experimental',
            'devMode --set 0: Desactiva el modo desarrollador/experimental',
            'runxss --args HTML: ejecuta codigo HTML en la terminal',
            'eval code: ejecuta codigo javascript en la terminal',
            'notify content: muestra una notificacion del sistema',
            'export element --type file: Guarda el contenido de un elemento en un archivo en "/"',
            'request type action windowId enable: Hace una request con la informacion ingresada',
            ''
        ];
        addMLines(printLines);
        

    } else if (command === 'clear') {
        terminalPrint.innerHTML = '';
    } else if (command === 'neofetch') {
        printLines = [
            '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⠀ ⠀⠀    ',
            '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⡅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⠀⠀ ⠀⠀⠀    ',
            '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀  ⠀⠀⠀⠀⠀⠀⠀        NyxPaw OS',
            '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀  ⠀⠀⠀⠀⠀⠀⠀⠀⠀        Therian Edition',
            '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⣾⣿⣿⣿⣿⣿⣿⣿⣦⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀         1.0.0',
            '⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⠛⠛⠛⠛⢻⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀       ',
            '⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⡿⠃⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣆⠀⠀     ⠀⠀⠀⠀    OS-Type = 64Bits',
            '⠀⠀⠀⠀⠀⠀⣼⣿⣿⡟⣱⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣷⡀     ⠀⠀⠀⠀   Kernel: NekoKS 1.0 (Linux Based)',
            '⠀⠀⠀⠀⠀⣸⣿⣿⡟⣼⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣷⣿⣿⣿⣷⠀⠀⠀⠀         CPU: Intel Core i7-11800H',
            '⠀⠀⠀⠀⢀⣿⣿⣿⣾⣿⣿⠏⠀⠀⡀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠘⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀         RAM: 16GB',
            '⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⠋⠀⠀⠀⣿⣿⣿⣿⣿⣷⣶⣿⠀⠀⠀⠈⢿⣿⣿⣿⣿⡇⠀⠀⠀        Storage: 1TB',
            '⠀⠀⠀⠀⠸⣿⣿⣿⡿⠃⠀⠀⠀⠀⠋⠉⠉⠉⠉⠉⠉⠛⠀⠀⠀⠀⠈⢿⣿⣿⣿⡇⠀⠀⠀        ⠀',
            '⠀⠀⠀⠀⣴⣿⣿⣿⡅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣧⡀⠀⠀          ⠀Based on NyxPaw OS',
            '⠀⠀⠀⣼⣿⣿⣿⣿⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣷⡀⠀         ⠀Made by Nyx_waoss',
            '⠀⢀⣾⣿⣿⣿⣾⣿⣿⣿⣷⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣷⡄      ⠀',
            '⠐⠛⠛⠛⠛⠛⠛⠛⠻⢿⣿⣿⣿⣿⣿⣿⡿⠿⠟⢛⣛⣿⣿⣿⣿⣿⡟⠛⠛⠛⠛⠛⠛⠛⠛      ⠀Hostname: device',
            '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀         ⠀Username: user',
            '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠛⠋⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀      ⠀',
            '-----------------------------------------------------------------------',
            '',
            ''
        ];
        addMLines(printLines);
    } else if (command === 'whoami') {
        addLine('user@device');
    } else if (command === 'shutdown') {
        if (args[0] === '--now') {
            addLine('Apagando NyxPaw...');
            sysshutdown(false);
        } else {
            const shutdownTime = args[0];
            setTimeout(() => {
                sysshutdown(false);
            }, shutdownTime);
        }
    } else if (command === 'reboot') {
        if (args[0] === '--now') {
            addLine('Reiniciando NyxPaw...');
            sysrestart(false);
        } else if (args[0] === '--mode') {
            const mode = args[1];
            addLine(`Reiniciando en modo ${mode}...`);
            hideTopBar();
            hideAppBar();
            sysComQuitTasks();
            localStorage.setItem('sys_status', 'off');
            setTimeout(() => {                    
                window.location.href = `index.html?mode=${mode}`;
            }, 2200);
        } else if (args[0] === '--recovery') {
            const mode = args[1];
            addLine(`Reiniciando en modo recovery...`);
            hideTopBar();
            hideAppBar();
            sysComQuitTasks();
            localStorage.setItem('sys_status', 'off');
            setTimeout(() => {                    
                window.location.href = `safe/safeboot.html`;
            }, 2200);
        } else {
            const shutdownTime = args[0];
            setTimeout(() => {
                sysrestart(false);
            }, shutdownTime);
        }
    } else if (command === 'crashtest') {
        sysBsod('U-UCS-TCM', 'Crash test initiated by user');
    } else if (command === 'modEl') {
        if (args[0] === 'desktopBG') {
            if (args[1] === 'prop.backgroundImage') {
                document.body.style.backgroundImage = `url(${args[2]})`;
            }
        } else if (args[0] === 'loginScr') {
            if (args[1] === 'prop.bypass') {
                loginscr.classList.add('hidden');
            }
        } else if (args[0] === 'systemContent') {
            if (args[1] === '--html') {
                addLine('Loading...');
                try {
                    const contentToReplace = String(window.fs.openFile(args[2], '/'));
                    if (!contentToReplace) {
                        throw new Error(`File not found or content invalid. File content: ${contentToReplace}`);
                        return;
                    }
                    document.body.innerHTML = contentToReplace;
                } catch(error) {
                    addLine('Failed.');
                    addLine(error);
                    return;
                }
                addLine('Success.');
            } else {
                addLine(args[1] + ' is not valid as a type of importable file.');
            }
        } else {
            addLine('El elemento "' + args[0] + '" no se encontro como elemento modificable');
        }
        addLine('Done');
    } else if (command === 'exec') {
        sysExecApp(args[0]);
    } else if (command === 'jscom') {
        addLine('Comando bloqueado: jscom ya no es soportado, use eval en su lugar.');
        /*if (SysVar.devMode) {
            const jsCode = args.join(' ');
            try {
                const result = eval(jsCode);
                if (result !== undefined) {
                    addLine(String(result));
                }
            } catch (error) {
                addLine(`Error: ${error.message}`);
            }
        } else {
            addLine('Activa el modo desarrollador para ejecutar javascript');
        }*/
    } else if (command === 'taskmgr') {
        if (args[0] === '--new') {
            sysExecApp(args[1]);
            addLine('Tarea "' + args[1] + '" creada');
        } else if (args[0] === '--allClose') {
            sysComQuitTasks();
        } else if (args[0] === '--quit') {
            AppManager.unloadApp(args[1]);
        } else if (args[0] === '--forcequit') {
            AppManager.forceUnloadApp(args[1]);
        } else {
            addLine('El argumento "' + args[0] + '" no existe como argumento valido!');
        }
    } else if (command === 'comhelp') {
        if (args[0] === 'clear') {
            addLine('Limpia la terminal');
        } else if (args[0] === 'neofetch') {
            addLine('Muestra informacion del sistema');
        } else if (args[0] === 'whoami') {
            addLine('Muestra el username y hostname');
        } else if (args[0] === 'crashtest') {
            addLine('Inicia un crasheo de prueba');
        } else if (args[0] === 'exec') {
            addLine('Ejecuta la aplicacion que este entre comillas, por ejemplo exec "settings" abre configuracion');
        } else if (args[0] === 'shutdown') {
            printLines = [
                'apaga el sistema con argumentos:',
                '--now: apaga en este momento',
                'tiempo en ms: apaga dentro del tiempo establecido',
                ' ',
                'Apaga en 3 segundos:',
                'shutdown 3000',
                'Tiempo ms ^ ',
                '                                                                        ',
            ];
            addMLines(printLines);
        } else if (args[0] === 'reboot') {
            printLines = [
                'reinicia el sistema con argumentos:',
                '--now: reinicia en este momento',
                'tiempo en ms: reinicia dentro del tiempo establecido',
                '--recovery: abre el modo recuperacion',
                '--mode MODO: reinicia en un modo:',
                '--mode safe: reinicia en modo seguro',
                ' ',
                'Reinicia en 3 segundos:',
                'shutdown 3000',
                'Tiempo ms ^ ',
                '                                                                        ',
            ];
            addMLines(printLines);
        } else if (args[0] === 'modEl') {
            printLines = [
                'Establece propiedades personalizadas a un elemento del sistema, por ejemplo:',
                'Cambiar el fondo de pantalla:',
                'modEl desktopBG prop.backgroundImage "https://www.sitio.com/imagen.jpeg"',
                ' Elemento ^             ^ Propiedad               fuente ^              ',
                '                                                                        ',
            ];
            addMLines(printLines);
        } else if (args[0] === 'jscom') {
            printLines = [
                'Ejecuta codigo javascript en la terminal:',
                'Muesta "Hello world":',
                'jscom console.log("Hello world");',
                ' Codigo JS ^                           ',
                '                                                                        ',
            ];
            addMLines(printLines);
        } else if (args[0] === 'taskmgr') {
            printLines = [
                'Crea, cierra, o fuerza el cierre de todas/una tarea o servicio, argumentos:',
                '--new: crea una tarea',
                '--quit: cierra una tarea',
                '--forcequit: fuerza el cierre de una tarea',
                '--allClose: cierra todas las tareas',
                '',
                'Cierra ajustes:',
                'taskmgr --quit "settings"',
                ' argumento ^       ^ ID de app',
                '',
                '',
                '',
            ];
            addMLines(printLines);
        } else if (args[0] === 'runxss') {
            printLines = [
                'Ejecuta codigo HTML:',
                '--set: establece TODO el contenido de la terminal al html',
                '--add: agrega el codigo HTML como si fuera una linea',
                '',
                'Agrega un titulo:',
                '  runxss --set <h1>Titulo</h1>',
                'argumento ^       ^ HTML',
                '',
                '',
                '',
            ];
            addMLines(printLines);
        } else if (args[0] === 'eval') {
            printLines = [
                'Ejecuta codigo Javascript:',
                'ADVERTENCIA! Use este comando solo si sabe lo que esta haciendo, de lo contrario su seguridad y su sistema se vera comprometido.',
                '',
                'Muestra "Hola" en la consola:',
                'eval console.log("Hola");',
                'codigo JS ^',
                '',
            ];
            addMLines(printLines);
        } else if (args[0] === 'notify') {
            printLines = [
                'Crea y muestra una notificacion:',
                '',
                'Muestra "Notificacion prueba":',
                'notify Notificacion prueba',
                'contenido ^',
                '',
                'El titulo de la notificacion sera el nombre del usuario actual.',
                'El icono de la notificacion sera el icono de la app de terminal.',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'export') {
            printLines = [
                'Exporta el contenido de un elemento y lu guarda en un archivo:',
                '',
                'Guarda el html del sistema:',
                'export systemContent --html archivo.txt',
                'elemento ^         tipo ^ filename ^',
                '',
                'La ubicacion del archivo siempre sera "/"',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'request') {
            printLines = [
                'Hace una solicitud con los datos ingresados',
                '',
                'Intenta agregar la app de toybox al appbar:',
                'request --local addtoappbar win_toybox true',
                '       tipo ^  accion ^     app ^ activar ^',
                '',
                'Muchas veces se le pedira permiso al usuario primero.',
                ''
            ];
            addMLines(printLines);
        } else {
            addLine('Unknown command.');
        }
    } else if (command === 'devMode') {
        if (args[0] === '--set') {
            if (args[1] === '1') {
                SysVar.devMode = true;
            } else if (args[1] === '0') {
                SysVar.devMode = false;
            } else {
                addLine(args[1] + ' is invalid, type 1 or 0');
            }
        } else {
            addLine(args[0] + ' is not a valid argument.');
        }
    } else if (command === 'eval') {
        evalToExec = args.join(' ');
        if (SysVar.flagAlwaysAllowEvals) {
            eval(evalToExec);
        } else {
            askingToExec = true;
            addLine('[ === WARNING === ]');
            addLine(' ');
            addLine('You are about to execute arbitrary code.');
            addLine('This operation may affect system integrity');
            addLine('Proceed only if you understand the consequences.');
            addLine(' ');
            addLine('[ =============== ]');
            addLine('Type "EXECUTE" to proceed: ');
        }

    } else if (command === 'notify') {
        const notifyText = args.join(' ');
        createNotification('assets/apps/Terminal/4.png',SysVar.currentuser.dName,notifyText);
    } else if (command === 'export') {
        if (args[0] === 'systemContent') {
            if (args[1] === '--html') {
                addLine('Exporting systemContent as a html file...');
                try {
                    window.fs.createFile(args[2], document.body.innerHTML, '/');
                } catch(error) {
                    addLine('Failed.');
                    addLine(error);
                    return;
                }
                addLine('Success.');
                addLine(`filename: ${args[2]}`);
                addLine('route: /');
            } else {
                addLine(args[1] + ' is not valid as a type of exportable file.');
            }
        } else {
            addLine(args[0] + ' not found as an exportable element.');
        }
    } else if (command === 'request') {
        if (args[0] === '--local') {
            window.parent.postMessage({
                action: args[1],
                windowId: args[2],
                enable: args[3]
            }, '*');
            addLine('Done.');
        } else {
            addLine(args[0] + ' not found as a request type.');
        }
    } else {
        addLine('"' + incommand + '" not found.');
    }
    terminalInput.value = '';
    /*terminalPrint.innerHTML += '   <br>';*/
}





window.runCommand = function(incommand) {
    if (!AppManager.loadedApps.has('terminal')) {
        AppManager.loadApp('terminal').then(() => {
            setTimeout(() => {
                _runCommandInternal(incommand);
            }, 70);
        });
        return;
    }

    _runCommandInternal(incommand);
};

function init_terminal() {
    terminalInput = document.getElementById('terminalin');
    terminalPrint = document.getElementById('terminalprint');
    
    terminalInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            _runCommandInternal(terminalInput.value);
        }
    });
}

function cleanup_terminal() {
    console.log('Cleaning terminal...');
    terminalPrint.innerHTML = '';
}

window.scriptReady('terminal');
/*

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀ ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⡅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⣾⣿⣿⣿⣿⣿⣿⣿⣦⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⠛⠛⠛⠛⢻⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀

⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⡿⠃⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀

⠀⠀⠀⠀⠀⠀⣼⣿⣿⡟⣱⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀

⠀⠀⠀⠀⠀⣸⣿⣿⡟⣼⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣷⣿⣿⣿⣷⠀⠀⠀⠀

⠀⠀⠀⠀⢀⣿⣿⣿⣾⣿⣿⠏⠀⠀⡀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠘⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀

⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⠋⠀⠀⠀⣿⣿⣿⣿⣿⣷⣶⣿⠀⠀⠀⠈⢿⣿⣿⣿⣿⡇⠀⠀⠀

⠀⠀⠀⠀⠸⣿⣿⣿⡿⠃⠀⠀⠀⠀⠋⠉⠉⠉⠉⠉⠉⠛⠀⠀⠀⠀⠈⢿⣿⣿⣿⡇⠀⠀⠀

⠀⠀⠀⠀⣴⣿⣿⣿⡅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣧⡀⠀⠀

⠀⠀⠀⣼⣿⣿⣿⣿⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣷⡀⠀

⠀⢀⣾⣿⣿⣿⣾⣿⣿⣿⣷⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣷⡄

⠐⠛⠛⠛⠛⠛⠛⠛⠻⢿⣿⣿⣿⣿⣿⣿⡿⠿⠟⢛⣛⣿⣿⣿⣿⣿⡟⠛⠛⠛⠛⠛⠛⠛⠛

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠛⠋⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀


*/