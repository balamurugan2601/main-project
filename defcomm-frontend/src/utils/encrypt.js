import CryptoJS from 'crypto-js';

const SECRET_KEY = 'defcomm_prototype_key';

export const encryptMessage = (text) => {
  const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  return encrypted;
};

export const decryptMessage = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || 'Decryption Error';
  } catch (error) {
    return 'Decryption Error';
  }
};