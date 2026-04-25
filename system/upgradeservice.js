console.log("[NyxPawOS] Current: upgradeservice.js");

function ensureUserFolders() {
    const requiredFolders = ['documents', 'videos', 'images', 'downloads'];

    for (const username in sysUsers) {
        const userPath = `/home/${username}`;

        // Asegurar que /home existe
        if (!window.fs.fileExist('/home')) {
            window.fs.createFolder('home', '/');
        }

        // Asegurar que /home/<user> existe
        if (!window.fs.fileExist(userPath)) {
            window.fs.createFolder(username, '/home');
        }

        // Crear subcarpetas faltantes
        for (const folder of requiredFolders) {
            if (!window.fs.fileExistInPath(folder, userPath)) {
                window.fs.createFolder(folder, userPath);
                console.log(`[Upgrade Service] New folder created: ${userPath}/${folder}`);
            }
        }
    }
}

window.SysVar = window.SysVar || {};

setTimeout(() => {
    ensureUserFolders();
}, 3000);

window.scriptReady('upgradeservice');