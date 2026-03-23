-- Seed data for website_known_infra_patterns (noisy cities + cloud/CDN org hints)
-- pattern_value for city_region: "city|REGION" (region is US state code when applicable)

SET NAMES utf8mb4;
SET time_zone = '+00:00';
use registrations;

INSERT INTO website_known_infra_patterns
  (pattern_type, pattern_value, region_code, country_code, risk_weight, active_YN, notes, created_datetime, updated_datetime)
VALUES
  ('city_region', 'quincy|WA', 'WA', 'US', 100, 'Y', 'Known AWS/US-West style DC noise', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('city_region', 'boydton|VA', 'VA', 'US', 100, 'Y', 'Known Azure East US DC noise', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('city_region', 'san jose|CA', 'CA', 'US', 80, 'Y', 'High cloud/hosting density; verify before treating as on-campus', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'amazon', NULL, NULL, 80, 'Y', 'AWS / Amazon infrastructure', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'microsoft', NULL, NULL, 80, 'Y', 'Azure / Microsoft infrastructure', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'google', NULL, NULL, 80, 'Y', 'Google / GCP infrastructure', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'cloudflare', NULL, NULL, 90, 'Y', 'CDN / proxy', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'akamai', NULL, NULL, 90, 'Y', 'CDN', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'fastly', NULL, NULL, 90, 'Y', 'CDN', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'oracle', NULL, NULL, 70, 'Y', 'Oracle cloud / hosting', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'digitalocean', NULL, NULL, 70, 'Y', 'Hosting', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'linode', NULL, NULL, 70, 'Y', 'Hosting', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'hetzner', NULL, NULL, 70, 'Y', 'Hosting', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('org_substring', 'ovh', NULL, NULL, 70, 'Y', 'Hosting', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE
  pattern_value = VALUES(pattern_value),
  risk_weight = VALUES(risk_weight),
  notes = VALUES(notes),
  updated_datetime = UTC_TIMESTAMP(3);

-- Note: MySQL INSERT ... ON DUPLICATE requires a UNIQUE index. If you need idempotent re-runs,
-- add UNIQUE(pattern_type, pattern_value(191)) or run as one-time seed without ON DUPLICATE.
