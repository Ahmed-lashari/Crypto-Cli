// basic structure of a coin that will be storing in favs, or displaying in search
export class CoinModel {
  constructor(
    id,
    symbol,
    name,
    currentPrice,
    marketCap,
    priceChangePercentage24h,
    lastUpdated = new Date().toISOString()
  ) {
    this.id = id;
    this.symbol = symbol.toUpperCase();
    this.name = name;
    this.currentPrice = currentPrice;
    this.marketCap = marketCap;
    this.priceChangePercentage24h = priceChangePercentage24h;
    this.lastUpdated = lastUpdated;
    this.isFavorite = false;
  }

  setFavorite(isFavorite) {
    this.isFavorite = isFavorite;
    return this;
  }

  getFormattedPrice() {
    return `$${this.currentPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })}`;
  }

  getFormattedMarketCap() {
    return `$${(this.marketCap / 1000000000).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}B`;
  }

  getFormattedPriceChange() {
    const prefix = this.priceChangePercentage24h >= 0 ? "+" : "";
    return `${prefix}${this.priceChangePercentage24h.toFixed(2)}%`;
  }

  toJSON() {
    return {
      id: this.id,
      symbol: this.symbol,
      name: this.name,
      currentPrice: this.currentPrice,
      marketCap: this.marketCap,
      priceChangePercentage24h: this.priceChangePercentage24h,
      lastUpdated: this.lastUpdated,
      isFavorite: this.isFavorite,
    };
  }

  static fromJSON(json) {
    const coin = new CoinModel(
      json.id,
      json.symbol,
      json.name,
      json.currentPrice,
      json.marketCap,
      json.priceChangePercentage24h,
      json.lastUpdated
    );
    coin.setFavorite(json.isFavorite || false);
    return coin;
  }
}
