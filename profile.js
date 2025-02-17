class Profile {
    constructor() {
        this.checkAuth();
        this.initializeElements();
        this.initializeEventListeners();
        this.loadUserData();
    }

    checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
    }

    initializeElements() {
        // Profile elements
        this.userName = document.getElementById('userName');
        this.userEmail = document.getElementById('userEmail');
        this.totalXP = document.getElementById('totalXP');
        this.currentStreak = document.getElementById('currentStreak');
        this.wordsLearned = document.getElementById('wordsLearned');
        
        // Progress elements
        this.languageProgress = document.getElementById('languageProgress');
        this.achievementsGrid = document.getElementById('achievementsGrid');
        
        // Flashcard elements
        this.totalCards = document.getElementById('totalCards');
        this.masteredCards = document.getElementById('masteredCards');
        this.reviewingCards = document.getElementById('reviewingCards');
        this.newCards = document.getElementById('newCards');
        this.reviewTimeline = document.getElementById('reviewTimeline');

        // Charts
        this.studyTimeChart = document.getElementById('studyTimeChart');
        this.accuracyChart = document.getElementById('accuracyChart');
        this.vocabularyChart = document.getElementById('vocabularyChart');
        this.practiceChart = document.getElementById('practiceChart');
    }

    initializeEventListeners() {
        document.getElementById('logoutButton').addEventListener('click', () => this.handleLogout());
    }

    async loadUserData() {
        try {
            const userData = await this.getUserData();
            this.updateProfile(userData);
            this.updateStats(userData);
            this.updateLanguageProgress(userData);
            this.updateAchievements(userData);
            this.updateFlashcardStats(userData);
            this.createCharts(userData);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async getUserData() {
        // For demonstration, getting data from localStorage
        const token = localStorage.getItem('authToken');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const learningProgress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
        const flashcards = JSON.parse(localStorage.getItem('flashcards') || '{}');
        
        // Find current user
        const currentUser = users.find(user => user.token === token);
        if (!currentUser) {
            throw new Error('User not found');
        }

        return {
            user: currentUser,
            progress: learningProgress,
            flashcards: flashcards
        };
    }

    updateProfile(data) {
        this.userName.textContent = data.user.name;
        this.userEmail.textContent = data.user.email;
    }

    updateStats(data) {
        const progress = data.progress;
        let totalXP = 0;
        
        // Calculate total XP across all languages
        Object.values(progress.languages || {}).forEach(lang => {
            totalXP += lang.xp || 0;
        });

        this.totalXP.textContent = totalXP;
        this.currentStreak.textContent = progress.streak || 0;
        this.wordsLearned.textContent = Object.keys(progress.vocabulary || {}).length;
    }

    updateLanguageProgress(data) {
        const languages = data.progress.languages || {};
        this.languageProgress.innerHTML = '';

        Object.entries(languages).forEach(([code, lang]) => {
            const card = document.createElement('div');
            card.className = 'language-card';
            card.innerHTML = `
                <div class="language-header">
                    <span class="language-flag">${this.getLanguageFlag(code)}</span>
                    <h3>${this.getLanguageName(code)}</h3>
                </div>
                <div class="language-level">
                    <span class="level-badge">${lang.level}</span>
                    <span class="xp-count">${lang.xp || 0} XP</span>
                </div>
                <div class="skill-bars">
                    <div class="skill-bar">
                        <label>Grammar</label>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${(lang.grammarAccuracy || 0) * 100}%"></div>
                        </div>
                    </div>
                    <div class="skill-bar">
                        <label>Vocabulary</label>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${(lang.vocabularySize || 0) / 100}%"></div>
                        </div>
                    </div>
                    <div class="skill-bar">
                        <label>Pronunciation</label>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${(lang.pronunciationScore || 0) * 100}%"></div>
                        </div>
                    </div>
                </div>
            `;
            this.languageProgress.appendChild(card);
        });
    }

    updateAchievements(data) {
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const achievementsList = {
            'first_conversation': {
                title: '🎯 First Steps',
                description: 'Complete your first conversation'
            },
            'perfect_streak_3': {
                title: '🎯 Quick Learner',
                description: 'Get 3 correct responses in a row'
            },
            'daily_goal': {
                title: '🎯 Goal Crusher',
                description: 'Complete daily learning goal'
            },
            'vocabulary_master': {
                title: '📚 Vocabulary Master',
                description: 'Learn 50 new words'
            },
            'pronunciation_pro': {
                title: '🎤 Pronunciation Pro',
                description: 'Complete 10 voice exercises'
            },
            'streak_7': {
                title: '🔥 Week Warrior',
                description: 'Maintain a 7-day learning streak'
            }
        };

        this.achievementsGrid.innerHTML = '';
        Object.entries(achievementsList).forEach(([id, achievement]) => {
            const earned = achievements.includes(id);
            const card = document.createElement('div');
            card.className = `achievement-card ${earned ? 'earned' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${achievement.title.split(' ')[0]}</div>
                <div class="achievement-info">
                    <h3>${achievement.title}</h3>
                    <p>${achievement.description}</p>
                </div>
                <div class="achievement-status">
                    ${earned ? '<span class="material-icons-round">check_circle</span>' : '<span class="material-icons-round">lock</span>'}
                </div>
            `;
            this.achievementsGrid.appendChild(card);
        });
    }

    updateFlashcardStats(data) {
        const flashcards = data.flashcards;
        const stats = flashcards.stats || { learned: 0, reviewing: 0, mastered: 0 };
        
        this.totalCards.textContent = stats.learned + stats.reviewing + stats.mastered;
        this.masteredCards.textContent = stats.mastered;
        this.reviewingCards.textContent = stats.reviewing;
        this.newCards.textContent = stats.learned;

        this.updateReviewTimeline(data);
    }

    updateReviewTimeline(data) {
        const cards = Array.from(data.flashcards.cards || []);
        const now = new Date();
        const timeline = [];

        // Group cards by review date
        cards.forEach(card => {
            if (card.nextReview) {
                const reviewDate = new Date(card.nextReview);
                const dayDiff = Math.floor((reviewDate - now) / (1000 * 60 * 60 * 24));
                
                if (dayDiff >= 0 && dayDiff <= 7) {
                    if (!timeline[dayDiff]) {
                        timeline[dayDiff] = 0;
                    }
                    timeline[dayDiff]++;
                }
            }
        });

        // Create timeline visualization
        this.reviewTimeline.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const day = document.createElement('div');
            day.className = 'timeline-day';
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            
            day.innerHTML = `
                <div class="day-label">${this.getDayLabel(i)}</div>
                <div class="day-bar">
                    <div class="bar-fill" style="height: ${Math.min(100, (timeline[i] || 0) * 10)}%"></div>
                </div>
                <div class="card-count">${timeline[i] || 0}</div>
            `;
            this.reviewTimeline.appendChild(day);
        }
    }

    createCharts(data) {
        this.createStudyTimeChart(data);
        this.createAccuracyChart(data);
        this.createVocabularyChart(data);
        this.createPracticeChart(data);
    }

    createStudyTimeChart(data) {
        const ctx = document.getElementById('studyTimeChart').getContext('2d');
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const studyMinutes = days.map(() => Math.floor(Math.random() * 60 + 30)); // Sample data

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Minutes Studied',
                    data: studyMinutes,
                    backgroundColor: '#7C3AED',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    }
                }
            }
        });
    }

    createAccuracyChart(data) {
        const ctx = document.getElementById('accuracyChart').getContext('2d');
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const accuracyData = days.map(() => Math.floor(Math.random() * 30 + 70)); // Sample data

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Accuracy %',
                    data: accuracyData,
                    borderColor: '#EC4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Accuracy %'
                        }
                    }
                }
            }
        });
    }

    createVocabularyChart(data) {
        const ctx = document.getElementById('vocabularyChart').getContext('2d');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const vocabularyData = months.map((_, index) => Math.floor((index + 1) * 50 * (1 + Math.random() * 0.3))); // Sample data

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Words Learned',
                    data: vocabularyData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Words'
                        }
                    }
                }
            }
        });
    }

    createPracticeChart(data) {
        const ctx = document.getElementById('practiceChart').getContext('2d');
        const practiceData = {
            labels: ['Speaking', 'Writing', 'Reading', 'Listening'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: [
                    '#7C3AED',
                    '#EC4899',
                    '#3B82F6',
                    '#10B981'
                ],
                borderWidth: 0,
                borderRadius: 4
            }]
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: practiceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    handleLogout() {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }

    getLanguageFlag(code) {
        const flags = {
            'en': '🇬🇧',
            'fr': '🇫🇷',
            'de': '🇩🇪'
        };
        return flags[code] || '🌐';
    }

    getLanguageName(code) {
        const names = {
            'en': 'English',
            'fr': 'French',
            'de': 'German'
        };
        return names[code] || code.toUpperCase();
    }

    getDayLabel(dayOffset) {
        if (dayOffset === 0) return 'Today';
        if (dayOffset === 1) return 'Tomorrow';
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
}

// Initialize profile
document.addEventListener('DOMContentLoaded', () => {
    new Profile();
}); 