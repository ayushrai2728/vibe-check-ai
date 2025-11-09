import { GoogleGenAI, Type } from "@google/genai";
import { SentimentAnalysis, Sentiment } from '../types';

const sentimentValues = Object.values(Sentiment);

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        overallSentiment: {
            type: Type.STRING,
            enum: sentimentValues,
            description: "The overall sentiment of the post regarding the topic."
        },
        sentimentScore: {
            type: Type.NUMBER,
            description: "A score from -1.0 (very negative) to 1.0 (very positive) representing the sentiment."
        },
        explanation: {
            type: Type.STRING,
            description: "A detailed explanation for the sentiment analysis, referencing parts of the post."
        },
        keyPhrases: {
            type: Type.ARRAY,
            description: "A list of key phrases from the post that contribute to the sentiment.",
            items: {
                type: Type.OBJECT,
                properties: {
                    phrase: {
                        type: Type.STRING,
                        description: "The specific phrase from the post."
                    },
                    sentiment: {
                        type: Type.STRING,
                        enum: sentimentValues,
                        description: "The sentiment of this specific phrase."
                    }
                },
                required: ["phrase", "sentiment"]
            }
        }
    },
    required: ["overallSentiment", "sentimentScore", "explanation", "keyPhrases"]
};

const isUrl = (text: string): boolean => {
    try {
        const url = new URL(text);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
};


export const analyzeSentiment = async (postText: string, topic: string): Promise<SentimentAnalysis> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let contentToAnalyze = postText;

    try {
        if (isUrl(postText)) {
            console.log("URL detected. Fetching content...");
            const fetchPrompt = `URL: ${postText}`;
            
            const fetchResult = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fetchPrompt,
                config: {
                    systemInstruction: "You are an AI assistant that extracts the main text content from a social media post at a given URL. You must use your search tool to access the URL. Return ONLY the raw text content of the post. Do not include any explanations, apologies, or conversational filler like 'Here is the content:' or 'I am unable to access...'. If you cannot access the URL, return an empty string.",
                    tools: [{ googleSearch: {} }],
                }
            });

            const fetchedText = fetchResult.text?.trim() ?? "";
            const lowercasedFetchedText = fetchedText.toLowerCase();

            if (!fetchedText || lowercasedFetchedText.includes("unable to access") || lowercasedFetchedText.includes("cannot access")) {
                 throw new Error("Failed to retrieve content from the URL. The AI couldn't access the link, which might be private, broken, or require a login. Please try a different public URL, or copy and paste the post's text directly.");
            }

            contentToAnalyze = fetchedText;
            console.log("Content fetched successfully.");
        }

        const analysisPrompt = `
            Analyze the sentiment of the following social media post specifically about the topic: "${topic}".
            If the topic is not mentioned or clearly implied, state that in the explanation.

            Post:
            """
            ${contentToAnalyze}
            """

            Provide a detailed analysis based on the schema.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: analysisPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error("The model returned an empty response for sentiment analysis.");
        }
        
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as SentimentAnalysis;

    } catch (error) {
        console.error("Error in sentiment analysis process:", error);
        if (error instanceof Error) {
            // Prepend a user-friendly message to the error
            throw new Error(`Analysis failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during sentiment analysis.");
    }
};