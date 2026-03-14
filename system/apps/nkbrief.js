console.log('Current: apps/nkbrief.js');

//Codigo aqui:

window.SysVar = window.SysVar || {};

//Pages
const nkbriefPageHome = document.getElementById('nkbrief_page_home');
const nkbriefPageUsage = document.getElementById('nkbrief_page_usage');
const nkbriefPageWeather = document.getElementById('nkbrief_page_weather');
const nkbriefPageRecom = document.getElementById('nkbrief_page_recom');
const nkbriefPageNews = document.getElementById('nkbrief_page_news');
const nkbriefPages = document.querySelectorAll(".nkbrief_page");

//Card
//Weather
const nkbriefCardTemp = document.getElementById('nkbrief_page_home_card_weather_temp');
const nkbriefCardIcon = document.getElementById('nkbrief_page_home_card_weather_icon');
//News
const nkbriefCardNewsTitle = document.getElementById('nkbrief_page_home_card_news_title');
const nkbriefCardNewsInfo = document.getElementById('nkbrief_page_home_card_news_info');

//Most Used
const nkbriefCardMostUsedText = document.getElementById('nkbrief_page_home_card_usage_text');
const nkbriefCardMostUsedIcon = document.getElementById('nkbrief_page_home_card_usage_icon');

//Page
//Weather
const nkbriefPIcon = document.getElementById('nkbrief_page_weather_tempicon');
const nkbriefPPlace = document.getElementById('nkbrief_page_weather_place');
const nkbriefPTemp = document.getElementById('nkbrief_page_weather_temptext');
const nkbriefPMaxMin = document.getElementById('nkbrief_page_weather_maxmin');
const nkbriefPFeels = document.getElementById('nkbrief_page_weather_feelslike');
const nkbriefPDescription = document.getElementById('nkbrief_page_weather_description');


async function renderNews() {
    const feed = 'https://feeds.bbci.co.uk/mundo/rss.xml';
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        nkbriefPageNews.innerHTML = '';
        const top4 = data.items.slice(0, 4);
        const bestNewsItem = data.items.slice(0, 1);

        top4.forEach(newsItem => {
            const newsItemDiv = document.createElement('div');
            newsItemDiv.className = 'nkbrief_page_news_card';

            const newsItemTitle = document.createElement('p');
            newsItemTitle.className = 'nkbrief_page_news_card_title';
            newsItemTitle.textContent = newsItem.title;

            const description = newsItem.description.length > 230
                ? newsItem.description.slice(0, 230) + "..."
                : newsItem.description;
            const newsItemInfo = document.createElement('p');
            newsItemInfo.className = 'nkbrief_page_news_card_info';
            newsItemInfo.textContent = description;

            const newsItemBtn = document.createElement('button');
            newsItemBtn.className = 'nkbrief_card_btn';
            newsItemBtn.textContent = 'Mas informacion...'
            newsItemBtn.addEventListener('click', () => {
                sysExecApp('browser');
                setTimeout(() => browserSetWebTo(newsItem.link), 90);
            });

            newsItemDiv.appendChild(newsItemTitle);
            newsItemDiv.appendChild(newsItemInfo);
            newsItemDiv.appendChild(newsItemBtn);
            nkbriefPageNews.appendChild(newsItemDiv);
        });
        bestNewsItem.forEach(newsItem => {
            nkbriefCardNewsTitle.textContent = newsItem.title;
            nkbriefCardNewsInfo.textContent = newsItem.description;
        });

    } catch (error) {
        nkbriefPageNews.innerHTML = '<p>No se pudieron cargar las noticias.</p>';
        console.error('Cannot render news:', error);
    }
}

async function renderMostUsed() {
    const most = getMostUsedApp();

    if (!most || usageToSeconds(most) === 0) {
        nkbriefCardMostUsedText.textContent = 'No has usado apps todavia.';
        return;
    }

    nkbriefCardMostUsedIcon.src = await window.getPathAppIcon(most.app);
    const timeText = most.hours !== '0'
        ? `${most.hours}h ${most.minutes}m`
        : `${most.minutes}m ${most.secs}s`;

    nkbriefCardMostUsedText.textContent = `${most.app}\n${timeText}`;
}

function getMostUsedApp() {
    if (!SysVar.appsUsage || SysVar.appsUsage.length === 0) return null;

    return [...SysVar.appsUsage].sort((a, b) => usageToSeconds(b) - usageToSeconds(a))[0];
}

function usageToSeconds(entry) {
    return parseInt(entry.hours || 0) * 3600 +
           parseInt(entry.minutes || 0) * 60 +
           parseInt(entry.secs || 0);
}

function getRandomMotPhrase(array) {
    const randomIdx = Math.floor(Math.random() * array.length);
    return array[randomIdx];
}

