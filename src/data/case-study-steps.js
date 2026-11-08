// Turns each case-study layout into one list of short steps, so a scene or
// stepper can walk through any project the same way.
// A step is { title, body, code? }. Layouts: algorithm, lifecycle,
// event-sequence, pipeline, frame-loop.

export function getCaseStudySteps(insights = {}) {
  switch (insights.layout) {
    case "algorithm":
      return (insights.howItWorks?.steps ?? []).map(
        ({ title, body, code }) => ({ title, body, ...(code ? { code } : {}) }),
      );
    case "lifecycle":
      return (insights.lifecycle?.steps ?? []).map(({ title, body }) => ({
        title,
        body,
      }));
    case "event-sequence":
      return (insights.eventSequence?.steps ?? []).map(
        ({ actorLabel, title, body }) => ({
          title,
          body: actorLabel ? `${actorLabel}: ${body}` : body,
        }),
      );
    case "pipeline": {
      const { source, lanes = [], merge } = insights.pipeline ?? {};
      return [
        ...(source ? [{ title: source.label, body: source.detail }] : []),
        ...lanes.map((lane) => ({
          title: lane.label,
          body: lane.steps.join(" → "),
        })),
        ...(merge ? [{ title: merge.label, body: merge.detail }] : []),
      ];
    }
    case "frame-loop": {
      const { phases = [], after } = insights.frameLoop ?? {};
      return [
        ...phases.map(({ label, detail }) => ({ title: label, body: detail })),
        ...(after ? [{ title: after.label, body: after.detail }] : []),
      ];
    }
    default:
      return [];
  }
}

// The stepper view: an overview first, then the layout's own steps.
export function getCaseStudyView(insights = {}) {
  return [
    ...(insights.summary
      ? [{ title: "Overview", body: insights.summary }]
      : []),
    ...getCaseStudySteps(insights),
  ];
}
