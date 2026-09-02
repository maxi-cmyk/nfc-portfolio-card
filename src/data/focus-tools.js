export const focusTechnologyGroups = [
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    languages: [],
    tools: ["ESP32-CAM", "Blynk", "HTTP / MJPEG", "PIR sensing"],
  },
  {
    id: "engineering",
    title: "Engineering",
    languages: ["C++"],
    tools: [
      "ESP32",
      "SSD1306 OLED",
      "MAX7219 LED matrix",
      "PWM audio",
      "Server-Sent Events",
    ],
  },
  {
    id: "ai-math",
    title: "AI & Math",
    languages: ["Python"],
    tools: ["FastAPI", "OpenCV", "Multimodal AI"],
  },
  {
    id: "hackathons",
    title: "Hackathons",
    languages: ["JavaScript"],
    tools: ["React", "Node.js", "PostgreSQL", "GitHub"],
  },
];

export function getFocusTechnologyGroup(id) {
  return focusTechnologyGroups.find((group) => group.id === id);
}

export function formatFocusToolsForTerminal(groups = focusTechnologyGroups) {
  const lines = [
    "TOOLS & LANGUAGES BY FOCUS",
    "=====================================================",
  ];

  groups.forEach((group, index) => {
    if (index > 0) lines.push("");
    lines.push(`[${group.title.toUpperCase()}]`);
    if (group.languages.length > 0) {
      lines.push(`  LANGUAGES  ${group.languages.join(" · ")}`);
    }
    lines.push(`  TOOLS      ${group.tools.join(" · ")}`);
  });

  return lines.join("\n");
}
