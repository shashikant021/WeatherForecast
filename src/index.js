const API_KEY = "72e3ad9ab4c8272e73f8fe0223483b84";
const searchBtn = document.querySelector(".search-btn");
const cityInput = document.querySelector(".city-input");
const currentWeatherCard = document.querySelector(".current-weather-cards");
const forecastCards = document.querySelector(".weather-cards");
const useCurrentLocationBtn = document.querySelector(
  ".use-current-location-btn"
);
const recentCitiesDropdown = document.createElement("select");
recentCitiesDropdown.classList.add("recent-cities-dropdown");

// Append the dropdown to the search section
const searchSection = document.querySelector(".search-list");
searchSection.appendChild(recentCitiesDropdown);

// Initialize recent cities list (from local storage)
let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
updateDropdown();

// Function to fetch weather data for a city
async function fetchWeatherData(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    if (response.ok) {
      displayCurrentWeather(data);
      fetchForecastData(data.coord.lat, data.coord.lon);
      updateRecentCities(city); // Update the recent cities list
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please try again.");
  }
}

// Function to fetch forecast data using coordinates
async function fetchForecastData(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    if (response.ok) {
      displayForecast(data);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    alert("Failed to fetch forecast data. Please try again.");
  }
}

// Display current weather
function displayCurrentWeather(data) {
  const { name, main, wind, weather, dt } = data;
  const date = new Date(dt * 1000).toLocaleDateString();

  currentWeatherCard.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-semibold">${name} (${date})</h2>
                <p class="text-lg">Temperature: ${main.temp}°C</p>
                <p>Wind: ${wind.speed} M/S</p>
                <p>Humidity: ${main.humidity}%</p>
            </div>
            <div>
                <img class='h-30' src="https://openweathermap.org/img/wn/${weather[0].icon}@4x.png" alt="${weather[0].description}" />
            </div>
        </div>
    `;
}

// Display 5-day forecast
function displayForecast(data) {
  forecastCards.innerHTML = "";
  const dailyData = {};

  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(item);
  });

  const days = Object.keys(dailyData).slice(0, 5);
  days.forEach((date) => {
    const dayData = dailyData[date][0];
    const { main, wind, weather } = dayData;

    forecastCards.innerHTML += `
            <div class="bg-gray-500 text-white rounded-lg shadow-sm text-center pt-6 pb-6">
                <p class="text-lg font-semibold">(${date})</p>
                <img class=" h-20  inline-block" src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}" />
                <p>Temp: ${main.temp}°C</p>
                <p>Wind: ${wind.speed} M/S</p>
                <p>Humidity: ${main.humidity}%</p>
            </div>
        `;
  });
}

// Add a city to the recent cities list
function updateRecentCities(city) {
  if (!recentCities.includes(city)) {
    recentCities.unshift(city);
    if (recentCities.length > 5) {
      recentCities.pop(); // Limit to 5 cities
    }
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    updateDropdown();
  }
}

// Update the dropdown menu with recent cities
function updateDropdown() {
  recentCitiesDropdown.innerHTML =
    '<option value="" disabled selected>Recently Searched Cities</option>';
  recentCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
}

// Event listener for dropdown selection
recentCitiesDropdown.addEventListener("change", (event) => {
  const city = event.target.value;
  if (city) {
    fetchWeatherData(city);
  }
});

// Event listener for the "Search" button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherData(city);
    cityInput.value = "";
  } else {
    alert("Please enter a city name.");
  }
});

// Event listener for "Use Current Location" button
useCurrentLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchForecastData(latitude, longitude);
        fetchWeatherDataByCoordinates(latitude, longitude);
      },
      () => {
        alert(
          "Unable to retrieve your location. Please enable location services."
        );
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// Fetch weather data using coordinates
async function fetchWeatherDataByCoordinates(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    if (response.ok) {
      displayCurrentWeather(data);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error fetching weather data by coordinates:", error);
    alert("Failed to fetch weather data by coordinates. Please try again.");
  }
}
