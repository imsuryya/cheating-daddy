const fs = require('fs').promises;

async function convertImageToBase64(imagePath) {
    try {
        const imageBuffer = await fs.readFile(imagePath);
        return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
        console.error('Error converting image to base64:', error);
        throw error;
    }
}

module.exports = {
    convertImageToBase64
};
