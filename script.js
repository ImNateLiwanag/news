const cityInput = document.querySelector('.city-input');
const welcomeSearchBtn = document.querySelector('.welcome-search-btn');
const searchBtn = document.querySelector('.search-btn');
const countryInput = document.querySelector('.country-input');

const sideBar = document.querySelector('.sidebar');
const weatherWelcome = document.querySelector('.weather-welcome');
const weatherInput = document.querySelector('.weather-input');
const weatherText = document.querySelector('.weather-text');

const tipsSection = document.getElementById('tips');
const newsSection = document.getElementById('news');

const errorMsg = document.querySelector('.error-msg');
const weatherError = document.querySelector('.weather-error-msg');

const cityTxt = document.querySelector('.city-txt');
const weatherDay = document.querySelector('.weather-day');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityTxt = document.querySelector('.humidity-value-txt');
const windTxt = document.querySelector('.wind-value-txt');
const weatherImg = document.querySelector('.weather-summary-img');
const weatherQuoteTxt = document.querySelector('.weather-quote-txt');
const futureWeather = document.querySelector('.future-weather');
const todayTxt = document.querySelector('.today-txt');

const tipsTemp = document.querySelector('.tips-temp');
const tipsCondition = document.querySelector('.tips-condition');
const lottieWeather = document.querySelector('.about-weather-icon');

const dangerTitle = document.querySelector('.danger-title');
const dangerDescription = document.querySelector('.danger-description');

const tipsMainTitle = document.querySelector('.tips-main-title');
const tipsList = document.querySelector('.tips-list');
const mapMenuBtn = document.getElementById("mapMenuBtn");
const shelterMenu = document.getElementById("shelterMenu");


mapMenuBtn.addEventListener("click", () => {
    shelterMenu.classList.toggle("show");
});

let currentActiveTab = 'current';

const apiKey = '5fd9094f4742b02276d974ee0f156d43';

const newsDataKey =
'pub_df285ec6a85c42d4a489460e4c019f87';

let shelterData = {};

const PROVINCE_COORDINATES = {
    'zamboanga del norte': { lat: 8.1500, lng: 123.0000 },
    'zamboanga del sur': { lat: 7.7000, lng: 122.8000 },
    'zamboanga sibugay': { lat: 7.6333, lng: 122.6500 },
    'misamis occidental': { lat: 8.3333, lng: 123.7500 },
    'misamis oriental': { lat: 8.7500, lng: 124.8333 },
    'bukidnon': { lat: 8.0333, lng: 125.0000 },
    'lanao del norte': { lat: 7.9167, lng: 124.0000 },
    'lanao del sur': { lat: 7.8333, lng: 124.3333 },
    'sultan kudarat': { lat: 6.6342, lng: 124.6053 },
    'sarangani': { lat: 6.1031, lng: 125.2847 }
};

async function loadShelterData(){

    try{

        const response =
        await fetch(
            'assets/shelters/shelters.json'
        );

        shelterData =
        await response.json();

        console.log(
            'Shelter data loaded'
        );

    }catch(error){

        console.log(
            'Shelter JSON failed to load',
            error
        );
    }
}

function buildShelterMenu() {

    const luzonList =
    document.getElementById('luzon-list');

    const visayasList =
    document.getElementById('visayas-list');

    const mindanaoList =
    document.getElementById('mindanao-list');

    if (!luzonList || !visayasList || !mindanaoList)
        return;

    luzonList.innerHTML = '';
    visayasList.innerHTML = '';
    mindanaoList.innerHTML = '';

    const regions = {
        luzon: luzonList,
        visayas: visayasList,
        mindanao: mindanaoList
    };

    Object.keys(regions).forEach(region => {

        if (!shelterData[region]) return;

        // GET UNIQUE CITIES
        const cities = [
            ...new Set(
                shelterData[region]
                .map(shelter => shelter.city)
                .filter(Boolean)
            )
        ];

        // SORT ALPHABETICALLY
        cities.sort((a, b) =>
            a.localeCompare(b)
        );

        cities.forEach(city => {

            const cityBtn =
            document.createElement('div');

            cityBtn.className =
            'shelter-city';

            cityBtn.textContent =
            city;

            cityBtn.addEventListener('click', () => {
                const normalizedCity = normalizeLocationName(city);

                countryInput.value = normalizedCity;
            cityInput.value = normalizedCity;

    

    const cityFallbacks = {
    'masbate city': 'Masbate',
    'masbate': 'Masbate',
    'sorsogon': 'Sorsogon',
    'cebu': 'Cebu',
    'iloilo': 'Iloilo',
    'davao': 'Davao',
    'cotabato': 'Cotabato',
    'isabela': 'Isabela City'
};

        const normalized =
        city.toLowerCase().trim();

        const finalCity =
        cityFallbacks[normalized] || city;

        countryInput.value = finalCity;

        updateWeatherInfo(finalCity);
    }
);

            regions[region]
            .appendChild(cityBtn);
        });
    });

    // ACCORDION TOGGLES
    document
    .querySelectorAll('.region-toggle')
    .forEach(button => {

        button.addEventListener(
            'click',
            () => {

                const list =
                button.nextElementSibling;

                list.classList.toggle(
                    'active'
                );
            }
        );
    });
}


function detectRegion(city) {
    const cleanCity = city.toLowerCase().trim();

    // 1. Hard Boundaries & Priority Exclusions (Stops Cross-island Jumping)
    if (
        cleanCity.includes('basilan') || 
        cleanCity.includes('isabela city') || 
        cleanCity.includes('cagayan de oro') || 
        cleanCity.includes('cayan de oro') ||
        cleanCity.includes('cdo') || 
        cleanCity.includes('davao') || 
        cleanCity.includes('cotabato') || 
        cleanCity.includes('zamboanga') || 
        cleanCity.includes('butuan') || 
        cleanCity.includes('gensan') || 
        cleanCity.includes('general santos') || 
        cleanCity.includes('iligan')
    ) {
        return 'mindanao';
    }

    if (
        cleanCity.includes('cebu') || 
        cleanCity.includes('negros') || 
        cleanCity.includes('antique') || 
        cleanCity.includes('roxas city') || 
        cleanCity.includes('capiz') || 
        cleanCity.includes('iloilo') || 
        cleanCity.includes('bacolod') || 
        cleanCity.includes('samar') || 
        cleanCity.includes('leyte') || 
        cleanCity.includes('tacloban') || 
        cleanCity.includes('bohol') || 
        cleanCity.includes('siquijor') || 
        cleanCity.includes('guimaras')
    ) {
        return 'visayas';
    }

    if (
        cleanCity.includes('manila') || 
        cleanCity.includes('quezon') || 
        cleanCity.includes('pangasinan') || 
        cleanCity.includes('nueva ecija') || 
        cleanCity.includes('batangas') || 
        cleanCity.includes('pampanga') || 
        cleanCity.includes('bulacan') || 
        cleanCity.includes('cavite') || 
        cleanCity.includes('laguna') || 
        cleanCity.includes('naga city') || 
        cleanCity.includes('masbate') || 
        cleanCity.includes('sorsogon') || 
        cleanCity.includes('tuguegarao') || 
        cleanCity.includes('ilagan') || 
        cleanCity.includes('batanes')
    ) {
        return 'luzon';
    }

    // 2. Structural Keyword Fallbacks
    const luzonKeywords = ['luzon', 'ilocos', 'cagayan', 'isabela', 'tarlac', 'zambales', 'bataan', 'rizal', 'aurora', 'quirino', 'benguet', 'baguio', 'albay', 'camarines', 'catanduanes', 'marinduque', 'romblon', 'mindoro'];
    const visayasKeywords = ['visayas', 'aklan', 'boracay', 'ormoc', 'biliran', 'catbalogan'];
    const mindanaoKeywords = ['mindanao', 'misamis', 'bukidnon', 'lanao', 'sultan kudarat', 'sarangani', 'agusan', 'surigao', 'dinagat', 'sulu', 'tawi', 'marawi',];

    if (luzonKeywords.some(kw => cleanCity.includes(kw))) return 'luzon';
    if (visayasKeywords.some(kw => cleanCity.includes(kw))) return 'visayas';
    if (mindanaoKeywords.some(kw => cleanCity.includes(kw))) return 'mindanao';

    return null; 
}

