// this file contains all the functions being performed on the coins (CRUD Operations)
import { fetchCoinData, searchCoins } from "../data/init-apis.js";
import {
  saveFavoriteCoins,
  loadFavoriteCoins,
} from "../utils/fav-coin-handler.js";
import { log, logError } from "../utils/logger.js";
import { formatTime } from "../utils/time-formatter.js";
import { CoinModel } from "../data/coin-model.js";

export class CoinTrackingManager {
  constructor() {
    this.watchlist = new Set();
    this.lastUpdated = null;
    this.currentPrices = {};
  }

  async initializeCoinTrackerApp() {
    try {
      const favorites = await loadFavoriteCoins();
      if (favorites && favorites.length > 0) {
        favorites.forEach((coin) => this.watchlist.add(coin.id));
        log(`Loaded ${favorites.length} favorite coins`);
      }
      return true;
    } catch (error) {
      logError("Failed to initialize coin tracking:", error);
      return false;
    }
  }

  async searchCoin(query) {
    try {
      const results = await searchCoins(query);
      return results.map(
        (coin) =>
          new CoinModel(
            coin.id,
            coin.symbol,
            coin.name,
            coin.current_price,
            coin.market_cap,
            coin.price_change_percentage_24h
          )
      );
    } catch (error) {
      logError(`Error searching for coin "${query}":`, error);
      return [];
    }
  }

  async addToWatchlist(coinId) {
    if (this.watchlist.has(coinId)) {
      return { success: false, message: "Coin already in watchlist" };
    }

    try {
      const coinData = await fetchCoinData(coinId);
      if (!coinData) {
        return { success: false, message: "Coin not found" };
      }

      this.watchlist.add(coinId);
      await this.updateWatchlistData();
      await saveFavoriteCoins(Array.from(this.watchlist));

      return {
        success: true,
        message: `Added ${coinData.name} to watchlist`,
        coin: coinData,
      };
    } catch (error) {
      logError(`Failed to add coin ${coinId} to watchlist:`, error);
      return { success: false, message: "Failed to add coin to watchlist" };
    }
  }

  async removeFromWatchlist(coinId) {
    if (!this.watchlist.has(coinId)) {
      return { success: false, message: "Coin not in watchlist" };
    }

    this.watchlist.delete(coinId);
    await saveFavoriteCoins(Array.from(this.watchlist));

    return { success: true, message: "Removed coin from watchlist" };
  }

  async updateWatchlistData() {
    if (this.watchlist.size === 0) {
      return [];
    }

    try {
      const coinIds = Array.from(this.watchlist);
      const coinsData = await Promise.all(
        coinIds.map((id) => fetchCoinData(id))
      );

      this.lastUpdated = new Date();

      // Filter out any null results and map to coin models
      const validCoinsData = coinsData.filter((coin) => coin !== null);

      // Update current prices
      validCoinsData.forEach((coin) => {
        this.currentPrices[coin.id] = coin.current_price;
      });

      return validCoinsData;
    } catch (error) {
      logError("Failed to update watchlist data:", error);
      return [];
    }
  }

  async getWatchlist() {
    const watchlistData = await this.updateWatchlistData();
    return {
      coins: watchlistData,
      lastUpdated: formatTime(this.lastUpdated),
    };
  }

  async getCoinHistory(coinId, days = 7) {
    try {
      if (!this.watchlist.has(coinId)) {
        return { success: false, message: "Coin not in watchlist" };
      }

      const historyData = await fetchCoinData(coinId, days);
      if (!historyData || !historyData.prices) {
        return { success: false, message: "Failed to fetch history data" };
      }

      return {
        success: true,
        data: historyData,
        coin: coinId,
      };
    } catch (error) {
      logError(`Failed to get history for coin ${coinId}:`, error);
      return { success: false, message: "Failed to fetch coin history" };
    }
  }
}
