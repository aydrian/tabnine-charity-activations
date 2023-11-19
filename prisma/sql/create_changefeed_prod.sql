CREATE CHANGEFEED INTO 'webhook-https://tabnine-charity-activations.fly.dev/resources/crl-cdc-webhook?insecure_tls_skip_verify=true' AS
SELECT
  charity_id,
  event_id,
  'donations' topic
FROM donations;