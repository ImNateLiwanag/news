// =========================
// ELEMENTS
// =========================

const cityInput = document.querySelector('.city-input');
const welcomeSearchBtn = document.querySelector('.welcome-search-btn');
const searchBtn = document.querySelector('.search-btn');
const countryInput = document.querySelector('.country-input');

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

    city = city.toLowerCase();

    // =========================
    // LUZON
    // =========================

    const luzonKeywords = [

        'manila',
        'quezon',
        'makati',
        'pasig',
        'taguig',
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
        'pampanga',
        'ilocos',
        'cavite',
        'laguna',
        'rizal',
        'bicol'
    ];

    // =========================
    // VISAYAS
    // =========================

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

    // =========================
    // MINDANAO
    // =========================

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

    // =========================
    // CHECK MATCHES
    // =========================

    if(
        luzonKeywords.some(keyword =>
            city.includes(keyword)
        )
    ){
        return 'luzon';
    }

    if(
        visayasKeywords.some(keyword =>
            city.includes(keyword)
        )
    ){
        return 'visayas';
    }

    if(
        mindanaoKeywords.some(keyword =>
            city.includes(keyword)
        )
    ){
        return 'mindanao';
    }

    // DEFAULT

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

async function updateShelterMap(city){

    // ENSURE MAP EXISTS

    if(!mapInitialized){

        initializeMap();
    }

    if(!map) return;

    // CLEAR OLD MARKERS

    clearShelterMarkers();

    // =========================
    // GET CITY COORDINATES
    // =========================

    let cityLat = 12.8797;
    let cityLng = 121.7740;

    try {

    const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city},PH&limit=5&appid=${apiKey}`
    );

    const geoData =
        await geoResponse.json();

    // FIND PHILIPPINE MATCH

    const phLocation =
        geoData.find(
            location =>
                location.country === 'PH'
        );

    if (phLocation) {

        cityLat = phLocation.lat;
        cityLng = phLocation.lon;

    } else {

        showErrorState();
        return;
    }

} catch (error) {

    console.log(
        'Geocoding failed',
        error
    );
}

    // =========================
    // DETECT REGION
    // =========================

    const region =
    detectRegion(city);

    const cityShelters =
    shelterData[region];

    // =========================
    // NO DATA
    // =========================

    if(
        !cityShelters ||
        cityShelters.length === 0
    ){

        map.setView(
            [cityLat, cityLng],
            9
        );

        refreshMap();

        return;
    }

    // =========================
    // CREATE MARKERS
    // =========================

    cityShelters.forEach(shelter => {

        if(
            shelter.lat == null ||
            shelter.lng == null
        ){
            return;
        }

        const coords = [
            parseFloat(shelter.lat),
            parseFloat(shelter.lng)
        ];

        const marker =
        L.marker(coords).addTo(map);

        const distance =
Math.sqrt(
    Math.pow(coords[0] - cityLat, 2) +
    Math.pow(coords[1] - cityLng, 2)
);

if(distance < 1){

    marker.setIcon(
        L.icon({
            iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',

            shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',

            iconSize:[25,41],
            iconAnchor:[12,41],
            popupAnchor:[1,-34],
            shadowSize:[41,41]
        })
    );
}

        // POPUP

        marker.bindPopup(`
 <div class="map-popup">
   <h3 class="highlight-location">
      ${city.toUpperCase()}
   </h3>

   <p>${shelter.name || 'Evacuation Center'}</p>
 </div>
`);

        // =========================
        // CLICK TO ZOOM
        // =========================

        marker.on('click', () => {

            map.setView(coords, 16, {

                animate:true,
                duration:1.5
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
            11,
            {
                animate:true,
                duration:1.5
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
    fetchClimateNews(location);

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

        conditionTxt.textContent =
            main;

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
                icon:'assets/tips/wt.jpg',
                title:'Drink Water'
            },

            {
                icon:'assets/tips/sc.jpg',
                title:'Wear Sunscreen'
            },

            {
                icon:'assets/tips/ben.jpg',
                title:'Light Clothing'
            },

            {
                icon:'assets/tips/um.jpg',
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
                icon:'assets/tips/home.png',
                title:'Stay Indoors'
            },

            {
                icon:'assets/tips/warning.png',
                title:'Avoid Open Areas'
            },

            {
                icon:'assets/tips/battery.png',
                title:'Charge Devices'
            },

            {
                icon:'assets/tips/electric.png',
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
                icon:'assets/tips/umbrella.png',
                title:'Bring Umbrella'
            },

            {
                icon:'assets/tips/shoes.png',
                title:'Wear Non-Slip Shoes'
            },

            {
                icon:'assets/tips/car.png',
                title:'Drive Carefully'
            },

            {
                icon:'assets/tips/raincoat.png',
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
                icon:'assets/tips/umbrella.png',
                title:'Bring Umbrella'
            },

            {
                icon:'assets/tips/flood.png',
                title:'Avoid Flood Areas'
            },

            {
                icon:'assets/tips/emergency-kit.png',
                title:'Prepare Emergency Kit'
            },

            {
                icon:'assets/tips/car.png',
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
                icon:'assets/tips/jacket.png',
                title:'Wear Thick Clothing'
            },

            {
                icon:'assets/tips/home.png',
                title:'Stay Warm Indoors'
            },

            {
                icon:'assets/tips/road.png',
                title:'Avoid Slippery Roads'
            },

            {
                icon:'assets/tips/flashlight.png',
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
                icon:'assets/tips/car-light.png',
                title:'Use Headlights'
            },

            {
                icon:'assets/tips/car.png',
                title:'Drive Slowly'
            },

            {
                icon:'assets/tips/map.png',
                title:'Monitor Navigation'
            },

            {
                icon:'assets/tips/home.png',
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
                icon:'assets/tips/weather.png',
                title:'Enjoy Outdoor Activities'
            },

            {
                icon:'assets/tips/water.png',
                title:'Stay Hydrated'
            },

            {
                icon:'assets/tips/sun.png',
                title:'Use Sun Protection'
            },

            {
                icon:'assets/tips/smile.png',
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
                icon:'assets/tips/weather.png',
                title:'Monitor Forecast'
            },

            {
                icon:'assets/tips/jacket.png',
                title:'Bring Light Jacket'
            },

            {
                icon:'assets/tips/umbrella.png',
                title:'Carry Umbrella'
            },

            {
                icon:'assets/tips/smile.png',
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
        query = `${city} AND ${sdg13Keywords}`;
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
            'president',
            'congress',
            'partylist',
            'vice president',
            'governor',
            'mayor'
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
            const titleKey = article.title.trim().toLowerCase();
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

function generateHistoricalNews(news) {
    historicalNews = [];
    const seenTitles = new Set(); // PREVENTS DUPLICATES
    const articles = news.length > 0 ? news : [{title: "General Weather", description: "monitoring"}];

    let firstDetectedType = null;

    news.forEach(article => {
        const type = detectDisasterType(article);
        if (!type) return;

        // PICK ONLY ONE RELATED HISTORY

        const related = historicalDatabase[type];

        // CHECKS FOR DUPLICATES
        if (related) {
            const uniqueItem = related.find(item => !seenTitles.has(item.title));
            
            if (uniqueItem) {
                historicalNews.push(uniqueItem);
                seenTitles.add(uniqueItem.title);
            }
        }
    });

    if (firstDetectedType && historicalNews.length > 0 && historicalNews.length < 3) {
        const primaryRelated = historicalDatabase[firstDetectedType];
        
        if (primaryRelated) {
            primaryRelated.forEach(item => {
                if (historicalNews.length < 3 && !seenTitles.has(item.title)) {
                    historicalNews.push(item);
                    seenTitles.add(item.title);
                }
            });
        }
    }

    // FALLBACK
    if (historicalNews.length === 0) {
        historicalDatabase.typhoon.forEach(item => {
            // Fill up to 3 or the currentNews length, whichever is smaller
            if (historicalNews.length < 3 && !seenTitles.has(item.title)) {
                historicalNews.push(item);
                seenTitles.add(item.title);
            }
        });
    }

    historicalNews = historicalNews.slice(0, 3);

    renderNews(currentActiveTab === 'current' ? currentNews : historicalNews);
}

// =========================
// RENDER NEWS
// =========================

function renderNews(newsArray) {
    newsGrid.innerHTML = '';

    newsArray.forEach((article, index) => {
        let position = '';

        if (newsArray.length === 1) {
            position = 'center';
        } else if (newsArray.length === 2) {
            position = index === 0 ? 'left' : 'right';
        } else {
            if (index === 0) position = 'left';
            if (index === 1) position = 'center';
            if (index === 2) position = 'right';
        }

        newsGrid.innerHTML += `
            <a href="${article.link || '#'}" target="_blank" class="news-card ${position}">
                <div class="news-image-wrapper">
                    ${
                        (article.image_url || article.image)
                            ? `
                    <img src="${article.image_url || article.image}" alt="${article.title}" 
                         onerror="this.style.display='none'; this.parentElement.querySelector('.no-image-box').style.display='flex';">
                    `
                            : ''
                    }
                    <div class="no-image-box" style="display:${
                        (article.image_url || article.image) ? 'none' : 'flex'
                    };">
                        <img src="assets/icons/no-image.png" class="no-image">
                        <span>No Image Available</span>
                    </div>
                </div>
                <div class="news-content">
                    <h2>${article.title}</h2>
                    <p>${
                        article.description
                            ? article.description.substring(0, 120)
                            : 'Climate-related disaster.'
                    }</p>
                    <div class="news-read">READ FULL STORY</div>
                </div>
            </a>
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

            e.preventDefault();

            if(card.classList.contains('right')){

                rotateRight();

            }else if(card.classList.contains('left')){

                rotateLeft();

            }else{

                window.open(card.href,'_blank');
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
