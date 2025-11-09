
export enum Sentiment {
  Positive = "Positive",
  Negative = "Negative",
  Neutral = "Neutral",
  Mixed = "Mixed",
}

export interface KeyPhrase {
  phrase: string;
  sentiment: Sentiment;
}

export interface SentimentAnalysis {
  overallSentiment: Sentiment;
  sentimentScore: number;
  explanation: string;
  keyPhrases: KeyPhrase[];
}
