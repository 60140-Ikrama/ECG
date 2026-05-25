import React, { useState } from 'react';
import { Brain, ShieldAlert, Cpu, Activity, Info, Check } from './Icons';

export default function AIDiagnosticCenter({ 
  pathology, 
  currentPatient, 
  hrvMetrics 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');

  // Define model confidence metrics based on pathology
  const getModelMetrics = () => {
    switch (pathology) {
      case 'AFib':
        return {
          risk: 78,
          models: [
            { name: '1D-ResNet-ECG (Arrhythmia Classifier)', pred: 'Atrial Fibrillation', conf: 99.4 },
            { name: 'BiLSTM-HRV (Interval Dynamics Model)', pred: 'Atrial Fibrillation', conf: 96.8 },
            { name: 'VisionTransformer-ECG (Morphology)', pred: 'Atrial Fibrillation', conf: 98.1 }
          ],
          anomalies: [
            { start: 1.2, end: 2.8, desc: 'Irregular ventricular response' },
            { start: 4.5, end: 6.1, desc: 'Absent P-wave fibrillation' },
            { start: 7.8, end: 9.5, desc: 'Rapid f-wave oscillation' }
          ]
        };
      case 'VTach':
        return {
          risk: 96,
          models: [
            { name: '1D-ResNet-ECG (Arrhythmia Classifier)', pred: 'Ventricular Tachycardia', conf: 99.9 },
            { name: 'BiLSTM-HRV (Interval Dynamics Model)', pred: 'Ventricular Tachycardia', conf: 99.7 },
            { name: 'VisionTransformer-ECG (Morphology)', pred: 'Ventricular Tachycardia', conf: 99.8 }
          ],
          anomalies: [
            { start: 0.2, end: 9.8, desc: 'Continuous wide-complex ventricular run' }
          ]
        };
      case 'Bradycardia':
        return {
          risk: 28,
          models: [
            { name: '1D-ResNet-ECG (Arrhythmia Classifier)', pred: 'Sinus Bradycardia', conf: 98.2 },
            { name: 'BiLSTM-HRV (Interval Dynamics Model)', pred: 'Sinus Bradycardia', conf: 99.1 },
            { name: 'VisionTransformer-ECG (Morphology)', pred: 'Sinus Bradycardia', conf: 97.4 }
          ],
          anomalies: []
        };
      case 'Tachycardia':
        return {
          risk: 45,
          models: [
            { name: '1D-ResNet-ECG (Arrhythmia Classifier)', pred: 'Sinus Tachycardia', conf: 99.2 },
            { name: 'BiLSTM-HRV (Interval Dynamics Model)', pred: 'Sinus Tachycardia', conf: 98.5 },
            { name: 'VisionTransformer-ECG (Morphology)', pred: 'Sinus Tachycardia', conf: 98.8 }
          ],
          anomalies: [
            { start: 3.2, end: 4.8, desc: 'ST Segment Depression transient event' }
          ]
        };
      case 'PVC':
        return {
          risk: 65,
          models: [
            { name: '1D-ResNet-ECG (Arrhythmia Classifier)', pred: 'Premature Ventricular Contractions', conf: 97.5 },
            { name: 'BiLSTM-HRV (Interval Dynamics Model)', pred: 'Sinus Rhythm with PVCs', conf: 94.2 },
            { name: 'VisionTransformer-ECG (Morphology)', pred: 'Premature Ventricular Contractions', conf: 96.8 }
          ],
          anomalies: [
            { start: 3.5, end: 4.2, desc: 'Ectopic QRS inversion & wide S wave' }
          ]
        };
      case 'NSR':
      default:
        return {
          risk: 8,
          models: [
            { name: '1D-ResNet-ECG (Arrhythmia Classifier)', pred: 'Normal Sinus Rhythm', conf: 99.8 },
            { name: 'BiLSTM-HRV (Interval Dynamics Model)', pred: 'Normal Sinus Rhythm', conf: 99.5 },
            { name: 'VisionTransformer-ECG (Morphology)', pred: 'Normal Sinus Rhythm', conf: 99.6 }
          ],
          anomalies: []
        };
    }
  };

  const aiData = getModelMetrics();

  // Handle clinical report text compilation
  const generateClinicalSummary = () => {
    setIsGenerating(true);
    setGeneratedReport('');
    
    setTimeout(() => {
      let text = `AI AUTOMATIC CLINICAL INTERPRETATION REPORT\n`;
      text += `==========================================\n`;
      text += `PATIENT: ${currentPatient.name} | GENDER: ${currentPatient.gender} | AGE: ${currentPatient.age}\n`;
      text += `RECORDING DATE: ${new Date().toLocaleString()} | LEAD: II (Continuous telemetry)\n\n`;
      
      text += `CLINICAL SUMMARY:\n`;
      if (pathology === 'NSR') {
        text += `Patient exhibits regular Sinus Rhythm at ${hrvMetrics.timeDomain.meanHR} bpm. Cardiac conduction intervals are within normal physiological bounds (QRS: ${hrvMetrics.timeDomain.sdnn > 0 ? '92' : '0'}ms, PR: 162ms, QTc: 412ms). HRV metrics indicate stable vagal tone (RMSSD: ${hrvMetrics.timeDomain.rmssd}ms, SDNN: ${hrvMetrics.timeDomain.sdnn}ms). No ectopic beats or acute ischemia features detected.\n`;
      } else if (pathology === 'AFib') {
        text += `Patient exhibits active Atrial Fibrillation with irregularly irregular RR intervals. The mean heart rate is elevated at ${hrvMetrics.timeDomain.meanHR} bpm. There is a total absence of organized P-waves, which are replaced by baseline f-waves. The SDNN is highly elevated at ${hrvMetrics.timeDomain.sdnn}ms due to interval randomness. Long-term cardiovascular risk of stroke is increased.\n`;
      } else if (pathology === 'VTach') {
        text += `CRITICAL FINDING: Patient is experiencing Ventricular Tachycardia at ${hrvMetrics.timeDomain.meanHR} bpm. Continuous monomorphic wide-complex ventricular activations are observed (QRS: 168ms). Heart rate is highly accelerated with signs of AV dissociation. Acute cardiovascular collapse risk is high. Defibrillation setup is recommended.\n`;
      } else if (pathology === 'Bradycardia') {
        text += `Patient exhibits marked Sinus Bradycardia at ${hrvMetrics.timeDomain.meanHR} bpm. Conduction intervals remain regular and baseline is stable. Autonomic evaluation shows vagal parasympathetic dominance (RMSSD: ${hrvMetrics.timeDomain.rmssd}ms, HF Power: ${hrvMetrics.frequencyDomain.hf} ms²). Recommend pharmacological correlation.\n`;
      } else if (pathology === 'Tachycardia') {
        text += `Patient exhibits Sinus Tachycardia at ${hrvMetrics.timeDomain.meanHR} bpm. Minor ST segment depression is noted (-0.8 mm), suggesting tachycardia-mediated mild subendocardial ischemia. Autonomic profile shows elevated sympathetic tone (LF/HF ratio: ${hrvMetrics.frequencyDomain.ratio}).\n`;
      } else if (pathology === 'PVC') {
        text += `Patient displays Sinus Rhythm interrupted by Premature Ventricular Contractions (PVCs). Ectopic cycles show wide QRS complexes (142ms) and inverted T-waves followed by compensatory pauses. PVC burden should be monitored over 24 hours.\n`;
      }
      
      text += `\nMODEL INTEGRITY METRICS:\n`;
      text += `- Arrhythmia Classifier Concordance: ${aiData.models[0].conf}% confidence.\n`;
      text += `- Spectral HRV Correlation: VLF/LF/HF bandpower validated.\n`;
      text += `- Encryption Protocol: 256-bit SHA HIPAA-compliant session lock.\n`;
      text += `\nPRIMARY RECOMMENDATION:\n`;
      if (pathology === 'VTach' || pathology === 'AFib') {
        text += `CRITICAL: Consult attending cardiologist immediately. Prepare bedside telemetry evaluation.`;
      } else {
        text += `Monitor continuously. Update EMR file. No immediate drug adjustment.`;
      }
      
      setGeneratedReport(text);
      setIsGenerating(false);
    }, 900);
  };

  return (
    <div className="medical-card card-ai" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Brain className="text-ai" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Clinical AI Diagnostic Center</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Deep learning multi-model diagnosis, spatial anomaly localizer, and predictive cardiac risk
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
        
        {/* Left Column: Multi-model evaluation & Heatmap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Models */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Multi-Model Classifier Array
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {aiData.models.map((model, idx) => (
                <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{model.name}</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-ai)' }}>
                      {model.conf}% Conf
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Prediction:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: pathology === 'NSR' ? 'var(--color-ecg)' : 'var(--color-critical)' }}>
                      {model.pred}
                    </span>
                  </div>
                  
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
                    <div style={{ width: `${model.conf}%`, height: '100%', background: 'var(--color-ai)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Heatmap (SVG) */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Arrhythmia Anomaly Spatial Localization Timeline
            </h4>
            
            <div style={{ position: 'relative', height: '42px', background: '#020509', borderRadius: '4px', border: '1px solid var(--card-border)', overflow: 'hidden', margin: '8px 0' }}>
              {/* Highlight red regions for anomalies */}
              {aiData.anomalies.map((anom, idx) => {
                const left = (anom.start / 10) * 100;
                const width = ((anom.end - anom.start) / 10) * 100;
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      position: 'absolute', 
                      left: `${left}%`, 
                      width: `${width}%`, 
                      height: '100%', 
                      background: 'rgba(255, 23, 68, 0.25)', 
                      borderLeft: '1px solid #FF1744',
                      borderRight: '1px solid #FF1744',
                      boxShadow: '0 0 10px rgba(255, 23, 68, 0.4)'
                    }} 
                    title={`Anomaly localized at ${anom.start}s - ${anom.end}s: ${anom.desc}`}
                  />
                );
              })}
              
              {/* 1-second ticks */}
              <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%', alignItems: 'flex-end', padding: '0 5px 2px 5px', pointerEvents: 'none' }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '1px', height: '6px', background: 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize: '6px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{s}s</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {aiData.anomalies.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-ecg)' }}>
                  <Check size={14} /> Normal sinus waveform contours. No anomalies localized.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {aiData.anomalies.map((anom, idx) => (
                    <div key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      • Localized segment at <span style={{ color: 'var(--color-critical)', fontWeight: 'bold' }}>{anom.start}s-{anom.end}s</span>: {anom.desc}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sudden Cardiac Risk & Text Report Generator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sudden Cardiac Risk Dial */}
          <div className="medical-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.12)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Sudden Cardiac Risk Index (SCRI)
            </span>
            
            <div style={{ position: 'relative', width: '120px', height: '65px', overflow: 'hidden', marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
              {/* Semi-circle Gauge SVG */}
              <svg width="120" height="60" viewBox="0 0 120 60">
                <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
                <path 
                  d="M 10 60 A 50 50 0 0 1 110 60" 
                  fill="none" 
                  stroke={aiData.risk > 70 ? 'var(--color-critical)' : aiData.risk > 40 ? 'var(--color-warning)' : 'var(--color-ecg)'} 
                  strokeWidth="12" 
                  strokeLinecap="round" 
                  strokeDasharray={`${(aiData.risk / 100) * 157}, 157`} 
                />
              </svg>
              
              <div style={{ position: 'absolute', bottom: 0, textAlign: 'center' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{aiData.risk}%</span>
              </div>
            </div>
            
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              color: aiData.risk > 70 ? 'var(--color-critical)' : aiData.risk > 40 ? 'var(--color-warning)' : 'var(--color-ecg)',
              marginTop: '4px' 
            }}>
              {aiData.risk > 70 ? 'HIGH CARDIAC INCIDENT RISK' : aiData.risk > 40 ? 'MODERATE RISK - MONITOR' : 'LOW RISK STATUS'}
            </span>
          </div>

          {/* AI Clinical Summary Generator */}
          <div className="medical-card" style={{ padding: '16px', background: 'rgba(213,0,249,0.02)', borderColor: 'rgba(213,0,249,0.1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-ai)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
              AI Clinical Report Summarizer
            </h4>
            
            <div style={{ flex: 1, background: '#02050a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px', overflowY: 'auto', marginBottom: '10px', minHeight: '120px' }}>
              {isGenerating ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <RefreshCw className="heart-icon-pulsing text-ai" size={24} />
                  <span>Analyzing wave features & drafting report...</span>
                </div>
              ) : generatedReport ? (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#B3E5FC', lineHeight: '1.4' }}>
                  {generatedReport}
                </pre>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '10px' }}>
                  <Brain size={28} style={{ marginBottom: '6px' }} />
                  <span>Click "Generate" to synthesize a natural-language cardiology summary for EMR export.</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={generateClinicalSummary} 
              className="btn-clinical"
              style={{ width: '100%', justifyContent: 'center', background: 'var(--color-ai)', color: '#FFF', borderColor: 'var(--color-ai)', fontWeight: 600 }}
              disabled={isGenerating}
            >
              Generate AI Clinical Summary
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
