// api related stuff
import { get } from "https";
import { COINGECKO_API_URL } from "../configuration/env-variables.js";
import { log, logError } from "../utils/logger.js";

// Helper function to make API requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(
              new Error(
                `API request failed with status code ${res.statusCode}: ${data}`
              )
            );
          }
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}`));
        }
      });
    }).on("error", (error) => {
      reject(new Error(`API request error: ${error.message}`));
    });
  });
}

// Initialize APIs
export async function initializeAPIs() {
  try {
    // Test the API connection
    await makeRequest(`${COINGECKO_API_URL}/ping`);
    log("Successfully connected to CoinGecko API");
    return true;
  } catch (error) {
    logError("Failed to initialize API connection:", error);
    return false;
  }
}

// Fetch data for a specific coin
export async function fetchCoinData(coinId) {
  try {
    const data = await makeRequest(
      `${COINGECKO_API_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );

    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      current_price: data.market_data.current_price.usd,
      market_cap: data.market_data.market_cap.usd,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      last_updated: data.last_updated,
    };
  } catch (error) {
    logError(`Failed to fetch data for coin ${coinId}:`, error);
    return null;
  }
}

// Search for coins by query
export async function searchCoins(query) {
  try {
    const data = await makeRequest(
      `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`
    );

    if (!data.coins || data.coins.length === 0) {
      return [];
    }

    // Get more detailed data for the top results
    const topResults = data.coins.slice(0, 5);
    const detailedData = await Promise.all(
      topResults.map((coin) => fetchCoinData(coin.id))
    );

    return detailedData.filter((coin) => coin !== null);
  } catch (error) {
    logError(`Failed to search for coins with query "${query}":`, error);
    return [];
  }
}

// Get historical data for a coin
export async function getCoinHistory(coinId, days = 7) {
  try {
    const data = await makeRequest(
      `${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );

    return data;
  } catch (error) {
    logError(`Failed to fetch history for coin ${coinId}:`, error);
    return null;
  }
}
