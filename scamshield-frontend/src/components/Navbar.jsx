import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShieldCheck, LayoutDashboard, MessageSquare, MessageCircle, Mail,
  Link2, Image as ImageIcon, Info, Menu, X,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/scan/text', label: 'Text / SMS', icon: MessageSquare },
  { to: '/scan/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { to: '/scan/email', label: 'Email', icon: Mail },
  { to: '/scan/url', label: 'URL Scanner', icon: Link2 },
  { to: '/scan/screenshot', label: 'Screenshot', icon: ImageIcon },
  { to: '/about', label: 'About', icon: Info },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="relative h-9 w-9 rounded-xl bg-accent-soft border border-accent/20 flex items-center justify-center shrink-0">
        <ShieldCheck size={18} className="text-accent" />
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent animate-blip" />
      </div>
      <div className="leading-tight">
        <p className="font-display font-semibold text-white/95 tracking-tight">ScamShield</p>
        <p className="text-[10px] text-accent font-mono tracking-widest -mt-0.5">AI DETECTION</p>
      </div>
    </div>
  );
}

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={onNavigate}
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
        >
          <l.icon size={17} />
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-line px-4 py-6 gap-6">
        <Logo />
        <NavItems />
        <div className="mt-auto glass-card p-4">
          <p className="text-xs text-muted leading-relaxed">
            <span className="text-accent font-medium">Tip:</span> when in doubt, verify through an official channel before clicking anything.
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-line bg-bg/80 backdrop-blur-xl">
        <Logo />
        <button
          onClick={() => setOpen(true)}
          className="h-9 w-9 rounded-lg border border-line flex items-center justify-center text-white/80"
        >
          <Menu size={18} />
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-72 bg-card z-50 border-l border-line px-4 py-6 flex flex-col gap-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button onClick={() => setOpen(false)} className="h-9 w-9 rounded-lg border border-line flex items-center justify-center text-white/80">
                  <X size={16} />
                </button>
              </div>
              <NavItems onNavigate={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
