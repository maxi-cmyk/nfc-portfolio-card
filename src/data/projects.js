const projectsBySlug = {
  itspeak: {
    slug: "itspeak",
    name: "it'sPEAK",
    meta: "2nd place · first full-stack app",
    tags: ["Python", "FastAPI", "Celery", "MediaPipe", "OpenAI"],
    description:
      "Private web coach for rehearsing presentations. I owned the backend, persistence, media-analysis pipeline, and production deployment work.",
    insights: {
      status: "complete",
      statusLabel: "SOURCE REVIEWED",
      summary:
        "An asynchronous analysis system that turns an uploaded rehearsal into separate delivery and voice signals, normalized scores, and focused coaching cards.",
      diagram: {
        label: "Upload-to-feedback system flow",
        nodes: [
          { label: "Web client", detail: "private rehearsal upload" },
          { label: "FastAPI", detail: "validates and creates a job" },
          { label: "Celery worker", detail: "processes media off-request" },
          { label: "Analysis", detail: "MediaPipe + audio telemetry" },
          { label: "Coaching", detail: "scored feedback + safe fallback" },
        ],
      },
      sections: [
        {
          title: "Processing boundary",
          body: "FastAPI handles upload and job orchestration while Celery performs the expensive media work outside the request lifecycle. Redis carries job state between the API and worker.",
        },
        {
          title: "Signals and scoring",
          body: "Video analysis derives eye-contact, expression, posture, gesture, movement, and spatial-use signals. The audio path measures pacing, pitch variation, pauses, and filler words before producing normalized delivery scores.",
        },
        {
          title: "Coaching contract",
          body: "The coaching layer receives scored telemetry and the chosen speaking archetype. It validates structured LLM output and falls back to deterministic rule-based cards if the provider is unavailable.",
        },
      ],
      evidence: [
        "FastAPI routes, Celery tasks, Redis configuration, MediaPipe analysis, audio scoring, and fallback coaching are present in the implementation.",
        "The 2nd-place result is linked through the project Devpost entry.",
      ],
    },
    links: [
      { label: "github", url: "https://github.com/maxi-cmyk/it-sPeak" },
      {
        label: "devpost",
        url: "https://devpost.com/software/itspeak?ref_content=my-projects-tab&ref_feature=my_projects",
      },
    ],
  },
  echo: {
    slug: "echo",
    name: "Echo",
    meta: "iNTUition 2026 · Best Freshmen Award",
    tags: ["Next.js", "Supabase", "PostgreSQL", "LLaVA", "ElevenLabs"],
    description:
      "Adaptive reminiscence PWA for people with cognitive impairment. I built the backend, database, and feed logic around familiar media, narration, recall, and accessible interaction.",
    insights: {
      status: "complete",
      statusLabel: "SOURCE REVIEWED",
      summary:
        "A caregiver-reviewed media pipeline turns personal photos and videos into approved memories, then presents them through a low-friction feed with narration, recall prompts, cooldowns, and adaptive voice controls.",
      diagram: {
        label: "Media-to-memory delivery flow",
        nodes: [
          { label: "Caregiver", detail: "uploads and reviews media" },
          { label: "Supabase", detail: "storage, PostgreSQL, RLS" },
          { label: "Local LLaVA", detail: "extracts memory context" },
          { label: "Approved feed", detail: "cooldown + recall state" },
          { label: "Adaptive output", detail: "voice, narration, warm mode" },
        ],
      },
      sections: [
        {
          title: "Review before delivery",
          body: "Uploads enter Supabase Storage, then a Next.js route asks a locally hosted LLaVA model for summary, people, place, and date context. The resulting memory stays in needs-review state until a caregiver approves it.",
        },
        {
          title: "Familiarity loop",
          body: "Approved memories are filtered by cooldown before display. A Like hides an item for 24 hours to reduce repetition; Recall records a meaningful interaction and can surface a later active-recall prompt.",
        },
        {
          title: "Adaptive access",
          body: "Repeated missed taps can switch the interface into a larger voice-control mode. A time-based sundowning setting activates a warmer presentation, while ElevenLabs provides generated or familiar-voice narration.",
        },
      ],
      evidence: [
        "The source includes the Next.js PWA, Supabase schema and RLS policies, LLaVA analysis route, ElevenLabs routes, cooldown and recall logic, and the adaptation hook.",
        "The Best Freshmen Award remains the portfolio's recorded outcome; the technical case study does not infer additional clinical results.",
      ],
    },
    links: [{ label: "github", url: "https://github.com/maxi-cmyk/echo" }],
  },
  asteroids: {
    slug: "asteroids",
    name: "ESP32 Asteroids",
    meta: "hardware",
    tags: ["ESP32", "C++", "SSD1306", "PWM Audio", "Preferences"],
    description:
      "A breadboard arcade game with a 128×64 OLED, calibrated joystick input, PWM audio, persistent high scores, and five stages of timed difficulty.",
    insights: {
      status: "complete",
      statusLabel: "SOURCE REVIEWED",
      summary:
        "A deterministic 50 FPS game loop coordinates ADC input, floating-point object motion, collision pools, a monochrome framebuffer, non-blocking sound patterns, and non-volatile scores.",
      diagram: {
        label: "Embedded game loop and output flow",
        nodes: [
          { label: "Joystick + fire", detail: "ADC and active-low input" },
          { label: "50 FPS loop", detail: "state, motion, collisions" },
          { label: "SSD1306", detail: "128×64 I²C framebuffer" },
          { label: "LEDC audio", detail: "timed tone sequences" },
          { label: "Preferences", detail: "top-10 score table" },
        ],
      },
      sections: [
        {
          title: "Input and timing",
          body: "The ESP32 calibrates the joystick from 32 startup samples, smooths each axis over four readings, applies a dead zone, and advances the game on a 20 ms frame budget.",
        },
        {
          title: "Rendering and motion",
          body: "Ships, bullets, asteroids, particles, and saucers are drawn into the Adafruit SSD1306 buffer before one display flush. Motion uses floating-point positions with capped object pools to keep work bounded.",
        },
        {
          title: "Audio and persistence",
          body: "A non-blocking LEDC sequencer plays distinct frequency patterns for shots, collisions, streaks, death, and menus. The Preferences library stores a sorted top-10 initials table in ESP32 non-volatile storage.",
        },
      ],
      evidence: [
        "The checked-in firmware defines TARGET_FPS = 50, a 128×64 SSD1306 display, LEDC tone patterns, bounded entity pools, and Preferences-backed scores.",
        "No fixed-point implementation is claimed because the current motion structs use floats.",
      ],
    },
    links: [{ label: "github", url: "https://github.com/maxi-cmyk/asteriods" }],
  },
  sentinel: {
    slug: "sentinel",
    name: "Sentinel",
    meta: "hardware",
    tags: ["ESP32", "ESP32-CAM", "C++", "Blynk", "MJPEG"],
    description:
      "Two ESP32 nodes split sensing from image capture: motion raises a Blynk event, while an ESP32-CAM serves a live stream and flash-assisted JPEG endpoint.",
    insights: {
      status: "complete",
      statusLabel: "SOURCE REVIEWED",
      summary:
        "The sensor node owns PIR, alarm, and panic state; Blynk virtual pins bridge that state to a camera node that temporarily pauses its stream for a higher-resolution capture.",
      diagram: {
        label: "Motion event and camera capture flow",
        nodes: [
          { label: "PIR node", detail: "motion, arm, panic, siren" },
          { label: "Blynk V6", detail: "edge-style camera trigger" },
          { label: "ESP32-CAM", detail: "QVGA stream / VGA capture" },
          { label: "HTTP server", detail: "MJPEG / and JPEG /capture" },
          { label: "Blynk app", detail: "alert and capture URL" },
        ],
      },
      sections: [
        {
          title: "Two-node boundary",
          body: "A standard ESP32 reads the PIR sensor and controls the buzzer and status LED. The ESP32-CAM remains independently responsible for camera initialization, HTTP streaming, and capture state.",
        },
        {
          title: "Event bridge",
          body: "Motion writes a short pulse to Blynk virtual pin V6 and logs an intrusion event. The camera's V6 handler pauses streaming, switches from QVGA to VGA, enables the flash, captures a JPEG, publishes its URL, then restores QVGA streaming.",
        },
        {
          title: "Evidence boundary",
          body: "The current firmware polls the PIR input in its main loop and uses Blynk virtual pins—not MQTT or a hardware interrupt. The repository contains no measured power profile, so none is published here.",
        },
      ],
      evidence: [
        "The firmware exposes multipart MJPEG at / and a single JPEG response at /capture on the camera node's HTTP server.",
        "The sensor firmware implements armed, silent-monitoring, and manual-panic behavior.",
      ],
    },
    links: [{ label: "github", url: "https://github.com/maxi-cmyk/sentinel" }],
  },
  "conway-game-of-life": {
    slug: "conway-game-of-life",
    name: "Conway's Game of Life",
    meta: "maths + hardware",
    tags: ["ESP32", "C++", "MAX7219", "SSE", "React"],
    description:
      "An ESP32 runs a 32×8 toroidal simulation on a MAX7219 matrix while a React dashboard receives live metrics, analyzes sessions, and exports results.",
    insights: {
      status: "complete",
      statusLabel: "SOURCE REVIEWED",
      summary:
        "Each of the eight rows is packed into one 32-bit integer, so neighbor reads, births, deaths, population counts, and state hashes stay compact while the board drives both physical and browser views.",
      diagram: {
        label: "Simulation, display, and analysis flow",
        nodes: [
          { label: "ESP32 engine", detail: "8 × uint32_t toroidal grid" },
          { label: "MAX7219", detail: "32×8 physical display" },
          { label: "SSE /events", detail: "changed snapshots only" },
          { label: "React dashboard", detail: "controls, charts, sessions" },
          { label: "CSV / JSON", detail: "portable analysis data" },
        ],
      },
      sections: [
        {
          title: "Packed simulation",
          body: "Eight uint32_t rows represent all 256 cells. Wrapped row and column indices create the torus; bit shifts read neighbors, while popcount computes population, births, and deaths efficiently.",
        },
        {
          title: "Physical and live outputs",
          body: "The MD_MAX72XX driver updates four chained FC-16 modules as one 32×8 display. The local HTTP service publishes changed snapshots over one Server-Sent Events stream to the React dashboard.",
        },
        {
          title: "Session analysis",
          body: "The firmware ends runs on extinction, repeated-state stagnation, or a generation cap and persists up to 30 summaries. The dashboard charts density, entropy, autocorrelation, peak population, and exports CSV or JSON.",
        },
      ],
      evidence: [
        "The firmware contains packed row operations, toroidal neighbor reads, popcount metrics, configurable hash history, and Preferences-backed session summaries.",
        "The frontend subscribes to /events with EventSource and implements CSV and JSON export.",
      ],
    },
    links: [
      {
        label: "github",
        url: "https://github.com/maxi-cmyk/conway_game_of_life",
      },
    ],
  },
};

