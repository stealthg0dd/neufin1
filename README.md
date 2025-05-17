# Neufin - AI-Powered Financial Intelligence Platform

![Neufin Logo](./public/assets/images/neufin%20tagline%20bare%20logo.png)

Neufin is a comprehensive AI-powered fintech platform that integrates multiple intelligent modules for holistic financial intelligence and user-centric investment guidance, with enhanced Plaid investment account integration.

## Features

### Neufin Sentient
Real-time market sentiment analysis that tracks social media, news, and analyst opinions to provide comprehensive market insights.

### Neufin Nemo
Advanced stock intelligence suite with technical analysis, fundamental data, and AI-powered pattern recognition.

### Neufin O2
AI-powered investment recommendations tailored to your risk profile, financial goals, and market conditions.

### Neufin BBA
Behavioral Bias Analyzer that identifies and mitigates emotional trading patterns to improve decision-making.

### Market Data
Real-time stock quotes and market data integration.

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Express.js (Node.js) or FastAPI (Python)
- **Database**: PostgreSQL
- **AI Integration**: OpenAI, Anthropic
- **Financial Data**: Alpha Vantage, Plaid
- **Payment Processing**: Stripe
- **Analytics**: Google Analytics

## Project Structure

```
neufin/
├── public/                # Static assets
│   └── assets/
│       ├── images/        # Images and icons
│       └── fonts/         # Font files
├── src/                   # Frontend source files
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── styles/            # CSS and style files
│   ├── api/               # API client functions
│   ├── utils/             # Helper utilities
│   ├── data/              # Data models and mock data
│   ├── App.jsx            # Main App component
│   └── main.jsx           # Entry point
├── backend/               # Backend code (if using Python/FastAPI)
│   ├── main.py            # FastAPI main application
│   └── requirements.txt   # Python dependencies
├── index.html             # Main HTML file
├── .env.example           # Example environment variables
├── package.json           # Node.js dependencies
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Python 3.9+ (if using FastAPI backend)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/neufin.git
   cd neufin
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys and configuration
   ```

4. (Optional) If using the Python backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Development

1. Start the frontend development server:
   ```bash
   npm run dev
   ```

2. Start the backend server (if using FastAPI):
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

## Deployment Instructions

### Deploying to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Deploying to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy
   ```

4. For production deployment:
   ```bash
   netlify deploy --prod
   ```

### Deploying to Google Cloud

#### Frontend (Cloud Storage + Cloud CDN)

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Create a Cloud Storage bucket:
   ```bash
   gsutil mb -l us-central1 gs://your-neufin-bucket
   ```

3. Make the bucket public:
   ```bash
   gsutil iam ch allUsers:objectViewer gs://your-neufin-bucket
   ```

4. Upload the build files:
   ```bash
   gsutil -m cp -r dist/* gs://your-neufin-bucket
   ```

5. Configure Cloud CDN for the bucket if needed.

#### Backend (Cloud Run)

1. Build and push the Docker image:
   ```bash
   # For Node.js backend
   gcloud builds submit --tag gcr.io/your-project-id/neufin-api

   # For Python backend
   cd backend
   gcloud builds submit --tag gcr.io/your-project-id/neufin-api
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy neufin-api \
     --image gcr.io/your-project-id/neufin-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. Set environment variables:
   ```bash
   gcloud run services update neufin-api \
     --set-env-vars="DATABASE_URL=your-db-url,STRIPE_SECRET_KEY=your-key"
   ```

## Configuration

### API Keys Required

To use all features of Neufin, you'll need the following API keys:

- **Google Analytics**: Register at [Google Analytics](https://analytics.google.com/) to get your Measurement ID
- **Stripe**: Sign up at [Stripe](https://stripe.com/) for payment processing
- **Alpha Vantage**: Get your API key at [Alpha Vantage](https://www.alphavantage.co/)
- **OpenAI**: Register at [OpenAI](https://openai.com/) for AI capabilities
- **Anthropic**: Sign up at [Anthropic](https://www.anthropic.com/) for Claude AI
- **Plaid**: Register at [Plaid](https://plaid.com/) for financial account connectivity

Add these keys to your `.env` file based on the `.env.example` template.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or inquiries, please contact us at support@neufin.com.