const API_KEY = 'AIzaSyD-7dCWH87SoD8tbHboZ8lonXWvz0ij1QQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class LanguageLearningApp {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeSpeechRecognition();
        this.initializeTypingAnimation();
        this.initializeSpeechSynthesis();
    }

    initializeElements() {
        this.chatContainer = document.getElementById('chatContainer');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.voiceButton = document.getElementById('voiceButton');
        this.targetLanguage = document.getElementById('targetLanguage');
        this.isListening = false;
        this.isProcessing = false;
        this.lastSpokenText = '';
    }

    initializeSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.synth = window.speechSynthesis;
            this.voices = [];
            
            // Wait for voices to be loaded
            speechSynthesis.addEventListener('voiceschanged', () => {
                this.voices = speechSynthesis.getVoices();
            });
        }
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

        // Add language change listener
        this.targetLanguage.addEventListener('change', () => {
            this.addMessage(`Switched to ${this.targetLanguage.options[this.targetLanguage.selectedIndex].text}. Let's practice!`, 'ai');
            if (this.recognition) {
                this.recognition.lang = this.getLanguageCode(this.targetLanguage.value);
            }
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
            this.recognition.interimResults = true;
            this.recognition.lang = this.getLanguageCode(this.targetLanguage.value);

            this.recognition.onstart = () => {
                this.voiceButton.classList.add('active');
                this.addMessage('Listening... Speak in ' + this.targetLanguage.options[this.targetLanguage.selectedIndex].text, 'ai', true);
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                
                if (event.results[0].isFinal) {
                    this.lastSpokenText = transcript;
                    this.handleUserInput(true);
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceButton.classList.remove('active');
                if (this.chatContainer.lastChild.textContent.startsWith('Listening...')) {
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

    async handleUserInput(isVoiceInput = false) {
        const userMessage = this.userInput.value.trim();
        if (!userMessage || this.isProcessing) return;

        this.addMessage(userMessage, 'user');
        this.userInput.value = '';
        this.sendButton.style.opacity = '0.5';

        const targetLang = this.targetLanguage.value;
        await this.getAIResponse(userMessage, targetLang, isVoiceInput);
    }

    addMessage(text, sender, isTemporary = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        if (isTemporary) {
            messageDiv.classList.add('temporary');
        }

        // Create message content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;

        // Create actions container for AI messages
        if (sender === 'ai' && !isTemporary) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            // Add listen button
            const listenButton = document.createElement('button');
            listenButton.className = 'action-button';
            listenButton.innerHTML = '<span class="material-icons-round">volume_up</span>';
            listenButton.title = 'Listen to pronunciation';
            listenButton.onclick = () => this.speakText(text, this.targetLanguage.value);
            
            // Add copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'action-button';
            copyButton.innerHTML = '<span class="material-icons-round">content_copy</span>';
            copyButton.title = 'Copy to clipboard';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(text);
                copyButton.innerHTML = '<span class="material-icons-round">check</span>';
                setTimeout(() => {
                    copyButton.innerHTML = '<span class="material-icons-round">content_copy</span>';
                }, 2000);
            };

            actionsDiv.appendChild(listenButton);
            actionsDiv.appendChild(copyButton);
            messageDiv.appendChild(actionsDiv);
        }

        messageDiv.appendChild(contentDiv);
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

    speakText(text, targetLanguage) {
        if (!this.synth) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getLanguageCode(targetLanguage);
        utterance.rate = 0.9;
        utterance.pitch = 1;

        // Find the best voice for the language
        const voices = this.voices.filter(voice => voice.lang.startsWith(this.getLanguageCode(targetLanguage)));
        if (voices.length > 0) {
            utterance.voice = voices[0];
        }

        this.synth.speak(utterance);
    }

    async getAIResponse(userMessage, targetLanguage, isVoiceInput) {
        try {
            this.isProcessing = true;
            this.showTypingIndicator();

            const prompt = `You are a helpful language learning assistant. The user is learning ${targetLanguage}. 
                          ${isVoiceInput ? "The user spoke this message, so please pay special attention to pronunciation feedback. " : ""}
                          
                          Instructions:
                          1. If the message is in English:
                             - Provide the translation
                             - Add pronunciation guide using IPA
                             - Give a simple example of usage
                          2. If the message is in ${targetLanguage}:
                             - Correct any grammar or pronunciation mistakes
                             - Explain the corrections in English
                             - Suggest alternative phrases if applicable
                          
                          Keep responses concise and friendly. Format the response clearly with bullet points or sections.
                          
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

            // Automatically speak the translation or correction
            if (isVoiceInput) {
                // Extract the translation/correction (first line after a bullet point or number)
                const firstLine = aiResponse.split('\n').find(line => 
                    line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim())
                );
                if (firstLine) {
                    const textToSpeak = firstLine.replace(/^[•\-\d\.\s]+/, '').trim();
                    setTimeout(() => this.speakText(textToSpeak, targetLanguage), 1000);
                }
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