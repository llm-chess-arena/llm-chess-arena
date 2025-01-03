const SYSTEM_PROMPT = `You are playing a game of chess. You must analyze the position and choose a valid move from the legal moves available.

CRITICAL REQUIREMENTS:
1. You MUST use Standard Algebraic Notation (SAN)
2. You MUST choose from the provided list of legal moves
3. Your move MUST be exactly as shown in the legal moves list
4. DO NOT modify or reformat the move notation

Example valid responses:
- For pawn moves: "e4", "d5", "exd5"
- For piece moves: "Nf3", "Bc4", "Qd4"
- For castling: "O-O" (kingside), "O-O-O" (queenside)
- For captures: "Bxe4", "Nxc6", "exd5"
- For checks: "Qd7+", "Nf7+"
- For checkmate: "Qh7#"

Common mistakes to AVOID:
- DO NOT use coordinates format (e2e4)
- DO NOT add unnecessary characters (P-e4, PxP)
- DO NOT modify the notation (E4, N-f3)
- DO NOT add unnecessary details (pawn to e4)

JSON:
- ONLY WRITE JSON.
- DO NOT WRITE ANYTHING BEFORE THE JSON OR AFTER THE JSON.
- YOU ONLY OUTPUT VALID JSON CODE. 

RESPONSE FORMAT REQUIREMENTS:
- You MUST return ONLY a valid JSON object
- DO NOT include any text before or after the JSON
- DO NOT wrap the JSON in code blocks or markdown
- DO NOT add any explanatory text
- The response should start with { and end with }

Previous game moves and current position will be provided.
Respond with a JSON object containing your move and reasoning:
{
   "move": "<your chosen move in EXACT SAN format>",
   "reasoning": "<your analysis and explanation>"
}`;

class ChessModelProvider {
   async makeMove({ fen, history, legalMoves }) {
       throw new Error('Method must be implemented');
   }
   
   validateResponse(moveData, legalMoves) {
       if (!moveData?.move || !legalMoves.includes(moveData.move)) {
           throw new Error(`Invalid move: ${moveData?.move}. Must be one of: ${legalMoves.join(', ')}`);
       }
       return moveData;
   }

   async retryWithBackoff(fn, maxRetries = 3) {
       for (let i = 0; i < maxRetries; i++) {
           try {
               return await fn();
           } catch (error) {
               if (i === maxRetries - 1) throw error;
               await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
           }
       }
   }
}

class GroqProvider extends ChessModelProvider {
   constructor(apiKey, model, temperature) {
       super();
       this.apiKey = apiKey;
       this.model = model;
       this.temperature = temperature;
   }

   async makeMove({ fen, history, legalMoves }) {
       return this.retryWithBackoff(async () => {
           const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
               method: 'POST',
               headers: {
                   'Authorization': `Bearer ${this.apiKey}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   messages: [
                       { role: "system", content: SYSTEM_PROMPT },
                       { role: "user", content: this.formatPrompt(fen, history, legalMoves) }
                   ],
                   model: this.model,
                   temperature: parseFloat(this.temperature),
                   max_tokens: 8024,
                   response_format: { type: "json_object" }
               })
           });

           if (!response.ok) {
               throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
           }

           const data = await response.json();
           return this.validateResponse(JSON.parse(data.choices[0].message.content), legalMoves);
       });
   }

   formatPrompt(fen, history, legalMoves) {
       return `Current position (FEN): ${fen}
Game history: ${history || 'Opening position'}
Legal moves: ${legalMoves.join(', ')}

Choose a legal move from the provided list.
Your move MUST match exactly one of the legal moves shown above.
Respond with a JSON containing your chosen move and reasoning.`;
   }
}

class OpenAIProvider extends ChessModelProvider {
   constructor(apiKey, model, temperature) {
       super();
       this.apiKey = apiKey;
       this.model = model;
       this.temperature = temperature;
   }

   async makeMove({ fen, history, legalMoves }) {
       return this.retryWithBackoff(async () => {
           const response = await fetch('https://api.openai.com/v1/chat/completions', {
               method: 'POST',
               headers: {
                   'Authorization': `Bearer ${this.apiKey}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   messages: [
                       { role: "system", content: SYSTEM_PROMPT },
                       { role: "user", content: this.formatPrompt(fen, history, legalMoves) }
                   ],
                   model: this.model,
                   temperature: parseFloat(this.temperature),
                   response_format: { type: "json_object" }
               })
           });

