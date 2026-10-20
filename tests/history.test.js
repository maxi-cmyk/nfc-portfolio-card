import test from "node:test";
import assert from "node:assert/strict";
import { CommandHistory } from "../src/terminal/history.js";

test("CommandHistory stores pushed commands without consecutive duplicates", () => {
  const history = new CommandHistory();
  history.push("about");
  history.push("skills");
  history.push("skills"); // consecutive duplicate
  history.push("projects");

  assert.deepEqual(history.getEntries(), ["about", "skills", "projects"]);
});

test("CommandHistory navigates up and down through history preserving draft", () => {
  const history = new CommandHistory();
  history.push("about");
  history.push("skills");
  history.push("projects");

  // User types a draft and presses Up
  const up1 = history.navigateUp("my uncommitted draft");
  assert.equal(up1, "projects");

  const up2 = history.navigateUp("projects");
  assert.equal(up2, "skills");

  const up3 = history.navigateUp("skills");
  assert.equal(up3, "about");

  // Reaching the top stays at oldest command
  const upTop = history.navigateUp("about");
  assert.equal(upTop, "about");

  // Navigating back down
  const down1 = history.navigateDown();
  assert.equal(down1, "skills");

  const down2 = history.navigateDown();
  assert.equal(down2, "projects");

  // Reaching the bottom restores the uncommitted draft
  const down3 = history.navigateDown();
  assert.equal(down3, "my uncommitted draft");
});

test("CommandHistory returns null on navigation when history is empty", () => {
  const history = new CommandHistory();
  assert.equal(history.navigateUp("test"), null);
  assert.equal(history.navigateDown(), null);
});
