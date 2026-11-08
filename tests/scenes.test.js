import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { allProjects, caseStudyProjects } from "../src/data/projects.js";
import { parseRoute, projectHash, workHash } from "../src/navigation/routes.js";
import {
  SCENES,
  createSceneMachine,
  parentScene,
  routeToScene,
  sameScene,
  sceneToHash,
} from "../src/navigation/scenes.js";
import { getPaletteItems, matchPalette } from "../src/navigation/palette.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const sceneOf = (hash) => routeToScene(parseRoute(hash));

test("every hash maps to one scene, including legacy and filtered links", () => {
  assert.equal(sceneOf("").scene, "hub");
  assert.equal(sceneOf("#home").scene, "hub");
  assert.deepEqual(sceneOf("#terminal"), { scene: "hub", terminal: true });
  assert.equal(sceneOf("#work").scene, "work");
  assert.equal(sceneOf("#work/echo").slug, "echo");
  assert.deepEqual(sceneOf("#focus/engineering"), {
    scene: "work",
    slug: null,
    categories: ["signals-hardware"],
  });
  assert.equal(sceneOf("#certificates").scene, "credentials");
  assert.equal(sceneOf("#credentials").scene, "credentials");
  assert.equal(sceneOf("#skills").scene, "skills");
  assert.equal(sceneOf("#contact").scene, "contact");
  assert.deepEqual(sceneOf("#project/echo"), {
    scene: "case",
    slug: "echo",
    step: 1,
    read: false,
  });
  assert.equal(sceneOf("#project/echo/3").step, 3);
  assert.equal(sceneOf("#project/echo/read").read, true);
  assert.deepEqual(sceneOf("#nonsense"), { scene: "hub", missing: true });
  for (const hash of ["", "#home", "#work", "#skills", "#contact"]) {
    assert.ok(SCENES.includes(sceneOf(hash).scene), hash);
  }
});

test("a project rides along with a filter and survives a round trip", () => {
  assert.equal(workHash([], "echo"), "#work/echo");
  assert.equal(
    workHash(["applied-ai"], "echo"),
    "#work?categories=applied-ai&project=echo",
  );
  const route = parseRoute("#work?categories=applied-ai&project=echo");
  assert.deepEqual(route.categories, ["applied-ai"]);
  assert.equal(route.slug, "echo");
  for (const hash of [
    "#work",
    "#work/echo",
    "#work?categories=applied-ai",
    "#work?categories=signals-hardware,applied-ai&project=cya",
    "#project/music-leds",
    "#project/music-leds/3",
    "#project/music-leds/read",
    "#skills",
    "#certificates",
    "#contact",
    "#home",
  ]) {
    const scene = sceneOf(hash);
    assert.equal(sceneToHash(scene), hash, hash);
  }
});

test("hostile or out-of-range scene hashes are missing, not thrown", () => {
  for (const hash of [
    "#work/sentinel",
    "#work/__proto__",
    "#work?categories=applied-ai&project=nope",
    "#project/echo/0",
    "#project/echo/abc",
    "#project/echo/1/2",
    "#project/echo/readme",
    "#project/__proto__",
  ]) {
    assert.deepEqual(parseRoute(hash), { kind: "missing" }, hash);
  }
});

test("up goes one level and ends at the hub", () => {
  assert.equal(parentScene({ scene: "hub" }), null);
  // A project goes up to the Selected work landing, and the landing to the hub.
  assert.deepEqual(parentScene({ scene: "work", slug: "echo" }), {
    scene: "work",
    slug: null,
    categories: [],
  });
  assert.deepEqual(parentScene({ scene: "work", slug: null }), {
    scene: "hub",
  });
  assert.deepEqual(parentScene({ scene: "skills" }), { scene: "hub" });
  assert.deepEqual(
    parentScene({ scene: "case", slug: "echo", step: 3, read: true }),
    { scene: "case", slug: "echo", step: 3 },
  );
  assert.deepEqual(parentScene({ scene: "case", slug: "echo", step: 2 }), {
    scene: "work",
    slug: "echo",
    categories: [],
  });
  // Sentinel has a case study but is not in the pager, so up goes to the list.
  assert.deepEqual(parentScene({ scene: "case", slug: "sentinel", step: 1 }), {
    scene: "work",
    slug: null,
    categories: [],
  });
});

test("every scene is reachable from the hub in at most three actions", () => {
  // Actions: a desktop icon (1), a project tile on the Selected work landing (2),
  // then the project's case-study button (3).
  const hubTiles = html.match(/<nav class="desktop-icons"[\s\S]*?<\/nav>/)[0];
  for (const target of ["#work", "#skills", "#certificates", "#contact"]) {
    assert.ok(hubTiles.includes(`href="${target}"`), target);
  }
  for (const project of caseStudyProjects) {
    // Sentinel has a case study but no card, so only the others have a button.
    const onCard = allProjects.some((p) => p.slug === project.slug);
    const button = `id="case-study-work-${project.slug}"`;
    if (onCard) assert.ok(html.includes(button), `${project.name}: ${button}`);
    assert.equal(parseRoute(projectHash(project.slug)).kind, "project");
  }
});

