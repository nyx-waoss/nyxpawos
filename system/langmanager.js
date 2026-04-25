console.log("[NyxPawOS] Current: langmanager.js");
/*
Lang Manager no es un archivo tan critico de NyxPawOS, si este archivo no existe, podrias usar el sistema de forma normal, pero el idioma se quedaria en español y no podrias cambiarlo.
*/

window.SysVar = window.SysVar || {};

let translations = {};

const userLanguage = navigator.language.split('-')[0];

async function translateSystem(languageTo = "auto") {
    console.log('Changing language to: '+languageTo);
    if (!SysVar.sysRunningServices.some(item => item.id === 'langmanager.srv')) {
        console.error('Language Manager did not respond');
        return false;
    }
    if (!SysVar.sysRunningServices.some(item => item.id === 'lang.json')) {
        console.error('Failed to fetch: lang.json');
        return false;
    }

    try {
        if (!(navigator.onLine)) {
            if (SysVar.bootFinished) {
                throw new Error('System is offline and translations are not loaded. Cannot change language.');
            }
        }

        if (Object.keys(translations).length == 0) {
            let res = await fetch("system/lang.json");
            let data = await res.json();
            translations = data;
        }

        let lang = "en";
        if (languageTo == 'auto') {
            lang = translations[userLanguage] ? userLanguage : "en";
        } else {
            lang = translations[languageTo] ? languageTo : "en";
        }

        SysVar.currentlang = String(lang);
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = translations[lang][key] || translations["en"][key] || key;
        });
    } catch(error) {
        console.error('Error loading translations:', error);
    }
}



window.scriptReady('langmanager');