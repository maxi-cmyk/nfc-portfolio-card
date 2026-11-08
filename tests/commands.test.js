import test from "node:test";
import assert from "node:assert/strict";
import { resolveCommand } from "../src/terminal/commands/index.js";
import { projectsCommand } from "../src/terminal/commands/project.js";
import { certificates } from "../src/data/certificates.js";
import {
  allProjects,
  caseStudyProjects,
  focusCategories,
  getCaseStudyLinkLabel,
  isWip,
  resolveCategory,
} from "../src/data/projects.js";
import { getCaseStudySteps } from "../src/data/case-study-steps.js";
import { getInsightContentOrder } from "../src/components/subpages/project-modal.js";
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
      previewUrl: "/assets/AI-professional-preview.webp",
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
  assert.match(result.output, /SYSTEMS & SECURITY/);
  assert.match(result.output, /ESP32/);
  assert.match(result.output, /SIGNALS & HARDWARE/);
  assert.match(result.output, /APPLIED AI & PRODUCTS/);

  const stackResult = resolveCommand("stack");
  assert.equal(stackResult.kind, "skills");
});

test("skills use project-backed tools and languages in focus order", () => {
  assert.deepEqual(
    focusTechnologyGroups.map((group) => group.title),
    ["Signals & hardware", "Systems & security", "Applied AI & products"],
  );

  const tools = focusTechnologyGroups.flatMap((group) => group.tools);
  const normalizedTools = tools.map((entry) => entry.toLowerCase());
  assert.equal(new Set(normalizedTools).size, normalizedTools.length);

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

test("applied AI tooling reflects the shipped project stacks", () => {
  const hackathons = getFocusTechnologyGroup("applied-ai");

  assert.equal(hackathons.variant, "expanded");
  assert.deepEqual(hackathons.languages, [
    "Python",
    "TypeScript",
    "JavaScript",
    "SQL",
  ]);
  [
    "FastAPI",
    "Celery",
    "Redis",
    "MediaPipe",
    "OpenAI",
    "Next.js",
    "Supabase",
    "PostgreSQL",
    "LLaVA",
    "ElevenLabs",
  ].forEach((tool) => assert.ok(hackathons.tools.includes(tool)));
});

test("every focus lists the languages used by its linked work", () => {
  const expectedLanguages = new Map([
    ["signals-hardware", ["C++", "JavaScript"]],
    ["systems-security", ["Python", "C", "C++"]],
    ["applied-ai", ["Python", "TypeScript", "JavaScript", "SQL"]],
  ]);

  focusTechnologyGroups.forEach((group) => {
    assert.deepEqual(group.languages, expectedLanguages.get(group.id));
  });
});

test("focus tools reflect the linked implementations", () => {
  const expectedTools = new Map([
    [
      "signals-hardware",
      ["ESP32", "SSD1306 OLED", "React", "Chart.js", "DFT / FFT"],
    ],
    [
      "systems-security",
      ["Flask", "hmac.compare_digest", "ESP32-CAM", "Blynk", "HTTP / MJPEG"],
    ],
    [
      "applied-ai",
      [
        "PyTorch",
        "NumPy",
        "pandas",
        "Jupyter",
        "FastAPI",
        "MediaPipe",
        "Next.js",
        "Supabase",
      ],
    ],
  ]);

  focusTechnologyGroups.forEach((group) => {
    expectedTools
      .get(group.id)
      .forEach((tool) => assert.ok(group.tools.includes(tool)));
  });
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
        name: "music_LEDs",
        meta: "Fourier mathematics · linear algebra · hardware",
        urls: ["https://github.com/maxi-cmyk/music_LED"],
      },
      {
        name: "timing-attack-lab",
        meta: "Learning lab · localhost only",
        urls: ["https://github.com/maxi-cmyk/timing-attack-lab"],
      },
      {
        name: "Conway's Game of Life",
        meta: "maths + hardware",
        urls: ["https://github.com/maxi-cmyk/conway_game_of_life"],
      },
      {
        name: "Asteroids",
        meta: "ESP32 + web",
        urls: ["https://github.com/maxi-cmyk/asteriods"],
      },
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
        name: "cya",
        meta: "TechJam 26 · participant",
        urls: ["https://github.com/maxi-cmyk/cya-techjam26"],
      },
      {
        name: "Sentinel",
        meta: "hardware",
        urls: ["https://github.com/maxi-cmyk/sentinel"],
      },
    ],
  );
});

test("every project publishes a visitor-facing case study", () => {
  assert.equal(allProjects.length, 7);
  assert.equal(caseStudyProjects.length, 8);
  assert.equal(new Set(caseStudyProjects.map(({ slug }) => slug)).size, 8);

  for (const project of caseStudyProjects) {
    assert.equal(
      getCaseStudyLinkLabel(project),
      "view case study",
      project.name,
    );
    assert.equal(project.insights.sections.length, 3, project.name);
    assert.ok(project.insights.contentOrder.length >= 3, project.name);
    assert.equal("status" in project.insights, false, project.name);
    assert.equal("statusLabel" in project.insights, false, project.name);
    assert.equal("evidence" in project.insights, false, project.name);
  }
});

