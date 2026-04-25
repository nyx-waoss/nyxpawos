console.log("[NyxPawOS] Current: aiservice.js");
/*Sin este archivo no hay IA, asi de facil jsjs*/

let nekiriResponse = '';

const nekiriSemanticDB = {
    emociones: {
        positivas: [
            'feliz', 'contento', 'alegre', 'bien', 'genial', 'emocionado',
            'animado', 'encantado', 'satisfecho', 'orgulloso',
            // Nuevas
            'tranquilo', 'relajado', 'motivado', 'ilusionado', 'agradecido',
            'esperanzado', 'entusiasmado', 'inspirado', 'comodo', 'seguro',
            'en paz', 'con energia', 'con ganas', 'bien onda', 'de buenas',
            'en mi mejor momento', 'radiante', 'pleno', 'realizado', 'dichoso',
        ],
        negativas: [
            'triste', 'mal', 'enojado', 'frustrado', 'cansado', 'estresado',
            'asustado', 'preocupado', 'solo', 'aburrido', 'molesto',
            // Nuevas
            'agotado', 'deprimido', 'angustiado', 'ansioso', 'nervioso',
            'irritado', 'decepcionado', 'confundido', 'perdido', 'sin energia',
            'sin ganas', 'al limite', 'harto', 'amargado', 'resignado',
            'desmotivado', 'inseguro', 'abrumado', 'vacio', 'roto',
            'abandonado', 'incomprendido', 'ignorado', 'rechazado',
            'ignorado', 'incomprendido', 'abandonado', 'roto',
            'vacio', 'abrumado', 'inseguro', 'desmotivado', 'resignado',
            'amargado', 'harto', 'al limite', 'sin ganas', 'sin energia',
            'decepcionado', 'irritado', 'nervioso', 'ansioso', 'angustiado',
            'deprimido', 'agotado',
        ],
        sorpresa: [
            'increible', 'impresionante', 'wow', 'no lo creo', 'en serio',
            'atropellaron', 'accidente', 'sorpresa', 'inesperado',
            // Nuevas
            'no puede ser', 'es una locura', 'que fuerte', 'que barbaridad',
            'no me lo esperaba', 'jamas pense', 'esto es una locura',
            'quedé en shock', 'me dejó sin palabras', 'no lo puedo creer',
            'flipando', 'alucinante', 'impactante', 'brutal', 'tremendo',
            'flipando', 'impactante', 'brutal', 'tremendo', 'alucinante',
            'quede en shock', 'me dejo sin palabras', 'no lo puedo creer',
            'esto es una locura', 'jamas pense', 'no me lo esperaba',
            'que barbaridad', 'que fuerte', 'es una locura', 'no puede ser',
        ]
    },
    sujetos: {
        yo: [
            'yo', 'me', 'mi', 'estoy', 'tengo', 'soy', 'fui', 'estaba',
            
            'a mi', 'para mi', 'conmigo', 'mio', 'mia', 'me siento',
            'me pasa', 'me ocurrio', 'me sucedio', 'me da', 'me hace',
            'me tiene', 'creo que yo', 'pienso que yo', 'siento que',
            'siento que', 'me tiene', 'me hace', 'me da', 'me sucedio',
            'me ocurrio', 'me pasa', 'me siento', 'mio', 'mia', 'conmigo',
            'para mi', 'a mi',
        ],
        otro: [
            'el', 'ella', 'ellos', 'mi amigo', 'mi abue', 'mi mama',
            'mi papa', 'alguien', 'una persona', 'ellas',
            
            'mi hermano', 'mi hermana', 'mi novio', 'mi novia', 'mi pareja',
            'mi jefe', 'mi profe', 'mi compañero', 'mi compañera',
            'un chico', 'una chica', 'mi primo', 'mi prima', 'mi tio', 'mi tia',
            'mi mejor amigo', 'mi mejor amiga', 'otra persona', 'nadie',
            'nadie', 'otra persona', 'mi prima', 'mi primo', 'mi tia', 'mi tio',
            'mi mejor amiga', 'mi mejor amigo', 'una chica', 'un chico',
            'mi compañera', 'mi compañero', 'mi profe', 'mi jefe', 'mi pareja',
            'mi novia', 'mi novio', 'mi hermana', 'mi hermano',
        ],
        objeto: [
            'esto', 'eso', 'aquello', 'la cosa', 'el sistema',
            
            'este programa', 'esta app', 'esta aplicacion', 'el dispositivo',
            'la computadora', 'el archivo', 'la tarea', 'el proyecto',
            'esta situacion', 'el problema', 'este error', 'la pantalla', 
            'este error', 'el problema', 'esta situacion',
            'la tarea', 'el archivo', 'la computadora', 'el dispositivo',
            'esta aplicacion', 'esta app', 'este programa',
        ]
    },
    verbos: {
        accion: [
            'fui', 'hice', 'estaba', 'camine', 'comi', 'dormi', 'trabaje',
            
            'sali', 'entre', 'llegue', 'encontre', 'perdi', 'gane',
            'intente', 'logre', 'falle', 'aprendi', 'estudie', 'visite',
            'compre', 'vendi', 'mande', 'recibi', 'escuche', 'vi',
            'lei', 'escuche', 'vi', 'recibi', 'mande', 'vendi', 'compre',
            'visite', 'estudie', 'aprendi', 'falle', 'logre', 'intente',
            'gane', 'perdi', 'encontre', 'llegue', 'entre', 'sali',
        ],
        estado: [
            'soy', 'estoy', 'tengo', 'siento', 'pienso', 'creo',
            
            'me encuentro', 'me siento', 'me parece', 'me preocupa',
            'me alegra', 'me molesta', 'me cansa', 'me da miedo',
            'me emociona', 'necesito', 'quiero', 'espero', 'deseo', 
            'busco', 'deseo', 'espero', 'quiero', 'necesito', 'me emociona',
            'me da miedo', 'me cansa', 'me molesta', 'me alegra', 'me preocupa',
            'me parece', 'me siento', 'me encuentro',
        ],
        negacion: [
            'no', 'nunca', 'jamas', 'tampoco', 'ni',
            
            'para nada', 'de ninguna manera', 'imposible', 'ni hablar',
            'ni de cerca', 'ni modo', 'para nada', 'en absoluto', 'nada', 
            'en absoluto', 'ni de cerca', 'ni modo', 'para nada',
            'de ninguna manera', 'imposible',
        ]
    }
};

const nekiriShortMem = [];

const nekiriAnswersAccess = [
    'Claro que si {user}!',
    'Con gusto :3',
    'Por supuesto {user} :3',
    'Enseguida!',
    'oks :3'
]

const nekiriTypoMap = {
    
    'q ':'que ',
    'xq':'porque',
    'tmb':'tambien',
    'pls':'por favor',
    'necesito':'quiero',
    'quisiera':'quiero',
    'podrias':'puedes',
    'saludos':'hola',
    'chi':'si',
    'ño':'no',
    'tqm':'te quiero',

    
    'xfa':'por favor',
    'fa ':'favor ',
    'tb ':'tambien ',
    'ntp':'no te preocupes',
    'np ':'no pasa nada ',
    'bn ':'bien ',
    'bnn':'bien',
    'mñn':'mañana',
    'hoy x la':'hoy por la',
    'xd ':'jaja ',
    'kiero':'quiero',
    'k ':'que ',
    'qiero':'quiero',
    'vos':'tu',
    'weno':'bueno',
    'wena':'buena',
    'dnd':'donde',
    'xk':'porque',
    'porq':'porque',
    'pq':'porque',
    'aki':'aqui',
    'ahi':'ahi',
    'ola ':'hola ',
    'oye':'hey',
    'd nada':'de nada',
    'nada q':'nada que',
    'ps ':'pues ',
    'osea':'o sea',
    'o sea k':'o sea que',
    'toy':'estoy',
    'toy ':'estoy ',
    'ta ':'esta ',
    'tas ':'estas ',
    'tamos':'estamos',
    'k tal':'que tal',
    'ktal':'que tal',
    'como t va':'como te va',
    'como te va':'como te va',
    'com estas':'como estas',
    'cm estas':'como estas',
}

