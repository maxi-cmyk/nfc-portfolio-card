export const helpCommand = {
  kind: "help",
  output: `Available commands:
  about                 Show introduction
  skills                View technical capabilities & stack matrix
  projects              List selected projects
  resume                View curriculum vitae & profile links
  contact               Show social & profile links
  ls focus              List focus categories
  cd focus/<category>   Filter selected work (e.g. cd focus/applied-ai)
  cd ..                 Return to main index
  clear                 Clear terminal output

Tip: You can also type focus category names directly (e.g. 'security', 'applied ai', 'hardware').`,
};
