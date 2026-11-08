import assert from "node:assert/strict";
import test from "node:test";
import {
  POINTS,
  SIZES,
  STEP,
  WORLD,
  addScore,
  cleanInitials,
  createGame,
  qualifies,
  stepGame,
} from "../src/figures/arcade-core.js";

const run = (state, input, seconds) => {
  for (let t = 0; t < seconds; t += STEP) stepGame(state, input);
  return state;
};

test("the same seed always plays the same game", () => {
  const a = run(createGame(7), { left: true, fire: true, thrust: true }, 3);
  const b = run(createGame(7), { left: true, fire: true, thrust: true }, 3);
  assert.deepEqual(a.rocks, b.rocks);
  assert.equal(a.score, b.score);
});

test("the ship wraps round the world", () => {
  const game = createGame(1);
  game.ship.x = WORLD.w - 1;
  game.ship.vx = 100;
  game.rocks = [];
  stepGame(game, {});
  assert.ok(game.ship.x >= 0 && game.ship.x < 5, `x ${game.ship.x}`);
});

test("a shot splits a rock one size down and scores", () => {
  const game = createGame(1);
  game.rocks = [
    { x: 200, y: 100, vx: 0, vy: 0, size: 3, angle: 0, spin: 0, seed: 1 },
  ];
  game.shots = [{ x: 200, y: 100, vx: 0, vy: 0, life: 1 }];
  stepGame(game, {});
  assert.equal(game.score, POINTS[3]);
  assert.equal(game.rocks.length, 2);
  assert.ok(game.rocks.every((r) => r.size === 2));
  assert.equal(game.shots.length, 0);
});

test("the smallest rocks vanish, and clearing a wave starts a busier one", () => {
  const game = createGame(1);
  game.rocks = [
    { x: 200, y: 100, vx: 0, vy: 0, size: 1, angle: 0, spin: 0, seed: 1 },
  ];
  game.shots = [{ x: 200, y: 100, vx: 0, vy: 0, life: 1 }];
  stepGame(game, {});
  assert.equal(game.wave, 2);
  assert.equal(game.rocks.length, 3 + 2, "wave 2 has five rocks");
});

test("a rock hitting the ship costs a life, then three lives end the game", () => {
  const game = createGame(1);
  game.ship.safe = 0;
  for (let life = 3; life > 0; life--) {
    game.rocks = [
      {
        x: game.ship.x,
        y: game.ship.y,
        vx: 0,
        vy: 0,
        size: 2,
        angle: 0,
        spin: 0,
        seed: 1,
      },
    ];
    game.ship.safe = 0;
    stepGame(game, {});
    assert.equal(game.lives, life - 1);
  }
  assert.equal(game.over, true);
});

test("attract mode only drifts: no ship, no scoring", () => {
  const game = createGame(3, { attract: true });
  const before = game.rocks.map((r) => [r.x, r.y]);
  run(game, { fire: true }, 1);
  assert.equal(game.score, 0);
  assert.equal(game.shots.length, 0);
  assert.notDeepEqual(
    game.rocks.map((r) => [r.x, r.y]),
    before,
  );
});

test("rock sizes and points get bigger as the rock gets smaller", () => {
  assert.ok(SIZES[3] > SIZES[2] && SIZES[2] > SIZES[1]);
  assert.ok(POINTS[1] > POINTS[2] && POINTS[2] > POINTS[3]);
});

test("the score table keeps the top five, sorted, with three-letter initials", () => {
  let table = [];
  for (const [who, score] of [
    ["max", 300],
    ["abc", 900],
    ["zzz", 100],
    ["q1!", 500],
    ["bob", 700],
    ["new", 50],
  ]) {
    table = addScore(table, who, score);
  }
  assert.deepEqual(
    table.map((e) => e.score),
    [900, 700, 500, 300, 100],
  );
  assert.equal(cleanInitials("m"), "MAA");
  assert.equal(cleanInitials("max leong"), "MAX");
  assert.equal(qualifies(table, 99), false);
  assert.equal(qualifies(table, 101), true);
  assert.equal(qualifies(table, 0), false);
  assert.equal(qualifies([], 10), true);
});