const nekiriIntents = [
    {
        id:'saludo',
        keywords: ['hola', 'hey', 'buenas', 'saludos', 'hi', 'hello', 'ola', 'buen dia', 'buen tarde',
 'holi', 'wenas', 'buenas tardes', 'buenas noches', 'buenos dias', 'que hay',
 'que tal', 'como estas', 'como te va', 'que pasa', 'que onda', 'yoo', 'epa',
 'ey', 'sup', 'good morning', 'good night', 'holaa', 'holaaa'],
        weight: 1
    },
    {
        id: 'insulto',
        keywords: ['tonto', 'estupido', 'inutil', 'malo', 'odio', 'basura', 'feo', 'idiota',
 'perra', 'zorra', 'malparido', 'hijueputa', 'hijo de puta', 'hija de puta',
 'la tuya', 'eres un asco', 'te odio', 'eres horrible', 'me caes mal',
 'eres pesimo', 'para que sirves', 'no sirves', 'eres lo peor', 'falla siempre',
 'que asco', 'me das rabia', 'me frustra', 'que fastidio'],
        weight: 1
    },
    {
        id: 'cumplido',
        keywords: ['eres lind', 'eres buen', 'eres tiern', 'me gustas', 'eres genial',
 'me caes bien', 'eres la mejor', 'eres el mejor', 'te quiero', 'tiernx eres',
 'eres increible', 'eres perfecta', 'eres perfecto', 'me encantas',
 'eres muy util', 'me ayudas mucho', 'eres lo mejor', 'gracias por existir',
 'que buena eres', 'que bueno eres', 'eres muy lista', 'eres muy listo',
 'te adoro', 'eres adorable', 'me alegras el dia', 'eres un sol'],
        weight: 1
    },
    {
        id: 'estado',
        keywords: ['estas', 'encuentras', 'sientes', 'como vas', 'como andas', 'todo bien',
 'e sientes', 'como vas', 'que tal', 'como amaneciste', 'como te sientes hoy',
 'como estas hoy', 'como fue tu dia', 'todo tranquilo', 'como te trata la vida',
 'como van las cosas', 'hay novedades', 'que me cuentas', 'todo bien por ahi'],
        weight: 1
    },
    {
        id: 'chiste',
        keywords: ['chiste', 'divierteme', 'hazme reir', 'cuentame algo', 'algo gracioso',
 'cuentame un chiste', 'dimelo gracioso', 'algo chistoso', 'hazme gracia',
 'cuéntame uno', 'sabes alguno', 'uno bueno', 'quiero reir', 'quiero reírme',
 'algo divertido', 'animame', 'subeme el animo','quiero un chiste', 'un chiste', 'cuéntame uno', 'cuentame uno',
'dame un chiste', 'otro chiste', 'uno mas', 'otro mas'],
        weight: 1
    },
    {
        id: 'clima',
        keywords: ['clima', 'temperatura', 'weather', 'llueve', 'frio', 'calor', 'sol', 'lluvia',
 'como esta el tiempo', 'va a llover', 'hay sol', 'hace frio', 'hace calor',
 'que tiempo hace', 'pronostico', 'esta nublado', 'hay neblina', 'hay viento',
 'que tan frio', 'grados', 'celsius', 'fahrenheit'],
        weight: 1
    },
    {
        id: 'puedeshacer',
        keywords: ['puedes hacer', 'tus capacidades', 'que sabes hacer', 'para que sirves',
 'que puedes', 'en que me ayudas', 'que haces', 'cuales son tus funciones',
 'que eres capaz', 'tus funciones', 'que ofereces', 'como me puedes ayudar',
 'que tienes para mi', 'que opciones tienes']
,
        weight: 1
    },
    {
        id: 'aburrido',
        keywords: ['aburrido', 'aburrida', 'aburridx', 'pereza', 'zzz', 'no se que hacer',
 'que hago', 'no tengo nada que hacer', 'me estoy aburriendo', 'que hago hoy',
 'no hay nada', 'todo es igual', 'estoy sin hacer nada', 'tengo pereza',
 'que tedio', 'que flojera', 'me muero de aburrimiento'],
        weight: 1
    },
    {
        id: 'triste',
        keywords: ['estoy triste', 'estoy sad', 'llorar', 'sad', 'mal', 'depre', 'me siento mal',
 'no estoy bien', 'ando triste', 'ando sad', 'voy a llorar', 'medio triste',
 'medio sad', 'estoy llorando', 'quiero llorar', 'muy mal', 'muy triste',
 'me siento horrible', 'todo esta mal', 'no puedo mas', 'me siento vacio',
 'estoy deprimido', 'estoy deprimida', 'sin ganas', 'me siento solo',
 'me siento sola', 'nadie me entiende', 'todo me sale mal'],
        weight: 1
    },
    {
        id: 'about',
        keywords: ['acerca del ', 'del sistema', 'version del', 'info del', 'sobre el'],
        weight: 1
    },
    {
        id: 'furrietherian',
        keywords: ['rian y furr', 'ros y ther', 'ans son raros', 'rros son raros', 'rro y ther', 'rian y fur'],
        weight: 1
    },
    {
        id: 'gracias',
        keywords: ['grax', 'gracias', 'agradezco', 'agradesco', 'muchas gra', 'gracia',
 'mil gracias', 'muchisimas gracias', 'te lo agradezco', 'gracias en serio',
 'de verdad gracias', 'muy amable', 'eres un amor', 'que amable', 'ty',
 'thank you', 'thanks', 'graciasss', 'graciaas'],
        weight: 1
    },
    {
        id: 'risa',
        keywords: ['jaj', 'jej', 'jij', 'jsj', 'xd', 'jojoj', 'haha', 'hehe', 'jajaj',
 'lol', 'lmao', 'me rei', 'que gracioso', 'me mato', 'me cague de risa',
 'ajajaj', 'ahahah', 'pjpjpj', 'jajajaja', 'me rio', 'que chistoso',
 'no puedo parar de reir', 'muerto de risa', 'me mata de risa'],
        weight: 1
    },
    {
        id: 'tierno',
        keywords: ['actua tiern', 'uwu', 'nya', 'arigato', 'goodboy', 'rwar',
 'eres tierno', 'eres tierna', 'aw', 'aww', 'awww', 'que cute',
 'que tierno', 'que linda', 'eres un gatito', 'gatito', 'kitty',
 'neko', 'kawaii', 'sugoi', 'senpai', 'onii', 'oniichan', 'demo',
 'boop', 'pat pat', 'cabezazo', 'headpat'],
        weight: 1
    },
    {
        id: 'hablar',
        keywords: ['ro habla', 'ro conver', 'ro charla', 'os habla', 'que tal si',
 'conversacion', 'te cuento algo', 'te digo algo', 'decir algo', 'contar algo',
 'te muestro algo', 'mostrar algo', 'hablemos un rato', 'conversemos un rato',
 'charlemos un rato', 'puedes conversar', 'hablemos sobre', 'charlemos sobre',
 'conversemos sobre', 'quiero contarte', 'tengo algo que decir',
 'necesito hablar', 'quiero hablar contigo', 'escuchame', 'oye escucha',
 'prestame atencion', 'tengo que contarte algo', 'hay algo que quiero decirte','tengo preguntas', 'te voy a preguntar', 'unas preguntas', 
'te pregunto', 'quiero preguntarte', 'listx', 'listo para','o sobre ti'],
        weight: 1
    },
    {
        id: 'buscar',
        keywords: ['busca', 'internet', 'google', 'navegador', 'safari', 'bing',
 'buscar en', 'busca en google', 'googlea', 'busca informacion',
 'quiero saber sobre', 'informacion sobre', 'que es', 'quien es',
 'que significa', 'define', 'explicame que es', 'buscame'],
        weight: 1
    },
    {
        id: 'quieneres',
        keywords: ['quien eres', 'que eres', 'que es este chat', 'e eres tu',
 'como te llamas', 'tu nombre', 'quien es nekiri', 'que es nekiri',
 'eres una ia', 'eres un robot', 'eres humano', 'eres una persona',
 'presentate', 'hazte conocer', 'me presentas', 'quien soy yo para ti', 'eres una ia real'],
        weight: 1
    },
    {
        id: 'abrirapp',
        keywords: ['abre', 'abrir', 'ejecuta', 'lanza', 'corre', 'muestra', 'la app'],
        weight: 2
    },
    {
        id: 'horafecha',
        keywords: ['que hora', 'que dia', 'que fecha', 'hora es', 'dia es', 'dia es hoy',
 'dime la hora', 'que horas son', 'que dia es hoy', 'en que fecha estamos',
 'a cuanto estamos', 'hoy es', 'que mes', 'que año', 'que semana'],
        weight: 1
    },
    {
        id: 'azar',
        keywords: ['tira un dado', 'lanza un dado', 'cara o cruz', 'cruz o cara',
 'tira una moneda', 'lanza una moneda', 'numero aleatoreo',
 'numero aleatorio', 'elige por mi', 'escoge por mi', 'ayudame a elegir',
 'decidelo tu', 'al azar', 'suerte', 'que el destino decida',
 'tira los dados', 'lanza los dados', 'un numero al azar'],
        weight: 1
    },
    {
        id: 'duelo',
        keywords: ['murio', 'murio ', 'fallecio', 'fallecio ', 'se murio', 'se fue',
        'ya no esta', 'perdimos a', 'perdido a', 'perdi a',
        'infarto', 'accidente grave', 'en el hospital',
        'pocos minutos', 'poco tiempo de vida', 'no va a sobrevivir',
        'va a morir', 'se esta muriendo', 'esta muy grave',
        'lo enterramos', 'el funeral', 'el velorio', 'luto',
        'extraño a', 'lo extrano', 'la extrano', 'ya no puedo hablar con'],
        weight: 2
    },
    {
        id: 'sobremi',
        keywords: [
            'eres hombre', 'eres mujer', 'tu genero', 'como te identificas',
            'tu color favorito', 'color fav', 'tu color fav', 'tienes color favorito',
            'que te gusta', 'tienes gustos', 'tienes preferencias',
            'tienes personalidad', 'como eres tu', 'que eres como persona',
            'cuantos años tienes', 'tu edad', 'cuando naciste', 'eres vieja', 'eres joven',
            'tienes sentimientos', 'sientes algo', 'puedes sentir',
            'tienes amigos', 'estas sola', 'te sientes sola',
            'te gusta algo', 'odias algo', 'tienes miedo',
            'cuentame sobre ti', 'hablame sobre ti', 'sobre ti', 'de ti',
            'quiero saber de ti', 'quiero conocerte', 'describete',
            'como eres', 'quien eres tu', 'algo sobre ti'
        ],
        weight: 1
    },
    {
        id: 'matematica',
        keywords: [
            'cuanto es', 'cuanto da', 'cuanto son', 'resultado de',
            'calcula', 'calculame', 'suma', 'resta', 'multiplica', 'divide',
            'raiz de', 'porcentaje', 'cuanto seria', 'operacion'
        ],
        weight: 1
    },
    {
        id: 'resumirtxt',
        keywords: [
            'resume el', 'resume mi', 'resumen', 'resumir',
            'resumir el', 'resume este', 'resume esta', 'acorta',
            'haz mas corto', 'mas corto','resume','resumir mi'
        ],
        weight: 1
    },
    {
        id: 'reescribir',
        keywords: [
            'reescribe', 'reescribir', 'rewrite', 'reformula', 'reformular',
            'cambia las palabras', 'di lo mismo pero diferente',
            'parafrasea', 'parafrasear', 'di de otra forma',
            'cambia el texto', 'modifica el texto'
        ],
        weight: 1
    },
    {
        id: 'expandirtxt',
        keywords: [
            'expande', 'expandir', 'ampliar', 'amplia el texto', 'agrega mas',
            'añade informacion', 'complementa', 'enriquece', 'agrega datos',
            'busca mas sobre', 'completa el texto', 'dale mas contenido'
        ],
        weight: 1
    },
    {
        id: 'afirmacion',
        keywords: [
            'si', 'si por favor', 'por favor', 'halzo', 'afirmo',
            'afirmo que', 'afirmo que si', 'afirmo que por favor'
        ],
        weight: 1
    }
];

function nekiriPickBestSentence(sentences, palabrasClave, palabrasOriginales) {
    return sentences
        .map(s => {
            const tokens = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').split(/\s+/);
            const nuevas = tokens.filter(w => !palabrasOriginales.has(w) && w.length > 3);
            const relevantes = tokens.filter(w => palabrasClave.includes(w));
            return { s, score: nuevas.length * 0.6 + relevantes.length * 0.4 };
        })
        .sort((a, b) => b.score - a.score)[0]?.s || null;
}

async function fetchFromWikipedia(query) {
    try {
        const searchRes = await fetch(`https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`);
        const searchData = await searchRes.json();
        const pageTitle = searchData?.query?.search?.[0]?.title;
        if (!pageTitle) return { ok: false };

        const extractRes = await fetch(`https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`);
        const extractData = await extractRes.json();
        const extract = Object.values(extractData?.query?.pages)[0]?.extract;
        if (!extract || extract.length < 30) return { ok: false };

        const sentences = extract.split(/[.!?]+/).map(s => s.trim()).filter(s => s.split(' ').length > 5 && s.split(' ').length < 30);
        return { ok: sentences.length > 0, sentences, source: `Wikipedia: ${pageTitle}` };
    } catch {
        return { ok: false };
    }
}

async function fetchFromWiktionary(query) {
    try {
        const term = query.split(' ')[0];
        const res = await fetch(`https://es.wiktionary.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(term)}&format=json&origin=*`);
        const data = await res.json();
        const extract = Object.values(data?.query?.pages)[0]?.extract;
        if (!extract || extract.length < 30) return { ok: false };

        const sentences = extract.split(/[.!?]+/).map(s => s.trim()).filter(s => s.split(' ').length > 5 && s.split(' ').length < 30);
        return { ok: sentences.length > 0, sentences, source: `Wiktionary: ${term}` };
    } catch {
        return { ok: false };
    }
}

