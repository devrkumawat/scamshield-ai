// API client for the ScamShield backend.
//
// The base URL is picked from VITE_API_URL (see .env / .env.example).
// It should point to the backend origin without a trailing slash, e.g.:
//   VITE_API_URL=http://localhost:8001
// All endpoints below are prefixed with `/api` automatically.

const RAW_BASE = import.meta.env.VITE_API_URL || '';
const BASE = RAW_BASE.replace(/\/+$/, '');

/**
 * Builds the full API URL for a given path.
 */
function apiUrl(path) {
  return `${BASE}/api${path}`;
}

/**
 * Parses the response, handling both successful JSON and error states gracefully.
 */
async function handleJson(res) {
  let payload = null;
  
  try {
    payload = await res.json();
  } catch {
    // Non-JSON response (e.g., raw text or empty body on 500 errors)
  }
  
  if (!res.ok || (payload && payload.success === false)) {
    const msg =
      (payload && (payload.message || payload.error)) ||
      res.statusText ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }
  
  // Return the nested data object if it exists, otherwise the raw payload
  return payload?.data ?? payload;
}

/**
 * Helper for POST requests with JSON body.
 */
async function postJson(path, body) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  return handleJson(res);
}

/**
 * Helper for POST requests with FormData (file uploads).
 */
async function postForm(path, formData) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    body: formData, // Do NOT set Content-Type, the browser sets it with the boundary automatically
  });
  return handleJson(res);
}

/**
 * Helper for GET requests.
 */
async function getJson(path) {
  const res = await fetch(apiUrl(path));
  return handleJson(res);
}

export const api = {
  getHealth: () => getJson('/health'),
  getAbout: () => getJson('/about'),
  getDashboard: () => getJson('/dashboard'),

  analyzeText: (text) => postJson('/analyze/text', { text }),
  analyzeWhatsapp: (text) => postJson('/analyze/whatsapp', { text }),
  analyzeEmail: ({ subject, body, sender }) =>
    postJson('/analyze/email', { subject, body, sender }),
  analyzeUrl: (url) => postJson('/analyze/url', { url }),

  analyzeScreenshot: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return postForm('/analyze/screenshot', fd);
  },
  
  analyzeQR: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return postForm('/analyze/qr', fd);
  },
};

export default api;