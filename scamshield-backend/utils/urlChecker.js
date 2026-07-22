// utils/urlChecker.js — Lightweight URL reputation heuristics (no external API required)
import axios from 'axios';

const SUSPICIOUS_TLDS = [
  'tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'click',
  'link', 'zip', 'mov', 'rest', 'country', 'kim', 'work', 'loan',
];

const SHORTENERS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'ow.ly',
  'buff.ly', 'rebrand.ly', 'cutt.ly', 'shorturl.at', 'rb.gy', 'adf.ly',
];

const TRUSTED_DOMAINS = [
  'google.com', 'youtube.com', 'facebook.com', 'instagram.com',
  'linkedin.com', 'github.com', 'microsoft.com', 'apple.com',
  'amazon.com', 'wikipedia.org', 'sbi.co.in', 'hdfcbank.com',
  'icicibank.com', 'axisbank.com', 'rbi.org.in', 'incometax.gov.in',
];

const IMPERSONATION_PATTERNS = [
  { legit: 'paypal', fake: /paypa[l1]-|paypal-secure|paypal\..*\.(tk|ml|xyz|top)/i },
  { legit: 'amazon', fake: /amaz[o0]n-|amazon-verify|amazon\..*\.(tk|ml|xyz|top)/i },
  { legit: 'google', fake: /g[o0]{2}gle-|google-verify/i },
  { legit: 'microsoft', fake: /micr[o0]soft-|microsft/i },
  { legit: 'sbi', fake: /sbi-online-verify|sbi-secure-/i },
  { legit: 'hdfc', fake: /hdfc-(update|verify|secure)-/i },
  { legit: 'icici', fake: /icici-(update|verify|secure)-/i },
];

const parseHost = (url) => {
  try {
    const u = new URL(url.startsWith('http') ? url : `http://${url}`);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
};

export const analyzeUrl = async (url) => {
  const findings = [];
  let score = 0;

  const host = parseHost(url);
  if (!host) {
    return { score: 40, findings: ['Invalid URL format'], host: null };
  }

  const tld = host.split('.').pop();
  if (SUSPICIOUS_TLDS.includes(tld)) {
    score += 30;
    findings.push(`Suspicious TLD: .${tld}`);
  }

  if (SHORTENERS.some((s) => host.includes(s))) {
    score += 20;
    findings.push('URL shortener detected — destination hidden');
  }

  if (host.split('.').length > 3) {
    score += 10;
    findings.push('Excessive subdomain depth');
  }

  if (host.includes('-')) {
    const dashes = (host.match(/-/g) || []).length;
    if (dashes >= 2) {
      score += 8;
      findings.push(`Multiple hyphens in domain (${dashes})`);
    }
  }

  if (/^\d+\.\d+\.\d+\.\d+/.test(host)) {
    score += 25;
    findings.push('Raw IP address instead of a domain name');
  }

  for (const p of IMPERSONATION_PATTERNS) {
    if (p.fake.test(host) && !host.endsWith(`${p.legit}.com`)) {
      score += 35;
      findings.push(`Possible ${p.legit} impersonation`);
      break;
    }
  }

  const isTrusted = TRUSTED_DOMAINS.some(
    (d) => host === d || host.endsWith(`.${d}`)
  );
  if (isTrusted) {
    score = Math.max(0, score - 30);
    findings.push('Domain appears in trusted list');
  }

  return {
    score: Math.min(100, score),
    findings,
    host,
    isTrusted,
  };
};

// Optional: expand a URL shortener (best-effort, silent failure)
export const expandUrl = async (url) => {
  try {
    const res = await axios.head(url, {
      maxRedirects: 5,
      timeout: 4000,
      validateStatus: () => true,
    });
    return res.request?.res?.responseUrl || res.config?.url || url;
  } catch {
    return url;
  }
};

export default analyzeUrl;
