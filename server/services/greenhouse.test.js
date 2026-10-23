import { describe, expect, it } from "vitest";
import { mapGreenhouseCandidates } from "./greenhouse.js";

describe("Greenhouse candidate mapping", () => {
  it("maps contact fields without persisting provider credentials", () => {
    const [candidate] = mapGreenhouseCandidates([{ id: 42, first_name: "Ada", last_name: "Lovelace", email_addresses: [{ value: "ada@example.com" }], phone_numbers: [{ value: "+1 555" }], social_media_addresses: [{ value: "https://linkedin.com/in/ada" }] }]);
    expect(candidate).toMatchObject({ full_name: "Ada Lovelace", email: "ada@example.com", phone: "+1 555", linkedin_url: "https://linkedin.com/in/ada", greenhouse_id: 42 });
    expect(candidate).not.toHaveProperty("api_key");
  });
});

