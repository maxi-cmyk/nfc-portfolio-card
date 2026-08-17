export class CommandHistory {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.tempDraft = "";
  }

  push(command) {
    if (!command || !command.trim()) return;
    const trimmed = command.trim();
    // Do not add consecutive duplicates
    if (
      this.history.length === 0 ||
      this.history[this.history.length - 1] !== trimmed
    ) {
      this.history.push(trimmed);
    }
    this.currentIndex = this.history.length;
    this.tempDraft = "";
  }

  navigateUp(currentInput) {
    if (this.history.length === 0) return null;

    if (this.currentIndex === this.history.length) {
      this.tempDraft = currentInput;
    }

    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      return this.history[this.currentIndex];
    }

    if (this.currentIndex === 0) {
      return this.history[0];
    }

    return null;
  }

  navigateDown() {
    if (this.history.length === 0) return null;

    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex += 1;
      return this.history[this.currentIndex];
    }

    if (this.currentIndex === this.history.length - 1) {
      this.currentIndex = this.history.length;
      return this.tempDraft;
    }

    return null;
  }

  resetNavigation() {
    this.currentIndex = this.history.length;
    this.tempDraft = "";
  }

  getEntries() {
    return [...this.history];
  }
}
