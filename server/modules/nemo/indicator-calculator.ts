/**
 * Technical Indicator Calculator for Neufin Nemo
 * Computes various technical indicators based on price data
 */

type PriceData = {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/**
 * Calculate Relative Strength Index (RSI)
 * @param prices - Array of price data sorted by date (oldest first)
 * @param period - Period for RSI calculation (typically 14)
 * @returns RSI values corresponding to the input prices
 */
export function calculateRSI(prices: PriceData[], period: number = 14): number[] {
  if (prices.length < period + 1) {
    return [];
  }
  
  // Calculate price changes
  const priceChanges = [];
  for (let i = 1; i < prices.length; i++) {
    priceChanges.push(prices[i].close - prices[i - 1].close);
  }
  
  // Calculate gains and losses
  const gains = priceChanges.map(change => (change > 0 ? change : 0));
  const losses = priceChanges.map(change => (change < 0 ? Math.abs(change) : 0));
  
  // Initialize averages
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
  
  // Calculate RSI values
  const rsiValues = [];
  for (let i = period; i < prices.length; i++) {
    if (i > period) {
      // Smooth averages
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
    }
    
    // Calculate RS and RSI
    const rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    const rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
  }
  
  return rsiValues;
}

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * @param prices - Array of price data sorted by date (oldest first)
 * @param fastPeriod - Fast EMA period (typically 12)
 * @param slowPeriod - Slow EMA period (typically 26)
 * @param signalPeriod - Signal line period (typically 9)
 * @returns MACD line, signal line, and histogram values
 */
export function calculateMACD(
  prices: PriceData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[], signal: number[], histogram: number[] } {
  if (prices.length < slowPeriod + signalPeriod) {
    return { macd: [], signal: [], histogram: [] };
  }
  
  // Calculate EMAs
  const closePrices = prices.map(p => p.close);
  const fastEMA = calculateEMA(closePrices, fastPeriod);
  const slowEMA = calculateEMA(closePrices, slowPeriod);
  
  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: number[] = [];
  for (let i = 0; i < fastEMA.length; i++) {
    if (i >= slowPeriod - fastPeriod) {
      macdLine.push(fastEMA[i] - slowEMA[i - (slowPeriod - fastPeriod)]);
    }
  }
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  // Calculate histogram (MACD line - signal line)
  const histogram: number[] = [];
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + (macdLine.length - signalLine.length)] - signalLine[i]);
  }
  
  return {
    macd: macdLine.slice(-signalLine.length),
    signal: signalLine,
    histogram
  };
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param data - Array of price values
 * @param period - Period for EMA calculation
 * @returns EMA values
 */
export function calculateEMA(data: number[], period: number): number[] {
  if (data.length < period) {
    return [];
  }
  
  // Calculate simple moving average (SMA) for first EMA value
  const sma = data.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
  // Calculate multiplier
  const multiplier = 2 / (period + 1);
  
  // Calculate EMA values
  const emaValues = [sma];
  for (let i = period; i < data.length; i++) {
    const ema = (data[i] - emaValues[emaValues.length - 1]) * multiplier + emaValues[emaValues.length - 1];
    emaValues.push(ema);
  }
  
  return emaValues;
}

/**
 * Calculate Simple Moving Average (SMA)
 * @param data - Array of price values
 * @param period - Period for SMA calculation
 * @returns SMA values
 */
export function calculateSMA(data: number[], period: number): number[] {
  if (data.length < period) {
    return [];
  }
  
  const smaValues = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
    smaValues.push(sum / period);
  }
  
  return smaValues;
}

/**
 * Calculate Bollinger Bands
 * @param prices - Array of price data sorted by date (oldest first)
 * @param period - Period for calculation (typically 20)
 * @param stdDev - Number of standard deviations (typically 2)
 * @returns Upper band, middle band (SMA), and lower band values
 */
export function calculateBollingerBands(
  prices: PriceData[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[], middle: number[], lower: number[] } {
  if (prices.length < period) {
    return { upper: [], middle: [], lower: [] };
  }
  
  const closePrices = prices.map(p => p.close);
  const middle = calculateSMA(closePrices, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = closePrices.slice(i - period + 1, i + 1);
    const middleValue = middle[i - (period - 1)];
    const sum = slice.reduce((sum, price) => sum + Math.pow(price - middleValue, 2), 0);
    const standardDeviation = Math.sqrt(sum / period);
    
    upper.push(middleValue + (standardDeviation * stdDev));
    lower.push(middleValue - (standardDeviation * stdDev));
  }
  
  return { upper, middle, lower };
}

/**
 * Calculate momentum
 * @param prices - Array of price data sorted by date (oldest first)
 * @param period - Period for momentum calculation (typically 10)
 * @returns Momentum values
 */
export function calculateMomentum(prices: PriceData[], period: number = 10): number[] {
  if (prices.length <= period) {
    return [];
  }
  
  const momentum: number[] = [];
  for (let i = period; i < prices.length; i++) {
    momentum.push(prices[i].close - prices[i - period].close);
  }
  
  return momentum;
}

/**
 * Calculate volatility (as standard deviation of returns)
 * @param prices - Array of price data sorted by date (oldest first)
 * @param period - Period for volatility calculation (typically 20)
 * @returns Volatility values
 */
export function calculateVolatility(prices: PriceData[], period: number = 20): number[] {
  if (prices.length < period + 1) {
    return [];
  }
  
  // Calculate percentage returns
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i].close / prices[i - 1].close) - 1);
  }
  
  // Calculate rolling standard deviation of returns
  const volatility: number[] = [];
  for (let i = period; i < returns.length; i++) {
    const slice = returns.slice(i - period, i);
    const mean = slice.reduce((sum, ret) => sum + ret, 0) / period;
    const sum = slice.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0);
    const standardDeviation = Math.sqrt(sum / period);
    volatility.push(standardDeviation);
  }
  
  return volatility;
}

