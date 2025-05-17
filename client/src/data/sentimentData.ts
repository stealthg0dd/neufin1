/**
 * Mock data for Neufin Sentient module
 * Used for development and testing of sentiment visualization components
 */

export const sentimentData = {
  // Overall market sentiment data
  overview: {
    timeRange: '1W',
    timestamp: new Date(),
    overall: {
      score: 62,
      status: 'positive',
      change: 3.5
    },
    sectors: {
      Technology: {
        score: 67,
        status: 'positive',
        change: 2.1
      },
      Finance: {
        score: 42,
        status: 'neutral',
        change: -5.3
      },
      Healthcare: {
        score: 71,
        status: 'positive',
        change: 4.8
      },
      'Consumer Discretionary': {
        score: 58,
        status: 'neutral',
        change: 0.2
      },
      Energy: {
        score: 39,
        status: 'negative',
        change: -7.6
      },
      'Market Index': {
        score: 64,
        status: 'positive',
        change: 3.4
      }
    }
  },
  
  // Symbol-specific sentiment data
  symbols: {
    SPY: {
      symbol: 'SPY',
      timeRange: '1W',
      trend: {
        direction: 'upward',
        magnitude: 'medium',
        change: 5.2
      },
      data: [
        { timestamp: '2023-05-16T10:00:00', sentimentScore: 64, status: 'positive', source: 'news' },
        { timestamp: '2023-05-15T10:00:00', sentimentScore: 62, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-14T10:00:00', sentimentScore: 59, status: 'neutral', source: 'news' },
        { timestamp: '2023-05-13T10:00:00', sentimentScore: 60, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-12T10:00:00', sentimentScore: 57, status: 'neutral', source: 'news' },
        { timestamp: '2023-05-11T10:00:00', sentimentScore: 55, status: 'neutral', source: 'twitter' },
        { timestamp: '2023-05-10T10:00:00', sentimentScore: 52, status: 'neutral', source: 'news' }
      ]
    },
    QQQ: {
      symbol: 'QQQ',
      timeRange: '1W',
      trend: {
        direction: 'upward',
        magnitude: 'high',
        change: 8.7
      },
      data: [
        { timestamp: '2023-05-16T10:00:00', sentimentScore: 72, status: 'positive', source: 'news' },
        { timestamp: '2023-05-15T10:00:00', sentimentScore: 68, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-14T10:00:00', sentimentScore: 65, status: 'positive', source: 'news' },
        { timestamp: '2023-05-13T10:00:00', sentimentScore: 62, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-12T10:00:00', sentimentScore: 60, status: 'positive', source: 'news' },
        { timestamp: '2023-05-11T10:00:00', sentimentScore: 55, status: 'neutral', source: 'twitter' },
        { timestamp: '2023-05-10T10:00:00', sentimentScore: 50, status: 'neutral', source: 'news' }
      ]
    },
    AAPL: {
      symbol: 'AAPL',
      timeRange: '1W',
      trend: {
        direction: 'stable',
        magnitude: 'low',
        change: 1.2
      },
      data: [
        { timestamp: '2023-05-16T10:00:00', sentimentScore: 68, status: 'positive', source: 'news' },
        { timestamp: '2023-05-15T10:00:00', sentimentScore: 67, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-14T10:00:00', sentimentScore: 69, status: 'positive', source: 'news' },
        { timestamp: '2023-05-13T10:00:00', sentimentScore: 66, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-12T10:00:00', sentimentScore: 67, status: 'positive', source: 'news' },
        { timestamp: '2023-05-11T10:00:00', sentimentScore: 68, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-10T10:00:00', sentimentScore: 65, status: 'positive', source: 'news' }
      ]
    },
    MSFT: {
      symbol: 'MSFT',
      timeRange: '1W',
      trend: {
        direction: 'upward',
        magnitude: 'medium',
        change: 4.5
      },
      data: [
        { timestamp: '2023-05-16T10:00:00', sentimentScore: 75, status: 'positive', source: 'news' },
        { timestamp: '2023-05-15T10:00:00', sentimentScore: 73, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-14T10:00:00', sentimentScore: 72, status: 'positive', source: 'news' },
        { timestamp: '2023-05-13T10:00:00', sentimentScore: 70, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-12T10:00:00', sentimentScore: 69, status: 'positive', source: 'news' },
        { timestamp: '2023-05-11T10:00:00', sentimentScore: 65, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-10T10:00:00', sentimentScore: 62, status: 'positive', source: 'news' }
      ]
    },
    GOOGL: {
      symbol: 'GOOGL',
      timeRange: '1W',
      trend: {
        direction: 'downward',
        magnitude: 'low',
        change: -2.8
      },
      data: [
        { timestamp: '2023-05-16T10:00:00', sentimentScore: 58, status: 'neutral', source: 'news' },
        { timestamp: '2023-05-15T10:00:00', sentimentScore: 60, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-14T10:00:00', sentimentScore: 61, status: 'positive', source: 'news' },
        { timestamp: '2023-05-13T10:00:00', sentimentScore: 62, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-12T10:00:00', sentimentScore: 63, status: 'positive', source: 'news' },
        { timestamp: '2023-05-11T10:00:00', sentimentScore: 64, status: 'positive', source: 'twitter' },
        { timestamp: '2023-05-10T10:00:00', sentimentScore: 65, status: 'positive', source: 'news' }
      ]
    },
    AMZN: {
      symbol: 'AMZN',
      timeRange: '1W',
      trend: {
        direction: 'downward',
        magnitude: 'high',
        change: -9.3
      },
      data: [
        { timestamp: '2023-05-16T10:00:00', sentimentScore: 42, status: 'neutral', source: 'news' },
        { timestamp: '2023-05-15T10:00:00', sentimentScore: 45, status: 'neutral', source: 'twitter' },
        { timestamp: '2023-05-14T10:00:00', sentimentScore: 48, status: 'neutral', source: 'news' },
        { timestamp: '2023-05-13T10:00:00', sentimentScore: 52, status: 'neutral', source: 'twitter' },
        { timestamp: '2023-05-12T10:00:00', sentimentScore: 55, status: 'neutral', source: 'news' },
        { timestamp: '2023-05-11T10:00:00', sentimentScore: 59, status: 'neutral', source: 'twitter' },
        { timestamp: '2023-05-10T10:00:00', sentimentScore: 62, status: 'positive', source: 'news' }
      ]
    }
  },
  
  // Trend data for historical charts
  trend: [
    { day: 'Mon', overall: 55, tech: 60, finance: 48, healthcare: 58, energy: 52 },
    { day: 'Tue', overall: 57, tech: 63, finance: 46, healthcare: 60, energy: 50 },
    { day: 'Wed', overall: 58, tech: 65, finance: 45, healthcare: 62, energy: 48 },
    { day: 'Thu', overall: 60, tech: 68, finance: 44, healthcare: 64, energy: 46 },
    { day: 'Fri', overall: 56, tech: 64, finance: 42, healthcare: 62, energy: 44 },
    { day: 'Sat', overall: 59, tech: 66, finance: 41, healthcare: 66, energy: 43 },
    { day: 'Sun', overall: 62, tech: 67, finance: 42, healthcare: 71, energy: 45 }
  ]
};