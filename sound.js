// Synthesized locally: no audio downloads or external dependencies.
export function createSounds(enabled = true) {
 let context;
 function unlock() {
  if (!enabled) return;
  try {
   const Audio = window.AudioContext || window.webkitAudioContext;
   if (!Audio) return;
   context ||= new Audio();
   if (context.state === 'suspended') context.resume().catch(() => {});
  } catch { /* Audio may be unavailable; gameplay remains usable. */ }
 }
 function tone(frequency, duration, offset = 0, volume = .12) {
  if (!enabled || !context || context.state !== 'running') return;
  const start = context.currentTime + offset;
  const oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.type = 'sine'; oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + .008);
  gain.gain.exponentialRampToValueAtTime(.001, start + duration);
  oscillator.connect(gain); gain.connect(context.destination);
  oscillator.start(start); oscillator.stop(start + duration + .02);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
 }
 return {
  unlock,
  setEnabled(value) { enabled = value; if (value) unlock(); },
  tap() { tone(620, .055, 0, .045); },
  warning(seconds) { tone(seconds <= 3 ? 1050 : 800, .12); },
  finish() { [660, 880, 1100].forEach((frequency, i) => tone(frequency, .24, i * .23, .16)); }
 };
}
