// utils/qrDecoder.js — Decode QR codes from uploaded images
import jsQR from 'jsqr';
import sharp from 'sharp';

export const decodeQRFromImage = async (filePath) => {
  try {
    const { data, info } = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const code = jsQR(
      new Uint8ClampedArray(data.buffer),
      info.width,
      info.height
    );

    if (!code || !code.data) {
      return { success: false, message: 'No QR code detected in image.' };
    }

    return {
      success: true,
      content: code.data,
      type: classifyQRContent(code.data),
    };
  } catch (err) {
    console.error('QR decode error:', err.message);
    return { success: false, message: err.message };
  }
};

const classifyQRContent = (content) => {
  if (/^upi:\/\//i.test(content)) return 'upi';
  if (/^(https?:\/\/|www\.)/i.test(content)) return 'url';
  if (/^bitcoin:/i.test(content)) return 'crypto';
  if (/^mailto:/i.test(content)) return 'email';
  if (/^tel:/i.test(content)) return 'phone';
  return 'text';
};

export default decodeQRFromImage;
