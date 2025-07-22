const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../config/env');
const DeepgramService = require('./deepgramService');
const { ipcRenderer } = require('electron');
const { convertImageToBase64 } = require('../utils/imageUtils');

class ConversationService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        this.chat = this.model.startChat();
        
        this.deepgram = new DeepgramService((transcript) => {
            this.handleTranscript(transcript);
        });
    }

    async start() {
        await this.deepgram.connect();
        await this.deepgram.startScreenAudioCapture();
    }

    async handleScreenshot(screenshotPath) {
        try {
            const base64Image = await convertImageToBase64(screenshotPath);
            const response = await this.model.generateContent([
                { text: "Please analyze this screenshot:" },
                { inlineData: { data: base64Image, mimeType: "image/png" }}
            ]);
            return response.response.text();
        } catch (error) {
            console.error('Error processing screenshot:', error);
            return null;
        }
    }

    async handleTranscript(transcript, screenshotPath = null) {
        try {
            let response;
            if (screenshotPath) {
                const base64Image = await convertImageToBase64(screenshotPath);
                response = await this.model.generateContent([
                    { text: transcript },
                    { inlineData: { data: base64Image, mimeType: "image/png" }}
                ]);
            } else {
                response = await this.chat.sendMessage(transcript);
            }
            return response.response.text();
        } catch (error) {
            console.error('Error processing transcript:', error);
            return null;
        }
    }

    stop() {
        this.deepgram.stopCapture();
    }
}

module.exports = ConversationService;
