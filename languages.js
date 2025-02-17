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

class LanguageHandler {
    constructor() {
        this.currentLanguage = 'en';
        this.proficiencyLevel = 'beginner';
        this.immersiveMode = false;
        this.culturalContext = false;
        this.pronunciationFocus = false;
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