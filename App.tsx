import React, { useState, useCallback, useMemo } from 'react';
import { analyzeSentiment } from './services/geminiService';
import { SentimentAnalysis, Sentiment } from './types';
import SentimentResult from './components/SentimentResult';
import Spinner from './components/Spinner';

const App: React.FC = () => {
    const [postText, setPostText] = useState<string>('');
    const [topic, setTopic] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<SentimentAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = useCallback(async () => {
        if (!postText.trim() || !topic.trim()) {
            setError("Please provide both a social media post and a topic to analyze.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeSentiment(postText, topic);
            setAnalysisResult(result);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [postText, topic]);
    
    const themeClassName = useMemo(() => {
        if (!analysisResult) return '';
        switch (analysisResult.overallSentiment) {
            case Sentiment.Positive:
                return 'theme-positive';
            case Sentiment.Negative:
                return 'theme-negative';
            default:
                return '';
        }
    }, [analysisResult]);


    return (
        <div className={`min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-500 ${themeClassName}`}>
            <div className="w-full max-w-6xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-400)] to-[var(--primary-500)] transition-colors duration-500">
                        Sentiment Analyzer
                    </h1>
                     <p className="mt-1 text-sm text-gray-500">
                        by Ayush...
                    </p>
                    <p className="mt-2 text-lg text-gray-400">
                        Understand public opinion on any topic from social media posts.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Input</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="post-text" className="block text-sm font-medium text-gray-400 mb-1">
                                    Social Media Post or URL
                                </label>
                                <textarea
                                    id="post-text"
                                    value={postText}
                                    onChange={(e) => setPostText(e.target.value)}
                                    placeholder="Paste the social media post text or a public URL here..."
                                    className="w-full h-48 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] transition-colors"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-gray-400 mb-1">
                                    Topic of Analysis
                                </label>
                                <input
                                    type="text"
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., 'new smartphone release', 'environmental policies'"
                                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] transition-colors"
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                onClick={handleAnalysis}
                                disabled={isLoading || !postText.trim() || !topic.trim()}
                                className="w-full flex items-center justify-center bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner />
                                        <span className="ml-2">Analyzing...</span>
                                    </>
                                ) : (
                                    'Analyze Sentiment'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 min-h-[400px]">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Analysis</h2>
                        <SentimentResult
                            analysisResult={analysisResult}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>
                </main>
                 <footer className="text-center mt-10 pt-6 border-t border-gray-700">
                    <p className="text-sm text-gray-500">
                        Made by Ayush Rai (202310101150303) & Yogendra Pathak (202310101150318)
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        © AYUSH | SRMU
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default App;