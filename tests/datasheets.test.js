import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { allProjects } from "../src/data/projects.js";
import { FIGURES } from "../src/data/figures.js";
import { datasheets, renderDatasheet } from "../src/data/datasheets.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// Everything a project says about itself, for checking a number against.
const haystack = (project) =>
  JSON.stringify([project, FIGURES[project.slug]?.caption ?? ""]).toLowerCase();

test("every featured project has a datasheet", () => {
  for (const project of allProjects) {
    assert.ok(datasheets[project.slug]?.rows.length, project.name);
  }
});

test("every datasheet number is stated in the project's own data", () => {
  for (const project of allProjects) {
    const sheet = datasheets[project.slug];
    for (const row of sheet.rows) {
      if (row.readme) continue; // the GPIO pins come from the firmware README
      assert.ok(
        haystack(project).includes(row.check.toLowerCase()),
        `${project.name}: "${row.check}" is not in its data`,
      );
    }
    if (sheet.bar) {
      assert.ok(
        haystack(project).includes(sheet.bar.check.toLowerCase()),
        project.name,
      );
    }
  }
});

test("music_LEDs shows the three bands in their LED colours, from the firmware's edges", () => {
  const rows = datasheets["music-leds"].rows.filter((r) => r.led);
  assert.deepEqual(
    rows.map((r) => r.led),
    ["r", "g", "b"],
  );
  assert.match(rows[0].v, /50–250 Hz/);
  assert.match(rows[1].v, /300–1000 Hz/);
  assert.match(rows[2].v, /1050–2500 Hz/);
});

test("the static page carries each strip, and the renderer escapes", () => {
  for (const project of allProjects) {
    const name = project.name.replace(/'/g, "&#39;");
    assert.ok(html.includes(`aria-label="${name} datasheet"`), project.name);
  }
  assert.match(renderDatasheet("a<b", "echo"), /a&#60;b/);
  assert.equal(renderDatasheet("x", "nothing"), "");
});
