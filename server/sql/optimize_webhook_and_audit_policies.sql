-- Keep auth.uid() init-plan friendly and cover new foreign keys.
DROP POLICY IF EXISTS organization_webhooks_member_select ON public.organization_webhooks;
CREATE POLICY organization_webhooks_member_select ON public.organization_webhooks
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.org_id = organization_webhooks.org_id));

DROP POLICY IF EXISTS webhook_deliveries_member_select ON public.webhook_deliveries;
CREATE POLICY webhook_deliveries_member_select ON public.webhook_deliveries
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.org_id = webhook_deliveries.org_id));

CREATE INDEX IF NOT EXISTS candidate_deletion_requests_candidate_idx ON public.candidate_deletion_requests(candidate_id);
CREATE INDEX IF NOT EXISTS organization_audit_events_actor_idx ON public.organization_audit_events(actor_id);
CREATE INDEX IF NOT EXISTS webhook_deliveries_webhook_idx ON public.webhook_deliveries(webhook_id);

