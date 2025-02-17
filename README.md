# LearnLag - AI-Powered Language Learning Assistant

LearnLag is a Progressive Web App (PWA) that helps users learn new languages through interactive conversations with AI. It features both text and voice interactions, making language learning more engaging and accessible.

## Features

- 🌐 Support for multiple languages (Spanish, French, German, Italian)
- 🎤 Voice input and output capabilities
- 💬 Interactive chat interface
- 🤖 AI-powered responses using Google's Gemini AI
- 📱 Progressive Web App (works offline, installable on devices)
- 🎯 Real-time language corrections and feedback

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/robinfrancis186/learnlag.git
   cd learnlag
   ```

2. Set up a local development server:
   - You can use any local server, for example:
     ```bash
     python -m http.server 8000
     ```
   - Or use Node.js's `http-server`:
     ```bash
     npx http-server
     ```

3. Open your browser and navigate to `http://localhost:8000` (or whatever port your server is using)

## Usage

1. Select your target language from the dropdown menu
2. Type your message or click the microphone icon to use voice input
3. Receive AI-powered responses with corrections and explanations
4. Practice pronunciation with text-to-speech functionality

## Technical Requirements

- Modern web browser with support for:
  - Web Speech API
  - Service Workers
  - IndexedDB
- Internet connection for AI responses
- Gemini API key (for development)

## Security Note

The API key in the code is for demonstration purposes. In a production environment, you should:
1. Store the API key securely
2. Implement proper backend authentication
3. Never expose API keys in client-side code

## Contributing

Feel free to submit issues and enhancement requests! 