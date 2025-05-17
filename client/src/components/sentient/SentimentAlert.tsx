import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, TrendingUp, TrendingDown, Bell, ArrowRight, X } from 'lucide-react';

interface SentimentAlertProps {
  symbol: string;
  name: string;
  threshold: number;
  currentScore: number;
  previousScore: number;
  status: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  onViewDetails?: () => void;
  onDismiss?: () => void;
}

export default function SentimentAlert({
  symbol,
  name,
  threshold,
  currentScore,
  previousScore,
  status,
  timestamp,
  onViewDetails,
  onDismiss
}: SentimentAlertProps) {
  const change = currentScore - previousScore;
  const percentChange = ((change / previousScore) * 100).toFixed(1);
  const isIncrease = change > 0;
  
  // Format the timestamp for readability
  const formattedTime = new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Determine alert appearance based on status
  const alertStyles = {
    positive: {
      borderColor: 'border-green-500',
      bgColor: 'bg-green-50',
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      badge: 'bg-green-100 text-green-800',
      badgeText: 'BULLISH ALERT'
    },
    negative: {
      borderColor: 'border-red-500',
      bgColor: 'bg-red-50',
      icon: <TrendingDown className="h-5 w-5 text-red-500" />,
      badge: 'bg-red-100 text-red-800',
      badgeText: 'BEARISH ALERT'
    },
    neutral: {
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-50',
      icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
      badge: 'bg-orange-100 text-orange-800',
      badgeText: 'SENTIMENT SHIFT'
    }
  };

  const styles = alertStyles[status];

  return (
    <Alert className={cn("border-l-4", styles.borderColor, styles.bgColor)}>
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <Bell className="h-5 w-5 mt-0.5 mr-2 text-slate-700" />
          <div>
            <div className="flex items-center mb-1">
              <Badge className={styles.badge}>{styles.badgeText}</Badge>
              <span className="text-xs text-slate-500 ml-2">{formattedTime}</span>
            </div>
            <AlertTitle className="mb-1 flex items-center">
              {styles.icon}
              <span className="ml-1">
                {symbol} {isIncrease ? 'surged' : 'dropped'} by {Math.abs(change).toFixed(1)} points ({Math.abs(parseFloat(percentChange))}%)
              </span>
            </AlertTitle>
            <AlertDescription className="text-sm text-slate-700">
              <p className="mb-1">
                {name}'s sentiment score has {isIncrease ? 'increased' : 'decreased'} from {previousScore} to {currentScore}, 
                {isIncrease ? ' exceeding ' : ' falling below '} 
                your alert threshold of {threshold}.
              </p>
              <div className="flex space-x-2 mt-3">
                {onViewDetails && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onViewDetails}
                    className="h-8"
                  >
                    View Details
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </AlertDescription>
          </div>
        </div>
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss} 
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </Alert>
  );
}