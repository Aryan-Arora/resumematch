import { describe, it, expect } from "vitest";
import { extractSkills, compareSkills } from "./skillMatch.js";

const taxonomy = {
  languages: ["Python", "C++", "C#"],
  tools: ["CI/CD", ".NET"],
};

describe("extractSkills", () => {
  it("matches whole-word skill mentions case-insensitively", () => {
    expect(extractSkills("Experienced in python and CI/CD pipelines.", taxonomy)).toEqual([
      "Python",
      "CI/CD",
    ]);
  });

  it("does not match partial-word substrings", () => {
    expect(extractSkills("We use Cypython internally.", taxonomy)).toEqual([]);
  });

  it("handles symbol-heavy skills without matching unrelated text", () => {
    expect(extractSkills("Built services in C++ and .NET.", taxonomy)).toEqual(["C++", ".NET"]);
    expect(extractSkills("A C# developer role.", taxonomy)).toEqual(["C#"]);
  });

  it("returns no matches when nothing in the taxonomy appears", () => {
    expect(extractSkills("Excellent communication and teamwork.", taxonomy)).toEqual([]);
  });
});

describe("compareSkills", () => {
  it("splits JD skills into matched and missing based on resume skills", () => {
    const { matched, missing } = compareSkills(["Python", "C++", "C#"], ["python", "C++"]);
    expect(matched).toEqual(["Python", "C++"]);
    expect(missing).toEqual(["C#"]);
  });

  it("is case-insensitive when comparing", () => {
    const { matched } = compareSkills(["CI/CD"], ["ci/cd"]);
    expect(matched).toEqual(["CI/CD"]);
  });

  it("returns all as missing when resume has no overlapping skills", () => {
    const { matched, missing } = compareSkills(["Python"], ["Java"]);
    expect(matched).toEqual([]);
    expect(missing).toEqual(["Python"]);
  });
});
