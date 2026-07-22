import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-line px-4 sm:px-6 py-6 mt-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-accent" />
          <span>ScamShield AI — Think before you click.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Scam Detection</span>
          <span className="font-mono">v3.0.0</span>
        </div>
      </div>
    </footer>
  );
}
