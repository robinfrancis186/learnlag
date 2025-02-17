const languageResponses = {
    en: {
        beginner: {
            welcome: "Welcome! I'm here to help you learn English. Let's start with the basics! 👋",
            practice: "Let's practice some simple phrases. What would you like to say?",
            correct: "Great job! That's correct! 🌟",
            incorrect: "Almost there! Let's try again. Here's a simpler way to say it: ",
            hint: "Would you like a hint? Just ask!",
            goodbye: "Goodbye! Remember to practice every day! 👋"
        },
        intermediate: {
            welcome: "Welcome back! Ready to improve your English skills? 👋",
            practice: "What topic would you like to practice today?",
            correct: "Excellent work! Your English is improving! 🎯",
            incorrect: "Good try! Here's how to make it more natural: ",
            hint: "Need a hint? I'm here to help!",
            goodbye: "See you next time! Keep up the great work! 👋"
        },
        advanced: {
            welcome: "Welcome! Let's work on perfecting your English! 👋",
            practice: "Choose any topic - we can discuss complex subjects!",
            correct: "Outstanding! Your English is very sophisticated! 🌟",
            incorrect: "Almost perfect! Here's a more idiomatic way to express that: ",
            hint: "Would you like some advanced tips?",
            goodbye: "Until next time! Keep challenging yourself! 👋"
        }
    },
    de: {
        beginner: {
            welcome: "Willkommen! Ich helfe dir beim Deutschlernen. Lass uns mit den Grundlagen beginnen! 👋",
            practice: "Lass uns einfache Sätze üben. Was möchtest du sagen?",
            correct: "Super! Das ist richtig! 🌟",
            incorrect: "Fast! Versuchen wir es noch einmal. Hier ist es einfacher: ",
            hint: "Möchtest du einen Tipp? Frag einfach!",
            goodbye: "Tschüss! Denk ans tägliche Üben! 👋"
        },
        intermediate: {
            welcome: "Willkommen zurück! Bereit, dein Deutsch zu verbessern? 👋",
            practice: "Welches Thema möchtest du heute üben?",
            correct: "Ausgezeichnet! Dein Deutsch wird immer besser! 🎯",
            incorrect: "Guter Versuch! So klingt es natürlicher: ",
            hint: "Brauchst du einen Tipp? Ich helfe dir!",
            goodbye: "Bis zum nächsten Mal! Weiter so! 👋"
        },
        advanced: {
            welcome: "Willkommen! Lass uns dein Deutsch perfektionieren! 👋",
            practice: "Wähle ein Thema - wir können komplexe Themen besprechen!",
            correct: "Hervorragend! Dein Deutsch ist sehr anspruchsvoll! 🌟",
            incorrect: "Fast perfekt! Hier ist eine idiomatischere Ausdrucksweise: ",
            hint: "Möchtest du fortgeschrittene Tipps?",
            goodbye: "Bis bald! Fordere dich weiter heraus! 👋"
        }
    },
    fr: {
        beginner: {
            welcome: "Bienvenue! Je suis là pour vous aider à apprendre le français. Commençons par les bases! 👋",
            practice: "Pratiquons des phrases simples. Que voulez-vous dire?",
            correct: "Très bien! C'est correct! 🌟",
            incorrect: "Presque! Essayons encore. Voici une façon plus simple: ",
            hint: "Voulez-vous un indice? Demandez simplement!",
            goodbye: "Au revoir! N'oubliez pas de pratiquer chaque jour! 👋"
        },
        intermediate: {
            welcome: "Bon retour! Prêt à améliorer votre français? 👋",
            practice: "Quel sujet voulez-vous pratiquer aujourd'hui?",
            correct: "Excellent! Votre français s'améliore! 🎯",
            incorrect: "Bon essai! Voici comment le dire plus naturellement: ",
            hint: "Besoin d'un indice? Je suis là pour aider!",
            goodbye: "À la prochaine! Continuez comme ça! 👋"
        },
        advanced: {
            welcome: "Bienvenue! Travaillons à perfectionner votre français! 👋",
            practice: "Choisissez un sujet - nous pouvons discuter de sujets complexes!",
            correct: "Remarquable! Votre français est très sophistiqué! 🌟",
            incorrect: "Presque parfait! Voici une expression plus idiomatique: ",
            hint: "Voulez-vous des conseils avancés?",
            goodbye: "À bientôt! Continuez à vous défier! 👋"
        }
    }
};

const languageCurriculum = {
    beginner: {
        level1: {
            title: "Basic Greetings",
            lessons: [
                { type: "greeting", phrase: "Hello", response: "Hello! Try saying: How are you?" },
                { type: "greeting", phrase: "How are you", response: "I'm good, thank you! Try saying: Nice to meet you" },
                { type: "greeting", phrase: "Goodbye", response: "Goodbye! See you next time!" }
            ]
        },
        level2: {
            title: "Simple Questions",
            lessons: [
                { type: "question", phrase: "What is your name", response: "My name is AI. Try asking: Where are you from?" },
                { type: "question", phrase: "Where are you from", response: "I'm from the cloud! Try asking: What time is it?" }
            ]
        },
        level3: {
            title: "Numbers & Time",
            lessons: [
                { type: "numbers", phrase: "Count from 1 to 5", response: "Good! Now try counting from 6 to 10" },
                { type: "time", phrase: "What time is it", response: "Let's practice telling time together" }
            ]
        }
    },
    intermediate: {
        level1: {
            title: "Daily Activities",
            lessons: [
                { type: "routine", phrase: "Tell me about your morning routine", response: "Let's discuss daily activities" },
                { type: "schedule", phrase: "What's your schedule today", response: "Good! Now try describing your weekend" }
            ]
        },
        level2: {
            title: "Opinions & Preferences",
            lessons: [
                { type: "opinion", phrase: "What do you like to do", response: "Great! Now tell me what you don't like" },
                { type: "preference", phrase: "What's your favorite", response: "Excellent! Let's discuss why you prefer it" }
            ]
        }
    },
    advanced: {
        level1: {
            title: "Complex Conversations",
            lessons: [
                { type: "debate", phrase: "What do you think about", response: "Let's explore this topic deeper" },
                { type: "discussion", phrase: "Can you explain why", response: "Great analysis! Let's consider another perspective" }
            ]
        }
    }
};

