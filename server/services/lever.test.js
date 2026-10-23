import { describe, expect, it } from "vitest";
import { mapLeverOpportunities } from "./lever.js";

describe("Lever opportunity mapping", () => {
  it("maps contact fields and provider identity", () => {
    const [candidate] = mapLeverOpportunities([{ id: "opp_42", name: "Grace Hopper", emails: ["grace@example.com"], phones: ["+1 555"], links: ["https://linkedin.com/in/grace"] }]);
    expect(candidate).toMatchObject({ full_name: "Grace Hopper", email: "grace@example.com", phone: "+1 555", linkedin_url: "https://linkedin.com/in/grace", lever_id: "opp_42" });
  });
});

