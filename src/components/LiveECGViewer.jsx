import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Activity, RefreshCw, Info, ShieldAlert, Award } from './Icons';

export default function LiveECGViewer({ 
  currentPatient, 
  currentLead, 
  setCurrentLead, 
  pathology, 
  setPathology,
  rawSamples = [], 
  filteredSamples = [], 
  isFilterActive, 
  isAudioMuted,
  alarmActive,
  triggerAlarm,
  resetAlarm
}) {
  const canvasRef = useRef(null);
  const [gain, setGain] = useState(10); // mm/mV (5, 10, 20)
  const [speed, setSpeed] = useState(25); // mm/s (12.5, 25, 50)
  const [displayMode, setDisplayMode] = useState('sweep'); // sweep or scroll
  const [isFrozen, setIsFrozen] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [gridColorType, setGridColorType] = useState('clinical'); // clinical (pink) or neon (green/cyan)
  
  const frozenSamplesRef = useRef([]);
  const writePtrRef = useRef(0);
  const [activeTab, setActiveTab] = useState('controls');

  // Multi-lead options
  const leads = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

  // Handle freeze frame snapshot
  useEffect(() => {
    if (isFrozen) {
      frozenSamplesRef.current = [...(isFilterActive ? filteredSamples : rawSamples)];
    }
  }, [isFrozen]);

  // Determine signal quality index (SQI)
  // Low quality if raw vs filtered differ significantly (noise present)
  const calculateSQI = () => {
    if (rawSamples.length < 10) return 100;
    let diffSum = 0;
    const len = Math.min(50, rawSamples.length);
    for (let i = 0; i < len; i++) {
      diffSum += Math.abs(rawSamples[rawSamples.length - 1 - i].value - filteredSamples[filteredSamples.length - 1 - i].value);
    }
    const avgDiff = diffSum / len;
    return Math.max(10, Math.min(100, Math.round(100 - avgDiff * 120)));
  };

  const sqi = calculateSQI();

  // Canvas Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      if (isFrozen) {
        drawFrozen(ctx, canvas);
      } else {
        drawLive(ctx, canvas);
      }
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [rawSamples, filteredSamples, gain, speed, displayMode, isFrozen, gridColorType, isFilterActive]);

  // Helper: Draw standard calibration pulse (1mV high, 200ms wide)
  const drawCalibrationPulse = (ctx, startX, centerY, scaleY) => {
    ctx.strokeStyle = '#FF5252';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Draw 1mV pulse (10mm/mV, pulse is 1mV high)
    const pulseHeight = 1.0 * gain * 4.5; // pixel multiplier
    const pulseWidth = 50; // pixels wide
    
    ctx.moveTo(startX, centerY);
    ctx.lineTo(startX + 15, centerY);
    ctx.lineTo(startX + 15, centerY - pulseHeight);
    ctx.lineTo(startX + 15 + pulseWidth, centerY - pulseHeight);
    ctx.lineTo(startX + 15 + pulseWidth, centerY);
    ctx.lineTo(startX + 15 + pulseWidth + 15, centerY);
    ctx.stroke();

    ctx.fillStyle = '#FF5252';
    ctx.font = '9px monospace';
    ctx.fillText('1 mV', startX + 20, centerY - pulseHeight - 4);
    ctx.fillText('0.2s', startX + 25, centerY + 12);
  };

  // Helper: Draw Grid Paper
  const drawGrid = (ctx, width, height) => {
    // Determine grid line colors
    let majorColor = 'rgba(255, 110, 110, 0.4)';
    let minorColor = 'rgba(255, 110, 110, 0.15)';
    
    if (gridColorType === 'neon') {
      majorColor = 'rgba(0, 229, 255, 0.25)';
      minorColor = 'rgba(0, 229, 255, 0.08)';
    }

    ctx.clearRect(0, 0, width, height);

    // Minor grid (1mm lines)
    const minorStep = 7.5; // 7.5 pixels = 1mm
    ctx.strokeStyle = minorColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < width; x += minorStep) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += minorStep) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Major grid (5mm lines)
    const majorStep = minorStep * 5; // 37.5 pixels = 5mm
    ctx.strokeStyle = majorColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += majorStep) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += majorStep) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();
  };

  const drawLive = (ctx, canvas) => {
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    drawGrid(ctx, width, height);
    
    // Draw Calibration Pulse on left edge
    drawCalibrationPulse(ctx, 15, centerY, gain);

    const samples = isFilterActive ? filteredSamples : rawSamples;
    if (samples.length === 0) return;

    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Waveform line color
    ctx.strokeStyle = alarmActive ? '#FF1744' : '#00E676';

    const renderSamplesCount = Math.min(samples.length, width - 100);

    if (displayMode === 'sweep') {
      // SWEEP MODE (Philips/GE style sweeping line with blank erase gap)
      const maxPts = width - 120;
      writePtrRef.current = (writePtrRef.current + 1.2) % maxPts;
      const writePtr = Math.floor(writePtrRef.current);
      const eraseGap = 24;

      ctx.beginPath();
      let first = true;
      
      // We draw the circular buffer. The sweep line goes from x = 100 to x = width-20
      const startX = 100;
      
      for (let i = 0; i < maxPts; i++) {
        // Skip drawing inside the erase gap
        const dist = (i - writePtr + maxPts) % maxPts;
        if (dist < eraseGap) {
          continue; 
        }

        // Get index in samples array corresponding to location i
        // Since we are sweeping, we map spatial index i to actual sample index
        const sampleIdx = (samples.length - maxPts + i) % samples.length;
        const s = samples[sampleIdx];
        if (!s) continue;

        const x = startX + i;
        const y = centerY - s.value * gain * 38; // 38px/mV scaling factor

        if (first || dist === eraseGap) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw sweeping LED dot at the head of the sweep line
      const dotX = startX + writePtr;
      const dotIdx = (samples.length - maxPts + writePtr) % samples.length;
      const dotSample = samples[dotIdx];
      if (dotSample) {
        const dotY = centerY - dotSample.value * gain * 38;
        ctx.fillStyle = alarmActive ? '#FF1744' : '#FFF';
        ctx.shadowBlur = 12;
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

    } else {
      // SCROLL MODE (Traditional scrolling to the left)
      ctx.beginPath();
      const startX = 100;
      const step = 1; // 1 pixel per sample
      const displaySamples = samples.slice(- (width - 120));
      
      for (let i = 0; i < displaySamples.length; i++) {
        const s = displaySamples[i];
        const x = startX + i * step;
        const y = centerY - s.value * gain * 38;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw ECG stats overlays
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(startX, 10, 190, 26);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(startX, 10, 190, 26);
    
    ctx.fillStyle = alarmActive ? '#FF1744' : '#00E676';
    ctx.font = '10px monospace';
    ctx.fillText(`FILTER: ${isFilterActive ? 'ACTIVE (Notch+LP+HP)' : 'RAW (UNFILTERED)'}`, startX + 8, 26);

    // Draw calibration overlay in upper-right
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 160, 10, 150, 26);
    ctx.strokeRect(width - 160, 10, 150, 26);
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText(`${speed} mm/s | ${gain} mm/mV | Lead ${currentLead}`, width - 150, 26);
  };

  const drawFrozen = (ctx, canvas) => {
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    drawGrid(ctx, width, height);
    drawCalibrationPulse(ctx, 15, centerY, gain);

    const samples = frozenSamplesRef.current;
    if (samples.length === 0) return;

    ctx.strokeStyle = '#00E5FF'; // Cyan for freeze frame inspection
    ctx.lineWidth = 2.2;
    ctx.beginPath();

    const startX = 100;
    const maxPts = width - 120;
    const displaySamples = samples.slice(-maxPts);

    for (let i = 0; i < displaySamples.length; i++) {
      const s = displaySamples[i];
      const x = startX + i;
      const y = centerY - s.value * gain * 38;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw Freeze Indicator
    ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.fillRect(startX, 10, 220, 26);
    ctx.strokeStyle = '#00E5FF';
    ctx.strokeRect(startX, 10, 220, 26);
    ctx.fillStyle = '#00E5FF';
    ctx.font = '10px monospace';
    ctx.fillText('FREEZE-FRAME ACTIVE (SCROLL TO ZOOM)', startX + 8, 26);
  };

  const addMarker = (label) => {
    const timeSec = rawSamples.length > 0 ? rawSamples[rawSamples.length - 1].time : 0;
    setMarkers([...markers, { time: timeSec.toFixed(2), label }]);
  };

  return (
    <div className="medical-card card-ecg" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity className="text-ecg heart-icon-pulsing" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Lead Acquisition & Real-Time Wave Monitor</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Source: Hospital Telemetry System (Bedside 04)
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="status-glow" style={{ color: alarmActive ? 'var(--color-critical)' : 'var(--color-ecg)' }}></span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: alarmActive ? 'var(--color-critical)' : 'var(--color-ecg)' }}>
            {alarmActive ? 'CRITICAL ALARM: PATIENT EVENT' : 'TELEMETRY STATUS: NOMINAL'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        {/* Main Canvas View */}
        <div>
          <div className="ecg-canvas-wrapper">
            <canvas 
              ref={canvasRef} 
              width={820} 
              height={320} 
              className="ecg-grid-canvas"
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn-clinical ${displayMode === 'sweep' ? 'active' : ''}`}
                onClick={() => setDisplayMode('sweep')}
              >
                Sweep Mode
              </button>
              <button 
                className={`btn-clinical ${displayMode === 'scroll' ? 'active' : ''}`}
                onClick={() => setDisplayMode('scroll')}
              >
                Scroll Mode
              </button>
              <button 
                className={`btn-clinical ${isFrozen ? 'active' : ''}`}
                onClick={() => setIsFrozen(!isFrozen)}
                style={{ borderColor: isFrozen ? '#00E5FF' : '', color: isFrozen ? '#00E5FF' : '' }}
              >
                {isFrozen ? 'Unfreeze Signal' : 'Freeze Waveform'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Signal Quality (SQI):
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '80px', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${sqi}%`, 
                    height: '100%', 
                    background: sqi > 80 ? 'var(--color-ecg)' : sqi > 50 ? 'var(--color-warning)' : 'var(--color-critical)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  color: sqi > 80 ? 'var(--color-ecg)' : sqi > 50 ? 'var(--color-warning)' : 'var(--color-critical)'
                }}>{sqi}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="medical-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', height: '320px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', marginBottom: '12px', gap: '12px' }}>
            <button 
              onClick={() => setActiveTab('controls')}
              style={{ background: 'none', border: 'none', color: activeTab === 'controls' ? 'var(--color-ecg)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              System Controls
            </button>
            <button 
              onClick={() => setActiveTab('annotations')}
              style={{ background: 'none', border: 'none', color: activeTab === 'annotations' ? 'var(--color-ecg)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Annotations ({markers.length})
            </button>
          </div>

          {activeTab === 'controls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Select Lead Vector
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {leads.map(lead => (
                    <button 
                      key={lead}
                      onClick={() => setCurrentLead(lead)}
                      style={{
                        padding: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '1px solid var(--card-border)',
                        background: currentLead === lead ? 'var(--color-ecg)' : 'var(--bg-tertiary)',
                        color: currentLead === lead ? '#000' : 'var(--text-primary)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {lead}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Gain Sensitivity
                  </label>
                  <select 
                    value={gain} 
                    onChange={(e) => setGain(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '0.8rem' }}
                  >
                    <option value={5}>5 mm/mV</option>
                    <option value={10}>10 mm/mV</option>
                    <option value={20}>20 mm/mV</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Sweep Speed
                  </label>
                  <select 
                    value={speed} 
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '0.8rem' }}
                  >
                    <option value={12.5}>12.5 mm/s</option>
                    <option value={25}>25 mm/s</option>
                    <option value={50}>50 mm/s</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  ECG Paper Grid Style
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setGridColorType('clinical')} 
                    className="btn-clinical"
                    style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem', display: 'flex', justifyContent: 'center', background: gridColorType === 'clinical' ? 'rgba(255, 110, 110, 0.15)' : '', borderColor: gridColorType === 'clinical' ? 'rgba(255, 110, 110, 0.5)' : '' }}
                  >
                    Pink Paper Grid
                  </button>
                  <button 
                    onClick={() => setGridColorType('neon')} 
                    className="btn-clinical"
                    style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem', display: 'flex', justifyContent: 'center', background: gridColorType === 'neon' ? 'rgba(0, 229, 255, 0.15)' : '', borderColor: gridColorType === 'neon' ? '#00E5FF' : '' }}
                  >
                    Neon Scope Grid
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                <button 
                  onClick={() => triggerAlarm()}
                  className="btn-clinical btn-clinical-danger"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '6px' }}
                >
                  Test Audio Alarm
                </button>
                <button 
                  onClick={() => resetAlarm()}
                  className="btn-clinical"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '6px' }}
                >
                  Silence Alarm
                </button>
              </div>
            </div>
          )}

          {activeTab === 'annotations' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px' }}>
                {markers.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                    No markers tagged for this session.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {markers.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', borderLeft: '3px solid var(--color-ecg)' }}>
                        <span style={{ fontWeight: 'bold' }}>{m.label}</span>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>t={m.time}s</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <button onClick={() => addMarker('PVC Episode')} className="btn-clinical" style={{ fontSize: '0.7rem', padding: '4px' }}>+ Tag PVC</button>
                <button onClick={() => addMarker('Noise Spike')} className="btn-clinical" style={{ fontSize: '0.7rem', padding: '4px' }}>+ Noise</button>
                <button onClick={() => addMarker('Lead Off')} className="btn-clinical" style={{ fontSize: '0.7rem', padding: '4px' }}>+ Lead Off</button>
                <button onClick={() => setMarkers([])} className="btn-clinical" style={{ fontSize: '0.7rem', padding: '4px', color: 'var(--color-critical)' }}>Clear All</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
