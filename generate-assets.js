const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Asset definitions
const ASSETS = {
    buddies: [
        {
            name: 'Carlota',
            description: 'A friendly and patient female language tutor in her early 30s with a warm smile. Professional yet approachable appearance.',
            role: 'Conversation',
            imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
            languages: ['English', 'Spanish'],
            specialties: ['Pronunciation', 'Conversation']
        },
        {
            name: 'Paulo',
            description: 'An energetic and fun male language partner in his mid-20s. Casual, modern appearance with a friendly expression.',
            role: 'Conversation',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            languages: ['English', 'Portuguese'],
            specialties: ['Daily Conversation', 'Cultural Exchange']
        },
        {
            name: 'Theo',
            description: 'A knowledgeable and professional male language instructor in his 40s. Academic appearance with glasses and a reassuring smile.',
            role: 'Assistant',
            imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
            languages: ['English', 'French', 'German'],
            specialties: ['Grammar', 'Academic Language']
        }
    ],
    icons: [
        {
            name: 'app-icon',
            imageUrl: 'https://img.icons8.com/color/512/language-learning.png',
            sizes: ['192x192', '512x512']
        }
    ],
    backgrounds: [
        {
            name: 'login-bg',
            imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926',
            size: '1920x1080'
        }
    ],
    soundEffects: [
        {
            name: 'correct',
            url: 'https://assets.mixkit.co/sfx/download/mixkit-correct-answer-tone-2870.wav'
        },
        {
            name: 'incorrect',
            url: 'https://assets.mixkit.co/sfx/download/mixkit-wrong-answer-fail-notification-946.wav'
        },
        {
            name: 'achievement',
            url: 'https://assets.mixkit.co/sfx/download/mixkit-achievement-bell-600.wav'
        },
        {
            name: 'level-up',
            url: 'https://assets.mixkit.co/sfx/download/mixkit-game-level-completed-2059.wav'
        }
    ],
    modelConfigs: {
        speechRecognition: {
            name: 'wav2vec2',
            languages: ['en', 'es', 'fr', 'de', 'pt'],
            configFile: {
                url: 'https://huggingface.co/facebook/wav2vec2-base/resolve/main/config.json',
                path: 'models/wav2vec2/config.json'
            }
        },
        translation: {
            name: 'marian',
            languages: ['en-es', 'en-fr', 'en-de', 'en-pt'],
            configFile: {
                url: 'https://huggingface.co/Helsinki-NLP/opus-mt-en-ROMANCE/resolve/main/config.json',
                path: 'models/marian/config.json'
            }
        },
        textToSpeech: {
            name: 'tacotron2',
            languages: ['en', 'es', 'fr', 'de', 'pt'],
            configFile: {
                url: 'https://huggingface.co/microsoft/speecht5_tts/resolve/main/config.json',
                path: 'models/tacotron2/config.json'
            }
        },
        languageModel: {
            name: 'bert-multilingual',
            configFile: {
                url: 'https://huggingface.co/bert-base-multilingual-cased/resolve/main/config.json',
                path: 'models/bert/config.json'
            }
        }
    }
};

async function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: ${response.statusCode}`));
                return;
            }

            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                try {
                    await fs.mkdir(path.dirname(filename), { recursive: true });
                    await fs.writeFile(filename, buffer);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

async function generateAssets() {
    try {
        // Create base directories
        const directories = [
            'images',
            'icons',
            'sounds',
            'models',
            'models/wav2vec2',
            'models/marian',
            'models/tacotron2',
            'models/bert'
        ];
        
        for (const dir of directories) {
            await fs.mkdir(path.join(__dirname, dir), { recursive: true });
        }

        // Download buddy avatars
        for (const buddy of ASSETS.buddies) {
            console.log(`Downloading avatar for ${buddy.name}...`);
            const filename = path.join(__dirname, 'images', `${buddy.name.toLowerCase()}.jpg`);
            await downloadFile(buddy.imageUrl, filename);
            
            // Generate buddy info JSON
            const buddyInfo = {
                name: buddy.name,
                description: buddy.description,
                role: buddy.role,
                languages: buddy.languages,
                specialties: buddy.specialties
            };
            await fs.writeFile(
                path.join(__dirname, 'images', `${buddy.name.toLowerCase()}.json`),
                JSON.stringify(buddyInfo, null, 2)
            );
            console.log(`✓ Downloaded ${buddy.name}'s assets`);
        }

        // Download app icons
        for (const icon of ASSETS.icons) {
            for (const size of icon.sizes) {
                console.log(`Downloading ${icon.name} at ${size}...`);
                const filename = path.join(__dirname, 'icons', `${icon.name}-${size}.png`);
                await downloadFile(icon.imageUrl, filename);
                console.log(`✓ Downloaded ${icon.name} icon (${size})`);
            }
        }

        // Download backgrounds
        for (const bg of ASSETS.backgrounds) {
            console.log(`Downloading ${bg.name}...`);
            const filename = path.join(__dirname, 'images', `${bg.name}.jpg`);
            await downloadFile(bg.imageUrl, filename);
            console.log(`✓ Downloaded ${bg.name} background`);
        }

        // Download sound effects
        for (const sound of ASSETS.soundEffects) {
            console.log(`Downloading ${sound.name} sound...`);
            const filename = path.join(__dirname, 'sounds', `${sound.name}.wav`);
            await downloadFile(sound.url, filename);
            console.log(`✓ Downloaded ${sound.name} sound effect`);
        }

        // Download model configs
        for (const [modelType, config] of Object.entries(ASSETS.modelConfigs)) {
            console.log(`Downloading ${modelType} config...`);
            await downloadFile(config.configFile.url, path.join(__dirname, config.configFile.path));
            
            // Generate model info JSON
            const modelInfo = {
                name: config.name,
                type: modelType,
                languages: config.languages || [],
                configPath: config.configFile.path
            };
            await fs.writeFile(
                path.join(__dirname, 'models', `${modelType}.json`),
                JSON.stringify(modelInfo, null, 2)
            );
            console.log(`✓ Downloaded ${modelType} configuration`);
        }

        console.log('\n✨ Asset generation complete! ✨');
        console.log('\nGenerated directory structure:');
        console.log('-----------------------------');
        const structure = {
            'learnlag/': {
                'images/': ASSETS.buddies.map(b => [`${b.name.toLowerCase()}.jpg`, `${b.name.toLowerCase()}.json`]).flat(),
                'icons/': ASSETS.icons.map(i => i.sizes.map(s => `${i.name}-${s}.png`)).flat(),
                'sounds/': ASSETS.soundEffects.map(s => `${s.name}.wav`),
                'models/': {
                    'wav2vec2/': ['config.json'],
                    'marian/': ['config.json'],
                    'tacotron2/': ['config.json'],
                    'bert/': ['config.json'],
                    'model-info/': Object.keys(ASSETS.modelConfigs).map(type => `${type}.json`)
                }
            }
        };
        console.log(JSON.stringify(structure, null, 2));

    } catch (error) {
        console.error('Error generating assets:', error.message);
        process.exit(1);
    }
}

// Main execution
generateAssets(); 