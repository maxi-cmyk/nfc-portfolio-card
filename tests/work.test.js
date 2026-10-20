import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  allProjects,
  focusCategories,
  getFilteredProjects,
} from "../src/data/projects.js";
import { parseRoute, workHash } from "../src/navigation/routes.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
test("All work and overlapping OR filters keep canonical order without duplicates", () => {
  assert.deepEqual(getFilteredProjects(), allProjects);
  const union = getFilteredProjects(["engineering", "ai-math"]);
  assert.equal(union.length, 6);
  assert.equal(union.filter((p) => p.slug === "music-leds").length, 1);
  assert.equal(
    union.some((p) => p.slug === "cya"),
    true,
  );
  assert.equal(
    union.some((p) => p.slug === "echo"),
    false,
  );
  assert.deepEqual(
    union,
    allProjects.filter((p) =>
      p.categories.some((id) => ["engineering", "ai-math"].includes(id)),
    ),
  );
  for (const id of Object.keys(focusCategories)) {
    assert.deepEqual(focusCategories[id].projects, getFilteredProjects([id]));
  }
});
test("Legacy routes normalize to shareable filters and category order is stable", () => {
  assert.deepEqual(parseRoute("#focus/engineering"), {
    kind: "work",
    categories: ["engineering"],
    hash: "#work?categories=engineering",
  });
  assert.deepEqual(parseRoute("#focus").categories, []);
  assert.equal(
    workHash(["ai-math", "engineering", "engineering"]),
    "#work?categories=engineering,ai-math",
  );
  assert.deepEqual(
    parseRoute(workHash(["engineering", "ai-math"])).categories,
    ["engineering", "ai-math"],
  );
  assert.equal(workHash([]), "#work");
});
test("Unknown and hostile fragments are handled without selector parsing", () => {
  for (const hash of [
    "#focus/not-found",
    "#project/not-found",
    "#project/",
    "#project/music",
    "#%E0%A4%A",
    "#][",
    "#work?categories=__proto__",
    "#focus/constructor",
    "#work?categories=engineering,invalid",
  ]) {
    assert.deepEqual(parseRoute(hash), { kind: "missing" }, hash);
  }
  assert.deepEqual(parseRoute("#project/music-leds"), {
    kind: "project",
    slug: "music-leds",
  });
  assert.deepEqual(parseRoute("#project/cya"), {
    kind: "project",
    slug: "cya",
  });
});
test("Static HTML exposes work, real links, case-study fallback and certificates without JavaScript", () => {
  assert.doesNotMatch(html, /<main[^>]*\shidden/);
  for (const project of allProjects) {
    assert.equal(
      [...html.matchAll(new RegExp(`data-project-slug="${project.slug}"`, "g"))]
        .length,
      1,
    );
    assert.ok(html.includes(`id="project/${project.slug}"`));
    assert.ok(html.includes(`id="case-study-work-${project.slug}"`));
  }
  assert.equal(
    [...html.matchAll(/class="static-case-study"/g)].length,
    allProjects.length,
  );
  assert.ok(html.includes("/assets/Max_Leong_Resume.pdf"));
  assert.ok(html.includes("/assets/AI-professional-preview.webp"));
});
