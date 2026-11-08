// The timing leak, from the lab's design: the vulnerable comparison returns on
// the first wrong byte and sleeps `delay` after every matching one, so the
// response time climbs one step per matching byte of a 4-byte secret. The
// constant-time comparison checks every byte, so the steps vanish.
export const SECRET_BYTES = 4;
export const DELAY_MS = 1; // the lab's default

// Response time for 0..4 matching bytes (milliseconds above a base of 0).
export function stairs(fixed) {
  return Array.from({ length: SECRET_BYTES + 1 }, (_, k) =>
    fixed ? 0 : k * DELAY_MS,
  );
}

// A little repeatable jitter so the bars look like measurements, not rulers.
export function jitter(index, time, amount = 0.05) {
  return (
    amount * Math.sin(time * 3.1 + index * 2.3) * Math.cos(time * 1.7 + index)
  );
}
