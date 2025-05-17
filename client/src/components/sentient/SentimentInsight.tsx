import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SentimentInsightProps {
  symbol: string;
  name: string;
  score: number;
  status: 'positive' | 'negative' | 'neutral';
  change: number;
  insights: string[];
  onViewDetails?: () => void;
}

export default function SentimentInsight({
  symbol,
  name,
  score,
  status,
  change,
  insights,
  onViewDetails
}: SentimentInsightProps) {
  // Get status color and icon
  const getStatusDetails = () => {
    switch (status) {
      case 'positive':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeClass: 'bg-green-100 text-green-800',
          badgeText: 'BULLISH',
          icon: <TrendingUp className="h-5 w-5 text-green-500" />
        };
      case 'negative':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeClass: 'bg-red-100 text-red-800',
          badgeText: 'BEARISH',
          icon: <TrendingDown className="h-5 w-5 text-red-500" />
        };
      default:
        return {
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badgeClass: 'bg-amber-100 text-amber-800',
          badgeText: 'NEUTRAL',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
        };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <Card className={cn("border-l-4", statusDetails.borderColor)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{symbol}</span>
              <Badge className={statusDetails.badgeClass}>
                {statusDetails.badgeText}
              </Badge>
            </div>
            <CardTitle className="text-base font-medium text-muted-foreground mt-1">{name}</CardTitle>
          </div>
          <div className={cn("flex flex-col items-end", statusDetails.color)}>
            <div className="text-2xl font-bold">{score}</div>
            <div className="flex items-center text-sm">
              {statusDetails.icon}
              <span className="ml-1">{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("p-3 rounded-md mb-3", statusDetails.bgColor)}>
          <h4 className="font-medium mb-2 flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Key Insights
          </h4>
          <ul className="space-y-1">
            {insights.map((insight, index) => (
              <li key={index} className="text-sm text-slate-700">• {insight}</li>
            ))}
          </ul>
        </div>
        {onViewDetails && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onViewDetails}
          >
            View Detailed Analysis
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}