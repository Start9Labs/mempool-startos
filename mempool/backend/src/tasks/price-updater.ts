import * as fs from 'fs';
import path from 'path';
import config from '../config';
import logger from '../logger';
import PricesRepository, { ApiPrice, MAX_PRICES } from '../repositories/PricesRepository';
import BitfinexApi from './price-feeds/bitfinex-api';
import BitflyerApi from './price-feeds/bitflyer-api';
import CoinbaseApi from './price-feeds/coinbase-api';
import GeminiApi from './price-feeds/gemini-api';
import KrakenApi from './price-feeds/kraken-api';

export interface PriceFeed {
  name: string;
  url: string;
  urlHist: string;
  currencies: string[];

  $fetchPrice(currency): Promise<number>;
  $fetchRecentPrice(currencies: string[], type: string): Promise<PriceHistory>;
}

export interface PriceHistory {
  [timestamp: number]: ApiPrice;
}

class PriceUpdater {
  public historyInserted = false;
  private lastRun = 0;
  private lastHistoricalRun = 0;
  private running = false;
  private feeds: PriceFeed[] = [];
  private currencies: string[] = ['USD', 'EUR', 'GBP', 'CAD', 'CHF', 'AUD', 'JPY'];
  private latestPrices: ApiPrice;
  private ratesChangedCallback: ((rates: ApiPrice) => void) | undefined;

  constructor() {
    this.latestPrices = this.getEmptyPricesObj();

    this.feeds.push(new BitflyerApi()); // Does not have historical endpoint
    this.feeds.push(new KrakenApi());
    this.feeds.push(new CoinbaseApi());
    this.feeds.push(new BitfinexApi());
    this.feeds.push(new GeminiApi());
  }

  public getLatestPrices(): ApiPrice {
    return this.latestPrices;
  }

  public getEmptyPricesObj(): ApiPrice {
    return {
      time: 0,
      USD: -1,
      EUR: -1,
      GBP: -1,
      CAD: -1,
      CHF: -1,
      AUD: -1,
      JPY: -1,
    };
  }

  public setRatesChangedCallback(fn: (rates: ApiPrice) => void): void {
    this.ratesChangedCallback = fn;
  }

  /**
   * We execute this function before the websocket initialization since
   * the websocket init is not done asyncronously
   */
  public async $initializeLatestPriceWithDb(): Promise<void> {
    this.latestPrices = await PricesRepository.$getLatestConversionRates();
  }

  public async $run(): Promise<void> {
    if (config.MEMPOOL.NETWORK === 'signet' || config.MEMPOOL.NETWORK === 'testnet') {
      // Coins have no value on testnet/signet, so we want to always show 0
      return;
    }

    if (this.running === true) {
      return;
    }
    this.running = true;

    if ((Math.round(new Date().getTime() / 1000) - this.lastHistoricalRun) > 3600 * 24) {
      // Once a day, look for missing prices (could happen due to network connectivity issues)
      this.historyInserted = false;
    }

    try {
      await this.$updatePrice();
      if (this.historyInserted === false && config.DATABASE.ENABLED === true) {
        await this.$insertHistoricalPrices();
      }
    } catch (e: any) {
      logger.err(`Cannot save BTC prices in db. Reason: ${e instanceof Error ? e.message : e}`, logger.tags.mining);
    }

    this.running = false;
  }

  /**
   * Fetch last BTC price from exchanges, average them, and save it in the database once every hour
   */
  private async $updatePrice(): Promise<void> {
    if (this.lastRun === 0 && config.DATABASE.ENABLED === true) {
      this.lastRun = await PricesRepository.$getLatestPriceTime();
    }

    if ((Math.round(new Date().getTime() / 1000) - this.lastRun) < 3600) {
      // Refresh only once every hour
      return;
    }

    const previousRun = this.lastRun;
    this.lastRun = new Date().getTime() / 1000;

    for (const currency of this.currencies) {
      let prices: number[] = [];

      for (const feed of this.feeds) {
        // Fetch prices from API which supports `currency`
        if (feed.currencies.includes(currency)) {
          try {
            const price = await feed.$fetchPrice(currency);
            if (price > -1 && price < MAX_PRICES[currency]) {
              prices.push(price);
            }
            logger.debug(`${feed.name} BTC/${currency} price: ${price}`, logger.tags.mining);
          } catch (e) {
            logger.debug(`Could not fetch BTC/${currency} price at ${feed.name}. Reason: ${(e instanceof Error ? e.message : e)}`, logger.tags.mining);
          }
        }
      }
      if (prices.length === 1) {
        logger.debug(`Only ${prices.length} feed available for BTC/${currency} price`, logger.tags.mining);
      }

      // Compute average price, non weighted
      prices = prices.filter(price => price > 0);
      if (prices.length === 0) {
        this.latestPrices[currency] = -1;
      } else {
        this.latestPrices[currency] = Math.round((prices.reduce((partialSum, a) => partialSum + a, 0)) / prices.length);
      }
    }

    logger.info(`Latest BTC fiat averaged price: ${JSON.stringify(this.latestPrices)}`);

    if (config.DATABASE.ENABLED === true) {
      // Save everything in db
      try {
        const p = 60 * 60 * 1000; // milliseconds in an hour
        const nowRounded = new Date(Math.round(new Date().getTime() / p) * p); // https://stackoverflow.com/a/28037042
        await PricesRepository.$savePrices(nowRounded.getTime() / 1000, this.latestPrices);
      } catch (e) {
        this.lastRun = previousRun + 5 * 60;
        logger.err(`Cannot save latest prices into db. Trying again in 5 minutes. Reason: ${(e instanceof Error ? e.message : e)}`);
      }
    }

    if (this.ratesChangedCallback) {
      this.ratesChangedCallback(this.latestPrices);
    }

    this.lastRun = new Date().getTime() / 1000;

    if (this.latestPrices.USD === -1) {
      this.latestPrices = await PricesRepository.$getLatestConversionRates();
    }
  }

