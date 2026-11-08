import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { allProjects, isWip } from "../src/data/projects.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("every work card has a media slot that says what to supply", () => {
  for (const project of allProjects) {
    const m = project.media;
    assert.ok(m, project.name);
    assert.ok(["photo", "screenshot", "video"].includes(m.kind), project.name);
    assert.ok(m.want.length > 10, project.name);
    assert.ok(m.src && m.alt, project.name);
  }
});

test("a filled media slot has real alt text and a file that exists", () => {
  for (const project of allProjects) {
    const m = project.media;
    if (isWip(m.src)) continue;
    assert.ok(!isWip(m.alt), `${project.name}: alt text is still WIP`);
    assert.match(m.src, /^\/assets\/media\//, project.name);
    assert.ok(
      existsSync(new URL(`../public${m.src}`, import.meta.url)),
      `${project.name}: ${m.src} is missing from public/`,
    );
    if (m.poster) {
      assert.ok(
        existsSync(new URL(`../public${m.poster}`, import.meta.url)),
        `${project.name}: poster ${m.poster} is missing`,
      );
    }
  }
});

test("the static page renders one media slot per work card", () => {
  const slots = [...html.matchAll(/<figure class="media[ "]/g)].length;
  assert.equal(slots, allProjects.length);
  const waiting = allProjects.filter((p) => isWip(p.media.src)).length;
  assert.equal([...html.matchAll(/class="media media-wip"/g)].length, waiting);
});