function generateMotivationalText() {
    try {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        const NBriefCurrentTime = hours * 60 + minutes;

        const dayStart = 6 * 60;
        const dayEnd = 13 * 60 + 45;

        const eveningStart = 13 * 60 + 46;
        const eveningEnd = 18 * 60 + 25;

        const morningPhrases = [
            `A empezar el dia con todo ${SysVar.currentuser.dName}`,
            `Hoy sera un gran dia ${SysVar.currentuser.dName}`,
            `Nueva mañana, nuevas oportunidades.`,
            `Respira profundo y conquista el dia ✨`,
            `Nuevo día, nuevo tu!`,
            `No esperes el momento perfecto, créalo!`,
            `Empieza pequeño, termina enorme!`,
            `${SysVar.currentuser.dName}! Hoy es tu dia!`,
            `Respira. Enfócate. Ejecuta.`
        ];
        const eveningPhrases = [
            `Ya avanzaste mucho, no te detengas!`,
            `Tu yo del futuro te lo va a agradecer.`,
            `Aun queda energía para lograrlo!`,
            `Lo difícil tambien forma carácter`,
            `No abandones el proceso`,
            `Confia en lo que estas construyendo!`,
            `Sigue aunque no tengas ganas.`,
            `Tu puedes ${SysVar.currentuser.dName}! Ya casi terminas!`,
            `Un paso mas y estarás más cerca`
        ];
        const nightPhrases = [
            `Descansa! Has hecho mucho hoy...`,
            `Apaga el ruido, escucha tu paz.`,
            `Mañana sera tu oportunidad ✨`,
            `Gracias por no rendirte.`,
            `Dormir también es productividad.`,
            `Tu mente necesita recargar...`,
            `Ten linda noche!`,
            `Descansa ${SysVar.currentuser.dName}... Mañana seguimos.`,
            `Tienes sueño? Deberias dormir ya...`
        ];

        if (NBriefCurrentTime >= dayStart && NBriefCurrentTime <= dayEnd) {
            return getRandomMotPhrase(morningPhrases);
        } else if (NBriefCurrentTime >= eveningStart && NBriefCurrentTime <= eveningEnd) {
            return getRandomMotPhrase(eveningPhrases);
        } else {
            return getRandomMotPhrase(nightPhrases);
        }
    } catch(error) {
        console.error('Error when loading motivational phrase: '+error);
        return "Ha ocurrido un error.";
    }
}

async function loadWeatherData() {
    try {
        if (!window.WeatherLoaded) {
            await (window.WeatherPromise || window.initWeatherInfo());
        }
    } catch(error) {
        console.error('Cannot get weather: '+error);
    }
}

function renderWeather() {
    if (!window.WeatherLoaded) {
        console.error('Cannot get weather: Data not aviliable');
        nkbriefCardTemp.textContent = `--`;
        nkbriefCardIcon.src = 'assets/weather/cloud.png';
        nkbriefPPlace.textContent = 'Sin info';
        nkbriefPMaxMin.textContent = `↑ -- / ↓ --`;
        nkbriefPFeels.textContent = `Sensacion termica desconocida`;
        nkbriefPDescription.textContent = 'No se pudo obtener el clima.';
        return;
    }

    const temp = window.Weathertemp;
    const feelsLike = window.Weatherfeels;
    const min = window.Weathermin;
    const max = window.Weathermax;
    const place = window.Weatherplace;
    const description = window.Weatherdescripcion;

    //card
    nkbriefPTemp.textContent = `${temp}°C`;
    if (description === 'Despejado') {
        nkbriefCardIcon.src = 'assets/weather/sun.png';
    } else if (description === 'Parcialmente nublado') {
        nkbriefCardIcon.src = 'assets/weather/cloudy.png';
    } else if (description === 'Lluvia') {
        nkbriefCardIcon.src = 'assets/weather/rainy.png';
    } else if (description === 'Tormenta') {
        nkbriefCardIcon.src = 'assets/weather/thunder.png';
    } else {
        nkbriefCardIcon.src = 'assets/weather/cloud.png';
    }

    //page
    nkbriefCardTemp.textContent = `${temp}°C`;
    if (description === 'Despejado') {
        nkbriefPIcon.src = 'assets/weather/sun.png';
    } else if (description === 'Parcialmente nublado') {
        nkbriefPIcon.src = 'assets/weather/cloudy.png';
    } else if (description === 'Lluvia') {
        nkbriefPIcon.src = 'assets/weather/rainy.png';
    } else if (description === 'Tormenta') {
        nkbriefPIcon.src = 'assets/weather/thunder.png';
    } else {
        nkbriefPIcon.src = 'assets/weather/cloud.png';
    }
    nkbriefPPlace.textContent = place;
    nkbriefPMaxMin.textContent = `↑ ${max}° / ↓ ${min}°`;
    nkbriefPFeels.textContent = `Sensacion termica de ${feelsLike}°C`;
    nkbriefPDescription.textContent = description;
}

