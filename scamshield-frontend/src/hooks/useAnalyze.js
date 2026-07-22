import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScan } from '../context/ScanContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { scanTypeLabels } from '../lib/constants.js';
import { toResult } from '../lib/adapters.js';

/**
 * Drives every scanner page:
 *   - Simulates smooth progress while the request is in-flight
 *   - Calls the real backend via the provided `analyze` async function
 *   - Stores the result in ScanContext and navigates to /result
 *
 * Usage:
 *   const { analyzing, progress, run } = useAnalyze({
 *     type: 'text',
 *     inputPreview: '…first 80 chars…',
 *     analyze: () => api.analyzeText(text),
 *   });
 */
export function useAnalyze({ type, inputPreview, analyze }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const navigate = useNavigate();
  const { setLastResult, addScan } = useScan();
  const { push } = useToast();
  
  const progressTimer = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, []);

  const startProgress = () => {
    // Clear any existing timer to prevent overlapping intervals
    if (progressTimer.current) clearInterval(progressTimer.current);
    
    setProgress(0);
    let p = 0;
    
    progressTimer.current = setInterval(() => {
      // Ease toward 90% while waiting for the network — final 10% fills
      // in when the response resolves.
      p = Math.min(90, p + Math.random() * 9 + 3);
      if (mounted.current) setProgress(p);
    }, 240);
  };

  const stopProgress = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    if (mounted.current) setProgress(100);
  };

  const run = async () => {
    if (analyzing || typeof analyze !== 'function') return;
    
    setAnalyzing(true);
    startProgress();

    try {
      const data = await analyze();
      const result = toResult(data, { type, inputPreview });

      const scanRecord = {
        id: result.id,
        type,
        label: scanTypeLabels[type] || 'Scan',
        preview: inputPreview || 'Untitled scan',
        verdict: result.verdict,
        score: result.score,
        createdAt: new Date().toISOString(),
        scamType: result.category,
        summary: result.summary,
        confidence: result.confidence,
      };
      
      addScan(scanRecord);
      setLastResult(result);
      
      stopProgress();
      
      // Trigger the appropriate toast notification based on the verdict
      if (result.verdict === 'high_risk') {
        push('High risk scam pattern detected.', 'danger');
      } else if (result.verdict === 'suspicious') {
        push('Some suspicious signals found.', 'warning');
      } else {
        push('No scam indicators detected.', 'success');
      }

      // Small delay so the progress bar animation can finish visibly
      setTimeout(() => {
        if (!mounted.current) return;
        setAnalyzing(false);
        navigate('/result');
      }, 350);
      
    } catch (err) {
      stopProgress();
      if (mounted.current) setAnalyzing(false);
      push(err.message || 'Analysis failed. Please try again.', 'danger');
    }
  };

  return { analyzing, progress, run };
}