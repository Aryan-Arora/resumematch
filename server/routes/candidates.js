import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

router.get("/candidates/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "candidate not found" });
  res.json(data);
});

router.delete("/candidates/:id", async (req, res) => {
  const { data: candidate, error: fetchError } = await supabase
    .from("candidates")
    .select("file_path")
    .eq("id", req.params.id)
    .single();
  if (fetchError) return res.status(404).json({ error: "candidate not found" });

  if (candidate.file_path) {
    await supabase.storage.from("resumes").remove([candidate.file_path]);
  }

  const { error } = await supabase.from("candidates").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });

  res.status(204).send();
});

export default router;
