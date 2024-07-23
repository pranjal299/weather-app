import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSpring, animated } from 'react-spring';

const ForecastDisplay = ({ city, unit, cachedData, updateCache }) => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_KEY = '29c28fde20c5890149ba1c904fc7ab4a'; // Replace with your actual API key

  const fadeIn = useSpring({
    opacity: forecastData ? 1 : 0,
    transform: forecastData ? 'translateY(0)' : 'translateY(20px)',
  });

  useEffect(() => {
    const fetchForecast = async () => {
      const cacheKey = `forecast_${city}_${unit}`;
      const cachedForecast = cachedData(cacheKey);
      
      if (cachedForecast) {
        setForecastData(cachedForecast);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`
        );
        const groupedData = response.data.list.reduce((acc, item) => {
          const date = new Date(item.dt * 1000).toDateString();
          if (!acc[date]) {
            acc[date] = item;
          }
          return acc;
        }, {});
        const processedData = Object.values(groupedData).slice(0, 5);
        setForecastData(processedData);
        updateCache(cacheKey, processedData);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
        setError('Failed to fetch forecast data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchForecast();
    }
  }, [city, unit, cachedData, updateCache]);

  if (error) return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">{error}</div>;
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div></div>;

  const tempUnit = unit === 'metric' ? '°C' : '°F';

  return (
    <animated.div style={fadeIn} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400">5-Day Forecast</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {forecastData.map((day, index) => (
          <div key={index} className="bg-neutral-100 dark:bg-gray-700 rounded-lg p-4 text-center">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</h3>
            <img 
              src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} 
              alt={day.weather[0].description}
              className="w-16 h-16 mx-auto"
            />
            <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{day.main.temp.toFixed(1)}{tempUnit}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">{day.weather[0].description}</p>
          </div>
        ))}
      </div>
    </animated.div>
  );
};

export default ForecastDisplay;