test("case studies define project-specific narrative structures and order", () => {
  const conway = caseStudyProjects.find(
    (project) => project.slug === "conway-game-of-life",
  );
  const itspeak = caseStudyProjects.find(
    (project) => project.slug === "itspeak",
  );
  const echo = caseStudyProjects.find((project) => project.slug === "echo");
  const asteroids = caseStudyProjects.find(
    (project) => project.slug === "asteroids",
  );
  const sentinel = caseStudyProjects.find(
    (project) => project.slug === "sentinel",
  );

  assert.deepEqual(getInsightContentOrder(conway.insights), [
    "summary",
    "howItWorks",
    "diagram",
    "sections",
  ]);
  assert.equal(conway.insights.howItWorks.steps.length, 3);
  assert.match(conway.insights.howItWorks.steps[0].body, /torus/i);
  assert.deepEqual(getInsightContentOrder(itspeak.insights), [
    "summary",
    "pipeline",
    "sections",
  ]);
  assert.equal(itspeak.insights.pipeline.lanes.length, 2);
  assert.match(itspeak.insights.pipeline.merge.detail, /deterministic/i);
  assert.deepEqual(getInsightContentOrder(echo.insights), [
    "summary",
    "lifecycle",
    "sections",
  ]);
  assert.equal(echo.insights.lifecycle.steps.length, 6);
  assert.equal(echo.insights.lifecycle.steps[2].state, "gate");
  assert.deepEqual(getInsightContentOrder(asteroids.insights), [
    "summary",
    "frameLoop",
    "sections",
  ]);
  assert.equal(asteroids.insights.frameLoop.budget, "20 ms");
  assert.match(
    asteroids.insights.frameLoop.phases.map(({ detail }) => detail).join(" "),
    /capped object pools.*framebuffer.*LEDC/s,
  );
  assert.deepEqual(getInsightContentOrder(sentinel.insights), [
    "summary",
    "eventSequence",
    "sections",
  ]);
  assert.deepEqual(
    sentinel.insights.eventSequence.devices.map(({ id }) => id),
    ["sensor", "camera"],
  );
  assert.deepEqual(
    sentinel.insights.eventSequence.steps.map(({ actor }) => actor),
    ["sensor", "bridge", "camera", "camera", "camera"],
  );
  assert.deepEqual(
    sentinel.insights.eventSequence.steps.map(({ actorLabel }) => actorLabel),
    ["PIR node", "Blynk V6", "ESP32-CAM", "ESP32-CAM", "ESP32-CAM"],
  );
});

test("case-study ordering skips absent, duplicate, and unknown blocks", () => {
  assert.deepEqual(
    getInsightContentOrder({
      contentOrder: [
        "summary",
        "lifecycle",
        "lifecycle",
        "unknown",
        "sections",
      ],
      lifecycle: { steps: [] },
      sections: [],
    }),
    ["lifecycle"],
  );
});

test("focus categories reuse the canonical project records", () => {
  const canonicalProjects = new Map(
    allProjects.map((project) => [project.slug, project]),
  );

  for (const category of Object.values(focusCategories)) {
    for (const project of category.projects) {
      assert.equal(project, canonicalProjects.get(project.slug));
    }
  }
});

test("new projects share canonical records across their relevant focuses", () => {
  const music = caseStudyProjects.find(({ slug }) => slug === "music-leds");
  const cya = caseStudyProjects.find(({ slug }) => slug === "cya");

  assert.equal(music.name, "music_LEDs");
  assert.equal(cya.name, "cya");
  assert.equal(
    focusCategories["signals-hardware"].projects.filter((p) => p === music)
      .length,
    1,
  );
  assert.equal(
    focusCategories["applied-ai"].projects.filter((p) => p === cya).length,
    1,
  );
  assert.equal(
    focusCategories["systems-security"].projects.includes(music),
    false,
  );
  assert.equal(allProjects.filter((p) => p === music).length, 1);
  assert.equal(allProjects.filter((p) => p === cya).length, 1);
  assert.deepEqual(getInsightContentOrder(music.insights), [
    "summary",
    "howItWorks",
    "diagram",
    "sections",
  ]);
  assert.deepEqual(getInsightContentOrder(cya.insights), [
    "summary",
    "results",
    "diagram",
    "howItWorks",
    "sections",
  ]);
});

