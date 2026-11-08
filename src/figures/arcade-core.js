// The rules of the desk's Asteroids: one ship, vector rocks that split, waves that
// get busier, three lives. A fixed 20 ms step like the real game, in the browser
// version's 480 x 270 world. Pure and seeded, so it is tested without a screen.
export const WORLD = { w: 480, h: 270 };
export const STEP = 0.02; // seconds: the 20 ms frame of the ESP32 and browser games
export const SIZES = { 3: 22, 2: 13, 1: 7 }; // rock radius by size
export const POINTS = { 3: 20, 2: 50, 1: 100 };
const SHIP_R = 6;

// A small seeded generator (mulberry32): the same seed always plays the same.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const wrap = (v, max) => ((v % max) + max) % max;

function newRock(rand, size, x, y) {
  const angle = rand() * Math.PI * 2;
  const speed = 18 + rand() * 26 + (3 - size) * 14;
  return {
    x: x ?? rand() * WORLD.w,
    y: y ?? rand() * WORLD.h,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
    angle: rand() * 6,
    spin: (rand() - 0.5) * 1.6,
    seed: rand() * 100,
  };
}

function spawnWave(state) {
  const count = 3 + state.wave;
  for (let i = 0; i < count; i++) {
    // Rocks enter from the edges, never on top of the ship.
    const edge = state.rand() < 0.5;
    state.rocks.push(
      newRock(
        state.rand,
        3,
        edge ? (state.rand() < 0.5 ? 0 : WORLD.w) : state.rand() * WORLD.w,
        edge ? state.rand() * WORLD.h : state.rand() < 0.5 ? 0 : WORLD.h,
      ),
    );
  }
}

export function createGame(seed = 1, { attract = false } = {}) {
  const state = {
    rand: rng(seed),
    ship: {
      x: WORLD.w / 2,
      y: WORLD.h / 2,
      vx: 0,
      vy: 0,
      a: -Math.PI / 2,
      cool: 0,
      safe: 2,
    },
    rocks: [],
    shots: [],
    bursts: [],
    score: 0,
    lives: 3,
    wave: 1,
    over: false,
    attract,
    time: 0,
  };
  spawnWave(state);
  return state;
}

// input: { left, right, thrust, fire } booleans.
export function stepGame(state, input = {}, dt = STEP) {
  state.time += dt;
  const ship = state.ship;
  if (!state.over && !state.attract) {
    if (input.left) ship.a -= 4.2 * dt;
    if (input.right) ship.a += 4.2 * dt;
    if (input.thrust) {
      ship.vx += Math.cos(ship.a) * 150 * dt;
      ship.vy += Math.sin(ship.a) * 150 * dt;
    }
    const drag = Math.exp(-0.55 * dt);
    ship.vx *= drag;
    ship.vy *= drag;
    ship.x = wrap(ship.x + ship.vx * dt, WORLD.w);
    ship.y = wrap(ship.y + ship.vy * dt, WORLD.h);
    ship.cool = Math.max(0, ship.cool - dt);
    ship.safe = Math.max(0, ship.safe - dt);
    if (input.fire && ship.cool === 0 && state.shots.length < 4) {
      ship.cool = 0.25;
      state.shots.push({
        x: ship.x + Math.cos(ship.a) * SHIP_R,
        y: ship.y + Math.sin(ship.a) * SHIP_R,
        vx: ship.vx + Math.cos(ship.a) * 260,
        vy: ship.vy + Math.sin(ship.a) * 260,
        life: 1.1,
      });
    }
  }
  for (const r of state.rocks) {
    r.x = wrap(r.x + r.vx * dt, WORLD.w);
    r.y = wrap(r.y + r.vy * dt, WORLD.h);
    r.angle += r.spin * dt;
  }
  for (const s of state.shots) {
    s.x = wrap(s.x + s.vx * dt, WORLD.w);
    s.y = wrap(s.y + s.vy * dt, WORLD.h);
    s.life -= dt;
  }
  state.shots = state.shots.filter((s) => s.life > 0);
  state.bursts = state.bursts.filter((b) => (b.life -= dt) > 0);
  if (state.attract) return state;

  // A shot hitting a rock: the rock splits in two, one size down, and scores.
  for (const s of [...state.shots]) {
    const hit = state.rocks.findIndex(
      (r) => Math.hypot(r.x - s.x, r.y - s.y) < SIZES[r.size],
    );
    if (hit < 0) continue;
    const [rock] = state.rocks.splice(hit, 1);
    state.shots.splice(state.shots.indexOf(s), 1);
    state.score += POINTS[rock.size];
    state.bursts.push({ x: rock.x, y: rock.y, life: 0.3, size: rock.size });
    if (rock.size > 1) {
      state.rocks.push(newRock(state.rand, rock.size - 1, rock.x, rock.y));
      state.rocks.push(newRock(state.rand, rock.size - 1, rock.x, rock.y));
    }
  }
  // A rock hitting the ship costs a life, then a moment of safety.
  if (!state.over && ship.safe === 0) {
    const hit = state.rocks.find(
      (r) =>
        Math.hypot(r.x - ship.x, r.y - ship.y) < SIZES[r.size] + SHIP_R * 0.7,
    );
    if (hit) {
      state.bursts.push({ x: ship.x, y: ship.y, life: 0.5, size: 2 });
      state.lives -= 1;
      if (state.lives <= 0) state.over = true;
      else
        Object.assign(ship, {
          x: WORLD.w / 2,
          y: WORLD.h / 2,
          vx: 0,
          vy: 0,
          safe: 2,
        });
    }
  }
  if (!state.over && state.rocks.length === 0) {
    state.wave += 1;
    spawnWave(state);
  }
  return state;
}

// ---- scores: the top five, by initials -----------------------------------------
export const TABLE_SIZE = 5;
export const cleanInitials = (text) => {
  const letters = String(text ?? "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);
  return letters.padEnd(3, "A");
};
export const qualifies = (table, score) =>
  score > 0 && (table.length < TABLE_SIZE || score > table.at(-1).score);
export function addScore(table, initials, score) {
  return [...table, { initials: cleanInitials(initials), score }]
    .sort((a, b) => b.score - a.score)
    .slice(0, TABLE_SIZE);
}
