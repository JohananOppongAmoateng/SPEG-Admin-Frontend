import { useState, useEffect } from 'react';


export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState<{
    EUR_GHS: number | null,
    loading: boolean,
    error: string | null
  }>({
    EUR_GHS: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Use your preferred currency API here
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        const data = await response.json();
        setExchangeRate({
          EUR_GHS: data.rates.GHS,
          loading: false,
          error: null
        });
      } catch (error) {
        setExchangeRate({
          EUR_GHS: null,
          loading: false,
          error: 'Failed to fetch exchange rate'
        });
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
    
    // Refresh rate every hour
    const intervalId = setInterval(fetchExchangeRate, 3600000);
    
    return () => clearInterval(intervalId);
  }, []);

  return exchangeRate;
};
