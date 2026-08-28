CREATE TABLE public.payment_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method text NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('success','issuer_decline','gateway_error','timeout','abandoned','webhook_lost')),
  latency_ms integer NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payment_attempts_attempted_at_idx ON public.payment_attempts (attempted_at);
CREATE INDEX payment_attempts_method_idx ON public.payment_attempts (method);

GRANT SELECT ON public.payment_attempts TO anon;
GRANT SELECT ON public.payment_attempts TO authenticated;
GRANT ALL ON public.payment_attempts TO service_role;

ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Demo payment attempts are publicly readable"
  ON public.payment_attempts FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.payment_attempts (method, outcome, latency_ms, attempted_at)
SELECT
  t.method,
  t.outcome,
  GREATEST(200, (t.p95 * (0.35 + random() * 0.75))::int),
  (date '2026-08-21' + d.day * interval '1 day' + (random() * interval '14 hours') + interval '8 hours')
FROM (
  VALUES
    ('UPI Intent','success',7361,4100),
    ('UPI Intent','issuer_decline',512,4100),
    ('UPI Intent','gateway_error',61,4100),
    ('UPI Intent','timeout',214,4100),
    ('UPI Intent','abandoned',248,4100),
    ('UPI Intent','webhook_lost',24,4100),
    ('UPI Collect','success',2377,9800),
    ('UPI Collect','issuer_decline',188,9800),
    ('UPI Collect','gateway_error',33,9800),
    ('UPI Collect','timeout',301,9800),
    ('UPI Collect','abandoned',198,9800),
    ('UPI Collect','webhook_lost',13,9800),
    ('Cards (domestic)','success',4602,5600),
    ('Cards (domestic)','issuer_decline',402,5600),
    ('Cards (domestic)','gateway_error',44,5600),
    ('Cards (domestic)','timeout',96,5600),
    ('Cards (domestic)','abandoned',88,5600),
    ('Cards (domestic)','webhook_lost',8,5600),
    ('Netbanking','success',1502,11200),
    ('Netbanking','issuer_decline',121,11200),
    ('Netbanking','gateway_error',29,11200),
    ('Netbanking','timeout',142,11200),
    ('Netbanking','abandoned',92,11200),
    ('Netbanking','webhook_lost',4,11200),
    ('Wallets','success',862,3900),
    ('Wallets','issuer_decline',51,3900),
    ('Wallets','gateway_error',9,3900),
    ('Wallets','timeout',28,3900),
    ('Wallets','abandoned',18,3900),
    ('Wallets','webhook_lost',2,3900)
) AS t(method, outcome, total, p95)
CROSS JOIN (
  VALUES (0,0.150,0.120),(1,0.148,0.130),(2,0.142,0.170),(3,0.152,0.110),(4,0.128,0.220),(5,0.142,0.125),(6,0.138,0.125)
) AS d(day, w_ok, w_bad)
CROSS JOIN LATERAL generate_series(
  1,
  GREATEST(0, round(t.total * (CASE WHEN t.outcome = 'success' THEN d.w_ok ELSE d.w_bad END))::int)
) AS g(n);

CREATE VIEW public.payment_method_stats
WITH (security_invoker = true) AS
SELECT
  method,
  count(*)::bigint AS attempts,
  count(*) FILTER (WHERE outcome = 'success')::bigint AS successes,
  count(*) FILTER (WHERE outcome = 'issuer_decline')::bigint AS issuer_declines,
  count(*) FILTER (WHERE outcome = 'gateway_error')::bigint AS gateway_errors,
  count(*) FILTER (WHERE outcome = 'timeout')::bigint AS timeouts,
  count(*) FILTER (WHERE outcome = 'abandoned')::bigint AS abandoned,
  count(*) FILTER (WHERE outcome = 'webhook_lost')::bigint AS webhook_lost,
  COALESCE(percentile_disc(0.95) WITHIN GROUP (ORDER BY latency_ms), 0)::int AS p95_latency_ms
FROM public.payment_attempts
GROUP BY method;

CREATE VIEW public.payment_daily_stats
WITH (security_invoker = true) AS
SELECT
  (attempted_at AT TIME ZONE 'Asia/Kolkata')::date AS day,
  count(*)::bigint AS attempts,
  count(*) FILTER (WHERE outcome = 'success')::bigint AS successes,
  count(*) FILTER (WHERE outcome IN ('issuer_decline','gateway_error'))::bigint AS explicit_failures
FROM public.payment_attempts
GROUP BY 1
ORDER BY 1;

GRANT SELECT ON public.payment_method_stats TO anon, authenticated, service_role;
GRANT SELECT ON public.payment_daily_stats TO anon, authenticated, service_role;