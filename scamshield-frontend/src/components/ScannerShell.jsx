import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar.jsx';
import Loader from './Loader.jsx';
import { ScanSearch } from 'lucide-react';

export default function ScannerShell({
  icon: Icon = ScanSearch,
  title,
  subtitle,
  children,
  onAnalyze,
  analyzing,
  progress,
  canAnalyze = true,
  analyzeLabel = 'Analyze',
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start gap-4 mb-6"
      >
        <div className="h-12 w-12 rounded-2xl bg-accent-soft border border-accent/20 flex items-center justify-center shrink-0">
          <Icon size={22} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted mt-1 max-w-xl leading-relaxed">{subtitle}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card p-5 sm:p-6"
      >
        {children}

        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-5 border-t border-line"
            >
              <Loader label="Scanning for scam patterns…" />
              <ProgressBar progress={progress} label="Model inference" />
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 pt-5 border-t border-line flex items-center justify-between gap-4 flex-wrap"
            >
              <p className="text-xs text-muted">Powered by the ScamShield AI engine — rule-based heuristics + Gemini.</p>
              <button onClick={onAnalyze} disabled={!canAnalyze} className="btn-primary">
                <Icon size={16} />
                {analyzeLabel}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
