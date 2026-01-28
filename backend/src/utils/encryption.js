import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT = 'codepods-secure-salt-v1'; // In production, use env variable
const TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * @returns {Buffer} Encryption key
 */
function getKey() {
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY is not set in environment variables');
    }
    // Derive key from ENCRYPTION_KEY
    return crypto.scryptSync(process.env.ENCRYPTION_KEY, SALT, 32);
}

/**
 * Encrypt sensitive data (like GitHub tokens)
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text with IV and auth tag (format: iv:encrypted:authTag)
 */
export function encrypt(text) {
    if (!text) return null;

    try {
        const key = getKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Return format: iv:encrypted:authTag (all in hex)
        return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted text (format: iv:encrypted:authTag)
 * @returns {string} Decrypted plain text
 */
export function decrypt(encryptedData) {
    if (!encryptedData) return null;

    try {
        const key = getKey();
        const parts = encryptedData.split(':');

        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const authTag = Buffer.from(parts[2], 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Check if a string is encrypted (has the expected format)
 * @param {string} data - Data to check
 * @returns {boolean} True if data appears to be encrypted
 */
export function isEncrypted(data) {
    if (!data || typeof data !== 'string') return false;
    const parts = data.split(':');
    return parts.length === 3 && parts.every(part => /^[0-9a-f]+$/i.test(part));
}
