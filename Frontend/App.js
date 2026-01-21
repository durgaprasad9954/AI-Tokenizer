import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = "https://ai-tokenizer-hge5.onrender.com";

function App() {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("GPT-4");
  const [showText, setShowText] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const models = ["GPT-4", "GPT-3.5-Turbo", "GPT-4-Turbo", "Claude-3"];
  
  const examples = [
    "Hello, how are you today?",
    "The quick brown fox jumps over the lazy dog.",
    "Artificial intelligence is transforming the world."
  ];

  // API call to tokenize text
  const tokenizeText = async (inputText, model) => {
    if (!inputText.trim()) return [];
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tokenize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          model: model.toLowerCase(),
          strategy: 'default'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to tokenize text');
      }
      
      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('Error tokenizing text:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (text.trim()) {
      tokenizeText(text, selectedModel).then(setTokens);
    } else {
      setTokens([]);
    }
  }, [text, selectedModel]);

  const tokenCount = tokens.length;
  const charCount = text.length;
  const tokenIds = tokens.map(token => token.id);
  const vocabulary = [...new Set(tokens.map(token => token.text))].sort();

  const handleClear = () => {
    setText("");
    setTokens([]);
  };

  const handleExampleClick = (example) => {
    setText(example);
  };

  const copyTokenIds = () => {
    navigator.clipboard.writeText(JSON.stringify(tokenIds));
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="title-container">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
              <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#6366f1"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>AI Tokenizer <span className="powered-by">(Powered By Alumnx)</span></h1>
        </div>
        <p>Visualize how AI models process and tokenize text, transforming words and sentences into interpretable patterns for machine understanding.</p>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Examples */}
        <div className="examples">
          <span>Examples:</span>
          {examples.map((example, index) => (
            <button 
              key={index} 
              className="example-btn"
              onClick={() => handleExampleClick(example)}
            >
              Example {index + 1}
            </button>
          ))}
        </div>

        <div className="input-container">
          <textarea
            className="text-input"
            placeholder="Enter some text here"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="clear-btn" onClick={handleClear}>Clear</button>
        </div>

        {/* Stats */}
        <div className="stats">
          <span className="pill">Tokens: {tokenCount}</span>
          <span className="pill">Characters: {charCount}</span>
          <span className="pill">Vocabulary: {vocabulary.length}</span>
        </div>

        {/* Controls */}
        <div className="controls">
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={showText}
              onChange={(e) => setShowText(e.target.checked)}
            />
            <span>Show text</span>
          </label>

          <div className="right-controls">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="loading">
            <p>Tokenizing text...</p>
          </div>
        )}

        {/* Token Visualization */}
        {tokens.length > 0 && (
          <section className="token-visualization">
            <h3>Token Visualization</h3>
            <div className="tokens-container">
              {tokens.map((token, index) => (
                <span 
                  key={index} 
                  className="token"
                  title={`Token ID: ${token.id}`}
                >
                  {showText ? token.text : token.id}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Token Breakdown */}
        <section className="breakdown">
          <h3>Token breakdown</h3>
          {tokens.length > 0 ? (
            <div className="token-details">
              <div className="token-list">
                {tokens.map((token, index) => (
                  <div key={index} className="token-item">
                    <span className="token-id">ID: {token.id}</span>
                    <span className="token-text">Text: "{token.text}"</span>
                  </div>
                ))}
              </div>
              <div className="token-actions">
                <div className="token-ids-display">
                  <strong>Token IDs:</strong> [{tokenIds.join(", ")}]
                </div>
                <button className="copy-btn" onClick={copyTokenIds}>
                  Copy Token IDs
                </button>
              </div>
            </div>
          ) : (
            <p>Enter text to see token breakdown</p>
          )}
        </section>

        {/* Vocabulary */}
        {vocabulary.length > 0 && (
          <section className="breakdown">
            <h3>Vocabulary ({vocabulary.length} unique tokens)</h3>
            <div className="vocabulary-container">
              {vocabulary.map((word, index) => (
                <span key={index} className="vocab-item">
                  {word}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;