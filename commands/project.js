export const projectsCommand = {
  kind: "projects",
  output: "Selected projects",
  projects: [
    {
      name: "it'sPEAK",
      meta: "first full-stack app",
      description:
        "Private web coach for rehearsing presentations. Owned the backend, database, video-analysis pipeline, and production deployment.",
      links: [
        { label: "github", url: "https://github.com/maxi-cmyk/it-sPeak" },
        {
          label: "devpost",
          url: "https://devpost.com/software/itspeak?ref_content=my-projects-tab&ref_feature=my_projects",
        },
      ],
    },
    {
      name: "Echo",
      meta: "iNTUition 2026 · Best Freshmen Award",
      description:
        "Recognition-first reminiscence therapy platform for people with cognitive impairment. Built the backend, database, and feed logic that prioritises recognition over novelty.",
      links: [{ label: "github", url: "https://github.com/maxi-cmyk/echo" }],
    },
    {
      name: "ESP32 Asteroids",
      meta: "hardware",
      description:
        "Remade the arcade game asteriods with working OLED display, joystick input, PWM audio, persistent high scores, and progressive difficulty.",
      links: [
        {
          label: "github",
          url: "https://github.com/maxi-cmyk/asteriods",
        },
      ],
    },
    {
      name: "Sentinel",
      meta: "hardware",
      description:
        "Two-node ESP32 security system: a PIR interrupt publishes an event that triggers an ESP32-CAM stream, alerts, and evidence capture.",
      links: [{ label: "github", url: "https://github.com/maxi-cmyk/sentinel" }],
    },
    {
      name: "Conway's Game of Life",
      meta: "maths + hardware",
      description:
        "An ESP32-driven 32×8 LED simulation with physical controls, a live SSE dashboard, session export, and analysis of emergent behaviour.",
      links: [
        {
          label: "github",
          url: "https://github.com/maxi-cmyk/conway_game_of_life",
        },
      ],
    },
  ],
};
