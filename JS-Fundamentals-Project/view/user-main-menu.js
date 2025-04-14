// user intrerface in terminal
import {
  clearScreen,
  askQuestion,
  colorize,
  closeReadline,
  formatCurrency,
  formatLargeNumber,
} from "../utils/utils.js";

import { log, logSuccess, logError, logWarn, colors } from "../utils/logger.js";

import { CoinTrackingManager } from "../core/coin-tracking-logic.js";
import { formatTime } from "../utils/time-formatter.js";

const coinTracker = new CoinTrackingManager();
// Main menu options
const MENU_OPTIONS = {
  SEARCH: "1",
  ADD: "2",
  VIEW: "3",
  REMOVE: "4",
  DETAILS: "5",
  REFRESH: "6",
  EXIT: "7",
};

// Display a coin in the terminal
function displayCoin(coin, index) {
  const priceColor =
    coin.priceChangePercentage24h >= 0 ? colors.green : colors.red;
  const priceChange = coin.priceChangePercentage24h; //.toFixed(2)
  const priceChangeDisplay = colorize(
    `${priceChange >= 0 ? "+" : ""}${priceChange}%`,
    priceColor
  );

  console.log(
    `${index !== undefined ? `${index + 1}. ` : ""}${colorize(
      coin.name,
      colors.cyan
    )} (${colorize(coin.symbol, colors.yellow)})`
  );
  console.log(
    `   Price: ${colorize(formatCurrency(coin.currentPrice), colors.white)}`
  );
  console.log(`   24h Change: ${priceChangeDisplay}`);
  console.log(`   Market Cap: ${formatLargeNumber(coin.marketCap)}`);
  console.log(`   Last updated: ${formatTime(coin.lastUpdated)}`);
  console.log();
}

// Display watchlist
async function displayWatchlist() {
  clearScreen();
  console.log(colorize("=== YOUR WATCHLIST ===", colors.cyan));

  const { coins, lastUpdated } = await coinTracker.getWatchlist();

  if (coins.length === 0) {
    console.log(
      colorize(
        "Your watchlist is empty. Add some coins to track!",
        colors.yellow
      )
    );
  } else {
    coins.forEach((coin, index) => {
      displayCoin(coin, index);
    });
    console.log(colorize(`Last updated: ${lastUpdated}`, colors.dim));
  }

  console.log();
  return coins;
}

