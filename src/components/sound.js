// Buzzer sounds, like the ESP32's: short square-wave blips. Off until the speaker in
// the menu bar is switched on, and then only for what you do (opening and closing
// windows, pressing buttons). Needs a tap to start, which the speaker button is.
export const BLIPS = {
  tap: [[880, 35]],
  open: [
    [660, 45],
    [990, 60],
  ],
  close: [
    [990, 45],
    [660, 60],
  ],
  chime: [
    [523, 90],
    [659, 90],
    [784, 90],
    [1047, 160],
  ],
  led: [
    [1320, 30],
    [1760, 40],
  ],
};

let context = null;
let on = false;

export function play(name) {
  if (!on || !context) return;
  let at = context.currentTime;
  for (const [hz, ms] of BLIPS[name] ?? []) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "square";
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.06, at + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + ms / 1000);
    osc.connect(gain).connect(context.destination);
    osc.start(at);
    osc.stop(at + ms / 1000 + 0.02);
    at += ms / 1000;
  }
}

export function setSound(enabled) {
  if (enabled) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return false;
    context ??= new Ctor();
    context.resume?.();
    on = true;
    play("chime");
  } else {
    on = false;
  }
  return on;
}

// What a press means, by what was pressed.
export function soundFor(target) {
  if (target.closest?.(".light.red")) return "close";
  if (target.closest?.(".icon, .work-tile, .field-art-card")) return "open";
  if (target.closest?.(".push, .chip, .hero-chip, .light")) return "tap";
  return null;
}
