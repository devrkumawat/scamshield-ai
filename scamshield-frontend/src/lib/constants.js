// Shared UI-facing constants (verdict labels, colors, backend<->UI mapping)

export const verdictMeta = {
  safe: {
    label: 'Safe',
    color: '#22C55E',
    className: 'safe',
    summary: "This looks legitimate. We didn't find the patterns scammers usually rely on.",
  },
  suspicious: {
    label: 'Suspicious',
    color: '#F59E0B',
    className: 'warning',
    summary: 'Some red flags here. Proceed carefully and verify before you act.',
  },
  high_risk: {
    label: 'High Risk',
    color: '#EF4444',
    className: 'danger',
    summary: "This matches known scam patterns closely. We'd recommend not engaging.",
  },
};

// Backend risk levels: safe | low | suspicious | high | critical
// Frontend verdicts:   safe | suspicious | high_risk
export function mapRiskLevel(level) {
  switch (level) {
    case 'safe':
    case 'low':
      return 'safe';
    case 'suspicious':
      return 'suspicious';
    case 'high':
        return 'high_risk';
    case 'critical':
      return 'high_risk';
    default:
      return 'safe';
  }
}

export const scanTypeLabels = {
  text: 'Text / SMS',
  whatsapp: 'WhatsApp',
  email: 'Email',
  url: 'URL Scan',
  screenshot: 'Screenshot',
  qr: 'QR Code',
};

export const riskColors = {
  safe: '#22C55E',
  suspicious: '#F59E0B',
  high_risk: '#EF4444',
};

// Convert an ISO date/timestamp into a compact relative label ("6 min ago").
export function timeAgo(iso) {
  if (!iso) return 'just now';
  
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'just now';
  
  const diffMs = Date.now() - then;
  const s = Math.max(0, Math.floor(diffMs / 1000));
  
  if (s < 45) return 'just now';
  
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d ago`;
  
  return new Date(iso).toLocaleDateString();
}