// Search for coins
async function searchCoins() {
  clearScreen();
  console.log(colorize("=== SEARCH COINS ===", colors.cyan));

  const query = await askQuestion("Enter coin name or symbol to search: ");

  if (!query) {
    logWarn("Search query cannot be empty");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  }

  console.log(`Searching for "${query}"...`);
  const results = await coinTracker.searchCoin(query);

  clearScreen();
  console.log(colorize(`=== SEARCH RESULTS FOR "${query}" ===`, colors.cyan));

  if (results.length === 0) {
    console.log(
      colorize("No coins found matching your search.", colors.yellow)
    );
  } else {
    results.forEach((coin, index) => {
      displayCoin(coin, index);
    });

    // Allow adding a coin from search results
    const selection = await askQuestion(
      "Enter the number of a coin to add to watchlist (or press Enter to return): "
    );

    if (selection && !isNaN(parseInt(selection))) {
      const index = parseInt(selection) - 1;

      if (index >= 0 && index < results.length) {
        const result = await coinTracker.addToWatchlist(results[index].id);

        if (result.success) {
          logSuccess(result.message);
        } else {
          logWarn(result.message);
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        logWarn("Invalid selection");
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  console.log();
}

// Add coin to watchlist
async function addToWatchlist() {
  clearScreen();
  console.log(colorize("=== ADD TO WATCHLIST ===", colors.cyan));

  const coinId = await askQuestion("Enter coin ID (e.g., bitcoin, ethereum): ");

  if (!coinId) {
    logWarn("Coin ID cannot be empty");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  }

  console.log(`Adding ${coinId} to watchlist...`);
  const result = await coinTracker.addToWatchlist(coinId);

  if (result.success) {
    logSuccess(result.message);
    if (result.coin) {
      displayCoin(result.coin);
    }
  } else {
    logWarn(result.message);
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
}

// Remove coin from watchlist
async function removeFromWatchlist() {
  const coins = await displayWatchlist();

  if (coins.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  }

  const selection = await askQuestion(
    "Enter the number of a coin to remove (or press Enter to cancel): "
  );

  if (selection && !isNaN(parseInt(selection))) {
    const index = parseInt(selection) - 1;

    if (index >= 0 && index < coins.length) {
      const result = await coinTracker.removeFromWatchlist(coins[index].id);

      if (result.success) {
        logSuccess(result.message);
      } else {
        logWarn(result.message);
      }
    } else {
      logWarn("Invalid selection");
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));
}

// Display the main menu
export async function displayMainMenu() {
  let running = true;

  await coinTracker.initializeCoinTrackerApp();

  while (running) {
    clearScreen();
    console.log(
      colorize("======================================", colors.blue)
    );
    console.log(colorize("       CRYPTO TRACKER CLI", colors.cyan));
    console.log(
      colorize("======================================", colors.blue)
    );
    console.log();
    console.log(`${colorize("1", colors.yellow)}: Search Coin`);
    console.log(`${colorize("2", colors.yellow)}: Add to Watchlist`);
    console.log(`${colorize("3", colors.yellow)}: View Watchlist`);
    console.log(`${colorize("4", colors.yellow)}: Remove from Watchlist`);
    console.log(`${colorize("5", colors.yellow)}: View Coin Details`);
    console.log(`${colorize("6", colors.yellow)}: Refresh Data`);
    console.log(`${colorize("7", colors.yellow)}: Exit`);
    console.log();

    const choice = await askQuestion("Enter your choice: ");

    switch (choice) {
      case MENU_OPTIONS.SEARCH:
        await searchCoins();
        break;
      case MENU_OPTIONS.ADD:
        await addToWatchlist();
        break;
      case MENU_OPTIONS.VIEW:
        await displayWatchlist();
        await askQuestion("Press Enter to return to main menu...");
        break;
      case MENU_OPTIONS.REMOVE:
        await removeFromWatchlist();
        // await remove;
        break;
      case MENU_OPTIONS.DETAILS:
        await viewCoinDetails();
        break;
      case MENU_OPTIONS.REFRESH:
        await refreshData();
        break;
      case MENU_OPTIONS.EXIT:
        console.log(
          colorize(
            "Thank you for using Crypto Tracker CLI. Goodbye!",
            colors.green
          )
        );
        running = false;
        closeReadline();
        break;
      default:
        logWarn("Invalid choice. Please try again.");
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}

// View detailed information about a coin
async function viewCoinDetails() {
  const coins = await displayWatchlist();

  if (coins.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  }

  const selection = await askQuestion(
    "Enter the number of a coin to view details (or press Enter to cancel): "
  );

  if (selection && !isNaN(parseInt(selection))) {
    const index = parseInt(selection) - 1;

    if (index >= 0 && index < coins.length) {
      const selectedCoin = coins[index];

      clearScreen();
      console.log(
        colorize(`=== DETAILED INFO: ${selectedCoin.name} ===`, colors.cyan)
      );

      // Display basic info
      displayCoin(selectedCoin);

      console.log(colorize("Fetching price history...", colors.dim));

      // Get coin history (7 days)
      const historyResult = await coinTracker.getCoinHistory(
        selectedCoin.id,
        7
      );

      if (
        historyResult.success &&
        historyResult.data &&
        historyResult.data.prices
      ) {
        // Display simple ASCII chart of price movement
        const prices = historyResult.data.prices.map((p) => p[1]);
        displaySimpleChart(prices, selectedCoin.name);
      } else {
        console.log(
          colorize("Price history data not available.", colors.yellow)
        );
      }
    } else {
      logWarn("Invalid selection");
    }
  }

  await askQuestion("Press Enter to return to the main menu...");
}

// Refresh watchlist data
async function refreshData() {
  clearScreen();
  console.log(colorize("Refreshing data...", colors.cyan));

  await coinTracker.updateWatchlistData();
  logSuccess("Data refreshed successfully!");

  await new Promise((resolve) => setTimeout(resolve, 1500));
}

// Display a simple ASCII chart
function displaySimpleChart(data, title) {
  if (!data || data.length === 0) return;

  const width = 50; // Chart width
  const height = 10; // Chart height

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  // Avoid division by zero
  if (range === 0) {
    console.log(
      colorize("Price has not changed during this period.", colors.yellow)
    );
    return;
  }

  console.log(colorize(`\n7-Day Price Chart for ${title}`, colors.cyan));
  console.log(colorize(`Max: ${formatCurrency(max)}`, colors.green));
  console.log(colorize(`Min: ${formatCurrency(min)}`, colors.red));
  console.log(
    colorize(
      `Change: ${(((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(
        2
      )}%`,
      data[data.length - 1] >= data[0] ? colors.green : colors.red
    )
  );
  console.log();

  // Create a 2D grid for the chart
  const chart = Array(height)
    .fill()
    .map(() => Array(width).fill(" "));

  // Plot the data points
  for (let i = 0; i < data.length; i++) {
    const x = Math.floor((i / (data.length - 1)) * (width - 1));
    const y = Math.floor(height - 1 - ((data[i] - min) / range) * (height - 1));

    if (y >= 0 && y < height && x >= 0 && x < width) {
      chart[y][x] = "•";
    }
  }

  // Connect the dots with lines (simple algorithm)
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = Math.floor((i / (data.length - 1)) * (width - 1));
    const y1 = Math.floor(
      height - 1 - ((data[i] - min) / range) * (height - 1)
    );
    const x2 = Math.floor(((i + 1) / (data.length - 1)) * (width - 1));
    const y2 = Math.floor(
      height - 1 - ((data[i + 1] - min) / range) * (height - 1)
    );

    // Draw a simple line between points
    if (x1 !== x2) {
      const slope = (y2 - y1) / (x2 - x1);
      for (let x = x1 + 1; x < x2; x++) {
        const y = Math.floor(y1 + slope * (x - x1));
        if (y >= 0 && y < height && x >= 0 && x < width) {
          chart[y][x] = "·";
        }
      }
    }
  }

  // Print the chart
  const chartColor =
    data[data.length - 1] >= data[0] ? colors.green : colors.red;
  console.log(colorize("┌" + "─".repeat(width) + "┐", colors.dim));
  for (let y = 0; y < height; y++) {
    console.log(
      colorize("│", colors.dim) +
        colorize(chart[y].join(""), chartColor) +
        colorize("│", colors.dim)
    );
  }
  console.log(colorize("└" + "─".repeat(width) + "┘", colors.dim));
  console.log(
    colorize(" 7 days ago", colors.dim) +
      " ".repeat(width - 21) +
      colorize("Today ", colors.dim)
  );
  console.log();
}
