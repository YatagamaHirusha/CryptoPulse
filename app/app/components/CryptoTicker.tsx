'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AssetData {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  type: 'crypto' | 'stock';
}

export default function CryptoTicker() {
  const [assets, setAssets] = useState<AssetData[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch cryptocurrencies
        const cryptoRes = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,ripple,cardano,polkadot,dogecoin,litecoin,chainlink,avalanche-2&order=market_cap_desc&per_page=10&page=1&sparkline=false'
        );
        const cryptoData = await cryptoRes.json();
        
        // Format crypto data
        const formattedCrypto: AssetData[] = cryptoData.map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          type: 'crypto'
        }));

        // Fetch stock data from a free API (using finnhub or similar)
        // For now, we'll use mock stock data, or you can integrate with a real stock API
        const stockData: AssetData[] = [
          {
            id: 'aapl',
            symbol: 'AAPL',
            current_price: 238.50,
            price_change_percentage_24h: 1.25,
            type: 'stock'
          },
          {
            id: 'googl',
            symbol: 'GOOGL',
            current_price: 194.80,
            price_change_percentage_24h: -0.45,
            type: 'stock'
          },
          {
            id: 'msft',
            symbol: 'MSFT',
            current_price: 445.60,
            price_change_percentage_24h: 2.10,
            type: 'stock'
          },
          {
            id: 'tsla',
            symbol: 'TSLA',
            current_price: 345.20,
            price_change_percentage_24h: 3.50,
            type: 'stock'
          },
          {
            id: 'nvda',
            symbol: 'NVDA',
            current_price: 142.30,
            price_change_percentage_24h: -1.80,
            type: 'stock'
          }
        ];

        // Combine and shuffle assets for a better ticker experience
        const allAssets = [...formattedCrypto, ...stockData];
        setAssets(allAssets);
      } catch (error) {
        console.error('Failed to fetch prices', error);
      }
    };

    fetchPrices();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  if (assets.length === 0) return null;

  // Duplicate assets to create a seamless loop
  const tickerItems = [...assets, ...assets];

  return (
    <div className="hidden md:block bg-slate-50 dark:bg-zinc-900 text-black dark:text-white text-xs py-1 overflow-hidden whitespace-nowrap transition-colors duration-300">
      <div className="inline-flex animate-marquee space-x-8 px-4 w-max">
        {tickerItems.map((asset, index) => (
          <div key={`${asset.id}-${index}`} className="flex items-center space-x-2">
            <span className="font-bold uppercase flex items-center">
              <span className={asset.type === 'stock' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}>
                {asset.type}
              </span>
              <span className="mx-1 text-slate-300 dark:text-zinc-600">|</span>
              <span className="text-slate-500 dark:text-zinc-400">{asset.symbol}</span>
            </span>
            <span className="font-medium">${asset.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span
              className={`flex items-center ${
                asset.price_change_percentage_24h >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {asset.price_change_percentage_24h >= 0 ? (
                <TrendingUp size={12} className="mr-1" />
              ) : (
                <TrendingDown size={12} className="mr-1" />
              )}
              {asset.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
