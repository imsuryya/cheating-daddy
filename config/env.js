const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    geminiApiKey: process.env.GEMINI_API_KEY,
    deepgramApiKey: process.env.DEEPGRAM_API_KEY
};