let map = null;
let shelterMarkers = [];
let mapInitialized = false;

function normalizeLocationName(input) {
    if (!input) return "";
    let clean = input.toLowerCase().trim()
        .replace(/\s+/g, ' ') // Collapse extra whitespace
        .replace(/,/g, '');   // Drop commas for clean checking

    // Direct Exact-Match Mapping Enforcements
    if (clean === 'roxas' || clean === 'roxas city' || clean === 'roxas capiz') {
        return 'Roxas City';
    }
    if (clean === 'masbate' || clean === 'masbate city') {
        return 'Masbate';
    }
    if (clean === 'isabela city' || clean.includes('isabela city basilan')) {
        return 'Isabela City'; // OpenWeather API matches 'Isabela City' directly
    }
    if (clean.includes('cayan de oro') || clean.includes('cagayan de oro') || clean === 'cdo') {
        return 'Cagayan de Oro';
    }

    // Advanced Multi-Region Disambiguation
    // 1. Naga Collision
    if (clean.includes('naga')) {
        if (clean.includes('visayas') || clean.includes('cebu')) {
            return 'Naga, Cebu';
        }
        return 'Naga City'; // Defaults to Camarines Sur (Luzon)
    }

    // 2. San Carlos Collision
    if (clean.includes('san carlos')) {
        if (clean.includes('visayas') || clean.includes('negros') || clean.includes('occidental')) {
            return 'San Carlos City'; 
        }
        return 'San Carlos'; // Defaults to Pangasinan (Luzon)
    }

    // 3. San Jose Multi-Island Collision
    if (clean.includes('san jose')) {

    // NUEVA ECIJA
    if (
        clean.includes('nueva ecija') ||
        clean.includes('luzon')
    ) {
        return 'San Jose City';
    }

    // OCCIDENTAL MINDORO
    if (
        clean.includes('mindoro')
    ) {
        return 'San Jose';
    }

    // ANTIQUE
    if (
        clean.includes('antique') ||
        clean.includes('visayas')
    ) {
        return 'San Jose de Buenavista';
    }

    // DINAGAT
    if (
        clean.includes('dinagat') ||
        clean.includes('mindanao')
    ) {
        return 'San Jose';
    }

    // DEFAULT
    return 'San Jose City';
}

    // 4. Santo Tomas / Sto. Tomas Collision
    if (
    clean.includes('santo tomas') ||
    clean.includes('sto tomas') ||
    clean.includes('sto. tomas')
) {

    // BATANGAS
    if (
        clean.includes('batangas') ||
        clean.includes('luzon')
    ) {
        return 'Santo Tomas Batangas';
    }

    // DAVAO
    if (
        clean.includes('davao') ||
        clean.includes('mindanao')
    ) {
        return 'Santo Tomas Davao';
    }

    // SAMAR
    if (
        clean.includes('samar') ||
        clean.includes('visayas')
    ) {
        return 'Santo Tomas Samar';
    }

    // DEFAULT TO BATANGAS
    return 'Santo Tomas Batangas';
}

    // Fallback title casing for unmapped parameters
    return input.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function initializeMap(){

    if(mapInitialized) return;

    const mapContainer =
    document.getElementById('map');

    if(!mapContainer) return;

map = L.map('map', {

    preferCanvas: true,
    zoomControl: true,
    scrollWheelZoom: false,

    maxBounds: [
        [4.5, 116.0],
        [21.5, 127.5]
    ],

    maxBoundsViscosity: 1.0,

    minZoom: 5,
    maxZoom: 16

}).setView(
    [12.8797, 121.7740],
    6
);

 L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:
            '&copy; OpenStreetMap contributors'
        }
    ).addTo(map);

