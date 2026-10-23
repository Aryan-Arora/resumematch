import { Router } from "express";

const router = Router();

const spec = {
  openapi: "3.0.3",
  info: {
    title: "ResumeMatch API",
    version: "1.0.0",
    description: "Organization-scoped recruiter screening, review, analytics, exports, and privacy controls.",
  },
  servers: [{ url: "https://resumematch-api.fly.dev/api" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
  },
  paths: {
    "/health/ready": { get: { security: [], summary: "Check API and database readiness", responses: { 200: { description: "Ready" }, 503: { description: "Dependency unavailable" } } } },
    "/public/deletion-request": { post: { security: [], summary: "Submit a candidate privacy deletion request", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["organization_id", "email"], properties: { organization_id: { type: "string", format: "uuid" }, email: { type: "string", format: "email" } } } } } }, responses: { 202: { description: "Request accepted without revealing record existence" } } } },
    "/jobs": { get: { summary: "List organization jobs", responses: { 200: { description: "Jobs" } } }, post: { summary: "Create a screening job", responses: { 201: { description: "Created" } } } },
    "/jobs/{id}/candidates": { post: { summary: "Upload candidates for screening", parameters: [{ "$ref": "#/components/parameters/Id" }], responses: { 202: { description: "Queued" } } } },
    "/jobs/{id}/candidates/import": { post: { summary: "Import ATS candidate metadata without screening", description: "Imported rows are marked imported/manual/unparseable until a PDF or DOCX resume is uploaded.", parameters: [{ "$ref": "#/components/parameters/Id" }], requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["csv"], properties: { csv: { type: "string", format: "binary" } } } } } }, responses: { 201: { description: "Imported" }, 400: { description: "Invalid CSV" }, 409: { description: "Rows already exist" } } } },
    "/candidates/{id}/review": { patch: { summary: "Record human review", parameters: [{ "$ref": "#/components/parameters/Id" }], responses: { 200: { description: "Reviewed candidate" } } } },
    "/candidates/{id}/contact": { patch: { summary: "Correct extracted contact details", parameters: [{ "$ref": "#/components/parameters/Id" }], responses: { 200: { description: "Updated candidate" } } } },
    "/candidates/{id}/interview.ics": { get: { summary: "Download a calendar event for an interview", parameters: [{ "$ref": "#/components/parameters/Id" }, { name: "start", in: "query", required: true, schema: { type: "string", format: "date-time" } }, { name: "end", in: "query", required: true, schema: { type: "string", format: "date-time" } }, { name: "location", in: "query", schema: { type: "string" } }], responses: { 200: { description: "ICS calendar event" } } } },
    "/analytics": { get: { summary: "Get organization screening analytics", responses: { 200: { description: "Analytics" } } } },
    "/analytics/calibration-export": { get: { summary: "Download recruiter calibration CSV", responses: { 200: { description: "CSV export" } } } },
    "/organizations/export": { get: { summary: "Download organization data and audit export", responses: { 200: { description: "JSON export" } } } },
    "/organizations/deletion-requests": { get: { summary: "List candidate deletion requests", responses: { 200: { description: "Requests" } } } },
  },
};
spec.components.parameters = { Id: { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } } };

router.get("/openapi.json", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.json(spec);
});

export default router;
