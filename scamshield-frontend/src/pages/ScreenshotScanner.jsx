import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, ScanLine } from 'lucide-react';
import ScannerShell from '../components/ScannerShell.jsx';
import UploadBox from '../components/UploadBox.jsx';
import { useAnalyze } from '../hooks/useAnalyze.js';
import api from '../lib/api.js';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ScreenshotScanner() {
  const [file, setFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);

  const { analyzing, progress, run } = useAnalyze({
    type: 'screenshot',
    inputPreview: file?.name || 'Untitled screenshot',
    analyze: () => api.analyzeScreenshot(rawFile),
  });

  // Cleanup object URLs to prevent memory leaks when component unmounts
  useEffect(() => {
    return () => {
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  const handleFile = (f) => {
    // Clean up previous preview if the user uploads a new file without clearing
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    
    const preview = URL.createObjectURL(f);
    setFile({ name: f.name, size: formatSize(f.size), preview });
    setRawFile(f);
  };

  const clear = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    
    setFile(null);
    setRawFile(null);
  };

  return (
    <ScannerShell
      icon={ImageIcon}
      title="Screenshot Scanner"
      subtitle="Upload a screenshot of a chat, email or webpage. We'll extract the text with OCR, then scan it for scam patterns."
      onAnalyze={run}
      analyzing={analyzing}
      progress={progress}
      canAnalyze={!!rawFile}
      analyzeLabel="Run OCR & analyze"
    >
      <UploadBox 
        file={file} 
        onFileSelect={handleFile} 
        onClear={clear} 
      />

      {file && !analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-line bg-bg/40 p-4"
        >
          <div className="flex items-center gap-2">
            <ScanLine size={14} className="text-accent" />
            <span className="text-xs font-mono text-muted tracking-wide">
              READY — OCR RUNS ON THE SERVER WHEN YOU CLICK ANALYZE
            </span>
          </div>
        </motion.div>
      )}
    </ScannerShell>
  );
}