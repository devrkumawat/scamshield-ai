import { useState } from 'react';
import { Link2, Globe } from 'lucide-react';
import ScannerShell from '../components/ScannerShell.jsx';
import { useAnalyze } from '../hooks/useAnalyze.js';
import api from '../lib/api.js';

const examples = [
  'secure-hdfcbank-verify.com/login',
  'github.com/anthropics',
  'prize-claim.win/redeem',
];

export default function URLScanner() {
  const [url, setUrl] = useState('');
  
  const { analyzing, progress, run } = useAnalyze({
    type: 'url',
    inputPreview: url || 'Untitled URL scan',
    analyze: () => api.analyzeUrl(url),
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && url.trim().length > 0 && !analyzing) {
      run();
    }
  };

  return (
    <ScannerShell
      icon={Link2}
      title="URL Scanner"
      subtitle="Paste any link before you open it. We check the domain, redirects and page patterns against known scam signatures."
      onAnalyze={run}
      analyzing={analyzing}
      progress={progress}
      canAnalyze={url.trim().length > 0}
    >
      <div className="relative">
        <Globe 
          size={16} 
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" 
          aria-hidden="true"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com/path"
          aria-label="URL to scan"
          className="input-field pl-10 font-mono text-sm w-full"
          disabled={analyzing}
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs text-muted">Try an example:</span>
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setUrl(ex)}
            disabled={analyzing}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-line text-muted hover:text-white hover:border-accent/30 transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ex}
          </button>
        ))}
      </div>
    </ScannerShell>
  );
}