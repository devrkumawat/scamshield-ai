import { motion } from 'framer-motion';

export default function ProgressBar({ progress = 0, label, tone = 'accent' }) {
  const toneMap = {
    accent: 'bg-accent',
    safe: 'bg-safe',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };
  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted font-mono">{label}</span>
          <span className="text-xs text-white/70 font-mono">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-line">
        <motion.div
          className={`h-full rounded-full ${toneMap[tone]}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
