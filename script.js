// =========================
// ELEMENTS
// =========================

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

let currentActiveTab = 'current';

// =========================
// API KEYS
// =========================

const apiKey = '5fd9094f4742b02276d974ee0f156d43';

const newsDataKey =
'pub_df285ec6a85c42d4a489460e4c019f87';

let shelterData = {};

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


// =========================
// REGION DETECTION
// =========================

function detectRegion(city){

    city = city
        .toLowerCase()
        .trim();

    const luzonKeywords = [

        'manila',
        'quezon city',
        'makati',
        'pasig',
        'taguig',
        'marikina',
        'marikina city',
        'baguio',
        'vigan',
        'legazpi',
        'batangas',
        'olongapo',
        'cabanatuan',
        'lucena',
        'naga',
        'tuguegarao',
        'laoag',
        'baler',
        'puerto princesa',
        'palawan',
        'bulacan',
        'malolos',
        'meycauayan',
        'san jose del monte',
        'pampanga',
        'ilocos',
        'cavite',
        'laguna',
        'rizal',
        'bicol'
    ];

    const visayasKeywords = [

        'cebu',
        'iloilo',
        'bacolod',
        'dumaguete',
        'tagbilaran',
        'ormoc',
        'tacloban',
        'roxas',
        'kalibo',
        'bohol',
        'leyte',
        'samar',
        'negros',
        'aklan'
    ];

    const mindanaoKeywords = [

        'davao',
        'cagayan de oro',
        'zamboanga',
        'butuan',
        'general santos',
        'gensan',
        'surigao',
        'cotabato',
        'dipolog',
        'pagadian',
        'bukidnon',
        'misamis',
        'lanao',
        'mati'
    ];

    function matchesRegion(keywords){

        return keywords.some(keyword =>
            city.includes(keyword)
        );
    }

    if(matchesRegion(luzonKeywords))
        return 'luzon';

    if(matchesRegion(visayasKeywords))
        return 'visayas';

    if(matchesRegion(mindanaoKeywords))
        return 'mindanao';

    return 'luzon';
}

// =========================
// MAP SYSTEM
// =========================

let map = null;
let shelterMarkers = [];
let mapInitialized = false;

// =========================
// INITIALIZE MAP
// =========================

function initializeMap(){

    // PREVENT DUPLICATE MAPS

    if(mapInitialized) return;

    const mapContainer =
    document.getElementById('map');

    if(!mapContainer) return;

    map = L.map('map', {

        preferCanvas:true,
        zoomControl:true

    }).setView(
        [12.8797, 121.7740],
        5
    );

    // TILE LAYER

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:
            '&copy; OpenStreetMap contributors'
        }
    ).addTo(map);

    mapInitialized = true;

    console.log('Map initialized');
}

// =========================
// CLEAR ALL MARKERS
// =========================

function clearShelterMarkers(){

    shelterMarkers.forEach(marker => {

        if(map){
            map.removeLayer(marker);
        }

    });

    shelterMarkers = [];
}

// =========================
// FORCE MAP REFRESH
// =========================

function refreshMap(){

    if(!map) return;

    setTimeout(() => {

        map.invalidateSize(true);

    }, 400);
}

// =========================
// UPDATE SHELTER MAP
// =========================

