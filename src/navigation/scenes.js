// Pure scene logic: which scene a route means, what a scene's URL is, where
// "up" goes, and a small state machine that stays correct when a new
// navigation interrupts one still animating. No DOM in this file.
import { allProjects } from "../data/projects.js";
import { projectHash, workHash } from "./routes.js";

export const SCENES = [
  "hub",
  "work",
  "case",
  "shelf",
  "skills",
  "credentials",
  "contact",
];

const SECTION_SCENES = {
  home: "hub",
  terminal: "hub",
  certificates: "credentials",
  contact: "contact",
  skills: "skills",
  shelf: "shelf",
};

const hubTarget = () => ({ scene: "hub" });

export function routeToScene(route) {
  switch (route?.kind) {
    case "work":
      return {
        scene: "work",
        slug: route.slug ?? null,
        categories: route.categories ?? [],
      };
    case "project":
      return {
        scene: "case",
        slug: route.slug,
        step: route.step ?? 1,
        read: Boolean(route.read),
      };
    case "section":
      return {
        scene: SECTION_SCENES[route.id] ?? "hub",
        terminal: route.id === "terminal",
      };
    default:
      return { ...hubTarget(), missing: true };
  }
}

export function sceneToHash(target) {
  switch (target.scene) {
    case "work":
      return workHash(target.categories ?? [], target.slug);
    case "case":
      if (target.read) return `${projectHash(target.slug)}/read`;
      return projectHash(
        target.slug,
        target.step > 1 ? target.step : undefined,
      );
    case "shelf":
      return "#shelf";
    case "skills":
      return "#skills";
    case "credentials":
      return "#certificates";
    case "contact":
      return "#contact";
    default:
      return "#home";
  }
}

// One step "up": reading view to its step view, a case study to its project,
// every other scene to the hub. Hub has no parent.
export function parentScene(target) {
  if (target.scene === "hub") return null;
  if (target.scene === "case") {
    if (target.read) {
      return { scene: "case", slug: target.slug, step: target.step ?? 1 };
    }
    const inPager = allProjects.some((p) => p.slug === target.slug);
    return {
      scene: "work",
      slug: inPager ? target.slug : null,
      categories: [],
    };
  }
  return hubTarget();
}

// Same place on screen? (terminal and missing flags are not places.)
export function sameScene(a, b) {
  if (a.scene !== b.scene) return false;
  if (a.scene === "work") {
    return (
      (a.slug ?? null) === (b.slug ?? null) &&
      (a.categories ?? []).join() === (b.categories ?? []).join()
    );
  }
  if (a.scene === "case") {
    return (
      a.slug === b.slug &&
      (a.step ?? 1) === (b.step ?? 1) &&
      Boolean(a.read) === Boolean(b.read)
    );
  }
  return true;
}

// Phases: "idle" (settled) or "transitioning" (animation running).
// A newer go() always wins: the older settle() is then ignored, and the new
// navigation starts from whatever the interrupted one was heading to.
export function createSceneMachine(initial = hubTarget()) {
  let state = {
    ...initial,
    phase: "idle",
    seq: 0,
    from: null,
    interrupted: false,
  };
  const listeners = new Set();
  const emit = () => listeners.forEach((listener) => listener(state));
  return {
    get state() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    // Returns the sequence number, or null when the target is where we are.
    go(target, { animate = false } = {}) {
      const unchanged =
        sameScene(state, target) &&
        Boolean(state.terminal) === Boolean(target.terminal) &&
        Boolean(state.missing) === Boolean(target.missing);
      if (unchanged) return null;
      const seq = state.seq + 1;
      state = {
        ...target,
        phase: animate ? "transitioning" : "idle",
        seq,
        from: { scene: state.scene, slug: state.slug, step: state.step },
        interrupted: state.phase === "transitioning",
      };
      emit();
      return seq;
    },
    settle(seq) {
      if (seq !== state.seq || state.phase === "idle") return false;
      state = { ...state, phase: "idle", interrupted: false };
      emit();
      return true;
    },
  };
}
