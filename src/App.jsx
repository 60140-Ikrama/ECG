import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Activity, RefreshCw, Search, User, Filter, 
  ShieldAlert, Info, Settings, Bell, Brain, Heart, Sliders, 
  TrendingUp, AlertTriangle, Users, FileText, Database, Zap,
  Volume2, VolumeX, Share2, Check, Cpu, Video, Link2
} from './components/Icons';

import { ECGGenerator } from './utils/ecgGenerator';
import { NotchFilter, HighPassFilter, LowPassFilter, SavitzkyGolayFilter } from './utils/biomedicalFilters';
import { calculateHRV } from './utils/hrvCalculations';

// Component Imports
import LiveECGViewer from './components/LiveECGViewer';
import SignalProcessingLab from './components/SignalProcessingLab';
import ECGAnalysisCenter from './components/ECGAnalysisCenter';
import HRVAnalysisCenter from './components/HRVAnalysisCenter';
import AIDiagnosticCenter from './components/AIDiagnosticCenter';
import PatientManagement from './components/PatientManagement';
import ReportGenerator from './components/ReportGenerator';
import EmergencySystem from './components/EmergencySystem';
import EnterpriseCloud from './components/EnterpriseCloud';
import AdvancedIndustrial from './components/AdvancedIndustrial';