/**
 * Find support and resistance levels
 * @param prices - Array of price data sorted by date (oldest first)
 * @param lookback - Number of days to look back
 * @param threshold - Minimum price change to consider a new level
 * @returns Support and resistance levels
 */
export function findSupportResistanceLevels(
  prices: PriceData[],
  lookback: number = 30,
  threshold: number = 0.02
): { support: number[], resistance: number[] } {
  if (prices.length < lookback) {
    return { support: [], resistance: [] };
  }
  
  const priceRange = prices.slice(-lookback);
  const levels: { price: number, count: number, type: 'support' | 'resistance' }[] = [];
  
  // Find pivot points
  for (let i = 1; i < priceRange.length - 1; i++) {
    // Potential support (local minimum)
    if (priceRange[i].low < priceRange[i-1].low && priceRange[i].low < priceRange[i+1].low) {
      addLevel(levels, priceRange[i].low, 'support', threshold);
    }
    
    // Potential resistance (local maximum)
    if (priceRange[i].high > priceRange[i-1].high && priceRange[i].high > priceRange[i+1].high) {
      addLevel(levels, priceRange[i].high, 'resistance', threshold);
    }
  }
  
  // Sort and filter levels based on frequency
  const sortedLevels = levels.sort((a, b) => b.count - a.count);
  const support = sortedLevels.filter(level => level.type === 'support').map(level => level.price);
  const resistance = sortedLevels.filter(level => level.type === 'resistance').map(level => level.price);
  
  return { support, resistance };
}

/**
 * Helper function to add a price level or increment its count if already exists
 */
function addLevel(
  levels: { price: number, count: number, type: 'support' | 'resistance' }[],
  price: number,
  type: 'support' | 'resistance',
  threshold: number
): void {
  // Check if there's a similar price level already
  for (const level of levels) {
    const priceDiff = Math.abs(level.price - price) / price;
    if (priceDiff < threshold && level.type === type) {
      level.count++;
      return;
    }
  }
  
  // Add new level
  levels.push({ price, count: 1, type });
}

/**
 * Calculate breakout detection
 * @param prices - Array of price data sorted by date (oldest first)
 * @param period - Period for calculation
 * @param threshold - Percentage threshold for breakout detection
 * @returns Breakout signals (1 for upward, -1 for downward, 0 for none)
 */
export function detectBreakouts(
  prices: PriceData[],
  period: number = 20,
  threshold: number = 0.03
): { signals: number[], strength: number[] } {
  if (prices.length < period + 1) {
    return { signals: [], strength: [] };
  }
  
  const signals: number[] = [];
  const strength: number[] = [];
  
  // Get Bollinger Bands
  const { upper, lower } = calculateBollingerBands(prices, period, 2);
  
  // Detect breakouts based on price crossing Bollinger Bands with increased volume
  for (let i = 0; i < upper.length; i++) {
    const priceIndex = i + period - 1;
    const price = prices[priceIndex];
    
    // Calculate volume increase
    const avgVolume = prices.slice(priceIndex - period + 1, priceIndex).reduce((sum, p) => sum + p.volume, 0) / period;
    const volumeIncrease = price.volume / avgVolume;
    
    // Detect upward breakout
    if (price.close > upper[i] && price.close > prices[priceIndex - 1].close * (1 + threshold)) {
      signals.push(1);
      strength.push(volumeIncrease);
    }
    // Detect downward breakout
    else if (price.close < lower[i] && price.close < prices[priceIndex - 1].close * (1 - threshold)) {
      signals.push(-1);
      strength.push(volumeIncrease);
    }
    // No breakout
    else {
      signals.push(0);
      strength.push(0);
    }
  }
  
  return { signals, strength };
}

/**
 * Analyze price data to compute all indicators
 * @param prices - Array of price data sorted by date (oldest first)
 * @returns All computed indicators
 */
export function analyzeStockData(prices: PriceData[]): {
  rsi: number[];
  macd: { macd: number[], signal: number[], histogram: number[] };
  ema20: number[];
  ema50: number[];
  ema200: number[];
  sma20: number[];
  sma50: number[];
  sma200: number[];
  bollingerBands: { upper: number[], middle: number[], lower: number[] };
  momentum: number[];
  volatility: number[];
  supportResistance: { support: number[], resistance: number[] };
  breakouts: { signals: number[], strength: number[] };
} {
  const closePrices = prices.map(p => p.close);
  
  return {
    rsi: calculateRSI(prices),
    macd: calculateMACD(prices),
    ema20: calculateEMA(closePrices, 20),
    ema50: calculateEMA(closePrices, 50),
    ema200: calculateEMA(closePrices, 200),
    sma20: calculateSMA(closePrices, 20),
    sma50: calculateSMA(closePrices, 50),
    sma200: calculateSMA(closePrices, 200),
    bollingerBands: calculateBollingerBands(prices),
    momentum: calculateMomentum(prices),
    volatility: calculateVolatility(prices),
    supportResistance: findSupportResistanceLevels(prices),
    breakouts: detectBreakouts(prices)
  };
}