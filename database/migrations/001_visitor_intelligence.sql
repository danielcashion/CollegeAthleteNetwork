-- Aurora MySQL 8.0 — Visitor intelligence (FingerprintJS + ipapi + attribution)
-- Run as a migration user with DDL privileges. Review FK order before applying.

SET NAMES utf8mb4;
SET time_zone = '+00:00';
use registrations;

-- ---------------------------------------------------------------------------
-- A. website_visitors — one row per fingerprint visitor
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_visitors (
  website_visitor_id BIGINT NOT NULL AUTO_INCREMENT,
  fingerprint_visitor_id VARCHAR(64) NOT NULL,
  first_seen_datetime DATETIME(3) NOT NULL,
  last_seen_datetime DATETIME(3) NOT NULL,
  first_ip_address VARBINARY(16) NULL,
  last_ip_address VARBINARY(16) NULL,
  first_user_agent VARCHAR(1024) NULL,
  last_user_agent VARCHAR(1024) NULL,
  first_browser_timezone VARCHAR(100) NULL,
  last_browser_timezone VARCHAR(100) NULL,
  first_browser_locale VARCHAR(35) NULL,
  last_browser_locale VARCHAR(35) NULL,
  visit_count INT NOT NULL DEFAULT 0,
  session_count INT NOT NULL DEFAULT 0,
  confidence_returning_human TINYINT NOT NULL DEFAULT 0,
  created_datetime DATETIME(3) NOT NULL,
  updated_datetime DATETIME(3) NOT NULL,
  PRIMARY KEY (website_visitor_id),
  UNIQUE KEY uq_website_visitors_fingerprint (fingerprint_visitor_id),
  KEY idx_website_visitors_last_seen (last_seen_datetime),
  KEY idx_website_visitors_updated (updated_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- B. website_sessions — one row per session_id (browser session)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_sessions (
  website_session_id BIGINT NOT NULL AUTO_INCREMENT,
  session_id CHAR(36) NOT NULL,
  website_visitor_id BIGINT NOT NULL,
  session_start_datetime DATETIME(3) NOT NULL,
  session_end_datetime DATETIME(3) NOT NULL,
  landing_page_url VARCHAR(2048) NULL,
  landing_referrer VARCHAR(2048) NULL,
  initial_ip_address VARBINARY(16) NULL,
  initial_city VARCHAR(150) NULL,
  initial_region VARCHAR(150) NULL,
  initial_country VARCHAR(100) NULL,
  browser_timezone VARCHAR(100) NULL,
  browser_locale VARCHAR(35) NULL,
  utm_source VARCHAR(150) NULL,
  utm_medium VARCHAR(150) NULL,
  utm_campaign VARCHAR(150) NULL,
  utm_term VARCHAR(150) NULL,
  utm_content VARCHAR(150) NULL,
  pageview_count INT NOT NULL DEFAULT 0,
  event_count INT NOT NULL DEFAULT 0,
  created_datetime DATETIME(3) NOT NULL,
  updated_datetime DATETIME(3) NOT NULL,
  PRIMARY KEY (website_session_id),
  UNIQUE KEY uq_website_sessions_session (session_id),
  KEY idx_website_sessions_visitor (website_visitor_id),
  KEY idx_website_sessions_start (session_start_datetime),
  KEY idx_website_sessions_updated (updated_datetime),
  CONSTRAINT fk_website_sessions_visitor
    FOREIGN KEY (website_visitor_id) REFERENCES website_visitors (website_visitor_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- C. website_pageviews — one row per page view
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_pageviews (
  website_pageview_id BIGINT NOT NULL AUTO_INCREMENT,
  pageview_id CHAR(36) NOT NULL,
  website_visitor_id BIGINT NOT NULL,
  website_session_id BIGINT NOT NULL,
  viewed_datetime DATETIME(3) NOT NULL,
  page_url VARCHAR(2048) NOT NULL,
  page_path VARCHAR(1024) NOT NULL,
  referrer_url VARCHAR(2048) NULL,
  page_title VARCHAR(512) NULL,
  ip_address VARBINARY(16) NULL,
  user_agent VARCHAR(1024) NULL,
  browser_timezone VARCHAR(100) NULL,
  browser_locale VARCHAR(35) NULL,
  languages_json JSON NULL,
  screen_width SMALLINT NULL,
  screen_height SMALLINT NULL,
  device_pixel_ratio DECIMAL(4,2) NULL,
  hardware_concurrency TINYINT NULL,
  device_memory_gb DECIMAL(4,1) NULL,
  utm_source VARCHAR(150) NULL,
  utm_medium VARCHAR(150) NULL,
  utm_campaign VARCHAR(150) NULL,
  utm_term VARCHAR(150) NULL,
  utm_content VARCHAR(150) NULL,
  created_datetime DATETIME(3) NOT NULL,
  PRIMARY KEY (website_pageview_id),
  UNIQUE KEY uq_website_pageviews_pageview (pageview_id),
  KEY idx_website_pageviews_visitor (website_visitor_id),
  KEY idx_website_pageviews_session (website_session_id),
  KEY idx_website_pageviews_viewed (viewed_datetime),
  KEY idx_website_pageviews_path (page_path(255)),
  CONSTRAINT fk_website_pageviews_visitor
    FOREIGN KEY (website_visitor_id) REFERENCES website_visitors (website_visitor_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_website_pageviews_session
    FOREIGN KEY (website_session_id) REFERENCES website_sessions (website_session_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- D. website_visit_enrichment — ipapi (or future providers) per pageview
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_visit_enrichment (
  website_visit_enrichment_id BIGINT NOT NULL AUTO_INCREMENT,
  website_pageview_id BIGINT NOT NULL,
  ipapi_city VARCHAR(150) NULL,
  ipapi_region VARCHAR(150) NULL,
  ipapi_country VARCHAR(100) NULL,
  ipapi_latitude DECIMAL(9,6) NULL,
  ipapi_longitude DECIMAL(9,6) NULL,
  ipapi_org VARCHAR(255) NULL,
  ipapi_asn VARCHAR(50) NULL,
  is_data_center_city TINYINT NOT NULL DEFAULT 0,
  is_hosting_provider TINYINT NOT NULL DEFAULT 0,
  is_mobile_network TINYINT NOT NULL DEFAULT 0,
  is_proxy_or_vpn_suspected TINYINT NOT NULL DEFAULT 0,
  enrichment_provider VARCHAR(50) NOT NULL DEFAULT 'ipapi',
  raw_provider_payload JSON NULL,
  created_datetime DATETIME(3) NOT NULL,
  updated_datetime DATETIME(3) NOT NULL,
  PRIMARY KEY (website_visit_enrichment_id),
  UNIQUE KEY uq_website_visit_enrichment_pv (website_pageview_id),
  KEY idx_website_visit_enrichment_dc (is_data_center_city, is_hosting_provider),
  CONSTRAINT fk_website_visit_enrichment_pageview
    FOREIGN KEY (website_pageview_id) REFERENCES website_pageviews (website_pageview_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- E. website_visit_attribution — scoring output per pageview
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_visit_attribution (
  website_visit_attribution_id BIGINT NOT NULL AUTO_INCREMENT,
  website_pageview_id BIGINT NOT NULL,
  traffic_class ENUM(
    'high_confidence_human',
    'medium_confidence_human',
    'low_confidence_location',
    'likely_infrastructure',
    'likely_bot'
  ) NOT NULL,
  location_confidence_score TINYINT NOT NULL,
  final_city VARCHAR(150) NULL,
  final_region VARCHAR(150) NULL,
  final_country VARCHAR(100) NULL,
  final_latitude DECIMAL(9,6) NULL,
  final_longitude DECIMAL(9,6) NULL,
  final_location_source ENUM(
    'browser_geo',
    'explicit_user',
    'ip_geolocation',
    'inferred_market',
    'unattributable'
  ) NOT NULL,
  school_market_code VARCHAR(100) NULL,
  school_market_confidence_score TINYINT NULL,
  reason_codes_json JSON NOT NULL,
  created_datetime DATETIME(3) NOT NULL,
  updated_datetime DATETIME(3) NOT NULL,
  PRIMARY KEY (website_visit_attribution_id),
  UNIQUE KEY uq_website_visit_attribution_pv (website_pageview_id),
  KEY idx_website_visit_attr_traffic (traffic_class),
  KEY idx_website_visit_attr_market (school_market_code),
  KEY idx_website_visit_attr_region (final_region),
  CONSTRAINT fk_website_visit_attribution_pageview
    FOREIGN KEY (website_pageview_id) REFERENCES website_pageviews (website_pageview_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- F. website_known_infra_patterns — configurable infra / noise patterns
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_known_infra_patterns (
  website_known_infra_pattern_id BIGINT NOT NULL AUTO_INCREMENT,
  pattern_type ENUM('city_region','asn','org_substring','ip_cidr') NOT NULL,
  pattern_value VARCHAR(255) NOT NULL,
  region_code VARCHAR(100) NULL,
  country_code VARCHAR(10) NULL,
  risk_weight SMALLINT NOT NULL DEFAULT 0,
  active_YN CHAR(1) NOT NULL DEFAULT 'Y',
  notes VARCHAR(500) NULL,
  created_datetime DATETIME(3) NOT NULL,
  updated_datetime DATETIME(3) NOT NULL,
  PRIMARY KEY (website_known_infra_pattern_id),
  UNIQUE KEY uq_known_infra_patterns_type_value (pattern_type, pattern_value(191)),
  KEY idx_known_infra_active (active_YN, pattern_type),
  KEY idx_known_infra_value (pattern_value(128))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Views — actionable analytics (exclude likely infrastructure where noted)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW vw_website_state_demand_daily AS
SELECT
  DATE(p.viewed_datetime) AS day_utc,
  COALESCE(a.final_region, 'UNKNOWN') AS state_or_region,
  COUNT(*) AS pageviews,
  COUNT(DISTINCT p.website_visitor_id) AS unique_visitors
FROM website_pageviews p
INNER JOIN website_visit_attribution a
  ON a.website_pageview_id = p.website_pageview_id
WHERE a.traffic_class IN ('high_confidence_human', 'medium_confidence_human', 'low_confidence_location')
  AND a.final_location_source IN ('ip_geolocation', 'inferred_market', 'browser_geo', 'explicit_user')
GROUP BY DATE(p.viewed_datetime), COALESCE(a.final_region, 'UNKNOWN');

CREATE OR REPLACE VIEW vw_website_school_market_daily AS
SELECT
  DATE(p.viewed_datetime) AS day_utc,
  COALESCE(a.school_market_code, 'UNASSIGNED') AS school_market_code,
  COUNT(*) AS pageviews,
  COUNT(DISTINCT p.website_visitor_id) AS unique_visitors,
  AVG(a.location_confidence_score) AS avg_location_confidence
FROM website_pageviews p
INNER JOIN website_visit_attribution a
  ON a.website_pageview_id = p.website_pageview_id
WHERE a.traffic_class IN ('high_confidence_human', 'medium_confidence_human', 'low_confidence_location')
GROUP BY DATE(p.viewed_datetime), COALESCE(a.school_market_code, 'UNASSIGNED');

CREATE OR REPLACE VIEW vw_website_infrastructure_noise_daily AS
SELECT
  DATE(p.viewed_datetime) AS day_utc,
  a.traffic_class,
  COUNT(*) AS pageviews,
  COUNT(DISTINCT p.website_visitor_id) AS unique_visitors
FROM website_pageviews p
INNER JOIN website_visit_attribution a
  ON a.website_pageview_id = p.website_pageview_id
WHERE a.traffic_class IN ('likely_infrastructure', 'likely_bot', 'low_confidence_location')
GROUP BY DATE(p.viewed_datetime), a.traffic_class;

CREATE OR REPLACE VIEW vw_returning_visitors_daily AS
SELECT
  DATE(p.viewed_datetime) AS day_utc,
  COUNT(DISTINCT CASE WHEN v.confidence_returning_human = 1 THEN p.website_visitor_id END) AS returning_visitors,
  COUNT(DISTINCT p.website_visitor_id) AS all_visitors
FROM website_pageviews p
INNER JOIN website_visitors v ON v.website_visitor_id = p.website_visitor_id
INNER JOIN website_visit_attribution a
  ON a.website_pageview_id = p.website_pageview_id
WHERE a.traffic_class IN ('high_confidence_human', 'medium_confidence_human', 'low_confidence_location')
GROUP BY DATE(p.viewed_datetime);
