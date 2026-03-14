console.log("[NyxPawOS] Current: langmanager.js");

window.SysVar = window.SysVar || {};

let translations = {};

const userLanguage = navigator.language.split('-')[0];

async function translateSystem(languageTo = "auto") {
    console.log('Changing language to: '+languageTo);

    try {
        if (!(navigator.onLine)) {
            throw new Error('No hay conexion a internet. Conectate a internet para descargar los idiomas.');
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
        showAlertBox('Error',error,{as_win:true,icon:'🛜'})
    }
}



window.scriptReady('langmanager');