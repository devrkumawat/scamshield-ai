import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Mail, 
  Link2, 
  Image as ImageIcon, 
  MessageCircle, 
  QrCode 
} from 'lucide-react';
import RiskBadge from './RiskBadge.jsx';
import { timeAgo } from '../lib/constants.js';

const iconMap = {
  text: MessageSquare,
  whatsapp: MessageCircle,
  email: Mail,
  url: Link2,
  screenshot: ImageIcon,
  qr: QrCode,
};

export default function RecentScanRow({ scan, delay = 0, onOpen }) {
  const Icon = iconMap[scan.type] || MessageSquare;
  // Safely fallback if time and createdAt are both missing
  const timeLabel = scan.time || (scan.createdAt ? timeAgo(scan.createdAt) : 'Unknown time');

  return (
    <motion.button
      onClick={() => onOpen?.(scan)}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/[0.03] transition-colors text-left group disabled:cursor-default"
      disabled={!onOpen}
      aria-label={`Open scan detail for ${scan.type} scan`}
    >
      <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.04] border border-line flex items-center justify-center group-hover:border-accent/30 transition-colors">
        <Icon 
          size={16} 
          className="text-muted group-hover:text-accent transition-colors" 
          aria-hidden="true"
        />
      </div>
      
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/90 truncate">
          {scan.preview || 'No preview available'}
        </p>
        <p className="text-xs text-muted font-mono mt-0.5 truncate">
          {scan.id?.toString().slice(-6).toUpperCase() || 'N/A'} · {timeLabel}
        </p>
      </div>
      
      <RiskBadge verdict={scan.verdict} size="sm" />
    </motion.button>
  );
}