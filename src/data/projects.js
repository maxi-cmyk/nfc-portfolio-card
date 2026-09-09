const projectsBySlug = {
  itspeak: {
    slug: "itspeak",
    name: "it'sPEAK",
    meta: "2nd place · first full-stack app",
    tags: [
      "Python",
      "FastAPI",
      "Celery",
      "Redis",
      "Railway",
      "MediaPipe",
      "OpenAI",
    ],
    description:
      "Private web coach for rehearsing presentations. I owned the backend, persistence, media-analysis pipeline, and production deployment work.",
    insights: {
      layout: "pipeline",
      summary:
        "An asynchronous analysis system that turns an uploaded rehearsal into separate delivery and voice signals, normalized scores, and focused coaching cards.",
      contentOrder: ["summary", "pipeline", "sections"],
      pipeline: {
        title: "One upload, two analysis paths",
        intro:
          "FastAPI hands the rehearsal to a Celery worker, where visual delivery and vocal delivery are analyzed separately before their scores meet one coaching contract.",
        source: {
          label: "Private rehearsal",
          detail: "Validated upload becomes an asynchronous analysis job.",
        },
        lanes: [
          {
            label: "Visual delivery",
            steps: [
              "Decode video frames",
              "Derive MediaPipe signals",
              "Normalize delivery scores",
            ],
          },
          {
            label: "Voice delivery",
            steps: [
              "Extract the audio track",
              "Measure pace, pitch, pauses, and fillers",
              "Normalize voice scores",
            ],
          },
        ],
        merge: {
          label: "Coaching contract",
          detail:
            "Validated LLM cards are the primary output; provider failures activate deterministic rule-based cards.",
        },
      },
      sections: [
        {
          title: "Processing boundary",
          body: "FastAPI handles upload and job orchestration while Celery performs the expensive media work outside the request lifecycle. Railway hosts the deployed backend services, and Redis carries job state between the API and worker.",
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
      layout: "lifecycle",
      summary:
        "A caregiver-reviewed media pipeline turns personal photos and videos into approved memories, then presents them through a low-friction feed with narration, recall prompts, cooldowns, and adaptive voice controls.",
      contentOrder: ["summary", "lifecycle", "sections"],
      lifecycle: {
        title: "A memory is reviewed before it becomes familiar",
        intro:
          "A caregiver approves generated context before delivery, and later interactions adapt how approved memories are presented.",
        steps: [
          {
            title: "Upload",
            body: "A caregiver adds a personal photo or video to private storage.",
          },
          {
            title: "Extract context",
            body: "Local LLaVA proposes a summary, people, place, and date context.",
          },
          {
            title: "Caregiver review",
            body: "The memory remains in needs-review state until its context is approved.",
            state: "gate",
          },
          {
            title: "Familiar delivery",
            body: "The approved feed presents the memory with optional narration and cooldown rules.",
          },
          {
            title: "Recall",
            body: "A meaningful interaction can schedule a later active-recall prompt.",
          },
          {
            title: "Adapt access",
            body: "Missed taps and time settings can enable larger voice controls or a warmer mode.",
          },
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
      layout: "frame-loop",
      summary:
        "A deterministic 50 FPS game loop coordinates ADC input, floating-point object motion, collision pools, a monochrome framebuffer, non-blocking sound patterns, and non-volatile scores.",
      contentOrder: ["frameLoop", "summary", "sections"],
      frameLoop: {
        title: "Everything playable fits around a 20 ms tick",
        intro:
          "Each frame advances input, simulation, drawing, and timed sound state. Fixed-size pools keep the amount of per-frame object work bounded.",
        budget: "20 ms",
        phases: [
          {
            label: "Sample",
            detail:
              "Read the calibrated, smoothed joystick and active-low fire input.",
          },
          {
            label: "Update",
            detail: "Advance motion and collisions across capped object pools.",
          },
          {
            label: "Render",
            detail:
              "Draw the complete scene into the 128×64 framebuffer, then flush once.",
          },
          {
            label: "Sound",
            detail:
              "Advance LEDC tone patterns from their current timed state.",
          },
        ],
        after: {
          label: "Outside the live loop:",
          detail:
            "Preferences keeps the sorted top-10 initials table in non-volatile storage.",
        },
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
      layout: "event-sequence",
      summary:
        "The sensor node owns PIR, alarm, and panic state; Blynk virtual pins bridge that state to a camera node that temporarily pauses its stream for a higher-resolution capture.",
      contentOrder: ["summary", "eventSequence", "sections"],
      eventSequence: {
        title: "Detection and capture stay on separate devices",
        intro:
          "The PIR node raises the intrusion event, Blynk V6 carries the handoff, and the ESP32-CAM manages capture and stream state.",
        devices: [
          {
            id: "sensor",
            label: "PIR node",
            detail: "sensing, arming, panic, siren",
          },
          {
            id: "camera",
            label: "ESP32-CAM",
            detail: "MJPEG stream, flash, JPEG capture",
          },
        ],
        steps: [
          {
            actor: "sensor",
            actorLabel: "PIR node",
            title: "Motion is detected",
            body: "The armed sensor node reads PIR state and raises the intrusion alarm.",
          },
          {
            actor: "bridge",
            actorLabel: "Blynk V6",
            title: "Blynk V6 carries the trigger",
            body: "A short virtual-pin pulse and logged event cross the device boundary.",
          },
          {
            actor: "camera",
            actorLabel: "ESP32-CAM",
            title: "The live stream pauses",
            body: "The camera handler temporarily stops QVGA streaming and switches to VGA.",
          },
          {
            actor: "camera",
            actorLabel: "ESP32-CAM",
            title: "Flash-assisted JPEG is captured",
            body: "The node enables the flash, captures the frame, and publishes its URL.",
          },
          {
            actor: "camera",
            actorLabel: "ESP32-CAM",
            title: "The stream is restored",
            body: "Flash is disabled and the camera returns to its QVGA live-stream state.",
          },
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
          title: "Firmware behavior",
          body: "The current firmware polls PIR input in its main loop and routes camera triggers through Blynk virtual pin V6.",
        },
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
      layout: "algorithm",
      summary:
        "Each of the eight rows is packed into one 32-bit integer, so neighbor reads, births, deaths, population counts, and state hashes stay compact while the board drives both physical and browser views.",
      contentOrder: ["summary", "howItWorks", "diagram", "sections"],
      howItWorks: {
        title: "How 256 cells become eight integers",
        intro:
          "The simulation packs each row into a 32-bit strip and advances the whole board through a read, decide, commit sequence.",
        steps: [
          {
            title: "Wrap the coordinates",
            body: "For each cell, row and column offsets loop across the opposite edge. A cell on the far left can therefore count neighbors from the far right, forming a 32×8 torus.",
            code: "wrapped = (index + size) % size",
          },
          {
            title: "Read and count bits",
            body: "A shift moves the requested cell into the least-significant position and a mask extracts its state. Repeating that read across the eight surrounding coordinates produces the neighbor count.",
            code: "cell = (rows[y] >> x) & 1",
          },
          {
            title: "Commit the next generation",
            body: "Live cells survive with two or three neighbors; dead cells are born with exactly three. A separate eight-row buffer keeps every decision tied to the same source generation.",
            code: "B3 / S23  →  nextRows[8]",
          },
        ],
        takeaway:
          "One generation reads a stable 32-byte board, writes the next 32-byte board, then swaps them before display and analysis.",
      },
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

export function getCaseStudyLinkLabel() {
  return "view case study";
}
