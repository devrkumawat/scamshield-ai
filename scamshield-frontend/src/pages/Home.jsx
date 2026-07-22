import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Layers,
  MessageSquare,
  MessageCircle,
  Mail,
  Link2,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import ScannerCard from '../components/ScannerCard.jsx';
import RecentScanRow from '../components/RecentScanRow.jsx';
import { RiskDistributionChart, ScamCategoryChart } from '../components/Charts.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loader from '../components/Loader.jsx';
import { useScan } from '../context/ScanContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../lib/api.js';
import { toScanRow } from '../lib/adapters.js';
import { mapRiskLevel } from '../lib/constants.js';

const scanners = [
  { 
    icon: MessageSquare, 
    title: 'Text / SMS', 
    description: 'Paste a suspicious text message for instant analysis.', 
    to: '/scan/text' 
  },
  { 
    icon: MessageCircle, 
    title: 'WhatsApp', 
    description: 'Check forwarded messages, job offers and links.', 
    to: '/scan/whatsapp' 
  },
  { 
    icon: Mail, 
    title: 'Email', 
    description: 'Scan email content and headers for phishing signs.', 
    to: '/scan/email' 
  },
  { 
    icon: Link2, 
    title: 'URL Scanner', 
    description: 'Verify a link before you tap it.', 
    to: '/scan/url' 
  },
  { 
    icon: ImageIcon, 
    title: 'Screenshot', 
    description: "Upload a screenshot — we'll OCR and analyze the text.", 
    to: '/scan/screenshot' 
  },
];

const emptyStats = { total: 0, safe: 0, suspicious: 0, highRisk: 0 };

export default function Home() {
  const navigate = useNavigate();
  const { scans, setScansFromServer, setLastResult } = useScan();
  const { push } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(emptyStats);
  const [riskChart, setRiskChart] = useState([]);
  const [categoryChart, setCategoryChart] = useState([]);

  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        const data = await api.getDashboard();
        if (cancelled) return;

        setStats({
          total: data?.totals?.totalScans || 0,
          safe: data?.totals?.safeScans || 0,
          suspicious: data?.totals?.suspiciousScans || 0,
          highRisk: data?.totals?.highRiskScans || 0,
        });

        const rd = data?.riskDistribution || {};
        setRiskChart([
          { name: 'Safe', value: (rd.safe || 0) + (rd.low || 0), color: '#22C55E' },
          { name: 'Suspicious', value: rd.suspicious || 0, color: '#F59E0B' },
          { name: 'High Risk', value: (rd.high || 0) + (rd.critical || 0), color: '#EF4444' },
        ]);

        const cats = Array.isArray(data?.scamCategoryDistribution)
          ? data.scamCategoryDistribution.slice(0, 7)
          : [];
          
        setCategoryChart(
          cats.map((c) => ({ name: c.scamType || 'Unknown', count: c.count }))
        );

        const rows = Array.isArray(data?.recentAnalyses)
          ? data.recentAnalyses.map(toScanRow)
          : [];
          
        setScansFromServer(rows);
      } catch (err) {
        if (!cancelled) {
          push(err.message || 'Failed to load dashboard.', 'danger');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openScan = (scan) => {
    // Recreate a minimal result from the row so /result renders something
    // useful even without re-hitting the API. Live scans populate the
    // richer view via useAnalyze.
    setLastResult({
      id: scan.id,
      type: scan.type,
      verdict: scan.verdict || mapRiskLevel(scan.riskLevel),
      score: scan.score,
      title: scan.scamType || 'Scan detail',
      category: scan.scamType || 'General',
      summary: scan.summary || '',
      redFlags: scan.summary ? [scan.summary] : ['Detailed indicators unavailable for older scans.'],
      recommendations: ['Open a new scan to see full analysis details.'],
      inputPreview: scan.preview,
      time: undefined,
      confidence: scan.confidence ?? null,
    });
    navigate('/result');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative glass-card p-6 sm:p-10 mb-8 overflow-hidden rounded-2xl"
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-floatSlow" />
        <div className="absolute right-10 bottom-0 hidden md:block opacity-90">
          <div className="radar h-28 w-28" />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="chip flex items-center gap-1.5 w-max border-accent/30 bg-accent-soft text-accent mb-4 px-3 py-1 rounded-full text-sm">
            <ShieldCheck size={12} aria-hidden="true" /> AI scam detection, live
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight leading-tight">
            Think before <span className="text-accent">you click.</span>
          </h1>
          <p className="text-muted mt-3 leading-relaxed max-w-md">
            Drop in a message, link, email or screenshot. ScamShield AI flags phishing, fake delivery fees, job scams and more — before they cost you anything.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/scan/url" className="btn-primary">
              <Link2 size={16} aria-hidden="true" /> Scan a URL
            </Link>
            <Link to="/scan/screenshot" className="btn-secondary">
              <ImageIcon size={16} aria-hidden="true" /> Upload a screenshot
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Layers} label="Total scans" value={stats.total} tone="accent" delay={0} />
        <StatCard icon={ShieldCheck} label="Safe" value={stats.safe} tone="safe" delay={0.05} />
        <StatCard icon={ShieldAlert} label="Suspicious" value={stats.suspicious} tone="warning" delay={0.1} />
        <StatCard icon={ShieldX} label="High risk" value={stats.highRisk} tone="danger" delay={0.15} />
      </div>

      {/* Quick scan cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Quick scan</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {scanners.map((s, i) => (
            <ScannerCard key={s.to} {...s} delay={i * 0.05} />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent scans */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold">Recent scans</h2>
            <span className="text-xs text-muted font-mono">{scans.length} total</span>
          </div>
          {loading ? (
            <div className="py-6">
              <Loader label="Loading recent scans…" />
            </div>
          ) : scans.length ? (
            <div className="divide-y divide-line">
              {scans.slice(0, 7).map((scan, i) => (
                <RecentScanRow 
                  key={scan.id} 
                  scan={scan} 
                  delay={i * 0.04} 
                  onOpen={openScan} 
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No scans yet"
              description="Your recent scan history will show up here once you run a check."
              action={
                <Link to="/scan/url" className="btn-secondary text-sm">
                  Run your first scan <ArrowRight size={14} aria-hidden="true" />
                </Link>
              }
            />
          )}
        </div>

        {/* Charts */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-5 rounded-2xl">
            <h2 className="font-display font-semibold mb-2">Risk distribution</h2>
            <RiskDistributionChart data={riskChart} />
            <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
              <LegendDot color="#22C55E" label="Safe" />
              <LegendDot color="#F59E0B" label="Suspicious" />
              <LegendDot color="#EF4444" label="High risk" />
            </div>
          </div>
          
          <div className="glass-card p-5 rounded-2xl">
            <h2 className="font-display font-semibold mb-2">Scam categories</h2>
            {categoryChart.length ? (
              <ScamCategoryChart data={categoryChart} />
            ) : (
              <p className="text-sm text-muted py-8 text-center">No category data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden="true" />
      {label}
    </div>
  );
}