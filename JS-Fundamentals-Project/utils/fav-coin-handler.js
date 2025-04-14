import * as fs from "fs/promises";
import { FAVORITE_COINS_PATH } from "../configuration/env-variables.js";
import { log, logError } from "./logger.js";
import { CoinModel } from "../data/coin-model.js";

// Ensure directory exists
async function ensureDirectoryExists() {
  try {
    const dir = FAVORITE_COINS_PATH.substring(
      0,
      FAVORITE_COINS_PATH.lastIndexOf("/")
    );
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    logError("Error creating directory:", error);
  }
}

// Save favorite coins to JSON file
export async function saveFavoriteCoins(coins) {
  try {
    await ensureDirectoryExists();

    const coinsToSave = Array.isArray(coins) ? coins : [coins];

    await fs.writeFile(
      FAVORITE_COINS_PATH,
      JSON.stringify(coinsToSave, null, 2),
      "utf8"
    );

    log(`Saved ${coinsToSave.length} favorite coins`);
    return true;
  } catch (error) {
    logError("Failed to save favorite coins:", error);
    return false;
  }
}

// Load favorite coins from JSON file
export async function loadFavoriteCoins() {
  try {
    await ensureDirectoryExists();

    const data = await fs.readFile(FAVORITE_COINS_PATH, "utf8");
    const coins = JSON.parse(data);

    // If the file exists but is empty, return an empty array
    if (!Array.isArray(coins)) {
      return [];
    }

    // Convert plain objects to CoinModel instances
    const coinModels = coins.map((coin) => {
      if (typeof coin === "string") {
        return coin; // If it's just the coin ID
      }
      return CoinModel.fromJSON(coin);
    });

    log(`Loaded ${coinModels.length} favorite coins`);
    return coinModels;
  } catch (error) {
    // If the file doesn't exist yet, return an empty array
    if (error.code === "ENOENT") {
      await saveFavoriteCoins([]);
      return [];
    }

    logError("Failed to load favorite coins:", error);
    return [];
  }
}

// Check if a coin is in the favorites
async function isInFavorites(coinId) {
  try {
    const favorites = await loadFavoriteCoins();
    return favorites.some((coin) => {
      return typeof coin === "string" ? coin === coinId : coin.id === coinId;
    });
  } catch (error) {
    logError("Failed to check if coin is in favorites:", error);
    return false;
  }
}
