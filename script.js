const cityInput = document.getElementById('cityInput');
const stateInput = document.getElementById('stateInput');
const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');

// Mapping of Open-Meteo weather codes to human-readable descriptions
const weatherCodes = {
    0: { icon: '0.png', label: 'Clear sky' },
    1: { icon: '2.png', label: 'Mainly Clear' },
    2: { icon: '2.png', label: 'Partly cloudy' },
    3: { icon: '3.png', label: 'Overcast' },
    45: { icon: '0.png', label: 'Fog' },
    48: { icon: '0.png', label: 'Depositing rime fog' },
    51: { icon: '0.png', label: 'Light drizzle' },
    53: { icon: '0.png', label: 'Moderate drizzle' },
    55: { icon: '0.png', label: 'Dense drizzle' },
    56: { icon: '0.png', label: 'Light freezing drizzle' },
    57: { icon: '0.png', label: 'Dense freezing drizzle' },
    61: { icon: '61.png', label: 'Slight rain' },
    63: { icon: '61.png', label: 'Moderate rain' },
    65: { icon: '65.png', label: 'Heavy rain' },
    66: { icon: '65.png', label: 'Light freezing rain' },
    67: { icon: '65.png', label: 'Heavy freezing rain' },
    71: { icon: '71.png', label: 'Slight snow' },
    73: { icon: '73.png', label: 'Moderate snow' },
    75: { icon: '73.png', label: 'Heavy snow' },
    77: { icon: '73.png', label: 'Snow grains' },
  80: { icon: '73.png', label: 'Slight rain showers' },
  81: { icon: '73.png', label: 'Moderate rain showers' },
  82: { icon: '73.png', label: 'Violent rain showers' },
  85: { icon: '73.png', label: 'Slight snow showers' },
  86: { icon: '73.png', label: 'Heavy snow showers' },
    95: { icon: '95.png', label: 'Thunderstorm' },
    96: { icon: '95.png', label: 'Thunderstorm with slight hail' },
  99: { icon: '95.png', label: 'Thunderstorm with heavy hail' }
};

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    const state = stateInput.value.trim();
    if (city) {
        fetchCoordinates(city, state);
    }
});

function fetchCoordinates(city, state) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=US&count=1`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const { latitude, longitude, name, country, state: resultState } = data.results[0];
                const stateText = resultState ? `, ${resultState}` : '';
                locationElement.textContent = `${name}${stateText}, ${country}`;
                fetchWeather(latitude, longitude);
            } else {
                locationElement.textContent = 'Location not found';
                temperatureElement.textContent = '';
                descriptionElement.textContent = '';
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
        });
}

function fetchWeather(lat, lon) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&forecast_days=10&timezone=auto`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            // Current Weather
            const current = data.current_weather;
            temperatureElement.textContent = `${current.temperature}°F`;
            const currentCode = current.weathercode;
            const currentWeather = weatherCodes[currentCode] || { label: 'Unknown conditions', icon: 'unknown.png' };
            const iconUrl = `icons/${currentWeather.icon}`;

descriptionElement.innerHTML = `
  <img src="${iconUrl}" alt="${currentWeather.label}" class="weather-icon">
  ${currentWeather.label}
`;

            // 10-Day Forecast
            displayForecast(data.daily);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function displayForecast(daily) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '<h3>10-Day Forecast</h3><div class="forecast-grid"></div>';

    const grid = forecastContainer.querySelector('.forecast-grid');

    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const code = daily.weathercode[i];

        const weather = weatherCodes[code] || { icon: 'unknown.png', label: 'Unknown' };
        const iconUrl = `icons/${weather.icon}`;

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-day';
        forecastItem.innerHTML = `
            <div class="day">${dayName}</div>
            <img src="${iconUrl}" alt="${weather.label}" class="weather-icon">
            <div class="label">${weather.label}</div>
            <div class="temps">High: ${maxTemp}°F<br>Low: ${minTemp}°F</div>
        `;
        grid.appendChild(forecastItem);
    }
}