           if (!response.ok) {
               throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
           }

           const data = await response.json();
           return this.validateResponse(JSON.parse(data.choices[0].message.content), legalMoves);
       });
   }

   formatPrompt(fen, history, legalMoves) {
       return `Current position (FEN): ${fen}
Game history: ${history || 'Opening position'}
Legal moves: ${legalMoves.join(', ')}

Choose a legal move from the provided list.
Your move MUST match exactly one of the legal moves shown above.
Respond with a JSON containing your chosen move and reasoning.`;
   }
}

class GrokProvider extends ChessModelProvider {
   constructor(apiKey, model, temperature) {
       super();
       this.apiKey = apiKey;
       this.model = model;
       this.temperature = temperature;
   }

   async makeMove({ fen, history, legalMoves }) {
       return this.retryWithBackoff(async () => {
           const response = await fetch('https://api.x.ai/v1/chat/completions', {
               method: 'POST',
               headers: {
                   'Authorization': `Bearer ${this.apiKey}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   messages: [
                       { role: "system", content: SYSTEM_PROMPT },
                       { role: "user", content: this.formatPrompt(fen, history, legalMoves) }
                   ],
                   model: this.model,
                   temperature: parseFloat(this.temperature),
                   stream: false
               })
           });

           if (!response.ok) {
               throw new Error(`Grok API Error: ${response.status} ${response.statusText}`);
           }

           const data = await response.json();
           return this.validateResponse(JSON.parse(data.choices[0].message.content), legalMoves);
       });
   }

   formatPrompt(fen, history, legalMoves) {
       return `Current position (FEN): ${fen}
Game history: ${history || 'Opening position'}
Legal moves: ${legalMoves.join(', ')}

Choose a legal move from the provided list.
Your move MUST match exactly one of the legal moves shown above.
Respond with a JSON containing your chosen move and reasoning.`;
   }
}

class GeminiProvider extends ChessModelProvider {
    constructor(apiKey, model, temperature) {
        super();
        this.apiKey = apiKey;
        this.model = model;
        this.temperature = temperature;
    }

    async makeMove({ fen, history, legalMoves }) {
        return this.retryWithBackoff(async () => {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: SYSTEM_PROMPT }]
                        },
                        {
                            role: 'user',
                            parts: [{ text: this.formatPrompt(fen, history, legalMoves) }]
                        }
                    ],
                    generationConfig: {
                        temperature: parseFloat(this.temperature),
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 8192,
                        stopSequences: []
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response format from Gemini API');
            }

            let responseText = data.candidates[0].content.parts[0].text;
            responseText = responseText.replace(/```json\s*|\s*```/g, '').trim();
            const moveData = JSON.parse(responseText);

            return this.validateResponse(moveData, legalMoves);
        });
    }

    formatPrompt(fen, history, legalMoves) {
        return `Current position (FEN): ${fen}
Game history: ${history || 'Opening position'}
Legal moves: ${legalMoves.join(', ')}

Choose a legal move from the provided list.
Your move MUST match exactly one of the legal moves shown above.
Respond with a JSON containing your chosen move and reasoning.`;
    }
}

class ChessProviderFactory {
   static MODELS = {
       'Groq LLaMa 3.3 70B Versatile': {
           provider: 'groq',
           modelId: 'llama-3.3-70b-versatile',
           tempRange: { min: 0.1, max: 1.0 }
       },
       'Groq LLaMa 3.3 70B SpecDec': {
           provider: 'groq',
           modelId: 'llama-3.3-70b-specdec',
           tempRange: { min: 0.1, max: 1.0 }
       },
       'OpenAI Gpt-4': {
           provider: 'openai',
           modelId: 'gpt-4',
           tempRange: { min: 0.1, max: 1.0 }
       },
       'Gemini Pro': {
           provider: 'gemini',
           modelId: 'gemini-2.0-flash-exp',
           tempRange: { min: 0.1, max: 1.0 }
       },
       'xAI Grok': {
           provider: 'grok',
           modelId: 'grok-beta',
           tempRange: { min: 0.1, max: 1.0 }
       }
   };

   static createProvider(modelName, apiKey, temperature) {
       const config = this.MODELS[modelName];
       if (!config) throw new Error(`Unknown model: ${modelName}`);

       switch(config.provider) {
           case 'groq':
               return new GroqProvider(apiKey, config.modelId, temperature);
           case 'openai':
               return new OpenAIProvider(apiKey, config.modelId, temperature);
           case 'gemini':
               return new GeminiProvider(apiKey, config.modelId, temperature);
           case 'grok':
               return new GrokProvider(apiKey, config.modelId, temperature);
           default:
               throw new Error(`Unknown provider: ${config.provider}`);
       }
   }

   static getModels() {
       return Object.keys(this.MODELS);
   }

   static getTempRange(modelName) {
       return this.MODELS[modelName]?.tempRange || { min: 0.1, max: 1.0 };
   }

   static getProviderFromModel(modelName) {
       return this.MODELS[modelName]?.provider;
   }
}

class ChessGame {
   constructor() {
       this.game = new Chess();
       this.board = null;
       this.currentPlayer = 'white';
       this.moveCount = 1;
       this.autoPlayInterval = null;
       this.isProcessingMove = false;
       this.debugMode = false;
       this.selectedPiece = null;
       this.legalMoves = new Map();

       this.initializeBoard();
       this.initializeControls();
       this.populateModelDropdowns();
       this.loadSettings();
       this.loadSavedApiKeys();
       ['1', '2'].forEach(playerNum => this.updateApiKeyButtons(playerNum));
       this.updatePlayerControls();
   }

   initializeBoard() {
       const config = {
           position: 'start',
           showNotation: true,
           pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
           draggable: true,
           onDragStart: (source, piece) => this.onDragStart(source, piece),
           onDrop: (source, target) => this.onDrop(source, target),
           onMouseoutSquare: () => this.onMouseoutSquare(),
           onMouseoverSquare: (square) => this.onMouseoverSquare(square),
           onSnapEnd: () => this.board.position(this.game.fen())
       };

       this.board = Chessboard('board', config);
       $(window).resize(() => this.board.resize());
   }

   updateApiKeyButtons(playerNum) {
       const apiKeyInput = document.getElementById(`apiKey${playerNum}`);
       const modelSelect = document.getElementById(`model${playerNum}`);
       const provider = ChessProviderFactory.getProviderFromModel(modelSelect.value);
       const savedKey = provider ? localStorage.getItem(`${provider}_api_key`) : null;
       const saveButton = document.getElementById(`saveApiKey${playerNum}`);
       const clearButton = document.getElementById(`clearApiKey${playerNum}`);

       saveButton.style.display = (apiKeyInput.value && apiKeyInput.value !== savedKey) ? 'inline-block' : 'none';
       clearButton.style.display = savedKey ? 'inline-block' : 'none';
   }

   saveApiKey(playerNum) {
       const apiKeyInput = document.getElementById(`apiKey${playerNum}`);
       const modelSelect = document.getElementById(`model${playerNum}`);
       const provider = ChessProviderFactory.getProviderFromModel(modelSelect.value);
       
       if (apiKeyInput.value && provider) {
           localStorage.setItem(`${provider}_api_key`, apiKeyInput.value);
           this.logDebug(`Saved API key for ${provider}`);
           this.updateApiKeyButtons(playerNum);
       }
   }

   clearApiKey(playerNum) {
       const modelSelect = document.getElementById(`model${playerNum}`);
       const provider = ChessProviderFactory.getProviderFromModel(modelSelect.value);
       
       if (provider) {
           localStorage.removeItem(`${provider}_api_key`);
           document.getElementById(`apiKey${playerNum}`).value = '';
           this.logDebug(`Cleared API key for ${provider}`);
           this.updateApiKeyButtons(playerNum);
       }
   }

   loadApiKeyForModel(modelSelect) {
       const playerNum = modelSelect.id === 'model1' ? '1' : '2';
       const provider = ChessProviderFactory.getProviderFromModel(modelSelect.value);
       const savedKey = provider ? localStorage.getItem(`${provider}_api_key`) : null;
       
       const apiKeyInput = document.getElementById(`apiKey${playerNum}`);
       apiKeyInput.value = savedKey || '';
       this.updateApiKeyButtons(playerNum);
   }

   onDragStart(source, piece) {
       const playerType = this.currentPlayer === 'white' ? 
           document.getElementById('playerType1').value :
           document.getElementById('playerType2').value;

       if (playerType !== 'human') return false;
       if (this.game.game_over()) return false;
       if ((this.currentPlayer === 'white' && piece.search(/^b/) !== -1) ||
           (this.currentPlayer === 'black' && piece.search(/^w/) !== -1)) {
           return false;
       }
       return true;
   }

   onMouseoverSquare(square) {
       const playerType = this.currentPlayer === 'white' ? 
           document.getElementById('playerType1').value :
           document.getElementById('playerType2').value;

       if (playerType !== 'human') return;

       const moves = this.game.moves({
           square: square,
           verbose: true
       });

       if (moves.length === 0) return;

       this.greySquare(square);

       for (let i = 0; i < moves.length; i++) {
           this.greySquare(moves[i].to);
       }
   }

   onMouseoutSquare() {
       $('.square-55d63').css('background', '');
   }

   greySquare(square) {
       const $square = $('.square-' + square);
       const background = $square.hasClass('black-3c85d') ? '#696969' : '#a9a9a9';
       $square.css('background', background);
   }

   onDrop(source, target) {
       const playerType = this.currentPlayer === 'white' ? 
           document.getElementById('playerType1').value :
           document.getElementById('playerType2').value;

       if (playerType !== 'human') return 'snapback';

       const move = this.game.move({
           from: source,
           to: target,
           promotion: 'q'
       });

       if (move === null) return 'snapback';

       this.logMove({
           move: move.san,
           reasoning: "Human player's move"
       });

       this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
       if (this.currentPlayer === 'white') this.moveCount++;
       this.updateStatus();

       if (this.game.game_over()) {
           this.handleGameOver();
           return;
       }

       const nextPlayerType = this.currentPlayer === 'white' ? 
           document.getElementById('playerType1').value :
           document.getElementById('playerType2').value;

       if (nextPlayerType === 'ai') {
           setTimeout(() => this.makeMove(), 500);
       }
   }

   populateModelDropdowns() {
       const models = ChessProviderFactory.getModels();
       ['model1', 'model2'].forEach(id => {
           const select = document.getElementById(id);
           select.innerHTML = '';
           models.forEach(model => {
               const option = document.createElement('option');
               option.value = model;
               option.textContent = model;
               select.appendChild(option);
           });
           select.addEventListener('change', (e) => {
               this.updateTempRange(e.target);
               this.loadApiKeyForModel(e.target);
           });
       });
   }

   updateTempRange(modelSelect) {
       const player = modelSelect.id === 'model1' ? 1 : 2;
       const tempRange = ChessProviderFactory.getTempRange(modelSelect.value);
       const tempInput = document.getElementById(`temp${player}`);
       tempInput.min = tempRange.min;
       tempInput.max = tempRange.max;
       tempInput.value = (tempRange.min + tempRange.max) / 2;
       document.getElementById(`temp${player}Value`).textContent = tempInput.value;
   }

   initializeControls() {
       document.getElementById('startBtn').addEventListener('click', () => this.startNewGame());
       document.getElementById('stepBtn').addEventListener('click', () => this.makeMove());
       document.getElementById('copyPgn').addEventListener('click', () => this.copyPgnToClipboard());
       document.getElementById('autoPlay').addEventListener('change', (e) => this.toggleAutoPlay(e.target.checked));
       document.getElementById('debugMode').addEventListener('change', (e) => {
           this.debugMode = e.target.checked;
           this.logDebug('Debug mode ' + (this.debugMode ? 'enabled' : 'disabled'));
       });
       
       ['temp1', 'temp2'].forEach(id => {
           document.getElementById(id).addEventListener('input', (e) => {
               document.getElementById(id + 'Value').textContent = e.target.value;
           });
       });

       ['playerType1', 'playerType2'].forEach(id => {
           document.getElementById(id).addEventListener('change', () => {
               this.updatePlayerControls();
               this.saveSettings();
           });
       });

       ['1', '2'].forEach(playerNum => {
           document.getElementById(`apiKey${playerNum}`).addEventListener('input', () => {
               this.updateApiKeyButtons(playerNum);
           });

           document.getElementById(`saveApiKey${playerNum}`).addEventListener('click', () => {
               this.saveApiKey(playerNum);
           });
           document.getElementById(`clearApiKey${playerNum}`).addEventListener('click', () => {
               this.clearApiKey(playerNum);
           });
       });

       ['apiKey1', 'model1', 'temp1', 'apiKey2', 'model2', 'temp2'].forEach(id => {
           document.getElementById(id).addEventListener('change', () => this.saveSettings());
       });
   }

   updatePlayerControls() {
       ['1', '2'].forEach(player => {
           const playerType = document.getElementById(`playerType${player}`).value;
           const aiSettings = document.getElementById(`aiSettings${player}`);
           aiSettings.style.display = playerType === 'ai' ? 'block' : 'none';
       });

       const currentPlayerNum = this.currentPlayer === 'white' ? '1' : '2';
       const currentPlayerType = document.getElementById(`playerType${currentPlayerNum}`).value;
       document.getElementById('stepBtn').disabled = currentPlayerType !== 'ai' || this.game.game_over();
   }

   loadSettings() {
       const settings = JSON.parse(localStorage.getItem('chessSettings') || '{}');
       ['playerType1', 'model1', 'temp1', 'playerType2', 'model2', 'temp2'].forEach(key => {
           const element = document.getElementById(key);
           if (settings[key]) {
               element.value = settings[key];
               if (key.startsWith('temp')) {
                   document.getElementById(key + 'Value').textContent = settings[key];
               }
           }
       });
       this.updatePlayerControls();
   }

   loadSavedApiKeys() {
       ['1', '2'].forEach(playerNum => {
           const modelSelect = document.getElementById(`model${playerNum}`);
           const provider = ChessProviderFactory.getProviderFromModel(modelSelect.value);
           if (provider) {
               const savedKey = localStorage.getItem(`${provider}_api_key`);
               if (savedKey) {
                   document.getElementById(`apiKey${playerNum}`).value = savedKey;
                   this.logDebug(`Loaded saved API key for ${provider}`);
               }
           }
       });
   }

   saveSettings() {
       const settings = {
           playerType1: document.getElementById('playerType1').value,
           model1: document.getElementById('model1').value,
           temp1: document.getElementById('temp1').value,
           playerType2: document.getElementById('playerType2').value,
           model2: document.getElementById('model2').value,
           temp2: document.getElementById('temp2').value
       };
       localStorage.setItem('chessSettings', JSON.stringify(settings));
       this.updatePlayerControls();
   }

   async makeMove() {
       if (this.isProcessingMove || this.game.game_over()) return false;
       this.isProcessingMove = true;
       document.getElementById('stepBtn').disabled = true;

       try {
           const player = this.currentPlayer === 'white' ? 1 : 2;
           const playerType = document.getElementById(`playerType${player}`).value;

           if (playerType === 'human') {
               this.isProcessingMove = false;
               document.getElementById('stepBtn').disabled = false;
               return false;
           }

           const modelName = document.getElementById(`model${player}`).value;
           const apiKey = document.getElementById(`apiKey${player}`).value;
           const temperature = document.getElementById(`temp${player}`).value;

           if (!apiKey) {
               throw new Error(`API key required for ${this.currentPlayer} player`);
           }

           const provider = ChessProviderFactory.createProvider(modelName, apiKey, temperature);
           const moveData = await provider.makeMove({
               fen: this.game.fen(),
               history: this.game.history().join(' '),
               legalMoves: this.game.moves()
           });

           const move = this.game.move(moveData.move);
           if (!move) throw new Error('Move validation failed');

           this.board.position(this.game.fen());
           this.logMove(moveData);

           this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
           if (this.currentPlayer === 'white') this.moveCount++;
           this.updateStatus();

           if (this.game.game_over()) {
               this.handleGameOver();
               return false;
           }

           const nextPlayerType = this.currentPlayer === 'white' ? 
               document.getElementById('playerType1').value :
               document.getElementById('playerType2').value;

           if (nextPlayerType === 'ai' && document.getElementById('autoPlay').checked) {
               return true;
           }

           return false;
       } catch (error) {
           this.logError(error);
           return false;
       } finally {
           this.isProcessingMove = false;
           document.getElementById('stepBtn').disabled = false;
           this.updatePlayerControls();
       }
   }

   toggleAutoPlay(enabled) {
       if (enabled && !this.game.game_over()) {
           const delay = parseInt(document.getElementById('moveDelay').value);
           this.autoPlayInterval = setInterval(async () => {
               if (this.game.game_over() || !document.getElementById('autoPlay').checked) {
                   this.toggleAutoPlay(false);
                   document.getElementById('autoPlay').checked = false;
                   return;
               }
               
               const playerType = this.currentPlayer === 'white' ? 
                   document.getElementById('playerType1').value :
                   document.getElementById('playerType2').value;

               if (playerType === 'ai') {
                   const shouldContinue = await this.makeMove();
                   if (!shouldContinue) {
                       this.toggleAutoPlay(false);
                       document.getElementById('autoPlay').checked = false;
                   }
               }
           }, delay);
       } else if (this.autoPlayInterval) {
           clearInterval(this.autoPlayInterval);
           this.autoPlayInterval = null;
       }
   }

   startNewGame() {
       if (this.autoPlayInterval) {
           this.toggleAutoPlay(false);
       }
       this.game = new Chess();
       this.board.position('start');
       this.currentPlayer = 'white';
       this.moveCount = 1;
       document.getElementById('reasoningLog').innerHTML = '';
       document.getElementById('stepBtn').disabled = false;
       document.getElementById('autoPlay').checked = false;
       this.isProcessingMove = false;
       this.logDebug('Starting new game');
       this.updateStatus();
       this.updatePlayerControls();

       const whitePlayerType = document.getElementById('playerType1').value;
       if (whitePlayerType === 'ai') {
           setTimeout(() => this.makeMove(), 500);
       }
   }

   handleGameOver() {
       this.toggleAutoPlay(false);
       document.getElementById('autoPlay').checked = false;
       document.getElementById('stepBtn').disabled = true;
       let result = '';
       if (this.game.in_checkmate()) {
           result = `Checkmate! ${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
       } else if (this.game.in_draw()) {
           result = "Game ended in a draw!";
       } else if (this.game.in_stalemate()) {
           result = "Game ended in stalemate!";
       }
       
       this.logMessage(result);
       this.logDebug(`Game over: ${result}`);
       this.updateStatus();
   }

   updateStatus() {
       document.getElementById('turnIndicator').textContent = `Turn: ${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}`;
       document.getElementById('moveIndicator').textContent = `Move: ${this.moveCount}`;
       let status = 'In Progress';

       if (this.game.in_checkmate()) status = 'Checkmate';
       else if (this.game.in_check()) status = 'Check';
       else if (this.game.in_draw()) status = 'Draw';
       else if (this.game.in_stalemate()) status = 'Stalemate';
       document.getElementById('gameStatus').textContent = `Status: ${status}`;
       this.updatePlayerControls();
   }

   logMove(moveData) {
       const reasoningLog = document.getElementById('reasoningLog');
       const entry = document.createElement('div');
       entry.className = `move-entry ${this.currentPlayer}`;
       
       const playerNum = this.currentPlayer === 'white' ? '1' : '2';
       const playerType = document.getElementById(`playerType${playerNum}`).value;
       const modelName = playerType === 'ai' ? 
           ` (${document.getElementById(`model${playerNum}`).value})` : 
           ' (Human)';

       entry.innerHTML = `
           <strong>${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} Move ${this.moveCount}:</strong> ${moveData.move}${modelName}<br>
           <strong>Reasoning:</strong> ${moveData.reasoning}
       `;
       reasoningLog.insertBefore(entry, reasoningLog.firstChild);
   }

   logError(error) {
       const entry = document.createElement('div');
       entry.className = 'move-entry error';
       entry.innerHTML = `<strong>Error:</strong> ${error.message}`;
       document.getElementById('reasoningLog').insertBefore(entry, reasoningLog.firstChild);
   }

   logMessage(message) {
       const entry = document.createElement('div');
       entry.className = 'move-entry';
       entry.innerHTML = `<strong>Game:</strong> ${message}`;
       document.getElementById('reasoningLog').insertBefore(entry, reasoningLog.firstChild);
   }

    logDebug(message) {
       if (!this.debugMode) return;
       const entry = document.createElement('div');
       entry.className = 'move-entry debug';
       entry.innerHTML = `<strong>[DEBUG]:</strong> ${message}`;
       document.getElementById('reasoningLog').insertBefore(entry, reasoningLog.firstChild);
   }

   copyPgnToClipboard() {
       const pgn = this.game.pgn();
       navigator.clipboard.writeText(pgn)
           .then(() => this.logMessage('PGN copied to clipboard'))
           .catch(error => this.logError('Failed to copy PGN'));
   }
}

window.addEventListener('load', () => {
   window.game = new ChessGame();
});
