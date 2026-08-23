import test from "node:test";
import assert from "node:assert/strict";
import { resolveCommand } from "../src/terminal/commands/index.js";
import { projectsCommand } from "../src/terminal/commands/project.js";
import { certificates } from "../src/data/certificates.js";
import {
  focusTechnologyGroups,
  formatFocusToolsForTerminal,
  getFocusTechnologyGroup,
} from "../src/data/focus-tools.js";

test("certificate entries point to public PDF and preview assets", () => {
  assert.deepEqual(certificates, [
    {
      title: "Google AI Professional Certificate",
      issuer: "Google · Coursera",
      issued: "June 2026",
      summary:
        "A seven-course professional certificate covering practical AI use across research, writing, content creation, data analysis, and app building.",
      pdfUrl: "/assets/AI-professional.pdf",
      previewUrl: "/assets/AI-professional-preview.png",
      previewAlt:
        "Google AI Professional Certificate awarded to Max Leong on June 22, 2026",
    },
  ]);
});

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

test("skills returns categorised capabilities and stack matrix", () => {
  const result = resolveCommand("skills");

  assert.equal(result.kind, "skills");
  assert.match(result.output, /CYBERSECURITY/);
  assert.match(result.output, /ESP32/);
  assert.match(result.output, /ENGINEERING/);
  assert.match(result.output, /AI & MATH/);
  assert.match(result.output, /HACKATHONS/);

  const stackResult = resolveCommand("stack");
  assert.equal(stackResult.kind, "skills");
});

test("skills use unique tools and languages in focus order", () => {
  assert.deepEqual(
    focusTechnologyGroups.map((group) => group.title),
    ["Cybersecurity", "Engineering", "AI & Math", "Hackathons"],
  );

  const entries = focusTechnologyGroups.flatMap((group) => [
    ...group.languages,
    ...group.tools,
  ]);
  const normalizedEntries = entries.map((entry) => entry.toLowerCase());
  assert.equal(new Set(normalizedEntries).size, normalizedEntries.length);

  focusTechnologyGroups.forEach((group) => {
    assert.ok(group.tools.length > 0);
    assert.equal(getFocusTechnologyGroup(group.id), group);
  });
});

test("terminal skills output comes from focus data without proficiency claims", () => {
  const output = formatFocusToolsForTerminal();

  focusTechnologyGroups.forEach((group) => {
    assert.match(output, new RegExp(`\\[${group.title.toUpperCase()}\\]`));
    [...group.languages, ...group.tools].forEach((entry) => {
      assert.ok(output.includes(entry));
    });
  });

  const copy = `${JSON.stringify(focusTechnologyGroups)}\n${output}`;
  assert.doesNotMatch(copy, /\b(beginner|intermediate|advanced|expert)\b/i);
  assert.doesNotMatch(copy, /\b\d+\s*%/);
  assert.doesNotMatch(copy, /\b\d+\+?\s+years?\b/i);
});

test("resume returns the downloadable PDF and profile links", () => {
  const result = resolveCommand("resume");

  assert.equal(result.kind, "resume");
  assert.match(result.output, /MAX LEONG — RESUME/);
  assert.match(result.output, /PDF resume ready/i);
  assert.deepEqual(result.links, [
    {
      label: "download resume pdf",
      url: "/assets/Max_Leong_Resume.pdf",
      download: "Max_Leong_Resume.pdf",
    },
    { label: "open in new tab", url: "/assets/Max_Leong_Resume.pdf" },
    { label: "linkedin", url: "https://linkedin.com/in/maxleongruisheng" },
    { label: "github", url: "https://github.com/maxi-cmyk" },
  ]);

  const catResume = resolveCommand("cat resume");
  assert.equal(catResume.kind, "resume");
});

test("sudo and destructive commands trigger the playful hacker easter egg", () => {
  const sudoResult = resolveCommand("sudo rm -rf /");
  assert.equal(sudoResult.kind, "sudo");
  assert.match(sudoResult.output, /password for visitor/);
  assert.match(sudoResult.output, /Nice try, hacker/);

  const rmResult = resolveCommand("rm -rf *");
  assert.equal(rmResult.kind, "sudo");
});

test("projects lists the selected hardware and maths builds", () => {
  const result = resolveCommand("projects");

  assert.equal(result, projectsCommand);
  assert.equal(result.kind, "projects");
  assert.equal(result.output, "Selected projects");
  assert.deepEqual(
    result.projects.map(({ name, meta, links }) => ({
      name,
      meta,
      urls: links.map(({ url }) => url),
    })),
    [
      {
        name: "it'sPEAK",
        meta: "2nd place · first full-stack app",
        urls: [
          "https://github.com/maxi-cmyk/it-sPeak",
          "https://devpost.com/software/itspeak?ref_content=my-projects-tab&ref_feature=my_projects",
        ],
      },
      {
        name: "Echo",
        meta: "iNTUition 2026 · Best Freshmen Award",
        urls: ["https://github.com/maxi-cmyk/echo"],
      },
      {
        name: "ESP32 Asteroids",
        meta: "hardware",
        urls: ["https://github.com/maxi-cmyk/asteriods"],
      },
      {
        name: "Sentinel",
        meta: "hardware",
        urls: ["https://github.com/maxi-cmyk/sentinel"],
      },
      {
        name: "Conway's Game of Life",
        meta: "maths + hardware",
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

test("help lists skills and resume while keeping panda easter egg secret", () => {
  const result = resolveCommand("help");
  assert.equal(result.kind, "help");
  assert.match(result.output, /skills/);
  assert.match(result.output, /resume/);
  assert.doesNotMatch(result.output, /thebananachip/i);
});

test("unknown commands receive a useful terminal response", () => {
  const result = resolveCommand("quantum-banana");
  assert.equal(result.kind, "error");
  assert.match(result.output, /command not found/i);
});

test("focus category commands return filtered project listings and navTarget", () => {
  const hackathonsResult = resolveCommand("cd focus/hackathons");
  assert.equal(hackathonsResult.kind, "projects");
  assert.equal(hackathonsResult.navTarget, "#focus/hackathons");
  assert.equal(hackathonsResult.projects.length, 2);

  const cyberResult = resolveCommand("ls focus/cybersecurity");
  assert.equal(cyberResult.kind, "projects");
  assert.equal(cyberResult.navTarget, "#focus/cybersecurity");
  assert.equal(cyberResult.projects.length, 1);

  const cdBackResult = resolveCommand("cd ..");
  assert.equal(cdBackResult.kind, "nav");
  assert.equal(cdBackResult.navTarget, "#focus");
});
