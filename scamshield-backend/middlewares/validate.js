// middlewares/validate.js — request body validators
export const validateText = (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Field "text" is required (min 3 characters).',
    });
  }
  if (text.length > 20000) {
    return res.status(400).json({
      success: false,
      message: 'Field "text" is too long (max 20,000 characters).',
    });
  }
  req.body.text = text.trim();
  next();
};

export const validateUrl = (req, res, next) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Field "url" is required.',
    });
  }
  const cleaned = url.trim();
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
  if (!urlRegex.test(cleaned)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid URL format.',
    });
  }
  req.body.url = cleaned.startsWith('http') ? cleaned : `http://${cleaned}`;
  next();
};

export const validateEmail = (req, res, next) => {
  const { subject, body, sender } = req.body;
  if (!body || typeof body !== 'string' || body.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Field "body" is required (min 3 characters).',
    });
  }
  req.body.subject = (subject || '').toString().trim();
  req.body.sender = (sender || '').toString().trim();
  req.body.body = body.trim();
  next();
};

export const validateImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Image file is required (multipart field "image").',
    });
  }
  next();
};
