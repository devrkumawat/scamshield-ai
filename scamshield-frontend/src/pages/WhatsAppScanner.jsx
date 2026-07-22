import { useState } from 'react';
import { MessageCircle, User } from 'lucide-react';
import ScannerShell from '../components/ScannerShell.jsx';
import { useAnalyze } from '../hooks/useAnalyze.js';
import api from '../lib/api.js';

const examples = [
  'Hi, this is HR from Zynko Global. Work-from-home offer, ₹3000/day, no experience needed. Reply YES to start.',
  'Mom, my phone broke, this is my new number. Can you send money urgently?',
];

export default function WhatsAppScanner() {
  const [sender, setSender] = useState('');
  const [text, setText] = useState('');

  // Use \n for the line break to keep the code neat
  const composed = sender ? `From: ${sender}\n${text}` : text;

  const { analyzing, progress, run } = useAnalyze({
    type: 'whatsapp',
    inputPreview: text.slice(0, 80) || 'Untitled WhatsApp scan',
    analyze: () => api.analyzeWhatsapp(composed),
  });

  return (
    <ScannerShell
      icon={MessageCircle}
      title="WhatsApp Scanner"
      subtitle="Paste a forwarded message or chat text. Adding the sender name/number helps flag impersonation."
      onAnalyze={run}
      analyzing={analyzing}
      progress={progress}
      canAnalyze={text.trim().length > 0}
    >
      <div className="relative mb-3">
        <User 
          size={15} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" 
          aria-hidden="true"
        />
        <input
          type="text"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          placeholder="Sender name or number (optional)"
          aria-label="Sender name or number"
          className="input-field pl-9 w-full"
          disabled={analyzing}
        />
      </div>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the WhatsApp message here…"
        aria-label="WhatsApp message text"
        rows={7}
        className="input-field resize-none leading-relaxed w-full"
        disabled={analyzing}
      />
      
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs text-muted">Try an example:</span>
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setText(ex)}
            disabled={analyzing}
            title={ex} // Shows the full text on hover since it's truncated
            className="text-xs px-2.5 py-1.5 rounded-lg border border-line text-muted hover:text-white hover:border-accent/30 transition-colors max-w-xs truncate disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ex}
          </button>
        ))}
      </div>
    </ScannerShell>
  );
}