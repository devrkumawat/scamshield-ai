import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Cpu,
  Lock,
  Eye,
  MessageSquare,
  MessageCircle,
  Mail,
  Link2,
  Image as ImageIcon,
  QrCode,
} from 'lucide-react';
import api from '../lib/api.js';

const staticPillars = [
  { 
    icon: Cpu, 
    title: 'Hybrid detection engine', 
    body: 'A rule-based cybersecurity engine combined with Google Gemini for context-aware verdicts.' 
  },
  { 
    icon: Eye, 
    title: 'Multi-format coverage', 
    body: 'One shield across text, WhatsApp, email, links, screenshots and QR codes — scammers switch channels, so we do too.' 
  },
  { 
    icon: Lock, 
    title: 'Privacy-conscious', 
    body: 'Only the content you submit is analyzed, and only to produce your verdict.' 
  },
];

const channelIcons = {
  'Text / SMS / message analysis': MessageSquare,
  'WhatsApp message analysis': MessageCircle,
  'Email header + body analysis': Mail,
  'URL & domain reputation checks': Link2,
  'Screenshot OCR (Tesseract.js)': ImageIcon,
  'QR code decoding & risk scoring': QrCode,
};

export default function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        const data = await api.getAbout();
        if (!cancelled) setAbout(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load About info.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    
    return () => { 
      cancelled = true; 
    };
  }, []);

  const tagline = about?.tagline || 'Multi-modal scam & phishing detection.';
  const description =
    about?.description ||
    'ScamShield AI analyzes text, WhatsApp, email, URLs, screenshots and QR codes to surface fraud attempts before they cost you.';
  const capabilities = about?.capabilities || [];
  const categories = about?.detectionCategories || [];
  const techStack = about?.techStack || [];

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8"
      >
        <span className="chip flex items-center gap-1.5 w-max border-accent/30 bg-accent-soft text-accent mb-4 px-3 py-1 rounded-full text-sm">
          <ShieldCheck size={12} /> About {about?.name || 'ScamShield AI'}
        </span>
        <h1 className="text-3xl font-display font-semibold tracking-tight">
          Built to catch what feels off, before you act on it.
        </h1>
        <p className="text-accent mt-2 text-sm">{tagline}</p>
        <p className="text-muted mt-3 leading-relaxed">{description}</p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {staticPillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 rounded-2xl"
          >
            <div className="h-10 w-10 rounded-xl bg-accent-soft flex items-center justify-center mb-3">
              <p.icon size={18} className="text-accent" />
            </div>
            <h3 className="font-display font-semibold text-sm">{p.title}</h3>
            <p className="text-sm text-muted mt-1.5 leading-relaxed">{p.body}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 mb-10 rounded-2xl"
      >
        <h2 className="font-display font-semibold mb-4">Where it works</h2>
        {loading ? (
          <p className="text-sm text-muted">Loading capabilities…</p>
        ) : capabilities.length ? (
          <div className="flex flex-wrap gap-3">
            {capabilities.map((c) => {
              const Icon = channelIcons[c] || ShieldCheck;
              return (
                <div key={c} className="flex items-center gap-2 rounded-xl border border-line px-3.5 py-2.5 text-sm text-white/80">
                  <Icon size={15} className="text-accent" />
                  {c}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">Capabilities unavailable.</p>
        )}
      </motion.div>

      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="glass-card p-6 mb-10 rounded-2xl"
        >
          <h2 className="font-display font-semibold mb-4">Detection categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c} className="chip border border-line bg-white/[0.03] text-white/80 text-xs px-3 py-1 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {techStack.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="glass-card p-6 mb-10 rounded-2xl"
        >
          <h2 className="font-display font-semibold mb-4">Under the hood</h2>
          <div className="flex flex-wrap gap-2">
            {techStack.map((t) => (
              <span key={t} className="chip border border-accent/20 bg-accent-soft text-accent text-xs font-mono px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {error && (
        <p className="text-xs text-danger mt-2">
          Could not reach backend: {error}
        </p>
      )}
    </div>
  );
}