test("music_LEDs explains Fourier and linear algebra without obsolete Spotify features", () => {
  const music = caseStudyProjects.find(({ slug }) => slug === "music-leds");
  const copy = JSON.stringify(music);
  assert.match(copy, /Fourier.matrix/i);
  assert.match(copy, /inner product/i);
  assert.match(copy, /reconstruct/i);
  assert.match(copy, /radix-2 FFT/);
  assert.doesNotMatch(copy, /spotify|album art|now-playing/i);
});

test("cya qualifies evaluation results and attributes the team contribution", () => {
  const cya = caseStudyProjects.find(({ slug }) => slug === "cya");
  const copy = JSON.stringify(cya);
  assert.equal(cya.meta, "TechJam 26 · participant");
  assert.match(copy, /99\.29% on 141 images/);
  assert.match(copy, /uncalibrated/);
  assert.match(copy, /Shan He built.*React/);
  assert.match(copy, /Rae developed/);
  assert.doesNotMatch(cya.meta, /winner|award|place/i);
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
  const applied = resolveCommand("cd focus/applied-ai");
  assert.equal(applied.kind, "projects");
  assert.equal(applied.navTarget, "#work?categories=applied-ai");
  assert.equal(applied.projects.length, 3);

  const security = resolveCommand("ls focus/systems-security");
  assert.equal(security.kind, "projects");
  assert.equal(security.navTarget, "#work?categories=systems-security");
  assert.equal(security.projects.length, 1);

  const spoken = resolveCommand("applied ai");
  assert.equal(spoken.navTarget, "#work?categories=applied-ai");

  const cdBackResult = resolveCommand("cd ..");
  assert.equal(cdBackResult.kind, "nav");
  assert.equal(cdBackResult.navTarget, "#work");
});

test("retired category names still work in the terminal", () => {
  const engineering = resolveCommand("cd focus/engineering");
  assert.equal(engineering.navTarget, "#work?categories=signals-hardware");
  assert.equal(engineering.projects.length, 3);

  const cyber = resolveCommand("ls focus/cybersecurity");
  assert.equal(cyber.navTarget, "#work?categories=systems-security");

  const hackathons = resolveCommand("cd focus/hackathons");
  assert.equal(hackathons.kind, "projects");
  assert.equal(hackathons.navTarget, "#work");
  assert.equal(hackathons.projects.length, allProjects.length);

  assert.equal(resolveCategory("ai-math"), "applied-ai");
  assert.equal(resolveCategory("hackathons"), null);
  assert.equal(resolveCategory("constructor"), undefined);
});

test("every work card has a one-sentence hook with a distinct opening", () => {
  const openings = new Set();
  for (const project of allProjects) {
    const words = project.hook.trim().split(/\s+/);
    assert.ok(
      words.length >= 15 && words.length <= 30,
      `${project.name}: ${words.length} words`,
    );
    assert.match(project.hook, /[.?]$/, project.name);
  }
  for (const project of allProjects) {
    openings.add(project.hook.split(/\s+/).slice(0, 2).join(" ").toLowerCase());
  }
  assert.equal(openings.size, allProjects.length);
});

test("missing facts are explicit WIP placeholders, never invented", () => {
  const timing = caseStudyProjects.find(
    ({ slug }) => slug === "timing-attack-lab",
  );
  assert.equal(isWip(timing.role), true);
  assert.equal(isWip(timing.proof), true);
  assert.match(timing.insights.sections.at(-1).body, /^WIP/);
  for (const project of allProjects) {
    assert.equal(typeof project.role, "string", project.name);
    assert.equal(typeof project.proof, "string", project.name);
    assert.ok(
      project.role.length > 0 && project.proof.length > 0,
      project.name,
    );
  }
});

test("every case study can be read as short steps", () => {
  for (const project of caseStudyProjects) {
    const steps = getCaseStudySteps(project.insights);
    assert.ok(steps.length >= 3, `${project.name}: ${steps.length} steps`);
    for (const step of steps) {
      assert.ok(step.title && step.body, project.name);
      assert.ok(
        step.body.split(/\s+/).length <= 60,
        `${project.name}: ${step.title}`,
      );
    }
  }
  assert.deepEqual(getCaseStudySteps({ layout: "unknown" }), []);
});

test("Asteroids reflects the shared C++/WASM game and keeps browser additions scoped", () => {
  const asteroids = caseStudyProjects.find(({ slug }) => slug === "asteroids");
  assert.match(asteroids.description, /WebAssembly/);
  assert.match(asteroids.description, /Two versions/);
  assert.match(asteroids.description, /PS4 controller or keyboard and mouse/);
  assert.ok(asteroids.description.split(/\s+/).length <= 30);
  const copy = JSON.stringify(asteroids);
  assert.match(copy, /top five/);
  assert.match(copy, /browser-specific/);
  assert.match(copy, /practice mode/);
  assert.doesNotMatch(copy, /five stages|top-10|saucers|time limit/i);
});
