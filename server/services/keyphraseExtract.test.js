import { describe, it, expect } from "vitest";
import { extractKeyphrases } from "./keyphraseExtract.js";

const PUBLIC_SPEAKING_JD = `
Public Speaking Coach

We are looking for an experienced Public Speaking Coach to help executives
improve their presentation skills and stage presence. You will design
keynote delivery workshops, coach clients on storytelling techniques,
audience engagement, vocal projection, and body language. Strong
background in TEDx-style talks, executive communication training, and
public speaking coaching is required. Experience with virtual presentation
platforms like Zoom webinars is a plus. Familiarity with Toastmasters
programs and improv theater techniques is beneficial.
`;

describe("extractKeyphrases", () => {
  it("extracts meaningful domain phrases from a JD outside the curated taxonomies", () => {
    const phrases = extractKeyphrases(PUBLIC_SPEAKING_JD);
    expect(phrases).toEqual(
      expect.arrayContaining([
        "public speaking coach",
        "storytelling techniques",
        "stage presence",
        "audience engagement",
        "vocal projection",
        "body language",
      ])
    );
  });

  it("drops JD boilerplate instead of surfacing it as a top phrase", () => {
    const phrases = extractKeyphrases(PUBLIC_SPEAKING_JD);
    expect(phrases).not.toContain("looking");
    expect(phrases).not.toContain("required");
    expect(phrases).not.toContain("experience");
  });

  it("respects maxPhrases", () => {
    expect(extractKeyphrases(PUBLIC_SPEAKING_JD, { maxPhrases: 3 })).toHaveLength(3);
  });

  it("returns no duplicate phrases", () => {
    const phrases = extractKeyphrases(PUBLIC_SPEAKING_JD, { maxPhrases: 100 });
    expect(new Set(phrases).size).toBe(phrases.length);
  });

  it("drops single-word phrases when minWordsPerPhrase is 2", () => {
    const phrases = extractKeyphrases(PUBLIC_SPEAKING_JD, { minWordsPerPhrase: 2, maxPhrases: 100 });
    expect(phrases.every((p) => p.split(" ").length >= 2)).toBe(true);
    expect(phrases).not.toContain("background");
    expect(phrases).not.toContain("presentation");
  });

  it("handles JDs with commas separating a skill list", () => {
    const jd = "Requires public speaking, audience engagement, and vocal projection.";
    const phrases = extractKeyphrases(jd);
    expect(phrases).toContain("public speaking");
    expect(phrases).toContain("audience engagement");
    expect(phrases).toContain("vocal projection");
  });
});