  /**
   * Called once by the database migration to initialize historical prices data (weekly)
   * We use MtGox weekly price from July 19, 2010 to September 30, 2013
   * We use Kraken weekly price from October 3, 2013 up to last month
   * We use Kraken hourly price for the past month
   */
  private async $insertHistoricalPrices(): Promise<void> {
    const existingPriceTimes = await PricesRepository.$getPricesTimes();

    // Insert MtGox weekly prices
    const pricesJson: any[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'mtgox-weekly.json')).toString());
    const prices = this.getEmptyPricesObj();
    let insertedCount: number = 0;
    for (const price of pricesJson) {
      if (existingPriceTimes.includes(price['ct'])) {
        continue;
      }

      // From 1380758400 we will use Kraken price as it follows closely MtGox, but was not affected as much
      // by the MtGox exchange collapse a few months later
      if (price['ct'] > 1380758400) {
        break;
      }
      prices.USD = price['c'];
      await PricesRepository.$savePrices(price['ct'], prices);
      ++insertedCount;
    }
    if (insertedCount > 0) {
      logger.notice(`Inserted ${insertedCount} MtGox USD weekly price history into db`, logger.tags.mining);
    } else {
      logger.debug(`Inserted ${insertedCount} MtGox USD weekly price history into db`, logger.tags.mining);
    }

    // Insert Kraken weekly prices
    await new KrakenApi().$insertHistoricalPrice();

    // Insert missing recent hourly prices
    await this.$insertMissingRecentPrices('day');
    await this.$insertMissingRecentPrices('hour');

    this.historyInserted = true;
    this.lastHistoricalRun = new Date().getTime();
  }

  /**
   * Find missing hourly prices and insert them in the database
   * It has a limited backward range and it depends on which API are available
   */
  private async $insertMissingRecentPrices(type: 'hour' | 'day'): Promise<void> {
    const existingPriceTimes = await PricesRepository.$getPricesTimes();

    logger.info(`Fetching ${type === 'day' ? 'dai' : 'hour'}ly price history from exchanges and saving missing ones into the database`, logger.tags.mining);

    const historicalPrices: PriceHistory[] = [];

    // Fetch all historical hourly prices
    for (const feed of this.feeds) {
      try {
        historicalPrices.push(await feed.$fetchRecentPrice(this.currencies, type));
      } catch (e) {
        logger.err(`Cannot fetch hourly historical price from ${feed.name}. Ignoring this feed. Reason: ${e instanceof Error ? e.message : e}`, logger.tags.mining);
      }
    }

    // Group them by timestamp and currency, for example
    // grouped[123456789]['USD'] = [1, 2, 3, 4];
    const grouped = {};
    for (const historicalEntry of historicalPrices) {
      for (const time in historicalEntry) {
        if (existingPriceTimes.includes(parseInt(time, 10))) {
          continue;
        }

        if (grouped[time] === undefined) {
          grouped[time] = {
            USD: [], EUR: [], GBP: [], CAD: [], CHF: [], AUD: [], JPY: []
          };
        }

        for (const currency of this.currencies) {
          const price = historicalEntry[time][currency];
          if (price > -1 && price < MAX_PRICES[currency]) {
            grouped[time][currency].push(typeof price === 'string' ? parseInt(price, 10) : price);
          }
        }
      }
    }

    // Average prices and insert everything into the db
    let totalInserted = 0;
    for (const time in grouped) {
      const prices: ApiPrice = this.getEmptyPricesObj();
      for (const currency in grouped[time]) {
        if (grouped[time][currency].length === 0) {
          continue;
        }
        prices[currency] = Math.round((grouped[time][currency].reduce(
          (partialSum, a) => partialSum + a, 0)
        ) / grouped[time][currency].length);
      }
      await PricesRepository.$savePrices(parseInt(time, 10), prices);
      ++totalInserted;
    }

    if (totalInserted > 0) {
      logger.notice(`Inserted ${totalInserted} ${type === 'day' ? 'dai' : 'hour'}ly historical prices into the db`, logger.tags.mining);
    } else {
      logger.debug(`Inserted ${totalInserted} ${type === 'day' ? 'dai' : 'hour'}ly historical prices into the db`, logger.tags.mining);
    }
  }
}

export default new PriceUpdater();
