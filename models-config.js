/**
 * Models Configuration File
 * 
 * This file contains all the model configurations for the LLM Chess Arena.
 * You can easily add or modify models by editing this file.
 */

const PROVIDER_CONFIG = {
    'groq': {
        displayName: 'Groq',
        models: {
            'llama-3.3-70b-versatile': {
                displayName: 'LLaMa 3.3 70B Versatile',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'llama-3.3-70b-specdec': {
                displayName: 'LLaMa 3.3 70B SpecDec',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'llama-3.1-8b': {
                displayName: 'LLaMa 3.1 8B',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'mixtral-8x7b-32768': {
                displayName: 'Mixtral 8x7B',
                tempRange: { min: 0.1, max: 1.0 }
            }
        }
    },
    'openai': {
        displayName: 'OpenAI',
        models: {
            'gpt-4': {
                displayName: 'GPT-4',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'gpt-4-turbo': {
                displayName: 'GPT-4 Turbo',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'gpt-4o': {
                displayName: 'GPT-4o',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'gpt-3.5-turbo': {
                displayName: 'GPT-3.5 Turbo',
                tempRange: { min: 0.1, max: 1.0 }
            }
        }
    },
    'gemini': {
        displayName: 'Google Gemini',
        models: {
            'gemini-2.0-flash-exp': {
                displayName: 'Gemini Flash',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'gemini-2.0-pro-exp': {
                displayName: 'Gemini Pro',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'gemini-2.0-ultra-exp': {
                displayName: 'Gemini Ultra',
                tempRange: { min: 0.1, max: 1.0 }
            }
        }
    },
    'grok': {
        displayName: 'xAI Grok',
        models: {
            'grok-beta': {
                displayName: 'Grok Beta',
                tempRange: { min: 0.1, max: 1.0 }
            }
        }
    },
    'openrouter': {
        displayName: 'OpenRouter',
        models: {
            'anthropic/claude-3-opus:beta': {
                displayName: 'Claude 3 Opus',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'anthropic/claude-3-sonnet': {
                displayName: 'Claude 3 Sonnet',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'anthropic/claude-3-haiku': {
                displayName: 'Claude 3 Haiku',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'meta-llama/llama-3-70b-instruct': {
                displayName: 'Llama 3 70B',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'meta-llama/llama-3-8b-instruct': {
                displayName: 'Llama 3 8B',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'mistralai/mistral-large': {
                displayName: 'Mistral Large',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'mistralai/mistral-8x7b': {
                displayName: 'Mistral 8x7B',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'google/gemini-1.5-pro-latest': {
                displayName: 'Gemini 1.5 Pro',
                tempRange: { min: 0.1, max: 1.0 }
            },
            'google/gemini-1.5-flash-latest': {
                displayName: 'Gemini 1.5 Flash',
                tempRange: { min: 0.1, max: 1.0 }
            }
        }
    }
};

// Export the configuration
if (typeof module !== 'undefined') {
    module.exports = { PROVIDER_CONFIG };
}
