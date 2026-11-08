import test from "node:test";
import assert from "node:assert/strict";
import {
  getAutocompleteCandidates,
  getLongestCommonPrefix,
  getAutocompleteResult,
} from "../src/terminal/autocomplete.js";

test("getAutocompleteCandidates returns non-empty list of unique commands", () => {
  const candidates = getAutocompleteCandidates();
  assert.ok(Array.isArray(candidates));
  assert.ok(candidates.length > 10);
  assert.ok(candidates.includes("about"));
  assert.ok(candidates.includes("skills"));
  assert.ok(candidates.includes("projects"));
  assert.ok(candidates.includes("resume"));
  assert.ok(candidates.includes("thebananachip"));
  assert.ok(candidates.includes("cd focus/applied-ai"));
  assert.ok(candidates.includes("ls focus/systems-security"));
  assert.ok(candidates.includes("cat resume"));

  // Destructive easter egg commands should not be autocomplete candidates
  assert.equal(candidates.includes("sudo"), false);
  assert.equal(candidates.includes("sudo rm -rf"), false);
  assert.equal(candidates.includes("rm -rf"), false);

  const unique = new Set(candidates);
  assert.equal(unique.size, candidates.length);
});

test("getLongestCommonPrefix computes correct prefix across strings", () => {
  assert.equal(getLongestCommonPrefix([]), "");
  assert.equal(getLongestCommonPrefix(["about"]), "about");
  assert.equal(
    getLongestCommonPrefix([
      "cd focus/signals-hardware",
      "cd focus/systems-security",
    ]),
    "cd focus/s",
  );
  assert.equal(
    getLongestCommonPrefix(["cat resume", "cat resume.pdf"]),
    "cat resume",
  );
  assert.equal(getLongestCommonPrefix(["about", "skills"]), "");
});

test("single match autocompletion produces exact command replacement", () => {
  // ab -> about
  const ab = getAutocompleteResult("ab");
  assert.equal(ab.hasMatch, true);
  assert.equal(ab.hasMultiple, false);
  assert.equal(ab.completion, "about");
  assert.deepEqual(ab.matches, ["about"]);

  // sk -> skills
  const sk = getAutocompleteResult("sk");
  assert.equal(sk.hasMatch, true);
  assert.equal(sk.hasMultiple, false);
  assert.equal(sk.completion, "skills");

  // re -> resume
  const re = getAutocompleteResult("re");
  assert.equal(re.hasMatch, true);
  assert.equal(re.hasMultiple, false);
  assert.equal(re.completion, "resume");

  // cd focus/ap -> cd focus/applied-ai
  const cdA = getAutocompleteResult("cd focus/ap");
  assert.equal(cdA.hasMatch, true);
  assert.equal(cdA.hasMultiple, false);
  assert.equal(cdA.completion, "cd focus/applied-ai");

  // pro -> projects
  const pro = getAutocompleteResult("pro");
  assert.equal(pro.hasMatch, true);
  assert.equal(pro.hasMultiple, false);
  assert.equal(pro.completion, "projects");

  // theb -> thebananachip
  const theb = getAutocompleteResult("theb");
  assert.equal(theb.hasMatch, true);
  assert.equal(theb.hasMultiple, false);
  assert.equal(theb.completion, "thebananachip");
});

test("category subpath single match autocompletions", () => {
  assert.equal(
    getAutocompleteResult("cd focus/sy").completion,
    "cd focus/systems-security",
  );
  assert.equal(
    getAutocompleteResult("cd focus/si").completion,
    "cd focus/signals-hardware",
  );
  assert.equal(
    getAutocompleteResult("cd focus/a").completion,
    "cd focus/applied-ai",
  );
  assert.equal(
    getAutocompleteResult("ls focus/ap").completion,
    "ls focus/applied-ai",
  );
  assert.equal(
    getAutocompleteResult("cat focus/sy").completion,
    "cat focus/systems-security",
  );
});

test("multiple matches return full match list and longest common prefix", () => {
  // 'cat res' matches 'cat resume' and 'cat resume.pdf'
  const catRes = getAutocompleteResult("cat res");
  assert.equal(catRes.hasMatch, true);
  assert.equal(catRes.hasMultiple, true);
  assert.equal(catRes.commonPrefix, "cat resume");
  assert.equal(catRes.completion, "cat resume");
  assert.ok(catRes.matches.includes("cat resume"));
  assert.ok(catRes.matches.includes("cat resume.pdf"));

  // 'cd focus/' matches all focus subpages
  const cdFocus = getAutocompleteResult("cd focus/");
  assert.equal(cdFocus.hasMatch, true);
  assert.equal(cdFocus.hasMultiple, true);
  assert.equal(cdFocus.commonPrefix, "cd focus/");
  assert.equal(cdFocus.matches.length, 3);
});

test("case-insensitivity and whitespace resilience in autocomplete", () => {
  const upper = getAutocompleteResult("  AB");
  assert.equal(upper.hasMatch, true);
  assert.equal(upper.completion, "about");

  const mixed = getAutocompleteResult("CD FOCUS/AP");
  assert.equal(mixed.hasMatch, true);
  assert.equal(mixed.completion, "cd focus/applied-ai");
});

test("zero matches returns hasMatch false and preserves raw input", () => {
  const none = getAutocompleteResult("nonexistent_command_xyz");
  assert.equal(none.hasMatch, false);
  assert.equal(none.hasMultiple, false);
  assert.equal(none.completion, "nonexistent_command_xyz");
  assert.deepEqual(none.matches, []);
});

test("empty input returns full command list with hasMultiple true", () => {
  const empty = getAutocompleteResult("");
  assert.equal(empty.hasMatch, true);
  assert.equal(empty.hasMultiple, true);
  assert.ok(empty.matches.length > 10);
});
