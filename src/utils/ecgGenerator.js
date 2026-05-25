/**
 * Biomedical ECG Waveform Generator
 * Uses Gaussian mathematical modeling to simulate realistic P, Q, R, S, T wave components.
 * Supports multi-lead generation and common clinical cardiac pathologies.
 */

// Gaussian pulse helper
function gaussian(x, a, mu, w) {
  return a * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(w, 2)));
}

// Wave parameters for different leads
// Projections of the heart's electrical vector onto the lead axes
const LEAD_MULTIPLIERS = {
  'I':   { p: 1.0,  q: 0.5,  r: 0.8,  s: 0.5,  t: 0.8 },
  'II':  { p: 1.2,  q: 1.0,  r: 1.2,  s: 0.8,  t: 1.0 }, // Standard lead
  'III': { p: 0.5,  q: 0.8,  r: 0.4,  s: 0.6,  t: 0.4 },
  'aVR': { p: -1.0, q: -0.8, r: -1.0, s: -0.8, t: -0.9 }, // Completely inverted
  'aVL': { p: 0.4,  q: -0.2, r: 0.5,  s: -0.2, t: 0.4 },
  'aVF': { p: 0.9,  q: 0.8,  r: 0.9,  s: 0.7,  t: 0.8 },
  'V1':  { p: -0.3, q: 0.2,  r: 0.2,  s: 1.5,  t: -0.3 }, // Deep S wave
  'V2':  { p: -0.2, q: 0.3,  r: 0.4,  s: 1.8,  t: -0.2 },
  'V3':  { p: 0.3,  q: 0.4,  r: 0.8,  s: 1.2,  t: 0.4 },
  'V4':  { p: 0.8,  q: 0.5,  r: 1.1,  s: 0.7,  t: 0.7 },
  'V5':  { p: 1.0,  q: 0.5,  r: 1.0,  s: 0.3,  t: 0.8 },
  'V6':  { p: 0.9,  q: 0.4,  r: 0.9,  s: 0.2,  t: 0.8 }
};

export class ECGGenerator {
  constructor(sampleRate = 250) {
    this.sampleRate = sampleRate; // Hz (samples per second)
    this.time = 0; // seconds
    this.lastRTime = 0;
    this.nextInterval = 0.8; // seconds for NSR (75 bpm)
    this.pathology = 'NSR';
    this.currentLead = 'II';
    
    // Noise toggles
    this.noiseLineHum = false;      // 50Hz/60Hz powerline hum
    this.noiseBaselineDrift = false; // Low freq breathing drift
    this.noiseMuscle = false;        // Muscle tremor noise
    
    // AFib f-wave phase
    this.afibPhase = 0;
    
    // Heart rate tracking
    this.bpm = 75;
    
    this.initNextBeat();
  }

  setPathology(pathology) {
    this.pathology = pathology;
    if (pathology === 'NSR') {
      this.bpm = 75;
    } else if (pathology === 'Bradycardia') {
      this.bpm = 45;
    } else if (pathology === 'Tachycardia') {
      this.bpm = 125;
    } else if (pathology === 'VTach') {
      this.bpm = 160;
    } else if (pathology === 'AFib') {
      this.bpm = 100; // Will vary beat-to-beat
    }
    this.initNextBeat();
  }

  setLead(lead) {
    if (LEAD_MULTIPLIERS[lead]) {
      this.currentLead = lead;
    }
  }

  setNoise(type, enabled) {
    if (type === 'hum') this.noiseLineHum = enabled;
    if (type === 'drift') this.noiseBaselineDrift = enabled;
    if (type === 'muscle') this.noiseMuscle = enabled;
  }

  initNextBeat() {
    let meanBpm = this.bpm;
    let interval = 60 / meanBpm;
    
    if (this.pathology === 'AFib') {
      // AFib has irregularly irregular intervals (rhythm is random)
      // Vary bpm between 70 and 150 dynamically
      const afibBpm = 75 + Math.random() * 65;
      interval = 60 / afibBpm;
    } else if (this.pathology === 'NSR' || this.pathology === 'Bradycardia' || this.pathology === 'Tachycardia') {
      // Add slight physiological sinus arrhythmia (respiratory variation, ~2-3% variation)
      const variation = (Math.random() - 0.5) * 0.05 * interval;
      interval += variation;
    }
    
    this.nextInterval = interval;
  }

