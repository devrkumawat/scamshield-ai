import { motion } from 'framer-motion';
import { ShieldQuestion } from 'lucide-react';

export default function EmptyState({
  icon: Icon = ShieldQuestion,
  title = 'Nothing here yet',
  description = 'Run a scan to see results appear in this space.',
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center text-center py-14 px-6"
    >
      <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-line flex items-center justify-center mb-4">
        <Icon size={24} className="text-muted" />
      </div>
      <h3 className="font-display font-semibold text-white/90">{title}</h3>
      <p className="text-sm text-muted mt-1.5 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
