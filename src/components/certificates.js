import { certificates } from "../data/certificates.js";

const certificateList = document.querySelector("#certificate-list");

function createCertificateEntry(certificate) {
  const entry = document.createElement("article");
  entry.className = "certificate-entry";

  const previewLink = document.createElement("a");
  previewLink.className = "certificate-preview";
  previewLink.href = certificate.pdfUrl;
  previewLink.target = "_blank";
  previewLink.rel = "noreferrer";
  previewLink.setAttribute(
    "aria-label",
    `Open ${certificate.title} in a new tab`,
  );

  const previewBar = document.createElement("span");
  previewBar.className = "certificate-preview-bar";
  previewBar.textContent = certificate.pdfUrl.split("/").pop();

  const previewImage = document.createElement("img");
  previewImage.src = certificate.previewUrl;
  previewImage.alt = certificate.previewAlt;
  previewImage.width = 1400;
  previewImage.height = 1082;
  previewImage.loading = "lazy";
  previewImage.decoding = "async";
  previewLink.append(previewBar, previewImage);

  const details = document.createElement("div");
  details.className = "certificate-details";

  const meta = document.createElement("p");
  meta.className = "certificate-meta";
  meta.textContent = `${certificate.issuer} · ${certificate.issued}`;

  const title = document.createElement("h3");
  title.textContent = certificate.title;

  const summary = document.createElement("p");
  summary.className = "certificate-summary";
  summary.textContent = certificate.summary;

  const actions = document.createElement("div");
  actions.className = "certificate-actions";

  const viewLink = document.createElement("a");
  viewLink.href = certificate.pdfUrl;
  viewLink.target = "_blank";
  viewLink.rel = "noreferrer";
  viewLink.textContent = "Open certificate ↗";

  const downloadLink = document.createElement("a");
  downloadLink.href = certificate.pdfUrl;
  downloadLink.download = certificate.pdfUrl.split("/").pop();
  downloadLink.textContent = "Download PDF ↓";

  actions.append(viewLink, downloadLink);
  details.append(meta, title, summary, actions);
  entry.append(previewLink, details);
  return entry;
}

export function initCertificates() {
  if (!certificateList) return;

  certificateList.replaceChildren(...certificates.map(createCertificateEntry));
}
