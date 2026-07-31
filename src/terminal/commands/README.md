# Terminal command modules

Each terminal response lives in the file for its feature:

- `about.js` — short personal introduction
- `project.js` — project entries, descriptions, and project-specific links
- `contact.js` — public profile links
- `help.js` — visible command help
- `panda.js` — hidden `thebananachip` response and panda art

`index.js` is only the command router. It imports these modules and maps typed command names to their responses.
