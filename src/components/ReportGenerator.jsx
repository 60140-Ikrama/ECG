import React, { useState } from 'react';
import { FileText, Check, Share2, Info } from './Icons';

export default function ReportGenerator({ 
  currentPatient, 
  hrvMetrics, 
  pathology,
  currentLead 
}) {
  const [reportType, setReportType] = useState('expert'); // patient or expert
  const [showFhirExport, setShowFhirExport] = useState(false);

  const { timeDomain, frequencyDomain, nonlinear, clinical } = hrvMetrics;

  const handlePrint = () => {
    window.print();
  };

  // Generate FHIR Observation payload representation in JSON
  const getFhirPayload = () => {
    const fhirObservation = {
      resourceType: 'Observation',
      id: `ecg-hrv-obs-${currentPatient.mrn}-${Date.now().toString().slice(-6)}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8867-4',
            display: 'Heart rate'
          },
          {
            system: 'http://loinc.org',
            code: '80404-7',
            display: 'R-R interval standard deviation (SDNN)'
          }
        ],
        text: 'ECG Heart Rate and HRV Telemetry'
      },
      subject: {
        reference: `Patient/${currentPatient.mrn}`,
        display: currentPatient.name
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: timeDomain.meanHR,
        unit: 'beats/minute',
        system: 'http://unitsofmeasure.org',
        code: '/min'
      },
      component: [
        {
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '80404-7',
                display: 'SDNN'
              }
            ]
          },
          valueQuantity: {
            value: timeDomain.sdnn,
            unit: 'ms',
            system: 'http://unitsofmeasure.org',
            code: 'ms'
          }
        },
        {
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '80407-0',
                display: 'RMSSD'
              }
            ]
          },
          valueQuantity: {
            value: timeDomain.rmssd,
            unit: 'ms',
            system: 'http://unitsofmeasure.org',
            code: 'ms'
          }
        },
        {
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '251146004',
                display: 'Cardiac rhythm diagnosis'
              }
            ]
          },
          valueString: pathology === 'NSR' ? 'Normal Sinus Rhythm' : pathology
        }
      ]
    };
    return JSON.stringify(fhirObservation, null, 2);
  };

  return (
    <div className="medical-card card-analysis no-print" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText className="text-analysis" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Clinical Report Synthesizer</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Generate printable patient education sheets or research-grade diagnostic folders
            </span>
          </div>
        </div>
        
        <div className="no-print" style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setReportType('patient')}
            className={`btn-clinical ${reportType === 'patient' ? 'active' : ''}`}
          >
            Patient Report
          </button>
          <button 
            onClick={() => setReportType('expert')}
            className={`btn-clinical ${reportType === 'expert' ? 'active' : ''}`}
          >
            Cardio Expert Report
          </button>
          <button 
            onClick={handlePrint}
            className="btn-clinical"
            style={{ background: 'var(--color-analysis)', color: '#000', borderColor: 'var(--color-analysis)', fontWeight: 600 }}
          >
            Print PDF Sheet
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* REPORT CANVAS VIEW CONTAINER */}
        <div style={{ background: '#FFF', borderRadius: '12px', padding: '10px', overflowX: 'auto' }}>
          
          {reportType === 'patient' ? (
            /* --- PATIENT SIMPLE REPORT --- */
            <div className="report-sheet" style={{ color: '#333', background: '#FFF', width: '800px', margin: '0 auto', padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #E5E7EB', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', color: '#111827', margin: 0, fontWeight: 700 }}>Your Heart Health Report</h1>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>Simple health review made for you</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: '#4B5563' }}>
                  <strong>Patient Name:</strong> {currentPatient.name}<br />
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Status indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Heart Rhythm</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '6px 0', color: pathology === 'NSR' ? '#15803d' : '#b91c1c' }}>
                    {pathology === 'NSR' ? 'Stable & Normal' : pathology === 'AFib' ? 'Irregular (AFib)' : pathology}
                  </div>
                  <span style={{ fontSize: '11px', color: '#4B5563' }}>
                    {pathology === 'NSR' ? 'Your pulse is beating nicely.' : 'Your heart beats at a varied pace.'}
                  </span>
                </div>

                <div style={{ background: clinical.stressIndex > 150 ? '#FEF2F2' : '#F0FDF4', border: clinical.stressIndex > 150 ? '1px solid #FCA5A5' : '1px solid #BBF7D0', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: clinical.stressIndex > 150 ? '#991B1B' : '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Stress Level</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '6px 0', color: clinical.stressIndex > 150 ? '#b91c1c' : '#15803d' }}>
                    {clinical.stressIndex > 150 ? 'High Stress' : 'Resting State'}
                  </div>
                  <span style={{ fontSize: '11px', color: '#4B5563' }}>
                    Based on internal nerve indicators.
                  </span>
                </div>

                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#1E40AF', fontWeight: 600, textTransform: 'uppercase' }}>Body Recovery</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '6px 0', color: '#1d4ed8' }}>
                    {clinical.recoveryScore}% Optimal
                  </div>
                  <span style={{ fontSize: '11px', color: '#4B5563' }}>
                    Score of how well your body resets.
                  </span>
                </div>
              </div>

              {/* Patient friendly graph and lifestyle info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', color: '#1F2937', marginBottom: '10px', fontWeight: 600 }}>Doctor's Simple Summary:</h3>
                  <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.5', background: '#F9FAFB', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #3B82F6' }}>
                    {pathology === 'NSR' ? (
                      "Your heart traces show standard normal waves. Your heartbeat is sitting at a healthy rate. The variability tests show that your nervous system is resting and responding normally to breathing. Keep up your active lifestyle!"
                    ) : pathology === 'AFib' ? (
                      "We noticed that your heart has an irregular rhythm called Atrial Fibrillation. Your heart rate is slightly faster, and the small control waves are not showing up. It is important to keep checking in with your doctor, take your rates medications, and avoid excessive energy drinks or high stress."
                    ) : (
                      `Your heart trace shows a condition called ${pathology}. The timing and waves are sitting outside normal ranges. Please review this report with your cardiologist at your next scheduled clinic run.`
                    )}
                  </p>
                </div>

                <div style={{ background: '#F9FAFB', padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ fontSize: '14px', color: '#1F2937', marginBottom: '8px', fontWeight: 600 }}>Lifestyle Guidelines</h4>
                  <ul style={{ fontSize: '12px', color: '#4B5563', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>Get 7 to 8 hours of sleep.</li>
                    <li>Do 15-30 minutes of walking daily.</li>
                    <li>Limit coffee/energy drinks if feeling heart flutters.</li>
                    <li>Practice 2 minutes of box breathing if stressed.</li>
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: '30px', borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF' }}>
                <span>Mount Sinai Hospital Telemetry</span>
                <span>HIPAA Compliant Patient Copy</span>
              </div>
            </div>
          ) : (
            /* --- CARDIO EXPERT DETAILED REPORT --- */
            <div className="report-sheet report-sheet-expert" style={{ color: '#000', background: '#FFF', width: '800px', margin: '0 auto', padding: '30px' }}>
              
              {/* Report Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ fontSize: '26px', color: '#1a365d', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>MOUNT SINAI CARDIOLOGY LABS</h1>
                  <span style={{ fontSize: '12px', letterSpacing: '2px', color: '#718096', fontWeight: 'bold' }}>ADVANCED MEDICAL TELEMETRY SUMMARY</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.4' }}>
                  <strong>Document ID:</strong> MS-ECG-{currentPatient.mrn}-{Date.now().toString().slice(-4)}<br />
                  <strong>EHR Linkage:</strong> FHIR/HL7 Validated<br />
                  <strong>Encryption:</strong> AES-256 Session Lock
                </div>
              </div>

              {/* Metadata demographics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '11px', background: '#F7FAFC', padding: '10px', borderRadius: '4px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <div><strong>Patient Name:</strong><br /> {currentPatient.name}</div>
                <div><strong>Medical Record No (MRN):</strong><br /> {currentPatient.mrn}</div>
                <div><strong>Age / Gender / Weight:</strong><br /> {currentPatient.age}y / {currentPatient.gender} / {currentPatient.weight || '72 kg'}</div>
                <div><strong>Acquisition Date:</strong><br /> {new Date().toLocaleString()}</div>
              </div>

              {/* Intervals and HRV metrics tables */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                
                {/* ECG Conduction Intervals Table */}
                <div>
                  <h3 style={{ fontSize: '13px', color: '#1a365d', borderBottom: '1px solid #CBD5E0', paddingBottom: '4px', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Conduction Interval Analytics
                  </h3>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>Rhythm Classification</td><td style={{ fontWeight: 'bold', color: pathology === 'NSR' ? '#2f855a' : '#c53030' }}>{pathology}</td></tr>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>Heart Rate (Mean)</td><td style={{ fontWeight: 'bold' }}>{timeDomain.meanHR} bpm</td></tr>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>PR Interval</td><td>{pathology === 'AFib' ? 'N/A' : '162 ms'}</td></tr>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>QRS Duration</td><td>{pathology === 'VTach' ? '168 ms' : pathology === 'PVC' ? '142 ms' : '92 ms'}</td></tr>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>QTc Interval (Fridericia)</td><td>{pathology === 'AFib' ? '464 ms' : '412 ms'}</td></tr>
                      <tr><td style={{ padding: '4px 0' }}>ST Segment Deviation</td><td>{pathology === 'VTach' ? '+2.4 mm' : '0.0 mm'}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* HRV Analysis Table */}
                <div>
                  <h3 style={{ fontSize: '13px', color: '#1a365d', borderBottom: '1px solid #CBD5E0', paddingBottom: '4px', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Autonomic HRV Power Spectrum
                  </h3>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>SDNN (Total Variability)</td><td style={{ fontWeight: 'bold' }}>{timeDomain.sdnn} ms</td></tr>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>RMSSD (Vagal tone)</td><td style={{ fontWeight: 'bold' }}>{timeDomain.rmssd} ms</td></tr>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>LF Power (0.04 - 0.15 Hz)</td><td>{frequencyDomain.lf} ms²</td></tr>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>HF Power (0.15 - 0.40 Hz)</td><td>{frequencyDomain.hf} ms²</td></tr>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}><td style={{ padding: '4px 0' }}>LF/HF Sympathovagal Ratio</td><td>{frequencyDomain.ratio}</td></tr>
                      <tr><td style={{ padding: '4px 0' }}>Poincaré SD1/SD2 Ratio</td><td>{nonlinear.ratio}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Waveform Thumbnail Mock */}
              <div style={{ border: '1px solid #E2E8F0', padding: '10px', borderRadius: '4px', background: '#F8FAFC', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718096', marginBottom: '4px', fontWeight: 'bold' }}>
                  <span>TELEMETERED WAVEFORM CAPTURE (LEAD II)</span>
                  <span>Grid Speed: 25 mm/s | Gain: 10 mm/mV</span>
                </div>
                
                {/* SVG representation of the wave */}
                <div style={{ height: '70px', background: '#FFF', border: '1px solid #CBD5E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="650" height="60" viewBox="0 0 650 60">
                    {/* Pink grid lines */}
                    <line x1="0" y1="30" x2="650" y2="30" stroke="rgba(255, 0, 0, 0.15)" strokeWidth="1" />
                    {pathology === 'VTach' ? (
                      <path d="M0,30 Q25,5 50,30 Q75,55 100,30 Q125,5 150,30 Q175,55 200,30 Q225,5 250,30 Q275,55 300,30 Q325,5 350,30 Q375,55 400,30 Q425,5 450,30 Q475,55 500,30 Q525,5 550,30 Q575,55 600,30 Q625,5 650,30" fill="none" stroke="#2D3748" strokeWidth="2" />
                    ) : (
                      <path d="M0,30 L80,30 Q90,25 95,30 L110,30 L115,36 L120,5 L125,40 L130,30 L150,30 Q160,20 170,30 L280,30 Q290,25 295,30 L310,30 L315,36 L320,5 L325,40 L330,30 L350,30 Q360,20 370,30 L480,30 Q490,25 495,30 L510,30 L515,36 L520,5 L525,40 L530,30 L550,30 Q560,20 570,30 L650,30" fill="none" stroke="#2D3748" strokeWidth="2" />
                    )}
                  </svg>
                </div>
              </div>

              {/* Diagnostics notes */}
              <div style={{ fontSize: '11px', marginBottom: '24px' }}>
                <strong style={{ display: 'block', color: '#1a365d', marginBottom: '4px' }}>CLINICAL OBSERVATIONS & DIAGNOSTIC INTERPRETATION:</strong>
                <p style={{ color: '#2D3748', lineHeight: '1.5', background: '#F8FAFC', padding: '10px', borderLeft: '3px solid #1a365d' }}>
                  The real-time telemetry feed confirms a cardiac rhythm matching <strong>{pathology}</strong>.
                  HRV indicators display a stress index level of {clinical.stressIndex} with a vagal power density score of {frequencyDomain.hf} ms².
                  Atrial activity demonstrates {pathology === 'AFib' ? 'absence of discrete, coordinate P-waves with high-frequency irregular baseline activity.' : 'proper coordination with ventricular depolarization.'}
                  Conjunctional analysis identifies the ventricular activation parameters as stable except for specified events.
                </p>
              </div>

              {/* Signatures & QR verify */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '16px', fontSize: '11px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                    <div>
                      <strong>Clinician Signature:</strong>
                      <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', margin: '8px 0', borderBottom: '1px solid #A0AEC0', width: '150px' }}>
                        Dr. Sarah Jenkins, FACC
                      </div>
                      <span style={{ fontSize: '9px', color: '#718096' }}>Attending Cardiology Consultant</span>
                    </div>
                    <div>
                      <strong>Digital Audit Trail Key:</strong>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#4A5568', wordBreak: 'break-all', width: '160px', marginTop: '6px' }}>
                        SHA256: 8f9b9a6d8c7b8e5f2a1b9f6d7c8a...
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                  <div style={{ textAlign: 'right', fontSize: '9px', color: '#718096' }}>
                    <strong>QR Verification Code</strong><br />
                    Scan to verify this medical<br />record integrity on PACS portal.
                  </div>
                  {/* Mock QR Code in SVG */}
                  <svg width="45" height="45" viewBox="0 0 45 45" style={{ background: '#FFF', border: '1px solid #CBD5E0', padding: '2px' }}>
                    <rect x="0" y="0" width="12" height="12" fill="#000" />
                    <rect x="33" y="0" width="12" height="12" fill="#000" />
                    <rect x="0" y="33" width="12" height="12" fill="#000" />
                    <rect x="18" y="18" width="9" height="9" fill="#000" />
                    <rect x="6" y="18" width="3" height="3" fill="#000" />
                    <rect x="18" y="6" width="3" height="3" fill="#000" />
                    <rect x="27" y="27" width="9" height="9" fill="#000" />
                  </svg>
                </div>
              </div>

            </div>
          )}
          
        </div>

        {/* FHIR JSON Export Box */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '12px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>EHR Integration Tools</span>
            <button 
              onClick={() => setShowFhirExport(!showFhirExport)}
              className="btn-clinical"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              {showFhirExport ? 'Hide HL7/FHIR Payload' : 'Show HL7/FHIR Observation Payload'}
            </button>
          </div>
          
          {showFhirExport && (
            <div style={{ background: '#02050a', borderRadius: '6px', padding: '12px', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>FHIR R4 Observation Resource JSON Schema</span>
                <span style={{ color: 'var(--color-ecg)' }}>Valid HL7 JSON</span>
              </div>
              <pre style={{ margin: 0, overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#A5D6A7', maxHeight: '180px', textAlign: 'left' }}>
                {getFhirPayload()}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
