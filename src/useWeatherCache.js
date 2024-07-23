import { useState } from 'react';

export const useWeatherCache = () => {
  const [cachedData, setCachedData] = useState({});

  const updateCache = (key, data) => {
    setCachedData(prevCache => ({
      ...prevCache,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  };

  const getCachedData = (key) => {
    const cachedItem = cachedData[key];
    if (cachedItem && Date.now() - cachedItem.timestamp < 5 * 60 * 1000) { // 5 minutes cache
      return cachedItem.data;
    }
    return null;
  };

  return { cachedData: getCachedData, updateCache };
};