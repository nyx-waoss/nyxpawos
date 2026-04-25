console.log('Current: apps/ytclient.js');
//METADATA (opcional)
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.ytclient = {
    displayName: 'YouTube Client',
    icon: '../../assets/apps/nytclient.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:
let nytclientPageHome = null;
let nytclientPagePlayer = null;
let nytclientPlayerIframe = null;

let nytclientCurrentVidTitle = 'Cargando...';
let nytclientCurrentVidDescription = 'Cargando...';
let nytclientCurrentVidChannel = 'Cargando...';
let nytclientCurrentVidViews = '--';
let nytclientCurrentVidPublished = '--';
let nytclientCurrentVidID = '';

let nytclientApiKey = null;
let nytclientPageSearch = null;
let NYTPlayerIsFullscreen = false;


async function nytGetTrending() {
    if (!nytclientApiKey) return [];

    document.getElementById('nytclient_loadstate').textContent = 'Obteniendo videos...';
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=25&regionCode=US&key=${nytclientApiKey}`);
        const data = await res.json();

        if (data.error) {
            console.error('YouTube API error:', data.error.message);
            return [];
        }

        return data.items.map(v => ({
            videoId: v.id,
            channelId: v.snippet.channelId,
            title: v.snippet.title || '',
            author: v.snippet.channelTitle || '',
            viewCount: v.statistics?.viewCount || '--',
            published: v.snippet.publishedAt?.slice(0, 10) || '',
            description: v.snippet.description || '',
            videoThumbnails: [{ quality: 'medium', url: v.snippet.thumbnails?.medium?.url || '' }]
        }));
    } catch(e) {
        console.error('nytGetTrending failed:', e.message);
        return [];
    }
}

async function nytGetChannelThumbs(videos) {
    const channelIds = [...new Set(videos.map(v => v.channelId))].join(',');
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${nytclientApiKey}`);
        const data = await res.json();
        const map = {};
        data.items.forEach(ch => {
            map[ch.id] = ch.snippet.thumbnails?.default?.url || 'https://placehold.co/400x400.png';
        });
        return map;
    } catch(e) {
        return {};
    }
}

async function NYTSaveUserKey() {
    nytclientApiKey = document.getElementById('nytclient_apikeyinput').value.trim();
    if (!nytclientApiKey) return;
    SysVar.nytclient_apikey = nytclientApiKey;

    document.getElementById('nytclient_page_askapikey').classList.add('hidden');
    document.getElementById('nytclient_page_home').classList.remove('hidden');

    const videos = await nytGetTrending();
    const channelThumbs = await nytGetChannelThumbs(videos);
    NYTRenderVideos(videos, channelThumbs);
}

async function NYTOpenInYoutube() {
    sysExecApp('browser');
    await waitUntil(() => typeof browserSetWebTo === 'function');
    setTimeout(() => browserSetWebTo(`https://www.youtube.com/watch?v=${nytclientCurrentVidID}`), 90);
}

function NYTReturnToHomescreen() {
    nytclientPagePlayer.classList.add('hidden');
    nytclientPageHome.classList.remove('hidden');

    nytclientCurrentVidTitle = 'Cargando...';
    nytclientCurrentVidDescription = 'Cargando...';
    nytclientCurrentVidChannel = 'Cargando...';
    nytclientCurrentVidViews = '--';
    nytclientCurrentVidPublished = '--';
    nytclientCurrentVidID = '';

    nytclientPlayerIframe.src = 'system_appload.html?img=assets/apps/nytclient.png&extras=Cargando video...&textsize=30';
            

    document.getElementById('nytclient_currvideotitle').textContent = 'Cargando...';
    document.getElementById('nytclient_currvideotitle').textContent = `[👤 Cargando...] [👁️ Cargando...] [📅 Cargando...]\nCargando...`;
}


