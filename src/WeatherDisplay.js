import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchIcon } from '@heroicons/react/solid';
import { useSpring, animated } from 'react-spring';

const WeatherDisplay = ({ city, onCityChange, unit, cachedData, updateCache }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [inputCity, setInputCity] = useState(city);
  const [loading, setLoading] = useState(true);
  const API_KEY = '29c28fde20c5890149ba1c904fc7ab4a'; // Replace with your actual API key

  const fadeIn = useSpring({
    opacity: weatherData ? 1 : 0,
    transform: weatherData ? 'translateY(0)' : 'translateY(20px)',
  });

  useEffect(() => {
    const fetchWeather = async () => {
      const cacheKey = `weather_${city}_${unit}`;
      const cachedWeather = cachedData(cacheKey);
      
      if (cachedWeather) {
        setWeatherData(cachedWeather);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
        );
        setWeatherData(response.data);
        updateCache(cacheKey, response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError('Failed to fetch weather data. Please try again.');
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, unit, cachedData, updateCache]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCityChange(inputCity);
  };

  if (error) return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">{error}</div>;
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div></div>;

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windSpeedUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <animated.div style={fadeIn} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-3xl font-bold mb-4 text-primary-600 dark:text-primary-400">{weatherData.name}</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
            alt={weatherData.weather[0].description}
            className="w-24 h-24"
          />
          <div className="ml-4">
            <p className="text-5xl font-bold text-neutral-800 dark:text-neutral-200">{weatherData.main.temp.toFixed(1)}{tempUnit}</p>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 capitalize">{weatherData.weather[0].description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-neutral-600 dark:text-neutral-400">Humidity: {weatherData.main.humidity}%</p>
          <p className="text-neutral-600 dark:text-neutral-400">Wind: {weatherData.wind.speed} {windSpeedUnit}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 flex">
        <input 
          type="text" 
          value={inputCity} 
          onChange={(e) => setInputCity(e.target.value)} 
          placeholder="Enter city name"
          className="flex-grow px-4 py-2 rounded-l-md border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
        <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-r-md hover:bg-primary-600 transition-colors duration-300">
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>
    </animated.div>
  );
};

export default WeatherDisplay;