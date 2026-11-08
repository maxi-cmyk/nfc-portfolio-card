// A contact card (.vcf) from facts that are already public on the site. No
// email or phone number yet: those are WIP until they are supplied.
export function buildVCard() {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Leong;Max;;;",
    "FN:Max Leong",
    "TITLE:CS student",
    "URL:https://nfc-portfolio-card.vercel.app",
    "URL;TYPE=GitHub:https://github.com/maxi-cmyk",
    "URL;TYPE=LinkedIn:https://www.linkedin.com/in/maxleongruisheng",
    "NOTE:Building at the intersection of cybersecurity\\, mathematics\\, engineering and AI.",
    "END:VCARD",
  ];
  return `${lines.join("\r\n")}\r\n`;
}