// Mock Patient Registry (EMR database with distinct pathologies)
const MOCK_PATIENTS = [
  {
    id: 1,
    name: 'Arthur Pendelton',
    mrn: '893-X10-09',
    age: 68,
    gender: 'Male',
    bed: 'B-04',
    room: '402',
    bloodGroup: 'A+',
    height: '174 cm',
    weight: '81 kg',
    priority: 'CRITICAL',
    pathology: 'VTach',
    pathologyInfo: 'Ventricular Tachycardia (Wide Complex)',
    history: ['Myocardial Infarction (2022)', 'Coronary Artery Disease', 'CABG Surgery'],
    medications: [
      { name: 'Amiodarone HCl', dose: '200 mg', freq: 'QD' },
      { name: 'Metoprolol Succinate', dose: '50 mg', freq: 'BID' }
    ],
    sessions: [
      { date: '2026-05-24', duration: '12 min', diag: 'Ventricular Runs' },
      { date: '2026-05-20', duration: '20 min', diag: 'Ischemic ST Shift' }
    ],
    notes: 'Patient experienced sudden lightheadedness. Bedside monitor shows continuous ventricular tachycardia. Emergency cart standby. Code Blue team notified.'
  },
  {
    id: 2,
    name: 'Marcus Aurelius',
    mrn: '112-A89-52',
    age: 52,
    gender: 'Male',
    bed: 'A-01',
    room: '402',
    bloodGroup: 'O+',
    height: '180 cm',
    weight: '85 kg',
    priority: 'WARNING',
    pathology: 'AFib',
    pathologyInfo: 'Atrial Fibrillation (Irregular)',
    history: ['Essential Hypertension', 'Hyperlipidemia', 'Paroxysmal AFib'],
    medications: [
      { name: 'Apixaban (Eliquis)', dose: '5 mg', freq: 'BID' },
      { name: 'Diltiazem HCl CD', dose: '120 mg', freq: 'QD' }
    ],
    sessions: [
      { date: '2026-05-23', duration: '8 min', diag: 'AFib Episode' },
      { date: '2026-05-18', duration: '15 min', diag: 'Sinus Tachycardia' }
    ],
    notes: 'Complaining of mild palpitations. Traces confirm atrial fibrillation. Pulse is irregularly irregular. Stroke risk evaluation complete.'
  },
  {
    id: 3,
    name: 'Clara Barton',
    mrn: '541-W23-74',
    age: 74,
    gender: 'Female',
    bed: 'A-04',
    room: '403',
    bloodGroup: 'B-',
    height: '162 cm',
    weight: '64 kg',
    priority: 'WARNING',
    pathology: 'PVC',
    pathologyInfo: 'Normal Sinus with PVC burden',
    history: ['Mitral Valve Prolapse', 'Mild Osteoarthritis', 'Prior PVCs'],
    medications: [
      { name: 'Magnesium Oxide', dose: '400 mg', freq: 'QD' },
      { name: 'Coenzyme Q10', dose: '100 mg', freq: 'QD' }
    ],
    sessions: [
      { date: '2026-05-22', duration: '15 min', diag: 'PVCs Detected' }
    ],
    notes: 'Occasional early thumping beats felt at rest. PVC burden estimated at 6% of total beats. Electrolytes K+ and Mg2+ are within normal range.'
  },
  {
    id: 4,
    name: 'Florence Nightingale',
    mrn: '412-S04-42',
    age: 42,
    gender: 'Female',
    bed: 'B-01',
    room: '403',
    bloodGroup: 'O-',
    height: '168 cm',
    weight: '58 kg',
    priority: 'STABLE',
    pathology: 'NSR',
    pathologyInfo: 'Normal Sinus Rhythm',
    history: ['Vigorous physical training (Athlete baseline)'],
    medications: [],
    sessions: [
      { date: '2026-05-25', duration: '45 min', diag: 'Normal Sinus' }
    ],
    notes: 'Athlete baseline. High vagal tone, normal sinus intervals. Completely asymptomatic and vitals are extremely stable.'
  },
  {
    id: 5,
    name: 'Winston Churchill',
    mrn: '902-C77-81',
    age: 81,
    gender: 'Male',
    bed: 'A-02',
    room: '404',
    bloodGroup: 'AB+',
    height: '170 cm',
    weight: '90 kg',
    priority: 'WARNING',
    pathology: 'Bradycardia',
    pathologyInfo: 'Sinus Bradycardia (Low HR)',
    history: ['1st Degree AV Block', 'Chronic Gout', 'TIA (2020)'],
    medications: [
      { name: 'Aspirin Enteric Coated', dose: '81 mg', freq: 'QD' },
      { name: 'Allopurinol', dose: '100 mg', freq: 'QD' }
    ],
    sessions: [
      { date: '2026-05-21', duration: '30 min', diag: 'Sinus Bradycardia' }
    ],
    notes: 'Low resting rate (~45 bpm). Conduction intervals show 1st degree block. Reviewing beta-blocker drug levels. Patient is currently alert and oriented.'
  },
  {
    id: 6,
    name: 'Albert Einstein',
    mrn: '314-E15-76',
    age: 76,
    gender: 'Male',
    bed: 'B-02',
    room: '404',
    bloodGroup: 'A-',
    height: '175 cm',
    weight: '72 kg',
    priority: 'WARNING',
    pathology: 'Tachycardia',
    pathologyInfo: 'Sinus Tachycardia (High HR)',
    history: ['Mild Hyperthyroidism', 'Generalized Anxiety Disorder'],
    medications: [
      { name: 'Levothyroxine Sodium', dose: '125 mcg', freq: 'QD' },
      { name: 'Propranolol HCl', dose: '10 mg', freq: 'PRN' }
    ],
    sessions: [
      { date: '2026-05-24', duration: '10 min', diag: 'Sinus Tachycardia' }
    ],
    notes: 'Elevated rate ~125 bpm. Normal sinus complexes. Patient reports mild stress. Evaluated thyroid function panel.'
  }
];