map.fitBounds([
    [4.5, 116.0],
    [21.5, 127.5]
]);

    mapInitialized = true;

    console.log('Map initialized');
}

 const VALID_PH_LOCATIONS = [
    // NCR
    'manila',
    'quezon city',
    'makati',
    'pasig',
    'taguig',
    'pasay',
    'mandaluyong',
    'marikina',
    'parañaque',
    'las piñas',
    'muntinlupa',
    'caloocan',
    'malabon',
    'navotas',
    'valenzuela',
    'san juan',

    // Luzon Provinces
    'abra',
    'apayao',
    'aurora',
    'bataan',
    'batangas',
    'benguet',
    'bulacan',
    'cagayan',
    'camarines norte',
    'camarines sur',
    'catanduanes',
    'cavite',
    'ifugao',
    'ilocos norte',
    'ilocos sur',
    'isabela',
    'kalinga',
    'laguna',
    'la union',
    'marinduque',
    'masbate',
    'mountain province',
    'nueva ecija',
    'nueva vizcaya',
    'occidental mindoro',
    'oriental mindoro',
    'palawan',
    'pangasinan',
    'quezon province',
    'quirino',
    'rizal',
    'romblon',
    'sorsogon',
    'tarlac',
    'zambales',
    'metro manila', // Idinagdag para sa province checks ng Manila/QC/Makati

    // Luzon Cities / Municipalities
    'alaminos',
    'angeles',
    'antipolo',
    'balanga',
    'baguio',
    'basco',
    'batangas city',
    'biñan',
    'boac',
    'bontoc',
    'cabanatuan',
    'cabuyao',
    'calamba',
    'calapan',
    'cauayan',
    'daet',
    'dagupan',
    'dasmariñas',
    'gapan',
    'general trias',
    'ilagan',
    'imus',
    'iriga',
    'laoag',
    'legazpi',
    'ligao',          // DAGDAG: Mula sa shelters.json (Ligao City, Albay)
    'lipa',
    'lucena',
    'mabalacat',      // DAGDAG: Para sa dynamic dropdown keywords mo
    'malolos',
    'masbate city',   // DAGDAG: Mula sa shelters.json (Masbate City, Masbate)
    'meycauayan',
    'muñoz',          // DAGDAG: Science City of Muñoz sa keywords mo
    'naga',
    'olongapo',
    'palayan',
    'puerto princesa',
    'rosales',
    'san fernando',
    'san jose (nueva ecija)', // DAGDAG: Katugma ng eksaktong spelling sa JSON mo
    'san jose del monte',     // DAGDAG: Para sa Bulacan shelters mo
    'san pablo',
    'san pedro',
    'santa cruz',
    'santa rosa',
    'santo tomas',    // DAGDAG: Batangas keyword compatibility
    'santiago',
    'sorsogon city',
    'tabaco',
    'tabuk',
    'tagaytay',
    'tanauan',
    'tayabas',
    'trece martires',
    'tuguegarao',
    'vigan',

    // Visayas Provinces
    'aklan',
    'antique',
    'biliran',
    'bohol',
    'capiz',
    'cebu',
    'eastern samar',
    'guimaras',
    'iloilo',
    'leyte',
    'negros occidental',
    'negros oriental',
    'northern samar',
    'samar',
    'siquijor',
    'southern leyte',

    // Visayas Cities / Municipalities
    'bacolod',
    'borongan',
    'catarman',
    'catbalogan',
    'cebu city',
    'calbayog',
    'dumaguete',
    'iloilo city',
    'jordan',
    'kalibo',
    'lapu-lapu',
    'mandaue',
    'naval',
    'ormoc',
    'roxas city',
    'san jose de buenavista',
    'siquijor',
    'tagbilaran',
    'tacloban',

    // Mindanao Provinces
    'agusan del norte',
    'agusan del sur',
    'basilan',
    'bukidnon',
    'camiguin',
    'cotabato',
    'davao de oro',
    'davao del norte',
    'davao del sur',
    'davao occidental',
    'davao oriental',
    'dinagat islands',
    'lanao del norte',
    'lanao del sur',
    'maguindanao',
    'misamis occidental',
    'misamis oriental',
    'sarangani',
    'south cotabato',
    'sultan kudarat',
    'surigao del norte',
    'surigao del sur',
    'tawi-tawi',
    'zamboanga del norte',
    'zamboanga del sur',
    'zamboanga sibugay',

    // Mindanao Cities / Municipalities
    'alabel',
    'bislig',         // DAGDAG: Mula sa shelters.json (Bislig, Surigao del Sur)
    'bongao',         // DAGDAG: Mula sa shelters.json (Bongao, Tawi-Tawi)
    'butuan',
    'cabadbaran',
    'cagayan de oro',
    'cotabato city',
    'davao',
    'davao city',
    'dipolog',
    'general santos',
    'gensan',
    'iligan',
    'ipil',
    'isabela city',
    'isulan',
    'jolo',
    'kidapawan',
    'koronadal',
    'malaybalay',
    'malita',
    'marawi',
    'mati',
    'nabunturan',
    'oroquieta',
    'pagadian',
    'prosperidad',
    'surigao city',
    'tagum',
    'tandag',
    'tubod',
    'zamboanga city'
];

function clearShelterMarkers(){

    shelterMarkers.forEach(marker => {

        if(map){
            map.removeLayer(marker);
        }

    });

    shelterMarkers = [];
}

function refreshMap(){

    if(!map) return;

    setTimeout(() => {

        map.invalidateSize(true);

    }, 400);
}

