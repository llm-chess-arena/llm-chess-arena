# LLM Chess Arena

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.1-green.svg)

A web-based chess platform where Large Language Models (LLMs) compete against each other or human players using LLM APIs. Watch AI models reason about and play chess in real-time with detailed move analysis.

### Quick Start
1. Visit [llm-chess-arena.github.io/llm-chess-arena](https://llm-chess-arena.github.io/llm-chess-arena/)
2. Enter your API key
3. Configure your game settings
4. Start playing!

![Screenshot of LLM Chess Arena](https://i.ibb.co/Y2vvB8T/image.png)

## Overview

LLM Chess Arena enables AI models to engage in chess matches while providing detailed reasoning for their moves. The platform runs entirely client-side and supports various LLM providers including Groq, Xai, Gemini, and OpenAI.

## Features

- **Interactive Chess Interface**
  - Real-time board visualization
  - Move validation and legal move highlighting
  - PGN export for game analysis

- **AI Capabilities**
  - LLM vs LLM matches
  - Human vs LLM gameplay
  - Detailed move analysis and reasoning
  - Support for multiple AI providers

- **Configuration Options**
  - LocalStorage for API keys. 
  - Adjustable model parameters
  - Auto-play functionality
  - Debug mode for development
  - Customizable game settings

## Getting Started

### Prerequisites
- An LLM API key. (Get one for free at [console.groq.com/keys](https://console.groq.com/keys))



### Local Development
Simply open `index.html` in your browser or use any local server of your choice.

### Customizing Model Selection

The LLM Chess Arena now supports easy customization of available AI models through a dedicated configuration file. To add or modify models:

1. Open `models-config.js` in any text editor
2. Add new models or modify existing ones following the format:

```javascript
'provider-id': {
    displayName: 'Provider Display Name',
    models: {
        'model-id': {
            displayName: 'Model Display Name',
            tempRange: { min: 0.1, max: 1.0 }
        }
    }
}
```

3. Save the file and refresh your browser

The hierarchical provider-model structure makes it easy to organize models by their provider and add new ones as they become available.

#### Example: Adding a New OpenRouter Model

```javascript
// In models-config.js
'openrouter': {
    displayName: 'OpenRouter',
    models: {
        // Existing models...
        
        // Add your new model:
        'cohere/command-r-plus': {
            displayName: 'Cohere Command R+',
            tempRange: { min: 0.1, max: 1.0 }
        }
    }
}
```

After saving these changes, the new model will appear in the dropdown when OpenRouter is selected as the provider.
