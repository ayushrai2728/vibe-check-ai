import React from 'react';
import { Sentiment, SentimentAnalysis } from '../types';
import Spinner from './Spinner';

interface SentimentResultProps {
    analysisResult: SentimentAnalysis | null;
    isLoading: boolean;
    error: string | null;
}

const sentimentStyles: { [key in Sentiment]: { badge: string, text: string, border: string, emoji: string } } = {
    [Sentiment.Positive]: { badge: 'bg-green-500/20 text-green-300', text: 'text-green-400', border: 'border-green-500/30', emoji: '😊' },
    [Sentiment.Negative]: { badge: 'bg-red-500/20 text-red-300', text: 'text-red-400', border: 'border-red-500/30', emoji: '😠' },
    [Sentiment.Neutral]: { badge: 'bg-gray-500/20 text-gray-300', text: 'text-gray-400', border: 'border-gray-500/30', emoji: '😐' },
    [Sentiment.Mixed]: { badge: 'bg-purple-500/20 text-purple-300', text: 'text-purple-400', border: 'border-purple-500/30', emoji: '🤔' },
};

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-gray-700 rounded-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-300">Analysis Results</h3>
        <p className="text-gray-500 mt-2">Your sentiment analysis will appear here once you submit a post and topic.</p>
    </div>
);


const SentimentResult: React.FC<SentimentResultProps> = ({ analysisResult, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full p-8 border-2 border-dashed border-gray-700 rounded-2xl">
                <div className="text-center">
                    <Spinner />
                    <p className="mt-4 text-lg text-gray-400">Analyzing sentiment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full p-8 border-2 border-dashed border-red-500/50 rounded-2xl bg-red-500/10">
                 <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-red-300">Analysis Failed</h3>
                    <p className="text-red-400 mt-2 max-w-md">{error}</p>
                </div>
            </div>
        );
    }
    
    if (!analysisResult) {
        return <InitialState />;
    }

    const scorePercentage = (analysisResult.sentimentScore + 1) / 2 * 100;
    const scoreColor = analysisResult.sentimentScore > 0 ? 'bg-green-500' : analysisResult.sentimentScore < 0 ? 'bg-red-500' : 'bg-gray-500';

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Overall Sentiment</h3>
                <div className="mt-2 flex items-center gap-4">
                    <span className={`px-4 py-1 text-lg font-bold rounded-full ${sentimentStyles[analysisResult.overallSentiment].badge}`}>
                        {analysisResult.overallSentiment} {sentimentStyles[analysisResult.overallSentiment].emoji}
                    </span>
                    <div className="flex-grow">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className={`${scoreColor} h-2.5 rounded-full`} style={{ width: `${scorePercentage}%` }}></div>
                        </div>
                        <p className="text-right text-sm text-gray-400 mt-1">Score: {analysisResult.sentimentScore.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Explanation</h3>
                <p className="mt-2 text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700">{analysisResult.explanation}</p>
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Key Phrases</h3>
                <ul className="mt-2 space-y-2">
                    {analysisResult.keyPhrases.map((item, index) => (
                        <li 
                           key={index}
                           className={`flex justify-between items-center p-3 rounded-lg border ${sentimentStyles[item.sentiment].border} bg-gray-800/30 animate-slide-in-bottom`}
                           style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <span className="text-gray-200">"{item.phrase}"</span>
                            <span className={`text-sm font-semibold ${sentimentStyles[item.sentiment].text}`}>{item.sentiment}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SentimentResult;
