import React from 'react';
import { Activity, ShieldAlert, Info, Award } from './Icons';

export default function ECGAnalysisCenter({ 
  pathology, 
  currentLead,
  rawSamples = [], 
  filteredSamples = [] 
}) {
  
  // Calculate clinical intervals based on pathology
  const getIntervals = () => {
    switch (pathology) {
      case 'AFib':
        return {
          pr: 'N/A (Absent P-Wave)',
          qrs: '94 ms',
          qt: '360 ms',
          qtc: '464 ms',
          st: '0.0 mm (Normal)',
          rhythm: 'Atrial Fibrillation (AFib)',
          rhythmStatus: 'critical',
          qrsStatus: 'normal',
          prStatus: 'critical',
          stStatus: 'normal',
          qtcStatus: 'warning'
        };
      case 'VTach':
        return {
          pr: 'N/A (V-dissociation)',
          qrs: '168 ms',
          qt: 'N/A',
          qtc: 'N/A',
          st: '+2.4 mm (ST Elevation)',
          rhythm: 'Ventricular Tachycardia (VTach)',
          rhythmStatus: 'critical',
          qrsStatus: 'critical',
          prStatus: 'critical',
          stStatus: 'critical',
          qtcStatus: 'critical'
        };
      case 'Bradycardia':
        return {
          pr: '185 ms',
          qrs: '96 ms',
          qt: '460 ms',
          qtc: '398 ms',
          st: '0.1 mm (Normal)',
          rhythm: 'Sinus Bradycardia',
          rhythmStatus: 'warning',
          qrsStatus: 'normal',
          prStatus: 'normal',
          stStatus: 'normal',
          qtcStatus: 'normal'
        };
      case 'Tachycardia':
        return {
          pr: '135 ms',
          qrs: '88 ms',
          qt: '310 ms',
          qtc: '448 ms',
          st: '-0.8 mm (ST Depression)',
          rhythm: 'Sinus Tachycardia',
          rhythmStatus: 'warning',
          qrsStatus: 'normal',
          prStatus: 'normal',
          stStatus: 'warning',
          qtcStatus: 'warning'
        };
      case 'PVC':
        return {
          pr: '155 ms',
          qrs: '142 ms (on PVC beat)',
          qt: '410 ms',
          qtc: '458 ms',
          st: '-1.2 mm (Post-PVC)',
          rhythm: 'Normal Sinus with PVCs',
          rhythmStatus: 'critical',
          qrsStatus: 'warning',
          prStatus: 'normal',
          stStatus: 'warning',
          qtcStatus: 'normal'
        };
      case 'NSR':
      default:
        return {
          pr: '162 ms',
          qrs: '92 ms',
          qt: '390 ms',
          qtc: '412 ms',
          st: '0.0 mm (Normal)',
          rhythm: 'Normal Sinus Rhythm (NSR)',
          rhythmStatus: 'stable',
          qrsStatus: 'normal',
          prStatus: 'normal',
          stStatus: 'normal',
          qtcStatus: 'normal'
        };
    }
  };

  const metrics = getIntervals();

  // Explainable AI text generator based on criteria
  const getAIExplanation = () => {
    switch (pathology) {
      case 'AFib':
        return {
          summary: 'Atrial Fibrillation Detected with Rapid Ventricular Response.',
          details: 'The diagnostic model identified: 1) Absence of organized P-waves, replaced by low-amplitude f-waves in Lead II. 2) Irregularly irregular R-R interval distribution (SDNN > 80ms). 3) Ventricular rate exceeding 100 bpm. High probability of AFib (>98% model confidence).',
          recommendation: 'Recommend clinical review of rate control medication. Order 12-lead standard ECG confirmation.'
        };
      case 'VTach':
        return {
          summary: 'Ventricular Tachycardia (Monomorphic) Emergency Warning.',
          details: 'The system detected a sequence of wide, bizarre QRS complexes (>120ms) at a rate of 160 bpm originating from a ventricular pacemaker. P-waves are lost in the ventricular rhythm, indicating AV dissociation. Critical emergency risk.',
          recommendation: 'IMMEDIATE patient assessment required. Prepare defibrillator and check hemodynamics.'
        };
      case 'Bradycardia':
        return {
          summary: 'Sinus Bradycardia Detected.',
          details: 'Normal sinus complexes (P wave present, PR interval normal at 185ms) with a heart rate below 50 bpm. Rhythm remains regular and stable. No acute morphology changes.',
          recommendation: 'Review patient drug profile (e.g. beta-blockers). Check for symptoms of lightheadedness or fatigue.'
        };
      case 'Tachycardia':
        return {
          summary: 'Sinus Tachycardia with ST Segment Depression.',
          details: 'Accelerated sinus rhythm (>120 bpm) with normal wave sequencing. Minimal ST segment depression observed in Lead II (-0.8 mm), which may indicate tachycardia-induced mild subendocardial ischemia.',
          recommendation: 'Monitor patient at rest. Check blood pressure, body temperature, and hydration. Correlate with oxygen saturation.'
        };
      case 'PVC':
        return {
          summary: 'Premature Ventricular Contractions (PVC) Identified.',
          details: 'Ectopic ventricular beats occur early, presenting with wide, notched QRS configurations (>120ms) and inverted T-waves. A compensatory pause is observed immediately following the PVC beat.',
          recommendation: 'Assess PVC burden (beats/minute). Check electrolytes (K+, Mg2+) and thyroid panel. Note if PVCs are unifocal or multifocal.'
        };
      case 'NSR':
      default:
        return {
          summary: 'Normal Sinus Rhythm (NSR) Confirmed.',
          details: 'The P-QRS-T complexes are within physiological norms. The heart rate is stable (~75 bpm), R-R intervals are regular, and the ST segment is completely baseline (0.0 mm).',
          recommendation: 'Continue routine monitoring. Vitals are completely stable.'
        };
    }
  };

  const aiExplanation = getAIExplanation();

  // Helper: return status badges styling
  const getBadgeStyle = (status) => {
    if (status === 'critical') return { background: 'rgba(255,23,68,0.15)', color: '#FF1744', border: '1px solid rgba(255,23,68,0.3)' };
    if (status === 'warning') return { background: 'rgba(255,171,0,0.15)', color: '#FFAB00', border: '1px solid rgba(255,171,0,0.3)' };
    return { background: 'rgba(0,230,118,0.15)', color: '#00E676', border: '1px solid rgba(0,230,118,0.3)' };
  };

  return (
    <div className="medical-card card-ai" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity className="text-ai" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Electrocardiographic Segment & Morphology Analysis</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time measurement of cardiac intervals, ST-segment deviations, and morphologic beat templates
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* Left Side: Table & Beat Overlays */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Table */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Measurement Table (Lead {currentLead})
            </h4>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '6px 4px' }}>Parameter</th>
                  <th>Clinical Definition</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>PR Interval</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Atrial conduction delay (120-200ms)</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{metrics.pr}</td>
                  <td>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', ...getBadgeStyle(metrics.prStatus) }}>
                      {metrics.prStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>QRS Duration</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Ventricular depolarization time (80-120ms)</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{metrics.qrs}</td>
                  <td>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', ...getBadgeStyle(metrics.qrsStatus) }}>
                      {metrics.qrsStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>QTc Interval</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Heart-rate corrected QT time (&lt;450ms)</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{metrics.qtc}</td>
                  <td>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', ...getBadgeStyle(metrics.qtcStatus) }}>
                      {metrics.qtcStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>ST Segment</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Deviation from isoelectric line (-0.5 to +1.0mm)</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{metrics.st}</td>
                  <td>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', ...getBadgeStyle(metrics.stStatus) }}>
                      {metrics.stStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>Rhythm Index</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Overall diagnostic classification</td>
                  <td style={{ fontWeight: 'bold' }}>{metrics.rhythm}</td>
                  <td>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', ...getBadgeStyle(metrics.rhythmStatus) }}>
                      {metrics.rhythmStatus === 'stable' ? 'STABLE' : metrics.rhythmStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Morphology Overlays (Render dynamic beat template inside an SVG) */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Beat-to-Beat Template Overlay (QRS-T Cycle Alignment)
              </h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aligned at R-Peak</span>
            </div>
            
            {/* SVG showing 3 aligned beats representing current pathology morphology */}
            <div style={{ display: 'flex', justifyContent: 'center', background: '#02050a', borderRadius: '6px', padding: '10px' }}>
              <svg width="450" height="120" viewBox="0 0 450 120" style={{ display: 'block' }}>
                {/* Horizontal line for baseline */}
                <line x1="0" y1="70" x2="450" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="225" y1="0" x2="225" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                
                {/* Beat 1: Normal Reference (Dim gray) */}
                <path 
                  d="M0,70 L150,70 Q170,60 180,70 L210,70 L218,80 L225,10 L232,85 L238,70 L270,70 Q290,55 310,70 L450,70" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.15)" 
                  strokeWidth="1.5" 
                />
                
                {/* Beat 2: Prior Beat (Semi-transparent accent) */}
                {pathology === 'VTach' ? (
                  <path 
                    d="M0,70 Q45,20 90,70 Q135,120 180,70 Q225,20 270,70 Q315,120 360,70 Q405,20 450,70" 
                    fill="none" 
                    stroke="rgba(213, 0, 249, 0.4)" 
                    strokeWidth="2" 
                  />
                ) : pathology === 'PVC' ? (
                  // Bizarre PVC beat overlay
                  <path 
                    d="M0,70 L150,70 L180,105 Q210,120 225,120 Q240,120 255,20 Q275,0 290,70 L450,70" 
                    fill="none" 
                    stroke="rgba(213, 0, 249, 0.4)" 
                    strokeWidth="2" 
                  />
                ) : (
                  <path 
                    d="M5,70 L155,70 Q175,59 185,70 L215,70 L223,79 L230,8 L237,83 L243,70 L275,70 Q295,54 315,70 L450,70" 
                    fill="none" 
                    stroke="rgba(0, 230, 118, 0.4)" 
                    strokeWidth="2" 
                  />
                )}

                {/* Beat 3: Current Beat (Highlighted solid color) */}
                {pathology === 'VTach' ? (
                  <path 
                    d="M0,70 Q45,15 90,70 Q135,125 180,70 Q225,15 270,70 Q315,125 360,70 Q405,15 450,70" 
                    fill="none" 
                    stroke="var(--color-critical)" 
                    strokeWidth="2.5" 
                  />
                ) : pathology === 'PVC' ? (
                  // Current is normal complex, with PVC background
                  <path 
                    d="M0,70 L150,70 Q170,61 180,70 L210,70 L218,80 L225,10 L232,85 L238,70 L270,70 Q290,56 310,70 L450,70" 
                    fill="none" 
                    stroke="var(--color-ecg)" 
                    strokeWidth="2.5" 
                  />
                ) : pathology === 'AFib' ? (
                  // Fibrillating baseline
                  <path 
                    d="M0,70 Q15,72 30,68 T60,71 T90,69 T120,72 T150,68 L210,70 L218,80 L225,10 L232,85 L238,70 L270,70 Q285,73 300,68 T330,71 T360,69 T390,72 T420,68 L450,70" 
                    fill="none" 
                    stroke="var(--color-critical)" 
                    strokeWidth="2.5" 
                  />
                ) : (
                  <path 
                    d="M0,70 L150,70 Q170,60 180,70 L210,70 L218,80 L225,10 L232,85 L238,70 L270,70 Q290,55 310,70 L450,70" 
                    fill="none" 
                    stroke="var(--color-ecg)" 
                    strokeWidth="2.5" 
                  />
                )}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '4px', background: 'rgba(255,255,255,0.2)' }} /> Normal Ref
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '4px', background: 'var(--color-ecg)' }} /> Current Cycle
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '4px', background: 'var(--color-ai)' }} /> Ectopic/Prior Cycle
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Explainable AI Diagnosis Panel */}
        <div className="medical-card" style={{ padding: '16px', background: 'rgba(213,0,249,0.04)', borderColor: 'rgba(213, 0, 249, 0.2)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert className="text-ai" size={20} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ai)', textTransform: 'uppercase' }}>
              Explainable AI (XAI) Reasoner
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Classification Conclusion</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '2px', color: pathology === 'NSR' ? 'var(--color-ecg)' : 'var(--color-critical)' }}>
                {aiExplanation.summary}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Neural Anomaly Rationale</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.45' }}>
                {aiExplanation.details}
              </p>
            </div>

            <div style={{ marginTop: 'auto', background: 'rgba(213, 0, 249, 0.08)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--color-ai)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ai)' }}>Clinical Recommendation Engine:</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '4px', fontStyle: 'italic' }}>
                "{aiExplanation.recommendation}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
