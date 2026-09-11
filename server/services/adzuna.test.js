import { describe, it, expect } from "vitest";
import { mapAdzunaJob } from "./adzuna.js";

describe("mapAdzunaJob", () => {
  it("maps a full Adzuna result to the normalized job_listings shape", () => {
    const raw = {
      id: 12345,
      title: "Senior Backend Engineer",
      description: "Build APIs in Node.js and Postgres...",
      company: { display_name: "Acme Corp" },
      location: { display_name: "London, UK" },
      redirect_url: "https://adzuna.example/job/12345",
      salary_min: 60000,
      salary_max: 90000,
      category: { label: "IT Jobs" },
      created: "2026-07-01T00:00:00Z",
    };

    expect(mapAdzunaJob(raw)).toMatchObject({
      source: "adzuna",
      external_id: "12345", // coerced to string
      title: "Senior Backend Engineer",
      company: "Acme Corp",
      location: "London, UK",
      url: "https://adzuna.example/job/12345",
      source_type: "snippet",
      salary_min: 60000,
      salary_max: 90000,
      category: "IT Jobs",
      posted_at: "2026-07-01T00:00:00Z",
    });
  });

  it("handles missing optional fields without throwing", () => {
    const job = mapAdzunaJob({ id: 7, title: "Line Cook" });
    expect(job.external_id).toBe("7");
    expect(job.company).toBeNull();
    expect(job.location).toBeNull();
    expect(job.salary_min).toBeNull();
    expect(job.description).toBe("");
    expect(job.source_type).toBe("snippet");
  });

  it("flags remote roles detected from the title or location", () => {
    const fromTitle = mapAdzunaJob({ id: 9, title: "Remote Data Analyst" });
    expect(fromTitle.remote).toBe(true);

    const fromLocation = mapAdzunaJob({
      id: 10,
      title: "Data Analyst",
      location: { display_name: "Remote" },
    });
    expect(fromLocation.remote).toBe(true);

    const onSite = mapAdzunaJob({ id: 11, title: "Data Analyst", location: { display_name: "Berlin" } });
    expect(onSite.remote).toBeNull();
  });
});
