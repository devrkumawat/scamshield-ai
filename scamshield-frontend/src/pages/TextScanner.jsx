import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ScannerShell from '../components/ScannerShell.jsx';
import { useAnalyze } from '../hooks/useAnalyze.js';
import api from '../lib/api.js';

const examples = [
  'Your parcel is on hold. Pay ₹49 customs fee to release: bit.ly/parcel-fee',
  'Congratulations! You have won a Samsung S24. Claim now at prize-claim.win',
];

export default function TextScanner() {
  const [text, setText] = useState('');
  
  const { analyzing, progress, run } = useAnalyze({
    type: 'text',
    inputPreview: text.slice(0, 80) || 'Untitled text scan',
    analyze: () => api.analyzeText(text),
  });

  return (
    <ScannerShell
      icon={MessageSquare}
      title="Text / SMS Scanner"
      subtitle="Paste the full message exactly as you received it — including any links — for the most accurate read."
      onAnalyze={run}
      analyzing={analyzing}
      progress={progress}
      canAnalyze={text.trim().length > 0}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the SMS or text message here…"
        aria-label="SMS or text message content"
        rows={8}
        className="input-field resize-none font-body leading-relaxed w-full"
        disabled={analyzing}
      />
      
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs text-muted">Try an example:</span>
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setText(ex)}
            disabled={analyzing}
            title={ex} // Shows the full text on hover
            className="text-xs px-2.5 py-1.5 rounded-lg border border-line text-muted hover:text-white hover:border-accent/30 transition-colors max-w-xs truncate disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ex}
          </button>
        ))}
      </div>
    </ScannerShell>
  );
}