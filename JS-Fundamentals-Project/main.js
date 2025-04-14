// main.js
import { displayMainMenu } from "./view/user-main-menu.js";
import { initializeAPIs } from "./data/init-apis.js";
import { loadFavoriteCoins } from "./utils/fav-coin-handler.js";
import { log, logError } from "./utils/logger.js";
import { CoinTrackingManager } from "./core/coin-tracking-logic.js";

async function startApplication() {
  try {
    log("Starting Crypto Tracker CLI...");

    // Initialize API connections
    const apiInitialized = await initializeAPIs();
    if (!apiInitialized) {
      logError(
        "Failed to initialize API connection. Please check your internet connection and try again."
      );
      process.exit(1);
    }

    // Initialize coin tracker
    const coinManager = new CoinTrackingManager();
    await coinManager.initializeCoinTrackerApp();

    // Display the main menu
    await displayMainMenu();
  } catch (error) {
    logError("Application error:", error);
    process.exit(1);
  }
}

// Start the application
startApplication();
