import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSpring, animated } from 'react-spring';

const HourlyForecast = ({ city, unit, cachedData, updateCache }) => {
  const [hourlyData, setHourlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_KEY = '29c28fde20c5890149ba1c904fc7ab4a'; // Replace with your actual API key

  const fadeIn = useSpring({
    opacity: hourlyData ? 1 : 0,
    transform: hourlyData ? 'translateY(0)' : 'translateY(20px)',
  });

  useEffect(() => {
    const fetchHourlyForecast = async () => {
      const cacheKey = `hourly_${city}_${unit}`;
      const cachedHourly = cachedData(cacheKey);
      
      if (cachedHourly) {
        setHourlyData(cachedHourly);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`
        );
        const hourlyForecast = response.data.list.slice(0, 24); // Get next 24 hours
        setHourlyData(hourlyForecast);
        updateCache(cacheKey, hourlyForecast);
      } catch (error) {
        console.error('Error fetching hourly forecast data:', error);
        setError('Failed to fetch hourly forecast data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchHourlyForecast();
    }
  }, [city, unit, cachedData, updateCache]);

  if (error) return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">{error}</div>;
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div></div>;

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windSpeedUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <animated.div style={fadeIn} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400">Hourly Forecast</h2>
      <div className="flex space-x-4 pb-4">
        {hourlyData.map((hour, index) => (
          <div key={index} className="flex-shrink-0 w-32 bg-neutral-100 dark:bg-gray-700 rounded-lg p-4 text-center">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
            <img 
              src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}.png`} 
              alt={hour.weather[0].description}
              className="w-12 h-12 mx-auto"
            />
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-200">{hour.main.temp.toFixed(1)}{tempUnit}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">{hour.weather[0].description}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Wind: {hour.wind.speed} {windSpeedUnit}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Humidity: {hour.main.humidity}%</p>
          </div>
        ))}
      </div>
    </animated.div>
  );
};

export default HourlyForecast;