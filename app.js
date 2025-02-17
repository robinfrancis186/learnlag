const API_KEY = 'AIzaSyD-7dCWH87SoD8tbHboZ8lonXWvz0ij1QQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class LanguageLearningApp {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeSpeechRecognition();
        this.initializeTypingAnimation();
        this.initializeSpeechSynthesis();
        this.initializeUserProgress();
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
        this.learningHistory = [];
        this.currentSession = {
            startTime: new Date(),
            interactions: 0,
            correctUses: 0,
            mistakes: [],
            practicedPhrases: new Set()
        };
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

    initializeUserProgress() {
        // Load user progress from localStorage
        const savedProgress = localStorage.getItem('learningProgress');
        if (savedProgress) {
            this.userProgress = JSON.parse(savedProgress);
        } else {
            this.userProgress = {
                languages: {},
                lastSession: null,
                commonMistakes: {},
                strengthAreas: {},
                weakAreas: {},
                vocabulary: {},
                streak: 0,
                lastPracticeDate: null
            };
        }

        // Initialize progress for current language if not exists
        const currentLang = this.targetLanguage.value;
        if (!this.userProgress.languages[currentLang]) {
            this.userProgress.languages[currentLang] = {
                level: 'beginner',
                vocabularySize: 0,
                grammarAccuracy: 0,
                pronunciationScore: 0,
                practiceHistory: []
            };
        }

        // Update streak
        this.updateStreak();
    }

    updateStreak() {
        const today = new Date().toDateString();
        if (this.userProgress.lastPracticeDate) {
            const lastPractice = new Date(this.userProgress.lastPracticeDate).toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            
            if (today === lastPractice) {
                // Already practiced today
                return;
            } else if (yesterday === lastPractice) {
                // Practiced yesterday, increment streak
                this.userProgress.streak++;
            } else {
                // Streak broken
                this.userProgress.streak = 1;
            }
        } else {
            // First time practicing
            this.userProgress.streak = 1;
        }
        
        this.userProgress.lastPracticeDate = today;
        this.saveProgress();

        if (this.userProgress.streak > 1) {
            this.addMessage(`🔥 ${this.userProgress.streak} day streak! Keep it up!`, 'ai');
        }
    }

    saveProgress() {
        localStorage.setItem('learningProgress', JSON.stringify(this.userProgress));
    }

    updateLanguageProgress(response, userMessage, isCorrect = true) {
        const currentLang = this.targetLanguage.value;
        const langProgress = this.userProgress.languages[currentLang];

        // Update vocabulary
        const words = userMessage.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (!this.userProgress.vocabulary[word]) {
                this.userProgress.vocabulary[word] = {
                    firstSeen: new Date(),
                    timesUsed: 1,
                    correctUses: isCorrect ? 1 : 0,
                    lastUsed: new Date()
                };
            } else {
                this.userProgress.vocabulary[word].timesUsed++;
                if (isCorrect) this.userProgress.vocabulary[word].correctUses++;
                this.userProgress.vocabulary[word].lastUsed = new Date();
            }
        });

        // Update practice history
        langProgress.practiceHistory.push({
            timestamp: new Date(),
            message: userMessage,
            response: response,
            isCorrect: isCorrect
        });

        // Limit history size
        if (langProgress.practiceHistory.length > 100) {
            langProgress.practiceHistory = langProgress.practiceHistory.slice(-100);
        }

        // Update scores
        const recentHistory = langProgress.practiceHistory.slice(-10);
        langProgress.grammarAccuracy = recentHistory.filter(h => h.isCorrect).length / recentHistory.length;
        
        this.saveProgress();
    }

    async getAIResponse(userMessage, targetLanguage, isVoiceInput) {
        try {
            this.isProcessing = true;
            this.showTypingIndicator();

            // Get user's learning history and progress
            const currentLang = this.targetLanguage.value;
            const langProgress = this.userProgress.languages[currentLang];
            const recentPractice = langProgress.practiceHistory.slice(-5).map(h => h.message);
            const commonMistakes = Object.entries(this.userProgress.commonMistakes)
                .filter(([key, value]) => value > 2)
                .map(([key]) => key);

            const prompt = `You are an adaptive language learning assistant. The user is learning ${targetLanguage}.
                          User's current level: ${langProgress.level}
                          Recent practice: ${JSON.stringify(recentPractice)}
                          Common mistakes: ${JSON.stringify(commonMistakes)}
                          Learning streak: ${this.userProgress.streak} days
                          
                          ${isVoiceInput ? "The user spoke this message, so please pay special attention to pronunciation feedback." : ""}
                          
                          Instructions:
                          1. If the message is in English:
                             - Provide the translation
                             - Add pronunciation guide using IPA
                             - Give a contextual example based on user's level
                             - Suggest related vocabulary or phrases to expand learning
                          
                          2. If the message is in ${targetLanguage}:
                             - Identify and correct any mistakes
                             - Provide detailed feedback on grammar and pronunciation
                             - Explain corrections in English
                             - Suggest alternative expressions
                             - If no mistakes, praise and encourage
                          
                          3. Adaptive Learning:
                             - If user shows mastery, introduce more complex variations
                             - If user struggles, provide simpler alternatives
                             - Reference past corrections if similar mistakes occur
                          
                          Format the response clearly with sections and bullet points.
                          Keep the tone encouraging and friendly.
                          
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
            
            // Update learning progress
            const isCorrect = !aiResponse.toLowerCase().includes('correction') && 
                            !aiResponse.toLowerCase().includes('mistake');
            this.updateLanguageProgress(aiResponse, userMessage, isCorrect);

            this.removeTypingIndicator();
            this.addMessage(aiResponse, 'ai');

            // Automatically speak the translation or correction
            if (isVoiceInput) {
                const firstLine = aiResponse.split('\n').find(line => 
                    line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim())
                );
                if (firstLine) {
                    const textToSpeak = firstLine.replace(/^[•\-\d\.\s]+/, '').trim();
                    setTimeout(() => this.speakText(textToSpeak, targetLanguage), 1000);
                }
            }

            // Suggest next practice if appropriate
            if (this.currentSession.interactions % 5 === 0) {
                this.suggestNextPractice();
            }

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        } finally {
            this.isProcessing = false;
            this.currentSession.interactions++;
        }
    }

    async suggestNextPractice() {
        const currentLang = this.targetLanguage.value;
        const langProgress = this.userProgress.languages[currentLang];
        
        // Create a prompt for practice suggestion
        const prompt = `Based on the user's progress:
                       Level: ${langProgress.level}
                       Grammar Accuracy: ${langProgress.grammarAccuracy * 100}%
                       Recent practice: ${JSON.stringify(langProgress.practiceHistory.slice(-3))}
                       
                       Suggest a relevant practice exercise or topic to focus on next.
                       Keep it short, friendly, and motivating.`;

        try {
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

            if (response.ok) {
                const data = await response.json();
                const suggestion = data.candidates[0].content.parts[0].text;
                setTimeout(() => {
                    this.addMessage(`💡 ${suggestion}`, 'ai');
                }, 1000);
            }
        } catch (error) {
            console.error('Error suggesting practice:', error);
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