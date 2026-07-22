import { motion } from 'framer-motion';

export default function Loader({ label = 'Analyzing…', size = 96 }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <span
          className="radar absolute inset-0"
          style={{ width: size, height: size }}
        />
        <span className="absolute inline-flex h-3 w-3 rounded-full bg-accent animate-pulseRing" />
      </div>
      <motion.p
        className="text-sm text-muted font-mono tracking-wide"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {label}
      </motion.p>
    </div>
  );
}
