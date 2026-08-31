const QRCode = require('qrcode');

/**
 * Generate QR code Data URL (base64 PNG) from a text string or payload token
 * @param {string} text - Secure token or URL
 * @returns {Promise<string>} Base64 Data URL string
 */
const generateQRCodeDataURL = async (text) => {
  try {
    const opts = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#121214',
        light: '#FFFFFF'
      }
    };
    return await QRCode.toDataURL(text, opts);
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
};

/**
 * Generate secure invitation token format e.g. INV-8F72A9C1
 */
const generateSecureToken = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'INV-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  generateQRCodeDataURL,
  generateSecureToken
};