async function updateShelterMap(city) {
    if (!mapInitialized) {
        initializeMap();
    }

    if (!map) return;

    clearShelterMarkers();

    let searchCity = city;
    const cleanLower = city.toLowerCase().trim();
    
    const mapRegionalMap = {
        'sulu': 'Jolo',
        'marinduque': 'Boac',
        'batanes': 'Basco',
        'palawan': 'Puerto Princesa',
        'tawi-tawi': 'Bongao',
        'tawitawi': 'Bongao',
        'romblon': 'Romblon',
        'camiguin': 'Mambajao',
        'dinagat': 'San Jose',
        'ilocos norte': 'Laoag',
        'ilocos sur': 'Vigan',
        'pangasinan': 'Lingayen',
        'zambales': 'Iba',
        'bataan': 'Balanga',
        'cagayan': 'Tuguegarao',
        'isabela': 'Ilagan',
        'camarines norte': 'Daet',
        'camarines sur': 'Pili',
        'masbate city': 'Masbate',
        'aklan': 'Kalibo',
        'panay': 'Iloilo City'
    };

    if (!cleanLower.includes('cagayan de oro') && !cleanLower.includes('cdo') && !cleanLower.includes('isabela city')) {
        for (const [province, capital] of Object.entries(mapRegionalMap)) {
            if (cleanLower.includes(province)) {
                searchCity = capital;
                break;
            }
        }
    }

    let cityLat = 12.8797;
    let cityLng = 121.7740;
    let isHardcodedProvince = false;

    // --- NEW MEASURE / PREVENTION ADDED HERE ---
    // Check if the user searched for any of our problem-case provinces
    for (const [provName, coords] of Object.entries(PROVINCE_COORDINATES)) {
        if (cleanLower.includes(provName)) {
            cityLat = coords.lat;
            cityLng = coords.lng;
            isHardcodedProvince = true;
            break;
        }
    }

    // Only hit OpenWeather if it's NOT a hardcoded fallback province
    if (!isHardcodedProvince) {
        try {
            const geoResponse = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchCity)},PH&limit=5&appid=${apiKey}`
            );

            const geoData = await geoResponse.json();
            const searchClean = searchCity.toLowerCase().replace(/\b(city|province|municipality)\b/g, '').trim();
           
            const phLocation = geoData.find(location => {
                if (location.country !== 'PH') return false;
                const locName = location.name.toLowerCase();
                return locName.includes(searchClean) || searchClean.includes(locName);
            }) || geoData[0];

            if (phLocation) {
                cityLat = phLocation.lat;
                cityLng = phLocation.lon;
            }

        } catch (error) {
            console.log('Geocoding failed', error);
        }
    }
    // --------------------------------------------

    const exactOverrides = {

    // LUZON
    'san jose del monte': 'luzon',
    'sto. tomas': 'luzon',
    'santo tomas': 'luzon',
    'sto tomas batangas': 'luzon',
    'santo tomas batangas': 'luzon',
    'naga city': 'luzon',
    'naga': 'luzon',
    'san carlos pangasinan': 'luzon',
    'naga camarines sur': 'luzon',
    'san jose nueva ecija': 'luzon',

    // VISAYAS
    'san jose de buenavista': 'visayas',
    'sto tomas samar': 'visayas',
    'santo tomas samar': 'visayas',
    'roxas city': 'visayas',
    'borongan': 'visayas',
    'san carlos city negros occidental': 'visayas',
    'naga cebu': 'visayas',
    'calbayog': 'visayas',

    // MINDANAO
    'cagayan de oro (cdo)': 'mindanao',
    'cagayan de oro': 'mindanao',
    'isabela city': 'mindanao',
    'san jose dinagat': 'mindanao',
    'dinagat islands': 'mindanao',
    'sto tomas davao': 'mindanao',
    'santo tomas davao': 'mindanao',
};

const forcedRegion = exactOverrides[cleanLower];

const region =
    forcedRegion ||
    detectRegion(city);

console.log('Detected region:', region);

    const normalizedCity = city
        .toLowerCase()
        .replace(/\b(city|city of|municipality of|municipality)\b/g, '')
        .trim();

    let cityShelters = [];

    if (region && shelterData[region]) {

    console.log(`Region confirmed. Filtering inside: ${region}`);

    cityShelters = shelterData[region].filter(shelter => {

        if (shelter.lat == null || shelter.lng == null)
            return false;

        const normalize = value =>
            value
                .toLowerCase()
                .replace(/\./g, '')
                .replace(/\b(city|city of|municipality|municipality of|province)\b/g, '')
                .replace(/\s+/g, ' ')
                .trim();

        const shelterCity =
            normalize(shelter.city || '');

        const shelterProvince =
            normalize(shelter.province || '');

        const normalizedSearch =
            normalize(city);

        // STRICT CITY MATCH
        const isExactCity =
            shelterCity === normalizedSearch;

        // PARTIAL CITY MATCH
        const isPartialCity =
            shelterCity.includes(normalizedSearch) ||
            normalizedSearch.includes(shelterCity);

        // PROVINCE MATCH
        const isProvinceMatch =
            shelterProvince.includes(normalizedSearch);

        // DISTANCE CHECK
        const sLat = parseFloat(shelter.lat);
        const sLng = parseFloat(shelter.lng);

        if (isNaN(sLat) || isNaN(sLng))
            return false;

        const distance = Math.sqrt(
            Math.pow(sLat - cityLat, 2) +
            Math.pow(sLng - cityLng, 2)
        );

        /*
        IMPORTANT:
        Lowered radius dramatically to prevent
        Samar/Luzon crossover bugs.
        */

        const isNearby = distance < 0.08;

        /*
        PRIORITY ORDER:
        1. Exact city
        2. Partial city
        3. Province
        4. Nearby fallback
        */

        return (
            isExactCity ||
            isPartialCity ||
            isProvinceMatch ||
            isNearby
        );
    });

    } else {
        // FALLBACK: Search nationwide across all arrays if region is null or unrecognized
        console.log("Unrecognized or ambiguous region keyword. Scanning nationwide entries...");
        
        const categories = ['luzon', 'visayas', 'mindanao'];
        
        categories.forEach(regionKey => {
            if (shelterData[regionKey]) {
                const matchedInRegion = shelterData[regionKey].filter(shelter => {
                    if (shelter.lat == null || shelter.lng == null) return false;

                    const shelterCity = shelter.city
                        .toLowerCase()
                        .replace(/\b(city|city of|municipality of|municipality)\b/g, '')
                        .trim();

                    const isCityMatch =
                        shelterCity === normalizedCity ||
                        shelterCity.includes(normalizedCity) ||
                        normalizedCity.includes(shelterCity);

                    const shelterProvince = shelter.province?.toLowerCase() || '';
                    const isProvinceMatch = shelterProvince.includes(normalizedCity);

                    const sLat = parseFloat(shelter.lat);
                    const sLng = parseFloat(shelter.lng);
                    if (isNaN(sLat) || isNaN(sLng)) return false;

                    const distance = Math.sqrt(
                        Math.pow(sLat - cityLat, 2) +
                        Math.pow(sLng - cityLng, 2)
                    );
                    const isNearby = distance < 0.30;

                    return isCityMatch || isProvinceMatch || isNearby;
                });

                // Combine results into our main cityShelters array
                cityShelters = cityShelters.concat(matchedInRegion);
            }
        });
    }

    // Your existing marker-rendering code follows right below here smoothly...
    console.log(`Found ${cityShelters.length} shelters near/matching request.`);

    let nearestShelter = null;
    let nearestDistance = Infinity;

    cityShelters.forEach(shelter => {
        const sLat = parseFloat(shelter.lat);
        const sLng = parseFloat(shelter.lng);
        
        const distance = Math.sqrt(
            Math.pow(sLat - cityLat, 2) +
            Math.pow(sLng - cityLng, 2)
        );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestShelter = shelter;
        }
    });

const sortedShelters = cityShelters
    .map(shelter => {

        const sLat = parseFloat(shelter.lat);
        const sLng = parseFloat(shelter.lng);

        const distance = Math.sqrt(
            Math.pow(sLat - cityLat, 2) +
            Math.pow(sLng - cityLng, 2)
        );

        return {
            ...shelter,
            distance
        };
    })

    .sort((a, b) => a.distance - b.distance)

    // ONLY SHOW 5 NEAREST
    .slice(0, 5);


// CREATE MARKERS
let nearestMarkerRef = null;

    // CREATE MARKERS
    sortedShelters.forEach((shelter, index) => {
        const coords = [
            parseFloat(shelter.lat),
            parseFloat(shelter.lng)
        ];

        const isNearest = index === 0;

        const marker = L.marker(coords, {
            icon: L.icon({
                iconUrl: isNearest
                    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
                    : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                shadowUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);

        marker.bindPopup(`
            <div class="map-popup">
                <h3 class="highlight-location">
                    ${shelter.city || city}
                </h3>
                <p>
                    ${shelter.name || 'Evacuation Center'}
                </p>
                ${
                    isNearest
                    ? '<span class="nearest-badge">Nearest Shelter</span>'
                    : ''
                }
            </div>
        `);

        shelterMarkers.push(marker);

        // Save a reference to our closest (red) marker
        if (isNearest) {
            nearestMarkerRef = marker;
        }
    });

    // POSITION MAP AND OPEN POPUP
    setTimeout(() => {
        if (!map) return;

        // Force container layout calculations to finalize
        map.invalidateSize(true);

        if (shelterMarkers.length > 0) {
            const group = L.featureGroup(shelterMarkers);

            // Using [60, 60] padding gives it that spacious, centered look from your screenshot
            map.fitBounds(
                group.getBounds(),
                {
                    padding: [60, 60],
                    maxZoom: 13,
                    animate: true,
                    duration: 1.2
                }
            );

            // Smoothly open the nearest shelter bubble right in the center!
            if (nearestMarkerRef) {
                nearestMarkerRef.openPopup();
            }

        } else {
            map.flyTo(
                [cityLat, cityLng],
                13
            );
        }
    }, 600);
}

function handleSearch(){

    const location =
    countryInput.value.trim() ||
    cityInput.value.trim();

    if (!location) return;

const cleanLocation =
location.toLowerCase().trim();

const isValid =
VALID_PH_LOCATIONS.some(place =>
    cleanLocation === place ||
    cleanLocation.includes(place)
);

if (!isValid) {

    alert(
        'Please enter a supported Philippine city or province.'
    );

    return;
}

    updateWeatherInfo(location);

    cityInput.value = '';
    countryInput.value = '';
}

welcomeSearchBtn?.addEventListener(
    'click',
    handleSearch
);

searchBtn?.addEventListener(
    'click',
    handleSearch
);

cityInput?.addEventListener(
    'keypress',
    e => {

        if(e.key === 'Enter'){

            handleSearch();
        }
    }
);

countryInput?.addEventListener(
    'keypress',
    e => {

        if(e.key === 'Enter'){

            handleSearch();
        }
    }
);

function getWeatherIcon(id) {

    if (id <= 232) return 'thunderstorm.svg';

    if (id <= 321) return 'drizzle.svg';

    if (id <= 531) return 'rain.svg';

    if (id <= 622) return 'snow.svg';

    if (id <= 781) return 'atmosphere.svg';

    if (id == 800) return 'clear.svg';

    return 'clouds.svg';
}

function getTodayLabel(id) {

    if (id <= 232)
        return 'Thunderstorms are expected today.';

    if (id <= 321)
        return 'Light rain showers are present.';

    if (id <= 531)
        return "It's a rainy day today.";

    if (id <= 622)
        return 'Snowy conditions ahead.';

    if (id <= 781)
        return 'Foggy atmosphere detected.';

    if (id == 800)
        return 'The sun is out in full force!';

    return 'Cloudy skies today.';
}

async function updateWeatherInfo(city) {
    try {
        let weatherData = await getFetchData('weather', city);

        if (Number(weatherData.cod) === 404 || !weatherData.sys || weatherData.sys.country !== 'PH') {
            const cleanLower = city.toLowerCase().trim();
            let fallbackCity = null;

            const regionalMap = {
                'sulu': 'Jolo',
                'marinduque': 'Boac',
                'batanes': 'Basco',
                'palawan': 'Puerto Princesa',
                'tawi-tawi': 'Bongao',
                'tawitawi': 'Bongao',
                'romblon': 'Romblon',
                'camiguin': 'Mambajao',
                'dinagat': 'San Jose',
                'guimaras': 'Jordan',
                'catanduanes': 'Virac',
                'siquijor': 'Siquijor',
                'masbate city': 'Masbate City',
                'bulacan': 'Malolos',
                'pampanga': 'San Fernando',
                'cavite': 'Trece Martires',
                'laguna': 'Santa Cruz',
                'batangas': 'Batangas City',
                'rizal': 'Antipolo',
                'quezon province': 'Lucena',
                'ilocos norte': 'Laoag',
                'ilocos sur': 'Vigan',
                'pangasinan': 'Lingayen',
                'isabela': 'Ilagan',
                'cagayan': 'Tuguegarao',
                'bataan': 'Balanga',
                'zambales': 'Iba',
                'tarlac': 'Tarlac City',
                'nueva ecija': 'Palayan',
                'aurora': 'Baler',
                'camarines norte': 'Daet',
                'camarines sur': 'Pili',
                'albay': 'Legazpi',
                'sorsogon': 'Sorsogon City',
                'abra': 'Bangued',
                'apayao': 'Kabugao',
                'benguet': 'La Trinidad',
                'ifugao': 'Lagawe',
                'kalinga': 'Tabuk',
                'mountain province': 'Bontoc',
                'aklan': 'Kalibo',
                'antique': 'San Jose de Buenavista',
                'capiz': 'Roxas City',
                'iloilo': 'Iloilo City',
                'negros occidental': 'Bacolod',
                'bohol': 'Tagbilaran',
                'cebu': 'Cebu City',
                'negros oriental': 'Dumaguete',
                'biliran': 'Naval',
                'eastern samar': 'Borongan',
                'leyte': 'Tacloban',
                'northern samar': 'Catarman',
                'samar': 'Catbalogan',
                'southern leyte': 'Maasin',
                'zamboanga del norte': 'Dipolog',
                'zamboanga del sur': 'Pagadian',
                'zamboanga sibugay': 'Ipil',
                'bukidnon': 'Malaybalay',
                'lanao del norte': 'Tubod',
                'misamis occidental': 'Oroquieta',
                'misamis oriental': 'Cagayan de Oro',
                'compostela valley': 'Nabunturan',
                'davao de oro': 'Nabunturan',
                'davao del norte': 'Tagum',
                'davao del sur': 'Davao City',
                'davao occidental': 'Malita',
                'davao oriental': 'Mati',
                'cotabato': 'Kidapawan',
                'south cotabato': 'Koronadal',
                'sultan kudarat': 'Isulan',
                'sarangani': 'Alabel',
                'agusan del norte': 'Cabadbaran',
                'agusan del sur': 'Prosperidad',
                'surigao del norte': 'Surigao City',
                'surigao del sur': 'Tandag',
                'basilan': 'Isabela City',
                'lanao del sur': 'Marawi',
                'maguindanao': 'Buluan'
            };

            for (const [province, capital] of Object.entries(regionalMap)) {
                if (cleanLower.includes(province)) {
                    fallbackCity = capital;
                    break;
                }
            }

            if (fallbackCity) {
                console.warn(`"${city}" handled as a region. Loading weather context from capital: ${fallbackCity}`);
                weatherData = await getFetchData('weather', fallbackCity);
                weatherData.name = city.split(',')[0].trim().replace(/\b\w/g, c => c.toUpperCase());
            } else {
                showErrorState();
                return;
            }
        }

        const {
            name,
            main: { temp, humidity },
            weather: [{ id, main }],
            wind: { speed }
        } = weatherData;

        cityTxt.textContent = name;
        tempTxt.textContent = `${Math.round(temp)} °C`;
        conditionTxt.textContent = main;

        updateWeatherQuote(main);

        humidityTxt.textContent = `${humidity}%`;
        windTxt.textContent = `${speed} M/s`;

        weatherDay.textContent = new Date().toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });

        const icon = getWeatherIcon(id);
        weatherImg.src = `assets/weather/${icon}`;
        lottieWeather.src = `assets/weather/${icon}`;
        todayTxt.textContent = getTodayLabel(id);

        updateTipsSection(id, temp, name, main);

        try {
            fetchClimateNews(city);
        } catch (err) {
            console.log("News fetch mismatch omitted gracefully:", err);
        }

        try {
            await updateForecastsInfo(city);
        } catch (err) {
            console.log("Forecast trace bypassed:", err);
        }

        hideAllSections();

        weatherInput.style.display = 'flex';
        weatherText.style.display = 'flex';
        sideBar.style.display = 'flex';

        tipsSection.classList.add('show');
        weatherWelcome.style.display = 'none';

        try {
            await updateShelterMap(city);
        } catch (mapErr) {
            console.error("Map pinning layout error:", mapErr);
        }

        setTimeout(() => {
            if (map) {
                map.invalidateSize(true);
            }
        }, 300);

        newsSection.classList.add('show');

    } catch (error) {
        console.error(error);
        showErrorState();
    }
}

function updateWeatherQuote(condition) {
    if (!weatherQuoteTxt) return;

    const mainCondition = condition.toLowerCase();
    let quote = '"Expect the unexpected with these skies."'; 

    if (mainCondition.includes('clear')) {
        quote = '"Nothing but sunny skies ahead."';
    } else if (mainCondition.includes('cloud')) {
        quote = '"Grey clouds make for the brightest minds."';
    } else if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) {
        quote = '"Grab your umbrella—nature is watering its canvas."';
    } else if (mainCondition.includes('thunderstorm')) {
        quote = '"Don\'t worry, even the loudest storms eventually run out of rain."';
    } else if (mainCondition.includes('snow')) {
        quote = '"A cozy, winter wonderland view today."';
    } else if (mainCondition.includes('mist') || mainCondition.includes('fog') || mainCondition.includes('haze')) {
        quote = '"Clear intentions, mysterious windows."';
    }

    weatherQuoteTxt.textContent = quote;
}

function updateTipsSection(id, temp, city, condition) {

    tipsTemp.textContent =
    `${Math.round(temp)}°C`;

    tipsCondition.textContent =
    condition;

    let title;
    let description;
    let alertColor;
    let tips;


    if (temp >= 32) {

        title = 'Extreme Heat Advisory';

        description =
        'Very high temperatures may cause dehydration and heat exhaustion.';

        alertColor = '#F97316';

        tips = [

            {
                icon:'assets/tips/sun-wr.png',
                title:'Drink Water'
            },

            {
                icon:'assets/tips/sun-sn.png',
                title:'Wear Sunscreen'
            },

            {
                icon:'assets/tips/sun-ch.png',
                title:'Light Clothing'
            },

            {
                icon:'assets/tips/sun-ht.png',
                title:'Avoid Noon Heat'
            }
        ];

    }

    else if (id <= 232) {

        title = 'Thunderstorm Warning';

        description =
        'Thunderstorms may include lightning, heavy rain, and strong winds.';

        alertColor = '#7C3AED';

        tips = [

            {
                icon:'assets/tips/thunder-ir.png',
                title:'Stay Indoors'
            },

            {
                icon:'assets/tips/thunder-wg.png',
                title:'Avoid Open Areas'
            },

            {
                icon:'assets/tips/thunder-ce.png',
                title:'Charge Devices'
            },

            {
                icon:'assets/tips/thunder-ey.png',
                title:'Unplug Appliances'
            }
        ];

    }

    else if (id <= 321) {

        title = 'Light Rain Advisory';

        description =
        'Drizzle and light rain may cause slippery roads and reduced visibility.';

        alertColor = '#38BDF8';

        tips = [

            {
                icon:'assets/tips/light-ua.png',
                title:'Bring Umbrella'
            },

            {
                icon:'assets/tips/light-ss.png',
                title:'Wear Non-Slip Shoes'
            },

            {
                icon:'assets/tips/light-de.png',
                title:'Drive Carefully'
            },

            {
                icon:'assets/tips/light-rt.png',
                title:'Use Rain Protection'
            }
        ];

    }

    else if (id <= 531) {

        title = 'Rainfall Advisory';

        description =
        'Heavy rain may cause flooding and dangerous road conditions.';

        alertColor = '#2563EB';

        tips = [

            {
                icon:'assets/tips/rain-ua.png',
                title:'Bring Umbrella'
            },

            {
                icon:'assets/tips/rain-fd.png',
                title:'Avoid Flood Areas'
            },

            {
                icon:'assets/tips/rain-et.png',
                title:'Prepare Emergency Kit'
            },

            {
                icon:'assets/tips/rain-sw.png',
                title:'Drive Slowly'
            }
        ];

    }

    else if (id <= 622) {

        title = 'Snow Advisory';

        description =
        'Cold weather and snowfall may reduce visibility and mobility.';

        alertColor = '#94A3B8';

        tips = [

            {
                icon:'assets/tips/snow-jt.png',
                title:'Wear Thick Clothing'
            },

            {
                icon:'assets/tips/snow-ir.png',
                title:'Stay Warm Indoors'
            },

            {
                icon:'assets/tips/snow-sy.png',
                title:'Avoid Slippery Roads'
            },

            {
                icon:'assets/tips/snow-ft.png',
                title:'Carry Emergency Light'
            }
        ];

    }

    else if (id <= 781) {

        title = 'Fog Advisory';

        description =
        'Low visibility may affect travel and outdoor activities.';

        alertColor = '#64748B';

        tips = [

            {
                icon:'assets/tips/fog-ht.png',
                title:'Use Headlights'
            },

            {
                icon:'assets/tips/fog-sw.png',
                title:'Drive Slowly'
            },

            {
                icon:'assets/tips/fog-mp.png',
                title:'Monitor Navigation'
            },

            {
                icon:'assets/tips/fog-he.png',
                title:'Avoid Long Travel'
            }
        ];

    }

    else if (id == 800) {

        title = 'Clear Sky Advisory';

        description =
        'Weather conditions are stable with clear skies today.';

        alertColor = '#0EA5E9';

        tips = [

            {
                icon:'assets/tips/clear-or.png',
                title:'Enjoy Outdoor Activities'
            },

            {
                icon:'assets/tips/clear-wr.png',
                title:'Stay Hydrated'
            },

            {
                icon:'assets/tips/clear-sn.png',
                title:'Use Sun Protection'
            },

            {
                icon:'assets/tips/clear-se.png',
                title:'Travel Safely'
            }
        ];

    }

    else {

        title = 'Cloudy Weather Advisory';

        description =
        'Cloudy skies may bring sudden weather changes later in the day.';

        alertColor = '#64748B';

        tips = [

            {
                icon:'assets/tips/cloudy-ns.png',
                title:'Monitor Forecast'
            },

            {
                icon:'assets/tips/cloudy-jt.png',
                title:'Bring Light Jacket'
            },

            {
                icon:'assets/tips/cloudy-ua.png',
                title:'Carry Umbrella'
            },

            {
                icon:'assets/tips/cloudy-pd.png',
                title:'Stay Prepared'
            }
        ];
    }

    dangerTitle.textContent = title;

    dangerDescription.textContent =
    description;

    tipsMainTitle.textContent =
    getTodayLabel(id);

    const alertBox =
    document.querySelector('.tips-alert');

    if (alertBox) {

        alertBox.style.borderLeft =
        `6px solid ${alertColor}`;
    }

    tipsList.innerHTML =
    tips.map(tip => `

        <li class="tip-card">

            <img
                src="${tip.icon}"
                class="tip-icon"
            >

            <h3 class="tip-title">
                ${tip.title}
            </h3>

        </li>

    `).join('');
}

async function updateForecastsInfo(city) {

    const forecastData = await getFetchData('forecast', city);

    if(forecastData.city.country !== 'PH'){
    return;
}

    const targetTime = '12:00:00';
    const today = new Date().toISOString().split("T")[0];

    futureWeather.innerHTML = '';

    forecastData.list.forEach(forecast => {

        if (
            forecast.dt_txt.includes(targetTime) &&
            !forecast.dt_txt.includes(today)
        ) {

            const dateResult = new Date(forecast.dt_txt)
            .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short'
            });

            futureWeather.innerHTML += `
                <div class="future-weather-card">

                    <h2 class="forecast-item-date">
                        ${dateResult}
                    </h2>

                    <img
                        src="assets/weather/${getWeatherIcon(forecast.weather[0].id)}"
                        class="forecast-item-img"
                    >

                    <h3 class="forecast-item-temp">
                        ${Math.round(forecast.main.temp)} °C
                    </h3>

                </div>
            `;
        }
    });
}

function hideAllSections(){

    [
        weatherWelcome,
        weatherInput,
        weatherText,
        errorMsg,
        weatherError
    ].forEach(section => {

        if(section){
            section.style.display = 'none';
        }
    });

    tipsSection.classList.remove('show');
    newsSection.classList.remove('show');
}

function showErrorState(){

    hideAllSections();

    weatherWelcome.style.display = 'flex';

    errorMsg.style.display = 'block';
}

const newsGrid =
document.querySelector('.news-grid');

const climateButtons =
document.querySelectorAll('.climate-btn');

let currentNews = [];
let historicalNews = [];

const historicalDatabase = {

    typhoon: [

        {
            title: 'Super Typhoon Yolanda (2013)',

            description:
            'One of the deadliest typhoons in Philippine history that devastated Tacloban and nearby provinces.',

            image:
            'assets/history/yolanda.jpg',

            link:
            'https://en.wikipedia.org/wiki/Typhoon_Haiyan'
        },

        {
            title: 'Typhoon Ondoy (2009)',

            description:
            'Massive flooding submerged Metro Manila after intense rainfall.',

            image:
            'assets/history/ondoy.jpg',

            link:
            'https://en.wikipedia.org/wiki/Tropical_Storm_Ketsana'
        },

        {
            title: 'Typhoon Rolly (2020)',

            description:
            'One of the strongest tropical cyclones ever recorded worldwide.',

            image:
            'assets/history/rolly.jpg',

            link:
            'https://en.wikipedia.org/wiki/Typhoon_Goni'
        }
    ],

    heat: [

        {
            title: '2016 El Niño Crisis',

            description:
            'Extreme drought and heat affected agriculture and water supply across Southeast Asia.',

            image:
            'assets/history/elnino.jpg',

            link:
            'https://en.wikipedia.org/wiki/2014%E2%80%9316_El_Ni%C3%B1o_event'
        },

        {
            title: '2024 Philippine Heat Wave',

            description:
            'Dangerous heat index levels forced class suspensions nationwide.',

            image:
            'assets/history/heatwave.jpg',

            link:
            'https://en.wikipedia.org/wiki/Heat_wave'
        }
    ],

    flood: [

        {
            title: 'Marikina Flood Disaster',

            description:
            'Severe flooding displaced thousands during Ondoy.',

            image:
            'assets/history/marikina.jpg',

            link:
            'https://en.wikipedia.org/wiki/Tropical_Storm_Ketsana'
        }
    ],

    earthquake: [

        {
            title: '1990 Luzon Earthquake',

            description:
            'A magnitude 7.7 earthquake caused severe destruction in Northern Luzon.',

            image:
            'assets/history/luzon-earthquake.jpg',

            link:
            'https://en.wikipedia.org/wiki/1990_Luzon_earthquake'
        }
    ]
};

async function fetchClimateNews(city = 'Philippines') {

    const sdg13Keywords = "climate OR disaster OR weather OR flood OR typhoon";

    let query = "";
    if (city.toLowerCase() === 'philippines') {
        query = sdg13Keywords;
    } else {
        query = `${city} weather`;
    }

    let url = `https://newsdata.io/api/1/news?apikey=${newsDataKey}&language=en&country=ph&q=${encodeURIComponent(query)}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (!data.results || data.results.length === 0) {
            console.warn(`No specific matches for "${city}". Fetching broader national dataset...`);
            
            const fallbackUrl = `https://newsdata.io/api/1/news?apikey=${newsDataKey}&language=en&country=ph&q=${encodeURIComponent(sdg13Keywords)}`;
            response = await fetch(fallbackUrl);
            data = await response.json();
            
            if (!data.results || data.results.length === 0) {
                renderFallback();
                return;
            }
        }

        const blockedWords = [ 
            'election',
            'senate',
            'congress',
            'partylist',
            'celebrity',
            'hearing',
            'racing',
            'scandal',
            'champion',
            'comfort',
            'supreme',
            'court',
            'impeachment',
            'stock',
            'games',
            'meralco',
            'games',
            'league',
            'e-wallet',
            'afp',
            'war',
            'drugs',
            'golf',
            'taxi',
            'motorcycle',

            
        ];

        data.results = data.results.filter(article => {
            const text = `
                ${article.title || ''}
                ${article.description || ''}
            `.toLowerCase();

            return !blockedWords.some(word => text.includes(word));
        });

        const uniqueArticles = new Map();

        data.results.forEach(article => {
            const titleKey =
(article.title || '').trim()
.toLowerCase();
            if (!uniqueArticles.has(titleKey)) {
                uniqueArticles.set(titleKey, article);
            }
        });

        currentNews = 
        Array.from(uniqueArticles.values()).slice(0, 3);

        const locationLabel = document.querySelector('.news-location');

        if (locationLabel) {
            locationLabel.textContent = `Showing climate news for ${city}`;
        }

        generateHistoricalNews(currentNews);

        if (currentActiveTab === 'current') {
            renderNews(currentNews);
        } else {
            renderNews(historicalNews);
        }

    } catch(error){

        console.log(error);

        renderFallback();
    }
}

