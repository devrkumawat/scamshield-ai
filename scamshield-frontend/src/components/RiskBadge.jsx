import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { verdictMeta } from '../lib/constants.js';

const iconMap = {
  safe: ShieldCheck,
  suspicious: ShieldAlert,
  high_risk: ShieldX,
};

const classMap = {
  safe: 'text-safe border-safe/30 bg-safe-soft',
  suspicious: 'text-warning border-warning/30 bg-warning-soft',
  high_risk: 'text-danger border-danger/30 bg-danger-soft',
};

export default function RiskBadge({ verdict, size = 'md' }) {
  const meta = verdictMeta[verdict] || verdictMeta.safe;
  const Icon = iconMap[verdict] || ShieldCheck;
  
  // Safe fallback just in case an unexpected verdict string is passed
  const colorClasses = classMap[verdict] || classMap.safe;
  
  // Adjust padding and text size based on the requested size prop
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';
  
  return (
    <span 
      className={`chip flex items-center gap-1.5 w-max border rounded-full font-medium ${colorClasses} ${pad}`}
    >
      <Icon size={size === 'sm' ? 11 : 13} aria-hidden="true" />
      {meta.label}
    </span>
  );
}