function selectProjects(...slugs) {
  return slugs.map((slug) => projectsBySlug[slug]);
}

export const focusCategories = {
  cybersecurity: {
    id: "cybersecurity",
    title: "cybersecurity/",
    path: "focus/cybersecurity",
    description:
      "Understand systems, identify weaknesses, and build with privacy in mind.",
    projects: selectProjects("sentinel"),
  },
  engineering: {
    id: "engineering",
    title: "engineering/",
    path: "focus/engineering",
    description:
      "Hardware, sensors, embedded systems, and interactive physical computing.",
    projects: selectProjects("asteroids", "sentinel", "conway-game-of-life"),
  },
  "ai-math": {
    id: "ai-math",
    title: "ai & math/",
    path: "focus/ai-math",
    description:
      "Use models and mathematical thinking to turn noisy inputs into useful tools.",
    projects: selectProjects("conway-game-of-life", "itspeak"),
  },
  hackathons: {
    id: "hackathons",
    title: "hackathons/",
    path: "focus/hackathons",
    description:
      "Rapid prototyping, building under constraints, and shipping award-winning products.",
    projects: selectProjects("itspeak", "echo"),
  },
};

export const allProjects = selectProjects(
  "itspeak",
  "echo",
  "asteroids",
  "sentinel",
  "conway-game-of-life",
);

export function getCaseStudyLinkLabel(project) {
  return project.insights?.status === "complete"
    ? "case study ↗"
    : "insights [source pending] ↗";
}
