import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/solid';
import WeatherDisplay from './WeatherDisplay';
import ForecastDisplay from './ForecastDisplay';
import HourlyForecast from './HourlyForecast';
import ErrorBoundary from './ErrorBoundary';
import { useWeatherCache } from './useWeatherCache';
import axios from 'axios';

const App = () => {
  const [city, setCity] = useState('London');
  const [unit, setUnit] = useState('metric');
  const [darkMode, setDarkMode] = useState(false);
  const [showHourly, setShowHourly] = useState(false);
  const API_KEY = '29c28fde20c5890149ba1c904fc7ab4a'; // Replace with your actual API key

  const { cachedData, updateCache } = useWeatherCache();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
            );
            setCity(response.data.name);
          } catch (error) {
            console.error('Error fetching city name:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleCityChange = (newCity) => {
    setCity(newCity);
  };

  const toggleUnit = () => {
    setUnit(prevUnit => prevUnit === 'metric' ? 'imperial' : 'metric');
  };

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const toggleHourlyForecast = () => {
    setShowHourly(prev => !prev);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${darkMode ? 'from-gray-900 to-gray-800' : 'from-blue-100 to-blue-300'} transition-colors duration-500`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">Weather Forecast</h1>
          <div className="flex space-x-4">
            <button
              onClick={toggleUnit}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors duration-300"
            >
              {unit === 'metric' ? '°C' : '°F'}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-neutral-200 dark:bg-neutral-700 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-300"
            >
              {darkMode ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-neutral-600" />}
            </button>
          </div>
        </header>
        <main className="space-y-8">
          <ErrorBoundary>
            <WeatherDisplay city={city} onCityChange={handleCityChange} unit={unit} cachedData={cachedData} updateCache={updateCache} />
          </ErrorBoundary>
          <ErrorBoundary>
            <ForecastDisplay city={city} unit={unit} cachedData={cachedData} updateCache={updateCache} />
          </ErrorBoundary>
          <div className="flex justify-center">
            <button
              onClick={toggleHourlyForecast}
              className="px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors duration-300"
            >
              {showHourly ? 'Hide Hourly Forecast' : 'Show Hourly Forecast'}
            </button>
          </div>
          {showHourly && (
            <ErrorBoundary>
              <HourlyForecast city={city} unit={unit} cachedData={cachedData} updateCache={updateCache} />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;