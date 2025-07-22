const deepgramConfig = {
    wsUrl: 'wss://api.deepgram.com/v1/listen',
    settings: {
        language: 'en',
        model: 'nova-2',
        smart_format: true,
        interim_results: true,
        encoding: 'linear16',
        sample_rate: 16000
    }
};

module.exports = deepgramConfig;