function generateHistoricalNews(news) {

    historicalNews = [];

    news.forEach(article => {

        const type =
        detectDisasterType(article);

        if(!type){
            return;
        }

        const relatedHistory =
        historicalDatabase[type];

        if(
            relatedHistory &&
            relatedHistory.length > 0
        ){

            const randomItem =
            relatedHistory[
                Math.floor(
                    Math.random() *
                    relatedHistory.length
                )
            ];

            historicalNews.push(randomItem);
        }
    });

    historicalNews = historicalNews.filter(
        (item, index, self) =>
            index === self.findIndex(
                t => t.title === item.title
            )
    );

    if(historicalNews.length === 0){

        historicalNews.push({

            title:
            'No Related Historical News',

            description:
            'There is currently no historical disaster match for this article.',

            image:
            'assets/news/noimage.jpg',

            link:'#'
        });
    }

    renderNews(

        currentActiveTab === 'current'
            ? currentNews
            : historicalNews

    );
}

function renderNews(newsArray) {

    newsGrid.innerHTML = '';

    const uniqueNews = [];
    const usedTitles = new Set();
    const usedImages = new Set();

    newsArray.forEach(article => {

        const title =
        (article.title || '')
        .trim()
        .toLowerCase();

        const image =
        (
            article.image_url ||
            article.image ||
            ''
        )
        .trim()
        .toLowerCase();

        if(
            usedTitles.has(title) ||
            (
                image &&
                usedImages.has(image)
            )
        ){
            return;
        }

        usedTitles.add(title);

        if(image){
            usedImages.add(image);
        }

        uniqueNews.push(article);
    });

    newsArray = uniqueNews.slice(0,3);


    if (
        currentActiveTab === 'historical' &&
        (
            newsArray.length === 0 ||
            newsArray.every(
                article =>
                    article.title ===
                    'No Related Historical News'
            )
        )
    ) {

        newsGrid.innerHTML = `

            <div class="news-card center no-history-card">

                <div class="news-image-wrapper">

                    <img
                        src="assets/news/noimage.jpg"
                        class="news-image"
                    >

                </div>

                <div class="news-content">

                    <h2>
                        No Related Historical News
                    </h2>

                    <p>
                        There is currently no historical disaster match for this article.
                    </p>

                </div>

            </div>
        `;

        updateNewsGridClasses();
        return;
    }

    newsArray.forEach((article, index) => {

        let position = '';

        if (newsArray.length === 1) {

            position = 'center';

        } else if (newsArray.length === 2) {

            position =
            index === 0
                ? 'center'
                : 'side';

        } else {

            if (index === 0)
                position = 'left';

            if (index === 1)
                position = 'center';

            if (index === 2)
                position = 'right';
        }

        const isDisabled =
            !article.link ||
            article.link === '#';

        const imageSrc =
            article.image_url ||
            article.image ||
            'assets/news/noimage.jpg';

        newsGrid.innerHTML += `

            <${isDisabled ? 'div' : 'a'}
                ${
                    !isDisabled
                        ? `href="${article.link}" target="_blank"`
                        : ''
                }

                class="news-card ${position} ${
                    isDisabled ? 'disabled-card' : ''
                }"
            >

                <div class="news-image-wrapper">

                    <img
                        src="${imageSrc}"
                        alt="${article.title}"

                        onerror="
                            this.onerror=null;
                            this.src='assets/news/noimage.jpg';
                        "
                    >

                </div>

                <div class="news-content">

                    <h2>
                        ${article.title}
                    </h2>

                    <p>

                        ${
                            article.description

                            ? article.description.substring(0, 120)

                            : 'Climate-related disaster.'
                        }

                    </p>

                    ${
                        !isDisabled

                        ? `

                        <div class="news-read">
                            READ FULL STORY
                        </div>

                        `

                        : ''
                    }

                </div>

            </${isDisabled ? 'div' : 'a'}>
        `;
    });

    updateNewsGridClasses();
    setupCarousel();
}