  getNextSample() {
    const dt = 1 / this.sampleRate;
    this.time += dt;
    
    let timeInBeat = this.time - this.lastRTime;
    
    // Trigger next beat
    if (timeInBeat >= this.nextInterval) {
      this.lastRTime = this.time;
      timeInBeat = 0;
      this.initNextBeat();
    }
    
    let value = 0;
    const lead = LEAD_MULTIPLIERS[this.currentLead] || LEAD_MULTIPLIERS['II'];
    
    // Generate cardiac wave complex based on current pathology
    if (this.pathology === 'VTach') {
      // Ventricular Tachycardia: Wide, bizarre, rapid sine-like complexes
      // Depolarization originates in ventricles, no P waves, wide QRS
      const period = 60 / 160; // ~0.375s
      const phase = (timeInBeat / period) * 2 * Math.PI;
      value = 1.1 * Math.sin(phase) + 0.2 * Math.sin(phase * 2);
      // Wider and smoother
    } else {
      // Standard ECG complex modeling using Gaussian components
      // Shift parameters relative to R peak (t = 0.3s within the beat)
      const rPeakOffset = 0.35; // Position of R peak in beat
      const t = timeInBeat - rPeakOffset; 
      
      // 1. P-Wave (Atrial depolarization)
      let pAmp = 0.16 * lead.p;
      let pWidth = 0.024;
      let pPos = -0.18;
      
      if (this.pathology === 'AFib') {
        // AFib: No coordinate P-wave, instead low-amplitude high-frequency f-waves
        pAmp = 0; 
      }
      const pVal = gaussian(t, pAmp, pPos, pWidth);
      
      // 2. PR segment (flat baseline, handled by absence of waves)
      
      // 3. Q-Wave (Initial ventricular depolarization)
      const qAmp = -0.12 * lead.q;
      const qWidth = 0.005;
      const qPos = -0.025;
      const qVal = gaussian(t, qAmp, qPos, qWidth);
      
      // 4. R-Wave (Main ventricular depolarization)
      let rAmp = 1.2 * lead.r;
      let rWidth = 0.009;
      // PVC (Premature Ventricular Contraction) simulation:
      // Occasional early beat, large wide QRS, inverted T
      let isPVC = false;
      if (this.pathology === 'PVC' && Math.random() < 0.002) {
        isPVC = true;
      }
      
      if (isPVC) {
        rAmp = -1.5; // Large inverted QRS
        rWidth = 0.035; // Very wide
      }
      const rVal = gaussian(t, rAmp, 0, rWidth);
      
      // 5. S-Wave (Late ventricular depolarization)
      const sAmp = -0.28 * lead.s;
      const sWidth = 0.009;
      const sPos = 0.03;
      const sVal = gaussian(t, sAmp, sPos, sWidth);
      
      // 6. ST-Segment (flat baseline)
      
      // 7. T-Wave (Ventricular repolarization)
      let tAmp = 0.25 * lead.t;
      let tWidth = 0.045;
      let tPos = 0.22;
      
      if (isPVC) {
        tAmp = 0.6; // Large upright T-wave following inverted QRS
        tPos = 0.25;
      }
      const tVal = gaussian(t, tAmp, tPos, tWidth);
      
      value = pVal + qVal + rVal + sVal + tVal;
      
      // If AFib, overlay high-frequency f-waves (atrial fibrillation waves at ~6-8 Hz)
      if (this.pathology === 'AFib') {
        this.afibPhase += 0.18;
        const fWave = 0.06 * Math.sin(this.afibPhase) * Math.sin(this.afibPhase * 0.3) + (Math.random() - 0.5) * 0.04;
        value += fWave;
      }
    }
    
    // Save physiological signal before adding environmental interference
    const physiologicalVal = value;
    
    // Apply environmental interference / noise layers
    if (this.noiseLineHum) {
      // 50Hz electrical noise
      value += 0.12 * Math.sin(2 * Math.PI * 50 * this.time);
    }
    
    if (this.noiseBaselineDrift) {
      // Low frequency respiration wander (~0.2 Hz)
      value += 0.35 * Math.sin(2 * Math.PI * 0.25 * this.time);
    }
    
    if (this.noiseMuscle) {
      // High-frequency muscle tremor noise
      value += (Math.random() - 0.5) * 0.18;
    }
    
    return {
      time: this.time,
      physiological: physiologicalVal,
      value: value, // Raw signal with noise
      rPeak: Math.abs(timeInBeat - 0.35) < dt && this.pathology !== 'VTach' // Mark R peak trigger
    };
  }

  // Generate a buffer of samples
  generateBuffer(seconds) {
    const samplesCount = Math.round(seconds * this.sampleRate);
    const buffer = [];
    for (let i = 0; i < samplesCount; i++) {
      buffer.push(this.getNextSample());
    }
    return buffer;
  }
}
