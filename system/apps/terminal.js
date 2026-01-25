console.log("Current: apps/terminal.js");

const terminalInput = document.getElementById('terminalin');
const terminalPrint = document.getElementById('terminalprint');
window.SysVar = window.SysVar || {};

terminalInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        _runCommandInternal(terminalInput.value);
    }
});

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

function _runCommandInternal(incommand) {
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

    const fullCommand = incommand.split(" ");
    const command = fullCommand[0];
    const args = fullCommand.slice(1);
    addLine(`> ${incommand}`);
        
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
            sysshutdown();
        } else {
            const shutdownTime = args[0];
            setTimeout(() => {
                sysshutdown();
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
        } else {
            addLine('El elemento "' + args[0] + '" no se encontro como elemento modificable');
        }
        addLine('Done');
    } else if (command === 'exec') {
        sysExecApp(args[0]);
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
        } else if (args[0] === 'modEl') {
            printLines = [
                'Establece propiedades personalizadas a un elemento del sistema, por ejemplo:',
                'Cambiar el fondo de pantalla:',
                'modEl desktopBG prop.backgroundImage "https://www.sitio.com/imagen.jpeg"',
                ' Elemento ^             ^ Propiedad               fuente ^              ',
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
        } else {
            addLine('Comando desconocido');
        }
    } else if (command === 'devMode') {
        if (args[0] === '--set') {
            if (args[1] === '1') {
                SysVar.devMode = true;
            } else if (args[1] === '0') {
                SysVar.devMode = false;
            } else {
                addLine(args[1] + ' no es valido, ingresa 1 o 0');
            }
        } else {
            addLine(args[0] + ' no es un argumento valido');
        }
    } else {
        addLine('El comando "' + incommand + '" no existe como comando valido!');
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