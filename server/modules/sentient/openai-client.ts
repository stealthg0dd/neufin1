import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyzes financial text to determine sentiment
 * @param text - Financial text to analyze
 * @returns Sentiment score between -1 (bearish) and 1 (bullish) with confidence and summary
 */
export async function analyzeSentiment(text: string): Promise<{
  score: number;
  confidence: number;
  summary: string;
  source: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a financial sentiment analysis expert specializing in market sentiment analysis. " +
            "Analyze the given financial news or social media text and determine the market sentiment. " +
            "Score the sentiment on a scale from -1.0 (extremely bearish) to +1.0 (extremely bullish), " +
            "with 0.0 being neutral. Also provide a confidence score from 0.0 to 1.0 and a brief summary " +
            "of the key sentiment indicators in the text. Your output should be valid JSON."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }
    
    const result = JSON.parse(content);
    
    return {
      score: parseFloat(result.score),
      confidence: parseFloat(result.confidence),
      summary: result.summary,
      source: extractSource(text)
    };
  } catch (error: any) {
    console.error("Sentiment analysis error:", error);
    throw new Error(`Failed to analyze sentiment: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Extract the source of the text (e.g., 'news', 'twitter', etc.)
 */
function extractSource(text: string): string {
  // Simple heuristic to determine source
  if (text.includes("@") || text.includes("#") || text.length < 280) {
    return "twitter";
  } else if (text.includes("Reuters") || text.includes("Bloomberg") || text.includes("CNBC")) {
    return "news";
  } else if (text.includes("SEC") || text.includes("filing") || text.includes("report")) {
    return "filing";
  } else {
    return "other";
  }
}

/**
 * Batch analyze multiple texts for sentiment
 */
export async function batchAnalyzeSentiment(texts: string[]): Promise<Array<{
  score: number;
  confidence: number;
  summary: string;
  source: string;
}>> {
  const results = [];
  
  for (const text of texts) {
    try {
      const result = await analyzeSentiment(text);
      results.push(result);
    } catch (error) {
      console.error(`Failed to analyze text: ${text.substring(0, 100)}...`, error);
      // Continue with other texts even if one fails
    }
  }
  
  return results;
}