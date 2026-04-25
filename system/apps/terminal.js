console.log("Current: apps/terminal.js");
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.terminal = {
    displayName: 'Terminal',
    icon: '../../assets/apps/terminal/2.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

let terminalInput = null;
let terminalPrint = null;

window.SysVar = window.SysVar || {};

function addLine(line) {
    const newLine = document.createElement('p');
    newLine.textContent = line;
    terminalPrint.appendChild(newLine);
    terminalPrint.scrollTop = terminalPrint.scrollHeight;
}

function addMLines(linesArray) {
    const fragment = document.createDocumentFragment();
    linesArray.forEach(line => {
        const newLine = document.createElement('p');
        newLine.textContent = line;
        fragment.appendChild(newLine);
    });
    terminalPrint.appendChild(fragment);
    terminalPrint.scrollTop = terminalPrint.scrollHeight;
}

let printLines = [];
let askingToExec = false;
let evalToExec = '';
let permissions = '$';

function parseArgs(input) {
    const args = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (inQuotes) {
            if (char === quoteChar) {
                inQuotes = false;
            } else {
                current += char;
            }
        } else if (char === '"' || char === "'") {
            inQuotes = true;
            quoteChar = char;
        } else if (char === ' ') {
            if (current.length > 0) {
                args.push(current);
                current = '';
            }
        } else {
            current += char;
        }
    }

    if (current.length > 0) args.push(current);
    return args;
}

function updateCursor() {
    document.getElementById('terminal_placetext').textContent = `${SysVar.currentuser.user}@device:${window.fs.getCurrentDirectory()} ${permissions} `;
}

