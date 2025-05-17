import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SentimentDashboard from '@/components/sentient/SentimentDashboard';
import SentimentInsight from '@/components/sentient/SentimentInsight';
import SentimentAlert from '@/components/sentient/SentimentAlert';
import { sentimentData } from '@/data/sentimentData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Lightbulb, InfoIcon } from 'lucide-react';

export default function SentimentAnalysis() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sample insights for each symbol
  const symbolInsights = {
    AAPL: [
      "Strong positive sentiment in tech media coverage",
      "Recent product announcements well-received by investors",
      "Social media activity shows increased consumer interest"
    ],
    MSFT: [
      "Azure growth driving positive market sentiment",
      "AI strategy resonating with enterprise customers",
      "Analyst reports highlight strong competitive position"
    ],
    GOOGL: [
      "Ad revenue concerns causing sentiment decline",
      "Regulatory headwinds affecting market confidence",
      "Core search business remains solid in user metrics"
    ],
    AMZN: [
      "Retail growth slowdown creating bearish signals",
      "AWS continues to drive positive sentiment",
      "Labor concerns weighing on overall perception"
    ]
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Neufin Sentient</h1>
        <p className="text-xl text-muted-foreground">
          AI-powered market sentiment analysis for smarter investing
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <SentimentDashboard />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-semibold">Symbol Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(symbolInsights).map(([symbol, insights]) => {
                const symbolData = sentimentData.symbols[symbol];
                const latestData = symbolData.data[0];
                return (
                  <SentimentInsight
                    key={symbol}
                    symbol={symbol}
                    name={
                      symbol === 'AAPL' ? 'Apple Inc.' :
                      symbol === 'MSFT' ? 'Microsoft Corporation' :
                      symbol === 'GOOGL' ? 'Alphabet Inc.' :
                      symbol === 'AMZN' ? 'Amazon.com Inc.' : ''
                    }
                    score={latestData.sentimentScore}
                    status={latestData.status as any}
                    change={symbolData.trend.change}
                    insights={insights}
                    onViewDetails={() => console.log(`View details for ${symbol}`)}
                  />
                );
              })}
            </div>
            
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
                  About Sentiment Analysis
                </CardTitle>
                <CardDescription>
                  How Neufin Sentient evaluates market sentiment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our advanced AI model analyzes thousands of financial news articles, social media posts, 
                  and market reports in real-time to gauge investor sentiment across markets and specific symbols.
                </p>
                <p>
                  Sentiment scores range from 0-100, with scores above 60 indicating bullish sentiment,
                  below 40 indicating bearish sentiment, and between 40-60 indicating neutral market outlook.
                </p>
                <p>
                  The trend direction and magnitude indicators help you understand how sentiment is changing 
                  over time, allowing you to spot potential market shifts before they fully materialize.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h2 className="text-2xl font-semibold">Recent Sentiment Alerts</h2>
            </div>
            
            <div className="space-y-4">
              <SentimentAlert
                symbol="QQQ"
                name="Invesco QQQ Trust (Nasdaq 100 ETF)"
                threshold={70}
                currentScore={72}
                previousScore={65}
                status="positive"
                timestamp="2023-05-16T09:30:00"
                onViewDetails={() => console.log('View QQQ details')}
                onDismiss={() => console.log('Dismiss QQQ alert')}
              />
              
              <SentimentAlert
                symbol="AMZN"
                name="Amazon.com Inc."
                threshold={50}
                currentScore={42}
                previousScore={59}
                status="negative"
                timestamp="2023-05-15T14:45:00"
                onViewDetails={() => console.log('View AMZN details')}
                onDismiss={() => console.log('Dismiss AMZN alert')}
              />
              
              <SentimentAlert
                symbol="MSFT"
                name="Microsoft Corporation"
                threshold={70}
                currentScore={75}
                previousScore={65}
                status="positive"
                timestamp="2023-05-14T10:15:00"
                onViewDetails={() => console.log('View MSFT details')}
                onDismiss={() => console.log('Dismiss MSFT alert')}
              />
            </div>
            
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Managing Your Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Set custom sentiment thresholds for any symbol to receive alerts when significant 
                  sentiment shifts occur. Configure your preferences in the Settings tab to customize:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Alert thresholds for bullish and bearish signals</li>
                  <li>Symbols to track for sentiment changes</li>
                  <li>Alert delivery preferences (email, SMS, or in-app)</li>
                  <li>Alert frequency and batching options</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}