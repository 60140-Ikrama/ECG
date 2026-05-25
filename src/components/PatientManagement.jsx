import React, { useState } from 'react';
import { Search, User, Filter, ShieldAlert, FileText, Check } from './Icons';

export default function PatientManagement({ 
  patients, 
  currentPatient, 
  setCurrentPatient,
  onAddPatient 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // ALL, EMERGENCY, STABLE
  const [notes, setNotes] = useState(currentPatient.notes || '');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Sync notes when patient changes
  React.useEffect(() => {
    setNotes(currentPatient.notes || '');
  }, [currentPatient]);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (priorityFilter === 'ALL') return matchesSearch;
    if (priorityFilter === 'EMERGENCY') return matchesSearch && p.priority === 'CRITICAL';
    if (priorityFilter === 'STABLE') return matchesSearch && p.priority === 'STABLE';
    return matchesSearch;
  });

  const handleSaveNotes = () => {
    currentPatient.notes = notes;
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const getPriorityStyle = (prio) => {
    if (prio === 'CRITICAL') return { background: 'rgba(255, 23, 68, 0.15)', color: '#FF1744', border: '1px solid rgba(255, 23, 68, 0.3)' };
    if (prio === 'WARNING') return { background: 'rgba(255, 171, 0, 0.15)', color: '#FFAB00', border: '1px solid rgba(255, 171, 0, 0.3)' };
    return { background: 'rgba(0, 230, 118, 0.15)', color: '#00E676', border: '1px solid rgba(0, 230, 118, 0.3)' };
  };

  return (
    <div className="medical-card card-ecg" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <User className="text-ecg" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Clinical Patient Registry & EMR Database</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Hospital patient directory, priority queue triage, and historical telemetry folders
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* Left Side: Search & Patient List Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Search Name or MRN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setPriorityFilter('ALL')}
              className={`btn-clinical ${priorityFilter === 'ALL' ? 'active' : ''}`}
              style={{ flex: 1, padding: '4px', fontSize: '0.7rem' }}
            >
              All Registry
            </button>
            <button 
              onClick={() => setPriorityFilter('EMERGENCY')}
              className={`btn-clinical ${priorityFilter === 'EMERGENCY' ? 'active' : ''}`}
              style={{ flex: 1, padding: '4px', fontSize: '0.7rem', color: priorityFilter === 'EMERGENCY' ? '' : '#FF1744' }}
            >
              Emergency
            </button>
            <button 
              onClick={() => setPriorityFilter('STABLE')}
              className={`btn-clinical ${priorityFilter === 'STABLE' ? 'active' : ''}`}
              style={{ flex: 1, padding: '4px', fontSize: '0.7rem', color: priorityFilter === 'STABLE' ? '' : '#00E676' }}
            >
              Stable
            </button>
          </div>

          {/* Patient Items Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredPatients.map(patient => (
              <div 
                key={patient.id}
                onClick={() => setCurrentPatient(patient)}
                style={{
                  background: currentPatient.id === patient.id ? 'rgba(0, 230, 118, 0.08)' : 'var(--bg-tertiary)',
                  borderColor: currentPatient.id === patient.id ? 'var(--color-ecg)' : 'var(--card-border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{patient.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>MRN: {patient.mrn}</div>
                </div>
                
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', ...getPriorityStyle(patient.priority) }}>
                  {patient.priority}
                </span>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '20px' }}>
                No records found.
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Detailed EMR profile */}
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: '16px' }}>
          {/* Section 1: Demographics Card */}
          <div className="medical-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</span>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{currentPatient.name}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clinical ID / MRN</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600 }}>{currentPatient.mrn}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Age / Gender</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentPatient.age} yrs / {currentPatient.gender}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Room assignment</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-analysis)' }}>Room {currentPatient.room} (Bed {currentPatient.bed})</div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blood Type</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentPatient.bloodGroup || 'O+'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Height / Weight</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentPatient.height || '178 cm'} / {currentPatient.weight || '72 kg'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cardiac Diagnosis</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: currentPatient.priority === 'CRITICAL' ? 'var(--color-critical)' : 'var(--color-ecg)' }}>
                {currentPatient.pathologyInfo || 'Normal Sinus'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security status</span>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-ai)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Check size={12} /> HIPAA LOCKED
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
            
            {/* Column A: History & Meds */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* History */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Prior Medical Anamnesis</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {currentPatient.history && currentPatient.history.map((hist, idx) => (
                    <span key={idx} style={{ padding: '2px 6px', background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-primary)' }}>
                      • {hist}
                    </span>
                  ))}
                  {!currentPatient.history && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No historical logs.</span>}
                </div>
              </div>

              {/* Medications */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', flex: 1 }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Active Pharmacotherapy</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentPatient.medications ? currentPatient.medications.map((med, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 600 }}>{med.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{med.dose} ({med.freq})</span>
                    </div>
                  )) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No active drugs.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Column B: Doctor Notes & Prior Sessions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Doctor Notes */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', flex: 1.2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Physician Consultation Notes</h4>
                  <button 
                    onClick={handleSaveNotes}
                    className="btn-clinical" 
                    style={{ fontSize: '0.7rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    {showSaveConfirm ? <Check size={10} /> : null}
                    {showSaveConfirm ? 'Saved' : 'Save Notes'}
                  </button>
                </div>
                
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type telemetry review, diagnostic impressions, patient complaints, or medication adjustments..."
                  style={{
                    width: '100%',
                    flex: 1,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '0.78rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    minHeight: '80px'
                  }}
                />
              </div>

              {/* Sessions */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', flex: 0.8 }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>Prior ECG Sessions Archive</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                  {currentPatient.sessions ? currentPatient.sessions.map((sess, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.7rem' }}>
                      <span>{sess.date} ({sess.duration})</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-analysis)' }}>{sess.diag}</span>
                    </div>
                  )) : (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>No historical telemetry entries.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
