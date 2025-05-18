import React, { useState } from 'react';
import { Search, X, Thermometer, Wind, Droplets, Sun } from 'lucide-react';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  windSpeed: number;
  humidity: number;
  feelsLike: number;
}

function App() {
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const fetchWeatherData = async (cityName: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();
      
      return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        humidity: data.main.humidity,
        feelsLike: Math.round(data.main.feels_like)
      };
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch weather data');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    const weatherInfo = await fetchWeatherData(city.trim());
    if (weatherInfo) {
      if (!weatherData.some(w => w.city.toLowerCase() === weatherInfo.city.toLowerCase())) {
        setWeatherData(prev => [...prev, weatherInfo]);
      } else {
        setError('City already added');
      }
      setCity('');
    }
  };

  const removeCity = (cityToRemove: string) => {
    setWeatherData(weatherData.filter(w => w.city !== cityToRemove));
  };

  const getWeatherIcon = (iconCode: string) => {
    const isDay = iconCode.includes('d');
    const code = iconCode.slice(0, -1);
    
    switch (code) {
      case '01': return '☀️';
      case '02': return '⛅';
      case '03': case '04': return '☁️';
      case '09': case '10': return '🌧️';
      case '11': return '⛈️';
      case '13': return '❄️';
      case '50': return '🌫️';
      default: return '☀️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-12">
          <Sun className="w-12 h-12 text-yellow-300" />
          <h1 className="text-5xl font-bold text-white">Weather Dashboard</h1>
        </div>

        <form onSubmit={handleSubmit} className="mb-12 flex justify-center gap-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            className="px-6 py-3 rounded-full border-2 border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:border-white/40 w-80 text-lg"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            {loading ? 'Loading...' : 'Add City'}
          </button>
        </form>
        {error && <p className="text-center text-red-200 mb-8">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {weatherData.map((weather) => (
            <div
              key={weather.city}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-white relative group hover:transform hover:scale-105 transition-all duration-200"
            >
              <button
                onClick={() => removeCity(weather.city)}
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X className="w-6 h-6 text-white/70 hover:text-white" />
              </button>

              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{weather.city}</h2>
                  <p className="text-xl text-white/80 capitalize">{weather.description}</p>
                </div>
                <span className="text-4xl">{getWeatherIcon(weather.icon)}</span>
              </div>

              <div className="space-y-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl font-bold">{weather.temperature}°C</span>
                  <span className="text-white/80">Feels like: {weather.feelsLike}°C</span>
                </div>
                
                <div className="flex gap-8 text-lg">
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-blue-200" />
                    <span>{weather.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-200" />
                    <span>{weather.humidity}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;