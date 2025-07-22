require('dotenv').config();

const env = {
    deepgramApiKey: process.env.DEEPGRAM_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY
};

module.exports = env;