test("the scene machine ignores no-ops and tracks where it came from", () => {
  const machine = createSceneMachine();
  assert.equal(machine.state.scene, "hub");
  assert.equal(machine.go({ scene: "hub" }), null);
  const seq = machine.go({ scene: "work", slug: null, categories: [] });
  assert.equal(seq, 1);
  assert.equal(machine.state.scene, "work");
  assert.equal(machine.state.from.scene, "hub");
  assert.equal(machine.state.phase, "idle");
  assert.equal(machine.go({ scene: "work", slug: null, categories: [] }), null);
  assert.equal(
    machine.go({ scene: "work", slug: "echo", categories: [] }),
    2,
    "another project is a different place",
  );
  assert.equal(machine.go({ scene: "hub", terminal: true }), 3);
  assert.equal(machine.go({ scene: "hub", terminal: true }), null);
});

test("a new navigation interrupts one that is still animating", () => {
  const machine = createSceneMachine();
  const seen = [];
  machine.subscribe((state) => seen.push([state.scene, state.phase]));
  const a = machine.go(
    { scene: "work", slug: null, categories: [] },
    { animate: true },
  );
  assert.equal(machine.state.phase, "transitioning");
  const b = machine.go({ scene: "skills" }, { animate: true });
  assert.equal(machine.state.scene, "skills");
  assert.equal(machine.state.interrupted, true);
  assert.equal(machine.state.from.scene, "work");
  assert.equal(machine.settle(a), false, "the stale transition cannot settle");
  assert.equal(machine.state.phase, "transitioning");
  assert.equal(machine.settle(b), true);
  assert.equal(machine.state.phase, "idle");
  assert.equal(machine.settle(b), false, "settling twice is harmless");
  assert.deepEqual(seen.at(-1), ["skills", "idle"]);
  // Going back to where an interrupted move started is still a real move.
  assert.ok(machine.go({ scene: "work", slug: null, categories: [] }) > b);
});

test("the machine reaches every scene and unsubscribes cleanly", () => {
  const machine = createSceneMachine();
  let calls = 0;
  const off = machine.subscribe(() => calls++);
  const targets = [
    { scene: "work", slug: "echo", categories: [] },
    { scene: "case", slug: "echo", step: 2 },
    { scene: "skills" },
    { scene: "credentials" },
    { scene: "contact" },
    { scene: "hub" },
  ];
  for (const target of targets) {
    assert.ok(machine.go(target) !== null, target.scene);
    assert.ok(sameScene(machine.state, target));
  }
  assert.equal(calls, targets.length);
  off();
  machine.go({ scene: "skills" });
  assert.equal(calls, targets.length);
});

test("the palette finds places by name, tag and case study", () => {
  assert.equal(matchPalette("echo")[0].hash, "#work/echo");
  assert.ok(
    matchPalette("timing").some((i) => i.hash === "#project/timing-attack-lab"),
  );
  assert.ok(matchPalette("esp32").some((i) => i.hash === "#work/music-leds"));
  assert.equal(matchPalette("zzzzzz").length, 0);
  const top = matchPalette("").map((i) => i.id);
  assert.deepEqual(top, [
    "hub",
    "work",
    "skills",
    "credentials",
    "contact",
    "terminal",
    "resume",
  ]);
  assert.ok(matchPalette("work", getPaletteItems(), 3).length <= 3);
});

test("every palette item goes somewhere real", () => {
  const ids = new Set();
  for (const item of getPaletteItems()) {
    assert.ok(!ids.has(item.id), item.id);
    ids.add(item.id);
    const targets = [item.hash, item.action, item.href].filter(Boolean);
    assert.equal(targets.length, 1, item.id);
    if (item.hash)
      assert.notEqual(parseRoute(item.hash).kind, "missing", item.hash);
  }
});

test("the static page keeps working without scripts and drops the old rail", () => {
  assert.doesNotMatch(html, /system-rail|compact-nav/);
  assert.doesNotMatch(html, /menu-bar|class="dock"|hub-nav/);
  assert.match(html, /id="skills"/);
  assert.match(html, /id="contact-title"/);
  for (const id of [
    "home",
    "work",
    "skills",
    "certificates",
    "contact",
    "hero-form",
    "hero-output",
  ]) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
  assert.match(html, /id="scene-status"[^>]*role="status"/);
});

test("Selected work opens on a landing with a tile for every featured project", () => {
  const landing = html.match(
    /<div id="work-landing"[\s\S]*?<\/div>(?=\s*<div id="work-filters")/,
  )[0];
  for (const project of allProjects) {
    assert.ok(
      landing.includes(`href="#work/${project.slug}"`),
      `${project.name} has no tile`,
    );
  }
  assert.deepEqual(routeToScene(parseRoute("#work")), {
    scene: "work",
    slug: null,
    categories: [],
  });
});

test("a project and a case study each offer exits to Selected work and to the desktop", () => {
  const work = readFileSync(
    new URL("../src/components/work.js", import.meta.url),
    "utf8",
  );
  const scenes = readFileSync(
    new URL("../src/components/scenes.js", import.meta.url),
    "utf8",
  );
  for (const source of [work, scenes]) {
    assert.match(
      source,
      /class="push"[^>]*href="#work"|href="#work"[^>]*>‹ Selected work/,
    );
    assert.match(source, /href="#home">Home</);
  }
});
