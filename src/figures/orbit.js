// Drag to turn a figure. The yaw is unlimited, so a figure can be turned all the
// way round; the pitch stops short of upside down. After a flick it coasts to a
// halt. Pure state, so it can be tested without a browser.
export const PITCH_LIMIT = 1.25;

export function createOrbit() {
  return { yaw: 0, pitch: 0, vyaw: 0, vpitch: 0, dragging: false };
}

export function dragOrbit(orbit, dx, dy, dt = 0.016) {
  const yaw = dx * 0.011;
  const pitch = dy * 0.008;
  orbit.yaw += yaw;
  orbit.pitch = clampPitch(orbit.pitch + pitch);
  const k = Math.max(dt, 0.001);
  orbit.vyaw = yaw / k;
  orbit.vpitch = pitch / k;
}

// Coasting and settling. Returns true while anything is still moving.
export function stepOrbit(orbit, dt) {
  if (orbit.dragging) return true;
  const decay = Math.exp(-3.2 * dt);
  orbit.vyaw *= decay;
  orbit.vpitch *= decay;
  orbit.yaw += orbit.vyaw * dt;
  orbit.pitch = clampPitch(orbit.pitch + orbit.vpitch * dt);
  if (Math.abs(orbit.vyaw) < 0.01) orbit.vyaw = 0;
  if (Math.abs(orbit.vpitch) < 0.01) orbit.vpitch = 0;
  return orbit.vyaw !== 0 || orbit.vpitch !== 0;
}

export function clampPitch(pitch) {
  return Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
}