class LanguageHandler {
    constructor() {
        this.currentLanguage = 'en';
        this.proficiencyLevel = 'beginner';
        this.currentLevel = 'level1';
        this.lessonIndex = 0;
        this.immersiveMode = false;
        this.culturalContext = false;
        this.pronunciationFocus = false;
        this.initializeProgress();
    }

    initializeProgress() {
        const savedProgress = localStorage.getItem('languageProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.proficiencyLevel = progress.proficiencyLevel;
            this.currentLevel = progress.currentLevel;
            this.lessonIndex = progress.lessonIndex;
        }
    }

    getCurrentLesson() {
        return languageCurriculum[this.proficiencyLevel][this.currentLevel].lessons[this.lessonIndex];
    }

    getNextLesson() {
        const currentLevelLessons = languageCurriculum[this.proficiencyLevel][this.currentLevel].lessons;
        
        if (this.lessonIndex < currentLevelLessons.length - 1) {
            this.lessonIndex++;
        } else {
            // Move to next level
            const levels = Object.keys(languageCurriculum[this.proficiencyLevel]);
            const currentLevelIndex = levels.indexOf(this.currentLevel);
            
            if (currentLevelIndex < levels.length - 1) {
                this.currentLevel = levels[currentLevelIndex + 1];
                this.lessonIndex = 0;
            } else {
                // Move to next proficiency level
                const proficiencyLevels = Object.keys(languageCurriculum);
                const currentProficiencyIndex = proficiencyLevels.indexOf(this.proficiencyLevel);
                
                if (currentProficiencyIndex < proficiencyLevels.length - 1) {
                    this.proficiencyLevel = proficiencyLevels[currentProficiencyIndex + 1];
                    this.currentLevel = 'level1';
                    this.lessonIndex = 0;
                }
            }
        }

        this.saveProgress();
        return this.getCurrentLesson();
    }

    saveProgress() {
        localStorage.setItem('languageProgress', JSON.stringify({
            proficiencyLevel: this.proficiencyLevel,
            currentLevel: this.currentLevel,
            lessonIndex: this.lessonIndex
        }));
    }

    getLessonPrompt() {
        const lesson = this.getCurrentLesson();
        const level = languageCurriculum[this.proficiencyLevel][this.currentLevel];
        return `${level.title}: ${lesson.response}`;
    }

    evaluateResponse(userInput) {
        const lesson = this.getCurrentLesson();
        const userWords = userInput.toLowerCase().trim();
        const targetWords = lesson.phrase.toLowerCase();

        // Simple matching for now - can be made more sophisticated
        if (userWords.includes(targetWords) || targetWords.includes(userWords)) {
            return {
                success: true,
                feedback: "Good job! Let's move to the next lesson.",
                nextLesson: this.getNextLesson()
            };
        }

        return {
            success: false,
            feedback: `Try saying: "${lesson.phrase}"`,
            nextLesson: null
        };
    }

    setLanguage(languageCode) {
        if (languageResponses[languageCode]) {
            this.currentLanguage = languageCode;
            return true;
        }
        return false;
    }

    setProficiencyLevel(level) {
        if (['beginner', 'intermediate', 'advanced'].includes(level)) {
            this.proficiencyLevel = level;
            return true;
        }
        return false;
    }

    setPreferences(preferences) {
        this.immersiveMode = preferences.immersiveMode || false;
        this.culturalContext = preferences.culturalContext || false;
        this.pronunciationFocus = preferences.pronunciationFocus || false;
    }

    getMessage(key) {
        const messages = languageResponses[this.currentLanguage][this.proficiencyLevel];
        if (this.immersiveMode && this.currentLanguage !== 'en') {
            return messages[key];
        }
        return messages[key] || languageResponses['en'][this.proficiencyLevel][key];
    }

    getResponse(userInput, context = {}) {
        let response = this.getMessage(context.responseType || 'practice');
        
        if (this.culturalContext && context.culturalNote) {
            response += `\n\n🎭 Cultural Note: ${context.culturalNote}`;
        }
        
        if (this.pronunciationFocus && context.pronunciation) {
            response += `\n\n🗣️ Pronunciation Tip: ${context.pronunciation}`;
        }
        
        return response;
    }

    isValidLanguage(languageCode) {
        return languageCode in languageResponses;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getProficiencyLevel() {
        return this.proficiencyLevel;
    }

    getPreferences() {
        return {
            immersiveMode: this.immersiveMode,
            culturalContext: this.culturalContext,
            pronunciationFocus: this.pronunciationFocus
        };
    }

    getAvailableLanguages() {
        return Object.keys(languageResponses);
    }
} 