async function updateShelterMap(city) {

    // ENSURE MAP EXISTS
    if (!mapInitialized) {
        initializeMap();
    }

    if (!map) return;

    // CLEAR OLD MARKERS
    clearShelterMarkers();

    // =========================
    // GET CITY COORDINATES
    // =========================
    let cityLat = 12.8797;
    let cityLng = 121.7740;

    try {
        const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},PH&limit=5&appid=${apiKey}`
        );

        const geoData = await geoResponse.json();

        // CLEAN SEARCH TERM FOR BETTER MATCHING
        const searchClean = city.toLowerCase().replace(' city', '').replace('city of ', '').trim();

        // FIND PHILIPPINE MATCH
        const phLocation = geoData.find(location => {
            if (location.country !== 'PH') return false;
            const locName = location.name.toLowerCase();
            return locName.includes(searchClean) || searchClean.includes(locName);
        }) || geoData[0];

        if (phLocation) {
            cityLat = phLocation.lat;
            cityLng = phLocation.lon;
        } else {
            showErrorState();
            return;
        }

    } catch (error) {
        console.log('Geocoding failed', error);
    }

    // =========================
    // DETECT REGION
    // =========================
    const region = detectRegion(city);

    if(region === 'luzon'){
    query = 'Luzon weather';
}
    console.log('Detected region:', region);

    const normalizedCity = city
        .toLowerCase()
        .replace(' city', '')
        .replace('city of ', '')
        .replace(' municipality', '')
        .trim();

    if (!shelterData[region]) {
        console.log(`No shelter data found for region: ${region}`);
        return;
    }

    const cityShelters = shelterData[region].filter(shelter => {

    if (shelter.lat == null || shelter.lng == null) {
        return false;
    }

    const shelterCity = shelter.city
        .toLowerCase()
        .replace(' city', '')
        .replace('city of ', '')
        .trim();

    // TEXT MATCH
    const isCityMatch =
        shelterCity === normalizedCity ||
        shelterCity.includes(normalizedCity) ||
        normalizedCity.includes(shelterCity);

    // DISTANCE MATCH
    const sLat = parseFloat(shelter.lat);
    const sLng = parseFloat(shelter.lng);

    if (isNaN(sLat) || isNaN(sLng)) {
        return false;
    }

    const distance = Math.sqrt(
        Math.pow(sLat - cityLat, 2) +
        Math.pow(sLng - cityLng, 2)
    );

    // INCREASED RADIUS
    const isNearby = distance < 0.5;

    return isCityMatch || isNearby;
});



    // =========================
    // FIND NEAREST SHELTER
    // =========================
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

    // =========================
    // CREATE MARKERS
    // =========================
    cityShelters.forEach(shelter => {
        const coords = [
            parseFloat(shelter.lat),
            parseFloat(shelter.lng)
        ];

        const marker = L.marker(coords).addTo(map);

        // HIGHLIGHT ONLY NEAREST
        if (shelter === nearestShelter) {
            marker.setIcon(
                L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            );
        }

        // POPUP
        marker.bindPopup(`
            <div class="map-popup">
                <h3 class="highlight-location">${shelter.city || city}</h3>
                <p>${shelter.name || 'Evacuation Center'}</p>
            </div>
        `);

        // CLICK TO ZOOM
        marker.on('click', () => {
            map.setView(coords, 16, {
                animate: true,
                duration: 1.5
            });
            marker.openPopup();
        });

        shelterMarkers.push(marker);
    });

    // =========================
    // FOCUS ON SEARCHED CITY
    // =========================
    setTimeout(() => {
        map.invalidateSize(true);
        map.setView(
            [cityLat, cityLng],
            13, // Increased zoom level from 11 to 13 to focus closer on the target city
            {
                animate: true,
                duration: 1.5
            }
        );
    }, 500);
}

// =========================
// SEARCH EVENTS
// =========================

function handleSearch(){

    const location =
    countryInput.value.trim() ||
    cityInput.value.trim();

    if(!location) return;

    updateWeatherInfo(location);

    cityInput.value = '';
    countryInput.value = '';
}

// BUTTONS

welcomeSearchBtn?.addEventListener(
    'click',
    handleSearch
);

searchBtn?.addEventListener(
    'click',
    handleSearch
);

// ENTER KEY

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

// =========================
// WEATHER ICONS
// =========================

function getWeatherIcon(id) {

    if (id <= 232) return 'thunderstorm.svg';

    if (id <= 321) return 'drizzle.svg';

    if (id <= 531) return 'rain.svg';

    if (id <= 622) return 'snow.svg';

    if (id <= 781) return 'atmosphere.svg';

    if (id == 800) return 'clear.svg';

    return 'clouds.svg';
}

// =========================
// WEATHER LABEL
// =========================

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

// =========================
// UPDATE WEATHER
// =========================

async function updateWeatherInfo(city) {

    try {

        const weatherData =
            await getFetchData('weather', city);

        // INVALID RESPONSE

        if (
            Number(weatherData.cod) !== 200 ||
            !weatherData.sys ||
            weatherData.sys.country !== 'PH'
        ) {

            showErrorState();
            return;
        }

        const {
            name,

            main: {
                temp,
                humidity
            },

            weather: [{
                id,
                main
            }],

            wind: {
                speed
            }

        } = weatherData;

        // =========================
        // UPDATE WEATHER INFO
        // =========================

        cityTxt.textContent = name;

        tempTxt.textContent =
            `${Math.round(temp)} °C`;

        conditionTxt.textContent = main;

            updateWeatherQuote(main);

        humidityTxt.textContent =
            `${humidity}%`;

        windTxt.textContent =
            `${speed} M/s`;

        weatherDay.textContent =
            new Date().toLocaleDateString(
                'en-GB',
                {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short'
                }
            );

        // =========================
        // WEATHER ICONS
        // =========================

        const icon =
            getWeatherIcon(id);

        weatherImg.src =
            `assets/weather/${icon}`;

        lottieWeather.src =
            `assets/weather/${icon}`;

        todayTxt.textContent =
            getTodayLabel(id);

        // =========================
        // UPDATE UI
        // =========================

        updateTipsSection(
            id,
            temp,
            name,
            main
        );

        try {

            fetchClimateNews(city);

        } catch (err) {

            console.log(err);
        }

        try {

            await updateForecastsInfo(city);

        } catch (err) {

            console.log(err);
        }

        hideAllSections();

        weatherInput.style.display =
            'flex';

        weatherText.style.display =
            'flex';

        sideBar.style.display =
            'flex';

        tipsSection.classList.add(
            'show'
        );

        setTimeout(() => {

            if (map) {

                map.invalidateSize(true);
            }

        }, 300);

        newsSection.classList.add(
            'show'
        );

    } catch (error) {

        console.log(error);

        showErrorState();
    }
}

function updateWeatherQuote(condition) {
    if (!weatherQuoteTxt) return;

    const mainCondition = condition.toLowerCase();
    let quote = '"Expect the unexpected with these skies."'; // Default tagline

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

// =========================
// TIPS SECTION
// =========================

function updateTipsSection(id, temp, city, condition) {

    tipsTemp.textContent =
    `${Math.round(temp)}°C`;

    tipsCondition.textContent =
    condition;

    let title;
    let description;
    let alertColor;
    let tips;

    // =========================
    // EXTREME HEAT
    // =========================

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
                icon:'assets/tips/sun-ua.png',
                title:'Avoid Noon Heat'
            }
        ];

    }

    // =========================
    // THUNDERSTORM
    // =========================

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

    // =========================
    // DRIZZLE
    // =========================

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

    // =========================
    // RAIN
    // =========================

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

    // =========================
    // SNOW
    // =========================

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

    // =========================
    // FOG / ATMOSPHERE
    // =========================

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

    // =========================
    // CLEAR SKY
    // =========================

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

    // =========================
    // CLOUDY
    // =========================

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

    // =========================
    // UPDATE UI
    // =========================

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

    // =========================
    // RENDER TIPS
    // =========================

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

    // =========================
    // UPDATE MAP
    // =========================

    updateShelterMap(city);
}

// =========================
// FORECAST
// =========================

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

// =========================
// HIDE SECTIONS
// =========================

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

// =========================
// NEWS
// =========================

// =========================
// NEWS SYSTEM
// =========================

const newsGrid =
document.querySelector('.news-grid');

const climateButtons =
document.querySelectorAll('.climate-btn');

let currentNews = [];
let historicalNews = [];

// =========================
// HISTORICAL DATABASE
// =========================

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
// =========================
// FETCH NEWS
// =========================

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

        // FILTERS WORDS NEWS
        const blockedWords = [ 
            'election',
            'senate',
            'congress',
            'partylist',
            
            
            
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

// =========================
// GENERATE RELATED HISTORY
// =========================

// =========================
// GENERATE RELATED HISTORY
// STRICT 1:1 MATCHING
// =========================

function generateHistoricalNews(news) {

    historicalNews = [];

    news.forEach(article => {

        const type =
        detectDisasterType(article);

        // SKIP ARTICLES WITH NO MATCH
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

    // REMOVE DUPLICATES
    historicalNews = historicalNews.filter(
        (item, index, self) =>
            index === self.findIndex(
                t => t.title === item.title
            )
    );

    // IF NO HISTORY EXISTS
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

// =========================
// RENDER NEWS
// =========================

function renderNews(newsArray) {

    newsGrid.innerHTML = '';

    // =========================
    // REMOVE DUPLICATES
    // =========================

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

        // SKIP DUPLICATES

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

    // LIMIT TO 3

    newsArray = uniqueNews.slice(0,3);

    // =========================
    // NO HISTORICAL NEWS
    // =========================

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

    // =========================
    // NORMAL NEWS
    // =========================

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

        // =========================
        // DISABLE CLICK
        // =========================

        const isDisabled =
            !article.link ||
            article.link === '#';

        // =========================
        // IMAGE
        // =========================

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


// =========================
// NEWS GRID CLASS HANDLING
// =========================

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

// =========================
// CAROUSEL
// =========================

function setupCarousel(){

    const cards =
    document.querySelectorAll('.news-card');

    cards.forEach(card=>{

        card.addEventListener('click',e=>{

            // =========================
            // SINGLE CARD
            // =========================

            if(cards.length === 1){

                return;
            }

            // =========================
            // TWO CARDS
            // =========================

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

            // =========================
            // THREE CARDS
            // =========================

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

// =========================
// FALLBACK
// =========================

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

    // =========================
    // TYPHOON
    // =========================

    const typhoonWords = [
        'super typhoon',
        'typhoon',
        'tropical storm',
        'cyclone',
        'storm surge'
    ];

    // =========================
    // HEAT
    // =========================

    const heatWords = [
        'heat index',
        'heat wave',
        'extreme heat',
        'el niño',
        'high temperature'
    ];

    // =========================
    // FLOOD
    // =========================

    const floodWords = [
        'flood',
        'flooding',
        'heavy rainfall',
        'flash flood'
    ];

    // =========================
    // EARTHQUAKE
    // =========================

    const earthquakeWords = [
        'earthquake',
        'magnitude',
        'tectonic'
    ];

    // =========================
    // HELPER
    // =========================

    function hasKeyword(words){

        return words.some(word =>
            text.includes(word)
        );
    }

    // =========================
    // PRIORITY MATCHING
    // =========================

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

// =========================
// TOGGLE BUTTONS
// =========================

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

// =========================
// INIT
// =========================

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        hideAllSections();

        weatherWelcome.style.display =
        'flex';

        await loadShelterData();

        initializeMap();
    }
);