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
        this.initializeGamification();
        this.checkDailyChallenge();
        this.initializeLanguages();
        this.initializeAdaptiveLearning();
        this.initializeVoiceCoaching();
        this.initializeFlashcards();
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
        this.achievements = new Set();
        this.dailyGoals = {
            interactions: 0,
            correctResponses: 0,
            wordsLearned: new Set(),
            challengeCompleted: false
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
        
        // Create boxes loading animation
        const boxesContainer = document.createElement('div');
        boxesContainer.className = 'boxes';
        
        // Create 4 boxes
        for (let i = 0; i < 4; i++) {
            const box = document.createElement('div');
            box.className = 'box';
            
            // Create 4 sides for each box
            for (let j = 0; j < 4; j++) {
                const side = document.createElement('div');
                box.appendChild(side);
            }
            
            boxesContainer.appendChild(box);
        }
        
        this.typingIndicator.appendChild(boxesContainer);
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

    initializeLanguages() {
        this.supportedLanguages = {
            'en': {
                name: 'English',
                flag: '🇬🇧',
                code: 'en-GB',
                commonPhrases: {
                    greeting: 'Hello!',
                    goodbye: 'Goodbye!',
                    thanks: 'Thank you!'
                },
                grammarRules: ['Use present perfect for past actions with present effects', 'Use "will" for future predictions']
            },
            'fr': {
                name: 'French',
                flag: '🇫🇷',
                code: 'fr-FR',
                commonPhrases: {
                    greeting: 'Bonjour!',
                    goodbye: 'Au revoir!',
                    thanks: 'Merci!'
                },
                grammarRules: ['Use "être" for states', 'Use "avoir" for possession']
            },
            'de': {
                name: 'German',
                flag: '🇩🇪',
                code: 'de-DE',
                commonPhrases: {
                    greeting: 'Hallo!',
                    goodbye: 'Auf Wiedersehen!',
                    thanks: 'Danke!'
                },
                grammarRules: ['Verbs go at the end in dependent clauses', 'Nouns are capitalized']
            }
        };

        // Update language selector with rich options
        const selector = document.getElementById('targetLanguage');
        selector.innerHTML = Object.entries(this.supportedLanguages)
            .map(([code, lang]) => `
                <option value="${code}" data-language="${lang.name}">
                    ${lang.flag} ${lang.name}
                </option>
            `).join('');
    }

    async handleUserInput(isVoiceInput = false) {
        const userMessage = this.userInput.value.trim();
        if (!userMessage || this.isProcessing) return;

        const targetLang = this.targetLanguage.value;
        const sourceLang = await this.detectLanguage(userMessage);
        
        this.addMessage(userMessage, 'user');
        this.userInput.value = '';
        this.sendButton.style.opacity = '0.5';

        // If source language is different from target, show original and translation
        if (sourceLang && sourceLang !== targetLang) {
            const translation = await this.getSmartTranslation(userMessage, sourceLang, targetLang);
            if (translation) {
                this.addTranslationMessage(userMessage, translation, sourceLang, targetLang);
            }
        }

        const aiResponse = await this.getAIResponse(userMessage, targetLang, isVoiceInput, sourceLang);
        
        // Generate flashcards from the conversation
        if (aiResponse) {
            this.generateFlashcards(userMessage, aiResponse);
        }
        
        this.checkAchievements(userMessage, aiResponse, isVoiceInput);
        
        // Award XP
        this.awardXP(10);
        if (isVoiceInput) this.awardXP(5);
    }

    async detectLanguage(text) {
        try {
            const prompt = `Detect the language of this text and respond with only the language code (es/fr/de/it/en): "${text}"`;
            
            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const langCode = data.candidates[0].content.parts[0].text.trim().toLowerCase();
                return langCode;
            }
        } catch (error) {
            console.error('Error detecting language:', error);
        }
        return null;
    }

    async getSmartTranslation(text, sourceLang, targetLang) {
        try {
            const sourceLanguage = this.supportedLanguages[sourceLang]?.name || 'English';
            const targetLanguage = this.supportedLanguages[targetLang].name;

            const prompt = `Translate this ${sourceLanguage} text to ${targetLanguage}:
                          "${text}"
                          
                          Requirements:
                          1. Maintain the context and meaning
                          2. Use natural, conversational language
                          3. Consider cultural nuances
                          4. If there are idioms, translate the meaning appropriately
                          5. Preserve any formal/informal tone
                          
                          Respond with ONLY the translation.`;

            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.candidates[0].content.parts[0].text.trim();
            }
        } catch (error) {
            console.error('Error getting translation:', error);
        }
        return null;
    }

    addTranslationMessage(original, translation, sourceLang, targetLang) {
        const sourceName = this.supportedLanguages[sourceLang]?.name || 'English';
        const targetName = this.supportedLanguages[targetLang].name;
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'ai-message', 'translation-message');
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'translation-content';
        
        // Original text
        const originalDiv = document.createElement('div');
        originalDiv.className = 'original-text';
        originalDiv.innerHTML = `<span class="language-label">${sourceName}</span>${original}`;
        
        // Arrow indicator
        const arrowDiv = document.createElement('div');
        arrowDiv.className = 'translation-arrow';
        arrowDiv.textContent = '↓';
        
        // Translated text
        const translatedDiv = document.createElement('div');
        translatedDiv.className = 'translated-text';
        translatedDiv.innerHTML = `<span class="language-label">${targetName}</span>${translation}`;
        
        contentDiv.appendChild(originalDiv);
        contentDiv.appendChild(arrowDiv);
        contentDiv.appendChild(translatedDiv);
        
        // Add action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        // Listen to original
        if (sourceLang !== 'en') {
            const listenOriginalButton = document.createElement('button');
            listenOriginalButton.className = 'action-button';
            listenOriginalButton.innerHTML = '<span class="material-icons-round">record_voice_over</span>';
            listenOriginalButton.title = `Listen in ${sourceName}`;
            listenOriginalButton.onclick = () => this.speakText(original, sourceLang);
            actionsDiv.appendChild(listenOriginalButton);
        }
        
        // Listen to translation
        const listenButton = document.createElement('button');
        listenButton.className = 'action-button';
        listenButton.innerHTML = '<span class="material-icons-round">volume_up</span>';
        listenButton.title = `Listen in ${targetName}`;
        listenButton.onclick = () => this.speakText(translation, targetLang);
        
        // Copy translation
        const copyButton = document.createElement('button');
        copyButton.className = 'action-button';
        copyButton.innerHTML = '<span class="material-icons-round">content_copy</span>';
        copyButton.title = 'Copy translation';
        copyButton.onclick = () => {
            navigator.clipboard.writeText(translation);
            copyButton.innerHTML = '<span class="material-icons-round">check</span>';
            setTimeout(() => {
                copyButton.innerHTML = '<span class="material-icons-round">content_copy</span>';
            }, 2000);
        };
        
        actionsDiv.appendChild(listenButton);
        actionsDiv.appendChild(copyButton);
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(actionsDiv);
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
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

    speakText(text, languageCode) {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language and voice preferences
        utterance.lang = languageCode;
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        // Get the appropriate voice for the language
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang.startsWith(languageCode) && voice.localService
        ) || voices.find(voice => 
            voice.lang.startsWith(languageCode)
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Ensure voices are loaded
        if (voices.length === 0) {
            window.speechSynthesis.addEventListener('voiceschanged', () => {
                const updatedVoices = window.speechSynthesis.getVoices();
                const voice = updatedVoices.find(v => 
                    v.lang.startsWith(languageCode) && v.localService
                ) || updatedVoices.find(v => 
                    v.lang.startsWith(languageCode)
                );
                if (voice) {
                    utterance.voice = voice;
                }
                window.speechSynthesis.speak(utterance);
            }, { once: true });
        } else {
            window.speechSynthesis.speak(utterance);
        }
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

    async getAIResponse(userMessage, targetLanguage, isVoiceInput, sourceLang) {
        try {
            this.isProcessing = true;
            this.showTypingIndicator();

            const currentLang = this.targetLanguage.value;
            const langInfo = this.supportedLanguages[currentLang];
            
            // Create a more focused prompt for language learning
            const prompt = `You are a helpful language tutor teaching ${langInfo.name}.
                          
                          User message: "${userMessage}"
                          Source language: ${sourceLang === 'en' ? 'English' : this.supportedLanguages[sourceLang]?.name}
                          Target language: ${langInfo.name}
                          
                          Instructions:
                          1. If the message is in the source language:
                             - Provide the translation
                             - Explain key grammar points
                             - Give example usage
                          
                          2. If the message is in the target language:
                             - Correct any mistakes
                             - Provide positive reinforcement
                             - Suggest improvements
                          
                          3. Keep responses concise and focused on learning
                          4. Include one relevant example
                          5. Format response in a clear, easy-to-read way
                          
                          Respond in a conversational, encouraging tone.`;

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

            // Speak the first line of the response
            const firstLine = aiResponse.split('\n')[0].trim();
            if (firstLine) {
                this.speakText(firstLine, this.targetLanguage.value);
            }

            // Quietly update progress in the background
            this.updateProgress(userMessage, aiResponse, isVoiceInput);

            return aiResponse;

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
            return null;
        } finally {
            this.isProcessing = false;
        }
    }

    // Move progress tracking to a separate method
    async updateProgress(userMessage, aiResponse, isVoiceInput) {
        const currentLang = this.targetLanguage.value;
        const progress = this.userProgress.languages[currentLang];
        
        // Update statistics quietly
        if (!aiResponse.toLowerCase().includes('correction') && 
            !aiResponse.toLowerCase().includes('mistake')) {
            progress.correctResponses = (progress.correctResponses || 0) + 1;
        }
        
        if (isVoiceInput) {
            progress.voicePractices = (progress.voicePractices || 0) + 1;
        }
        
        // Track vocabulary
        const words = userMessage.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (!this.userProgress.vocabulary[word]) {
                this.userProgress.vocabulary[word] = {
                    firstSeen: new Date(),
                    timesUsed: 1,
                    lastUsed: new Date()
                };
            } else {
                this.userProgress.vocabulary[word].timesUsed++;
                this.userProgress.vocabulary[word].lastUsed = new Date();
            }
        });
        
        this.saveProgress();
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

    initializeGamification() {
        // Define achievements and badges
        this.achievementsList = {
            'first_conversation': {
                id: 'first_conversation',
                title: '🎯 First Steps',
                description: 'Complete your first conversation',
                earned: false
            },
            'perfect_streak_3': {
                id: 'perfect_streak_3',
                title: '🎯 Quick Learner',
                description: 'Get 3 correct responses in a row',
                earned: false
            },
            'daily_goal': {
                id: 'daily_goal',
                title: '🎯 Goal Crusher',
                description: 'Complete daily learning goal',
                earned: false
            },
            'vocabulary_master': {
                id: 'vocabulary_master',
                title: '📚 Vocabulary Master',
                description: 'Learn 50 new words',
                earned: false
            },
            'pronunciation_pro': {
                id: 'pronunciation_pro',
                title: '🎤 Pronunciation Pro',
                description: 'Complete 10 voice exercises',
                earned: false
            },
            'streak_7': {
                id: 'streak_7',
                title: '🔥 Week Warrior',
                description: 'Maintain a 7-day learning streak',
                earned: false
            }
        };

        // Load saved achievements
        const savedAchievements = localStorage.getItem('achievements');
        if (savedAchievements) {
            const earned = JSON.parse(savedAchievements);
            earned.forEach(id => {
                this.achievementsList[id].earned = true;
                this.achievements.add(id);
            });
        }
    }

    async checkDailyChallenge() {
        const currentLang = this.targetLanguage.value;
        const langProgress = this.userProgress.languages[currentLang];
        const today = new Date().toDateString();

        // Check if we need to generate a new daily challenge
        if (!this.userProgress.dailyChallenge || 
            this.userProgress.dailyChallenge.date !== today) {
            
            // Generate new challenge based on user level
            const prompt = `Create a daily language learning challenge for a ${langProgress.level} level student.
                          Recent practice topics: ${JSON.stringify(langProgress.practiceHistory.slice(-3))}
                          Grammar accuracy: ${langProgress.grammarAccuracy * 100}%
                          
                          Create a challenge that:
                          1. Practices relevant vocabulary and grammar
                          2. Is achievable in 5-10 minutes
                          3. Includes specific goals (e.g., "Use 3 past tense verbs")
                          4. Is fun and engaging
                          
                          Format the challenge in a concise, motivating way.`;

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
                    const challenge = data.candidates[0].content.parts[0].text;
                    
                    this.userProgress.dailyChallenge = {
                        date: today,
                        challenge: challenge,
                        completed: false,
                        progress: 0
                    };
                    
                    this.saveProgress();
                    this.showDailyChallenge();
                }
            } catch (error) {
                console.error('Error generating daily challenge:', error);
            }
        } else if (!this.userProgress.dailyChallenge.completed) {
            // Show existing uncompleted challenge
            this.showDailyChallenge();
        }
    }

    showDailyChallenge() {
        const challenge = this.userProgress.dailyChallenge;
        if (challenge && !challenge.completed) {
            setTimeout(() => {
                this.addMessage(`📅 Daily Challenge:\n${challenge.challenge}\n\nComplete this challenge to earn XP and badges!`, 'ai');
            }, 1000);
        }
    }

    checkAchievements(userMessage, aiResponse, isVoiceInput) {
        const currentLang = this.targetLanguage.value;
        const langProgress = this.userProgress.languages[currentLang];

        // Check for first conversation
        if (!this.achievementsList.first_conversation.earned && 
            this.currentSession.interactions > 1) {
            this.awardAchievement('first_conversation');
        }

        // Check for perfect streak
        if (!this.achievementsList.perfect_streak_3.earned && 
            this.currentSession.correctUses >= 3) {
            this.awardAchievement('perfect_streak_3');
        }

        // Check for vocabulary master
        const vocabularySize = Object.keys(this.userProgress.vocabulary).length;
        if (!this.achievementsList.vocabulary_master.earned && 
            vocabularySize >= 50) {
            this.awardAchievement('vocabulary_master');
        }

        // Check for pronunciation pro
        if (!this.achievementsList.pronunciation_pro.earned && 
            isVoiceInput && this.currentSession.voiceInteractions >= 10) {
            this.awardAchievement('pronunciation_pro');
        }

        // Check for week warrior
        if (!this.achievementsList.streak_7.earned && 
            this.userProgress.streak >= 7) {
            this.awardAchievement('streak_7');
        }

        // Update daily goals
        this.updateDailyGoals(userMessage, aiResponse, isVoiceInput);
    }

    awardAchievement(achievementId) {
        const achievement = this.achievementsList[achievementId];
        if (!achievement.earned) {
            achievement.earned = true;
            this.achievements.add(achievementId);
            
            // Save earned achievements
            localStorage.setItem('achievements', 
                JSON.stringify([...this.achievements]));
            
            // Show achievement notification
            this.addMessage(`🏆 Achievement Unlocked: ${achievement.title}\n${achievement.description}`, 'ai');
            
            // Add celebration animation
            this.celebrateAchievement();
        }
    }

    celebrateAchievement() {
        const celebration = document.createElement('div');
        celebration.className = 'achievement-celebration';
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            document.body.removeChild(celebration);
        }, 3000);
    }

    updateDailyGoals(userMessage, aiResponse, isVoiceInput) {
        const today = new Date().toDateString();
        
        // Reset daily goals if it's a new day
        if (this.dailyGoals.date !== today) {
            this.dailyGoals = {
                date: today,
                interactions: 0,
                correctResponses: 0,
                wordsLearned: new Set(),
                challengeCompleted: false
            };
        }

        // Update goals
        this.dailyGoals.interactions++;
        if (!aiResponse.toLowerCase().includes('mistake')) {
            this.dailyGoals.correctResponses++;
        }

        // Track new words
        const words = userMessage.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (!this.userProgress.vocabulary[word]) {
                this.dailyGoals.wordsLearned.add(word);
            }
        });

        // Check daily challenge progress
        if (this.userProgress.dailyChallenge && 
            !this.userProgress.dailyChallenge.completed) {
            this.checkChallengeProgress(userMessage, aiResponse);
        }

        // Check if daily goals are met
        if (!this.achievementsList.daily_goal.earned && 
            this.dailyGoals.interactions >= 10 && 
            this.dailyGoals.correctResponses >= 7 && 
            this.dailyGoals.wordsLearned.size >= 5) {
            this.awardAchievement('daily_goal');
        }
    }

    checkChallengeProgress(userMessage, aiResponse) {
        const challenge = this.userProgress.dailyChallenge;
        if (!challenge || challenge.completed) return;

        // Simple progress tracking (can be made more sophisticated)
        challenge.progress++;
        
        // Consider challenge completed after meaningful interactions
        if (challenge.progress >= 5 && 
            !aiResponse.toLowerCase().includes('mistake')) {
            challenge.completed = true;
            this.saveProgress();
            this.addMessage('🎉 Congratulations! You\'ve completed today\'s challenge!', 'ai');
            this.awardXP(100); // Award XP for completing challenge
        }
    }

    awardXP(amount) {
        const currentLang = this.targetLanguage.value;
        if (!this.userProgress.languages[currentLang].xp) {
            this.userProgress.languages[currentLang].xp = 0;
        }
        
        this.userProgress.languages[currentLang].xp += amount;
        this.saveProgress();
        
        // Show XP gain
        this.addMessage(`✨ +${amount} XP`, 'ai');
        
        // Check for level up
        this.checkLevelUp();
    }

    checkLevelUp() {
        const currentLang = this.targetLanguage.value;
        const langProgress = this.userProgress.languages[currentLang];
        const currentXP = langProgress.xp;
        
        const levels = {
            beginner: 0,
            intermediate: 1000,
            advanced: 3000,
            expert: 6000
        };

        let newLevel = 'beginner';
        for (const [level, requiredXP] of Object.entries(levels)) {
            if (currentXP >= requiredXP) {
                newLevel = level;
            }
        }

        if (newLevel !== langProgress.level) {
            langProgress.level = newLevel;
            this.saveProgress();
            this.addMessage(`🎊 Level Up! You're now at ${newLevel} level!`, 'ai');
        }
    }

    initializeAdaptiveLearning() {
        this.learningPath = {
            currentModule: null,
            completedModules: new Set(),
            skillLevels: {
                pronunciation: 0,
                grammar: 0,
                vocabulary: 0,
                comprehension: 0
            },
            recommendations: [],
            lastAssessment: null
        };

        // Load saved learning path
        const savedPath = localStorage.getItem('learningPath');
        if (savedPath) {
            const parsed = JSON.parse(savedPath);
            this.learningPath = {
                ...parsed,
                completedModules: new Set(parsed.completedModules)
            };
        }
    }

    initializeVoiceCoaching() {
        this.voiceMetrics = {
            lastRecording: null,
            pronunciationHistory: [],
            commonIssues: new Map(),
            improvements: new Map(),
            confidenceScores: []
        };

        // Enhanced speech recognition settings
        if (this.recognition) {
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            
            // Add detailed speech analysis
            this.recognition.onresult = (event) => {
                const results = Array.from(event.results);
                const transcript = results[results.length - 1][0].transcript;
                const confidence = results[results.length - 1][0].confidence;
                
                this.userInput.value = transcript;
                
                if (results[results.length - 1].isFinal) {
                    this.lastSpokenText = transcript;
                    this.analyzeVoiceInput(transcript, confidence);
                    this.handleUserInput(true);
                }
            };
        }
    }

    async analyzeVoiceInput(transcript, confidence) {
        const currentLang = this.targetLanguage.value;
        const langInfo = this.supportedLanguages[currentLang];
        
        // Store voice metrics
        this.voiceMetrics.confidenceScores.push(confidence);
        this.voiceMetrics.lastRecording = {
            text: transcript,
            timestamp: new Date(),
            confidence: confidence
        };

        // Analyze pronunciation patterns
        const prompt = `Analyze this spoken text in ${langInfo.name}: "${transcript}"
                       
                       Previous common issues: ${JSON.stringify([...this.voiceMetrics.commonIssues])}
                       Speaker's level: ${this.userProgress.languages[currentLang].level}
                       
                       Provide detailed analysis of:
                       1. Pronunciation accuracy
                       2. Stress patterns
                       3. Intonation
                       4. Common pronunciation mistakes
                       5. Specific sounds that need improvement
                       
                       Format the response as JSON with these keys:
                       {
                           "accuracyScore": number (0-1),
                           "issues": string[],
                           "improvements": string[],
                           "soundPatterns": string[],
                           "feedback": string
                       }`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const analysis = JSON.parse(data.candidates[0].content.parts[0].text);
                
                // Update voice metrics
                analysis.issues.forEach(issue => {
                    this.voiceMetrics.commonIssues.set(
                        issue,
                        (this.voiceMetrics.commonIssues.get(issue) || 0) + 1
                    );
                });

                // Store pronunciation history
                this.voiceMetrics.pronunciationHistory.push({
                    text: transcript,
                    analysis: analysis,
                    timestamp: new Date()
                });

                // Limit history size
                if (this.voiceMetrics.pronunciationHistory.length > 50) {
                    this.voiceMetrics.pronunciationHistory.shift();
                }

                // Update learning path based on pronunciation performance
                this.updateSkillLevel('pronunciation', analysis.accuracyScore);
                this.generateNextLearningModule();

                // Provide immediate feedback if accuracy is low
                if (analysis.accuracyScore < 0.7) {
                    this.addMessage(`🎯 Pronunciation Tip: ${analysis.feedback}`, 'ai');
                    this.demonstrateCorrectPronunciation(transcript, analysis.soundPatterns);
                }
            }
        } catch (error) {
            console.error('Error analyzing voice input:', error);
        }
    }

    async demonstrateCorrectPronunciation(text, soundPatterns) {
        // Slow down speech for demonstration
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.lang = this.getLanguageCode(this.targetLanguage.value);

        // Find native speaker voice
        const voices = this.voices.filter(voice => 
            voice.lang === utterance.lang && voice.localService
        );
        if (voices.length > 0) {
            utterance.voice = voices[0];
        }

        // Add emphasis to problematic sounds
        soundPatterns.forEach(pattern => {
            text = text.replace(new RegExp(pattern, 'gi'), `<emphasis>${pattern}</emphasis>`);
        });

        this.addMessage(`🔊 Listen carefully to the correct pronunciation:
                        ${text}
                        
                        Click the speaker icon to hear it again.`, 'ai');
        
        this.synth.speak(utterance);
    }

    updateSkillLevel(skill, score) {
        // Update skill level with weighted average
        const currentLevel = this.learningPath.skillLevels[skill];
        this.learningPath.skillLevels[skill] = (currentLevel * 0.7) + (score * 0.3);
        
        // Save progress
        localStorage.setItem('learningPath', JSON.stringify({
            ...this.learningPath,
            completedModules: [...this.learningPath.completedModules]
        }));
    }

    async generateNextLearningModule() {
        const currentLang = this.targetLanguage.value;
        const langProgress = this.userProgress.languages[currentLang];
        
        // Generate personalized learning module
        const prompt = `Create a personalized learning module based on:
                       Language: ${this.supportedLanguages[currentLang].name}
                       Current level: ${langProgress.level}
                       Skill levels: ${JSON.stringify(this.learningPath.skillLevels)}
                       Common issues: ${JSON.stringify([...this.voiceMetrics.commonIssues])}
                       Recent improvements: ${JSON.stringify([...this.voiceMetrics.improvements])}
                       
                       Create a focused learning plan that:
                       1. Addresses the weakest skills
                       2. Builds on recent improvements
                       3. Introduces new concepts gradually
                       4. Includes specific exercises
                       
                       Format as JSON with:
                       {
                           "focus": string,
                           "exercises": string[],
                           "vocabulary": string[],
                           "grammarPoints": string[],
                           "pronunciationDrills": string[]
                       }`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const module = JSON.parse(data.candidates[0].content.parts[0].text);
                
                this.learningPath.currentModule = module;
                this.learningPath.recommendations = module.exercises;
                
                // Suggest next exercise if appropriate
                if (!this.isProcessing && this.currentSession.interactions > 0) {
                    this.suggestNextExercise();
                }
            }
        } catch (error) {
            console.error('Error generating learning module:', error);
        }
    }

    async suggestNextExercise() {
        if (this.learningPath.recommendations.length > 0) {
            const exercise = this.learningPath.recommendations[0];
            this.addMessage(`📚 Suggested Exercise: ${exercise}
                           
                           This exercise focuses on improving your ${this.learningPath.currentModule.focus}.
                           Would you like to try it?`, 'ai');
        }
    }

    initializeFlashcards() {
        this.flashcardSystem = {
            cards: new Map(),
            queue: [],
            lastReview: null,
            stats: {
                learned: 0,
                reviewing: 0,
                mastered: 0
            }
        };

        // Load saved flashcards
        const savedCards = localStorage.getItem('flashcards');
        if (savedCards) {
            const parsed = JSON.parse(savedCards);
            this.flashcardSystem.cards = new Map(parsed.cards);
            this.flashcardSystem.stats = parsed.stats;
            this.flashcardSystem.lastReview = new Date(parsed.lastReview);
        }

        // Schedule flashcard reviews
        setInterval(() => this.checkForDueCards(), 300000); // Check every 5 minutes
    }

    async generateFlashcards(text, context) {
        const currentLang = this.targetLanguage.value;
        const langInfo = this.supportedLanguages[currentLang];
        
        const prompt = `Create flashcards from this ${langInfo.name} text: "${text}"
                       Context: ${context}
                       User level: ${this.userProgress.languages[currentLang].level}
                       
                       Generate flashcards that include:
                       1. Vocabulary words and phrases
                       2. Grammar concepts used
                       3. Cultural references
                       4. Common usage examples
                       
                       Format as JSON array:
                       {
                           "cards": [
                               {
                                   "front": string,
                                   "back": string,
                                   "type": "vocabulary|grammar|culture|usage",
                                   "difficulty": number (1-5),
                                   "examples": string[],
                                   "notes": string
                               }
                           ]
                       }`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const flashcards = JSON.parse(data.candidates[0].content.parts[0].text);
                
                flashcards.cards.forEach(card => {
                    this.addFlashcard(card);
                });

                this.showFlashcardCreationMessage(flashcards.cards.length);
            }
        } catch (error) {
            console.error('Error generating flashcards:', error);
        }
    }

    addFlashcard(card) {
        const cardId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        this.flashcardSystem.cards.set(cardId, {
            ...card,
            id: cardId,
            created: new Date(),
            lastReviewed: null,
            nextReview: new Date(),
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            status: 'new'
        });

        this.saveFlashcards();
        this.updateFlashcardQueue();
    }

    showFlashcardCreationMessage(count) {
        this.addMessage(`📚 Created ${count} new flashcards from your conversation!
                        
                        Would you like to review them now? Type "review flashcards" or click the button below.`, 'ai');
        
        // Add review button
        const messageDiv = this.chatContainer.lastElementChild;
        const reviewButton = document.createElement('button');
        reviewButton.className = 'flashcard-review-button';
        reviewButton.innerHTML = '🎴 Review Flashcards';
        reviewButton.onclick = () => this.startFlashcardReview();
        messageDiv.appendChild(reviewButton);
    }

    async startFlashcardReview() {
        if (this.flashcardSystem.queue.length === 0) {
            this.updateFlashcardQueue();
        }

        if (this.flashcardSystem.queue.length === 0) {
            this.addMessage('No flashcards due for review! Check back later.', 'ai');
            return;
        }

        const card = this.flashcardSystem.cards.get(this.flashcardSystem.queue[0]);
        this.showFlashcard(card);
    }

    showFlashcard(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'flashcard-container';
        
        const frontDiv = document.createElement('div');
        frontDiv.className = 'flashcard front';
        frontDiv.textContent = card.front;
        
        const backDiv = document.createElement('div');
        backDiv.className = 'flashcard back';
        backDiv.innerHTML = `
            <div class="flashcard-content">
                <div class="answer">${card.back}</div>
                <div class="examples">
                    ${card.examples.map(ex => `<div class="example">${ex}</div>`).join('')}
                </div>
                <div class="notes">${card.notes}</div>
            </div>
        `;
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'flashcard-buttons';
        buttonsDiv.innerHTML = `
            <button class="difficulty-button" data-difficulty="1">Again</button>
            <button class="difficulty-button" data-difficulty="2">Hard</button>
            <button class="difficulty-button" data-difficulty="3">Good</button>
            <button class="difficulty-button" data-difficulty="4">Easy</button>
        `;
        
        cardDiv.appendChild(frontDiv);
        cardDiv.appendChild(backDiv);
        cardDiv.appendChild(buttonsDiv);
        
        // Add flip functionality
        cardDiv.addEventListener('click', (e) => {
            if (!e.target.classList.contains('difficulty-button')) {
                cardDiv.classList.toggle('flipped');
            }
        });
        
        // Add difficulty button handlers
        buttonsDiv.querySelectorAll('.difficulty-button').forEach(button => {
            button.addEventListener('click', () => {
                const difficulty = parseInt(button.dataset.difficulty);
                this.processFlashcardResponse(card, difficulty);
            });
        });
        
        // Add to chat
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message flashcard-message';
        messageDiv.appendChild(cardDiv);
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    processFlashcardResponse(card, difficulty) {
        // SuperMemo 2 algorithm
        const oldEase = card.easeFactor;
        
        if (difficulty >= 3) { // Correct response
            if (card.repetitions === 0) {
                card.interval = 1;
            } else if (card.repetitions === 1) {
                card.interval = 6;
            } else {
                card.interval = Math.round(card.interval * card.easeFactor);
            }
            card.repetitions++;
        } else { // Incorrect response
            card.repetitions = 0;
            card.interval = 1;
        }
        
        // Update ease factor
        card.easeFactor = Math.max(1.3, oldEase + (0.1 - (5 - difficulty) * (0.08 + (5 - difficulty) * 0.02)));
        
        // Calculate next review date
        card.lastReviewed = new Date();
        card.nextReview = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000);
        
        // Update status
        if (card.repetitions >= 5 && card.interval >= 30) {
            card.status = 'mastered';
        } else if (card.repetitions > 0) {
            card.status = 'learning';
        }
        
        this.updateFlashcardStats();
        this.saveFlashcards();
        this.updateFlashcardQueue();
        
        // Show next card or completion message
        if (this.flashcardSystem.queue.length > 0) {
            const nextCard = this.flashcardSystem.cards.get(this.flashcardSystem.queue[0]);
            setTimeout(() => this.showFlashcard(nextCard), 500);
        } else {
            this.showReviewComplete();
        }
    }

    updateFlashcardStats() {
        const stats = {
            learned: 0,
            reviewing: 0,
            mastered: 0
        };
        
        this.flashcardSystem.cards.forEach(card => {
            if (card.status === 'mastered') {
                stats.mastered++;
            } else if (card.status === 'learning') {
                stats.reviewing++;
            } else {
                stats.learned++;
            }
        });
        
        this.flashcardSystem.stats = stats;
    }

    updateFlashcardQueue() {
        const now = new Date();
        this.flashcardSystem.queue = Array.from(this.flashcardSystem.cards.values())
            .filter(card => card.nextReview <= now)
            .sort((a, b) => {
                if (a.status === 'new' && b.status !== 'new') return -1;
                if (a.status !== 'new' && b.status === 'new') return 1;
                return a.nextReview - b.nextReview;
            })
            .map(card => card.id);
    }

    showReviewComplete() {
        const stats = this.flashcardSystem.stats;
        this.addMessage(`🎉 Review Complete!
                        
                        Your Progress:
                        ✨ Mastered: ${stats.mastered}
                        📚 Learning: ${stats.reviewing}
                        🆕 New: ${stats.learned}
                        
                        Keep up the great work! Next review session will be available when cards are due.`, 'ai');
    }

    saveFlashcards() {
        localStorage.setItem('flashcards', JSON.stringify({
            cards: Array.from(this.flashcardSystem.cards.entries()),
            stats: this.flashcardSystem.stats,
            lastReview: new Date()
        }));
    }

    checkForDueCards() {
        this.updateFlashcardQueue();
        const dueCount = this.flashcardSystem.queue.length;
        
        if (dueCount > 0) {
            this.addMessage(`📝 You have ${dueCount} flashcards ready for review!
                           
                           Type "review flashcards" or click the button below to start.`, 'ai');
            
            const messageDiv = this.chatContainer.lastElementChild;
            const reviewButton = document.createElement('button');
            reviewButton.className = 'flashcard-review-button';
            reviewButton.innerHTML = '🎴 Start Review';
            reviewButton.onclick = () => this.startFlashcardReview();
            messageDiv.appendChild(reviewButton);
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new LanguageLearningApp();
}); 