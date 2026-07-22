import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const styles = {
  success: { icon: CheckCircle2, color: 'text-safe', border: 'border-safe/30', bg: 'bg-safe/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', border: 'border-warning/30', bg: 'bg-warning/10' },
  danger: { icon: XCircle, color: 'text-danger', border: 'border-danger/30', bg: 'bg-danger/10' },
  info: { icon: Info, color: 'text-accent', border: 'border-accent/30', bg: 'bg-accent/10' },
};

export default function Toast({ message, type = 'info', onClose }) {
  const s = styles[type] || styles.info;
  const Icon = s.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border ${s.border} ${s.bg} backdrop-blur-xl px-4 py-3 shadow-card max-w-sm`}
    >
      <Icon size={18} className={`${s.color} shrink-0`} />
      <p className="text-sm text-white/90 leading-snug">{message}</p>
      <button onClick={onClose} className="ml-2 text-muted hover:text-white transition-colors shrink-0">
        <X size={14} />
      </button>
    </motion.div>
  );
}