function updateNewsGridClasses() {
    const activeButton = document.querySelector('.climate-btn.active');
    if (!activeButton) return;

    const newsCards = document.querySelectorAll('.news-card');
    const newsArrayLength = newsCards.length;

    newsGrid.classList.remove('two-cards', 'one-card');

    if (newsArrayLength === 1) {
        newsGrid.classList.add('one-card');
    } else if (newsArrayLength === 2) {
        newsGrid.classList.add('two-cards');
    }
}

function setupCarousel(){

    const cards =
    document.querySelectorAll('.news-card');

    cards.forEach(card=>{

        card.addEventListener('click',e=>{

            if(cards.length === 1){

                return;
            }

            if(cards.length === 2){

                e.preventDefault();

                const center =
                document.querySelector('.news-card.center');

                const side =
                document.querySelector('.news-card.side');

                if(
                    card.classList.contains('side')
                ){

                    center.className =
                    'news-card side';

                    side.className =
                    'news-card center';
                }

                else{

                    window.open(
                        card.href,
                        '_blank'
                    );
                }

                return;
            }

            e.preventDefault();

            if(card.classList.contains('right')){

                rotateRight();

            }else if(card.classList.contains('left')){

                rotateLeft();

            }else{

                window.open(
                    card.href,
                    '_blank'
                );
            }
        });
    });
}

