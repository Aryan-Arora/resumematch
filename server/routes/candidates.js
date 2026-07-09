import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

router.get("/candidates/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", req.params.id)
    .eq("company_domain", req.companyDomain)
    .single();

  if (error) return res.status(404).json({ error: "candidate not found" });
  res.json(data);
});

router.get("/candidates/:id/resume", async (req, res) => {
  const { data: candidate, error: fetchError } = await supabase
    .from("candidates")
    .select("file_path")
    .eq("id", req.params.id)
    .eq("company_domain", req.companyDomain)
    .single();
  if (fetchError || !candidate) return res.status(404).json({ error: "candidate not found" });
  if (!candidate.file_path) return res.status(404).json({ error: "no file stored for this candidate" });

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(candidate.file_path, 60);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ url: data.signedUrl });
});

router.delete("/candidates/:id", async (req, res) => {
  const { data: candidate, error: fetchError } = await supabase
    .from("candidates")
    .select("file_path")
    .eq("id", req.params.id)
    .eq("company_domain", req.companyDomain)
    .single();
  if (fetchError) return res.status(404).json({ error: "candidate not found" });

  if (candidate.file_path) {
    await supabase.storage.from("resumes").remove([candidate.file_path]);
  }

  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("id", req.params.id)
    .eq("company_domain", req.companyDomain);
  if (error) return res.status(500).json({ error: error.message });

  res.status(204).send();
});

export default router;
