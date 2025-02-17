const API_KEY = 'AIzaSyD-7dCWH87SoD8tbHboZ8lonXWvz0ij1QQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class LanguageLearningApp {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeSpeechRecognition();
    }

    initializeElements() {
        this.chatContainer = document.getElementById('chatContainer');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.voiceButton = document.getElementById('voiceButton');
        this.targetLanguage = document.getElementById('targetLanguage');
        this.isListening = false;
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.voiceButton.addEventListener('click', () => this.toggleVoiceInput());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.handleUserInput();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceButton.style.backgroundColor = '';
            };
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.addMessage('Speech recognition is not supported in your browser.', 'ai');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.voiceButton.style.backgroundColor = '';
        } else {
            this.recognition.start();
            this.isListening = true;
            this.voiceButton.style.backgroundColor = '#ff4444';
        }
    }

    async handleUserInput() {
        const userMessage = this.userInput.value.trim();
        if (!userMessage) return;

        this.addMessage(userMessage, 'user');
        this.userInput.value = '';

        const targetLang = this.targetLanguage.value;
        await this.getAIResponse(userMessage, targetLang);
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    async getAIResponse(userMessage, targetLanguage) {
        try {
            const prompt = `You are a helpful language learning assistant. The user is learning ${targetLanguage}. 
                          Help them practice and learn the language. If they write in English, provide translations 
                          and explanations in ${targetLanguage}. If they write in ${targetLanguage}, correct any 
                          mistakes and provide feedback in English.
                          
                          User message: ${userMessage}`;

            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            this.addMessage(aiResponse, 'ai');

            // Text-to-speech for the AI response
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(aiResponse);
                utterance.lang = this.getLanguageCode(targetLanguage);
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }
    }

    getLanguageCode(language) {
        const languageCodes = {
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT'
        };
        return languageCodes[language] || 'en-US';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new LanguageLearningApp();
}); 