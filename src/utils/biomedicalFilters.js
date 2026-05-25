/**
 * Biomedical Signal Processing Utilities
 * Includes Notch filters, Low-pass, High-pass, Savitzky-Golay, Wavelets, and FFT.
 */

// 1. Digital IIR Notch Filter (attenuates 50Hz or 60Hz hum)
// y[n] = b0*x[n] + b1*x[n-1] + b2*x[n-2] - a1*y[n-1] - a2*y[n-2]
export class NotchFilter {
  constructor(frequency = 50, sampleRate = 250, q = 20) {
    this.x1 = 0; this.x2 = 0;
    this.y1 = 0; this.y2 = 0;
    this.setParams(frequency, sampleRate, q);
  }

  setParams(frequency, sampleRate, q) {
    const w0 = (2 * Math.PI * frequency) / sampleRate;
    const alpha = Math.sin(w0) / (2 * q);
    
    this.b0 = 1;
    this.b1 = -2 * Math.cos(w0);
    this.b2 = 1;
    this.a0 = 1 + alpha;
    this.a1 = -2 * Math.cos(w0);
    this.a2 = 1 - alpha;

    // Normalize coefficients
    this.b0 /= this.a0;
    this.b1 /= this.a0;
    this.b2 /= this.a0;
    this.a1 /= this.a0;
    this.a2 /= this.a0;
  }

  filter(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

// 2. High-pass Filter (removes baseline wander, cutoff ~0.5Hz)
// First-order high-pass filter
export class HighPassFilter {
  constructor(cutoff = 0.5, sampleRate = 250) {
    this.x1 = 0;
    this.y1 = 0;
    this.setParams(cutoff, sampleRate);
  }

  setParams(cutoff, sampleRate) {
    const rc = 1 / (2 * Math.PI * cutoff);
    const dt = 1 / sampleRate;
    this.alpha = rc / (rc + dt);
  }

  filter(x) {
    const y = this.alpha * (this.y1 + x - this.x1);
    this.x1 = x;
    this.y1 = y;
    return y;
  }
}

// 3. Low-pass Filter (removes high-frequency muscle artifacts, cutoff ~40Hz)
// First-order low-pass filter
export class LowPassFilter {
  constructor(cutoff = 40, sampleRate = 250) {
    this.y1 = 0;
    this.setParams(cutoff, sampleRate);
  }

  setParams(cutoff, sampleRate) {
    const rc = 1 / (2 * Math.PI * cutoff);
    const dt = 1 / sampleRate;
    this.alpha = dt / (rc + dt);
  }

  filter(x) {
    const y = this.alpha * x + (1 - this.alpha) * this.y1;
    this.y1 = y;
    return y;
  }
}

// 4. Savitzky-Golay Filter (smooths signals using local polynomials)
// 5-point causal Savitzky-Golay approximation
export class SavitzkyGolayFilter {
  constructor() {
    this.buffer = [0, 0, 0, 0, 0];
  }

  filter(x) {
    this.buffer.shift();
    this.buffer.push(x);
    
    // Savitzky-Golay 5-point smoothing coefficients (quadratic fit)
    // Causal approximation using moving polynomial weights
    const val = (
      -3 * this.buffer[0] +
      12 * this.buffer[1] +
      17 * this.buffer[2] +
      12 * this.buffer[3] -
      3 * this.buffer[4]
    ) / 35;
    
    return val;
  }
}

// 5. Radix-2 Cooley-Tukey Fast Fourier Transform (FFT)
// Expects input array of size N (power of 2)
export function fft(realInput) {
  const N = realInput.length;
  if (N <= 1) return realInput.map(v => ({ re: v, im: 0 }));

  // Bit reversal sorting
  const out = new Array(N);
  for (let i = 0; i < N; i++) {
    out[i] = { re: realInput[i], im: 0 };
  }

  let limit = 1;
  const bitLength = Math.log2(N);
  
  for (let i = 0; i < N; i++) {
    let rev = 0;
    let temp = i;
    for (let j = 0; j < bitLength; j++) {
      rev = (rev << 1) | (temp & 1);
      temp >>= 1;
    }
    if (rev > i) {
      const t = out[i];
      out[i] = out[rev];
      out[rev] = t;
    }
  }

  // Cooley-Tukey Radix-2 FFT
  for (let len = 2; len <= N; len <<= 1) {
    const angle = (2 * Math.PI) / len;
    const wlen = { re: Math.cos(angle), im: -Math.sin(angle) };
    
    for (let i = 0; i < N; i += len) {
      let w = { re: 1, im: 0 };
      for (let j = 0; j < len / 2; j++) {
        const u = out[i + j];
        const idx = i + j + len / 2;
        
        // Complex multiplication: w * out[idx]
        const re = w.re * out[idx].re - w.im * out[idx].im;
        const im = w.re * out[idx].im + w.im * out[idx].re;
        const t = { re, im };
        
        out[idx] = { re: u.re - t.re, im: u.im - t.im };
        out[i + j] = { re: u.re + t.re, im: u.im + t.im };
        
        // Increment twiddle factor: w = w * wlen
        const nextRe = w.re * wlen.re - w.im * wlen.im;
        const nextIm = w.re * wlen.im + w.im * wlen.re;
        w = { re: nextRe, im: nextIm };
      }
    }
  }

  // Return magnitude spectrum
  return out.map((c, i) => {
    const magnitude = Math.sqrt(c.re * c.re + c.im * c.im);
    return {
      frequency: i,
      magnitude: magnitude / (N / 2), // Normalized
      re: c.re,
      im: c.im
    };
  });
}

// 6. Discrete Haar Wavelet Decomposition (DWT)
// Simulates discrete decomposition of a buffer into approximation (A) and detail (D) channels
export function waveletDecompose(signal) {
  const N = signal.length;
  const approximation = [];
  const detail = [];
  
  // Single-level Haar Wavelet Transform
  const half = Math.floor(N / 2);
  for (let i = 0; i < half; i++) {
    const s0 = signal[2 * i] || 0;
    const s1 = signal[2 * i + 1] || 0;
    
    // Low-pass filter (approximation)
    approximation.push((s0 + s1) / Math.SQRT2);
    // High-pass filter (details)
    detail.push((s0 - s1) / Math.SQRT2);
  }
  
  return { A: approximation, D: detail };
}