async function renderAppsUsage() {
    const nkbriefUsageAppsContainer = document.getElementById('nkbrief_page_usage');
    nkbriefUsageAppsContainer.innerHTML = '';

    const sortedUsage = [...SysVar.appsUsage].sort((a,b) => usageToSeconds(b) - usageToSeconds(a));

    if (sortedUsage.length <= 0) {
        const appCard = document.createElement('div');
        appCard.className = 'nkbrief_page_usage_card';

        const appCardImg = document.createElement('img');
        appCardImg.className = 'nkbrief_page_usage_card_img';
        appCardImg.src = 'assets/nekiri.png';

        const appCardContent = document.createElement('div');
        appCardContent.className = 'nkbrief_page_usage_card_content';

        const appCardContentAppname = document.createElement('p');
        appCardContentAppname.className = 'nkbrief_page_usage_card_content_appname';
        appCardContentAppname.textContent = 'No has usado apps todavia.';
        const appCardContentUsage = document.createElement('p');
        appCardContentUsage.className = 'nkbrief_page_usage_card_content_apptimeuse';
        appCardContentUsage.textContent = '--';

        appCardContent.appendChild(appCardContentAppname);
        appCardContent.appendChild(appCardContentUsage);

        appCard.appendChild(appCardImg);
        appCard.appendChild(appCardContent);

        nkbriefUsageAppsContainer.appendChild(appCard);
        return;
    }
    for (let i = 0; i < sortedUsage.length; i++) {
        const object = sortedUsage[i];

        const appCard = document.createElement('div');
        appCard.className = 'nkbrief_page_usage_card';

        const appCardImg = document.createElement('img');
        appCardImg.className = 'nkbrief_page_usage_card_img';
        appCardImg.src = await window.getPathAppIcon(object.app);

        const appCardContent = document.createElement('div');
        appCardContent.className = 'nkbrief_page_usage_card_content';

        const appCardContentAppname = document.createElement('p');
        appCardContentAppname.className = 'nkbrief_page_usage_card_content_appname';
        appCardContentAppname.textContent = object.app;
        const appCardContentUsage = document.createElement('p');
        appCardContentUsage.className = 'nkbrief_page_usage_card_content_apptimeuse';
        if (object.hours === '0' || object.hours === undefined || object.hours === null) {
            appCardContentUsage.textContent = `${object.minutes}m ${object.secs}s`;
        } else {
            appCardContentUsage.textContent = `${object.hours}h ${object.minutes}m`;
        }

        appCardContent.appendChild(appCardContentAppname);
        appCardContent.appendChild(appCardContentUsage);

        appCard.appendChild(appCardImg);
        appCard.appendChild(appCardContent);

        nkbriefUsageAppsContainer.appendChild(appCard);
    }
}

function hideAllPages() {
    nkbriefPages.forEach((page) => {
        page.classList.add('hidden');
    });
}

function goToPage(page) {
    hideAllPages();
    try {
        document.getElementById(`nkbrief_page_${page}`).classList.remove('hidden');
    } catch(error) {
        console.error('nkbrief: page not found.');
        showAlertBox('Pagina no encontrada.');
    }
}

function getNBriefBackgroundImg() {
    try {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        const NBriefCurrentTime = hours * 60 + minutes;

        const dayStart = 6 * 60;
        const dayEnd = 13 * 60 + 45;

        const eveningStart = 13 * 60 + 46;
        const eveningEnd = 18 * 60 + 25;

        if (NBriefCurrentTime >= dayStart && NBriefCurrentTime <= dayEnd) {
            return "url('assets/morning.png')";
        } else if (NBriefCurrentTime >= eveningStart && NBriefCurrentTime <= eveningEnd) {
            return "url('assets/afternoon.png')";
        } else {
            return "url('assets/night.png')";
        }
    } catch(error) {
        console.error('Error when loading nekiri brief background: '+error);
        return "url('assets/morning.png')";
    }
}



//Codigo arriba ⬆️⬆️

async function init_nkbrief() {
    console.log('Initiating nkbrief...');
    goToPage('home');
    document.getElementById('nkbrief_page_home_card_motivation_text').textContent = generateMotivationalText();

    await loadWeatherData();
    renderWeather();
    await renderAppsUsage();
    await renderMostUsed();
    await renderNews();
    document.querySelector('.content_nkbrief').style.backgroundImage = getNBriefBackgroundImg();
}

function cleanup_nkbrief() {
    console.log('Cleaning nkbrief...');
}

window.scriptReady('nkbrief');
//template version 3.0

//=========================================================
//Uso de requests:

/*const WINDOW_ID = 'win_appname'; //CAMBIAR NOMBRE DE VARIABLE!!
function solicitarFullscreen() {
    isFullscreen = !isFullscreen;
    window.parent.postMessage({
        action: 'fullscreen', <-- puede cambairse
        windowId: WINDOW_ID,
        enable: isFullscreen
    }, '*');
}*/

//puede ser:
// 'fullscreen'
// 'maximize'/'restore'
// launch 
// logout
// kill
// addtoappbar
generateMotivationalText();