function _runCommandInternal(incommand) {
    updateCursor();
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

    const parsed = parseArgs(incommand);
    const command = parsed[0];
    const args = parsed.slice(1);
    addLine(`> ${incommand}`);
    
    if (command === 'y' || command === 'Y') {
        if (permissions === '#') {
            if (askingToExec) {
                try {
                    const result = eval(evalToExec);
                    if (result !== undefined) addLine(String(result));
                } catch (e) {
                    addLine(`[Error] ${e.message}`);
                }
                evalToExec = '';
                askingToExec = false;
            } else {
                addLine('No command to execute.');
            }
            terminalInput.value = '';
            return;
        } else {
            addLine('Not enough permissions. Use "asroot" to switch to root mode.');
            return;
        }
    }
    askingToExec = false;
    evalToExec = '';
    if (command === 'runxss') {
        if (SysVar.devMode) {
            const htmlCode = args.slice(1).join(' ');

            if (htmlCode.includes('<') && htmlCode.includes('>')) {
                if (args[0] === '-add') {
                    terminalPrint.innerHTML += htmlCode;
                } else if (args[0] === '-set') {
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
            '==== File System Commands ====',
            'ls: List information about the FILEs (the current directory by default).',
            'cd: Change the shell working directory.',
            'mkdir: Create a new directory',
            'rm: Delete a file',
            'touch: Create a new file',
            'cat: Open a file in the terminal',
            'pwd: Show the current directory',
            'cp: Copy a file or directory',
            'mv: Move a file or directory',
            ' ',
            '==== Other Commands ====',
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
            'asroot: ingresar al modo root',
            'asuser: ingresar al modo usuario',
            'echo: imprime el texto ingresado despues del comando echo',
            'adduser: create a user',
            'deluser: delete a user',
            'killservice: kill or stop a system service',
            'newobj: create and add a new system object',
            ' ',
            '==== Debug Commands ====',
            'leaklisteners: Leak listeners',
            'spikelag: Inject X lag spikes',
            'funny: ????',
            ' ',
            ' '
        ];
        addMLines(printLines);
    
    } else if (command === 'ls') {
        if (args[0] === '-l') {
            printLines = [
                `==== Files in ${window.fs.getCurrentDirectory()} ====`,
                `Name   | Size   | Owner`
            ];
            addMLines(printLines);
            const ls_files = window.fs.returnFSArray();
            ls_files.forEach(file => {
                addLine(`${file.filename} | ${file.size} | ${file.owner}`);
            });
        } else {
            printLines = [
                `==== Files in ${window.fs.getCurrentDirectory()} ====`
            ];
            addMLines(printLines);
            const ls_files = window.fs.returnFSArray();
            ls_files.forEach(file => {
                addLine(file.filename);
            });
        }
    } else if (command === 'cd') {
        updateCursor();
        if (args[0] === '~') {
            window.fs.setDirectory('/home/user');
        } else {
            const cdDir = args.join(' ');
            if (cdDir.startsWith('/')) {
                window.fs.setDirectory(cdDir);
            } else {
                window.fs.changeDirectory(cdDir);
            }
        }
    } else if (command === 'mkdir') {
        if (!args[0]) {
            addLine("mkdir: missing operand");
        } else {
            const result = window.fs.createFolder(args[0]);
            if (!result) addLine(`mkdir: cannot create directory '${args[0]}'`);
        }

    } else if (command === 'touch') {
        if (!args[0]) {
            addLine("touch: missing operand");
        } else {
            const result = window.fs.createFile(args[0], '');
            if (!result) addLine(`touch: cannot create file '${args[0]}'`);
        }

    } else if (command === 'cat') {
        if (!args[0]) {
            addLine("cat: missing operand");
        } else {
            const result = window.fs.openFile(args[0]);
            if (result === null || result === false) {
                addLine(`cat: ${args[0]}: No such file or directory`);
            } else {
                addLine(result);
            }
        }

    } else if (command === 'rm') {
        //TODO Implementar -f solo si eres root y agregar variable permisisons
        let recursive = args.includes('-r');
        let force = args.includes('-f');
        
        let targets = args.filter(arg => !arg.startsWith('-'));

        if (targets.length === 0) {
            addLine("rm: missing operand");
        } else {
            targets.forEach(target => {
            let dir = window.fs.getCurrentDirectory();
            let name = target;

            if (target.startsWith('/')) {
                const parts = target.split('/');
                name = parts.pop();
                dir = parts.join('/') || '/';
            }

            const fullPath = target.startsWith('/') ? target : dir + '/' + name;

            if (window.fs.isFolder(fullPath)) {
                if (recursive) {
                    window.fs.deleteItem(name, dir);
                    addLine(`Removed directory: ${target}`);
                } else {
                    addLine(`rm: cannot remove '${target}': Is a directory`);
                }
            } else if (window.fs.isFile(fullPath)) {
                window.fs.deleteItem(name, dir);
            } else {
                if (!force) addLine(`rm: cannot remove '${target}': No such file or directory`);
            }
        });
        }
    } else if (command === 'pwd') {
        addLine(window.fs.getCurrentDirectory());
    } else if (command === 'clear') {
        terminalPrint.innerHTML = '';

    } else if (command === 'neofetch') {
        printLines = [
            '⠀     ⠀⠀⠀⠀⢠⣒⣤⠤⣀⣀⠀',
            '⠀     ⠀⠠⣒⢤⠋⠂⠈⡷⠒⠒⣗⠢⡀⠀⠀⠀⠀',
            '⠀     ⢠⠋⠀⡇⠀⠀⣰⠁⠀⢀⡼⠠⣱⠀⠀⠀ ⠀       NyxPaw OS',
            '⠀     ⢈⠀⠀⣧⣀⣠⣏⢀⠴⠋⠉⠙⡟⡄⠀        ⠀⠀Public Alpha',
            `     ⠀⠘⣄⢠⠟⠉⠉⢻⡎⠀⠀⠀⣸⠇⢸⠀⠀      ⠀  ${SysVar.userversion}`,
            '⠀     ⢀⠜⡏⠁⠀⠀⠀⣧⣀⣠⠾⠋⠀⡜⠀⠀ ⠀    ',
            '     ⠀⡜⠀⠁⠀⠀⠀⠀⠘⣷⠀⠀⡠⠊⠀⠀            OS-Type = 64Bits',
            '     ⠀⠹⣁⡤⢾⡀⠀⠀⢠⠏⠀⡐⠁⠀⠀⠀⠀⠀⠀        Kernel: NekoKS 1.0 (Web Based)',
            '⠀     ⠀⠃⢴⠀⠉⠒⠚⠃⠀⢠⠁⠀⠀⠀⠀⠀⠀⠀         CPU: Intel Core i7-11800H',
            '     ⠀⢸⠀⠈⠁⠀⠀⠀⠀⠀⡎⠀      ⠀          RAM: 16GB',
            '⠀     ⢸⠀⠀⠀⠀⠀⠀⠀⢠⠁⠀⠀⠀⠀  ⠀          Storage: 1TB',
            '⠀     ⠸⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀                              ⠀⠀',
            '⠀     ⠸⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀        ⠀⠀⠀  ⠀⠀⠀Based on NyxPaw Core',
            '      ⠀⠤⠤⠤⠤⠤⠤⠤⠤          ⠀⠀⠀⠀⠀⠀   Made by Nyx_waoss',
            '',
            '                                     Hostname: device',
            `                                     Username: ${SysVar.currentuser.user}`,
            '',
            '-----------------------------------------------------------------------',
            '',
            ''
        ];
        addMLines(printLines);
    } else if (command === 'whoami') {
        addLine(`${SysVar.currentuser.user}@device`);
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
                console.log('[modEl] Setting background:', args[2]);
                document.documentElement.style.setProperty('--wallpaper', `url('${args[2]}')`);
                document.body.style.backgroundSize = 'cover';
                addLine(`Background set to: ${args[2]}`);
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
        } else if (args[0] === 'ls') {
            printLines = [
                'List information about the FILEs (the current directory by default).',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'cd') {
            printLines = [
                'Change the shell working directory.',
                '',
                'Open "hello" directory',
                'cd hello',
                ' dir ^',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'mkdir') {
            printLines = [
                'Create a new directory',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'rm') {
            printLines = [
                'Delete a file or directory',
                '',
                'Options:',
                '-f: ignore nonexistent files and arguments, never prompt',
                '-r: remove directories and their contents recursively',
                '',
                "By default, rm does not remove directories.  Use the --recursive (-r) option to remove each listed directory, too, along with all of its contents.",
                "",
                'Delete "hello" directory',
                'rm -r hello',
                '  r ^   ^ dir name',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'touch') {
            printLines = [
                'Create a new file.',
                '',
                'Create "hello" .txt file',
                'touch hello.txt',
                ' filename ^',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'cat') {
            printLines = [
                'Open a file in the terminal.',
                '',
                'Open "hello" .txt file',
                'cat hello.txt',
                'filename ^',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'pwd') {
            printLines = [
                'Show the current directory.',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'asroot') {
            printLines = [
                'Enter root mode and execute commands with administrator permissions.',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'asuser') {
            printLines = [
                'Enter user mode and execute commands with standard permissions.',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'echo') {
            printLines = [
                'Print the specified text to the terminal.',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'adduser') {
            printLines = [
                'Create a new user',
                '',
                'Create "Carlos" user:       v  permissions',
                'adduser carlos Carlos 1234 user',
                '      user ^ Name ^    ^ password',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'deluser') {
            printLines = [
                'Delete a user',
                '',
                'Available arguments:',
                '-f: Force user delete',
                '',
                'Delete "Carlos" user:',
                'deluser carlos',
                '     user ^',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'killservice') {
            printLines = [
                'Kill a service',
                '',
                'killservice service.srv',
                '         service ^',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'leaklisteners') {
            printLines = [
                '[Info] Debug Command',
                '',
                'Leak listeners',
                '',
                'leaklisteners 100',
                '          rate ^',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'spikelag') {
            printLines = [
                'Inject X spike lags',
                '',
                'spikelag 20',
                '   count ^',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'newobj') {
            printLines = [
                'Create and add a new system object',
                '',
                'Create a window:',
                'newobj window',
                '  object ^',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'funny') {
            printLines = [
                'Sooooooo funny HAHAHAHAHHA',
                '',
                'Funny:',
                'funny ???',
                '   ??? ^',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'cp') {
            printLines = [
                'Copy a file or directory',
                '',
                'Copy "hello.txt" form /home/user/ to /system/directory/:',
                'cp hello.txt /home/user/ /system/directory/',
                '   filename ^    ^ source       ^ destination',
                ''
            ];
            addMLines(printLines);
        } else if (args[0] === 'mv') {
            printLines = [
                'Move a file or directory',
                '',
                'Move "hello.txt" form /home/user/ to /system/directory/:',
                'mv hello.txt /home/user/ /system/directory/',
                '   filename ^    ^ source       ^ destination',
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
            try {
                const result = eval(evalToExec);
                if (result !== undefined) addLine(String(result));
            } catch (e) {
                addLine(`[Error] ${e.message}`);
            }
        } else {
            askingToExec = true;
            addLine('[WARNING] You are about to execute arbitrary code:');
            addLine('This operation may affect system integrity');
            addLine('Proceed only if you understand the consequences.');
            addLine(' ');
            addLine('Type "y" to proceed: ');
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
    } else if (command === 'asroot') {
        permissions = '#';
    } else if (command === 'asuser') {
        permissions = '$';
    } else if (command === 'echo') {
        addLine(args.join(' '));
    } else if (command === 'adduser') {
        if (permissions === '#') {
            if (!args[0]) {
                addLine("username is required");
                addLine('Use the following format: adduser username displayname password permissions');
                return;
            }
            if (!args[1]) {
                addLine("displayname is required");
                addLine('Use the following format: adduser username displayname password permissions');
                return;
            }
            if (!args[2]) {
                addLine("password is required");
                addLine('Use the following format: adduser username displayname password permissions');
                return;
            }
            const userCreationResult = sysCreateUser(args[0], args[1], args[2], args[3] || 'user');
            if (userCreationResult.success) {
                addLine(`User ${args[0]} created successfully.`);
            } else {
                addLine(`Failed to create user: ${userCreationResult.message}`);
            }
        } else {
            addLine(`Failed to create user: Not enought permissions`);
        }
    } else if (command === 'deluser') {
        if (permissions === '#') {
            if (!args[0]) {
                addLine("username is required");
                return;
            }
            if (args[0] === '-f') {
                const userDeletionResult = deleteUser(args[1], true);
                if (userDeletionResult.success) {
                    addLine(`User ${args[1]} deleted successfully.`);
                } else {
                    addLine(`Failed to delete user: ${userDeletionResult.message}`);
                }
            } else {
                const userDeletionResult = deleteUser(args[0]);
                if (userDeletionResult.success) {
                    addLine(`User ${args[0]} deleted successfully.`);
                } else {
                    addLine(`Failed to delete user: ${userDeletionResult.message}`);
                }
            }
        } else {
            addLine(`Failed to delete user: Not enought permissions`);
        }
    } else if (command === 'spikelag') {
        const count = parseInt(args[0]) || 3;
        let i = 0;
        const spam = setInterval(() => {
            _rafLast = performance.now() - 1000;
            if (++i >= count) clearInterval(spam);
        },500);
        addLine(`Injecting ${count} lag spikes...`);
    } else if (command === 'leaklisteners') {
        const rate = parseInt(args[0]) || 50;
        const leak = setInterval(() => {
            for (let i = 0; i < rate; i++) {
                document.body.addEventListener('mousemove', () => {});
            }
        }, 100);
        addLine(`Leaking ${rate} listeners/100ms... (use clear to stop UI)`);
    } else if (command === 'killservice') {
        if (permissions === '#') {
            sysCloseServiceById(args[0]);
            addLine(`Service '${args[0]}' killed.`);
        } else {
            addLine('Not enough permissions.');
        }
    } else if (command === 'newobj') {
        if (permissions === '#') {
            if (args[0] === 'window') {
                const ghost = document.createElement('div');
                ghost.className = 'window';
                ghost.id = `win_ghost_${Date.now()}`;
                ghost.style.cssText = 'width:300px;height:200px;top:100px;left:100px;z-index:9999';
                ghost.innerHTML = '<div class="grab"><span class="grab-title">Window</span><button class="grab-btn">X</button></div>';
                document.body.appendChild(ghost);
                window.initNewWindow(ghost);
                addLine(`New ${args[0]} spawned: ${ghost.id}`);
            } else {
                addLine('Unknown object');
            }
        } else {
            addLine('Not enough permissions.');
        }
    } else if (command === 'funny') {
        if (args[0] === 'flip') {
            const body = document.body;
            if (body.style.transform === 'rotate(180deg)') {
                body.style.transform = '';
                body.style.transition = '';
                addLine('Unflipped.');
            } else {
                body.style.transition = 'transform 1s ease';
                body.style.transform = 'rotate(180deg)';
                addLine('( ˘ ³˘)');
            }
        } else if (args[0] === 'gravity') {
            const gravityLoop = setInterval(() => {
                document.querySelectorAll('.window:not(.hidden):not(.win-max)').forEach(win => {
                    const top = parseInt(win.style.top) || win.offsetTop;
                    const maxTop = window.innerHeight - win.offsetHeight - 4;
                    if (top < maxTop) {
                        win.style.top = Math.min(top + 8, maxTop) + 'px';
                    }
                });
            }, 16);
            addLine('Gravity enabled. type "funny gravity" again to disable.');
            if (window._gravityLoop) {
                clearInterval(window._gravityLoop);
                window._gravityLoop = null;
                addLine('Gravity disabled.');
            } else {
                window._gravityLoop = gravityLoop;
            }
        } else if (args[0] === 'dvd') {
            if (window._bounceLoop) {
                clearInterval(window._bounceLoop);
                window._bounceLoop = null;
                addLine('Bounce stopped.');
                return;
            }
            const velocities = new Map();
            window._bounceLoop = setInterval(() => {
                document.querySelectorAll('.window:not(.hidden):not(.win-max)').forEach(win => {
                    if (!velocities.has(win.id)) {
                        velocities.set(win.id, { vx: (Math.random()-0.5)*6, vy: (Math.random()-0.5)*6 });
                    }
                    let { vx, vy } = velocities.get(win.id);
                    let x = parseInt(win.style.left) || win.offsetLeft;
                    let y = parseInt(win.style.top)  || win.offsetTop;
                    x += vx; y += vy;
                    if (x <= 0 || x + win.offsetWidth  >= window.innerWidth)  vx *= -1;
                    if (y <= 0 || y + win.offsetHeight >= window.innerHeight) vy *= -1;
                    win.style.left = x + 'px';
                    win.style.top  = y + 'px';
                    velocities.set(win.id, { vx, vy });
                });
            }, 16);
            addLine('DVD mode. type "funny dvd" again to stop.');
        } else {
            addLine('Unknown mode');
        }
    } else if (command === 'cp') {
        if (!args[0]) {
            addLine("Missing filename operand.");
            addLine('Use the following format: cp filename source destination');
            return;
        }
        if (!args[1]) {
            addLine("Missing source operand.");
            addLine('Use the following format: cp filename source destination');
            return;
        }
        if (!args[2]) {
            addLine("Missing destination operand.");
            addLine('Use the following format: cp filename source destination');
            return;
        }
        addLine(`Copying ${args[0]} from ${args[1]} to ${args[2]}...`);
        try {
            window.fs.copyItem(args[0], args[1], args[2]);
            addLine('File copied successfully.');
        } catch (error) {
            addLine('Error copying file.');
        }
    } else if (command === 'mv') {
        if (!args[0]) {
            addLine("Missing filename operand.");
            addLine('Use the following format: cp filename source destination');
            return;
        }
        if (!args[1]) {
            addLine("Missing source operand.");
            addLine('Use the following format: cp filename source destination');
            return;
        }
        if (!args[2]) {
            addLine("Missing destination operand.");
            addLine('Use the following format: cp filename source destination');
            return;
        }
        addLine(`Moving ${args[0]} from ${args[1]} to ${args[2]}...`);
        try {
            window.fs.moveItem(args[0], args[1], args[2]);
            addLine('File moved successfully.');
        } catch (error) {
            addLine('Error moving file.');
        }
    } else {
        addLine('"' + incommand + '" not found.');
    }
    terminalInput.value = '';
    /*terminalPrint.innerHTML += '   <br>';*/
    updateCursor();
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