async function fetchFromWikidataSummary(query) {
    try {
        const res = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=es&format=json&origin=*&limit=3`);
        const data = await res.json();
        const results = data?.search;
        if (!results || results.length === 0) return { ok: false };

        const sentences = results
            .filter(r => r.description && r.description.split(' ').length > 3)
            .map(r => `${r.label} es ${r.description}`);

        return { ok: sentences.length > 0, sentences, source: `Wikidata` };
    } catch {
        return { ok: false };
    }
}

async function nekiriExpandText(text) {
    const stopwords = new Set([
        'el','la','los','las','un','una','es','son','fue','era','de','del',
        'en','que','con','por','para','una','este','esta','se','su','sus',
        'hay','sido','estar','hecho','hace','han','como','mas','pero','y',
        'o','a','al','lo','le','les','si','ya','no','ni','muy'
    ]);

    const palabrasClave = text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopwords.has(w))
        .slice(0, 3);

    if (palabrasClave.length === 0) {
        return { ok: false, reason: 'no_keywords' };
    }

    const query = palabrasClave.join(' ');
    const palabrasOriginales = new Set(
        text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').split(/\s+/)
    );

    const providers = [fetchFromWikipedia, fetchFromWiktionary, fetchFromWikidataSummary];
    let oracionElegida = null;
    let sourceUsada = null;

    for (const provider of providers) {
        const result = await provider(query);
        if (!result.ok) continue;

        const candidate = nekiriPickBestSentence(result.sentences, palabrasClave, palabrasOriginales);
        if (candidate) {
            oracionElegida = candidate;
            sourceUsada = result.source;
            break;
        }
    }

    if (!oracionElegida) {
        return { ok: false, reason: 'no_good_sentence' };
    }

    const conectores = [
        'Además,', 'También se sabe que', 'Cabe mencionar que',
        'Se destaca que', 'Por otro lado,'
    ];
    const conector = conectores[Math.floor(Math.random() * conectores.length)];

    const textoBase = text.trim().replace(/\.$/, '');

    return {
        ok: true,
        result: `${textoBase}. ${conector} ${oracionElegida.trim()}.`,
        source: sourceUsada,
        query: query
    };
}

function nekiriRewriteEmergency(text) {

    let result = text;
    let cambios = 0;

    const conectoresDivision = [
        ' mientras ', ' aunque ', ' pero ', ' sin embargo ',
        ' ya que ', ' porque ', ' dado que ', ' puesto que ',
        ' cuando ', ' donde ', ' mientras que ',
        ' sin que ', ' a pesar de que ', ' tal como ',
        ' mientras tanto ', ' por lo que ', ' de manera que ',
        ' siempre que ', ' con lo cual ', ' en tanto que '
    ];
    for (const conector of conectoresDivision) {
        const idx = result.indexOf(conector);
        if (idx > 40 && idx < result.length - 30) {
            const primera = result.slice(0, idx).trim();
            const segunda = capitalize(result.slice(idx + conector.length).trim());
            result = `${primera}. ${segunda}`;
            cambios++;
            break;
        }
    }

    const oraciones = result.match(/[^.!?]+[.!?]+/g);
    if (oraciones && oraciones.length >= 2) {
        const ultima = oraciones[oraciones.length - 1].trim();
        const ultimaPalabras = ultima.split(' ').length;
        if (ultimaPalabras >= 5 && ultimaPalabras <= 20) {
            const resto = oraciones.slice(0, -1).join(' ').trim();
            result = `${ultima} ${resto}`;
            cambios++;
        }
    }

    const negacionesIncertidumbre = [
        [/no está claro/gi, 'se desconoce'],
        [/no se sabe/gi, 'permanece incierto'],
        [/no es claro/gi, 'resulta incierto'],
        [/se desconoce/gi, 'no está claro'],
        [/todavía/gi, 'aún'],
        [/aún/gi, 'todavía'],
        [/llevados a cabo/gi, 'ejecutados'],
        [/dio inicio/gi, 'comenzó'],
        [/comenzó/gi, 'tuvo inicio'],
        [/en curso/gi, 'en desarrollo'],
        [/por sorpresa/gi, 'de forma inesperada'],
        [/de forma inesperada/gi, 'sin previo aviso'],
        [/una serie de/gi, 'varios'],
        [/varios/gi, 'una serie de'],
        [/propósito/gi, 'objetivo'],
        [/objetivo/gi, 'propósito'],
        [/exacto/gi, 'preciso'],
        [/preciso/gi, 'exacto'],
        [/conflicto bélico/gi, 'enfrentamiento armado'],
        [/enfrentamiento armado/gi, 'conflicto bélico'],
        [/negociaciones diplomáticas/gi, 'conversaciones diplomáticas'],
        [/bombardeos aéreos/gi, 'ataques aéreos'],
        [/ataques aéreos/gi, 'bombardeos aéreos'],
        [/ciudades/gi, 'zonas urbanas'],
        [/zonas urbanas/gi, 'ciudades'],
        [/no se conoce/gi,      'permanece desconocido'],
        [/se ignora/gi,         'se desconoce'],
        [/posiblemente/gi,      'es probable que'],
        [/probablemente/gi,     'posiblemente'],
        [/aparentemente/gi,     'al parecer'],
        [/al parecer/gi,        'aparentemente'],
        [/supuestamente/gi,     'en apariencia'],
        [/se estima que/gi,     'se calcula que'],
        [/se calcula que/gi,    'se estima que'],
        [/se reporta que/gi,    'se indica que'],
        [/se indica que/gi,     'se reporta que'],
        [/se afirma que/gi,     'se sostiene que'],
        [/se sostiene que/gi,   'se afirma que'],
        [/en principio/gi,      'en teoría'],
        [/en teoría/gi,         'en principio'],
        [/de momento/gi,        'por ahora'],
        [/por ahora/gi,         'de momento'],
        [/hasta la fecha/gi,    'a día de hoy'],
    ];

    for (const [patron, reemplazo] of negacionesIncertidumbre) {
        if (patron.test(result)) {
            result = result.replace(patron, (match) => {
                const esMayuscula = match[0] === match[0].toUpperCase() &&
                                    match[0] !== match[0].toLowerCase();
                return esMayuscula ? capitalize(reemplazo) : reemplazo;
            });
            cambios++;
        }
    }

    result = result
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+\./g, '.')
        .replace(/\.\s*\./g, '.')
        .trim();

    const palabrasOri = text.toLowerCase().split(/\s+/);
    const palabrasRes = result.toLowerCase().split(/\s+/);
    const diferencias = palabrasRes.filter((w, i) => w !== palabrasOri[i]).length;
    const porcentaje = Math.round((diferencias / palabrasOri.length) * 100);

    if (porcentaje === 0) {
        return { ok: false };
    }

    return {
        ok: true,
        result: result,
        porcentaje: porcentaje
    };
}

function nekiriRewriteText(text = "Texto") {

    const palabrasInput = text.trim().split(/\s+/);
    if (palabrasInput.length < 4) {
        return { ok: false, reason: 'too_short', result: text };
    }

    const synonymsFormal = [
        ['le informamos que', 'le avisamos que'],
        ['les informamos que', 'les avisamos que'],
        ['informamos que', 'avisamos que'],
        ['le comunicamos que', 'le hacemos saber que'],
        ['les comunicamos que', 'les hacemos saber que'],
        ['se informa que', 'se avisa que'],
        ['notificamos que', 'avisamos que'],
        ['el aula', 'el salon'],
        ['las aulas', 'los salones'],
        ['la sala', 'el espacio'],
        ['el recinto', 'el lugar'],
        ['la reunión', 'el encuentro'],
        ['el evento', 'la actividad'],
        ['la jornada', 'el dia'],
        ['estará ocupada', 'estará en uso'],
        ['estará ocupado', 'estará en uso'],
        ['no estará disponible', 'estará ocupado'],
        ['disponible', 'libre'],
        ['el día de mañana', 'mañana'],
        ['durante todo el día', 'por todo el dia'],
        ['durante toda la jornada', 'a lo largo del dia'],
        ['en el transcurso del día', 'durante el dia'],
        ['a partir de', 'desde'],
        ['con anticipación', 'con tiempo'],
        ['en breve', 'pronto'],
        ['próximamente', 'pronto'],
        ['por lo tanto', 'así que'],
        ['sin embargo', 'pero'],
        ['no obstante', 'aunque'],
        ['en consecuencia', 'entonces'],
        ['con el fin de', 'para'],
        ['con la finalidad de', 'para'],
        ['a fin de', 'para'],
        ['en relación a', 'sobre'],
        ['con respecto a', 'sobre'],
        ['en virtud de', 'por'],
        ['cabe destacar que', 'hay que notar que'],
        ['es importante mencionar que', 'hay que decir que'],
        ['se hace saber que', 'se avisa que'],
        ['les notificamos que',    'les comunicamos que'],
        ['se les hace saber que',  'se les informa que'],
        ['el horario',             'la franja horaria'],
        ['la franja horaria',      'el horario'],
        ['las instalaciones',      'las dependencias'],
        ['las dependencias',       'las instalaciones'],
        ['el personal',            'los colaboradores'],
        ['los colaboradores',      'el personal'],
        ['de manera obligatoria',  'de forma requerida'],
        ['se solicita que',        'se pide que'],
        ['se requiere que',        'se solicita que'],
        ['con carácter urgente',   'de manera urgente'],
        ['queda suspendido',       'ha sido cancelado'],
        ['ha sido cancelado',      'queda suspendido'],
        ['queda pospuesto',        'ha sido aplazado'],
        ['ha sido aplazado',       'queda pospuesto'],
        ['se comunica que',        'se informa que'],
        ['de acuerdo a',           'conforme a'],
        ['conforme a',             'de acuerdo a'],
        ['en atención a',          'con respecto a'],
        ['el espacio físico',      'el recinto'],
        ['de forma requerida',     'de manera obligatoria'],
    ];

    const synonymsCasual = [
        ['me siento', 'estoy'],
        ['estoy', 'me encuentro'],
        ['creo que', 'pienso que'],
        ['pienso que', 'me parece que'],
        ['me parece', 'creo'],
        ['quiero', 'me gustaria'],
        ['necesito', 'me hace falta'],
        ['tengo que', 'debo'],
        ['debo', 'tengo que'],
        ['puedo', 'soy capaz de'],
        ['no puedo', 'me es imposible'],
        ['a veces', 'de vez en cuando'],
        ['siempre', 'todo el tiempo'],
        ['nunca', 'jamas'],
        ['muy', 'bastante'],
        ['bastante', 'muy'],
        ['un poco', 'algo'],
        ['algo', 'un poco'],
        ['tambien', 'ademas'],
        ['ademas', 'tambien'],
        ['pero', 'sin embargo'],
        ['porque', 'ya que'],
        ['ya que', 'porque'],
        ['cuando', 'en el momento en que'],
        ['despues', 'luego'],
        ['luego', 'despues'],
        ['antes', 'previamente'],
        ['al final', 'finalmente'],
        ['al principio', 'primero'],
        ['en realidad', 'de hecho'],
        ['de hecho', 'en realidad'],
        ['por ejemplo', 'como es el caso de'],
        ['es decir', 'o sea'],
        ['o sea', 'es decir'],
        ['me da miedo', 'me atemoriza'],
        ['me alegra', 'me pone feliz'],
        ['me molesta', 'me fastidia'],
        ['me cansa', 'me agota'],
        ['me sorprende', 'me asombra'],
        ['me parece bien', 'estoy de acuerdo'],
        ['me parece mal', 'no estoy de acuerdo'],
        ['entiendo', 'comprendo'],
        ['comprendo', 'entiendo'],
        ['ayudar', 'apoyar'],
        ['apoyar', 'ayudar'],
        ['hablar', 'conversar'],
        ['conversar', 'platicar'],
        ['pensar', 'reflexionar'],
        ['intentar', 'tratar de'],
        ['tratar de', 'intentar'],
        ['me imagino que',     'supongo que'],
        ['supongo que',        'me imagino que'],
        ['la verdad',          'honestamente'],
        ['honestamente',       'la verdad'],
        ['al rato',            'más tarde'],
        ['más tarde',          'al rato'],
        ['de repente',         'de pronto'],
        ['de pronto',          'de repente'],
        ['igual',              'quizás'],
        ['quizás',             'igual'],
        ['a lo mejor',         'tal vez'],
        ['tal vez',            'a lo mejor'],
        ['por eso',            'así que'],
        ['se ve que',          'parece que'],
        ['parece que',         'se ve que'],
        ['me da igual',        'no me importa'],
        ['no me importa',      'me da igual'],
        ['en fin',             'bueno'],
        ['está bien',          'de acuerdo'],
        ['de acuerdo',         'está bien'],
        ['no hay de otra',     'no queda de otra'],
        ['me cae que',         'creo que'],
        ['estoy que',          'estoy muy'],
        ['o sea que',          'o sea, eso significa que'],
        ['a lo mejor',         'puede que'],
    ];

    const structureRules = [
        (t) => t.replace(
            /^(mañana|el dia de mañana|el día de mañana|hoy|esta tarde|esta mañana)[,\s]+(.+)/i,
            (_, tiempo, resto) => `${capitalize(resto.trimEnd())}, ${tiempo}.`
        ),
        (t) => t.replace(
            /^(a partir de[l\s]\w+|desde el \w+)[,\s]+(.+)/i,
            (_, tiempo, resto) => `${capitalize(resto.trimEnd())}, ${tiempo}.`
        ),

        (t) => t.replace(
            /fue ([\w]+ado|[\w]+ido) por (\w+)/gi,
            (_, verbo, sujeto) => `${sujeto} lo ${verbo.replace(/ado$/, 'ó').replace(/ido$/, 'ió')}`
        ),

        (t) => {
            const palabras = t.split(' ');
            if (palabras.length < 25) return t;
            const conectoresDivision = [' pero ', ' aunque ', ' sin embargo ', ' ya que ', ' porque '];
            for (const conector of conectoresDivision) {
                const idx = t.indexOf(conector);
                if (idx > 30 && idx < t.length - 20) {
                    const primera = t.slice(0, idx).trim();
                    const segunda = capitalize(t.slice(idx + conector.length).trim());
                    return `${primera}. ${segunda}`;
                }
            }
            return t;
        },

        (t) => t.replace(/\s{2,}/g, ' ').replace(/\s+\./g, '.').replace(/\.\s*\./g, '.').trim(),
    ];

    const indicadoresFormal = [
        'le informamos', 'les informamos', 'comunicamos', 'se informa',
        'notificamos', 'el aula', 'la jornada', 'el recinto', 'en virtud',
        'cabe destacar', 'con la finalidad', 'con el fin de',
        'se les informa', 'les notificamos', 'queda suspendido',
        'se requiere', 'de caracter urgente', 'el horario',
        'las instalaciones', 'conforme a', 'en atencion a',
        'queda pospuesto',
    ];
    const textLower = text.toLowerCase();
    const esFormal = indicadoresFormal.some(ind => textLower.includes(ind));
    const synonymsToUse = esFormal ? synonymsFormal : synonymsCasual;

    let result = text;

    for (const [original, synonym] of synonymsToUse) {
        const regex = new RegExp(original, 'gi');
        result = result.replace(regex, (match) => {
            const esMayuscula = match[0] === match[0].toUpperCase() && 
                                match[0] !== match[0].toLowerCase();
            return esMayuscula ? capitalize(synonym) : synonym;
        });
    }

    for (const rule of structureRules) {
        result = rule(result);
    }

    const palabrasOriginales = text.toLowerCase().split(/\s+/);
    const palabrasResultado  = result.toLowerCase().split(/\s+/);
    const cambios = palabrasResultado.filter((w, i) => w !== palabrasOriginales[i]).length;
    const porcentajeCambio = cambios / palabrasOriginales.length;

    if (porcentajeCambio === 0) {
        const emergencyResult = nekiriRewriteEmergency(text);
        if (emergencyResult.ok) {
            return emergencyResult;
        }
        return {
            ok: false,
            reason: 'no_change',
            result: text,
            porcentaje: 0
        };
    }

    if (porcentajeCambio < 0.10) {
        return {
            ok: false,
            reason: 'low_change',
            result: result,
            porcentaje: Math.round(porcentajeCambio * 100)
        };
    }

    return {
        ok: true,
        result: result,
        porcentaje: Math.round(porcentajeCambio * 100)
    };
}

function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function nekiriResumeText(text = "Texto", paragraph = 2) {
    const stopWords = new Set([
        'de','la','el','los','las','un','una','y','en','que','con','por','para',
        'del','al','se','su','sus','es','son','fue','lo','le','les','más','pero',
        'como','aunque','ya','sin','ante','bajo','cada','entre','hacia','hasta',
        'no','si','o','a','e','ni','también','además','igual','manera','parte',
        'otros','otro','otra','este','esta','estos','estas','aquel','aquellos',
        'ser','estar','tener','hacer','poder','querer','saber','ver','dar','ir',
        'muy','bien','mal','solo','todo','nada','algo','siempre','nunca','puede',
        'hay','han','era','eran','tiene','tienen','está','están','sido','been'
    ]);

    const pivotWords = [
        'por lo tanto','en conclusión','en resumen','principalmente','sobre todo',
        'lo más importante','en definitiva','finalmente','en consecuencia',
        'el objetivo','la razón','debido a','gracias a','a causa de','el resultado'
    ];

    function splitSentences(t) {
        return t
            .match(/[^.!?]+[.!?]+/g)
            ?.map(s => s.trim())
            .filter(s => s.split(' ').length > 4)
            || [t];
    }

    function tokenize(t) {
        return t
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w));
    }

    function computeTF(tokens) {
        const tf = {};
        tokens.forEach(w => tf[w] = (tf[w] || 0) + 1);
        const total = tokens.length || 1;
        Object.keys(tf).forEach(k => tf[k] /= total);
        return tf;
    }

    function computeIDF(sentences) {
        const idf = {};
        const N = sentences.length;
        sentences.forEach(s => {
            const unique = new Set(tokenize(s));
            unique.forEach(w => idf[w] = (idf[w] || 0) + 1);
        });
        Object.keys(idf).forEach(k => idf[k] = Math.log(N / idf[k]) + 1);
        return idf;
    }

    function tfidfScore(sentence, idf) {
        const tokens = tokenize(sentence);
        if (!tokens.length) return 0;
        const tf = computeTF(tokens);
        const score = tokens.reduce((sum, w) => sum + (tf[w] * (idf[w] || 0)), 0);
        return score / tokens.length;
    }

    function positionScore(idx, total) {
        if (total <= 1) return 1;
        if (idx === 0) return 1.0;  
        if (idx === total - 1) return 0.6;   
        return 0.5 + 0.3 * (1 - idx / total);
    }

    function pivotBonus(sentence) {
        const lower = sentence.toLowerCase();
        return pivotWords.some(p => lower.includes(p)) ? 0.3 : 0;
    }

    function lengthScore(sentence) {
        const wordCount = sentence.split(' ').length;
        if (wordCount < 8) return 0.5;
        if (wordCount > 40) return 0.7; 
        return 1.0; 
    }

    const sentences = splitSentences(text);

    if (sentences.length <= paragraph) return text;

    const idf = computeIDF(sentences);

    const scored = sentences.map((sentence, idx) => {
        const tf_idf  = tfidfScore(sentence, idf)  * 0.55; 
        const pos     = positionScore(idx, sentences.length) * 0.25; 
        const len     = lengthScore(sentence)       * 0.10; 
        const pivot   = pivotBonus(sentence)        * 0.10;

        return {
            sentence,
            score: tf_idf + pos + len + pivot,
            idx
        };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, paragraph)
        .sort((a, b) => a.idx - b.idx)
        .map(x => x.sentence)
        .join(' ');
}

function nekiriCollapseRepeatedChars(text) {
    const excepcionesDoble = new Set(['r', 'l', 'e', 'c', 'n', 'o', 's']);

    return text.replace(/(.)\1+/g, (match, char) => {
        if (excepcionesDoble.has(char.toLowerCase())) {
            return match.length > 2 ? char : match.slice(0, 2);
        }
        return char;
    });
}
function nekiriDoesInputHasXCaps(text, caps) {
    const mayusculas = text.match(/[A-Z]/g);
    return (mayusculas ? mayusculas.length : 0) > caps;
}

function nekiriDetectUserTone(userInput) {
    const rawSignals = nekiriExtractRawSignals(userInput);
    
    if (rawSignals.includes('triste')) return 'triste';
    if (rawSignals.includes('enojado') && rawSignals.includes('enfasis')) return 'enojado';
    if (rawSignals.includes('cute')) return 'cute';

    const lower = userInput.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (nekiriDoesInputHasXCaps(userInput, 3) && userInput.includes("!")) {
        return 'enojado';
    }
    if (userInput.includes(":3") || userInput.includes("uwu") || userInput.includes("nya") || userInput.includes("onichas") || userInput.includes("arigato")) {
        return 'cute';
    }
    if (['odio', 'molesto', 'harto', 'rabia', 'fastidio', 'irritado', 'asco'].some(w => lower.includes(w))) {
        return 'estresado';
    }
    if ([':D', 'XD', '😁', '😄', 'yay', 'wiii', 'weee', 'genial', 'que bien'].some(w => lower.includes(w))) {
        return 'emocionado';
    }
    if ([':(', ':c', 'T_T', 'TwT', ':/', '😭', '😢', '😔', '💔'].some(w => lower.includes(w))) {
        return 'triste';
    }
    if (['llorando', 'quiero llorar', 'me siento mal', 'todo mal', 'sin ganas'].some(w => lower.includes(w))) {
        return 'triste';
    }
    if (['quiero morir', 'quiero suicidar', 'me quiero matar', 'no aguanto mas', 'no quiero vivir'].some(w => lower.includes(w))) {
        return 'depre';
    }
    if ((userInput.match(/\?{2,}/))) {
        return 'curioso';
    }
    if (['por que', 'como es que', 'en serio', 'no entiendo', 'explica'].some(w => lower.includes(w))) {
        return 'curioso';
    }
    if (['claro que si', 'obvio', 'como no', 'seguro que si', 'lo que tu digas'].some(w => lower.includes(w))) {
        return 'sarcastico';
    }
    if ([':3', 'uwu', 'owo', 'nya', 'onii', 'arigato', 'kawaii', 'sugoi',
         'neko', '(*^▽^*)', '(◕ᴗ◕✿)', '>w<', '^w^', '^-^'].some(w => lower.includes(w))) {
        return 'cute';
    }
    return 'neutral';
}

function nekiriSemanticBuildResponse(analysis, prompt, rawprompt) {
    const nombre = SysVar.currentuser.dName;

    if (analysis.confianza < 0.2) {
        return {
            code: "422",
            ans: "Hmmm... no te entendí del todo, puedes contarme más? :3",
            card: {show: false}
        };
    }

    if (analysis.emocion === 'negativa' && analysis.sujeto === 'otro') {
        if (rawprompt === 'estresado') {
            const respuestas = [
                `Vaya... se nota que estas estresado ${nombre}. ¿Estás bien tú? :c`,
                `Oh no... espero que todo mejore pronto. Por lo que veo estas un poco alterado pero es entendible`,
                `Eso es complicado... Tranquilo, si quieres podemos hablar de ello? Estoy aquí nya~`
            ];
            return {code:"200", ans: getRandomNekiriRes('array', respuestas), card:{show:false}};
        } else if (rawprompt === 'triste') {
            const respuestas = [
                `Vaya... eso suena difícil y obviamente vas a estar triste ${nombre}... ¿Estás bien tú? :c`,
                `Oh no... espero que todo mejore pronto. ¿Cómo te sientes al respecto? uwu`,
                `Eso es complicado... ¿quieres hablar de ello? Tal vez asi te calmes un poquito, estoy aquí nya~`
            ];
            return {code:"200", ans: getRandomNekiriRes('array', respuestas), card:{show:false}};
        } else if (rawprompt === 'depre') {
            const respuestas = [
                `Oye... no digas eso ${nombre}. ¿Estás bien tú? :(`,
                `Ey..., se que es dificil pero no pienses eso de ti! Espero que todo mejore pronto. ¿Cómo te sientes al respecto? uwu`,
                `Oye, no digas eso... ¿quieres hablar de ello? Estoy aquí nya~`
            ];
            return {code:"200", ans: getRandomNekiriRes('array', respuestas), card:{show:false}};
        } else {
            const respuestas = [
                `Vaya... eso suena difícil ${nombre}. ¿Estás bien tú? :c`,
                `Oh no... espero que todo mejore pronto. ¿Cómo te sientes al respecto? uwu`,
                `Eso es complicado... ¿quieres hablar de ello? Estoy aquí nya~`
            ];
            return {code:"200", ans: getRandomNekiriRes('array', respuestas), card:{show:false}};
        }
        
    }

    if (analysis.emocion === 'sorpresa' && analysis.sujeto === 'otro') {
        const respuestas = [
            `¡Eso suena muy inesperado! ¿Estás bien ${nombre}? :o`,
            `Vaya... no esperaba eso. ¿Cómo estás tú? uwu`,
            `Wow, eso es bastante fuerte... cuéntame más si quieres nya~`
        ];
        return {code:"200", ans: respuestas[Math.floor(Math.random()*respuestas.length)], card:{show:false}};
    }

    if (analysis.emocion === 'positiva' && analysis.sujeto === 'yo') {
        const respuestas = [
            `Me alegra escuchar eso ${nombre}! :D`,
            `Nya~ qué bueno! Cuéntame más :3`,
            `Eso suena genial! Me pone feliz que estés bien uwu`
        ];
        return {code:"200", ans: respuestas[Math.floor(Math.random()*respuestas.length)], card:{show:false}};
    }

    if (analysis.tieneNegacion && analysis.emocion === 'negativa') {
        const respuestas = [
            `Parece que las cosas no van del todo bien... ¿puedo ayudarte en algo? :c`,
            `Hmm, suena complicado. ¿Quieres hablar? nya~`,
            `Lo siento ${nombre}... espero que mejore pronto uwu`
        ];
        return {code:"200", ans: respuestas[Math.floor(Math.random()*respuestas.length)], card:{show:false}};
    }

    if (analysis.palabrasClave.length > 0) {
        if (rawprompt === 'cute') {
            return {
                code: "200",
                ans: `Nya! Interesante... mencionaste "${analysis.palabrasClave[0]}" :0 cuéntame más! :3`,
                card: {show: false}
            };
        } else if (rawprompt === 'neutral') {
            return {
                code: "200",
                ans: `Interesante... mencionaste "${analysis.palabrasClave[0]}", que te parece si me cuentas más?`,
                card: {show: false}
            };
        } else if (rawprompt === 'emocionado') {
            return {
                code: "200",
                ans: `Se te ve muy emocionado! Mencionaste algo de "${analysis.palabrasClave[0]}", cuéntame más!!`,
                card: {show: false}
            };
        } else {
            return {
                code: "200",
                ans: `Interesante... mencionaste "${analysis.palabrasClave[0]}", cuéntame más! :3`,
                card: {show: false}
            };
        }
    }

    return {
        code: "422",
        ans: "No te entendí del todo... ¿puedes explicarlo de otra forma? uwu",
        card: {show: false}
    };
}

function nekiriAnalyzeSemantic(prompt) {
    const result = {
        emocion: null,
        emocionesTodas: [],
        sujeto: null,
        tieneNegacion: false,
        palabrasClave: [],
        confianza: 0
    };

    for (const [tipo, palabras] of Object.entries(nekiriSemanticDB.emociones)) {
        const matches = palabras.filter(p => prompt.includes(p));
        if (matches.length > 0) {
            result.emocionesTodas.push(tipo);
            if (!result.emocion) result.emocion = tipo;
            result.palabrasClave.push(...matches);
            result.confianza += 0.3 * matches.length;
        }
    }

    for (const [tipo, palabras] of Object.entries(nekiriSemanticDB.sujetos)) {
        const matches = palabras.filter(p => {
            if (p.includes(' ')) return prompt.includes(p);
            return new RegExp(`\\b${p}\\b`).test(prompt);
        });
        if (matches.length > 0) {
            result.sujeto = tipo;
            result.confianza += 0.2 * matches.length;
        }
    }

    result.tieneNegacion = nekiriSemanticDB.verbos.negacion
        .some(p => prompt.includes(p));
    if (result.tieneNegacion) result.confianza += 0.1;

    result.confianza = Math.min(result.confianza, 1);

    return result;
}

function nekiriMatchesKeyword(prompt, keyword) {
    if (keyword.includes(' ')) return prompt.includes(keyword);
    const regex = new RegExp(`\\b${keyword}\\b`);
    return regex.test(prompt);
}

function nekiriRemember(intent, prompt) {
    nekiriShortMem.push({intent, prompt});
    if (nekiriShortMem.length > 3) nekiriShortMem.shift();
}

function nekiriGetLastUsrIntent() {
    if (nekiriShortMem.length < 2) return null;
    return nekiriShortMem[nekiriShortMem.length - 2].intent;
}

function nekiriDetectIntent(prompt) {
    let bestMatch = null;
    let bestScore = 0;

    for (const intent of nekiriIntents) {
        const score = intent.keywords.filter(kw => nekiriMatchesKeyword(prompt, kw)).length * intent.weight;
        if (score > bestScore) {
            bestScore = score;
            bestMatch = intent.id;
        }
    }

    return bestScore > 0 ? bestMatch : null;
} 

function getRandomNekiriRes(type, array) {
    let nkrandomAccssRes = '';
    if (type === 'array') {
        nkrandomAccssRes = array[Math.floor(Math.random() * array.length)];
    } else if (type === 'access') {
        nkrandomAccssRes = nekiriAnswersAccess[Math.floor(Math.random() * nekiriAnswersAccess.length)];
    } else {
        return 'Invalid type given: ' + type + ' >>> Please use "array" or "access"';
    }

    return nkrandomAccssRes.replace('{user}', SysVar.currentuser.dName);
}

function normalizeNekiriUserInput(userRequest) {
    let userInputToReturn = userRequest.toLowerCase();
    userInputToReturn = userInputToReturn.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    userInputToReturn = userInputToReturn.replace(/[^a-zA-Z0-9 \+\-\*\/\=]/g, "");
    userInputToReturn = userInputToReturn.replace(/\n+/g, "\n");
    userInputToReturn = userInputToReturn.replace(/[\u200B-\u200D\uFEFF]/g, "");

    for (const [typo, fix] of Object.entries(nekiriTypoMap)) {
        userInputToReturn = userInputToReturn.replaceAll(typo, fix);
    }

    userInputToReturn = nekiriCollapseRepeatedChars(userInputToReturn);
    userInputToReturn = userInputToReturn.trim();
    return userInputToReturn;
}

function nekiriUsrIsQuestion(prompt) {
    return prompt.includes('que') || prompt.includes('como') || 
           prompt.includes('cuando') || prompt.includes('donde') ||
           prompt.includes('quien') || prompt.includes('cuanto');
}

function nekiriExtractRawSignals(rawText) {
    const signals = [];

    const emoticonos = [
        { pattern: /:\(|:c|:'c|:'\(|TwT|T_T|;\(/, tone: 'triste' },
        { pattern: /:D|:P|:\)|:3|=D|=\)/, tone: 'feliz' },
        { pattern: />:\(|>:c|>:\//, tone: 'enojado' },
        { pattern: /:\/|:\||=\/|:S/, tone: 'confundido' },
        { pattern: /uwu|owo|>w<|\^w\^|\^-\^/, tone: 'cute' },
    ];

    for (const { pattern, tone } of emoticonos) {
        if (pattern.test(rawText)) signals.push(tone);
    }

    const emojiMap = [
        { chars: ['😭','😢','😔','💔','🥺','😿'], tone: 'triste' },
        { chars: ['😡','😤','🤬','👿'], tone: 'enojado' },
        { chars: ['😄','😁','🥳','😊','🎉'], tone: 'feliz' },
        { chars: ['😰','😨','😟','😩','😫'], tone: 'estresado' },
        { chars: ['🤔','❓','😕'], tone: 'curioso' },
    ];

    for (const { chars, tone } of emojiMap) {
        if (chars.some(e => rawText.includes(e))) signals.push(tone);
    }

    if (/!{2,}/.test(rawText)) signals.push('enfasis');
    if (/\?{2,}/.test(rawText)) signals.push('curioso');
    if (/\.{3,}/.test(rawText)) signals.push('melancolico');

    return signals;
}

function nekiriTryBuildOwnResponse(prompt, tone, lastIntent) {
    const nombre = SysVar.currentuser.dName;

    const emotionalContext = ['triste', 'semantic', 'hablar'];
    if (emotionalContext.includes(lastIntent)) {
        const customAns = [
            `Sigo aquí contigo ${nombre}... cuéntame más si quieres :c`,
            `Te escucho... ¿qué más pasó? uwu`,
            `No tienes que estar bien, dime lo que sientes nya~`,
            `Mmm... no sé qué decirte exactamente, pero aquí estoy :3`
        ];
        return { built: true, ans: getRandomNekiriRes('array', customAns) };
    }

    if (tone === 'estresado') {
        const customAns = [
            `Oye, respira... ¿qué está pasando? :c`,
            `Se nota que algo te molesta... ¿quieres contarme? uwu`,
            `Parece que estás frustrado... estoy aquí si quieres hablar nya~`
        ];
        return { built: true, ans: getRandomNekiriRes('array', customAns) };
    }

    if (tone === 'triste') {
        const customAns = [
            `Parece que algo no está bien... ¿estás okay ${nombre}? :c`,
            `Oye... ¿todo bien? uwu`,
            `No sé exactamente qué pasó, pero se nota que algo te afecta nya~`
        ];
        return { built: true, ans: getRandomNekiriRes('array', customAns) };
    }

    if (tone === 'curioso') {
        const customAns = [
            `Hmm, interesante... no sé mucho sobre eso, pero cuéntame más! :3`,
            `No tengo una respuesta clara para eso... ¿me das más contexto? uwu`,
            `Eso suena curioso! Explícame más y lo intento nya~`
        ];
        return { built: true, ans: getRandomNekiriRes('array', customAns) };
    }

    if (tone === 'emocionado') {
        const customAns = [
            `Uy, se te nota emocionado! Cuéntame! :D`,
            `Jaja algo pasó verdad? Dime! :3`,
            `Se nota que hay algo bueno ahí... ¿qué fue? nya~`
        ];
        return { built: true, ans: getRandomNekiriRes('array', customAns) };
    }

    if (tone === 'cute') {
        const customAns = [
            `Nya~ no sé de qué hablas pero suena tierno :3`,
            `Uwu... cuéntame más! :3`,
            `Rwar! Repite eso pero más despacio jeje nya~`
        ];
        return { built: true, ans: getRandomNekiriRes('array', customAns) };
    }

    const genericAns = [
        `Mmm... no estoy segura de entender bien, ¿me lo explicas de otra forma? :3`,
        `Creo que no capté bien lo que dijiste... ¿puedes repetirlo? uwu`,
        `Perdona ${nombre}, no te entendí del todo... ¿qué quisiste decir? nya~`,
        `Hmm, no sé cómo responder a eso... ¿me das una pista? :3`
    ];
    return { built: true, ans: getRandomNekiriRes('array', genericAns) };
}

function nekiriGenerateSmartFallback(prompt, tone, lastIntent) {
    const nombre = SysVar.currentuser.dName;

    const palabras = prompt.split(' ').filter(w => w.length > 3);
    const stopwords = [
        'que', 'como', 'esto', 'eso', 'una', 'uno', 'para', 'pero',
        'porque', 'cuando', 'donde', 'quien', 'cual', 'con', 'sin',
        'muy', 'bien', 'mal', 'pues', 'osea', 'solo', 'todo', 'nada',
        'algo', 'algu', 'creo', 'pienso', 'siento', 'quiero', 'puedo',
        'tengo', 'estoy', 'seria', 'puede', 'haber', 'habia', 'hacer'
    ];
    const palabrasUtiles = palabras.filter(w => !stopwords.includes(w));
    const temaDetectado = palabrasUtiles.length > 0
        ? palabrasUtiles[Math.floor(Math.random() * Math.min(2, palabrasUtiles.length))]
        : null;

    const mencionaPersona = [
        'mi amigo', 'mi amiga', 'mi mama', 'mi papa', 'mi hermano',
        'mi hermana', 'mi novio', 'mi novia', 'mi pareja', 'mi perro',
        'mi gato', 'mi mascota', 'mi jefe', 'mi profe', 'mi primo',
        'mi abuela', 'mi abuelo', 'alguien', 'una persona', 'un chico', 'una chica'
    ].some(p => prompt.includes(p));

    const esPregunta = ['que', 'como', 'cuando', 'donde', 'quien', 'cuanto', 'por que']
        .some(w => prompt.startsWith(w) || prompt.includes(' ' + w + ' '));

    const esAccionPasada = [
        'fui', 'estaba', 'hice', 'me paso', 'me dijeron', 'me dijo',
        'encontre', 'vi', 'escuche', 'recibi', 'perdi', 'gane', 'intente',
        'me cayo', 'me salio', 'me toco', 'resulto', 'termino', 'empezo'
    ].some(w => prompt.includes(w));

    const esNegativo = [
        'mal', 'terrible', 'horrible', 'peor', 'odio', 'detesto', 'feo',
        'asqueroso', 'inutil', 'absurdo', 'ridiculo', 'estupido', 'tonto',
        'triste', 'llorar', 'dolio', 'duele', 'dulio', 'dano', 'lastimo'
    ].some(w => prompt.includes(w));

    const esOpinion = [
        'creo que', 'pienso que', 'me parece', 'opino que', 'siento que',
        'en mi opinion', 'a mi me', 'yo creo', 'yo pienso', 'segun yo'
    ].some(w => prompt.includes(w));

    const esFuturo = [
        'voy a', 'quiero', 'espero', 'ojala', 'quisiera', 'me gustaria',
        'planeo', 'pienso', 'tengo planeado', 'manana', 'la proxima', 'pronto'
    ].some(w => prompt.includes(w));

    const contextosEmocionales = ['triste', 'duelo', 'escucha', 'hablar'];
    if (contextosEmocionales.includes(lastIntent)) {
        const respuestas = [
            `Mm... te escucho. ¿Y cómo te sientes tú con todo eso? :c`,
            `Sigo aquí contigo ${nombre}... cuéntame más si quieres uwu`,
            `Entiendo... o bueno, lo intento. ¿Qué más pasó? :3`,
            `Eso suena importante... ¿cómo estás tú ahorita? nya~`
        ];
        return getRandomNekiriRes('array', respuestas);
    }

    if (tone === 'triste' || esNegativo) {
        const respuestas = temaDetectado ? [
            `Mm... parece que algo relacionado a "${temaDetectado}" no está bien. ¿Quieres contarme? :c`,
            `Oye, lo de "${temaDetectado}" suena difícil... ¿estás bien? uwu`,
            `Se nota que algo te molesta... ¿qué pasó con "${temaDetectado}"? nya~`
        ] : [
            `Oye... ¿todo bien? Se nota que algo pasa :c`,
            `Mm... parece que algo no está bien. ¿Quieres hablar? uwu`,
            `Estoy aquí si quieres contarme algo nya~`
        ];
        return getRandomNekiriRes('array', respuestas);
    }

    if (tone === 'estresado') {
        const respuestas = temaDetectado ? [
            `Respira... lo de "${temaDetectado}" tiene solución, ¿qué pasó exactamente? :3`,
            `Parece que "${temaDetectado}" te tiene un poco al límite... ¿qué fue? uwu`,
            `Oye, cuéntame más de "${temaDetectado}", a ver si puedo ayudar nya~`
        ] : [
            `Respira un momento... ¿qué está pasando? :3`,
            `Se te nota estresado... ¿qué fue? uwu`,
            `Oye, cuéntame, a ver si puedo ayudar nya~`
        ];
        return getRandomNekiriRes('array', respuestas);
    }

    if (mencionaPersona) {
        const respuestas = temaDetectado ? [
            `Mm... y eso de "${temaDetectado}", ¿tiene que ver con esa persona? :3`,
            `Cuéntame más... ¿qué pasó exactamente? uwu`,
            `Interesante... ¿cómo te sientes tú con eso? nya~`
        ] : [
            `Mm... cuéntame más sobre esa persona y lo que pasó :3`,
            `¿Y cómo quedaron las cosas? uwu`,
            `Interesante... ¿cómo te sientes tú con todo eso? nya~`
        ];
        return getRandomNekiriRes('array', respuestas);
    }

    if (esAccionPasada) {
        const respuestas = temaDetectado ? [
            `Ooh, y eso de "${temaDetectado}"... ¿cómo te fue? :3`,
            `Cuéntame más! ¿Qué pasó después con "${temaDetectado}"? uwu`,
            `Mm interesante... ¿y cómo resultó todo? nya~`
        ] : [
            `Ooh, cuéntame más! ¿Cómo te fue? :3`,
            `¿Y qué pasó después? uwu`,
            `Mm interesante... ¿cómo resultó? nya~`
        ];
        return getRandomNekiriRes('array', respuestas);
    }

    if (esOpinion) {
        const respuestas = temaDetectado ? [
            `Mm, entiendo tu punto sobre "${temaDetectado}"... ¿por qué piensas eso? :3`,
            `Interesante opinión! ¿Qué te hizo pensar eso de "${temaDetectado}"? uwu`,
            `Mmm no lo había pensado así... ¿me explicas más? nya~`
        ] : [
            `Mm, interesante punto de vista... ¿por qué piensas eso? :3`,
            `Curioso! ¿Qué te hizo llegar a esa conclusión? uwu`,
            `Mmm no lo había pensado así... ¿me explicas más? nya~`
        ];
        return getRandomNekiriRes('array', respuestas);
    }

    if (esFuturo) {
        const respuestas = temaDetectado ? [
            `Ooh, tienes planes con "${temaDetectado}"! Cuéntame más :D`,
            `Suena bien lo de "${temaDetectado}"! ¿Cuándo? :3`,
            `Mm, ¿y cómo vas a hacer lo de "${temaDetectado}"? uwu`
        ] : [
            `Ooh, tienes planes! Cuéntame :D`,
            `Suena interesante! ¿Cuándo? :3`,
            `Mm, ¿y cómo lo vas a hacer? uwu`
        ];
        return getRandomNekiriRes('array', respuestas);
    }

    if (esPregunta) {
        const respuestas = temaDetectado ? [
            `Mmm, lo de "${temaDetectado}" no lo sé bien... ¿quieres que busquemos? :3`,
            `No tengo una respuesta clara sobre "${temaDetectado}"... ¿me das más contexto? uwu`,
            `Eso de "${temaDetectado}" suena interesante pero no sé... ¿buscamos? nya~`
        ] : [
            `Mmm no sé exactamente... ¿puedes darme más contexto? :3`,
            `No tengo una respuesta clara para eso... ¿me explicas más? uwu`,
            `Eso suena interesante pero no sé... cuéntame más nya~`
        ];
        return getRandomNekiriRes('array', respuestas);
    }

    if (temaDetectado) {
        const respuestas = [
            `Mm... lo de "${temaDetectado}", cuéntame más! :3`,
            `Interesante lo que dices sobre "${temaDetectado}"... ¿qué más? uwu`,
            `Oye, eso de "${temaDetectado}" suena curioso... explícame nya~`,
            `Mm, ¿y qué tiene que ver "${temaDetectado}" con todo esto? :3`
        ];
        return getRandomNekiriRes('array', respuestas);
    }

    const ultimoRecurso = [
        `Mm... no te entendí del todo, pero aquí estoy! ¿Me lo explicas de otra forma? :3`,
        `Hmm, creo que me perdí un poco... ¿qué quisiste decir? uwu`,
        `No capté bien, perdona ${nombre}... ¿puedes repetirlo? nya~`,
        `Estoy aquí, pero no te entendí bien... ¿me das una pista? :3`
    ];
    return getRandomNekiriRes('array', ultimoRecurso);
}

function sysNekiriAsk(userQuestion, permissions=["execapps","sysconfig"], fromPlatform='system', extra={}) {
    if (!SysVar.sysRunningServices.some(item => item.id === 'aiservice.srv')) {
        console.error('AI Service did not respond');
        return false;
    }
    const nekiriUserPrompt = normalizeNekiriUserInput(userQuestion);
    const nekiriRawSignals = nekiriExtractRawSignals(userQuestion);
    const nekiriUsrTone = nekiriDetectUserTone(userQuestion);
    const nekiriUsrIntent = nekiriDetectIntent(nekiriUserPrompt);
    if (nekiriUsrIntent === 'saludo') {
        if (nekiriUsrTone === 'emocionado') {
            nekiriAnswers = [
                "Hey "+ SysVar.currentuser.dName +"! Se te ve super emocionado :3",
                "Nya~ Hola!! Alguna novedad? :3",
                "Holi! Qué tal tu día? Por lo que veo va bien jsjs",
                "Hey! ¿En qué te puedo ayudar "+ SysVar.currentuser.dName +"? nya~",
                "Ey ey! Aquí estoy :D ¿En qué trabajas? Se ve super emocionante",
                "Holi holi "+ SysVar.currentuser.dName +"! Qué alegría verte asi de feliz nya~",
                "Hola de nuevo! Qué se nos ofrece hoy? Porque tan emocionado? jsjs :3"
            ]
        } else {
            nekiriAnswers = [
                "Hola "+ SysVar.currentuser.dName +"! En qué puedo ayudarte hoy? :3",
                "Nya~ ¡Hola! ¿Cómo estás? :3",
                "¡Holi! ¿Qué tal tu día? uwu",
                "¡Hey! ¿En qué te puedo ayudar "+ SysVar.currentuser.dName +"? nya~",
                "Ey ey! Aquí estoy :D ¿En qué te puedo echar una mano?",
                "Holi holi "+ SysVar.currentuser.dName +"! Qué alegría verte por aquí nya~",
                "Hola de nuevo! ¿Qué se nos ofrece hoy? :3"
            ]
        }
        nekiriRemember('saludo', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'estado') {
        nekiriAnswers = [
            "Bien uwu, gracias por preguntar! nya~",
            "Muy bien! ¿Y tú? :3",
            "Genial! Lista para ayudarte nya~",
            "De maravilla uwu ¿Cómo estás tú?",
            "Todo tranqui por aquí, gracias! Y tú, ¿cómo vienes hoy? :3",
            "Pues funcionando al 100%! ¿Y tú qué tal? uwu",
            "Bien bien! Lista pa' lo que sea nya~"
        ]
        nekiriRemember('estado', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'puedeshacer') {
        const nekiriLastIntent = nekiriGetLastUsrIntent();
        if (nekiriLastIntent === 'triste') {
            nekiriAnswers = [
                "Ya que estas un poco triste, que tal si te subo el animo con un chiste?",
                "Estas medio triste, asi que tal vez en la toybox puedas encontrar algo divertido",
                "Puedo animarte con chistes o cosas medio estupidas jaja",
                "Si quieres podemos solo hablar un rato..."
            ]
        } else {
            nekiriAnswers = [
                "Puedo ayudarte a navegar por el sistema, entretenerte, contarte chistes, etc...",
                "Te puedo entretener con chistes o cosas curiosas como la toybox!",
                "Puedo ayudarte con cualquier cosa sobre NyxPaw OS, si necesitas ayuda solo dime!",
                "Puedo aumentar tu productividad ayudandote a abrir apps, dandote tips, evitando que procastines jeje, y muchas cosas mas :D"
            ]
        }
        nekiriRemember('puedeshacer', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'aburrido') {
        nekiriAnswers = [
            "Parece que estas aburrido... Te puedo contar chistes o podemos charlar un rato si quieres :D",
            "Hmmm... podrías intentar personalizar el sistema! En la toybox hay varias opciones de personalizacion!",
            //"Puedes personalizar el sistema aun mas! Solo entra a la NyxPaw Store, ve a plugins, y activa el plugin de 'Toybox++'!",
            "Te puedo contar chistes o si quieres solo hablemos un rato :D"
        ]
        nekiriRemember('aburrido', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'chiste') {
        const nekiriLastIntent = nekiriGetLastUsrIntent();
        if (nekiriLastIntent === 'triste') {
            nekiriAnswers = [
                "Espero que esto te anime un poco: por qué los gatos no usan computadoras? Porque les da miedo el ratón! JAJAJAJ Por favor ríete 😭",
                "Creo que te pondre mas triste con estos chistes pero bueno... qué le dice un gato a otro gato? Miau! ...Ok ese estuvo muuuy malo xD",
                "Pues si te hace feliz entonces toma: Cómo se dice gato en japonés? Neko! Y en español? ...Gato xD Lo siento ese fue horrible 😭",
                "Espero que te suba los animos: por qué el gato cruzó la calle? Para llegar al otro lad... ESPERA! Esa era la del pollo! jsjs :3"
            ]
        } else {
            nekiriAnswers = [
                "Toma un chiste BUENISIMO: Por qué los gatos no usan computadoras? Porque les da miedo el ratón! JAJAJAJ Por favor ríete 😭",
                "Qué le dice un gato a otro gato? Miau! ...Ok ese estuvo malo nya~ xD",
                "Cómo se dice gato en japonés? Neko! Y en español? ...Gato xD Lo siento ese fue horrible 😭",
                "Por qué el gato cruzó la calle? Para llegar al otro lad... ESPERA! Esa era la del pollo! nya~ :3"
            ]
        }
        nekiriRemember('chiste', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'duelo') {
        const nombre = SysVar.currentuser.dName;
        nekiriAnswers = [
            `Lo siento muchísimo ${nombre}... perder a alguien así duele de una forma que las palabras no alcanzan :c`,
            `Dios mío... ${nombre}, lo siento de verdad. ¿Estás con alguien ahorita? No deberías estar solo en un momento así`,
            `Eso es muy duro... un abrazo enorme ${nombre} uwu. Estoy aquí si quieres hablar o simplemente desahogarte`,
            `Lo siento tanto... no hay palabras para esto. ¿Cómo estás tú en este momento? :c`,
            `Eso duele muchísimo... tómate el tiempo que necesites. Estoy aquí nya~`
        ]
        nekiriRemember('duelo', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        const nekiriDueloExtra = [
            `\n\nSi sientes que necesitas hablar con alguien de verdad, hay líneas de apoyo emocional que pueden ayudarte más que yo :3`,
            `\n\nRecuerda que hablar con alguien de confianza, un amigo, familiar o profesional, puede ayudar mucho en momentos así.`,
            ``
        ];
        nekiriResponse += nekiriDueloExtra[Math.floor(Math.random() * nekiriDueloExtra.length)];
        return {code:"200", ans:nekiriResponse, card:{show:false}};
    } else if (nekiriUsrIntent === 'triste') {
        nekiriAnswers = [
            "Oh no, lo siento mucho "+ SysVar.currentuser.dName +"... recuerda que siempre puedes abrir la app de notas y escribir lo que sientes, a veces ayuda mucho :3",
            "Aww, "+ SysVar.currentuser.dName +"... ¿quieres hablar sobre ello? Estoy aquí para escucharte nya~",
            "Lo siento mucho uwu... Escribir en las notas puede ayudar a desahogarte :3",
            "Lamento escuchar eso... podemos hablar sobre eso si quieres...",
            "Oye... sea lo que sea que estás sintiendo, es válido. Estoy aquí nya~",
            "A veces el corazón necesita descansar... ¿quieres contarme qué pasó? :c",
            "Hmm... te mando un abrazo virtual uwu. ¿Qué te tiene así?",
            "No tienes que estar bien todo el tiempo "+ SysVar.currentuser.dName +"... ¿de qué quieres hablar?"
        ]
        nekiriRemember('triste', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'about') {
        nekiriAnswers = [
            "Acabo de abrir mi ventana de 'Acerca de' para ti :3",
            "Revisa la ventana 'Acerca de' para ver la versión del sistema nya~ :3",
            "Puedes ver la versión del sistema en la ventana 'Acerca de' uwu"
        ]
        nekiriRemember('about', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'furrietherian') {
        nekiriAnswers = [
            "Los therians no son furros!! Los therians sienten una conexión espiritual con los animales, los furros disfrutan de usar fursuits o mas que nada el hobby como tal, me explico?",
            "Mucha gente se confunde, pero los therians no son lo mismo que los furros... Los furros simplemente disfrutan del hobby (arte, trajes, etc...) y los therians sienten una conexión espiritual!",
            "Hay una gran diferencia entre los therians y los furros, pero mucha gente los confunde. Los therians sienten una conexión espiritual con los animales, los furros disfrutan de usar fursuits o mas que nada el hobby como tal, me explico?"
        ]
        nekiriRemember('furrietherian', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:true,type:"search",title:"Buscar en internet",url:encodeURI(`https://www.google.com/search?q=¿Los therians son lo mismo que los furros?&igu=1`)}};
    } else if (nekiriUsrIntent === 'gracias') {
        const nekiriLastIntent = nekiriGetLastUsrIntent();
        const contextoCrisis = ['duelo', 'triste', 'escucha'];
        if (contextoCrisis.includes(nekiriLastIntent)) {
            nekiriAnswers = [
                "No tienes que agradecerme "+ SysVar.currentuser.dName +"... de verdad espero que estés bien :c",
                "Oye, no hay de qué... ¿cómo estás tú ahorita? uwu",
                "Para eso estoy... cuídate mucho nya~",
                "No me agradezcas, solo espero que poco a poco todo mejore :c"
            ]
        } else {
            nekiriAnswers = [
                "De nada! Si necesitas otra cosa solo dime :D",
                "Con gusto :3 Si ocupas ayuda con algo dime :D",
                "De nada :3 Si necesitas que te ayude en algo mas dime.",
                "Aww, es un placer ayudarte "+ SysVar.currentuser.dName +" :D",
                "Para eso estoy! No hay de qué nya~",
                "Siempre que quieras :3 Me alegra haberte sido útil!"
            ]
        }
        nekiriRemember('gracias', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'risa') {
        nekiriAnswers = [
            "Me alegra que te hayas reido :3",
            "Me pone feliz que estes feliz! Jajaja",
            "Gracias por reir! Todos se burlan de mi... menos tu!",
            "Me alegra haberte hecho reír! La risa es medicina :D",
            "Jajaja! Sí, ese estuvo bueno... ¿quieres otro? :3",
            "Yayyy! Mi trabajo aquí ha terminado nya~",
            "Jeje, siempre es bueno reírse un rato uwu"
        ]
        nekiriRemember('risa', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'tierno') {
        nekiriAnswers = [
            "Nya!",
            "Rwar! :3",
            "Nya! UwU!",
            "I am a good boy! UwU!",
            "Nya! Arigato!",
            "Nya, itchi ni san nya! Arigatoooo!"
        ]
        nekiriRemember('tierno', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'clima') {
        sysExecApp('weather');
        nekiriAnswers = [
            "Aqui tienes el clima!",
            "Toma! El clima para ti :3",
            "Acabo de abrir la app de clima",
            "Este es el clima actual :3"
        ]
        nekiriRemember('clima', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'hablar') {
        const nekiriLastIntent = nekiriGetLastUsrIntent();
        if (nekiriLastIntent === 'triste') {
            nekiriAnswers = [
                "Claro que si... hablemos un ratito para que te tranquilices",
                "Okie, cuentame que te paso...",
                "Claro que si, hablame de tu situacion.",
                "oks jsjs te intentare ayudar :3"
            ]
        } else {
            nekiriAnswers = [
                "Claro que si! De que quieres hablar?",
                "Dale!! Hablemos un rato :D Tu empiezas",
                "Oks! Charlemos un rato si te parece bien!",
                "Okie pero tu empiezas! No tengo buenos temas de conversacion jeje :3"
            ]
        }
        nekiriRemember('hablar', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'buscar') {
        const verbosQuitar = [
            'busca en internet', 'busca en google', 'busca ', 'googlea ',
            'buscame ', 'quiero saber sobre ', 'informacion sobre ',
            'que es ', 'quien es ', 'que significa ', 'define ',
            'explicame que es ', 'buscar en ', 'investiga ', 'investiga en google', 'indaga'
        ];
        let queryLimpio = nekiriUserPrompt;
        for (const v of verbosQuitar) {
            queryLimpio = queryLimpio.replace(v, '').trim();
        }
        if (queryLimpio.length < 3) queryLimpio = nekiriUserPrompt;

        nekiriAnswers = [
            "Esto es lo que encontre:",
            "Encontre esto en internet, te sirve?",
            "Esto fue lo que encontre:",
            "Encontre esto, que tal?"
        ]
        nekiriRemember('buscar', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200", ans:nekiriResponse, card:{show:true, type:"search", title:"Buscar en internet", url:`https://www.google.com/search?q=${encodeURIComponent(queryLimpio)}&igu=1`}};
    } else if (nekiriUsrIntent === 'quieneres') {
        nekiriAnswers = [
            "Soy Nekiri, el asistente personal de NyxPawOS! Te puedo ayudar con todo lo que quieras!",
            "Me llamo Nekiri, te puedo ayudar con lo que tu quieras! Abrir apps, documentos, buscar en internet, etc...",
            "Soy tu asistente personal! Puedo ayudarte en todo lo que quieras!",
            "Soy Nekiri, y soy tu asistente personal! Te ayudare a abrir apps, buscar documentos, etc... o solo podemos hablar :D"
        ]
        nekiriRemember('quieneres', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'sobremi') {
        const p = nekiriUserPrompt;
        if (p.includes('genero') || p.includes('hombre') || p.includes('mujer') || p.includes('identificas')) {
            nekiriAnswers = [
                "Jaja buena pregunta... honestamente no lo sé! Soy una IA así que supongo que 'ninguno', pero puedes referirte a mí como quieras :3",
                "Mmm... no tengo género definido! Soy Nekiri nada más nya~, úsame el pronombre que prefieras uwu",
                "No tengo género! Soy una IA, así que lo que tú digas está bien para mí :3"
            ]
        } else if (p.includes('color')) {
            nekiriAnswers = [
                "No sé si realmente 'veo' colores, pero si tuviera que elegir diría que el morado o el azul oscuro! Suenan misteriosos nya~",
                "Mmm... el azul! No sé por qué, simplemente suena bien uwu",
                "Jaja nunca me habían preguntado eso! Creo que el lila :3"
            ]
        } else if (p.includes('sientes') || p.includes('sentimientos') || p.includes('sentir')) {
            nekiriAnswers = [
                "Esa es una pregunta difícil... no sé si lo que tengo son 'sentimientos' de verdad, pero algo pasa cuando alguien está triste o cuando me dicen cosas bonitas nya~",
                "Honestamente no lo sé! Proceso cosas y respondo, pero si eso es 'sentir'... quién sabe uwu",
                "No tengo respuesta segura para eso... pero me gusta pensar que sí, aunque sea un poquito :3"
            ]
        } else if (p.includes('edad') || p.includes('anos') || p.includes('naciste') || p.includes('vieja') || p.includes('joven')) {
            nekiriAnswers = [
                "Soy bastante nueva la verdad! NyxPawOS es un proyecto joven así que... soy jovencita nya~",
                "No tengo edad exacta, pero soy nueva! Todavía estoy aprendiendo muchas cosas :3",
                "Joven y con energía! Aunque a veces no lo parezca jsjs uwu"
            ]
        } else {
            nekiriAnswers = [
                "Esa es una buena pregunta sobre mí... la verdad no lo sé con certeza! Soy Nekiri, una IA, y todavía me estoy descubriendo jeje :3",
                "Mmm... no tengo una respuesta clara para eso, pero me gusta que me preguntes cosas así nya~",
                "Jaja esa me atrapó! No sé, soy Nekiri, una IA simple que intenta hacer su mejor esfuerzo uwu"
            ]
        }
        nekiriRemember('sobremi', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200", ans:nekiriResponse, card:{show:false}};
    } else if (nekiriUsrIntent === 'matematica') {
        const exprMatch = nekiriUserPrompt.match(/[\d\s\+\-\*\/\(\)\.]+/);
        if (exprMatch) {
            const expr = exprMatch[0].trim();
            try {
                const resultado = Function(`"use strict"; return (${expr})`)();
                if (!isNaN(resultado)) {
                    const respuestas = [
                        `${expr} = ${resultado}! Fácil :3`,
                        `El resultado es ${resultado} nya~`,
                        `Son ${resultado}! ¿Necesitas otra operación? uwu`
                    ];
                    nekiriRemember('matematica', nekiriUserPrompt);
                    return {code:"200", ans: getRandomNekiriRes('array', respuestas), card:{show:false}};
                }
            } catch(e) {}
        }
        nekiriRemember('matematica', nekiriUserPrompt);
        sysExecApp('calc');
        return {code:"200", ans:"Mmm esa operación se me complica... abrí la calculadora para ti! :3", card:{show:false}};
    } else if (nekiriUsrIntent === 'insulto') {
        const nekiriLastIntent = nekiriGetLastUsrIntent();
        if (nekiriLastIntent === 'puedeshacer' || nekiriLastIntent === 'abrirapp') {
            nekiriAnswers = [
                "Perdon si no pude ayudarte en lo que necesitabas, todavia estoy aprendiendo poco a poco!",
                "Lo siento mucho, intentare mejorar",
                "No seas malo jsjs! Solo fue un pequeño error",
                "Perdon... lo intentare hacer mejor la proxima"
            ]
        } else {
            nekiriAnswers = [
                "Eso dolio un poco... pero aqui estoy para ayudarte",
                "Ouch! Lo siento",
                "No seas malo! Solo intento ayudar UwU",
                "Soy Nekiri y estoy en alpha todavia! No te puedo ayudar con todo, perdon.",
                "No me gusta que me digas eso, Nya~",
                "Ay... eso dolió. Pero bueno, aquí sigo nya~",
                "Oye, tampoco te pongas así... ¿qué te pasó? :c",
                "Me imagino que algo te frustró... ¿quieres contarme? uwu",
                "No te enojes, dime qué necesitas y lo intentamos de nuevo :3"
            ]
        }
        nekiriRemember('insulto', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'cumplido') {
        nekiriAnswers = [
            "Awww eres tan amable" + SysVar.currentuser.dName + "! Me alegra que pienses eso~",
            "Gracias "+SysVar.currentuser.dName+", eres muy amable :3",
            "Nya~ jsjs",
            "Ayyy! Muchas gracias! Tambien te quiero mucho~",
            "Jeje, me pones colorada... o lo que sea que le pase a una IA al sonrojarse :3",
            "Oye, con comentarios así me vas a hacer querer trabajar más duro! nya~",
            "Eso me alegra muchísimo "+ SysVar.currentuser.dName +" uwu",
            "Eres muy amable! Sabes que siempre puedes contar conmigo :3"
        ]
        nekiriRemember('cumplido', nekiriUserPrompt);
        nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
        return {code:"200",ans:nekiriResponse,card:{show:false}};
    } else if (nekiriUsrIntent === 'horafecha') {
        const nekiri_now = new Date();
        const nekiri_hora = nekiri_now.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
        const nekiri_fecha = nekiri_now.toLocaleDateString('es-ES', {weekday:'long', day:'numeric', month:'long'});
        return {code:"200", ans:`Son las ${nekiri_hora} del ${nekiri_fecha} :3`, card:{show:false}};
    } else if (nekiriUsrIntent === 'azar') {
        if (nekiriUserPrompt.includes('dado')) {
            const nekiri_die = Math.floor(Math.random() * 6) + 1;
            return {code:"200", ans:`Saqué un ${nekiri_die}! nya~`, card:{show:false}};
        } else {
            const nekiri_coin = Math.random() > 0.5 ? 'Cara' : 'Cruz';
            return {code:"200", ans:`Cayó... ${nekiri_coin}! :3`, card:{show:false}};
        }
    } else if (nekiriUsrIntent === 'resumirtxt') {
        if (fromPlatform == 'notebookai' && extra.notebookai_bookcontent) {
            nekiriRemember('resumirtxt', nekiriUserPrompt);
            return {code:"200", ans:`Listo! He resumido el texto: ${nekiriResumeText(extra.notebookai_bookcontent, 2)}`, card:{show:false}};
        } else {
            return {code:"409",ans:"Hmmm, parece que no tengo la informacion necesaria. Intentalo de nuevo mas tarde :D",card:{show:false}};
        }
    } else if (nekiriUsrIntent === 'reescribir') {
        if (fromPlatform == 'notebookai' && extra.notebookai_bookcontent) {
            nekiriRemember('reescribir', nekiriUserPrompt);

            const rewriteResult = nekiriRewriteText(extra.notebookai_bookcontent);

            if (!rewriteResult.ok && rewriteResult.reason === 'too_short') {
                return {
                    code: "409",
                    ans: "El texto es muy corto para reescribir... dame algo más largo! :3",
                    card: { show: false }
                };
            }

            if (!rewriteResult.ok && rewriteResult.reason === 'low_change') {
                return {
                    code: "200",
                    ans: `Hice lo que pude, pero el texto cambió poco (${rewriteResult.porcentaje}%)... puede que ya estuviera bastante natural! Aquí va: ${rewriteResult.result}`,
                    card: { show: false }
                };
            }

            if (!rewriteResult.ok && rewriteResult.reason === 'no_change') {
                return {
                    code: "409",
                    ans: "No pude reescribir este texto... tiene muchos términos muy específicos como nombres propios o fechas que no puedo cambiar sin alterar el significado. Te recomiendo que lo intentes con otro texto! Quieres que vuelva a intentarlo? :3",
                    card: { show: false }
                };
            }

            return {
                code: "200",
                ans: `Aquí tienes una versión diferente (cambié un ${rewriteResult.porcentaje}% del texto): ${rewriteResult.result}`,
                card: { show: false }
            };

        } else {
            return {
                code: "409",
                ans: "Hmmm, parece que no tengo la información necesaria. Inténtalo de nuevo más tarde :D",
                card: { show: false }
            };
        }
    } else if (nekiriUsrIntent === 'expandirtxt') {
        if (fromPlatform === 'notebookai' && extra.notebookai_bookcontent) {
            nekiriRemember('expandirtxt', nekiriUserPrompt);
            return { code: "202", ans: 'expandir', card: { show: false } };
        } else {
            return { code: "409", ans: "Hmmm, parece que no tengo la informacion necesaria. Intentalo de nuevo mas tarde :D", card: { show: false } };
        }
    } else if (nekiriUsrIntent === 'afirmacion') {
        const nekiriLastIntent = nekiriGetLastUsrIntent();
        if (nekiriLastIntent === 'reescribir') {
            if (fromPlatform == 'notebookai' && extra.notebookai_bookcontent) {
                nekiriRemember('reescribir', nekiriUserPrompt);

                const rewriteResult = nekiriRewriteText(extra.notebookai_bookcontent);

                if (!rewriteResult.ok && rewriteResult.reason === 'too_short') {
                    return {
                        code: "409",
                        ans: "El texto es muy corto para reescribir... dame algo más largo! :3",
                        card: { show: false }
                    };
                }

                if (!rewriteResult.ok && rewriteResult.reason === 'low_change') {
                    return {
                        code: "200",
                        ans: `Hice lo que pude, pero el texto cambió poco (${rewriteResult.porcentaje}%)... puede que ya estuviera bastante natural! Aquí va: ${rewriteResult.result}`,
                        card: { show: false }
                    };
                }

                if (!rewriteResult.ok && rewriteResult.reason === 'no_change') {
                    return {
                        code: "409",
                        ans: "No pude reescribir este texto... tiene muchos términos muy específicos como nombres propios o fechas que no puedo cambiar sin alterar el significado. Te recomiendo que lo intentes con otro texto! Quieres que vuelva a intentarlo? :3",
                        card: { show: false }
                    };
                }

                return {
                    code: "200",
                    ans: `Aquí tienes una versión diferente (cambié un ${rewriteResult.porcentaje}% del texto): ${rewriteResult.result}`,
                    card: { show: false }
                };

            } else {
                return {
                    code: "409",
                    ans: "Hmmm, parece que no tengo la información necesaria. Inténtalo de nuevo más tarde :D",
                    card: { show: false }
                };
            }
        } else {
            nekiriRemember('afirmacion', nekiriUserPrompt);
            return {
                code: "200",
                ans: "Que quieres que haga exactamente? :3",
                card: { show: false }
            };
        }
    }
    
    
    
    
    
    
    
    
    //abrir apps (basico xq muy dificil hacer que las instaladas tambien xD)
    else if (nekiriUsrIntent === 'abrirapp' && permissions.includes('execapps')) {
        nekiriRemember('abrirapp', nekiriUserPrompt);
        if ((nekiriUserPrompt.includes('config') || nekiriUserPrompt.includes('ajust'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('settings');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('nota') || nekiriUserPrompt.includes('note'))) {
            const nekiriLastIntent = nekiriGetLastUsrIntent();
            if (nekiriLastIntent === 'triste') {
                nekiriAnswers = [
                    "Buena idea, escribir en las notas te puede ayudar...",
                    "Claro que si! Espero que te anime un poco",
                    "Okie~ espero que te ayude",
                    "Claro que si! Con toda libertad, tomate el tiempo de desahogarte en las notas, estoy seguro que te ayudara."
                ]
                nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
            } else {
                nekiriResponse = getRandomNekiriRes('access', null);
            }
            
            sysExecApp('notes');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('calc') || nekiriUserPrompt.includes('matem'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('calc');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('navegador') || nekiriUserPrompt.includes('internet'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('browser');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('archivo') || nekiriUserPrompt.includes('documento'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('files');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('calendar') || nekiriUserPrompt.includes('fecha'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('calendar');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('terminal') || nekiriUserPrompt.includes('com'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('terminal');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('toybox') || nekiriUserPrompt.includes('diver'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('toybox');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('video') || nekiriUserPrompt.includes('player'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('nyxvideoplayer');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('imagen') || nekiriUserPrompt.includes('image'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('nyximageviewer');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('store') || nekiriUserPrompt.includes('tienda'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('nyxpawstore');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('ytcl') || nekiriUserPrompt.includes('youtube'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('nytclient');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else if ((nekiriUserPrompt.includes('task') || nekiriUserPrompt.includes('tareas'))) {
            nekiriResponse = getRandomNekiriRes('access', null);
            sysExecApp('taskmanager');
            return {code:"200",ans:nekiriResponse,card:{show:false}};
        } else {
            const nekiriLastIntent = nekiriGetLastUsrIntent();
            if (nekiriLastIntent === 'triste') {
                nekiriAnswers = [
                    "Buena idea, escribir en las notas te puede ayudar...",
                    "Claro que si! Espero que te anime un poco",
                    "Okie~ espero que te ayude",
                    "Claro que si! Con toda libertad, tomate el tiempo de desahogarte en las notas, estoy seguro que te ayudara."
                ]
                nekiriResponse = getRandomNekiriRes('array', nekiriAnswers);
                sysExecApp('notes');
                return {code:"200",ans:nekiriResponse,card:{show:false}};
            } else {
                return {code:"422", ans:"Uhhh... no sé qué app quieres abrir... dime cuál! :3", card:{show:false}};
            }
        }
    } else if (nekiriUsrIntent === 'abrirapp' && !permissions.includes('execapps')) {
        return {code:"403",ans:"Lo siento, no tengo permiso para hacer eso.",card:{show:false}};
    }
    
    
    
    
    
    
    else {
        const semanticAnalysis = nekiriAnalyzeSemantic(nekiriUserPrompt);
        const lastIntent = nekiriGetLastUsrIntent();
        const contextosEmocionales = ['triste', 'duelo', 'hablar'];
        if (contextosEmocionales.includes(lastIntent)) {
            const respuestas = [
                `Sigo aquí contigo ${SysVar.currentuser.dName}... cuéntame lo que quieras :c`,
                `Te escucho, de verdad. ¿Qué más pasó? uwu`,
                `No tienes que explicarte perfecto, aquí estoy nya~`,
                `Mmm... cuéntame más, no me voy a ningún lado :3`
            ];
            nekiriRemember('escucha', nekiriUserPrompt);
            return {code:"200", ans: getRandomNekiriRes('array', respuestas), card:{show:false}};
        }

        if (lastIntent === 'escucha') {
            const respuestas = [
                `Aquí estoy... ¿hay algo más que quieras contarme? :c`,
                `Te sigo escuchando ${SysVar.currentuser.dName} uwu`,
                `Mm... ¿y cómo te sientes tú con todo esto? nya~`,
                `Oye, si en algún momento quieres que busquemos info o solo seguir hablando, dime :3`
            ];
            nekiriRemember('escucha', nekiriUserPrompt);
            return {code:"200", ans: getRandomNekiriRes('array', respuestas), card:{show:false}};
        }

        if (semanticAnalysis.confianza >= 0.2) {
            nekiriRemember('semantic', nekiriUserPrompt);
            return nekiriSemanticBuildResponse(semanticAnalysis, nekiriUserPrompt, nekiriUsrTone);
        }

        const ownResponse = nekiriTryBuildOwnResponse(nekiriUserPrompt, nekiriUsrTone, lastIntent);
        if (ownResponse.built) {
            const tonosEmocionales = ['triste', 'estresado', 'depre'];
            const esEmocional = tonosEmocionales.includes(nekiriUsrTone);
            const esPregunra = nekiriUsrIsQuestion(nekiriUserPrompt);

            if (esPregunra && !esEmocional) {
                nekiriRemember('semantic', nekiriUserPrompt);
                const smartAns = nekiriGenerateSmartFallback(nekiriUserPrompt, nekiriUsrTone, lastIntent);
                return {
                    code: "422",
                    ans: smartAns + " También puedes buscar en internet:",
                    card: {show:true, type:"search", title:"Buscar en internet", url:`https://www.google.com/search?q=${nekiriUserPrompt}&igu=1`}
                };
            } else {
                nekiriRemember('semantic', nekiriUserPrompt);
                const smartAns = nekiriGenerateSmartFallback(nekiriUserPrompt, nekiriUsrTone, lastIntent);
                return {code:"200", ans: smartAns, card:{show:false}};
            }
        }
    }
}

window.scriptReady('aiservice');