export default function App() {
  const [theme, setTheme] = useState('dark'); // dark or light
  const [activeTab, setActiveTab] = useState('home'); // home, acquisition, processing, analysis, hrv, ai, patients, reports, alarms, enterprise, advanced
  
  // Patient registry state
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [currentPatient, setCurrentPatient] = useState(MOCK_PATIENTS[3]); // Default to Florence (NSR)
  const [currentLead, setCurrentLead] = useState('II');
  
  // Real-time scrolling sample buffers (last 1000 samples)
  const [rawSamples, setRawSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [rrIntervals, setRrIntervals] = useState([800, 790, 810, 800, 805, 795, 802, 798]); // ms
  const [hrvMetrics, setHrvMetrics] = useState({
    timeDomain: { sdnn: 42.1, rmssd: 38.4, nn50: 2, pnn50: 25.0, meanRR: 800, meanHR: 75 },
    frequencyDomain: { vlf: 180, lf: 450, hf: 620, ratio: 0.73, totalPower: 1250 },
    nonlinear: { sd1: 27.2, sd2: 52.8, ratio: 0.51, poincarePoints: [] },
    clinical: { stressIndex: 82, fatigueIndex: 32, recoveryScore: 84 }
  });

  // Alarm and Mute states
  const [alarmActive, setAlarmActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Bedside 04 connected to ECG telemetry', time: '10m ago', type: 'info' },
    { id: 2, text: 'Clinical audit trail verified (SHA-256 locked)', time: '5m ago', type: 'check' }
  ]);

  // Persistent biomedical DSP filters (refs to prevent re-instantiation state loss)
  const generatorRef = useRef(new ECGGenerator(250));
  const notchFilterRef = useRef(new NotchFilter(50, 250, 25));
  const highPassFilterRef = useRef(new HighPassFilter(0.5, 250));
  const lowPassFilterRef = useRef(new LowPassFilter(40, 250));
  const savitzkyGolayRef = useRef(new SavitzkyGolayFilter());

  // Filter toggles
  const [isFilterActive, setIsFilterActive] = useState(true);
  const [filterToggles, setFilterToggles] = useState({
    notch: true,
    highpass: true,
    lowpass: true,
    savitzky: true
  });

  // HIPAA Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);

  // System clock
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

  // Update system clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper: Log HIPAA audit trails with cryptographically simulated SHA-256 hash
  const addAuditLog = (action) => {
    const time = new Date().toLocaleTimeString();
    // Simple mock SHA-256 string generator
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setAuditLogs(prev => [...prev, { time, action, hash }]);
  };

  // Sync patient registry selections to generator pathology
  useEffect(() => {
    generatorRef.current.setPathology(currentPatient.pathology);
    generatorRef.current.setLead(currentLead);
    
    // Clear sample buffers for fresh start
    setRawSamples([]);
    setFilteredSamples([]);
    setRrIntervals([800, 790, 810, 800, 805, 795, 802, 798]);
    
    // Trigger alarm if patient priority is CRITICAL
    if (currentPatient.priority === 'CRITICAL') {
      setAlarmActive(true);
      addAuditLog(`ALARM TRIGGERED: Patient ${currentPatient.name} enters Critical triage priority.`);
    } else {
      setAlarmActive(false);
    }
    
    addAuditLog(`Clinician accessed patient EMR record: ${currentPatient.name} (MRN: ${currentPatient.mrn})`);
  }, [currentPatient, currentLead]);

  // Sync lead selections to generator
  useEffect(() => {
    generatorRef.current.setLead(currentLead);
    addAuditLog(`ECG channel telemetry vector changed to Lead ${currentLead}.`);
  }, [currentLead]);

  // Sync filter toggle states
  useEffect(() => {
    addAuditLog(`DSP configurations adjusted. Filters: notch(${filterToggles.notch}), HP(${filterToggles.highpass}), LP(${filterToggles.lowpass}), SG(${filterToggles.savitzky}).`);
  }, [filterToggles]);

  // Main high-precision data streaming interval
  // Runs every 80ms, generating 20 samples (represents 250Hz frequency)
  useEffect(() => {
    const dt = 0.08; // 80ms
    const samplesToGen = 20;
    
    const streamTimer = setInterval(() => {
      const freshRaw = [];
      const freshFiltered = [];
      let rPeakTriggered = false;

      for (let i = 0; i < samplesToGen; i++) {
        const sample = generatorRef.current.getNextSample();
        freshRaw.push(sample);

        // Apply Cascade Filters
        let filteredVal = sample.value;
        
        if (isFilterActive) {
          if (filterToggles.notch) {
            filteredVal = notchFilterRef.current.filter(filteredVal);
          }
          if (filterToggles.highpass) {
            filteredVal = highPassFilterRef.current.filter(filteredVal);
          }
          if (filterToggles.lowpass) {
            filteredVal = lowPassFilterRef.current.filter(filteredVal);
          }
          if (filterToggles.savitzky) {
            filteredVal = savitzkyGolayRef.current.filter(filteredVal);
          }
        }

        freshFiltered.push({
          time: sample.time,
          value: filteredVal,
          rPeak: sample.rPeak
        });

        if (sample.rPeak) {
          rPeakTriggered = true;
        }
      }

      // Append samples to state buffers (cap at 800 points for canvas layout)
      setRawSamples(prev => {
        const joined = [...prev, ...freshRaw];
        return joined.slice(-800);
      });

      setFilteredSamples(prev => {
        const joined = [...prev, ...freshFiltered];
        return joined.slice(-800);
      });

      // Handle R-Peak triggers and HRV calculations
      if (rPeakTriggered && currentPatient.pathology !== 'VTach') {
        setRrIntervals(prev => {
          // Calculate interval since last R-peak (convert to ms)
          const bpmBase = currentPatient.pathology === 'AFib' ? (80 + Math.random() * 50) : generatorRef.current.bpm;
          const intervalMs = Math.round((60 / bpmBase) * 1000 + (Math.random() - 0.5) * 40);
          const updated = [...prev, intervalMs];
          // Keep last 40 beats for statistical calculations
          return updated.slice(-40);
        });
      }
    }, 80);

    return () => clearInterval(streamTimer);
  }, [isFilterActive, filterToggles, currentPatient]);

  // Recalculate HRV parameters every 2 seconds based on accumulated R-R intervals
  useEffect(() => {
    const hrvTimer = setInterval(() => {
      if (rrIntervals.length > 5) {
        const metrics = calculateHRV(rrIntervals);
        setHrvMetrics(metrics);
      }
    }, 2000);
    
    return () => clearInterval(hrvTimer);
  }, [rrIntervals]);

  // SILENCE ALARM FUNCTION
  const silenceAlarm = () => {
    setAlarmActive(false);
    addAuditLog(`Attending clinician silenced audio alarm for Patient ${currentPatient.name}.`);
  };

  const triggerAlarmManually = () => {
    setAlarmActive(true);
    addAuditLog(`ALARM TEST: Clinician triggered manual monitor alarm sequence.`);
  };

  // Nav menu list
  const menuItems = [
    { id: 'home', label: 'Ward Overview', icon: Activity, desc: 'ICU Monitor Wallboard' },
    { id: 'acquisition', label: 'Telemetry Acquisition', icon: Sliders, desc: 'Live Canvas Feed' },
    { id: 'processing', label: 'DSP Lab', icon: Cpu, desc: 'Filter Pipelines' },
    { id: 'analysis', label: 'Morphology Center', icon: Activity, desc: 'ST & Segment Timings' },
    { id: 'hrv', label: 'HRV Analytics', icon: Brain, desc: 'Autonomic Research' },
    { id: 'ai', label: 'AI Diagnostic', icon: Zap, desc: 'ResNet Classifier' },
    { id: 'patients', label: 'EMR Registry', icon: User, desc: 'Patient Database' },
    { id: 'reports', label: 'Report Suite', icon: FileText, desc: 'Printable EMR PDFs' },
    { id: 'alarms', label: 'Emergency alarms', icon: AlertTriangle, desc: 'Audible Synthesizer' },
    { id: 'enterprise', label: 'Cloud Fleet', icon: Database, desc: 'HIPAA Logs & Devices' },
    { id: 'advanced', label: 'Digital Twin', icon: Link2, desc: 'Interoperability DICOM' }
  ];

  return (
    <div className={`hospital-layout ${theme === 'light' ? 'light-theme' : ''}`}>
      
      {/* 1. LEFT SIDEBAR: Hospital Navigation */}
      <aside className="no-print" style={{ 
        background: 'var(--bg-secondary)', 
        borderRight: '1px solid var(--card-border)', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px 14px' 
      }}>
        {/* Hospital Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', padding: '0 6px' }}>
          <Heart size={28} className="text-critical heart-icon-pulsing" />
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-primary)', margin: 0 }}>
              MOUNT SINAI
            </h2>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              ICU Telemetry Hub
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  addAuditLog(`Navigated to dashboard node: ${item.label}`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: activeTab === item.id ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
                  border: 'none',
                  color: activeTab === item.id ? 'var(--color-ecg)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} className={activeTab === item.id ? 'text-ecg' : 'text-secondary'} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Theme switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clinical Theme:</span>
            <button 
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                addAuditLog(`Clinical theme changed to ${theme === 'dark' ? 'LIGHT' : 'DARK'}.`);
              }}
              style={{
                padding: '4px 10px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                borderRadius: '4px',
                border: '1px solid var(--card-border)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {theme === 'dark' ? 'GE LIGHT' : 'PHILIPS DARK'}
            </button>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            Ver v4.8.1-BETA
          </div>
        </div>
      </aside>

      {/* 2. MAIN HUB INTERFACE */}
      <main style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-primary)' }}>
        
        {/* Hub Header Navbar */}
        <header className="no-print" style={{ 
          background: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--card-border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '12px 24px',
          zIndex: 10
        }}>
          {/* Left demographic quick select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Active Patient:
            </div>
            
            <div style={{ position: 'relative' }}>
              <select 
                value={currentPatient.id} 
                onChange={(e) => {
                  const patient = patients.find(p => p.id === Number(e.target.value));
                  if (patient) setCurrentPatient(patient);
                }}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  padding: '6px 28px 6px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.pathology})
                  </option>
                ))}
              </select>
              <div style={{ pointerEvents: 'none', position: 'absolute', right: '10px', top: '10px', width: '0', height: '0', borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid var(--text-primary)' }} />
            </div>

            <div style={{ fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Bed: <strong>{currentPatient.bed}</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-secondary)' }}>Room: <strong>{currentPatient.room}</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-secondary)' }}>MRN: <strong style={{ fontFamily: 'var(--font-mono)' }}>{currentPatient.mrn}</strong></span>
            </div>
          </div>

          {/* Right Clock and alarms notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {systemTime}
            </span>

            {/* Notification alert buzzer */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveTab('alarms')}>
              <Bell size={20} className={alarmActive ? 'text-critical heart-icon-pulsing' : 'text-secondary'} />
              {alarmActive && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#FF1744', borderRadius: '50%' }} />
              )}
            </div>
          </div>
        </header>

        {/* Tab Router Output */}
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* HOME TAB: Starting / Main Dashboard */}
          {activeTab === 'home' && (
            <>
              {/* HERO SECTION */}
              <div className="medical-card card-ecg" style={{ background: 'linear-gradient(135deg, rgba(9,13,22,0.9) 0%, rgba(21,31,50,0.5) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>
                      Hospital Telemetry Surveillance Board
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
                      Bedside ECG and HRV parameters mapped in real-time. Continuous clinical deep neural networking scanning leads for arrhythmias.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => {
                        setActiveTab('acquisition');
                        addAuditLog(`Quick accessed live monitor scope.`);
                      }}
                      className="btn-clinical active"
                    >
                      Open Live Scope
                    </button>
                  </div>
                </div>
              </div>

              {/* DYNAMIC CARDIO KPI CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {/* 1. Heart Rate */}
                <div className="medical-card card-ecg">
                  <div className="vital-display">
                    <div className="vital-header">
                      <span className="vital-title">Heart Rate (HR)</span>
                      <Heart className={alarmActive ? 'text-critical heart-icon-pulsing' : 'text-stable heart-icon-pulsing'} size={18} />
                    </div>
                    <div className="vital-value-container">
                      <span className="vital-value" style={{ color: currentPatient.priority === 'CRITICAL' ? 'var(--color-critical)' : 'var(--color-ecg)' }}>
                        {hrvMetrics.timeDomain.meanHR}
                      </span>
                      <span className="vital-unit">BPM</span>
                    </div>
                    <span className="vital-trend text-stable">Nominal Limits: 60 - 100</span>
                  </div>
                </div>

                {/* 2. HRV Score (RMSSD) */}
                <div className="medical-card card-analysis">
                  <div className="vital-display">
                    <div className="vital-header">
                      <span className="vital-title">Vagal Tone (RMSSD)</span>
                      <Brain className="text-analysis" size={18} />
                    </div>
                    <div className="vital-value-container">
                      <span className="vital-value text-analysis">
                        {hrvMetrics.timeDomain.rmssd}
                      </span>
                      <span className="vital-unit">ms</span>
                    </div>
                    <span className="vital-trend" style={{ color: hrvMetrics.timeDomain.rmssd < 25 ? 'var(--color-critical)' : 'var(--color-ecg)' }}>
                      {hrvMetrics.timeDomain.rmssd < 25 ? 'Low (Depressed Tone)' : 'Optimal Autonomic'}
                    </span>
                  </div>
                </div>

                {/* 3. Baevsky Stress Index */}
                <div className="medical-card card-warning">
                  <div className="vital-display">
                    <div className="vital-header">
                      <span className="vital-title">Autonomic Stress Index</span>
                      <Sliders className="text-warning" size={18} />
                    </div>
                    <div className="vital-value-container">
                      <span className="vital-value text-warning">
                        {hrvMetrics.clinical.stressIndex}
                      </span>
                      <span className="vital-unit">SI</span>
                    </div>
                    <span className="vital-trend" style={{ color: hrvMetrics.clinical.stressIndex > 150 ? 'var(--color-critical)' : 'var(--color-ecg)' }}>
                      {hrvMetrics.clinical.stressIndex > 150 ? 'Severe sympathetic stress' : 'Balanced homeostasis'}
                    </span>
                  </div>
                </div>

                {/* 4. AI Arrhythmia Risk */}
                <div className="medical-card card-ai">
                  <div className="vital-display">
                    <div className="vital-header">
                      <span className="vital-title">AI Arrhythmia Risk</span>
                      <Zap className="text-ai" size={18} />
                    </div>
                    <div className="vital-value-container">
                      <span className="vital-value text-ai">
                        {currentPatient.priority === 'CRITICAL' ? '98.4%' : currentPatient.priority === 'WARNING' ? '64.2%' : '8.6%'}
                      </span>
                      <span className="vital-unit">prob</span>
                    </div>
                    <span className="vital-trend text-ai">ResNet-1D Classifier</span>
                  </div>
                </div>
              </div>

              {/* SECOND ROW: Mini-Monitor Canvas & Patient queue sidebar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                
                {/* ICU Style monitor preview */}
                <div className="medical-card card-ecg" style={{ display: 'flex', flexDirection: 'column', height: '390px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Real-Time Scope (Lead II)</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto filter Notch 50Hz</span>
                  </div>
                  
                  <div style={{ flex: 1, position: 'relative' }}>
                    <canvas 
                      ref={notchFilterRef.current ? null : null /* Reference managed inside LiveECGViewer */}
                      style={{ display: 'none' }}
                    />
                    <LiveECGViewer 
                      currentPatient={currentPatient}
                      currentLead={currentLead}
                      setCurrentLead={setCurrentLead}
                      pathology={currentPatient.pathology}
                      rawSamples={rawSamples}
                      filteredSamples={filteredSamples}
                      isFilterActive={isFilterActive}
                      isAudioMuted={isAudioMuted}
                      alarmActive={alarmActive}
                      triggerAlarm={triggerAlarmManually}
                      resetAlarm={silenceAlarm}
                    />
                  </div>
                </div>

                {/* Clinical activity, queue summary & recommendations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Queue widget */}
                  <div className="medical-card card-warning" style={{ flex: 1.2 }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Urgent Patient Triage Queue
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {patients.map(pat => (
                        <div 
                          key={pat.id} 
                          onClick={() => setCurrentPatient(pat)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: pat.id === currentPatient.id ? 'rgba(255,255,255,0.06)' : 'var(--bg-tertiary)',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            borderLeft: pat.priority === 'CRITICAL' ? '3px solid var(--color-critical)' : pat.priority === 'WARNING' ? '3px solid var(--color-warning)' : '3px solid var(--color-stable)',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{ fontWeight: 'bold' }}>{pat.name} (Rm {pat.room})</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{pat.pathology}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor recommendation */}
                  <div className="medical-card card-ai" style={{ flex: 0.8 }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '6px', color: 'var(--color-ai)' }}>
                      Physician Dashboard Memo
                    </h3>
                    <p style={{ fontSize: '0.78rem', lineHeight: '1.45', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                      "{currentPatient.notes}"
                    </p>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ACQUISITION TAB */}
          {activeTab === 'acquisition' && (
            <LiveECGViewer 
              currentPatient={currentPatient}
              currentLead={currentLead}
              setCurrentLead={setCurrentLead}
              pathology={currentPatient.pathology}
              setPathology={(p) => {
                const updated = {...currentPatient, pathology: p};
                setCurrentPatient(updated);
              }}
              rawSamples={rawSamples}
              filteredSamples={filteredSamples}
              isFilterActive={isFilterActive}
              isAudioMuted={isAudioMuted}
              alarmActive={alarmActive}
              triggerAlarm={triggerAlarmManually}
              resetAlarm={silenceAlarm}
            />
          )}

          {/* PROCESSING TAB */}
          {activeTab === 'processing' && (
            <SignalProcessingLab 
              rawSamples={rawSamples}
              filteredSamples={filteredSamples}
              isFilterActive={isFilterActive}
              setIsFilterActive={setIsFilterActive}
              filterToggles={filterToggles}
              setFilterToggles={setFilterToggles}
            />
          )}

          {/* ANALYSIS TAB */}
          {activeTab === 'analysis' && (
            <ECGAnalysisCenter 
              pathology={currentPatient.pathology}
              currentLead={currentLead}
              rawSamples={rawSamples}
              filteredSamples={filteredSamples}
            />
          )}

          {/* HRV TAB */}
          {activeTab === 'hrv' && (
            <HRVAnalysisCenter 
              hrvMetrics={hrvMetrics}
              pathology={currentPatient.pathology}
            />
          )}

          {/* AI TAB */}
          {activeTab === 'ai' && (
            <AIDiagnosticCenter 
              pathology={currentPatient.pathology}
              currentPatient={currentPatient}
              hrvMetrics={hrvMetrics}
            />
          )}

          {/* PATIENTS TAB */}
          {activeTab === 'patients' && (
            <PatientManagement 
              patients={patients}
              currentPatient={currentPatient}
              setCurrentPatient={setCurrentPatient}
            />
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <ReportGenerator 
              currentPatient={currentPatient}
              hrvMetrics={hrvMetrics}
              pathology={currentPatient.pathology}
              currentLead={currentLead}
            />
          )}

          {/* ALARMS TAB */}
          {activeTab === 'alarms' && (
            <EmergencySystem 
              pathology={currentPatient.pathology}
              alarmActive={alarmActive}
              triggerAlarm={triggerAlarmManually}
              resetAlarm={silenceAlarm}
              isAudioMuted={isAudioMuted}
              setIsAudioMuted={setIsAudioMuted}
            />
          )}

          {/* ENTERPRISE TAB */}
          {activeTab === 'enterprise' && (
            <EnterpriseCloud 
              currentPatient={currentPatient}
              auditLogs={auditLogs}
              pathology={currentPatient.pathology}
            />
          )}

          {/* ADVANCED TAB */}
          {activeTab === 'advanced' && (
            <AdvancedIndustrial 
              hrvMetrics={hrvMetrics}
              currentPatient={currentPatient}
              pathology={currentPatient.pathology}
            />
          )}

        </div>
      </main>
      
      {/* 3. EXPERT REPORT SHEET (OUTSIDE OF LAYOUT CONTROLS FOR PRINT ONLY) */}
      <div className="report-print-target print-only" style={{ display: 'none' }}>
        <ReportGenerator 
          currentPatient={currentPatient}
          hrvMetrics={hrvMetrics}
          pathology={currentPatient.pathology}
          currentLead={currentLead}
        />
      </div>

    </div>
  );
}
