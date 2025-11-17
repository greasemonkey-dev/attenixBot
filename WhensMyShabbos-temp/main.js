// MapTiler API Key - Replace with your own key from https://cloud.maptiler.com/
const MAPTILER_API_KEY = 'YOUR_MAPTILER_API_KEY_HERE';

// Initialize map
let map;
let userMarker;

// Initialize the application
async function init() {
    // Check if API key is set
    if (MAPTILER_API_KEY === 'YOUR_MAPTILER_API_KEY_HERE') {
        showError('Please set your MapTiler API key in main.js');
        return;
    }

    // Initialize map with default view
    map = new maptilersdk.Map({
        container: 'map',
        style: maptilersdk.MapStyle.STREETS,
        center: [-74.006, 40.7128], // Default to NYC
        zoom: 12,
        apiKey: MAPTILER_API_KEY
    });

    // Get user's location
    getUserLocation();

    // Add click event to map
    map.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        await updateShabbosInfo(lat, lng);
        updateMarker(lat, lng);
    });
}

// Get user's current location
function getUserLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Center map on user location
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 13
                });

                // Add marker and get Shabbos times
                updateMarker(latitude, longitude);
                await updateShabbosInfo(latitude, longitude);
            },
            (error) => {
                console.error('Error getting location:', error);
                showError('Unable to detect location. Please click on the map to select a location.');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser. Please click on the map to select a location.');
    }
}

// Update or create marker on map
function updateMarker(lat, lng) {
    if (userMarker) {
        userMarker.remove();
    }

    userMarker = new maptilersdk.Marker({ color: '#667eea' })
        .setLngLat([lng, lat])
        .addTo(map);
}

// Fetch and display Shabbos information
async function updateShabbosInfo(lat, lng) {
    showLoading();

    try {
        // Get location name using reverse geocoding
        const locationName = await getLocationName(lat, lng);

        // Get Shabbos times from HebCal API
        const shabbosData = await getShabbosTimesFromHebCal(lat, lng);

        // Display the information
        displayShabbosInfo(locationName, shabbosData);
    } catch (error) {
        console.error('Error fetching Shabbos info:', error);
        showError('Unable to fetch Shabbos times. Please try again.');
    }
}

// Get location name from coordinates using MapTiler geocoding
async function getLocationName(lat, lng) {
    try {
        const response = await fetch(
            `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_API_KEY}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            return data.features[0].place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
        console.error('Error getting location name:', error);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

// Get Shabbos times from HebCal API
async function getShabbosTimesFromHebCal(lat, lng) {
    const url = `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lng}&tzid=auto`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch Shabbos times');
    }

    const data = await response.json();

    // Parse the response
    let candleLighting = null;
    let havdalah = null;
    let parsha = null;
    let shabbosDate = null;

    data.items.forEach(item => {
        if (item.category === 'candles') {
            candleLighting = new Date(item.date);
        } else if (item.category === 'havdalah') {
            havdalah = new Date(item.date);
        } else if (item.category === 'parashat') {
            parsha = item.title;
            shabbosDate = new Date(item.date);
        }
    });

    return {
        candleLighting,
        havdalah,
        parsha,
        shabbosDate,
        location: data.location
    };
}

// Display Shabbos information
function displayShabbosInfo(locationName, shabbosData) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');

    const shabbosInfo = document.getElementById('shabbos-info');
    shabbosInfo.classList.remove('hidden');

    document.getElementById('location-name').textContent = locationName;

    if (shabbosData.candleLighting) {
        document.getElementById('candle-time').textContent = formatTime(shabbosData.candleLighting);
    } else {
        document.getElementById('candle-time').textContent = 'N/A';
    }

    if (shabbosData.havdalah) {
        document.getElementById('havdalah-time').textContent = formatTime(shabbosData.havdalah);
    } else {
        document.getElementById('havdalah-time').textContent = 'N/A';
    }

    if (shabbosData.parsha) {
        document.getElementById('parsha').textContent = shabbosData.parsha;
    } else {
        document.getElementById('parsha').textContent = 'N/A';
    }

    if (shabbosData.shabbosDate) {
        const dateStr = shabbosData.shabbosDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('shabbos-date').textContent = dateStr;
    } else {
        document.getElementById('shabbos-date').textContent = '';
    }
}

// Format time for display
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Show loading state
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('shabbos-info').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
}

// Show error message
function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('shabbos-info').classList.add('hidden');

    const errorElement = document.getElementById('error-message');
    errorElement.querySelector('p').textContent = message;
    errorElement.classList.remove('hidden');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
