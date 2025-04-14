# Background

After mastering JavaScript fundamentals, I built this terminal-based Node.js project to solidify my concepts and gain hands-on experience with the Node.js framework.

# Crypto Tracker CLI

A Node.js command-line application for tracking cryptocurrency prices and managing a watchlist of your favorite coins.

## Features

- 🔍 **Search Coins**: Find cryptocurrencies by name or symbol
- 📊 **Real-time Data**: Fetch current prices and market data
- 📋 **Watchlist**: Add coins to your personal watchlist
- 💾 **Persistent Storage**: Save your favorite coins between sessions
- 📈 **Price History**: View 7-day price trends
- 🔄 **Data Refresh**: Update prices on demand

## Installation

1. Clone this repository:
2. Install dependencies:
3. Run the application:

## Usage

The application provides a simple menu-driven interface:

1. **Search Coin**: Search for cryptocurrencies by name or symbol
2. **Add to Watchlist**: Add a coin to your watchlist using its ID (e.g., bitcoin, ethereum)
3. **View Watchlist**: Display all coins in your watchlist with current prices
4. **Remove from Watchlist**: Remove a coin from your watchlist
5. **View Coin Details**: See detailed information and price history for a coin
6. **Refresh Data**: Update price data for all coins in your watchlist
7. **Exit**: Close the application

## Data Sources

This application uses the CoinGecko API to fetch cryptocurrency data. No API key is required for basic usage.

## Project Structure

#### (I Appologize for the structure. I personally am a Flutter Mobile Developer and this was my very first progect using JS and NodeJS, which are actually web and backend frameworks respectively)

final-project-crypto-tracker/

├── configuration/

- └── env-variables.js

├── core/

- └── coin-tracking-logic.js

├── data/

- └── init-apis.js

- └── coin-model.js

├── utils/

- └── fav-coin-handler.js

- └── logger.js

- └── time-formatter.js

- └── utils.js

├── view/

- └── user-main-menu.js

├── fav_coins.json

├── main.js

└── README.md

## Dependencies

- Node.js (v14 or higher recommended)
- No external packages required - uses only built-in Node.js modules
