import React, { useState } from 'react';
import { Cpu, Video, Link2, Check, RefreshCw } from './Icons';

export default function AdvancedIndustrial({ 
  hrvMetrics, 
  currentPatient, 
  pathology 
}) {
  const [pacStatus, setPacStatus] = useState('READY');
  const [hl7Log, setHl7Log] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const meanHR = hrvMetrics.timeDomain.meanHR || 75;
  const pulseDuration = (60 / meanHR).toFixed(2); // calculate period in seconds

  // Simulate PACS DICOM transmission and output standard HL7 message block
  const handleTransmitPacs = () => {
    setIsTransmitting(true);
    setPacStatus('NEGOTIATING_TCP');
    
    setTimeout(() => {
      setPacStatus('TRANSMITTING_DICOM');
      // Construct standard HL7 v2.5 ORU^R01 (Observation Result) Message format
      const dateStr = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
      let hl7 = `MSH|^~\\&|ECG_HUB|MT_SINAI|EPIC_EHR|MS_CARDIO|${dateStr}||ORU^R01|MSG0001|P|2.5\n`;
      hl7 += `PID|1||${currentPatient.mrn}^^^MSHOSPITAL||${currentPatient.name.split(' ').reverse().join('^')}||19780512|${currentPatient.gender === 'Male' ? 'M' : 'F'}\n`;
      hl7 += `PV1|1|I|ICU^RM_${currentPatient.room}^BED_${currentPatient.bed}|||||||||||||||||||||||||||||||||||||||||${dateStr}\n`;
      hl7 += `OBR|1|OBS0001||8867-4^ECG_HRV_REPORT^LN|||${dateStr}|||||||||||||||202605251130|||F\n`;
      hl7 += `OBX|1|NM|8867-4^Heart_Rate^LN||${meanHR}|/min|60-100|N|||F\n`;
      hl7 += `OBX|2|NM|80404-7^SDNN^LN||${hrvMetrics.timeDomain.sdnn}|ms|30-100|${hrvMetrics.timeDomain.sdnn < 30 ? 'L' : 'N'}|||F\n`;
      hl7 += `OBX|3|NM|80407-0^RMSSD^LN||${hrvMetrics.timeDomain.rmssd}|ms|20-80|${hrvMetrics.timeDomain.rmssd < 20 ? 'L' : 'N'}|||F\n`;
      hl7 += `OBX|4|TX|251146004^Conduction_Rhythm^SCT||${pathology}|||A|||F`;
      
      setHl7Log(hl7);
      
      setTimeout(() => {
        setPacStatus('SUCCESS');
        setIsTransmitting(false);
      }, 700);
    }, 600);
  };

  return (
    <div className="medical-card card-ai" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu className="text-ai" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Advanced Industrial Features & Interoperability</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Digital twin organ synchronization, telemedicine pipelines, and PACS DICOM HL7 bridges
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
        {/* Left Side: Beating Digital Twin & Telemedicine */}
        <div style={{ display: 'grid', gridTemplateRows: '1.2fr 0.8fr', gap: '16px' }}>
          
          {/* Beating Heart model card */}
          <div className="medical-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
              Digital Twin Conduction Model (Synchronized)
            </h4>
            
            <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Custom SVG Heart with beating CSS scale */}
              <svg 
                width="110" 
                height="110" 
                viewBox="0 0 100 100" 
                className="heart-icon-pulsing"
                style={{ 
                  animationDuration: `${pulseDuration}s`, 
                  transformOrigin: 'center', 
                  display: 'block' 
                }}
              >
                {/* Heart Base Shape */}
                <path 
                  d="M12,30 C5,10 45,5 50,42 C55,5 95,10 88,30 C78,55 52,85 50,88 C48,85 22,55 12,30 Z" 
                  fill={pathology === 'VTach' ? 'rgba(255, 23, 68, 0.25)' : 'rgba(0, 230, 118, 0.2)'} 
                  stroke={pathology === 'VTach' ? 'var(--color-critical)' : 'var(--color-ecg)'} 
                  strokeWidth="2.5" 
                />
                
                {/* Conduction Pathways (SA Node -> AV Node -> Bundle of His) */}
                <circle cx="36" cy="22" r="3" fill="#FFF" className="red-alert-flashing" style={{ animationDuration: `${pulseDuration}s` }} /> {/* SA Node */}
                <line x1="36" y1="22" x2="48" y2="40" stroke="#FFF" strokeWidth="1" strokeDasharray="2,2" />
                
                <circle cx="48" cy="40" r="3.5" fill="#FFF" /> {/* AV Node */}
                <line x1="48" y1="40" x2="50" y2="58" stroke="#FFF" strokeWidth="1.5" />
                
                <path d="M50,58 Q42,66 38,76 M50,58 Q58,66 62,76" fill="none" stroke="#FFF" strokeWidth="1.2" /> {/* Bundle branches */}
              </svg>
              
              {/* Overlay labels */}
              <span style={{ position: 'absolute', top: '10px', left: '0px', fontSize: '7px', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)', padding: '1px 3px', borderRadius: '3px' }}>SA Node</span>
              <span style={{ position: 'absolute', top: '44px', left: '0px', fontSize: '7px', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)', padding: '1px 3px', borderRadius: '3px' }}>AV Node</span>
              <span style={{ position: 'absolute', bottom: '15px', right: '0px', fontSize: '7px', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)', padding: '1px 3px', borderRadius: '3px' }}>Purkinje Fibers</span>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Twin Beating Rate: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: pathology === 'VTach' ? 'var(--color-critical)' : 'var(--color-ecg)' }}>{meanHR} BPM</span> (Period: {pulseDuration}s)
            </p>
          </div>

          {/* Telemedicine Video conference panel */}
          <div className="medical-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Video size={16} className="text-analysis" /> Telemedicine Conference Port (EHR Integrated)
              </span>
              <span style={{ fontSize: '0.65rem', padding: '1px 6px', background: 'rgba(0,230,118,0.15)', color: 'var(--color-ecg)', borderRadius: '4px' }}>CONNECTED</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ height: '70px', background: '#111827', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '0.75rem', color: '#FFF', fontWeight: 500 }}>Dr. Jenkins (Consultant)</span>
                <span style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '6px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>HD Cam • 60 FPS</span>
              </div>
              
              <div style={{ height: '70px', background: '#111827', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '0.75rem', color: '#FFF', fontWeight: 500 }}>Patient Room 402</span>
                <span style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '6px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>Bed A Feed • 30 FPS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: DICOM PACS Sandbox */}
        <div className="medical-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px', fontWeight: 600, marginBottom: '10px' }}>
            PACS DICOM / HL7 Interoperability Engine
          </h4>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span>PACS Link Status:</span>
              <span style={{ 
                fontWeight: 'bold', 
                color: pacStatus === 'SUCCESS' ? 'var(--color-ecg)' : pacStatus === 'READY' ? 'var(--text-secondary)' : 'var(--color-warning)'
              }}>
                {pacStatus}
              </span>
            </div>

            <button 
              onClick={handleTransmitPacs}
              className="btn-clinical"
              style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-tertiary)', fontWeight: 600, display: 'flex', gap: '6px' }}
              disabled={isTransmitting}
            >
              {isTransmitting ? <RefreshCw className="heart-icon-pulsing" size={14} /> : <Link2 size={14} />}
              Transmit Telemetry to DICOM PACS
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Outgoing HL7 Message (ORU^R01)</span>
                {pacStatus === 'SUCCESS' && <span style={{ color: 'var(--color-ecg)' }}>ACK RECEIVED (OK)</span>}
              </div>
              
              <div style={{ flex: 1, background: '#02050a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px', overflowY: 'auto', minHeight: '120px' }}>
                {hl7Log ? (
                  <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#A5D6A7', whiteSpace: 'pre-wrap', textAlign: 'left', lineHeight: '1.35' }}>
                    {hl7Log}
                  </pre>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
                    Click "Transmit" to generate and send standard HL7 v2 telemetry observations.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
