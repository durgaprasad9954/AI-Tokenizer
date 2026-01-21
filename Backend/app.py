# app.py - Main Flask Application with Swagger UI

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import re
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# ==================== Tokenizer Class ====================
class AdvancedTokenizer:
    """Advanced tokenizer with multiple strategies"""
    
    def __init__(self):
        self.vocab = {}
        self.id_counter = 0
        
    def tokenize(self, text, strategy='default'):
        """
        Tokenize text using specified strategy
        
        Args:
            text (str): Input text to tokenize
            strategy (str): Tokenization strategy ('default', 'word', 'char')
            
        Returns:
            list: List of token dictionaries with text and id
        """
        if not text:
            return []
        
        if strategy == 'word':
            return self._word_tokenize(text)
        elif strategy == 'char':
            return self._char_tokenize(text)
        else:
            return self._default_tokenize(text)
    
    def _default_tokenize(self, text):
        """Default BPE-like tokenization"""
        tokens = []
        words = re.split(r'(\s+|[.,!?;:()[\]{}\'"""])', text)
        
        for word in words:
            if not word:
                continue
                
            if word.match(r'\s+') if hasattr(word, 'match') else re.match(r'\s+', word):
                tokens.append({
                    'text': word,
                    'id': self._get_token_id(word),
                    'type': 'whitespace'
                })
            elif re.match(r'^[.,!?;:()[\]{}\'"""]$', word):
                tokens.append({
                    'text': word,
                    'id': self._get_token_id(word),
                    'type': 'punctuation'
                })
            else:
                if len(word) <= 4:
                    tokens.append({
                        'text': word,
                        'id': self._get_token_id(word),
                        'type': 'word'
                    })
                else:
                    for i in range(0, len(word), 3):
                        subword = word[i:i+3]
                        tokens.append({
                            'text': subword,
                            'id': self._get_token_id(subword),
                            'type': 'subword'
                        })
        
        return tokens
    
    def _word_tokenize(self, text):
        """Word-level tokenization"""
        tokens = []
        words = text.split()
        
        for word in words:
            tokens.append({
                'text': word,
                'id': self._get_token_id(word),
                'type': 'word'
            })
        
        return tokens
    
    def _char_tokenize(self, text):
        """Character-level tokenization"""
        tokens = []
        
        for char in text:
            tokens.append({
                'text': char,
                'id': self._get_token_id(char),
                'type': 'character'
            })
        
        return tokens
    
    def _get_token_id(self, token):
        """Get or create unique token ID"""
        if token not in self.vocab:
            self.vocab[token] = self.id_counter
            self.id_counter += 1
        return self.vocab[token]
    
    def count_tokens(self, text, strategy='default'):
        """Count number of tokens"""
        return len(self.tokenize(text, strategy))
    
    def get_vocab_size(self):
        """Get current vocabulary size"""
        return len(self.vocab)
    
    def reset_vocab(self):
        """Reset vocabulary and ID counter"""
        self.vocab = {}
        self.id_counter = 0

# Initialize tokenizer
tokenizer = AdvancedTokenizer()

# ==================== Swagger UI Configuration ====================
SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "AI Tokenizer API"
    }
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# ==================== API Endpoints ====================

@app.route('/')
def home():
    """Home endpoint with API information"""
    return jsonify({
        'message': 'AI Tokenizer API',
        'version': '1.0.0',
        'endpoints': {
            'tokenize': '/api/tokenize (POST)',
            'count': '/api/count (POST)',
            'vocab': '/api/vocab (GET)',
            'health': '/health (GET)',
            'docs': '/api/docs (Swagger UI)'
        },
        'documentation': f'{request.host_url}api/docs'
    })

@app.route('/api/tokenize', methods=['POST'])
def tokenize_text():
    """
    Tokenize input text and return detailed token information
    
    Request Body:
        {
            "text": "string (required)",
            "model": "string (optional, default: gpt-4)",
            "strategy": "string (optional: default, word, char)"
        }
    
    Response:
        {
            "tokens": [...],
            "token_count": int,
            "char_count": int,
            "model": "string",
            "timestamp": "string"
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        text = data.get('text', '')
        model = data.get('model', 'gpt-4')
        strategy = data.get('strategy', 'default')
        
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        # Tokenize
        tokens = tokenizer.tokenize(text, strategy)
        
        # Prepare response
        response = {
            'success': True,
            'tokens': tokens,
            'token_ids': [t['id'] for t in tokens],
            'token_count': len(tokens),
            'char_count': len(text),
            'model': model,
            'strategy': strategy,
            'vocab_size': tokenizer.get_vocab_size(),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/count', methods=['POST'])
def count_tokens():
    """
    Count tokens in text without returning full tokenization
    
    Request Body:
        {
            "text": "string (required)",
            "strategy": "string (optional)"
        }
    
    Response:
        {
            "token_count": int,
            "char_count": int
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        text = data.get('text', '')
        strategy = data.get('strategy', 'default')
        
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        count = tokenizer.count_tokens(text, strategy)
        
        return jsonify({
            'success': True,
            'token_count': count,
            'char_count': len(text),
            'strategy': strategy,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/vocab', methods=['GET'])
def get_vocabulary():
    """
    Get current vocabulary statistics
    
    Response:
        {
            "vocab_size": int,
            "total_tokens_processed": int
        }
    """
    return jsonify({
        'success': True,
        'vocab_size': tokenizer.get_vocab_size(),
        'vocabulary': tokenizer.vocab,
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/vocab/reset', methods=['POST'])
def reset_vocabulary():
    """Reset the tokenizer vocabulary"""
    tokenizer.reset_vocab()
    return jsonify({
        'success': True,
        'message': 'Vocabulary reset successfully',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Tokenizer API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/batch', methods=['POST'])
def batch_tokenize():
    """
    Tokenize multiple texts in one request
    
    Request Body:
        {
            "texts": ["string1", "string2", ...],
            "strategy": "string (optional)"
        }
    
    Response:
        {
            "results": [...]
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        texts = data.get('texts', [])
        strategy = data.get('strategy', 'default')
        
        if not texts or not isinstance(texts, list):
            return jsonify({'error': 'texts must be a non-empty array'}), 400
        
        results = []
        for text in texts:
            tokens = tokenizer.tokenize(text, strategy)
            results.append({
                'text': text,
                'tokens': tokens,
                'token_count': len(tokens),
                'char_count': len(text)
            })
        
        return jsonify({
            'success': True,
            'results': results,
            'total_texts': len(texts),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'message': 'The requested URL was not found on the server.'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An internal error occurred. Please try again later.'
    }), 500

# ==================== Run Application ====================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True') == 'True'
    
    print(f"""
    ╔════════════════════════════════════════╗
    ║   AI Tokenizer API Server Started     ║
    ╠════════════════════════════════════════╣
    ║   Server: http://localhost:{port}       ║
    ║   Swagger UI: http://localhost:{port}/api/docs ║
    ║   Health: http://localhost:{port}/health    ║
    ╚════════════════════════════════════════╝
    """)
    
    app.run(host='0.0.0.0', port=port, debug=debug)