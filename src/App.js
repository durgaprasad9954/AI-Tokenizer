import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("GPT-4");
  const [showText, setShowText] = useState(true);
  const [tokens, setTokens] = useState([]);

  const models = ["GPT-4", "GPT-3.5-Turbo", "GPT-4-Turbo", "Claude-3"];
  
  const examples = [
    "Hello, how are you today?",
    "The quick brown fox jumps over the lazy dog.",
    "Artificial intelligence is transforming the world."
  ];

  // Simple tokenization logic (mimics AI tokenization)
  const tokenizeText = (inputText, model) => {
    if (!inputText.trim()) return [];
    
    // Different tokenization patterns based on model
    let tokenizedResult = [];
    let tokenId = 1;
    
    if (model === "Claude-3") {
      // Claude tends to split more aggressively
      const words = inputText.split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) {
          const mid = Math.ceil(word.length / 2);
          tokenizedResult.push({ id: tokenId++, text: word.slice(0, mid) });
          tokenizedResult.push({ id: tokenId++, text: word.slice(mid) });
        } else {
          tokenizedResult.push({ id: tokenId++, text: word });
        }
      });
    } else {
      // GPT models - word and punctuation based
      const parts = inputText.split(/(\s+|[.,!?;:])/).filter(part => part.length > 0);
      parts.forEach(part => {
        if (part.trim()) {
          tokenizedResult.push({ id: tokenId++, text: part });
        }
      });
    }
    
    return tokenizedResult;
  };

  useEffect(() => {
    const newTokens = tokenizeText(text, selectedModel);
    setTokens(newTokens);
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