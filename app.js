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
        const aiResponse = await this.getAIResponse(userMessage, targetLang, isVoiceInput);
        
        // Check achievements after each interaction
        this.checkAchievements(userMessage, aiResponse, isVoiceInput);
        
        // Award XP for interaction
        this.awardXP(10); // Base XP for each interaction
        if (isVoiceInput) this.awardXP(5); // Bonus XP for voice practice
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

            return aiResponse;

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
            return null;
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
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new LanguageLearningApp();
}); 