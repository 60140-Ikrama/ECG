import React, { useState } from 'react';
import { Database, Users, Settings, Check } from './Icons';

export default function EnterpriseCloud({ 
  currentPatient, 
  auditLogs = [],
  pathology 
}) {
  const [activeTab, setActiveTab] = useState('audit');

  // Simulated fleet of monitoring hardware
  const fleetDevices = [
    { name: 'Bedside Monitor Philips MX450', type: 'WiFi 5GHz', status: 'ONLINE', signal: '-52 dBm', battery: 'AC POWER', channel: 'Ch 48' },
    { name: 'Patient Smartwatch (Wearable ECG)', type: 'Bluetooth 5.2', status: 'ONLINE', signal: 'Good', battery: '78%', channel: 'BLE-L1' },
    { name: 'Continuous ECG Patch (BioTelemetry)', type: 'Cellular LTE-M', status: 'STANDBY', signal: '-88 dBm', battery: '42%', channel: 'Sim 1' }
  ];

  return (
    <div className="medical-card card-analysis" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database className="text-analysis" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Enterprise Cloud Node & Device Fleet Management</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              HIPAA audit trailing, collaborative clinician telemetry channels, and medical hardware monitoring
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* Left Side: Audit Trail & Collaboration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px', gap: '12px' }}>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`btn-clinical ${activeTab === 'audit' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              HIPAA Cryptographic Audit Trail ({auditLogs.length})
            </button>
            
            <button 
              onClick={() => setActiveTab('collab')}
              className={`btn-clinical ${activeTab === 'collab' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Collaborating Clinicians Presence
            </button>
          </div>

          {activeTab === 'audit' && (
            <div style={{ background: '#02050a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '12px', minHeight: '220px', maxHeight: '250px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
                <span>CLINICAL OPERATION METADATA</span>
                <span>SHA-256 HASH CHAIN</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {auditLogs.slice().reverse().map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                    <div>
                      <span style={{ color: 'var(--color-analysis)' }}>[{log.time}]</span>{' '}
                      <span style={{ color: 'var(--text-primary)' }}>{log.action}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>{log.hash.slice(0, 12)}...</span>
                  </div>
                ))}
                
                {auditLogs.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '60px' }}>
                    No operations recorded.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'collab' && (
            <div style={{ background: '#02050a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '12px', minHeight: '220px', maxHeight: '250px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} className="text-ecg" />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Dr. Sarah Jenkins (You)</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Attending Cardiologist</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ecg)' }}>ACTIVE VIEWING</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '4px', opacity: 0.85 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} className="text-analysis" />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Nurse Emily Davis</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ICU Charge Nurse</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>MUTED ALARM (1m ago)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '4px', opacity: 0.7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} className="text-ai" />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Epic Systems EMR Sync</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>FHIR HL7 API Connector</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ai)' }}>SYNC COMPLETE</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Device Fleet Management */}
        <div className="medical-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
            Transmitter Hardware Fleet
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {fleetDevices.map((device, idx) => (
              <div key={idx} style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '2px' }}>
                  <span>{device.name}</span>
                  <span style={{ color: 'var(--color-ecg)' }}>{device.status}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                  <span>Interface: {device.type}</span>
                  <span style={{ textAlign: 'right' }}>Signal: {device.signal}</span>
                  <span>Channel: {device.channel}</span>
                  <span style={{ textAlign: 'right' }}>Battery: {device.battery}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
