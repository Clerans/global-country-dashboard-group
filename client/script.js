console.log("PAGE ORIGIN:", window.location.origin);

console.log("SCRIPT VERSION 4 LOADED");

// CONFIG - fill these client-side values before running
const SERVER_BASE = 'http://localhost:5000';        // server root
const OPENWEATHERMAP_KEY = 'add the open weather app api key'; // get from openweathermap.org
const APP_API_KEY = 'SL_PROJECT_2025_SOC';  // must match server .env API_KEY
const GOOGLE_CLIENT_ID = '160639232948-bngjouv4lh8oduc6e8m2g35uot7skjch.apps.googleusercontent.com';
console.log("USING CLIENT ID:", GOOGLE_CLIENT_ID);
// State
let currentIdToken = null;
let lastAggregated = null;

// Initialize Google Sign-In button
window.onload = function () {
  /* global google */
  if (window.google && google.accounts) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse
    });
    google.accounts.id.renderButton(
      document.getElementById('gsi-button'),
      { theme: 'outline', size: 'large' }
    );
    
  } else {
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.innerText = 'Google Identity SDK failed to load.';
    }
  }

  document.getElementById('searchBtn').onclick = handleSearch;
  document.getElementById('saveBtn').onclick = handleSave;
};


  // response.credential is the id_token
function handleGoogleCredentialResponse(response) {
  console.log("GSI callback fired. Response:", response);

  // response.credential is the id_token
  currentIdToken = response.credential;
  document.getElementById('status').innerText = 'Signed in.';
  document.getElementById('saveBtn').disabled = false;
}



// Utility fetch wrapper – we use this only for core APIs where we want hard errors
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${txt}`);
  }
  return res.json();
}

async function handleSearch() {
  const q = document.getElementById('countryInput').value.trim();
  if (!q) {
    alert('Enter a country name.');
    return;
  }
  document.getElementById('status').innerText = 'Fetching data...';

  try {
    // 1) RestCountries
    const rc = await fetchJson(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fullText=false`
    );

    // Choose the best match:
    //  - first try exact common-name match (case-insensitive)
    //  - otherwise fall back to first result
    const lowerQ = q.toLowerCase();
    let countryData = rc[0];

    const exactCommon = rc.find(c =>
      c.name &&
      c.name.common &&
      c.name.common.toLowerCase() === lowerQ
    );

    if (exactCommon) {
      countryData = exactCommon;
    } else {
      // Optional: also try official name
      const exactOfficial = rc.find(c =>
        c.name &&
        c.name.official &&
        c.name.official.toLowerCase() === lowerQ
      );
      if (exactOfficial) {
        countryData = exactOfficial;
      }
    }

    const country      = countryData.name.common;
    const capital      = (countryData.capital && countryData.capital[0]) || '';
    const population   = countryData.population || 0;
    const currencyCode = countryData.currencies ? Object.keys(countryData.currencies)[0] : '';
    const flag         = countryData.flags && countryData.flags.svg ? countryData.flags.svg : '';

    console.log('Country chosen:', country);
    console.log('Capital from RestCountries:', capital);

    // 2) OpenWeatherMap – handle errors inside, never throw outside
    let weather = null;

    // Prefer capital coordinates; fallback to country coords
    const capitalLatLng = countryData.capitalInfo && countryData.capitalInfo.latlng
      ? countryData.capitalInfo.latlng
      : countryData.latlng || null;

    if (capitalLatLng && capitalLatLng.length === 2) {
      const [lat, lon] = capitalLatLng;
      console.log('Using coordinates for weather:', lat, lon);

      try {
        const resW = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_KEY}&units=metric`
        );

        const txtW = await resW.text();
        console.log("Weather raw response:", resW.status, txtW);

        if (resW.ok) {
          const w = JSON.parse(txtW);
          weather = {
            temp: w.main.temp,
            feels_like: w.main.feels_like,
            humidity: w.main.humidity,
            description: w.weather && w.weather[0] ? w.weather[0].description : ''
          };
        } else {
          console.warn('Weather API error (lat/lon), continuing without weather');
        }
      } catch (e) {
        console.warn('Weather fetch by coordinates failed, continuing without weather:', e.message);
      }
    } else if (capital) {
      console.log('No lat/lon found, falling back to capital name for weather:', capital);
      try {
        const resW = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(capital)}&appid=${OPENWEATHERMAP_KEY}&units=metric`
        );

        const txtW = await resW.text();
        console.log("Weather raw response (city):", resW.status, txtW);

        if (resW.ok) {
          const w = JSON.parse(txtW);
          weather = {
            temp: w.main.temp,
            feels_like: w.main.feels_like,
            humidity: w.main.humidity,
            description: w.weather && w.weather[0] ? w.weather[0].description : ''
          };
        } else {
          console.warn('Weather API error (city name), continuing without weather');
        }
      } catch (e) {
        console.warn('Weather fetch by city name failed, continuing without weather:', e.message);
      }
    } else {
      console.warn('No capital or coordinates available for weather.');
    }

    // 3) Disease.sh COVID API (country) – now soft-fail like weather
    let covid = null;
    try {
      const resCovid = await fetch(
        `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(country)}?strict=true`
      );
      const txtC = await resCovid.text();
      console.log("COVID raw response:", resCovid.status, txtC);

      if (resCovid.ok) {
        const covidRaw = JSON.parse(txtC);
        covid = {
          cases: covidRaw.cases,
          todayCases: covidRaw.todayCases,
          deaths: covidRaw.deaths,
          todayDeaths: covidRaw.todayDeaths,
          recovered: covidRaw.recovered,
          active: covidRaw.active,
          updated: covidRaw.updated
        };
      } else {
        console.warn('COVID API error, continuing without covid data');
      }
    } catch (e) {
      console.warn('COVID fetch failed, continuing without covid data:', e.message);
    }

    // 4) Aggregate
    const aggregated = {
      country,
      countryCode: (countryData.cca2 || ''),
      capital,
      population,
      currency: currencyCode,
      flag,
      weather,
      covid
    };
    lastAggregated = aggregated;

    // Display
    renderDashboard(aggregated);

    document.getElementById('status').innerText = 'Data fetched. You may save to server.';
  } catch (err) {
    console.error(err);
    document.getElementById('status').innerText = 'Error: ' + err.message;
  }
}