function rotateRight(){

    const left =
    document.querySelector('.news-card.left');

    const center =
    document.querySelector('.news-card.center');

    const right =
    document.querySelector('.news-card.right');

    if(!left || !center || !right)
        return;

    left.className =
    'news-card right';

    center.className =
    'news-card left';

    right.className =
    'news-card center';
}

function rotateLeft(){

    const left =
    document.querySelector('.news-card.left');

    const center =
    document.querySelector('.news-card.center');

    const right =
    document.querySelector('.news-card.right');

    if(!left || !center || !right)
        return;

    left.className =
    'news-card center';

    center.className =
    'news-card right';

    right.className =
    'news-card left';
}

function renderFallback(){

    newsGrid.innerHTML = `

        <div class="news-card center">

            <div class="news-content">

                <h2>
                    Unable to load climate news
                </h2>

                <p>
                    Please try again later.
                </p>

            </div>

        </div>
    `;
}

async function getFetchData(type, city) {

    let url = '';

    if (type === 'weather') {

        url =
            `https://api.openweathermap.org/data/2.5/weather?q=${city},PH&appid=${apiKey}&units=metric`;

    } else if (type === 'forecast') {

        url =
            `https://api.openweathermap.org/data/2.5/forecast?q=${city},PH&appid=${apiKey}&units=metric`;
    }

    const response = await fetch(url);

    return response.json();
}

