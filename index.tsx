import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// --- DATA ---
const prompts = [
  { id: 1, category: 'Creative', title: 'Story Starter', prompt: 'Write a short story beginning with the line: "The last thing I expected to see in my coffee was a tiny, swimming dragon."' },
  { id: 2, category: 'Coding', title: 'Regex Helper', prompt: 'Generate a regular expression that validates an email address according to RFC 5322.' },
  { id: 3, category: 'Marketing', title: 'Ad Copy', prompt: 'Write three compelling headlines for a new brand of eco-friendly sneakers.' },
  { id: 4, category: 'Fun', title: 'Movie Pitch', prompt: 'Pitch a movie about a group of squirrels who pull off a heist to steal the world\'s largest acorn.' },
  { id: 5, category: 'Creative', title: 'Poetry Prompt', prompt: 'Write a haiku about the feeling of a city street after a rainstorm.' },
  { id: 6, category: 'Productivity', title: 'Email Assistant', prompt: 'Draft a polite but firm follow-up email to a colleague who has not responded to a request from three days ago.' },
  { id: 7, category: 'Coding', title: 'Code Explainer', prompt: 'Explain the concept of recursion in simple terms, using a real-world analogy. Provide a simple code example in Python.' },
  { id: 8, category: 'Marketing', title: 'Social Media Post', prompt: 'Create a short, engaging tweet to announce a 24-hour flash sale for a coffee shop.' },
];

type Prompt = typeof prompts[0];

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const App: React.FC = () => {
    const [view, setView] = useState<'gallery' | 'generator'>('gallery');
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [copyStatus, setCopyStatus] = useState<Record<number, string>>({});

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const categories = ['All', ...Array.from(new Set(prompts.map(p => p.category)))];
    const filteredPrompts = activeCategory === 'All' ? prompts : prompts.filter(p => p.category === activeCategory);

    const handleUsePrompt = (prompt: Prompt) => {
        setSelectedPrompt(prompt);
        setGeneratedContent('');
        setView('generator');
    };

    const handleBackToGallery = () => {
        setView('gallery');
        setSelectedPrompt(null);
    };

    const handleGenerate = async () => {
        if (!selectedPrompt) return;
        setIsLoading(true);
        setGeneratedContent('');
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: selectedPrompt.prompt,
            });
            setGeneratedContent(response.text);
        } catch (error) {
            console.error('API Error:', error);
            setGeneratedContent('Sorry, something went wrong. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (prompt: Prompt) => {
        navigator.clipboard.writeText(prompt.prompt);
        setCopyStatus({ ...copyStatus, [prompt.id]: 'Copied!' });
        setTimeout(() => {
            setCopyStatus({ ...copyStatus, [prompt.id]: '' });
        }, 2000);
    };

    if (view === 'generator' && selectedPrompt) {
        return (
            <main className="generator-view">
                <button onClick={handleBackToGallery} className="back-button" aria-label="Back to gallery">
                    <BackIcon />
                    <span>Back to Gallery</span>
                </button>
                <div className="generator-prompt">
                    <h2>{selectedPrompt.title}</h2>
                    <p>{selectedPrompt.prompt}</p>
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="generate-btn">
                    {isLoading ? 'Generating...' : '✨ Generate'}
                </button>
                <div className="output-container">
                    {isLoading && (
                        <div className="loading-indicator" aria-label="Loading content">
                            <div className="spinner"></div>
                        </div>
                    )}
                    {generatedContent && (
                        <div className="output-content">
                            {generatedContent}
                        </div>
                    )}
                </div>
            </main>
        );
    }

    return (
        <>
            <header>
                <h1>React Prompt Gallery</h1>
                <p>Discover and experiment with powerful prompts for generative AI.</p>
            </header>
            <main>
                <div className="category-filters" role="tablist" aria-label="Prompt Categories">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={activeCategory === category ? 'active' : ''}
                            role="tab"
                            aria-selected={activeCategory === category}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="prompt-gallery">
                    {filteredPrompts.map(prompt => (
                        <div key={prompt.id} className="prompt-card">
                            <div className="card-header">
                                <h3>{prompt.title}</h3>
                                <span className="category-badge">{prompt.category}</span>
                            </div>
                            <p className="prompt-text">{prompt.prompt}</p>
                            <div className="card-actions">
                                <button onClick={() => handleUsePrompt(prompt)} className="primary-btn">Use Prompt</button>
                                <button onClick={() => handleCopy(prompt)} className="secondary-btn" aria-live="polite">
                                    <CopyIcon />
                                    <span>{copyStatus[prompt.id] || 'Copy'}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
