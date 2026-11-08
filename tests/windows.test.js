import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createWindowMemory,
  parseZoomed,
  toggleZoomed,
} from "../src/navigation/windows.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("minimizing parks a window's place under its icon and restores it once", () => {
  const memory = createWindowMemory();
  assert.equal(memory.restore("work"), null);
  memory.minimize("work", "#project/echo/2");
  assert.equal(memory.has("work"), true);
  assert.deepEqual(memory.keys(), ["work"]);
  assert.equal(memory.restore("work"), "#project/echo/2");
  assert.equal(memory.has("work"), false);
  assert.equal(memory.restore("work"), null, "restoring twice gives nothing");
});

test("a later minimize replaces the earlier place, and clear forgets it", () => {
  const memory = createWindowMemory();
  memory.minimize("work", "#work/echo");
  memory.minimize("work", "#work/cya");
  memory.minimize("skills", "#skills");
  assert.equal(memory.restore("work"), "#work/cya");
  memory.clear("skills");
  assert.deepEqual(memory.keys(), []);
});

test("zoom state survives a round trip and ignores bad stored data", () => {
  assert.deepEqual(parseZoomed(null), []);
  assert.deepEqual(parseZoomed("not json"), []);
  assert.deepEqual(parseZoomed('{"a":1}'), []);
  assert.deepEqual(parseZoomed('["work", 3, "skills"]'), ["work", "skills"]);
  let list = [];
  list = toggleZoomed(list, "work");
  list = toggleZoomed(list, "skills");
  assert.deepEqual(list, ["work", "skills"]);
  assert.deepEqual(parseZoomed(JSON.stringify(list)), list);
  assert.deepEqual(toggleZoomed(list, "work"), ["skills"]);
});

test("the static page has a quiet About window and no separate Terminal window", () => {
  assert.match(html, /class="lights is-inactive" aria-hidden="true"/);
  assert.doesNotMatch(html, /close-box/);
  // The console lives in the About window; the old floating window is gone.
  assert.match(html, /id="hero-form"/);
  assert.doesNotMatch(html, /class="terminal-bar|class="terminal-status|80×24/);
});
