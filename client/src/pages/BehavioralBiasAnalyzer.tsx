import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Mock user for testing (will be replaced with authentication)
const DEMO_USER_ID = 1;

// Define types for our bias data
interface DetectedBias {
  biasType: string;
  score: number;
  impact: 'low' | 'medium' | 'high';
  evidence: any[];
  suggestion: string;
  description: string;
}

interface BiasReport {
  userId: number;
  detectedBiases: DetectedBias[];
  overallScore: number;
  improvementSuggestions: string[];
  comparisonAnalysis?: {
    actualPortfolio: {
      value: number;
      allocation: Record<string, number>;
    };
    biasFreePortfolio: {
      value: number;
      allocation: Record<string, number>;
    };
    differenceMetrics: {
      expectedReturnDifference: number;
      riskDifference: number;
      diversificationScore: number;
    };
  };
  premium: boolean;
}

interface BiasProfile {
  userId: number;
  overallScore: number;
  primaryBiases: {
    biasType: string;
    score: number;
    trend: 'improving' | 'worsening' | 'stable';
  }[];
  historicalScores: { date: string; score: number }[];
  recommendations: string[];
  lastUpdated: string;
}

interface NaturalLanguageQueryResponse {
  answer: string;
  relatedBiases: string[];
  suggestedActions: string[];
  premium: boolean;
}

// Colors for the bias impact levels
const impactColorMap = {
  low: '#4ade80',
  medium: '#facc15',
  high: '#f87171'
};

// Colors for allocation charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

// Helper function to get a color for a bias trend
const getTrendColor = (trend: 'improving' | 'worsening' | 'stable') => {
  switch (trend) {
    case 'improving': return 'text-green-500';
    case 'worsening': return 'text-red-500';
    case 'stable': return 'text-blue-500';
    default: return 'text-gray-500';
  }
};

// Helper function to get an icon for a bias trend
const getTrendIcon = (trend: 'improving' | 'worsening' | 'stable') => {
  switch (trend) {
    case 'improving': return '↑';
    case 'worsening': return '↓';
    case 'stable': return '→';
    default: return '-';
  }
};

