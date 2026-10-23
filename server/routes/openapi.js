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
    "/jobs/{id}/candidates/import": { post: { summary: "Import ATS candidates from CSV", description: "Rows with a matching resumes filename are queued for normal parsing. Unmatched rows are marked imported/manual/unparseable until a PDF or DOCX resume is uploaded.", parameters: [{ "$ref": "#/components/parameters/Id" }], requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["csv"], properties: { csv: { type: "string", format: "binary" }, resumes: { type: "array", items: { type: "string", format: "binary" } } } } } } }, responses: { 201: { description: "Imported and queued" }, 400: { description: "Invalid CSV" }, 409: { description: "Rows already exist" } } } },
    "/jobs/{id}/integrations/greenhouse/candidates/import": { post: { summary: "Import Greenhouse candidate metadata", description: "Uses a recruiter-supplied Harvest API key for the request only; credentials are not persisted. Imported candidates remain unscreened until resumes are uploaded.", parameters: [{ "$ref": "#/components/parameters/Id" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["api_key", "greenhouse_job_id"], properties: { api_key: { type: "string", writeOnly: true }, greenhouse_job_id: { type: "string", pattern: "^[0-9]+$" } } } } } }, responses: { 201: { description: "Imported" }, 502: { description: "Greenhouse unavailable or rejected credentials" } } } },
    "/jobs/{id}/integrations/lever/candidates/import": { post: { summary: "Import Lever candidate metadata", description: "Uses a recruiter-supplied Lever API key for the request only; credentials are not persisted. Imported candidates remain unscreened until resumes are uploaded.", parameters: [{ "$ref": "#/components/parameters/Id" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["api_key", "lever_posting_id"], properties: { api_key: { type: "string", writeOnly: true }, lever_posting_id: { type: "string" } } } } } }, responses: { 201: { description: "Imported" }, 502: { description: "Lever unavailable or rejected credentials" } } } },
    "/candidates/{id}/review": { patch: { summary: "Record human review", parameters: [{ "$ref": "#/components/parameters/Id" }], responses: { 200: { description: "Reviewed candidate" } } } },
    "/candidates/{id}/contact": { patch: { summary: "Correct extracted contact details", parameters: [{ "$ref": "#/components/parameters/Id" }], responses: { 200: { description: "Updated candidate" } } } },
    "/candidates/{id}/interview.ics": { get: { summary: "Download a calendar event for an interview", parameters: [{ "$ref": "#/components/parameters/Id" }, { name: "start", in: "query", required: true, schema: { type: "string", format: "date-time" } }, { name: "end", in: "query", required: true, schema: { type: "string", format: "date-time" } }, { name: "location", in: "query", schema: { type: "string" } }], responses: { 200: { description: "ICS calendar event" } } } },
    "/analytics": { get: { summary: "Get organization screening analytics", responses: { 200: { description: "Analytics" } } } },
    "/analytics/calibration-export": { get: { summary: "Download recruiter calibration CSV", responses: { 200: { description: "CSV export" } } } },
    "/organizations/export": { get: { summary: "Download organization data and audit export", responses: { 200: { description: "JSON export" } } } },
    "/organizations/deletion-requests": { get: { summary: "List candidate deletion requests", responses: { 200: { description: "Requests" } } } },
    "/organizations/webhooks": { get: { summary: "List organization webhooks", responses: { 200: { description: "Webhook configurations without secrets" } } }, post: { summary: "Create a signed organization webhook", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["url"], properties: { url: { type: "string", format: "uri", pattern: "^https://" }, secret: { type: "string", minLength: 32 }, events: { type: "array", items: { type: "string" } } } } } } }, responses: { 201: { description: "Created; secret is returned once" } } } },
    "/organizations/webhooks/{id}": { delete: { summary: "Delete an organization webhook", parameters: [{ "$ref": "#/components/parameters/Id" }], responses: { 204: { description: "Deleted" } } } },
    "/organizations/webhooks/deliveries": { get: { summary: "List recent webhook deliveries", responses: { 200: { description: "Delivery attempts" } } } },
  },
};
spec.components.parameters = { Id: { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } } };

router.get("/openapi.json", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.json(spec);
});

export default router;
