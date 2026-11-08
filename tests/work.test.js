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
  const union = getFilteredProjects(["signals-hardware", "applied-ai"]);
  assert.equal(union.length, 6);
  assert.equal(union.filter((p) => p.slug === "music-leds").length, 1);
  assert.equal(
    union.some((p) => p.slug === "cya"),
    true,
  );
  assert.equal(
    union.some((p) => p.slug === "timing-attack-lab"),
    false,
  );
  assert.deepEqual(
    union,
    allProjects.filter((p) =>
      p.categories.some((id) =>
        ["signals-hardware", "applied-ai"].includes(id),
      ),
    ),
  );
  for (const id of Object.keys(focusCategories)) {
    assert.deepEqual(focusCategories[id].projects, getFilteredProjects([id]));
  }
});
test("Legacy routes normalize to shareable filters and category order is stable", () => {
  assert.deepEqual(parseRoute("#focus/signals-hardware"), {
    kind: "work",
    categories: ["signals-hardware"],
    hash: "#work?categories=signals-hardware",
  });
  assert.deepEqual(parseRoute("#focus").categories, []);
  assert.equal(
    workHash(["applied-ai", "signals-hardware", "signals-hardware"]),
    "#work?categories=signals-hardware,applied-ai",
  );
  assert.deepEqual(
    parseRoute(workHash(["signals-hardware", "applied-ai"])).categories,
    ["signals-hardware", "applied-ai"],
  );
  assert.equal(workHash([]), "#work");
});
test("Retired category links still resolve to the new groups", () => {
  assert.deepEqual(parseRoute("#focus/engineering"), {
    kind: "work",
    categories: ["signals-hardware"],
    hash: "#work?categories=signals-hardware",
  });
  assert.deepEqual(parseRoute("#focus/cybersecurity").categories, [
    "systems-security",
  ]);
  assert.deepEqual(parseRoute("#focus/ai-math").categories, ["applied-ai"]);
  assert.deepEqual(parseRoute("#focus/hackathons"), {
    kind: "work",
    categories: [],
    hash: "#work",
  });
  assert.deepEqual(
    parseRoute("#work?categories=engineering,ai-math").categories,
    ["signals-hardware", "applied-ai"],
  );
  assert.deepEqual(parseRoute("#project/sentinel"), {
    kind: "project",
    slug: "sentinel",
  });
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
    "#work?categories=signals-hardware,invalid",
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
  assert.doesNotMatch(html, /A few things I.ve built/);
  assert.ok(html.includes("/assets/Max_Leong_Resume.pdf"));
  assert.ok(html.includes("/assets/AI-professional-preview.webp"));
});