// Helper function to format bias type from snake_case to Title Case
const formatBiasType = (biasType: string) => {
  return biasType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function BehavioralBiasAnalyzer() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [querySubmitted, setQuerySubmitted] = useState(false);
  
  // Get the user bias profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['bba', 'profile', DEMO_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/bba/profile/${DEMO_USER_ID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bias profile');
      }
      return response.json() as Promise<BiasProfile>;
    },
    staleTime: 60000, // 1 minute
  });
  
  // Query for run analysis (will actually run when button is clicked)
  const { data: analysisResult, isLoading: analysisLoading, refetch: runAnalysis } = useQuery({
    queryKey: ['bba', 'analyze', DEMO_USER_ID],
    queryFn: async () => {
      const response = await apiRequest<BiasReport>('/api/bba/analyze', {
        method: 'POST',
        body: JSON.stringify({ userId: DEMO_USER_ID }),
      });
      return response;
    },
    enabled: false, // Only run when explicitly triggered
  });
  
  // Query for natural language queries
  const { data: queryResponse, isLoading: queryLoading, refetch: submitQuery } = useQuery({
    queryKey: ['bba', 'query', query],
    queryFn: async () => {
      const response = await apiRequest<NaturalLanguageQueryResponse>('/api/bba/query', {
        method: 'POST',
        body: JSON.stringify({ userId: DEMO_USER_ID, query }),
      });
      return response;
    },
    enabled: false, // Only run when explicitly triggered
  });
  
  // Handle query submission
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setQuerySubmitted(true);
    await submitQuery();
  };
  
  // Handle running a new analysis
  const handleRunAnalysis = async () => {
    await runAnalysis();
  };
  
  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score <= 30) return 'bg-green-500';
    if (score <= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Prepare data for allocation pie chart
  const prepareAllocationData = (allocation: Record<string, number>) => {
    return Object.entries(allocation).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Loading state
  if (profileLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-xl">Loading bias profile...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Behavioral Bias Analyzer</h1>
      <p className="text-gray-500 mb-6">
        Understand and overcome your cognitive biases in trading and investing
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="ask">Ask the Expert</TabsTrigger>
          <TabsTrigger value="education">Bias Education</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Overall Bias Score</CardTitle>
                <CardDescription>Lower is better</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32">
                      <circle
                        className="text-gray-200"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className={getScoreColor(profile?.overallScore || 0)}
                        strokeWidth="10"
                        strokeDasharray={360}
                        strokeDashoffset={360 - (profile?.overallScore || 0) / 100 * 360}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                    </svg>
                    <span className="absolute text-3xl font-bold">{profile?.overallScore || 0}</span>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                  Last updated: {new Date(profile?.lastUpdated || '').toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleRunAnalysis} className="w-full" disabled={analysisLoading}>
                  {analysisLoading ? 'Analyzing...' : 'Run New Analysis'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Primary Biases Card */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Primary Biases</CardTitle>
                <CardDescription>Your most significant behavioral patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.primaryBiases.map((bias, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{formatBiasType(bias.biasType)}</div>
                      <div className={`flex items-center gap-1 ${getTrendColor(bias.trend)}`}>
                        <span>{getTrendIcon(bias.trend)}</span>
                        <span className="capitalize">{bias.trend}</span>
                      </div>
                    </div>
                    <Progress value={bias.score} className="h-2" indicatorClassName={getScoreColor(bias.score)} />
                  </div>
                ))}
                
                {profile?.primaryBiases.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No biases detected yet. Run an analysis to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Recommendations and Historical Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommendations Card */}
            <Card>
              <CardHeader>
                <CardTitle>Improvement Suggestions</CardTitle>
                <CardDescription>Actionable steps to reduce bias impact</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile?.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                  
                  {(!profile?.recommendations || profile.recommendations.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      No recommendations available. Run an analysis to get personalized suggestions.
                    </div>
                  )}
                </ul>
              </CardContent>
            </Card>
            
            {/* Historical Trends Card */}
            <Card>
              <CardHeader>
                <CardTitle>Historical Trend</CardTitle>
                <CardDescription>Your bias score over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                {profile?.historicalScores && profile.historicalScores.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={profile.historicalScores}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    Not enough historical data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Detailed Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {analysisResult ? (
            <>
              {/* Detailed Biases */}
              <Card>
                <CardHeader>
                  <CardTitle>Detected Biases</CardTitle>
                  <CardDescription>Detailed breakdown of your trading biases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analysisResult.detectedBiases.map((bias, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{formatBiasType(bias.biasType)}</h3>
                          <p className="text-gray-500">{bias.description}</p>
                        </div>
                        <Badge 
                          className={`mt-2 md:mt-0 ${
                            bias.impact === 'low' ? 'bg-green-100 text-green-800' : 
                            bias.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {bias.impact.toUpperCase()} IMPACT
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Bias Strength</span>
                          <span className="text-sm font-bold">{bias.score}/100</span>
                        </div>
                        <Progress 
                          value={bias.score} 
                          className="h-2" 
                          indicatorClassName={`bg-${
                            bias.impact === 'low' ? 'green' : 
                            bias.impact === 'medium' ? 'yellow' : 
                            'red'
                          }-500`} 
                        />
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Suggestion</h4>
                        <p className="text-sm bg-blue-50 text-blue-700 p-3 rounded">{bias.suggestion}</p>
                      </div>
                      
                      {bias.evidence.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Evidence</h4>
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <ul className="list-disc pl-5 space-y-1">
                              {bias.evidence.map((item, i) => (
                                <li key={i}>
                                  {item.type === 'long_hold_loss' ? (
                                    <span>
                                      Held <strong>{item.symbol}</strong> for <strong>{item.holdPeriodDays} days</strong> with a {item.percentLoss}% loss
                                    </span>
                                  ) : item.type === 'clustered_buys' ? (
                                    <span>
                                      Made <strong>{item.trades} trades</strong> of <strong>{item.symbol}</strong> within {item.timeframeDays} days
                                    </span>
                                  ) : (
                                    <span>{JSON.stringify(item)}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {analysisResult.detectedBiases.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No biases detected in your trading patterns. Great job!
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Portfolio Comparison (Premium Feature) */}
              {analysisResult.comparisonAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Comparison</CardTitle>
                    <CardDescription>
                      See how your current allocation compares to a bias-free recommendation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-center font-semibold mb-4">Your Current Allocation</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareAllocationData(analysisResult.comparisonAnalysis.actualPortfolio.allocation)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareAllocationData(analysisResult.comparisonAnalysis.actualPortfolio.allocation)
                                .map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-center font-semibold mb-4">Bias-Free Allocation</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareAllocationData(analysisResult.comparisonAnalysis.biasFreePortfolio.allocation)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareAllocationData(analysisResult.comparisonAnalysis.biasFreePortfolio.allocation)
                                .map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Expected Return Difference</div>
                        <div className={`text-xl font-bold ${analysisResult.comparisonAnalysis.differenceMetrics.expectedReturnDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analysisResult.comparisonAnalysis.differenceMetrics.expectedReturnDifference > 0 ? '+' : ''}
                          {analysisResult.comparisonAnalysis.differenceMetrics.expectedReturnDifference.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Risk Difference</div>
                        <div className={`text-xl font-bold ${analysisResult.comparisonAnalysis.differenceMetrics.riskDifference < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analysisResult.comparisonAnalysis.differenceMetrics.riskDifference > 0 ? '+' : ''}
                          {analysisResult.comparisonAnalysis.differenceMetrics.riskDifference.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Diversification Improvement</div>
                        <div className="text-xl font-bold">
                          {analysisResult.comparisonAnalysis.differenceMetrics.diversificationScore > 0 ? '+' : ''}
                          {analysisResult.comparisonAnalysis.differenceMetrics.diversificationScore.toFixed(1)} points
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              )}
              
              {/* Analysis Actions */}
              <div className="flex justify-center">
                <Button onClick={handleRunAnalysis} disabled={analysisLoading}>
                  {analysisLoading ? 'Analyzing...' : 'Run New Analysis'}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Analyze Your Trading Behavior</CardTitle>
                <CardDescription>
                  Run an analysis to detect cognitive biases in your trading patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-10">
                <div className="text-center max-w-md mb-6">
                  <p>
                    Our Behavioral Bias Analyzer will examine your trading history to identify 
                    potential cognitive biases that may be affecting your investment decisions.
                  </p>
                </div>
                <Button onClick={handleRunAnalysis} disabled={analysisLoading} size="lg">
                  {analysisLoading ? 'Analyzing...' : 'Start Analysis'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Ask the Expert Tab */}
        <TabsContent value="ask" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ask About Your Biases</CardTitle>
              <CardDescription>
                Get personalized advice about your trading behaviors and cognitive biases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuerySubmit} className="space-y-4">
                <Textarea
                  placeholder="Ask a question about your trading behavior or biases..."
                  className="min-h-[100px]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button type="submit" disabled={queryLoading || !query.trim()}>
                  {queryLoading ? 'Processing...' : 'Ask Question'}
                </Button>
              </form>
              
              {querySubmitted && (
                <div className="mt-6">
                  {queryLoading ? (
                    <div className="text-center py-4">Processing your question...</div>
                  ) : queryResponse ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="font-medium text-blue-800 mb-2">Answer:</div>
                        <div className="text-blue-900">{queryResponse.answer}</div>
                      </div>
                      
                      {queryResponse.relatedBiases.length > 0 && (
                        <div>
                          <div className="font-medium mb-2">Related Biases:</div>
                          <div className="flex flex-wrap gap-2">
                            {queryResponse.relatedBiases.map((bias, i) => (
                              <Badge key={i} variant="outline">{formatBiasType(bias)}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {queryResponse.suggestedActions.length > 0 && (
                        <div>
                          <div className="font-medium mb-2">Suggested Actions:</div>
                          <ul className="space-y-1 list-disc list-inside">
                            {queryResponse.suggestedActions.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-red-500">
                      Failed to get a response. Please try again.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Example Questions</CardTitle>
              <CardDescription>Not sure what to ask? Try one of these questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "How do I overcome loss aversion in my trading?",
                  "What biases might be affecting my tech stock investments?",
                  "How can I make more objective trading decisions?",
                  "Why do I tend to sell winning positions too early?",
                  "Am I too influenced by recent market news?",
                  "How can I improve my risk management?"
                ].map((question, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    className="justify-start h-auto py-2 px-4"
                    onClick={() => setQuery(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Understanding Cognitive Biases</CardTitle>
              <CardDescription>
                Learn about common biases that affect investment decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    name: "Loss Aversion",
                    description: "The tendency to prefer avoiding losses over acquiring equivalent gains",
                    icon: "😨",
                    impact: "Can lead to holding losing positions too long and selling winners too early."
                  },
                  {
                    name: "Confirmation Bias",
                    description: "The tendency to search for or interpret information that confirms pre-existing beliefs",
                    icon: "🔍",
                    impact: "Can lead to ignoring warning signs about investments that contradict your thesis."
                  },
                  {
                    name: "Recency Bias",
                    description: "Overweighting recent events and experiences when making decisions about the future",
                    icon: "⏱️",
                    impact: "Can lead to chasing performance, buying high and selling low."
                  },
                  {
                    name: "Overconfidence",
                    description: "Overestimating one's investment abilities, knowledge, and the accuracy of forecasts",
                    icon: "😎",
                    impact: "Can lead to excessive trading, over-concentration in certain assets, and ignoring risks."
                  }
                ].map((bias, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{bias.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{bias.name}</h3>
                        <p className="text-gray-500">{bias.description}</p>
                        <div className="mt-2 bg-gray-50 p-2 rounded text-sm">
                          <strong>Impact:</strong> {bias.impact}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Separator className="my-4" />
                <p className="text-center text-gray-500">
                  More educational content available in the premium version
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Further reading on behavioral finance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  {
                    title: "Thinking, Fast and Slow",
                    author: "Daniel Kahneman",
                    description: "Explores the two systems that drive the way we think and make choices."
                  },
                  {
                    title: "Predictably Irrational",
                    author: "Dan Ariely",
                    description: "Examines the hidden forces that shape our decisions."
                  },
                  {
                    title: "The Psychology of Money",
                    author: "Morgan Housel",
                    description: "Timeless lessons on wealth, greed, and happiness."
                  }
                ].map((book, i) => (
                  <li key={i} className="border-b pb-3">
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm text-gray-500">by {book.author}</div>
                    <div className="text-sm mt-1">{book.description}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}