import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Volume2, VolumeX, AlertTriangle, Check } from './Icons';

export default function EmergencySystem({
  pathology,
  alarmActive,
  triggerAlarm,
  resetAlarm,
  isAudioMuted,
  setIsAudioMuted
}) {
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const intervalIdRef = useRef(null);

  const [escalationTime, setEscalationTime] = useState(30);
  const [escalated, setEscalated] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState(0);

  // Countdown timer for escalation
  useEffect(() => {
    let timer;
    if (alarmActive && !escalated) {
      timer = setInterval(() => {
        setEscalationTime(prev => {
          if (prev <= 1) {
            setEscalated(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!alarmActive) {
      setEscalationTime(30);
      setEscalated(false);
    }
    return () => clearInterval(timer);
  }, [alarmActive, escalated]);

  // Audio Synthesizer Loop (Web Audio API)
  // Synthesizes clinical beeps for high-priority physiological alarms (IEC 60601-1-8 standard: beep-beep-beep)
  useEffect(() => {
    if (alarmActive && !isAudioMuted && silenceCountdown === 0) {
      startSynth();
    } else {
      stopSynth();
    }

    return () => stopSynth();
  }, [alarmActive, isAudioMuted, silenceCountdown]);

  // Silence timer countdown
  useEffect(() => {
    let timer;
    if (silenceCountdown > 0) {
      timer = setInterval(() => {
        setSilenceCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [silenceCountdown]);

  const startSynth = () => {
    try {
      if (audioCtxRef.current) return; // Already running

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, ctx.currentTime); // Standard high pitch alarm hum (950Hz)

      gain.gain.setValueAtTime(0, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;

      // Beep cycle: beep beep beep ... beep beep
      let beepState = false;
      let tick = 0;
      
      intervalIdRef.current = setInterval(() => {
        if (!gainNodeRef.current || !audioCtxRef.current) return;
        const curTime = audioCtxRef.current.currentTime;
        
        // High priority pattern: 3 rapid beeps, brief pause
        tick = (tick + 1) % 8;
        if (tick === 0 || tick === 2 || tick === 4) {
          // Play beep
          gainNodeRef.current.gain.setValueAtTime(0.25, curTime);
          gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, curTime + 0.15);
        }
      }, 200);

    } catch (e) {
      console.warn("Web Audio API not supported or blocked by browser gesture: ", e);
    }
  };

  const stopSynth = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    gainNodeRef.current = null;
  };

  const handleSilenceAlarm = () => {
    setSilenceCountdown(120); // 120 seconds clinical silence countdown
    stopSynth();
  };

  const handleAcknowledge = () => {
    resetAlarm();
    setSilenceCountdown(0);
    stopSynth();
  };

  return (
    <div className="medical-card card-critical" style={{ gridColumn: 'span 12' }}>
      <div className="vital-header" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert className="text-critical" size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Emergency Alarm Dispatch & ICU Wallboard Control</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Bedside vital surveillance node (compliance standard: IEC 60601-1-8)
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* Left Side: Alarm display status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {alarmActive ? (
            <div className="red-alert-flashing" style={{
              background: 'rgba(255, 23, 68, 0.15)',
              border: '2px dashed #FF1744',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <AlertTriangle className="text-critical" size={36} />
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FF1744' }}>
                  CRITICAL: {pathology === 'VTach' ? 'VENTRICULAR TACHYCARDIA DETECTED' : 'UNSTABLE CARDIAC ARRYTHMIA'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                  Attending patient in Room 402 Bed B. High risk of cardiovascular emergency.
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(0, 230, 118, 0.08)',
              border: '1px solid var(--color-ecg)',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 230, 118, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check className="text-stable" size={24} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-ecg)' }}>
                SURVEILLANCE MODE NOMINAL
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Vital limits are completely within patient physiological threshold boundaries.
              </p>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleAcknowledge}
              className="btn-clinical"
              style={{ flex: 1.5, justifyContent: 'center', fontWeight: 'bold', border: '1px solid var(--color-ecg)', color: 'var(--color-ecg)' }}
            >
              Reset & Acknowledge Alarm
            </button>
            
            <button 
              onClick={handleSilenceAlarm}
              disabled={!alarmActive || silenceCountdown > 0}
              className="btn-clinical"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
            >
              {silenceCountdown > 0 ? `Silenced (${silenceCountdown}s)` : 'Silence Audio'}
            </button>
            
            <button 
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="btn-clinical"
              style={{ flex: 0.5, padding: '8px', justifyContent: 'center' }}
            >
              {isAudioMuted ? <VolumeX size={18} className="text-critical" /> : <Volume2 size={18} className="text-stable" />}
            </button>
          </div>
        </div>

        {/* Right Side: Escalation Simulation */}
        <div className="medical-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
            Telemetry Escalation Chain
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '4px' }}>
              <span>Triage Priority:</span>
              <span style={{ color: alarmActive ? '#FF1744' : 'var(--color-ecg)', fontWeight: 'bold' }}>
                {alarmActive ? 'LEVEL 1 (IMMEDIATE)' : 'LEVEL 4 (ROUTINE)'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '4px' }}>
              <span>Auto-Escalate Timer:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{escalated ? 'TRIGGERED' : `${escalationTime}s remaining`}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>ESCALATION STEPS:</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: alarmActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                <span className="status-glow" style={{ color: alarmActive ? 'var(--color-critical)' : 'var(--text-muted)', width: '6px', height: '6px' }} />
                <span>1. Bedside acoustic synthesis (Active)</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: (alarmActive && escalated) ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                <span className="status-glow" style={{ color: (alarmActive && escalated) ? 'var(--color-critical)' : 'var(--text-muted)', width: '6px', height: '6px' }} />
                <span>2. Ward Pager Alert (Code Blue Triage Team)</span>
              </div>
            </div>

            {escalated && (
              <div style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255,23,68,0.2)', padding: '6px', borderRadius: '4px', color: '#FF1744', textAlign: 'center', fontSize: '0.7rem', fontWeight: 'bold', marginTop: 'auto' }}>
                ALERT: CODE BLUE TEAM DISPATCHED VIA TELEMETRY PAGERS
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
