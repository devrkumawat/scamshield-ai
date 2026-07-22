import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function ScannerCard({ icon: Icon, title, description, to, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={to}
        className="group relative flex flex-col justify-between h-full glass-card p-5 overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-glow"
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/5 blur-2xl group-hover:bg-accent/10 transition-colors" />
        <div className="relative z-10">
          <div className="h-11 w-11 rounded-xl bg-accent-soft flex items-center justify-center mb-4">
            <Icon size={22} className="text-accent" />
          </div>
          <h3 className="font-display font-semibold text-white/95">{title}</h3>
          <p className="text-sm text-muted mt-1.5 leading-relaxed">{description}</p>
        </div>
        <div className="relative z-10 flex items-center gap-1.5 text-accent text-sm font-medium mt-5 opacity-80 group-hover:opacity-100 group-hover:gap-2.5 transition-all">
          Scan now <ArrowUpRight size={15} />
        </div>
      </Link>
    </motion.div>
  );
}
