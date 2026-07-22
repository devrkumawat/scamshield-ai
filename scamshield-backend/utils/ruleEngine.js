// utils/ruleEngine.js — Rule-based heuristic scam detection
//
// Runs BEFORE Gemini. Returns:
//   { score: 0-100, indicators: [...], categories: {...}, urls: [...] }

const RULES = {
  banking: {
    weight: 12,
    label: 'Banking impersonation',
    patterns: [
      /\b(sbi|hdfc|icici|axis|kotak|pnb|bob|canara|yesbank|indusind|paytm bank)\b/i,
      /\b(net ?banking|account (blocked|suspended|frozen|expired))\b/i,
      /\b(debit card|credit card|cvv|card number|pin number)\b/i,
    ],
  },
  kyc: {
    weight: 15,
    label: 'KYC / verification scam',
    patterns: [
      /\bkyc\b/i,
      /\b(re[- ]?verify|update your (kyc|details|documents))\b/i,
      /\b(aadhaar|pan card|adhar) (update|link|verify)\b/i,
      /\b(account will be (blocked|deactivated|suspended))\b/i,
    ],
  },
  otp: {
    weight: 20,
    label: 'OTP / credential harvesting',
    patterns: [
      /\botp\b/i,
      /\b(one[- ]?time (password|pin|code))\b/i,
      /\b(share|send|tell|give) (me )?(the )?(otp|code|password|pin)\b/i,
      /\b(verification code|security code|auth code)\b/i,
    ],
  },
  urgency: {
    weight: 10,
    label: 'Urgent / pressure language',
    patterns: [
      /\b(urgent(ly)?|immediately|right now|asap|hurry|expires? (soon|today|in \d+))\b/i,
      /\b(within \d+ (minutes|hours|hrs))\b/i,
      /\b(last chance|final notice|act now|limited time)\b/i,
      /\b(will be (closed|blocked|deleted|terminated))\b/i,
    ],
  },
  suspiciousDomain: {
    weight: 18,
    label: 'Suspicious domain / TLD',
    patterns: [
      /\.(tk|ml|ga|cf|gq|xyz|top|click|link|zip|mov|rest|country|kim|work|men|loan)\b/i,
      /\b(paypa1|amaz0n|g00gle|micr0soft|faceb00k|netfl1x|app1e|1cici|hdfc-bank)\b/i,
      /-(secure|login|verify|update|account|support|service)-/i,
    ],
  },
  urlShortener: {
    weight: 8,
    label: 'URL shortener (obfuscation)',
    patterns: [
      /\b(bit\.ly|tinyurl\.com|goo\.gl|t\.co|is\.gd|ow\.ly|buff\.ly|rebrand\.ly|cutt\.ly|shorturl\.at|rb\.gy|adf\.ly|bl\.ink)\b/i,
    ],
  },
  qrPayment: {
    weight: 14,
    label: 'QR / payment scam',
    patterns: [
      /\bscan (this |the )?qr\b/i,
      /\b(qr code) (to )?(receive|get|claim|verify)\b/i,
      /\b(pay|payment) (via|through) qr\b/i,
    ],
  },
  upi: {
    weight: 14,
    label: 'UPI scam',
    patterns: [
      /\b(upi|gpay|google ?pay|phonepe|paytm|bhim) (request|collect|pin|id)\b/i,
      /\b(collect request|payment request) (from|of)\b/i,
      /\b\w+@(oksbi|okhdfcbank|okicici|okaxis|ybl|paytm|upi|axl)\b/i,
      /\bapprove (the )?(request|payment) (to (receive|get))\b/i,
    ],
  },
  fakeRewards: {
    weight: 12,
    label: 'Fake rewards / prize',
    patterns: [
      /\b(you have won|congratulations|winner|selected)\b.*\b(prize|reward|gift|cashback|voucher|iphone|car)\b/i,
      /\b(claim (your )?(prize|reward|gift|bonus))\b/i,
      /\b(free (iphone|gift|voucher|cashback|recharge))\b/i,
    ],
  },
  lottery: {
    weight: 15,
    label: 'Lottery scam',
    patterns: [
      /\b(lottery|jackpot|lucky draw|sweepstakes)\b/i,
      /\b(you have won|selected for) (a |the )?(lottery|jackpot|\$|₹|rs)/i,
      /\b(kbc|kaun banega crorepati) (lottery|winner|prize)\b/i,
    ],
  },
  investment: {
    weight: 13,
    label: 'Investment / crypto scam',
    patterns: [
      /\b(guaranteed (returns?|profits?)|100% profit|double your (money|investment))\b/i,
      /\b(crypto|bitcoin|forex|trading) (opportunity|profit|signal|tip)\b/i,
      /\b(invest (now|today) and (earn|get|receive) \$?₹?\d+)/i,
      /\b(risk[- ]free investment)\b/i,
    ],
  },
  govImpersonation: {
    weight: 16,
    label: 'Government impersonation',
    patterns: [
      /\b(income tax|it department|gst|cbi|police|rbi|trai|uidai|epfo) (notice|warning|action|alert)\b/i,
      /\b(court (notice|summons|order))\b/i,
      /\b(arrest warrant|legal action) (will be|has been)\b/i,
      /\b(pm (kisan|yojana|scheme)|government (scheme|benefit|subsidy))\b.*\b(claim|apply|register)\b/i,
    ],
  },
  grammarAnomaly: {
    weight: 5,
    label: 'Grammar / spelling anomalies',
    patterns: [
      /\b(kindly do the needful|please revert|do the needfull)\b/i,
      /\b(dear (customer|sir\/madam|beneficiary))\b/i,
      /!!{2,}|\?{3,}|\${2,}/,
    ],
  },
  senderImpersonation: {
    weight: 10,
    label: 'Sender impersonation',
    patterns: [
      /\bfrom:? ?["']?(support|security|admin|no[- ]?reply|billing|update)@/i,
      /\b(official (team|support|desk)) of\b/i,
    ],
  },
};

const URL_REGEX = /((https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s)]*)?)/gi;

export const extractUrls = (text = '') => {
  const found = new Set();
  const matches = text.match(URL_REGEX) || [];
  for (const m of matches) {
    const clean = m.replace(/[.,;:!?)]+$/, '');
    if (clean.includes('.')) found.add(clean);
  }
  return [...found];
};

export const runRuleEngine = (input = '') => {
  const text = (input || '').toString();
  const indicators = [];
  const categories = {};
  let rawScore = 0;

  for (const [key, rule] of Object.entries(RULES)) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        rawScore += rule.weight;
        categories[key] = (categories[key] || 0) + 1;
        indicators.push({
          category: rule.label,
          keyword: match[0].slice(0, 80),
          weight: rule.weight,
          description: `Matched pattern for ${rule.label}`,
        });
        break; // only count each rule once
      }
    }
  }

  const urls = extractUrls(text);
  if (urls.length >= 2) {
    rawScore += 4;
    indicators.push({
      category: 'Multiple URLs',
      keyword: `${urls.length} links`,
      weight: 4,
      description: 'Message contains multiple links — common in phishing.',
    });
  }

  // Excessive capitalization
  const upperRatio =
    text.length > 20
      ? (text.match(/[A-Z]/g) || []).length / text.length
      : 0;
  if (upperRatio > 0.4) {
    rawScore += 5;
    indicators.push({
      category: 'Excessive capitalization',
      weight: 5,
      description: 'High ratio of uppercase letters — pressure tactic.',
    });
  }

  const score = Math.min(100, rawScore);

  return {
    score,
    indicators,
    categories,
    urls,
  };
};

export default runRuleEngine;
