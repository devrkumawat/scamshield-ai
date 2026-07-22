import { motion } from 'framer-motion';

const toneMap = {
  accent: { text: 'text-accent', bg: 'bg-accent-soft', ring: 'group-hover:shadow-glow' },
  safe: { text: 'text-safe', bg: 'bg-safe-soft', ring: 'group-hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2),0_8px_30px_-8px_rgba(34,197,94,0.3)]' },
  warning: { text: 'text-warning', bg: 'bg-warning-soft', ring: 'group-hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_30px_-8px_rgba(245,158,11,0.3)]' },
  danger: { text: 'text-danger', bg: 'bg-danger-soft', ring: 'group-hover:shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_8px_30px_-8px_rgba(239,68,68,0.3)]' },
};

export default function StatCard({ icon: Icon, label, value, tone = 'accent', delay = 0, trend }) {
  const t = toneMap[tone] || toneMap.accent;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card group p-5 transition-shadow duration-300 ${t.ring}`}
    >
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-xl ${t.bg} flex items-center justify-center`}>
          <Icon size={20} className={t.text} />
        </div>
        {trend && (
          <span className={`text-xs font-mono ${t.text}`}>{trend}</span>
        )}
      </div>
      <p className="mt-4 text-3xl font-display font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
    </motion.div>
  );
}