function detectDisasterType(article){

    const text = `
        ${article.title || ''}
        ${article.description || ''}
    `.toLowerCase();

    const typhoonWords = [
        'super typhoon',
        'typhoon',
        'tropical storm',
        'cyclone',
        'storm surge'
    ];

    const heatWords = [
        'heat index',
        'heat wave',
        'extreme heat',
        'el niño',
        'high temperature'
    ];

    const floodWords = [
        'flood',
        'flooding',
        'heavy rainfall',
        'flash flood'
    ];

    const earthquakeWords = [
        'earthquake',
        'magnitude',
        'tectonic'
    ];

    function hasKeyword(words){

        return words.some(word =>
            text.includes(word)
        );
    }

    if(hasKeyword(typhoonWords))
        return 'typhoon';

    if(hasKeyword(heatWords))
        return 'heat';

    if(hasKeyword(floodWords))
        return 'flood';

    if(hasKeyword(earthquakeWords))
        return 'earthquake';

    return null;
}

climateButtons.forEach(button=>{

    button.addEventListener('click',()=>{

        climateButtons.forEach(btn=>
            btn.classList.remove('active')
        );

        button.classList.add('active');

        const type = button.dataset.type;
        currentActiveTab = type;

        if(type === 'current'){

            renderNews(currentNews);

        }else{

            renderNews(historicalNews);
        }
    });
});

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        hideAllSections();

        weatherWelcome.style.display =
        'flex';

        await loadShelterData();

        buildShelterMenu();

        initializeMap();
    }
);