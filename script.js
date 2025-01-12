// Replace 'YOUR_API_KEY' with a valid OpenWeather API key
const weatherAPIKey = '6fc382dc7a32c9af5c4fc8cd7c32d5e2';

// Backend Endpoint for RAG Pipeline (Mock URL for now)
const backendAPI = 'https://mock-backend-api.example.com/recommendations';

document.addEventListener('DOMContentLoaded', () => {
  setInterval(() => {
    const heartRate = Math.floor(Math.random() * (120 - 60) + 60); // Random BPM
    const steps = Math.floor(Math.random() * 5000);
    const spo2 = Math.floor(Math.random() * (100 - 90) + 90); // Random SpO2

    document.getElementById('heartRate').querySelector('span').textContent = heartRate;
    document.getElementById('steps').querySelector('span').textContent = steps;
    document.getElementById('spo2').querySelector('span').textContent = spo2;

    fetchExternalData(heartRate, steps, spo2);
  }, 3000);
});

function fetchExternalData(heartRate, steps, spo2) {
  const weatherAPI = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${weatherAPIKey}`;
  const airQualityAPI = `https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5074&lon=-0.1278&appid=${weatherAPIKey}`;

  document.getElementById('advice').textContent = 'Fetching recommendations...'; // Reset text

  Promise.all([
    fetch(weatherAPI).then(res => res.json()),
    fetch(airQualityAPI).then(res => res.json())
  ])
    .then(([weatherData, airQualityData]) => {
      const temperature = Math.round(weatherData.main.temp - 273.15); // Convert Kelvin to Celsius
      const weatherDescription = weatherData.weather[0].description;

      const airQualityIndex = airQualityData.list[0].main.aqi;
      let airQualityStatus = '';

      switch (airQualityIndex) {
        case 1:
          airQualityStatus = 'Good';
          break;
        case 2:
          airQualityStatus = 'Fair';
          break;
        case 3:
          airQualityStatus = 'Moderate';
          break;
        case 4:
          airQualityStatus = 'Poor';
          break;
        case 5:
          airQualityStatus = 'Very Poor';
          break;
        default:
          airQualityStatus = 'Unknown';
      }

      const healthRecommendations = generateRecommendations(
        heartRate,
        steps,
        spo2,
        temperature,
        weatherDescription,
        airQualityStatus
      );

      document.getElementById('advice').textContent = healthRecommendations;
    })
    .catch(error => {
      console.error('Error fetching external data:', error);
      document.getElementById('advice').textContent = 'Unable to fetch recommendations. Please try again later.';
    });
}

function generateRecommendations(heartRate, steps, spo2, temperature, weatherDescription, airQualityStatus) {
  let advice = `Based on current metrics:\n`;

  advice += `- Temperature: ${temperature}°C (${weatherDescription})\n`;
  advice += `- Air Quality: ${airQualityStatus}\n`;
  advice += `- Heart Rate: ${heartRate} BPM\n`;
  advice += `- SpO₂: ${spo2}%\n`;

  // Example recommendations
  if (heartRate > 100) {
    advice += '⚠️ Your heart rate is high. Consider resting or practicing deep breathing.\n';
  }

  if (spo2 < 92) {
    advice += '⚠️ Your oxygen saturation is low. Seek medical attention if symptoms persist.\n';
  }

  if (steps < 2000) {
    advice += '🚶 Keep moving! Aim for at least 5,000 steps a day to maintain your activity level.\n';
  }

  if (temperature > 30) {
    advice += '🌞 Stay hydrated and avoid prolonged exposure to the sun.\n';
  }

  if (airQualityStatus === 'Poor' || airQualityStatus === 'Very Poor') {
    advice += '😷 Air quality is not good. Avoid outdoor activities if possible.\n';
  }

  return advice;
}
