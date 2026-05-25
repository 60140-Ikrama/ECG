import React, { useRef, useEffect } from 'react';
import { Activity, Brain, Sliders, TrendingUp } from './Icons';

export default function HRVAnalysisCenter({ 
  hrvMetrics, 
  pathology 
}) {
  const poincareCanvasRef = useRef(null);

  const { timeDomain, frequencyDomain, nonlinear, clinical } = hrvMetrics;

  // Draw Poincaré Plot
  useEffect(() => {
    const canvas = poincareCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < width; x += 30) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 30) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Draw Identity Line (y = x)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, height - 30);
    ctx.lineTo(width - 30, 30);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Plot RR interval pairs
    const points = nonlinear.poincarePoints || [];
    if (points.length === 0) {
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '12px sans-serif';
      ctx.fillText('Acquiring HRV intervals...', width / 2 - 80, height / 2);
      return;
    }

    // Scaling helper mapping R-R range (400ms to 1400ms) to canvas (30 to width-30)
    const minVal = 400;
    const maxVal = 1400;
    const scaleX = (val) => 30 + ((val - minVal) / (maxVal - minVal)) * (width - 60);
    const scaleY = (val) => height - 30 - ((val - minVal) / (maxVal - minVal)) * (height - 60);

    // Draw scatter points
    ctx.fillStyle = 'var(--color-analysis)';
    ctx.shadowBlur = 3;
    ctx.shadowColor = 'var(--color-analysis)';
    
    points.forEach(pt => {
      const cx = scaleX(pt.x);
      const cy = scaleY(pt.y);
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    ctx.shadowBlur = 0; // reset

    // Draw SD1 & SD2 fitting ellipse
    if (points.length > 5 && nonlinear.sd1 > 0 && nonlinear.sd2 > 0) {
      // Find average RR for ellipse center
      const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      
      const centerX = scaleX(meanX);
      const centerY = scaleY(meanY);
      
      // Ellipse radii scaled to pixels
      const radX = (nonlinear.sd2 / (maxVal - minVal)) * (width - 60) * 1.5; // SD2 (longitudinal axis)
      const radY = (nonlinear.sd1 / (maxVal - minVal)) * (height - 60) * 1.5; // SD1 (transverse axis)
      
      ctx.strokeStyle = 'var(--color-ai)';
      ctx.lineWidth = 1.8;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-Math.PI / 4); // Rotate by 45 degrees along identity line
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(10, radX), Math.max(10, radY), 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // Label SD1/SD2 indicators
      ctx.fillStyle = 'var(--color-ai)';
      ctx.font = '9px monospace';
      ctx.fillText(`SD1 (Short-term): ${nonlinear.sd1} ms`, 10, height - 12);
      ctx.fillText(`SD2 (Long-term): ${nonlinear.sd2} ms`, width - 150, height - 12);
    }

    // Axises indicators
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '8px monospace';
    ctx.fillText('RR[n] (ms)', width - 50, height - 8);
    ctx.fillText('RR[n+1] (ms)', 8, 20);
  }, [nonlinear.poincarePoints, nonlinear.sd1, nonlinear.sd2]);

  // Autonomic nervous system balance determination
  const getANSBalance = () => {
    const ratio = frequencyDomain.ratio;
    if (ratio < 0.5) return { sympathetic: 20, parasympathetic: 80, text: 'Vagal (Parasympathetic) Dominance - Deep Rest / Recovery' };
    if (ratio > 2.0) return { sympathetic: 75, parasympathetic: 25, text: 'Sympathetic Hyper-activation - High Stress / Alert state' };
    return { sympathetic: 52, parasympathetic: 48, text: 'Balanced Autonomic Homeostasis' };
  };

  const ans = getANSBalance();

  return (
    <div className="medical-card card-analysis" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Brain className="text-analysis" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Research-Grade Heart Rate Variability (HRV) Analysis</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Nonlinear dynamics, time-domain statistical profiles, and power spectral density estimation
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Metrics Tables & Autonomic Balance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Vitals Summary Rows */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div className="medical-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.12)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SDNN (Total Var)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>{timeDomain.sdnn} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>ms</span></div>
              <div style={{ fontSize: '0.65rem', color: timeDomain.sdnn < 30 ? 'var(--color-critical)' : 'var(--color-ecg)' }}>
                {timeDomain.sdnn < 30 ? 'DEPRESSED HRV' : 'PHYSIOLOGICAL NORMAL'}
              </div>
            </div>
            
            <div className="medical-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.12)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>RMSSD (Vagal)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>{timeDomain.rmssd} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>ms</span></div>
              <div style={{ fontSize: '0.65rem', color: timeDomain.rmssd < 20 ? 'var(--color-critical)' : 'var(--color-ecg)' }}>
                {timeDomain.rmssd < 20 ? 'LOW VAGAL ACTIVATION' : 'OPTIMAL PARASYMPATHETIC'}
              </div>
            </div>

            <div className="medical-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.12)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Baevsky Stress</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '4px 0', fontFamily: 'var(--font-mono)', color: clinical.stressIndex > 150 ? 'var(--color-critical)' : 'var(--color-ecg)' }}>{clinical.stressIndex}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {clinical.stressIndex > 150 ? 'ALERT: SYMPATHICUS' : 'NOMINAL RANGE'}
              </div>
            </div>
          </div>

          {/* Time & Frequency Domain metrics Table */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
              HRV Quantitative Biomarkers
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.8rem' }}>
              {/* Time Domain */}
              <div>
                <h5 style={{ fontSize: '0.75rem', color: 'var(--color-ecg)', marginBottom: '6px' }}>Time-Domain Statistics</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mean RR:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{timeDomain.meanRR} ms</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mean HR:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{timeDomain.meanHR} bpm</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>NN50 count:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{timeDomain.nn50} beats</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>pNN50:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{timeDomain.pnn50}%</span>
                  </div>
                </div>
              </div>

              {/* Frequency Domain */}
              <div>
                <h5 style={{ fontSize: '0.75rem', color: 'var(--color-analysis)', marginBottom: '6px' }}>Spectral Power Densities</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>VLF Power (0.003-0.04Hz):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{frequencyDomain.vlf} ms²</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>LF Power (0.04-0.15Hz):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{frequencyDomain.lf} ms²</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>HF Power (0.15-0.40Hz):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{frequencyDomain.hf} ms²</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>LF/HF Balance Ratio:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-analysis)' }}>{frequencyDomain.ratio}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Autonomic Balance Balance Bar */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Autonomic Nervous System Balance (Sympathovagal Split)
            </h4>
            
            <div style={{ height: '16px', borderRadius: '8px', display: 'flex', overflow: 'hidden', margin: '10px 0' }}>
              <div style={{ width: `${ans.sympathetic}%`, background: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '9px', fontWeight: 'bold' }}>
                Sympathetic ({ans.sympathetic}%)
              </div>
              <div style={{ width: `${ans.parasympathetic}%`, background: 'var(--color-ecg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '9px', fontWeight: 'bold' }}>
                Parasympathetic ({ans.parasympathetic}%)
              </div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontStyle: 'italic', textAlign: 'center' }}>
              "{ans.text}"
            </p>
          </div>
        </div>

        {/* Right Column: Poincaré canvas & Clinical Stress dials */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '16px' }}>
          {/* Poincaré Plot */}
          <div className="medical-card" style={{ padding: '12px', background: '#020509', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ai)' }}>POINCARÉ PLOT (NONLINEAR)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ellipse Fit</span>
            </div>
            
            <div style={{ flex: 1, position: 'relative', background: '#010204', borderRadius: '6px', overflow: 'hidden' }}>
              <canvas 
                ref={poincareCanvasRef} 
                width={220} 
                height={220} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          </div>

          {/* Dials & Recovery meters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="medical-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.12)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cardioregulatory Score</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '4px 0', color: 'var(--color-ecg)', fontFamily: 'var(--font-mono)' }}>
                {clinical.recoveryScore}%
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{ width: `${clinical.recoveryScore}%`, height: '100%', background: 'var(--color-ecg)' }} />
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Reflects myocardial recovery rate</span>
            </div>

            <div className="medical-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.12)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Central Fatigue Index</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '4px 0', color: clinical.fatigueIndex > 60 ? 'var(--color-critical)' : 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>
                {clinical.fatigueIndex}%
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{ width: `${clinical.fatigueIndex}%`, height: '100%', background: clinical.fatigueIndex > 60 ? 'var(--color-critical)' : 'var(--color-warning)' }} />
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Neuro-muscular fatigue indicator</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
