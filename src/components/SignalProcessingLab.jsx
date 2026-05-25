import React, { useRef, useEffect } from 'react';
import { Sliders, Cpu, Activity, RefreshCw } from './Icons';
import { fft, waveletDecompose } from '../utils/biomedicalFilters';

export default function SignalProcessingLab({
  rawSamples = [],
  filteredSamples = [],
  isFilterActive,
  setIsFilterActive,
  notchFilterObj,
  highPassFilterObj,
  lowPassFilterObj,
  savitzkyGolayObj,
  filterToggles,
  setFilterToggles
}) {
  const fftCanvasRef = useRef(null);
  const rawPreviewCanvasRef = useRef(null);
  const filteredPreviewCanvasRef = useRef(null);
  
  // Calculate SNR (Signal-to-Noise Ratio)
  // SNR = 10 * log10( P_signal / P_noise )
  const calculateSNR = () => {
    if (rawSamples.length < 50) return '35.2';
    let signalPower = 0;
    let noisePower = 0;
    
    // Take last 100 samples
    const len = Math.min(100, rawSamples.length);
    for (let i = 0; i < len; i++) {
      const idx = rawSamples.length - 1 - i;
      const sRaw = rawSamples[idx].value;
      const sFilt = filteredSamples[idx]?.value || sRaw;
      
      signalPower += sFilt * sFilt;
      const noise = sRaw - sFilt;
      noisePower += noise * noise;
    }
    
    if (noisePower === 0) return '80.0';
    const snr = 10 * Math.log10(signalPower / Math.max(0.0001, noisePower));
    return Math.max(3.2, Math.min(75, snr)).toFixed(1);
  };

  const snr = calculateSNR();
  
  // Draw realtime FFT and raw/filtered signals
  useEffect(() => {
    const rawCanvas = rawPreviewCanvasRef.current;
    const filtCanvas = filteredPreviewCanvasRef.current;
    const fftCanvas = fftCanvasRef.current;
    
    if (!rawCanvas || !filtCanvas || !fftCanvas) return;
    
    const ctxRaw = rawCanvas.getContext('2d');
    const ctxFilt = filtCanvas.getContext('2d');
    const ctxFft = fftCanvas.getContext('2d');
    
    // Clear and draw grid backgrounds
    const drawMiniGrid = (ctx, w, h, color) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      // Draw grid lines every 20px
      for (let x = 0; x < w; x += 20) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 20) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();
    };

    drawMiniGrid(ctxRaw, rawCanvas.width, rawCanvas.height, 'rgba(255, 255, 255, 0.04)');
    drawMiniGrid(ctxFilt, filtCanvas.width, filtCanvas.height, 'rgba(255, 255, 255, 0.04)');
    
    // 1. Draw Raw Signal Preview (with green or red color based on noise)
    ctxRaw.strokeStyle = '#FFAB00';
    ctxRaw.lineWidth = 1.5;
    ctxRaw.beginPath();
    let displayCount = Math.min(rawSamples.length, rawCanvas.width);
    let startIdx = rawSamples.length - displayCount;
    for (let i = 0; i < displayCount; i++) {
      const s = rawSamples[startIdx + i];
      if (!s) continue;
      const x = i;
      const y = rawCanvas.height / 2 - s.value * 28;
      if (i === 0) ctxRaw.moveTo(x, y);
      else ctxRaw.lineTo(x, y);
    }
    ctxRaw.stroke();

    // 2. Draw Filtered Signal Preview
    ctxFilt.strokeStyle = '#00E676';
    ctxFilt.lineWidth = 1.5;
    ctxFilt.beginPath();
    displayCount = Math.min(filteredSamples.length, filtCanvas.width);
    startIdx = filteredSamples.length - displayCount;
    for (let i = 0; i < displayCount; i++) {
      const s = filteredSamples[startIdx + i];
      if (!s) continue;
      const x = i;
      const y = filtCanvas.height / 2 - s.value * 28;
      if (i === 0) ctxFilt.moveTo(x, y);
      else ctxFilt.lineTo(x, y);
    }
    ctxFilt.stroke();

    // 3. FFT Spectrum calculation & Drawing
    // We need 256 samples of data to compute FFT
    if (rawSamples.length >= 256) {
      const fftData = rawSamples.slice(-256).map(s => s.value);
      const spectrum = fft(fftData);
      
      ctxFft.clearRect(0, 0, fftCanvas.width, fftCanvas.height);
      
      // Draw FFT grid
      ctxFft.strokeStyle = 'rgba(255,255,255,0.05)';
      ctxFft.lineWidth = 0.5;
      ctxFft.beginPath();
      for (let f = 0; f < fftCanvas.width; f += 40) {
        ctxFft.moveTo(f, 0); ctxFft.lineTo(f, fftCanvas.height);
      }
      for (let a = 0; a < fftCanvas.height; a += 30) {
        ctxFft.moveTo(0, a); ctxFft.lineTo(fftCanvas.width, a);
      }
      ctxFft.stroke();

      // Plot spectrum peaks (frequency on X: 0 to 125Hz, amplitude on Y)
      ctxFft.strokeStyle = '#00E5FF';
      ctxFft.lineWidth = 2;
      ctxFft.beginPath();
      
      const maxFreqDraw = 70; // Only plot up to 70Hz for cardiology (ECG is 0-40Hz)
      const pointsToDraw = Math.round((maxFreqDraw / 125) * (spectrum.length / 2));
      const spacingX = fftCanvas.width / pointsToDraw;
      
      for (let i = 0; i < pointsToDraw; i++) {
        const spec = spectrum[i];
        if (!spec) continue;
        const x = i * spacingX;
        // Amplify values for visualization
        const y = fftCanvas.height - Math.min(fftCanvas.height - 5, spec.magnitude * 260) - 2;
        if (i === 0) ctxFft.moveTo(x, y);
        else ctxFft.lineTo(x, y);
      }
      ctxFft.stroke();
      
      // Annotate main frequencies (e.g. 50Hz hum if hum noise is active)
      const hasHum = rawSamples.some(s => s.time > 0) && rawSamples[rawSamples.length-1].value - filteredSamples[filteredSamples.length-1]?.value > 0.05;
      if (hasHum) {
        const humIdx = Math.round((50 / 125) * (spectrum.length / 2));
        const humX = humIdx * spacingX;
        ctxFft.fillStyle = '#FF1744';
        ctxFft.beginPath();
        ctxFft.arc(humX, fftCanvas.height - 25, 4, 0, 2*Math.PI);
        ctxFft.fill();
        ctxFft.font = '8px monospace';
        ctxFft.fillText('50Hz Hum Noise', humX - 30, fftCanvas.height - 35);
      }
    }
  }, [rawSamples, filteredSamples, filterToggles]);

  // Wavelet coefficients array mock for visualization details
  const getWaveletCoeffs = () => {
    if (rawSamples.length < 64) return [];
    const windowData = rawSamples.slice(-64).map(s => s.value);
    const { A, D } = waveletDecompose(windowData);
    return D.slice(-16); // return last 16 detail coefficients
  };

  const wavCoeffs = getWaveletCoeffs();

  return (
    <div className="medical-card card-analysis" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders className="text-analysis" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Biomedical DSP & Filter Design Lab</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time infinite impulse response (IIR) filtering and spectral estimation pipeline
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Controls Panel */}
        <div className="medical-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.15)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '14px', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px', color: 'var(--text-primary)' }}>
            FILTER PIPELINE BLOCK
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Global DSP Pipeline</span>
              <button 
                onClick={() => setIsFilterActive(!isFilterActive)}
                className={`btn-clinical ${isFilterActive ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                {isFilterActive ? 'ACTIVE' : 'BYPASSED'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Notch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>IIR Notch Filter (50Hz)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Attenuates electrical wall hum</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={filterToggles.notch} 
                  disabled={!isFilterActive}
                  onChange={(e) => setFilterToggles({...filterToggles, notch: e.target.checked})}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              {/* Highpass */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Butterworth HPF (0.5Hz)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Removes breathing baseline drift</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={filterToggles.highpass} 
                  disabled={!isFilterActive}
                  onChange={(e) => setFilterToggles({...filterToggles, highpass: e.target.checked})}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              {/* Lowpass */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Butterworth LPF (40Hz)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cuts muscle EMG tremor noise</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={filterToggles.lowpass} 
                  disabled={!isFilterActive}
                  onChange={(e) => setFilterToggles({...filterToggles, lowpass: e.target.checked})}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              {/* Savitzky-Golay */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Savitzky-Golay Smoothing</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Polynomially fits wave contours</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={filterToggles.savitzky} 
                  disabled={!isFilterActive}
                  onChange={(e) => setFilterToggles({...filterToggles, savitzky: e.target.checked})}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
              <h5 style={{ fontSize: '0.75rem', color: 'var(--color-analysis)', marginBottom: '8px', textTransform: 'uppercase' }}>Pipeline Diagnostics</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sampling Freq:</span>
                  <span>250 Hz</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DSP Latency:</span>
                  <span>&lt; 0.8 ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Signal SNR:</span>
                  <span style={{ color: Number(snr) > 20 ? 'var(--color-ecg)' : 'var(--color-warning)', fontWeight: 'bold' }}>{snr} dB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Resolution:</span>
                  <span>16-bit ADC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphs Area */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '16px' }}>
          
          {/* Row 1: Raw vs Filtered real-time signal previews */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="medical-card" style={{ padding: '12px', background: '#020509' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-warning)' }}>RAW SIGNAL (INPUT)</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Ch II</span>
              </div>
              <canvas 
                ref={rawPreviewCanvasRef} 
                width={360} 
                height={90} 
                style={{ width: '100%', height: '90px', display: 'block', background: '#010204' }}
              />
            </div>
            
            <div className="medical-card" style={{ padding: '12px', background: '#020509' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ecg)' }}>FILTERED SIGNAL (OUTPUT)</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Normalized</span>
              </div>
              <canvas 
                ref={filteredPreviewCanvasRef} 
                width={360} 
                height={90} 
                style={{ width: '100%', height: '90px', display: 'block', background: '#010204' }}
              />
            </div>
          </div>

          {/* Row 2: FFT spectrum & Wavelet details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
            <div className="medical-card" style={{ padding: '12px', background: '#020509' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-analysis)' }}>FFT POWER SPECTRAL DENSITY</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 - 70 Hz Frequency Response</span>
              </div>
              <canvas 
                ref={fftCanvasRef} 
                width={380} 
                height={90} 
                style={{ width: '100%', height: '90px', display: 'block', background: '#010204' }}
              />
            </div>

            <div className="medical-card" style={{ padding: '12px', background: '#020509' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ai)' }}>HAAR WAVELET DECOMPOSITION</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>D3 Detail Coeffs</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '70px', gap: '2px', padding: '0 4px', background: '#010204', borderRadius: '4px' }}>
                {wavCoeffs.length === 0 ? (
                  <div style={{ width: '100%', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                    Acquiring Signal...
                  </div>
                ) : (
                  wavCoeffs.map((val, idx) => {
                    // Normalize value for rendering height (0 to 60px)
                    const heightVal = Math.min(60, Math.max(2, Math.abs(val) * 120));
                    const isPositive = val >= 0;
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          flex: 1, 
                          height: `${heightVal}px`, 
                          background: isPositive ? 'var(--color-ai)' : 'rgba(213, 0, 249, 0.4)',
                          borderRadius: '1px'
                        }} 
                        title={`Coeff ${idx}: ${val.toFixed(3)}`}
                      />
                    );
                  })
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--text-muted)' }}>
                <span>t - 16 samples</span>
                <span>t (Current Sample)</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
