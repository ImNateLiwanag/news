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

// =========================
// SHELTERS
// =========================

const shelterData = {

    manila: [

        {
            name: 'Manila Science High School',
            image: 'assets/shelters/manila.jpg'
        },

        {
            name: 'Rizal Park Evacuation Center',
            image: 'assets/shelters/rizal.jpg'
        },

        {
            name: 'Delpan Evacuation Center',
            image: 'assets/shelters/delp.jpg'
        },

        {
            name: 'Baseco Evacuation Center',
            image: 'assets/shelters/baseco.jpg'
        }
    ]
};

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

async function updateWeatherInfo(city){

    try{

        const weatherData =
        await getFetchData('weather', city);

        if(Number(weatherData.cod) !== 200){

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

        // WEATHER INFO

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
                weekday:'short',
                day:'2-digit',
                month:'short'
            }
        );

        // ICONS

        const icon =
        getWeatherIcon(id);

        weatherImg.src =
        `assets/weather/${icon}`;

        lottieWeather.src =
        `assets/weather/${icon}`;

        todayTxt.textContent =
        getTodayLabel(id);

        // UPDATE UI

        updateTipsSection(
            id,
            temp,
            name,
            main
        );

        try{

            fetchClimateNews(city);

        }catch(err){

            console.log(err);
        }

        try{

            await updateForecastsInfo(city);

        }catch(err){

            console.log(err);
        }

        // SHOW SECTIONS

        hideAllSections();

        weatherInput.style.display =
        'flex';

        weatherText.style.display =
        'flex';

        tipsSection.classList.add(
            'show'
        );

        newsSection.classList.add(
            'show'
        );

    }catch(error){

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

    } else if (id <= 232) {

        title = 'Thunderstorm Warning';

        description =
        'Thunderstorms may include lightning and strong winds.';

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
                title:'Unplug Items'
            }
        ];

    } else if (id <= 531) {

        title = 'Rainfall Advisory';

        description =
        'Rain may cause slippery roads and flooding.';

        alertColor = '#2563EB';

        tips = [

            {
                icon:'assets/tips/umbrella.png',
                title:'Bring Umbrella'
            },

            {
                icon:'assets/tips/flood.png',
                title:'Avoid Floods'
            },

            {
                icon:'assets/tips/car.png',
                title:'Drive Carefully'
            },

            {
                icon:'assets/tips/emergency-kit.png',
                title:'Emergency Supplies'
            }
        ];

    } else {

        title = 'Normal Weather Advisory';

        description =
        'Weather conditions are generally stable today.';

        alertColor = '#0EA5E9';

        tips = [

            {
                icon:'assets/tips/weather.png',
                title:'Monitor Forecast'
            },

            {
                icon:'assets/tips/water.png',
                title:'Stay Hydrated'
            },

            {
                icon:'assets/tips/smile.png',
                title:'Enjoy Safely'
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

        <li>

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
    // SHELTERS
    // =========================

    const shelterGrid =
document.querySelector('.shelter-grid');

if (!shelterGrid) return;

shelterGrid.innerHTML = '';

const cityShelters =
shelterData[city.toLowerCase()];

if (cityShelters) {

    cityShelters.forEach(shelter => {

        shelterGrid.innerHTML += `

            <div class="shelter-card">

                <img
                    src="${shelter.image}"
                    alt="${shelter.name}"
                >

                <div class="shelter-info">

                    <h3>
                        ${shelter.name}
                    </h3>

                </div>

            </div>

        `;
    });

} else {

    shelterGrid.innerHTML = `

        <div class="shelter-card">

            <div class="shelter-info">

                <h3>
                    No Shelter Data
                </h3>

                <p>
                    No shelters available
                    for this location.
                </p>

            </div>

        </div>
    `;
    }
}

// =========================
// FORECAST
// =========================

async function updateForecastsInfo(city) {

    const forecastData = await getFetchData('forecast', city);

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

    const query = `(${city} AND (disaster OR flood OR weather)) OR (Philippines AND disaster)`;

    const url = `https://newsdata.io/api/1/news?apikey=${newsDataKey}&language=en&q=${encodeURIComponent(query)}`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        if(!data.results || data.results.length === 0){
            renderFallback();
            return;
        }

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

    news.forEach(article => {
        const type = detectDisasterType(article) || 'typhoon';
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

    renderNews(currentActiveTab === 'current' ? currentNews : historicalNews);

    // LIMIT: Keep historical news length same as current news length
    historicalNews = historicalNews.slice(0, currentNews.length);

    // FALLBACK
    if (historicalNews.length === 0) {
        historicalDatabase.typhoon.forEach(item => {
            // Fill up to 3 or the currentNews length, whichever is smaller
            if (historicalNews.length < Math.max(1, currentNews.length) && !seenTitles.has(item.title)) {
                historicalNews.push(item);
                seenTitles.add(item.title);
            }
        });
    }
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

async function getFetchData(type, city){

    let url = '';

    if(type === 'weather'){

        url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    }else if(type === 'forecast'){

        url =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
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
    () => {

        hideAllSections();

        weatherWelcome.style.display =
        'flex';
    }
);
