const { deepgramConfig } = require('../config/deepgram');
const { deepgramApiKey } = require('../config/env');

class DeepgramService {
    constructor(onTranscript) {
        this.apiKey = deepgramApiKey;
        this.socket = null;
        this.onTranscript = onTranscript;
        this.audioContext = null;
        this.mediaRecorder = null;
        this.micStream = null;
        this.screenStream = null;
        this.combinedStream = null;
    }

    async startCombinedAudioCapture() {
        try {
            // Get microphone stream
            this.micStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            // Get screen audio stream
            this.screenStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: 'desktop'
                    }
                },
                video: false
            });

            // Create audio context
            this.audioContext = new AudioContext();

            // Create sources for both streams
            const micSource = this.audioContext.createMediaStreamSource(this.micStream);
            const screenSource = this.audioContext.createMediaStreamSource(this.screenStream);

            // Create a mixer node
            const mixer = this.audioContext.createGain();
            micSource.connect(mixer);
            screenSource.connect(mixer);

            // Create MediaStream from mixed audio
            const dest = this.audioContext.createMediaStreamDestination();
            mixer.connect(dest);
            this.combinedStream = dest.stream;

            // Create media recorder with combined stream
            this.mediaRecorder = new MediaRecorder(this.combinedStream);
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.sendAudio(event.data);
                }
            };

            this.mediaRecorder.start(1000); // Capture in 1-second chunks
        } catch (error) {
            console.error('Error capturing audio:', error);
        }
    }

    connect() {
        this.socket = new WebSocket(deepgramConfig.wsUrl, {
            headers: {
                Authorization: `Token ${this.apiKey}`
            }
        });

        this.socket.onopen = () => {
            console.log('Connected to Deepgram');
        };

        this.socket.onmessage = (message) => {
            const data = JSON.parse(message.data);
            if (data.channel && data.channel.alternatives) {
                const transcript = data.channel.alternatives[0].transcript;
                if (transcript && this.onTranscript) {
                    this.onTranscript(transcript);
                }
            }
        };
    }

    sendAudio(audioData) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(audioData);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }

    stopCapture() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
        }
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
        }
        this.disconnect();
    }
}

module.exports = DeepgramService;
