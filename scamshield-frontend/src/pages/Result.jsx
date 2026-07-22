import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  CheckCircle2,
  Flag,
  Lightbulb,
  RotateCcw,
  FileSearch,
  Info,
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useScan } from '../context/ScanContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { verdictMeta, riskColors } from '../lib/constants.js';

function ScoreGauge({ score, verdict }) {
  const color = riskColors[verdict] || '#9ca3af'; // Fallback color just in case
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-48 w-48 mx-auto">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-display font-semibold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted mt-0.5">risk score / 100</span>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted">{label}</span>
        <span className="text-white/80 font-mono">{v}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full bg-accent"
        />
      </div>
    </div>
  );
}

export default function Result() {
  const { lastResult } = useScan();
  const { push } = useToast();

  if (!lastResult) {
    return (
      <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6">
        <EmptyState
          icon={FileSearch}
          title="No result to show"
          description="Run a scan from the dashboard or any scanner page to see a detailed breakdown here."
          action={
            <Link to="/" className="btn-secondary text-sm">
              Back to dashboard
            </Link>
          }
        />
      </div>
    );
  }

  const {
    verdict,
    score,
    title,
    category,
    redFlags = [],
    recommendations = [],
    id,
    type,
    inputPreview,
    time,
    summary,
    breakdown,
    confidence,
    extractedText,
  } = lastResult;
  
  const meta = verdictMeta[verdict] || verdictMeta.safe;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 mb-6"
      >
        <div>
          <p className="text-xs text-muted font-mono truncate max-w-full">
            {id?.toString().slice(-8).toUpperCase()} · {type?.toUpperCase()}
            {time ? ` · ${time}` : ''}
          </p>
          <h1 className="text-2xl font-display font-semibold tracking-tight mt-1">
            Scan result
          </h1>
        </div>
        <RiskBadge verdict={verdict} />
      </motion.div>

      <div className="grid md:grid-cols-[220px_1fr] gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center rounded-2xl"
        >
          <ScoreGauge score={score} verdict={verdict} />
          <p
            className="text-sm font-medium mt-4"
            style={{ color: riskColors[verdict] || riskColors.safe }}
          >
            {meta.label}
          </p>
          <p className="text-xs text-muted mt-1">{category}</p>
          {confidence !== null && confidence !== undefined && (
            <p className="text-[11px] text-muted mt-1 font-mono">
              Model confidence: {confidence}%
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 rounded-2xl"
        >
          <h2 className="font-display font-semibold text-lg mb-1">{title}</h2>
          <p className="text-sm text-muted leading-relaxed mb-4">
            {summary || meta.summary}
          </p>
          
          <div className="rounded-xl bg-bg/40 border border-line p-4">
            <p className="text-xs text-muted font-mono mb-1.5">SCANNED INPUT</p>
            <p className="text-sm text-white/80 leading-relaxed line-clamp-3 break-words">
              {inputPreview}
            </p>
          </div>
          
          {extractedText && (
            <div className="rounded-xl bg-bg/40 border border-line p-4 mt-3">
              <p className="text-xs text-muted font-mono mb-1.5">OCR EXTRACTED TEXT</p>
              <pre className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed font-body">
                {extractedText}
              </pre>
            </div>
          )}
        </motion.div>
      </div>

      {breakdown && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-card p-6 mb-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-accent" aria-hidden="true" />
            <h3 className="font-display font-semibold">Analysis breakdown</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            <BreakdownRow label="Keyword rules" value={breakdown.keywordRules} />
            <BreakdownRow label="AI classification" value={breakdown.aiClassification} />
            <BreakdownRow label="Semantic analysis" value={breakdown.semanticAnalysis} />
            <BreakdownRow label="Contextual reasoning" value={breakdown.contextualReasoning} />
            <BreakdownRow label="URL reputation" value={breakdown.urlReputation} />
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertOctagon size={17} className="text-danger" aria-hidden="true" />
            <h3 className="font-display font-semibold">Red flags detected</h3>
          </div>
          {redFlags.length ? (
            <ul className="space-y-3">
              {redFlags.map((flag, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-white/80 leading-relaxed">
                  <Flag size={14} className="text-danger mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="break-words">{flag}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No red flags found.</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={17} className="text-accent" aria-hidden="true" />
            <h3 className="font-display font-semibold">What to do next</h3>
          </div>
          {recommendations.length ? (
            <ul className="space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-white/80 leading-relaxed">
                  <CheckCircle2 size={14} className="text-accent mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="break-words">{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No specific recommendations at this time.</p>
          )}
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <Link to="/" className="btn-secondary">
          <RotateCcw size={15} aria-hidden="true" /> Back to dashboard
        </Link>
        <a href="https://cybercrime.gov.in/" target="_blank">
        <button className="btn-primary">
          <Flag size={15} aria-hidden="true" />
            Report this scan
        </button>
        </a>
      </div>
    </div>
  );
}