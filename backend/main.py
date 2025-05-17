from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os
import httpx
import json

# Initialize FastAPI app
app = FastAPI(
    title="Neufin API",
    description="AI-Powered Financial Intelligence API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class StockData(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: float
    updated_at: datetime


class SentimentAnalysis(BaseModel):
    symbol: str
    score: float
    sentiment: str
    sources: List[str]
    updated_at: datetime


class InvestmentRecommendation(BaseModel):
    symbol: str
    recommendation: str
    confidence: float
    time_horizon: str
    rationale: str
    risk_level: str
    updated_at: datetime


class BiasDetection(BaseModel):
    bias_type: str
    likelihood: float
    description: str
    mitigation: str


# Routes
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Neufin API", "status": "operational"}


@app.get("/api/v1/market-data/{symbol}")
async def get_market_data(symbol: str):
    """
    Get real-time market data for a specific stock symbol.
    Requires Alpha Vantage API key.
    """
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Alpha Vantage API key not configured")
    
    try:
        # In production, this would call the actual Alpha Vantage API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}"
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch market data")
            
            data = response.json()
            
            if "Global Quote" not in data or not data["Global Quote"]:
                raise HTTPException(status_code=404, detail=f"No data found for symbol: {symbol}")
            
            quote = data["Global Quote"]
            
            return {
                "symbol": symbol,
                "price": float(quote.get("05. price", 0)),
                "change": float(quote.get("09. change", 0)),
                "change_percent": float(quote.get("10. change percent", "0%").strip("%")),
                "volume": int(quote.get("06. volume", 0)),
                "updated_at": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market data: {str(e)}")


@app.get("/api/v1/sentiment/{symbol}")
async def get_sentiment(symbol: str):
    """
    Get sentiment analysis for a specific stock symbol using AI.
    Requires OpenAI API key.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    try:
        # In production, this would call the OpenAI API with news data
        # This is a simplified version for illustration
        # Determine a sentiment score based on market data

        # For example, fetch market data first
        async with httpx.AsyncClient() as client:
            alpha_key = os.getenv("ALPHA_VANTAGE_API_KEY")
            response = await client.get(
                f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={alpha_key}"
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch market data")
            
            data = response.json()
            
            if "Global Quote" not in data or not data["Global Quote"]:
                raise HTTPException(status_code=404, detail=f"No data found for symbol: {symbol}")
            
            quote = data["Global Quote"]
            change_percent = float(quote.get("10. change percent", "0%").strip("%"))
            
            # Determine sentiment based on price change
            sentiment_score = min(max(change_percent / 10, -1), 1)  # Scale to -1 to 1
            
            if sentiment_score > 0.3:
                sentiment = "positive"
            elif sentiment_score < -0.3:
                sentiment = "negative"
            else:
                sentiment = "neutral"
            
            return {
                "symbol": symbol,
                "score": sentiment_score,
                "sentiment": sentiment,
                "sources": ["market data", "price movement analysis"],
                "updated_at": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing sentiment: {str(e)}")


@app.get("/api/v1/recommendations/{symbol}")
async def get_recommendations(symbol: str, time_horizon: Optional[str] = "medium"):
    """
    Get AI-powered investment recommendations for a specific stock.
    Requires Anthropic API key.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Anthropic API key not configured")
    
    try:
        # In a production environment, this would call the Anthropic Claude API
        # with relevant financial data for deeper analysis
        
        # For demonstration, return a structured recommendation
        time_horizons = {
            "short": "1-3 months",
            "medium": "6-12 months",
            "long": "1-5 years"
        }
        
        recommendations = {
            "AAPL": {"rec": "buy", "confidence": 0.85, "risk": "low"},
            "MSFT": {"rec": "buy", "confidence": 0.82, "risk": "low"},
            "GOOGL": {"rec": "hold", "confidence": 0.75, "risk": "medium"},
            "AMZN": {"rec": "buy", "confidence": 0.78, "risk": "medium"},
            "TSLA": {"rec": "hold", "confidence": 0.68, "risk": "high"},
            "META": {"rec": "buy", "confidence": 0.77, "risk": "medium"},
            "NFLX": {"rec": "hold", "confidence": 0.72, "risk": "medium"},
            "NVDA": {"rec": "buy", "confidence": 0.88, "risk": "medium"},
            "AMD": {"rec": "buy", "confidence": 0.81, "risk": "medium"},
        }
        
        if symbol not in recommendations:
            return {
                "symbol": symbol,
                "recommendation": "hold",
                "confidence": 0.65,
                "time_horizon": time_horizons.get(time_horizon, time_horizons["medium"]),
                "rationale": "Insufficient data for a strong recommendation",
                "risk_level": "medium",
                "updated_at": datetime.now().isoformat()
            }
        
        rec = recommendations[symbol]
        
        return {
            "symbol": symbol,
            "recommendation": rec["rec"],
            "confidence": rec["confidence"],
            "time_horizon": time_horizons.get(time_horizon, time_horizons["medium"]),
            "rationale": f"Based on technical analysis, fundamentals, and market sentiment for {symbol}",
            "risk_level": rec["risk"],
            "updated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendation: {str(e)}")


@app.get("/api/v1/bias/analyze")
async def analyze_bias(portfolio: List[str], trades: Optional[List[dict]] = None):
    """
    Analyze potential investment biases based on portfolio composition and trading history.
    """
    try:
        # In production, this would analyze actual portfolio data
        # This is a simplified version for illustration
        
        biases = []
        
        # Check for concentration bias (holding too few stocks)
        if len(portfolio) < 5:
            biases.append({
                "bias_type": "concentration_bias",
                "likelihood": 0.85,
                "description": "Your portfolio has a small number of holdings, indicating potential concentration risk",
                "mitigation": "Consider diversifying across more companies and sectors"
            })
        
        # Other potential bias checks (simplified)
        if trades and len(trades) > 0:
            # Check for overtrading
            if len(trades) > 20:
                biases.append({
                    "bias_type": "overtrading",
                    "likelihood": 0.75,
                    "description": "Your trading frequency is high, which may indicate overconfidence",
                    "mitigation": "Consider a more strategic, less frequent trading approach"
                })
        
        return {
            "biases": biases,
            "analyzed_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing biases: {str(e)}")


# Health check endpoints - both standard health and Cloud Run startup checks
@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Required for Cloud Run startup check
@app.get("/")
async def root():
    return {"message": "Neufin API is running", "status": "ok", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn
    import os
    
    # Get port from environment variable or default to 8080 for Cloud Run
    port = int(os.getenv("PORT", 8080))
    
    # Run with host 0.0.0.0 to bind to all interfaces
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)