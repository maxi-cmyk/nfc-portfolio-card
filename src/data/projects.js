export const focusCategories = {
  cybersecurity: {
    id: "cybersecurity",
    title: "cybersecurity/",
    path: "focus/cybersecurity",
    description:
      "Understand systems, identify weaknesses, and build with privacy in mind.",
    projects: [
      {
        slug: "sentinel",
        name: "Sentinel",
        meta: "hardware · security",
        tags: ["ESP32", "ESP32-CAM", "C++", "MQTT", "Security"],
        description:
          "Two-node ESP32 security system: a PIR interrupt publishes an event that triggers an ESP32-CAM stream, alerts, and evidence capture.",
        insights: {
          status: "WIP",
          summary:
            "Distributed two-node hardware security architecture utilizing interrupt-driven camera wake and lightweight MQTT messaging.",
          architecture:
            "PIR Sensor ──[Interrupt]──> ESP32 Node A ──[MQTT Event]──> Broker ──> ESP32-CAM Node B ──[RTSP/MJPEG Stream]──> Alert Capture",
          highlights: [
            "Hardware PIR interrupt handling for minimal idle power draw",
            "Decoupled event broker architecture using lightweight MQTT",
            "Triggered snapshot evidence capture and alert dispatching",
          ],
        },
        links: [
          { label: "github", url: "https://github.com/maxi-cmyk/sentinel" },
        ],
      },
    ],
  },
  engineering: {
    id: "engineering",
    title: "engineering/",
    path: "focus/engineering",
    description:
      "Hardware, sensors, embedded systems, and interactive physical computing.",
    projects: [
      {
        slug: "asteroids",
        name: "ESP32 Asteroids",
        meta: "hardware",
        tags: ["ESP32", "C++", "OLED", "PWM Audio", "Embedded"],
        description:
          "Remade the arcade game asteriods with working OLED display, joystick input, PWM audio, persistent high scores, and progressive difficulty.",
        insights: {
          status: "WIP",
          summary:
            "Self-contained micro-arcade console running on an ESP32 microcontroller with SSD1306 OLED, custom vector physics, and analog audio.",
          architecture:
            "Analog Joystick + Buttons ──> ESP32 GPIO (ADC) ──> Game Loop (60 FPS Vector Math) ──> I2C OLED + PWM Audio Output",
          highlights: [
            "Fixed-point 2D vector physics engine running on microcontrollers",
            "Square wave sound synthesis via ESP32 hardware PWM channels",
            "Non-volatile EEPROM storage for persistent arcade high scores",
          ],
        },
        links: [
          {
            label: "github",
            url: "https://github.com/maxi-cmyk/asteriods",
          },
        ],
      },
      {
        slug: "sentinel",
        name: "Sentinel",
        meta: "hardware",
        tags: ["ESP32", "ESP32-CAM", "C++", "MQTT", "Security"],
        description:
          "Two-node ESP32 security system: a PIR interrupt publishes an event that triggers an ESP32-CAM stream, alerts, and evidence capture.",
        insights: {
          status: "WIP",
          summary:
            "Distributed two-node hardware security architecture utilizing interrupt-driven camera wake and lightweight MQTT messaging.",
          architecture:
            "PIR Sensor ──[Interrupt]──> ESP32 Node A ──[MQTT Event]──> Broker ──> ESP32-CAM Node B ──[RTSP/MJPEG Stream]──> Alert Capture",
          highlights: [
            "Hardware PIR interrupt handling for minimal idle power draw",
            "Decoupled event broker architecture using lightweight MQTT",
            "Triggered snapshot evidence capture and alert dispatching",
          ],
        },
        links: [
          { label: "github", url: "https://github.com/maxi-cmyk/sentinel" },
        ],
      },
      {
        slug: "conway-game-of-life",
        name: "Conway's Game of Life",
        meta: "maths + hardware",
        tags: ["ESP32", "C++", "LED Matrix", "SSE", "Maths"],
        description:
          "An ESP32-driven 32×8 LED simulation with physical controls, a live SSE dashboard, session export, and analysis of emergent behaviour.",
        insights: {
          status: "WIP",
          summary:
            "Dual-interface cellular automata hardware rig with synchronized real-time web dashboard via Server-Sent Events (SSE).",
          architecture:
            "ESP32 Cellular Engine ──[SPI/MAX7219]──> 32x8 LED Array\n                    └──[AsyncWebServer/SSE]──> Browser Visualizer",
          highlights: [
            "Bitwise 2D toroidal universe simulation computed in C++",
            "Low-latency dual synchronization across LED Matrix and Web UI",
            "Emergent behavior pattern tracking (oscillators, gliders, still-lifes)",
          ],
        },
        links: [
          {
            label: "github",
            url: "https://github.com/maxi-cmyk/conway_game_of_life",
          },
        ],
      },
    ],
  },
  "ai-math": {
    id: "ai-math",
    title: "ai & math/",
    path: "focus/ai-math",
    description:
      "Use models and mathematical thinking to turn noisy inputs into useful tools.",
    projects: [
      {
        slug: "conway-game-of-life",
        name: "Conway's Game of Life",
        meta: "maths + hardware",
        tags: ["ESP32", "C++", "LED Matrix", "SSE", "Maths"],
        description:
          "An ESP32-driven 32×8 LED simulation with physical controls, a live SSE dashboard, session export, and analysis of emergent behaviour.",
        insights: {
          status: "WIP",
          summary:
            "Dual-interface cellular automata hardware rig with synchronized real-time web dashboard via Server-Sent Events (SSE).",
          architecture:
            "ESP32 Cellular Engine ──[SPI/MAX7219]──> 32x8 LED Array\n                    └──[AsyncWebServer/SSE]──> Browser Visualizer",
          highlights: [
            "Bitwise 2D toroidal universe simulation computed in C++",
            "Low-latency dual synchronization across LED Matrix and Web UI",
            "Emergent behavior pattern tracking (oscillators, gliders, still-lifes)",
          ],
        },
        links: [
          {
            label: "github",
            url: "https://github.com/maxi-cmyk/conway_game_of_life",
          },
        ],
      },
      {
        slug: "itspeak",
        name: "it'sPEAK",
        meta: "2nd place · AI / video pipeline",
        tags: ["Python", "FastAPI", "OpenCV", "Full-Stack", "AI Pipeline"],
        description:
          "Private web coach for rehearsing presentations. Owned the backend, database, video-analysis pipeline, and production deployment.",
        insights: {
          status: "WIP",
          summary:
            "AI-powered presentation coaching engine analyzing video/audio streams for pacing, posture, filler words, and vocal confidence.",
          architecture:
            "User Video Stream ──> FastAPI Ingestion ──> OpenCV Frame Processing + Audio Decomposition ──> LLM Metric Synthesis ──> Actionable Dashboard",
          highlights: [
            "High-throughput asynchronous video chunking and frame extraction",
            "Multi-modal telemetry combining facial gaze tracking and speech prosody",
            "Won 2nd Place at Hackathon for end-to-end execution",
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
    ],
  },
  hackathons: {
    id: "hackathons",
    title: "hackathons/",
    path: "focus/hackathons",
    description:
      "Rapid prototyping, building under constraints, and shipping award-winning products.",
    projects: [
      {
        slug: "itspeak",
        name: "it'sPEAK",
        meta: "2nd place · first full-stack app",
        tags: ["Python", "FastAPI", "OpenCV", "Full-Stack", "AI Pipeline"],
        description:
          "Private web coach for rehearsing presentations. Owned the backend, database, video-analysis pipeline, and production deployment.",
        insights: {
          status: "WIP",
          summary:
            "AI-powered presentation coaching engine analyzing video/audio streams for pacing, posture, filler words, and vocal confidence.",
          architecture:
            "User Video Stream ──> FastAPI Ingestion ──> OpenCV Frame Processing + Audio Decomposition ──> LLM Metric Synthesis ──> Actionable Dashboard",
          highlights: [
            "High-throughput asynchronous video chunking and frame extraction",
            "Multi-modal telemetry combining facial gaze tracking and speech prosody",
            "Won 2nd Place at Hackathon for end-to-end execution",
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
      {
        slug: "echo",
        name: "Echo",
        meta: "iNTUition 2026 · Best Freshmen Award",
        tags: ["React", "Node.js", "PostgreSQL", "Full-Stack", "Accessibility"],
        description:
          "Recognition-first reminiscence therapy platform for people with cognitive impairment. Built the backend, database, and feed logic that prioritises recognition over novelty.",
        insights: {
          status: "WIP",
          summary:
            "Accessible reminiscence cognitive therapy platform engineered to stimulate episodic memory through familiar association graphs.",
          architecture:
            "Caregiver Portal ──> Node.js / Express API ──> PostgreSQL (Familiarity Graph) ──> Accessible React Client (High-contrast, audio-supported)",
          highlights: [
            "Custom association algorithm prioritizing recognition certainty over novelty",
            "Engineered accessible UX/UI designed for cognitive accessibility",
            "Awarded Best Freshmen Award at iNTUition 2026",
          ],
        },
        links: [{ label: "github", url: "https://github.com/maxi-cmyk/echo" }],
      },
    ],
  },
};

export const allProjects = [
  {
    slug: "itspeak",
    name: "it'sPEAK",
    meta: "2nd place · first full-stack app",
    tags: ["Python", "FastAPI", "OpenCV", "Full-Stack", "AI Pipeline"],
    description:
      "Private web coach for rehearsing presentations. Owned the backend, database, video-analysis pipeline, and production deployment.",
    insights: {
      status: "WIP",
      summary:
        "AI-powered presentation coaching engine analyzing video/audio streams for pacing, posture, filler words, and vocal confidence.",
      architecture:
        "User Video Stream ──> FastAPI Ingestion ──> OpenCV Frame Processing + Audio Decomposition ──> LLM Metric Synthesis ──> Actionable Dashboard",
      highlights: [
        "High-throughput asynchronous video chunking and frame extraction",
        "Multi-modal telemetry combining facial gaze tracking and speech prosody",
        "Won 2nd Place at Hackathon for end-to-end execution",
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
  {
    slug: "echo",
    name: "Echo",
    meta: "iNTUition 2026 · Best Freshmen Award",
    tags: ["React", "Node.js", "PostgreSQL", "Full-Stack", "Accessibility"],
    description:
      "Recognition-first reminiscence therapy platform for people with cognitive impairment. Built the backend, database, and feed logic that prioritises recognition over novelty.",
    insights: {
      status: "WIP",
      summary:
        "Accessible reminiscence cognitive therapy platform engineered to stimulate episodic memory through familiar association graphs.",
      architecture:
        "Caregiver Portal ──> Node.js / Express API ──> PostgreSQL (Familiarity Graph) ──> Accessible React Client (High-contrast, audio-supported)",
      highlights: [
        "Custom association algorithm prioritizing recognition certainty over novelty",
        "Engineered accessible UX/UI designed for cognitive accessibility",
        "Awarded Best Freshmen Award at iNTUition 2026",
      ],
    },
    links: [{ label: "github", url: "https://github.com/maxi-cmyk/echo" }],
  },
  {
    slug: "asteroids",
    name: "ESP32 Asteroids",
    meta: "hardware",
    tags: ["ESP32", "C++", "OLED", "PWM Audio", "Embedded"],
    description:
      "Remade the arcade game asteriods with working OLED display, joystick input, PWM audio, persistent high scores, and progressive difficulty.",
    insights: {
      status: "WIP",
      summary:
        "Self-contained micro-arcade console running on an ESP32 microcontroller with SSD1306 OLED, custom vector physics, and analog audio.",
      architecture:
        "Analog Joystick + Buttons ──> ESP32 GPIO (ADC) ──> Game Loop (60 FPS Vector Math) ──> I2C OLED + PWM Audio Output",
      highlights: [
        "Fixed-point 2D vector physics engine running on microcontrollers",
        "Square wave sound synthesis via ESP32 hardware PWM channels",
        "Non-volatile EEPROM storage for persistent arcade high scores",
      ],
    },
    links: [
      {
        label: "github",
        url: "https://github.com/maxi-cmyk/asteriods",
      },
    ],
  },
  {
    slug: "sentinel",
    name: "Sentinel",
    meta: "hardware",
    tags: ["ESP32", "ESP32-CAM", "C++", "MQTT", "Security"],
    description:
      "Two-node ESP32 security system: a PIR interrupt publishes an event that triggers an ESP32-CAM stream, alerts, and evidence capture.",
    insights: {
      status: "WIP",
      summary:
        "Distributed two-node hardware security architecture utilizing interrupt-driven camera wake and lightweight MQTT messaging.",
      architecture:
        "PIR Sensor ──[Interrupt]──> ESP32 Node A ──[MQTT Event]──> Broker ──> ESP32-CAM Node B ──[RTSP/MJPEG Stream]──> Alert Capture",
      highlights: [
        "Hardware PIR interrupt handling for minimal idle power draw",
        "Decoupled event broker architecture using lightweight MQTT",
        "Triggered snapshot evidence capture and alert dispatching",
      ],
    },
    links: [{ label: "github", url: "https://github.com/maxi-cmyk/sentinel" }],
  },
  {
    slug: "conway-game-of-life",
    name: "Conway's Game of Life",
    meta: "maths + hardware",
    tags: ["ESP32", "C++", "LED Matrix", "SSE", "Maths"],
    description:
      "An ESP32-driven 32×8 LED simulation with physical controls, a live SSE dashboard, session export, and analysis of emergent behaviour.",
    insights: {
      status: "WIP",
      summary:
        "Dual-interface cellular automata hardware rig with synchronized real-time web dashboard via Server-Sent Events (SSE).",
      architecture:
        "ESP32 Cellular Engine ──[SPI/MAX7219]──> 32x8 LED Array\n                    └──[AsyncWebServer/SSE]──> Browser Visualizer",
      highlights: [
        "Bitwise 2D toroidal universe simulation computed in C++",
        "Low-latency dual synchronization across LED Matrix and Web UI",
        "Emergent behavior pattern tracking (oscillators, gliders, still-lifes)",
      ],
    },
    links: [
      {
        label: "github",
        url: "https://github.com/maxi-cmyk/conway_game_of_life",
      },
    ],
  },
];
