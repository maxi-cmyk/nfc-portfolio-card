import test from "node:test";
import assert from "node:assert/strict";
import { resolveCommand } from "../src/terminal/commands/index.js";
import { projectsCommand } from "../src/terminal/commands/project.js";

test("thebananachip reveals the panda easter egg", () => {
  const result = resolveCommand("thebananachip");
  assert.equal(result.kind, "panda");
  assert.match(result.output, /panda\.sys: authentication accepted\./);
});

test("about returns a brief introduction", () => {
  const result = resolveCommand("about");

  assert.equal(result.kind, "about");
  assert.match(result.output, /CS student/i);
  assert.match(result.output, /cybersecurity · mathematics · AI/i);
  assert.equal(result.links, undefined);
});

test("projects lists the selected hardware and maths builds", () => {
  const result = resolveCommand("projects");

  assert.equal(result, projectsCommand);
  assert.equal(result.kind, "projects");
  assert.equal(result.output, "Selected projects");
  assert.deepEqual(
    result.projects.map(({ name, links }) => ({
      name,
      urls: links.map(({ url }) => url),
    })),
    [
      {
        name: "it'sPEAK",
        urls: [
          "https://github.com/maxi-cmyk/it-sPeak",
          "https://devpost.com/software/itspeak?ref_content=my-projects-tab&ref_feature=my_projects",
        ],
      },
      { name: "Echo", urls: ["https://github.com/maxi-cmyk/echo"] },
      {
        name: "ESP32 Asteroids",
        urls: ["https://github.com/maxi-cmyk/asteriods"],
      },
      {
        name: "Sentinel",
        urls: ["https://github.com/maxi-cmyk/sentinel"],
      },
      {
        name: "Conway's Game of Life",
        urls: ["https://github.com/maxi-cmyk/conway_game_of_life"],
      },
    ],
  );
});

test("contact returns clickable public profile links", () => {
  const result = resolveCommand("contact");

  assert.equal(result.kind, "contact");
  assert.deepEqual(result.links, [
    { label: "github", url: "https://github.com/maxi-cmyk" },
    { label: "linkedin", url: "https://linkedin.com/in/maxleongruisheng" },
  ]);
});

test("help does not reveal the secret panda command", () => {
  const result = resolveCommand("help");
  assert.equal(result.kind, "help");
  assert.doesNotMatch(result.output, /thebananachip/i);
});

test("unknown commands receive a useful terminal response", () => {
  const result = resolveCommand("quantum-banana");
  assert.equal(result.kind, "error");
  assert.match(result.output, /command not found/i);
});