function renderDashboard(data) {
  document.getElementById('countryInfo').innerHTML = `
    <h3>${data.country} ${data.flag ? `<img src="${data.flag}" alt="flag" style="height:18px; vertical-align:middle;" />` : ''}</h3>
    <p><strong>Capital:</strong> ${data.capital}</p>
    <p><strong>Population:</strong> ${data.population.toLocaleString()}</p>
    <p><strong>Currency:</strong> ${data.currency}</p>
  `;

  document.getElementById('weatherInfo').innerHTML = data.weather ? `
    <h4>Weather in ${data.capital || data.country}</h4>
    <p><strong>Temp:</strong> ${data.weather.temp} °C</p>
    <p><strong>Feels like:</strong> ${data.weather.feels_like} °C</p>
    <p><strong>Humidity:</strong> ${data.weather.humidity}%</p>
    <p><strong>Condition:</strong> ${data.weather.description}</p>
  ` : '<h4>Weather</h4><p>No weather data</p>';

  document.getElementById('covidInfo').innerHTML = data.covid ? `
    <h4>COVID-19</h4>
    <p><strong>Cases:</strong> ${data.covid.cases.toLocaleString()}</p>
    <p><strong>Deaths:</strong> ${data.covid.deaths.toLocaleString()}</p>
    <p><strong>Recovered:</strong> ${data.covid.recovered.toLocaleString()}</p>
    <p><small>Last updated: ${new Date(data.covid.updated).toLocaleString()}</small></p>
  ` : '<h4>COVID-19</h4><p>No covid data</p>';
}

async function handleSave() {
  if (!lastAggregated) {
    alert('No aggregated data to save. Run a search first.');
    return;
  }
  if (!currentIdToken) {
    alert('You must sign in with Google first.');
    return;
  }

  document.getElementById('status').innerText = 'Saving to server...';
  try {
    const res = await fetch(`${SERVER_BASE}/api/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + currentIdToken,
        'x-api-key': APP_API_KEY
      },
      body: JSON.stringify(lastAggregated)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${txt}`);
    }
    const json = await res.json();
    document.getElementById('status').innerText = 'Saved: ' + (json.id || 'OK');
  } catch (err) {
    console.error(err);
    document.getElementById('status').innerText = 'Save error: ' + err.message;
  }
}