function NYTRenderVideos(videos, channelThumbs = {}) {
    nytclientPageHome.innerHTML = '';
    if (videos.length === 0) {
        nytclientPageHome.innerHTML = '<h3>Ocurrio un error. Revisa tu API Key e intenta de nuevo.</h3>';
        return;
    }
    videos.forEach(video => {
        const thumb = video.videoThumbnails.find(t => t.quality === 'medium')?.url;
        const embedUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;

        const hVDiv = document.createElement('div');
        hVDiv.className = 'nyxclient_hvideodiv';

        const hVDiv_thumb = document.createElement('img');
        hVDiv_thumb.className = 'video_thumb';
        hVDiv_thumb.alt = 'Video Thumbnail';
        hVDiv_thumb.src = thumb;

        const hVDiv_info = document.createElement('div');
        hVDiv_info.className = 'video_info';

        const hVDiv_title = document.createElement('p');
        hVDiv_title.className = 'video_title';
        hVDiv_title.textContent = video.title;

        const hVDiv_specs = document.createElement('div');
        hVDiv_specs.className = 'video_specs';

        const hVDiv_authorimg = document.createElement('img');
        hVDiv_authorimg.className = 'video_authorimg';
        hVDiv_authorimg.alt = 'Video Thumbnail';
        hVDiv_authorimg.src = channelThumbs[video.channelId] || 'https://placehold.co/400x400.png';

        const hVDiv_viewsimg = document.createElement('img');
        hVDiv_viewsimg.className = 'video_viewsicon';
        hVDiv_viewsimg.alt = '👁️';
        hVDiv_viewsimg.src = '../../../assets/eye.png';

        const hVDiv_author = document.createElement('p');
        hVDiv_author.className = 'video_author';
        hVDiv_author.textContent = video.author;

        const hVDiv_views = document.createElement('p');
        hVDiv_views.className = 'video_views';
        hVDiv_views.textContent = video.viewCount;

        const hVDiv_button = document.createElement('p');
        hVDiv_button.className = 'video_btn';
        hVDiv_button.textContent = 'Ver';
        hVDiv_button.onclick = () => {
            nytclientPageHome.classList.add('hidden');

            nytclientCurrentVidTitle = video.title;
            nytclientCurrentVidDescription = video.description;
            nytclientCurrentVidChannel = video.author;
            nytclientCurrentVidViews = video.viewCount;
            nytclientCurrentVidPublished = video.published;
            nytclientCurrentVidID = video.videoId;

            nytclientPlayerIframe.src = embedUrl;
            nytclientPagePlayer.classList.remove('hidden');

            document.getElementById('nytclient_currvideotitle').textContent = nytclientCurrentVidTitle;
            document.getElementById('nytclient_currvideootherinfo').textContent = `[👤 ${nytclientCurrentVidChannel}] [👁️ ${nytclientCurrentVidViews}] [📅 ${nytclientCurrentVidPublished}]\n${nytclientCurrentVidDescription}`;
        }

        hVDiv_specs.appendChild(hVDiv_authorimg);
        hVDiv_specs.appendChild(hVDiv_author);
        hVDiv_specs.appendChild(hVDiv_viewsimg);
        hVDiv_specs.appendChild(hVDiv_views);
        hVDiv_specs.appendChild(hVDiv_button);

        hVDiv_info.appendChild(hVDiv_title);
        hVDiv_info.appendChild(hVDiv_specs);

        hVDiv.appendChild(hVDiv_thumb);
        hVDiv.appendChild(hVDiv_info);

        nytclientPageHome.appendChild(hVDiv);
    });
}

function NYTReloadVideo() {
    document.getElementById('nytclient_iframeplayer').src = document.getElementById('nytclient_iframeplayer').src;
}

function NYTMakeFullScreen() {
    requestFullscreen();
}

function requestFullscreen() {
    NYTPlayerIsFullscreen = !NYTPlayerIsFullscreen;
    window.parent.postMessage({
        action: 'fullscreen',
        windowId: 'win_nytclient',
        enable: NYTPlayerIsFullscreen
    }, '*');
}


//Codigo arriba ⬆️⬆️

async function init_nytclient() {
    console.log('Initiating ytclient...');

    document.getElementById('nytclient_loadstate').textContent = 'Obteniendo videos...';
    nytclientApiKey = SysVar.nytclient_apikey || null;

    nytclientPageHome = document.getElementById('nytclient_page_home');
    nytclientPagePlayer = document.getElementById('nytclient_page_player');
    nytclientPlayerIframe = document.getElementById('nytclient_iframeplayer');

    if (!nytclientApiKey) {
        document.getElementById('nytclient_page_askapikey').classList.remove('hidden');
        nytclientPageHome.classList.add('hidden');
        return;
    } else {
        nytclientPageHome.classList.remove('hidden');
        nytclientPagePlayer.classList.add('hidden');
        document.getElementById('nytclient_page_askapikey').classList.add('hidden');
    }

    const videos = await nytGetTrending();
    const channelThumbs = await nytGetChannelThumbs(videos);
    NYTRenderVideos(videos, channelThumbs);
}

function cleanup_nytclient() {
    console.log('Cleaning ytclient...');

    nytclientPageHome = null;
    nytclientPagePlayer = null;
    nytclientPlayerIframe = null;

    document.getElementById('nytclient_iframeplayer').src = 'system_appload.html?img=assets/apps/nytclient.png&extras=Cargando video...&textsize=30';
}

window.scriptReady('ytclient');
//template version 3.1

//=========================================================
//Uso de requests:

/*const APPNAME_WINDOW_ID = 'win_appname'; //CAMBIAR NOMBRE DE VARIABLE!!
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

//Cambiar todas las referencias de appname por el nombre de la app