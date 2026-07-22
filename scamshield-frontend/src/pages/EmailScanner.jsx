import { useState } from 'react';
import { Mail, AtSign, Type } from 'lucide-react';
import ScannerShell from '../components/ScannerShell.jsx';
import { useAnalyze } from '../hooks/useAnalyze.js';
import api from '../lib/api.js';

export default function EmailScanner() {
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const { analyzing, progress, run } = useAnalyze({
    type: 'email',
    inputPreview: subject || body.slice(0, 80) || 'Untitled email scan',
    analyze: () => api.analyzeEmail({ subject, body, sender }),
  });

  return (
    <ScannerShell
      icon={Mail}
      title="Email Scanner"
      subtitle="Paste the sender address, subject and body. We'll check for spoofed domains, urgency cues and suspicious links."
      onAnalyze={run}
      analyzing={analyzing}
      progress={progress}
      canAnalyze={body.trim().length > 0}
    >
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div className="relative">
          <AtSign 
            size={15} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" 
            aria-hidden="true"
          />
          <input
            type="email"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Sender email address"
            aria-label="Sender email address"
            className="input-field pl-9 w-full"
            disabled={analyzing}
          />
        </div>
        <div className="relative">
          <Type 
            size={15} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" 
            aria-hidden="true"
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
            aria-label="Subject line"
            className="input-field pl-9 w-full"
            disabled={analyzing}
          />
        </div>
      </div>
      
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Paste the full email body here…"
        aria-label="Email body content"
        rows={8}
        className="input-field resize-none leading-relaxed w-full"
        disabled={analyzing}
      />
    </ScannerShell>
  );
}