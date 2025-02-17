const API_KEY = 'AIzaSyD-7dCWH87SoD8tbHboZ8lonXWvz0ij1QQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class LanguageLearningApp {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeSpeechRecognition();
        this.initializeTypingAnimation();
    }

    initializeElements() {
        this.chatContainer = document.getElementById('chatContainer');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.voiceButton = document.getElementById('voiceButton');
        this.targetLanguage = document.getElementById('targetLanguage');
        this.isListening = false;
        this.isProcessing = false;
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.voiceButton.addEventListener('click', () => this.toggleVoiceInput());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });
        this.userInput.addEventListener('input', () => {
            this.sendButton.style.opacity = this.userInput.value.trim() ? '1' : '0.5';
        });
    }

    initializeTypingAnimation() {
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'message ai-message typing-indicator';
        this.typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.voiceButton.classList.add('active');
                this.addMessage('Listening...', 'ai', true);
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.handleUserInput();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceButton.classList.remove('active');
                // Remove the "Listening..." message
                if (this.chatContainer.lastChild.textContent === 'Listening...') {
                    this.chatContainer.removeChild(this.chatContainer.lastChild);
                }
            };

            this.recognition.onerror = (event) => {
                if (event.error !== 'no-speech') {
                    this.addMessage('Error with speech recognition. Please try again.', 'ai');
                }
                this.voiceButton.classList.remove('active');
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
        } else {
            this.recognition.start();
            this.isListening = true;
        }
    }

    async handleUserInput() {
        const userMessage = this.userInput.value.trim();
        if (!userMessage || this.isProcessing) return;

        this.addMessage(userMessage, 'user');
        this.userInput.value = '';
        this.sendButton.style.opacity = '0.5';

        const targetLang = this.targetLanguage.value;
        await this.getAIResponse(userMessage, targetLang);
    }

    addMessage(text, sender, isTemporary = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        if (isTemporary) {
            messageDiv.classList.add('temporary');
        }
        messageDiv.textContent = text;
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.chatContainer.appendChild(this.typingIndicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        if (this.typingIndicator.parentNode === this.chatContainer) {
            this.chatContainer.removeChild(this.typingIndicator);
        }
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    async getAIResponse(userMessage, targetLanguage) {
        try {
            this.isProcessing = true;
            this.showTypingIndicator();

            const prompt = `You are a helpful language learning assistant. The user is learning ${targetLanguage}. 
                          Help them practice and learn the language. If they write in English, provide translations 
                          and explanations in ${targetLanguage}. If they write in ${targetLanguage}, correct any 
                          mistakes and provide feedback in English. Keep responses concise and friendly.
                          
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
            
            this.removeTypingIndicator();
            this.addMessage(aiResponse, 'ai');

            // Text-to-speech for the AI response
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(aiResponse);
                utterance.lang = this.getLanguageCode(targetLanguage);
                utterance.rate = 0.9; // Slightly slower for better comprehension
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        } finally {
            this.isProcessing = false;
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