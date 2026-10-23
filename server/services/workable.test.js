import { describe, expect, it } from "vitest";
import { mapWorkableCandidates } from "./workable.js";

describe("Workable candidate mapping", () => {
  it("maps standard and social profile fields", () => {
    const [candidate] = mapWorkableCandidates([{ id: "w-7", firstname: "Katherine", lastname: "Johnson", email: "kj@example.com", social_profiles: [{ url: "https://linkedin.com/in/kj" }] }]);
    expect(candidate).toMatchObject({ full_name: "Katherine Johnson", email: "kj@example.com", linkedin_url: "https://linkedin.com/in/kj", workable_id: "w-7" });
  });
});

