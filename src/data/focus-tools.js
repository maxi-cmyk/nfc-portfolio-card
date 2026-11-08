export const focusTechnologyGroups = [
  {
    id: "signals-hardware",
    title: "Signals & hardware",
    languages: ["C++", "JavaScript"],
    tools: [
      "ESP32",
      "SSD1306 OLED",
      "MAX7219 LED matrix",
      "PWM audio",
      "DFT / FFT",
      "Server-Sent Events",
      "React",
      "Chart.js",
      "Web Serial",
      "WebAssembly",
      "Canvas",
      "Gamepad API",
      "Web Audio",
    ],
  },
  {
    id: "systems-security",
    title: "Systems & security",
    languages: ["Python", "C", "C++"],
    tools: [
      "Flask",
      "hmac.compare_digest",
      "Scapy",
      "WebSockets",
      "ESP32-CAM",
      "Blynk",
      "HTTP / MJPEG",
      "PIR sensing",
    ],
  },
  {
    id: "applied-ai",
    title: "Applied AI & products",
    variant: "expanded",
    languages: ["Python", "TypeScript", "JavaScript", "SQL"],
    tools: [
      "PyTorch",
      "CLIP / RINE",
      "NumPy",
      "pandas",
      "SciPy",
      "scikit-learn",
      "Jupyter",
      "FastAPI",
      "Celery",
      "Redis",
      "Railway",
      "MediaPipe",
      "OpenAI",
      "Next.js",
      "Supabase",
      "PostgreSQL",
      "LLaVA",
      "ElevenLabs",
    ],
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
