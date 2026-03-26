let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

export function playTone(value: number, maxValue: number, action: string): void {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    // Map value to frequency: 200Hz – 1200Hz
    const freq = 200 + (value / maxValue) * 1000;
    osc.frequency.setValueAtTime(freq, ac.currentTime);

    // Waveform by action type
    osc.type = action === "swap" ? "sawtooth"
      : action === "pivot" ? "square"
      : action === "merge" ? "sine"
      : "triangle";

    const vol = action === "swap" ? 0.06 : 0.04;
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);

    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.08);
  } catch {
    // AudioContext may not be available
  }
}

export function playCompare(f1: number, f2: number): void {
  try {
    const ac = getCtx();
    [f1, f2].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.setValueAtTime(freq, ac.currentTime + i * 0.04);
      osc.type = "sine";
      gain.gain.setValueAtTime(0.03, ac.currentTime + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.04 + 0.06);
      osc.start(ac.currentTime + i * 0.04);
      osc.stop(ac.currentTime + i * 0.04 + 0.06);
    });
  } catch {}
}

export function playSuccess(): void {
  try {
    const ac = getCtx();
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.setValueAtTime(freq, ac.currentTime + i * 0.12);
      osc.type = "sine";
      gain.gain.setValueAtTime(0.1, ac.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.12 + 0.3);
      osc.start(ac.currentTime + i * 0.12);
      osc.stop(ac.currentTime + i * 0.12 + 0.3);
    });
  } catch {}
}
